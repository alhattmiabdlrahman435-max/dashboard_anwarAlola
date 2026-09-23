<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\ExamSubject;
use App\Models\Subject;
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
            new Middleware('check.permission:examSchedules,create', only: ['store', 'duplicate']),
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
        if ($request->filled('class_id') && $request->input('class_id') !== 'all') {
            $query->where('class_id', $request->input('class_id'));
        }

        if ($request->filled('grade') && $request->input('grade') !== 'all') {
            $grade = $request->input('grade');
            $query->whereHas('schoolClass', function($q) use ($grade) {
                $q->where('grade_ar', $grade)->orWhere('grade_en', $grade);
            });
        }

        if ($request->filled('term') && $request->input('term') !== 'all') {
            $term = $request->input('term');
            $termKey = ($term === 'الفصل الثاني' || $term === '2' || $term === 'term2') ? 'term2' : 'term1';
            $query->where(function($q) use ($term, $termKey) {
                $q->where('term', $term)->orWhere('term', $termKey);
            });
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhereHas('schoolClass', function($sq) use ($search) {
                      $sq->where('grade_ar', 'LIKE', "%{$search}%")
                         ->orWhere('section_ar', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('examSubjects.subject', function($sq) use ($search) {
                      $sq->where('name_ar', 'LIKE', "%{$search}%")
                         ->orWhere('name_en', 'LIKE', "%{$search}%");
                  });
            });
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

            $grade = $sch->schoolClass ? ($sch->schoolClass->grade_ar ?? $sch->schoolClass->grade_en ?? '') : '';
            $gradeEn = $sch->schoolClass ? ($sch->schoolClass->grade_en ?? '') : '';
            $section = $sch->schoolClass ? ($sch->schoolClass->section_ar ?? $sch->schoolClass->section_en ?? '') : '';
            $sectionEn = $sch->schoolClass ? ($sch->schoolClass->section_en ?? '') : '';

            return [
                'id' => $sch->id,
                'title' => $sch->title,
                'class_id' => $sch->class_id,
                'class' => $sch->schoolClass,
                'grade' => $grade,
                'gradeEn' => $gradeEn,
                'section' => $section,
                'sectionEn' => $sectionEn,
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
            'class_ids' => 'nullable|array',
            'class_ids.*' => 'integer',
            'term' => 'nullable|string',
            'subjects' => 'required|array',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');

        $classIds = [];
        if ($request->filled('class_ids') && is_array($request->class_ids) && count($request->class_ids) > 0) {
            $classIds = array_map('intval', $request->class_ids);
        } elseif ($request->filled('class_id')) {
            $classIds = [(int)$request->class_id];
        }

        if (empty($classIds)) {
            $classIds = [null];
        }

        if ($scopedClassIds !== null) {
            $unauthorized = array_diff(array_filter($classIds), $scopedClassIds);
            if (!empty($unauthorized)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بإنشاء جدول اختبارات لبعض الفصول الدراسية المحددة.',
                ], 403);
            }
        }

        return DB::transaction(function() use ($request, $classIds) {
            $createdSchedules = [];

            foreach ($classIds as $cid) {
                $schedule = ExamSchedule::create([
                    'title' => $request->title,
                    'class_id' => $cid,
                    'term' => $request->term,
                    'created_by' => auth()->id()
                ]);

                foreach ($request->subjects as $sub) {
                    $resolvedSubId = $this->resolveSubjectId($sub);
                    ExamSubject::create([
                        'exam_schedule_id' => $schedule->id,
                        'subject_id' => $resolvedSubId,
                        'exam_date' => $sub['exam_date'],
                        'exam_time' => $sub['exam_time'],
                        'note' => $sub['note'] ?? null,
                    ]);
                }

                // Create notification for parents and teachers
                if ($cid) {
                    try {
                        \App\Models\Notification::create([
                            'title' => 'جدول اختبارات جديد 📋',
                            'content' => 'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $schedule->title,
                            'type' => 'exam_schedule',
                            'is_read' => false,
                            'class_id' => $cid,
                        ]);

                        $this->notifyParentsOfClass(
                            $cid,
                            'جدول اختبارات جديد 📋',
                            'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $schedule->title
                        );

                        $this->notifyTeachersOfClass(
                            $cid,
                            'جدول اختبارات جديد 📋',
                            'تم إضافة جدول اختبارات جديد لفصل تدرسه: ' . $schedule->title
                        );
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning("Exam schedule notification warning: " . $e->getMessage());
                    }
                }

                $createdSchedules[] = $schedule->load('examSubjects.subject');
            }

            return response()->json([
                'success' => true,
                'message' => count($createdSchedules) > 1
                    ? 'تم إنشاء ونشر جدول الاختبارات لـ ' . count($createdSchedules) . ' شعب بنجاح'
                    : 'تم إنشاء جدول الاختبارات بنجاح',
                'exam_schedule' => $createdSchedules[0] ?? null,
                'exam_schedules' => $createdSchedules
            ], 201);
        });
    }

    public function duplicate(Request $request, string $id)
    {
        $request->validate([
            'target_class_ids' => 'required|array|min:1',
            'target_class_ids.*' => 'integer|exists:classes,id',
        ]);

        $sourceSchedule = ExamSchedule::with('examSubjects')->find($id);
        if (!$sourceSchedule) {
            return response()->json(['success' => false, 'message' => 'الجدول المصدر غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'examSchedules');
        $targetIds = array_map('intval', $request->target_class_ids);

        if ($scopedClassIds !== null) {
            $unauthorized = array_diff($targetIds, $scopedClassIds);
            if (!empty($unauthorized)) {
                return response()->json([
                    'success' => false,
                    'message' => 'توجد فصول دراسية محددة خارج نطاق إشرافك المسموح به.',
                ], 403);
            }
        }

        return DB::transaction(function() use ($sourceSchedule, $targetIds) {
            $createdSchedules = [];

            foreach ($targetIds as $classId) {
                $newSchedule = ExamSchedule::create([
                    'title' => $sourceSchedule->title,
                    'class_id' => $classId,
                    'term' => $sourceSchedule->term,
                    'created_by' => auth()->id()
                ]);

                foreach ($sourceSchedule->examSubjects as $sub) {
                    ExamSubject::create([
                        'exam_schedule_id' => $newSchedule->id,
                        'subject_id' => $sub->subject_id,
                        'exam_date' => $sub->exam_date,
                        'exam_time' => $sub->exam_time,
                        'note' => $sub->note,
                    ]);
                }

                // Notify parents & teachers
                try {
                    \App\Models\Notification::create([
                        'title' => 'جدول اختبارات جديد 📋',
                        'content' => 'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $newSchedule->title,
                        'type' => 'exam_schedule',
                        'is_read' => false,
                        'class_id' => $classId,
                    ]);

                    $this->notifyParentsOfClass(
                        $classId,
                        'جدول اختبارات جديد 📋',
                        'تم إضافة جدول اختبارات جديد لصف ابنكم: ' . $newSchedule->title
                    );

                    $this->notifyTeachersOfClass(
                        $classId,
                        'جدول اختبارات جديد 📋',
                        'تم إضافة جدول اختبارات جديد لفصل تدرسه: ' . $newSchedule->title
                    );
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Duplicate schedule notification warning: " . $e->getMessage());
                }

                $createdSchedules[] = $newSchedule->load('examSubjects.subject');
            }

            return response()->json([
                'success' => true,
                'message' => 'تم نسخ جدول الاختبارات إلى ' . count($createdSchedules) . ' شعب بنجاح',
                'exam_schedules' => $createdSchedules
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
                $resolvedSubId = $this->resolveSubjectId($sub);
                ExamSubject::create([
                    'exam_schedule_id' => $schedule->id,
                    'subject_id' => $resolvedSubId,
                    'exam_date' => $sub['exam_date'],
                    'exam_time' => $sub['exam_time'],
                    'note' => $sub['note'] ?? null,
                ]);
            }

            // Create notification for parents in the class
            if ($schedule->class_id) {
                try {
                    \App\Models\Notification::create([
                        'title' => 'تعديل جدول اختبارات 📋',
                        'content' => 'تم تعديل جدول اختبارات صف ابنكم: ' . $schedule->title,
                        'type' => 'exam_schedule',
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
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Update schedule notification warning: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث جدول الاختبارات بنجاح',
                'exam_schedule' => $schedule->load('examSubjects.subject')
            ]);
        });
    }

    public function destroy(Request $request, string $id)
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

        DB::transaction(function() use ($schedule) {
            ExamSubject::where('exam_schedule_id', $schedule->id)->delete();
            $schedule->delete();
        });

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

        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("notifyParentsOfClass error: " . $e->getMessage());
        }
    }

    /**
     * إرسال إشعارات فورية لجميع معلمي الفصل الدراسي
     */
    private function notifyTeachersOfClass($classId, $title, $content)
    {
        if (!$classId) return;

        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("notifyTeachersOfClass error: " . $e->getMessage());
        }
    }

    /**
     * البحث عن المادة أو إنشاؤها ديناميكياً لضمان عدم حدوث أي خطأ في قاعدة البيانات
     */
    private function resolveSubjectId(array $sub): int
    {
        $subjectId = isset($sub['subject_id']) && !empty($sub['subject_id']) ? (int)$sub['subject_id'] : null;
        if ($subjectId && Subject::where('id', $subjectId)->exists()) {
            return $subjectId;
        }

        $subjectName = trim($sub['subject_name'] ?? ($sub['name_ar'] ?? ($sub['name'] ?? '')));
        if (!empty($subjectName)) {
            // 1. بحث مباشر بالاسم العربي أو الإنجليزي
            $found = Subject::where('name_ar', $subjectName)
                ->orWhere('name_en', $subjectName)
                ->first();
            if ($found) {
                return $found->id;
            }

            // 2. بحث مرن لمعالجة الفروق اللغوية (الهمزات، التاء المربوطة، الياء/الألف المقصورة)
            $normalize = function ($str) {
                $s = preg_replace('/[أإآ]/u', 'ا', $str);
                $s = preg_replace('/ة/u', 'ه', $s);
                $s = preg_replace('/ى/u', 'ي', $s);
                return trim(preg_replace('/\s+/u', ' ', $s));
            };

            $normInput = $normalize($subjectName);
            $allSubs = Subject::all();
            foreach ($allSubs as $s) {
                if ($normalize($s->name_ar) === $normInput || $normalize($s->name_en) === $normInput) {
                    return $s->id;
                }
            }

            // 3. إنشاء المادة فورياً في جدول المواد لتكتسب id نظامي
            $created = Subject::create([
                'name_ar' => $subjectName,
                'name_en' => $sub['name_en'] ?? $subjectName,
            ]);
            return $created->id;
        }

        // 4. خيار احتياطي آمن
        $first = Subject::first();
        if ($first) {
            return $first->id;
        }

        $default = Subject::create(['name_ar' => 'مادة عامة', 'name_en' => 'General Subject']);
        return $default->id;
    }
}
