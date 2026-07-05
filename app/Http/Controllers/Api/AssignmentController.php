<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student']);
        
        if ($user && $user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        } elseif ($user && $user->role === 'parent') {
            $studentIds = \App\Models\Student::where('parent_id', $user->id)->pluck('id');
            $query->whereHas('submissions', function ($q) use ($studentIds) {
                $q->whereIn('student_id', $studentIds);
            });
        }
        
        $assignments = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'assignments' => $assignments
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
            'attachment' => 'nullable|file|max:10240', // max 10MB
        ]);

        $teacherId = $request->input('teacher_id') ?: $request->user()->id;
        $attachmentUrl = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '', $file->getClientOriginalName());
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
            if ($parentUser->fcm_token) {
                \App\Services\FcmService::sendNotification(
                    $parentUser->fcm_token,
                    'واجب مدرسي جديد 📝',
                    'تم إضافة واجب جديد لصف ابنكم: ' . $assignment->title,
                    [
                        'type' => 'assignment',
                        'class_id' => (string)$assignment->class_id
                    ]
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الواجب بنجاح',
            'assignment' => $assignment->load(['teacher', 'schoolClass', 'subject', 'submissions.student'])
        ], 201);
    }

    public function show(string $id)
    {
        $assignment = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student'])->find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }
        return response()->json(['success' => true, 'assignment' => $assignment]);
    }

    public function update(Request $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $assignment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الواجب بنجاح',
            'assignment' => $assignment
        ]);
    }

    public function destroy(string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }
        $assignment->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الواجب بنجاح']);
    }

    /**
     * عرض تسليمات الواجب
     */
    public function submissions(string $id)
    {
        $submissions = AssignmentSubmission::with('student')
                                            ->where('assignment_id', $id)
                                            ->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    /**
     * تحديث رصد تسليمات الواجبات للطلاب
     */
    public function updateSubmissions(Request $request, string $id)
    {
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
}
