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
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

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
            new Middleware('check.permission:assignments,delete', only: ['destroy', 'deleteAll']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $query = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student', 'attachments']);
        
        if ($user && $user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        } elseif ($user && $user->role === 'parent') {
            $parentStudents = Student::where('parent_id', $user->id)->get(['id', 'class_id']);
            $parentStudentIds = $parentStudents->pluck('id');
            $classIds = $parentStudents->pluck('class_id')->filter()->unique();
            $query->whereIn('class_id', $classIds)
                  ->with(['submissions' => function ($q) use ($parentStudentIds) {
                      $q->whereIn('student_id', $parentStudentIds)->with('student');
                  }]);
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
            $date = $request->input('date');
            $query->where(function($q) use ($date) {
                $q->whereDate('date_created', $date)
                  ->orWhereDate('created_at', $date);
            });
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
        // ترتيب ثابت عند تساوي القيم (منع تكرار/اختفاء صفوف بين الصفحات)
        if ($sortBy !== 'id') $query->orderBy($query->getModel()->getQualifiedKeyName(), $direction);

        // Safe Column Selection
        $query->select([
            'id', 'teacher_id', 'class_id', 'subject_id', 'title', 'content', 'date_created', 'due_date', 'attachment_url', 'edited_at', 'created_at'
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
        // Sanitize class_id and subject_id (support 'cls-3', 'sub-1', or grade_ar + section_ar)
        $rawClassId = $request->input('class_id');
        if (is_string($rawClassId) && !is_numeric($rawClassId)) {
            $cleanedClassId = preg_replace('/\D/', '', $rawClassId);
            if ($cleanedClassId !== '') {
                $request->merge(['class_id' => (int) $cleanedClassId]);
            }
        } elseif (is_numeric($rawClassId)) {
            $request->merge(['class_id' => (int) $rawClassId]);
        }

        if (!$request->filled('class_id') && $request->filled('grade_ar') && $request->filled('section_ar')) {
            $gradeAr = trim($request->input('grade_ar'));
            $sectionAr = trim($request->input('section_ar'));
            $schoolClass = \App\Models\SchoolClass::firstOrCreate(
                ['grade_ar' => $gradeAr, 'section_ar' => $sectionAr],
                ['grade_en' => $gradeAr, 'section_en' => $sectionAr]
            );
            $request->merge(['class_id' => (int) $schoolClass->id]);
        }

        $rawSubjectId = $request->input('subject_id');
        if (is_string($rawSubjectId) && !is_numeric($rawSubjectId)) {
            $cleanedSubId = preg_replace('/\D/', '', $rawSubjectId);
            if ($cleanedSubId !== '') {
                $request->merge(['subject_id' => (int) $cleanedSubId]);
            }
        } elseif (is_numeric($rawSubjectId)) {
            $request->merge(['subject_id' => (int) $rawSubjectId]);
        }

        $request->validate([
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'title' => 'required|string',
            'content' => 'nullable|string',
            'due_date' => 'required|date',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,gif,zip,rar,txt|max:10240', // max 10MB
            // أكثر من مرفق للواجب الواحد (حتى 10، كل واحد حتى 10MB)
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,gif,webp,zip,rar,txt|max:10240',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array((int) $request->input('class_id'), $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بنشر واجب لهذا الفصل الدراسي.',
            ], 403);
        }

        $teacherId     = $request->input('teacher_id') ?: $request->user()->id;
        $attachmentUrl = $request->input('attachment_url') ?: null;
        $newPaths      = [];   // لحذف الملفات إذا فشل الحفظ
        $savedFiles    = [];   // [url, original_name, mime] بالترتيب

        // المرفق الواحد (التطبيقات القديمة) + المرفقات المتعددة الجديدة
        $files = [];
        if ($request->hasFile('attachment')) {
            $files[] = $request->file('attachment');
        }
        foreach ((array) $request->file('attachments', []) as $f) {
            if ($f) $files[] = $f;
        }

        $destination = public_path('uploads/assignments');
        foreach ($files as $file) {
            File::ensureDirectoryExists($destination);
            $ext      = strtolower($file->getClientOriginalExtension());
            $filename = Str::uuid() . '.' . $ext;
            $original = $file->getClientOriginalName();
            $mime     = $file->getClientMimeType();
            $file->move($destination, $filename);
            $newPaths[]   = $destination . DIRECTORY_SEPARATOR . $filename;
            $savedFiles[] = [url('uploads/assignments/' . $filename), $original, $mime];
        }
        if (!empty($savedFiles)) {
            $attachmentUrl = $savedFiles[0][0];
        }

        // Save to DB — rollback file on failure
        try {
            $assignment = Assignment::create([
                'teacher_id'     => $teacherId,
                'class_id'       => $request->input('class_id'),
                'subject_id'     => $request->input('subject_id'),
                'title'          => $request->input('title'),
                'content'        => $request->input('content'),
                'due_date'       => $request->input('due_date'),
                'date_created'   => $request->input('date_created') ?: now()->toDateString(),
                'attachment_url' => $attachmentUrl,
            ]);

            foreach ($savedFiles as $i => [$url, $original, $mime]) {
                \App\Models\AssignmentAttachment::create([
                    'assignment_id' => $assignment->id,
                    'url'           => $url,
                    'original_name' => $original,
                    'mime'          => $mime,
                    'sort_order'    => $i,
                ]);
            }

            // Auto-populate submissions for all students in the class
            $students = \App\Models\Student::with('parentUser')->where('class_id', $request->input('class_id'))->get();
            foreach ($students as $student) {
                \App\Models\AssignmentSubmission::create([
                    'assignment_id' => $assignment->id,
                    'student_id'    => $student->id,
                    'status'        => 'pending',
                ]);
            }

            // Send notifications to parents of the class (catch non-fatal notification errors)
            try {
                $notification = \App\Models\Notification::create([
                    'title'         => 'واجب مدرسي جديد',
                    'content'       => 'تم إضافة واجب جديد لصف ابنكم: ' . $assignment->title,
                    'type'          => 'general',
                    'source'        => \App\Models\Notification::SOURCE_ASSIGNMENTS,
                    'is_read'       => false,
                    'class_id'      => $assignment->class_id,
                    // لفتح الواجب نفسه عند النقر على الإشعار في التطبيق
                    'assignment_id' => $assignment->id,
                ]);
                \App\Events\NotificationsChanged::safeDispatch('created', $notification->id);
                \App\Events\AssignmentsChanged::safeDispatch('created', $assignment->id, $assignment->class_id);

                // يوم نشر الواجب بتوقيت المدرسة: التطبيق يفتح صفحة الواجبات على هذا اليوم
                $publishDate = $assignment->created_at
                    ? $assignment->created_at->copy()->timezone(config('app.timezone'))->toDateString()
                    : now()->toDateString();

                $parentUsers = $students->pluck('parentUser')->filter()->unique('id')->values();
                $pushTitle = 'تم إضافة واجب جديد لصف ابنكم: ' . $assignment->title;
                $pushData = [
                    'type'          => 'assignment',
                    'class_id'      => (string)$assignment->class_id,
                    'assignment_id' => (string)$assignment->id,
                    'date'          => $publishDate,
                ];
                // تنبيهات الجوال تُرسل بعد إرجاع الرد للمعلم، حتى لا ينتظر (أو تنتهي مهلة الطلب) مع صف كبير
                dispatch(function () use ($parentUsers, $pushTitle, $pushData) {
                    foreach ($parentUsers as $parentUser) {
                        \App\Services\FcmService::sendToUser($parentUser, 'واجب مدرسي جديد 📝', $pushTitle, $pushData);
                    }
                })->afterResponse();
            } catch (\Throwable $ne) {
                \Illuminate\Support\Facades\Log::warning("Notification failure on assignment create: " . $ne->getMessage());
            }

        } catch (\Throwable $e) {
            foreach ($newPaths as $path) {
                if (File::exists($path)) {
                    File::delete($path);
                }
            }
            \Illuminate\Support\Facades\Log::error("Assignment store error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل حفظ الواجب: ' . $e->getMessage()
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الواجب بنجاح',
            'assignment' => $assignment->load(['teacher', 'schoolClass', 'subject', 'submissions.student', 'attachments'])
        ], 201);

    }

    public function show(Request $request, string $id)
    {
        $assignment = Assignment::with(['teacher', 'schoolClass', 'subject', 'submissions.student', 'attachments'])->find($id);
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

    /**
     * تعديل الواجب بعد إرساله (تصحيح خطأ في الكتابة): العنوان، النص، موعد التسليم، والمرفقات.
     * الصف والمادة لا يتغيران (تغييرهما يغيّر من يستلم الواجب).
     * بعد الحفظ: يُبث التعديل فوراً للوحة التحكم ولأولياء الأمور، ويصلهم إشعار بالتعديل.
     */
    public function update(Request $request, string $id)
    {
        $assignment = Assignment::with('attachments')->find($id);
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
        // المعلم يعدّل واجباته فقط
        if ($user && $user->role === 'teacher' && (int) $assignment->teacher_id !== (int) $user->id) {
            return response()->json(['success' => false, 'message' => 'يمكنك تعديل واجباتك فقط.'], 403);
        }

        $request->validate([
            'title'                    => 'required|string',
            'content'                  => 'nullable|string',
            'due_date'                 => 'required|date',
            'attachments'              => 'nullable|array|max:10',
            'attachments.*'            => 'file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,gif,webp,zip,rar,txt|max:10240',
            'remove_attachment_urls'   => 'nullable|array',
            'remove_attachment_urls.*' => 'string',
        ]);

        // المرفقات الحالية بعد حذف ما طلب المعلم إزالته
        $removeUrls = array_values(array_filter((array) $request->input('remove_attachment_urls', [])));
        $kept = $assignment->attachments->reject(fn($att) => in_array($att->url, $removeUrls, true))->values();
        $legacyOnly = $assignment->attachments->isEmpty() && $assignment->attachment_url
            && !in_array($assignment->attachment_url, $removeUrls, true);
        $keptCount = $kept->count() + ($legacyOnly ? 1 : 0);

        $newFiles = array_values(array_filter((array) $request->file('attachments', [])));
        if ($keptCount + count($newFiles) > 10) {
            return response()->json(['success' => false, 'message' => 'الحد الأقصى 10 مرفقات للواجب الواحد.'], 422);
        }

        // حفظ الملفات الجديدة
        $destination = public_path('uploads/assignments');
        $newSaved = [];
        foreach ($newFiles as $file) {
            File::ensureDirectoryExists($destination);
            $filename = Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());
            $original = $file->getClientOriginalName();
            $mime = $file->getClientMimeType();
            $file->move($destination, $filename);
            $newSaved[] = [url('uploads/assignments/' . $filename), $original, $mime];
        }

        // حذف ملفات المرفقات المُزالة من الخادم
        $deleteFile = function (string $attUrl) {
            $relative = parse_url($attUrl, PHP_URL_PATH) ?: '';
            $absolute = public_path(ltrim($relative, '/'));
            if ($relative && File::exists($absolute)) {
                File::delete($absolute);
            }
        };
        foreach ($assignment->attachments as $att) {
            if (in_array($att->url, $removeUrls, true)) {
                $deleteFile($att->url);
                $att->delete();
            }
        }
        if ($assignment->attachments->isEmpty() && $assignment->attachment_url && in_array($assignment->attachment_url, $removeUrls, true)) {
            $deleteFile($assignment->attachment_url);
        }

        // الواجب القديم بمرفق واحد (بدون جدول المرفقات): ننقله للجدول حتى يبقى الترتيب صحيحاً
        $order = 0;
        if ($legacyOnly) {
            \App\Models\AssignmentAttachment::create([
                'assignment_id' => $assignment->id,
                'url'           => $assignment->attachment_url,
                'sort_order'    => $order++,
            ]);
        } else {
            foreach ($kept as $att) {
                $att->update(['sort_order' => $order++]);
            }
        }
        foreach ($newSaved as [$attUrl, $original, $mime]) {
            \App\Models\AssignmentAttachment::create([
                'assignment_id' => $assignment->id,
                'url'           => $attUrl,
                'original_name' => $original,
                'mime'          => $mime,
                'sort_order'    => $order++,
            ]);
        }

        $firstUrl = \App\Models\AssignmentAttachment::where('assignment_id', $assignment->id)->orderBy('sort_order')->value('url');
        $assignment->update([
            'title'          => $request->input('title'),
            'content'        => $request->input('content'),
            'due_date'       => $request->input('due_date'),
            'attachment_url' => $firstUrl,
            'edited_at'      => now(),
        ]);

        // تحديث فوري للوحة التحكم وتطبيق ولي الأمر
        \App\Events\AssignmentsChanged::safeDispatch('updated', $assignment->id, $assignment->class_id);

        // إشعار أولياء أمور الصف بالتعديل (يفتح الواجب نفسه عند النقر)
        try {
            $notification = \App\Models\Notification::create([
                'title'         => 'تعديل واجب مدرسي',
                'content'       => 'تم تعديل الواجب: ' . $assignment->title,
                'type'          => 'general',
                'source'        => \App\Models\Notification::SOURCE_ASSIGNMENTS,
                'is_read'       => false,
                'class_id'      => $assignment->class_id,
                'assignment_id' => $assignment->id,
            ]);
            \App\Events\NotificationsChanged::safeDispatch('created', $notification->id);

            $publishDate = $assignment->created_at
                ? $assignment->created_at->copy()->timezone(config('app.timezone'))->toDateString()
                : now()->toDateString();
            $parents = \App\Models\Student::with('parentUser')->where('class_id', $assignment->class_id)
                ->get()->pluck('parentUser')->filter()->unique('id');
            $parents = $parents->values();
            $pushBody = 'تم تعديل الواجب: ' . $assignment->title;
            $pushData = [
                'type'          => 'assignment',
                'class_id'      => (string) $assignment->class_id,
                'assignment_id' => (string) $assignment->id,
                'date'          => $publishDate,
            ];
            // تنبيهات الجوال بعد إرجاع الرد للمعلم (لا ينتظر الإرسال لكل ولي أمر)
            dispatch(function () use ($parents, $pushBody, $pushData) {
                foreach ($parents as $parentUser) {
                    \App\Services\FcmService::sendToUser($parentUser, 'تعديل واجب مدرسي ✏️', $pushBody, $pushData);
                }
            })->afterResponse();
        } catch (\Throwable $ne) {
            \Illuminate\Support\Facades\Log::warning('Notification failure on assignment update: ' . $ne->getMessage());
        }

        return response()->json([
            'success'    => true,
            'message'    => 'تم تعديل الواجب وإبلاغ أولياء الأمور',
            'assignment' => $assignment->fresh()->load(['teacher', 'schoolClass', 'subject', 'submissions.student', 'attachments']),
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

        // Delete attachment file from storage
        // كل مرفقات الواجب (المتعددة + القديم)
        foreach (array_unique(array_merge($assignment->attachment_urls, array_filter([$assignment->attachment_url]))) as $attUrl) {
            $relative = str_replace(url('/'), '', $attUrl);
            $absolute = public_path(ltrim($relative, '/'));
            if (File::exists($absolute)) {
                File::delete($absolute);
            }
        }

        // Safely delete associated submissions from database
        AssignmentSubmission::where('assignment_id', $assignment->id)->delete();
        
        $deletedId = $assignment->id;
        $deletedClass = $assignment->class_id;
        $assignment->delete();
        \App\Events\AssignmentsChanged::safeDispatch('deleted', $deletedId, $deletedClass);
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
        // ترتيب ثابت عند تساوي القيم (منع تكرار/اختفاء صفوف بين الصفحات)
        if ($sortBy !== 'id') $query->orderBy($query->getModel()->getQualifiedKeyName(), $direction);

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
            $studentId = $sub['student_id'] ?? $sub['studentId'] ?? null;
            if (!$studentId) continue;

            $rawStatus = $sub['status'] ?? 'pending';
            if ($rawStatus === 'notSubmitted') {
                $status = 'not_submitted';
            } elseif ($rawStatus === 'submittedLate') {
                $status = 'submitted_late';
            } else {
                $status = $rawStatus ?: 'pending';
            }

            $existing = AssignmentSubmission::where('assignment_id', $id)
                ->where('student_id', $studentId)
                ->first();

            $hasNoteKey = array_key_exists('teacher_note', $sub) || array_key_exists('teacherNote', $sub) || array_key_exists('note', $sub);
            $rawNote = $sub['teacher_note'] ?? $sub['teacherNote'] ?? $sub['note'] ?? null;

            if ($hasNoteKey) {
                $trimmedNote = is_string($rawNote) ? trim($rawNote) : '';
                if ($trimmedNote !== '') {
                    $noteToSave = $trimmedNote;
                } elseif ($existing && !empty($existing->teacher_note) && $existing->status !== $status && $rawNote === '') {
                    // Preserve existing teacher note when status is toggled without note controller sync
                    $noteToSave = $existing->teacher_note;
                } else {
                    $noteToSave = null;
                }
            } else {
                $noteToSave = $existing ? $existing->teacher_note : null;
            }

            $isSubmitted = in_array($status, ['submitted', 'submitted_late'], true);

            AssignmentSubmission::updateOrCreate(
                [
                    'assignment_id' => $id,
                    'student_id' => $studentId,
                ],
                [
                    'status' => $status,
                    'teacher_note' => $noteToSave,
                    'submitted_at' => $isSubmitted ? ($existing && $existing->submitted_at ? $existing->submitted_at : now()) : null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث ورصد تسليمات الواجب بنجاح'
        ]);
    }

    public function deleteAll(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');

        $query = Assignment::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        $assignments = $query->with('attachments')->get();
        foreach ($assignments as $assignment) {
            foreach (array_unique(array_merge($assignment->attachment_urls, array_filter([$assignment->attachment_url]))) as $attUrl) {
                $relative = str_replace(url('/'), '', $attUrl);
                $absolute = public_path(ltrim($relative, '/'));
                if (File::exists($absolute)) {
                    File::delete($absolute);
                }
            }
            AssignmentSubmission::where('assignment_id', $assignment->id)->delete();
            $assignment->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الواجبات المحددة بنجاح.'
        ]);
    }
}
