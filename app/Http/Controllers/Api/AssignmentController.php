<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class AssignmentController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'title', 'due_date', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:assignments,view', only: ['index', 'show', 'submissions']),
            new Middleware('check.permission:assignments,create', only: ['store']),
            new Middleware('check.permission:assignments,update', only: ['update', 'updateSubmissions']),
            new Middleware('check.permission:assignments,delete', only: ['destroy']),
            new Middleware('check.permission:assignments,deleteAll', only: ['deleteAll']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $query = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student']);
        
        if ($user && $user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        } elseif ($user && $user->role === 'parent') {
            $classIds = Student::where('parent_id', $user->id)->pluck('class_id')->filter()->unique();
            $query->whereIn('class_id', $classIds);
        } else {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
            if ($scopedClassIds !== null) {
                $query->whereIn('class_id', $scopedClassIds);
            }
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->input('teacher_id'));
        }
        if ($request->filled('date')) {
            $query->whereDate('date_created', $request->input('date'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'teacher_id', 'class_id', 'subject_id', 'title', 'content', 'date_created', 'due_date', 'attachment_url', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);
        $assignments = $paginator->getCollection();
        
        return response()->json([
            'success' => true,
            'assignments' => $assignments,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'title' => 'required|string',
            'content' => 'nullable|string',
            'due_date' => 'required|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,gif,zip,rar,txt|max:10240', // max 10MB
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($request->input('class_id'), $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بنشر واجب لهذا الفصل الدراسي.',
            ], 403);
        }

        $teacherId = $request->input('teacher_id') ?: $request->user()->id;
        $attachmentUrl = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension());
            $fileName = time() . '_' . uniqid() . '.' . $ext;
            $file->move(public_path('uploads/assignments'), $fileName);
            $attachmentUrl = url('uploads/assignments/' . $fileName);
        }

        $assignment = Assignment::create([
            'teacher_id' => $teacherId,
            'class_id' => $request->input('class_id'),
            'subject_id' => $request->input('subject_id'),
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'due_date' => $request->input('due_date'),
            'date_created' => now()->toDateString(),
            'attachment_url' => $attachmentUrl,
        ]);

        // Auto-populate submissions for all students in the class
        $students = \App\Models\Student::with('parentUser')->where('class_id', $request->input('class_id'))->get();
        foreach ($students as $student) {
            \App\Models\AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
                'status' => 'pending',
            ]);
        }

        // Send notifications to parents of the class
        \App\Models\Notification::create([
            'title' => 'واجب مدرسي جديد',
            'content' => 'تم إضافة واجب جديد لصف ابنكم: ' . $assignment->title,
            'type' => 'general',
            'is_read' => false,
            'class_id' => $assignment->class_id,
        ]);

        $parentUsers = $students->pluck('parentUser')->filter()->unique('id');
        foreach ($parentUsers as $parentUser) {
            \App\Services\FcmService::sendToUser(
                $parentUser,
                'واجب مدرسي جديد 📝',
                'تم إضافة واجب جديد لصف ابنكم: ' . $assignment->title,
                [
                    'type' => 'assignment',
                    'class_id' => (string)$assignment->class_id
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الواجب بنجاح',
            'assignment' => $assignment->load(['teacher', 'schoolClass', 'subject', 'submissions.student'])
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $assignment = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student'])->find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($assignment->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك باستعراض هذا الواجب.',
            ], 403);
        }

        return response()->json(['success' => true, 'assignment' => $assignment]);
    }

    public function update(Request $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($assignment->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل واجب في هذا الفصل الدراسي.',
            ], 403);
        }

        $assignment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الواجب بنجاح',
            'assignment' => $assignment
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($assignment->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف واجب في هذا الفصل الدراسي.',
            ], 403);
        }
        // Safely delete associated submissions from database
        AssignmentSubmission::where('assignment_id', $assignment->id)->delete();
        
        $assignment->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الواجب بنجاح']);
    }

    /**
     * عرض تسليمات الواجب
     */
    public function submissions(ListRequest $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($assignment->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك باستعراض تسليمات واجب في هذا الفصل الدراسي.',
            ], 403);
        }

        $query = AssignmentSubmission::with('student')->where('assignment_id', $id);

        // Apply search (on student name)
        $search = $request->input('search');
        if (!empty($search)) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'assignment_id', 'student_id', 'status', 'teacher_note', 'submitted_at', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'submissions' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    /**
     * تحديث رصد تسليمات الواجبات للطلاب
     */
    public function updateSubmissions(Request $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($assignment->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل ورصد تسليمات واجب في هذا الفصل الدراسي.',
            ], 403);
        }

        $request->validate([
            'submissions' => 'required|array', // array of { student_id, status, teacher_note }
        ]);

        foreach ($request->submissions as $sub) {
            AssignmentSubmission::updateOrCreate(
                [
                    'assignment_id' => $id,
                    'student_id' => $sub['student_id'],
                ],
                [
                    'status' => $sub['status'] ?: 'pending',
                    'teacher_note' => $sub['teacher_note'] ?: null,
                    'submitted_at' => $sub['status'] === 'submitted' ? now() : null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث ورصد تسليمات الواجب بنجاح'
        ]);
    }

    public function deleteAll()
    {
        AssignmentSubmission::query()->delete();
        Assignment::query()->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف جميع الواجبات بنجاح.'
        ]);
    }
}
