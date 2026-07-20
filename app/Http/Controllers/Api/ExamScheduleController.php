<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\ExamSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class ExamScheduleController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'title', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:examSchedules,view', only: ['index', 'show']),
            new Middleware('check.permission:examSchedules,create', only: ['store']),
            new Middleware('check.permission:examSchedules,update', only: ['update']),
            new Middleware('check.permission:examSchedules,delete', only: ['destroy']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');

        $query = ExamSchedule::with(['examSubjects.subject', 'schoolClass']);
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where('title', 'LIKE', "%{$search}%");
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'title', 'class_id', 'term', 'created_by', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $schedules = $paginator->getCollection()->map(function($sch) {
            $subjectsArray = $sch->examSubjects->map(function($item) {
                return [
                    'id' => $item->id,
                    'subject_id' => $item->subject_id,
                    'name_ar' => $item->subject ? $item->subject->name_ar : '',
                    'name_en' => $item->subject ? $item->subject->name_en : '',
                    'exam_date' => $item->exam_date,
                    'exam_time' => $item->exam_time,
                    'note' => $item->note,
                ];
            });

            return [
                'id' => $sch->id,
                'title' => $sch->title,
                'class_id' => $sch->class_id,
                'class' => $sch->schoolClass,
                'term' => $sch->term,
                'created_by' => $sch->created_by,
                'subjects' => $subjectsArray,
                'created_at' => $sch->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'exam_schedules' => $schedules,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'class_id' => 'nullable|integer',
            'term' => 'nullable|string',
            'subjects' => 'required|array',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');
        if ($scopedClassIds !== null && !in_array($request->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإنشاء جدول اختبارات لهذا الفصل الدراسي.',
            ], 403);
        }

        return DB::transaction(function() use ($request) {
            $schedule = ExamSchedule::create([
                'title' => $request->title,
                'class_id' => $request->class_id,
                'term' => $request->term,
                'created_by' => auth()->id()
            ]);

            foreach ($request->subjects as $sub) {
                ExamSubject::create([
                    'exam_schedule_id' => $schedule->id,
                    'subject_id' => $sub['subject_id'],
                    'exam_date' => $sub['exam_date'],
                    'exam_time' => $sub['exam_time'],
                    'note' => $sub['note'] ?? null,
                ]);
            }

            // Create notification for parents in the class
            if ($schedule->class_id) {
                \App\Models\Notification::create([
                    'title' => 'جدول اختبارات جديد',
                    'content' => 'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $schedule->title,
                    'type' => 'general',
                    'is_read' => false,
                    'class_id' => $schedule->class_id,
                ]);

                $this->notifyParentsOfClass(
                    $schedule->class_id,
                    'جدول اختبارات جديد 📋',
                    'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $schedule->title
                );

                $this->notifyTeachersOfClass(
                    $schedule->class_id,
                    'جدول اختبارات جديد 📋',
                    'تم إضافة جدول اختبارات جديد لفصل تدرسه: ' . $schedule->title
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء جدول الاختبارات بنجاح',
                'exam_schedule' => $schedule->load('examSubjects.subject')
            ], 201);
        });
    }

    public function show(string $id)
    {
        $schedule = ExamSchedule::with('examSubjects.subject')->find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }

        $subjectsArray = $schedule->examSubjects->map(function($item) {
            return [
                'id' => $item->id,
                'subject_id' => $item->subject_id,
                'name_ar' => $item->subject ? $item->subject->name_ar : '',
                'name_en' => $item->subject ? $item->subject->name_en : '',
                'exam_date' => $item->exam_date,
                'exam_time' => $item->exam_time,
                'note' => $item->note,
            ];
        });

        $mappedSchedule = [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'class_id' => $schedule->class_id,
            'term' => $schedule->term,
            'created_by' => $schedule->created_by,
            'subjects' => $subjectsArray,
            'created_at' => $schedule->created_at,
        ];

        return response()->json([
            'success' => true,
            'exam_schedule' => $mappedSchedule
        ]);
    }

    public function update(Request $request, string $id)
    {
        $schedule = ExamSchedule::find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');
        if ($scopedClassIds !== null && !in_array($schedule->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل جدول اختبارات في هذا الفصل الدراسي.',
            ], 403);
        }

        $request->validate([
            'title' => 'required|string',
            'class_id' => 'nullable|integer',
            'term' => 'nullable|string',
            'subjects' => 'required|array',
        ]);

        return DB::transaction(function() use ($request, $schedule) {
            $schedule->update([
                'title' => $request->title,
                'class_id' => $request->class_id,
                'term' => $request->term,
            ]);

            // Clear old entries
            ExamSubject::where('exam_schedule_id', $schedule->id)->delete();

            foreach ($request->subjects as $sub) {
                ExamSubject::create([
                    'exam_schedule_id' => $schedule->id,
                    'subject_id' => $sub['subject_id'],
                    'exam_date' => $sub['exam_date'],
                    'exam_time' => $sub['exam_time'],
                    'note' => $sub['note'] ?? null,
                ]);
            }

            // Create notification for parents in the class
            if ($schedule->class_id) {
                \App\Models\Notification::create([
                    'title' => 'تعديل جدول اختبارات',
                    'content' => 'تم تعديل جدول اختبارات صف ابنكم: ' . $schedule->title,
                    'type' => 'general',
                    'is_read' => false,
                    'class_id' => $schedule->class_id,
                ]);

                $this->notifyParentsOfClass(
                    $schedule->class_id,
                    'تعديل جدول اختبارات 📋',
                    'تم تعديل جدول اختبارات صف ابنكم: ' . $schedule->title
                );

                $this->notifyTeachersOfClass(
                    $schedule->class_id,
                    'تعديل جدول اختبارات 📋',
                    'تم تعديل جدول اختبارات لفصل تدرسه: ' . $schedule->title
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث جدول الاختبارات بنجاح',
                'exam_schedule' => $schedule->load('examSubjects.subject')
            ]);
        });
    }

    public function destroy(string $id)
    {
        $schedule = ExamSchedule::find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');
        if ($scopedClassIds !== null && !in_array($schedule->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف جدول اختبارات في هذا الفصل الدراسي.',
            ], 403);
        }
        $schedule->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف جدول الاختبارات بنجاح'
        ]);
    }

    /**
     * إرسال إشعارات فورية لجميع أولياء أمور الفصل الدراسي
     */
    private function notifyParentsOfClass($classId, $title, $content)
    {
        if (!$classId) return;

        $students = \App\Models\Student::with('parentUser')->where('class_id', $classId)->get();
        $parentUsers = $students->pluck('parentUser')->filter()->unique('id');

        foreach ($parentUsers as $parentUser) {
            \App\Services\FcmService::sendToUser(
                $parentUser,
                $title,
                $content,
                [
                    'type' => 'exam_schedule',
                    'class_id' => (string)$classId
                ]
            );
        }
    }

    /**
     * إرسال إشعارات فورية لجميع معلمي الفصل الدراسي
     */
    private function notifyTeachersOfClass($classId, $title, $content)
    {
        if (!$classId) return;

        $teacherIds = \App\Models\TeacherSubject::where('class_id', $classId)->pluck('teacher_id')->filter()->unique();
        foreach ($teacherIds as $teacherId) {
            $teacherUser = \App\Models\User::find($teacherId);
            if ($teacherUser) {
                \App\Models\Notification::create([
                    'title' => $title,
                    'content' => $content,
                    'type' => 'general',
                    'is_read' => false,
                    'teacher_id' => $teacherId,
                ]);

                \App\Services\FcmService::sendToUser(
                    $teacherUser,
                    $title,
                    $content,
                    [
                        'type' => 'exam_schedule',
                        'class_id' => (string)$classId
                    ]
                );
            }
        }
    }
}
