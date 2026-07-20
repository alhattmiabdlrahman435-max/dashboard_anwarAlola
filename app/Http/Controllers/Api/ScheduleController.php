<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Schedule;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class ScheduleController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'grade_ar', 'section_ar', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:schedule,view', only: ['index']),
            new Middleware('check.permission:schedule,update', only: ['store']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'schedule');

        $scheduleQuery = Schedule::query();
        $classQuery = SchoolClass::query();

        if ($scopedClassIds !== null) {
            $scheduleQuery->whereIn('class_id', $scopedClassIds);
            $classQuery->whereIn('id', $scopedClassIds);
        }

        // Apply search on classes
        $search = $request->input('search');
        if (!empty($search)) {
            $classQuery->where(function($q) use ($search) {
                $q->where('grade_ar', 'LIKE', "%{$search}%")
                  ->orWhere('section_ar', 'LIKE', "%{$search}%")
                  ->orWhere('grade_en', 'LIKE', "%{$search}%")
                  ->orWhere('section_en', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting on classes
        $sortBy = $request->input('sort', 'id');
        $direction = strtolower($request->input('direction', 'asc'));
        if (in_array($sortBy, $this->sortableColumns)) {
            $classQuery->orderBy($sortBy, $direction);
        } else {
            $classQuery->orderBy('id', 'asc');
        }

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $classQuery->with(['teacherSubjects.teacher', 'teacherSubjects.subject'])->paginate($perPage);
        $classes = $paginator->getCollection();

        // Get only the schedules for the paginated classes
        $classIds = $classes->pluck('id')->toArray();
        $schedules = $scheduleQuery->whereIn('class_id', $classIds)
                                   ->with(['schoolClass', 'subject'])
                                   ->get();
        
        // Group by class name
        $grouped = [];
        $teachersMapping = [];
        
        foreach ($classes as $cls) {
            $className = $cls->grade_ar . ' - ' . $cls->section_ar;
            
            // Initialize default schedule template (Saturday to Wednesday) - 7 blank periods by default
            $grouped[$className] = [
                'saturday' => array_fill(0, 7, ''),
                'sunday' => array_fill(0, 7, ''),
                'monday' => array_fill(0, 7, ''),
                'tuesday' => array_fill(0, 7, ''),
                'wednesday' => array_fill(0, 7, ''),
            ];

            // Build teachers mapping for subjects in this class
            $teachersMapping[$className] = [];
            foreach ($cls->teacherSubjects as $ts) {
                if ($ts->subject && $ts->teacher) {
                    $teachersMapping[$className][$ts->subject->name_ar] = $ts->teacher->name_ar ?? $ts->teacher->name;
                }
            }
            if (empty($teachersMapping[$className])) {
                $teachersMapping[$className] = (object)[];
            }
        }
        
        foreach ($schedules as $sch) {
            $cls = $sch->schoolClass;
            if (!$cls) continue;
            
            $className = $cls->grade_ar . ' - ' . $cls->section_ar;
            $day = strtolower($sch->day_of_week);
            $periodIdx = $sch->period - 1; // 0-indexed for frontend
            
            if (isset($grouped[$className][$day]) && $periodIdx >= 0 && $periodIdx < 7) {
                $grouped[$className][$day][$periodIdx] = $sch->subject ? $sch->subject->name_ar : '';
            }
        }
        
        return response()->json([
            'success' => true,
            'schedules' => $grouped,
            'teachers' => $teachersMapping,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_name' => 'required|string',
            'schedule' => 'required|array', // e.g. { sunday: [...], monday: [...] }
        ]);

        $className = $request->class_name;
        
        // Find class by name_ar
        $parts = explode(' - ', $className);
        $grade = $parts[0] ?? '';
        $section = $parts[1] ?? '';
        
        $cls = SchoolClass::where('grade_ar', $grade)->where('section_ar', $section)->first();
        if (!$cls) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'schedule');
        if ($scopedClassIds !== null && !in_array($cls->id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل جدول هذا الفصل الدراسي.',
            ], 403);
        }

        // Check for teacher conflicts before saving
        $conflictsByTeacher = [];
        $dayNamesAr = [
            'saturday' => 'السبت',
            'sunday' => 'الأحد',
            'monday' => 'الاثنين',
            'tuesday' => 'الثلاثاء',
            'wednesday' => 'الأربعاء',
            'thursday' => 'الخميس',
            'friday' => 'الجمعة',
        ];
        $periodNamesAr = [
            1 => 'الأولى',
            2 => 'الثانية',
            3 => 'الثالثة',
            4 => 'الرابعة',
            5 => 'الخامسة',
            6 => 'السادسة',
            7 => 'السابعة',
        ];

        // Preload subjects
        $allSubjectNames = [];
        foreach ($request->schedule as $day => $periods) {
            foreach ($periods as $idx => $subjName) {
                if (!empty($subjName)) {
                    $allSubjectNames[] = trim($subjName);
                }
            }
        }
        $allSubjectNames = array_unique($allSubjectNames);
        
        $subjectsList = Subject::whereIn('name_ar', $allSubjectNames)
            ->orWhereIn('name_en', $allSubjectNames)
            ->get();
        $subjectsByAr = $subjectsList->keyBy('name_ar');
        $subjectsByEn = $subjectsList->keyBy('name_en');

        // Preload teacher subject assignments for this class
        $teacherSubjects = TeacherSubject::where('class_id', $cls->id)
            ->with('teacher')
            ->get()
            ->keyBy('subject_id');

        $teacherIds = $teacherSubjects->pluck('teacher_id')->filter()->unique()->toArray();
        $schedulesByTeacherAndSlot = [];

        if (!empty($teacherIds)) {
            $allSchedules = DB::table('schedules')
                ->join('teacher_subjects', function($join) {
                    $join->on('schedules.class_id', '=', 'teacher_subjects.class_id')
                         ->on('schedules.subject_id', '=', 'teacher_subjects.subject_id');
                })
                ->join('classes', 'schedules.class_id', '=', 'classes.id')
                ->join('subjects', 'schedules.subject_id', '=', 'subjects.id')
                ->where('schedules.class_id', '!=', $cls->id)
                ->whereIn('teacher_subjects.teacher_id', $teacherIds)
                ->select(
                    'schedules.day_of_week',
                    'schedules.period',
                    'teacher_subjects.teacher_id',
                    'classes.grade_ar',
                    'classes.section_ar',
                    'subjects.name_ar as subject_name'
                )
                ->get();

            foreach ($allSchedules as $schObj) {
                $key = $schObj->teacher_id . '-' . strtolower($schObj->day_of_week) . '-' . $schObj->period;
                $schedulesByTeacherAndSlot[$key] = $schObj;
            }
        }

        foreach ($request->schedule as $day => $periods) {
            foreach ($periods as $idx => $subjName) {
                if (empty($subjName)) continue;
                
                $dayKey = strtolower($day);
                $periodNumber = $idx + 1;
                
                $subj = $subjectsByAr->get(trim($subjName)) ?: $subjectsByEn->get(trim($subjName));
                if (!$subj) continue;

                $ts = $teacherSubjects->get($subj->id);
                if (!$ts || !$ts->teacher) continue;
                
                $teacherId = $ts->teacher_id;
                $teacherName = $ts->teacher->name_ar ?? $ts->teacher->name;

                $key = $teacherId . '-' . $dayKey . '-' . $periodNumber;
                if (isset($schedulesByTeacherAndSlot[$key])) {
                    $conflict = $schedulesByTeacherAndSlot[$key];
                    $conflictClassName = $conflict->grade_ar . ' - ' . $conflict->section_ar;
                    $dayAr = $dayNamesAr[$dayKey] ?? $day;
                    $periodAr = $periodNamesAr[$periodNumber] ?? "الحصة {$periodNumber}";
                    
                    $conflictsByTeacher[$teacherName][] = "يوم {$dayAr} الحصة {$periodAr} (مادة {$conflict->subject_name} في {$conflictClassName})";
                }
            }
        }

        if (!empty($conflictsByTeacher)) {
            $messageLines = ["توجد تعارضات في جدول المعلمين:"];
            foreach ($conflictsByTeacher as $teacher => $list) {
                $messageLines[] = "👤 " . $teacher . ":";
                foreach ($list as $item) {
                    $messageLines[] = "  • " . $item;
                }
            }
            return response()->json([
                'success' => false,
                'message' => implode("\n", $messageLines)
            ], 400);
        }

        $teacherFcmToSend = [];
        $parentsToNotify = [];

        $response = DB::transaction(function() use ($request, $cls, $className, $dayNamesAr, $periodNamesAr, $subjectsByAr, $subjectsByEn, $teacherSubjects, &$teacherFcmToSend, &$parentsToNotify) {
            // 1. Get old schedules for comparison
            $oldSchedules = Schedule::where('class_id', $cls->id)->get();
            $oldPeriods = [];
            foreach ($oldSchedules as $sch) {
                $oldPeriods[strtolower($sch->day_of_week) . '-' . $sch->period] = $sch->subject_id;
            }

            // 2. Build new periods mapping from request
            $newPeriods = [];
            foreach ($request->schedule as $day => $periods) {
                foreach ($periods as $idx => $subjName) {
                    if (empty($subjName)) continue;
                    $subj = $subjectsByAr->get(trim($subjName)) ?: $subjectsByEn->get(trim($subjName));
                    if ($subj) {
                        $newPeriods[strtolower($day) . '-' . ($idx + 1)] = $subj->id;
                    }
                }
            }

            // 3. Preload all subject details for change notifications
            $allSubjectIds = array_unique(array_merge(
                array_values($oldPeriods),
                array_values($newPeriods)
            ));
            $subjectsById = Subject::whereIn('id', $allSubjectIds)->get()->keyBy('id');

            // 4. Delete old schedules for this class
            Schedule::where('class_id', $cls->id)->delete();
            
            // 5. Create new schedules
            foreach ($newPeriods as $key => $subjectId) {
                list($day, $period) = explode('-', $key);
                Schedule::create([
                    'class_id' => $cls->id,
                    'subject_id' => $subjectId,
                    'day_of_week' => $day,
                    'period' => $period,
                ]);
            }

            // 6. Calculate changes and prepare notifications
            $notificationsToSend = []; // array of ['teacher_id' => ..., 'title' => ..., 'body' => ...]

            // Helper to get teacher from subject
            $getTeacherId = function($subjectId) use ($teacherSubjects) {
                $ts = $teacherSubjects->get($subjectId);
                return $ts ? $ts->teacher_id : null;
            };

            // Detect deleted periods
            foreach ($oldPeriods as $key => $oldSubjId) {
                list($day, $period) = explode('-', $key);
                $newSubjId = $newPeriods[$key] ?? null;

                if ($newSubjId !== $oldSubjId) {
                    $oldTeacherId = $getTeacherId($oldSubjId);
                    if ($oldTeacherId) {
                        $subjObj = $subjectsById->get($oldSubjId);
                        $subjName = $subjObj ? $subjObj->name_ar : '';
                        $dayAr = $dayNamesAr[$day] ?? $day;
                        $periodAr = $periodNamesAr[$period] ?? "الحصة {$period}";
                        
                        $notificationsToSend[] = [
                            'teacher_id' => $oldTeacherId,
                            'title' => '❌ حذف حصة من جدولك',
                            'body' => "تم إزالة حصتك (مادة {$subjName}) من جدول فصل {$className} ليوم {$dayAr} {$periodAr}.",
                        ];
                    }
                }
            }

            // Detect added periods
            foreach ($newPeriods as $key => $newSubjId) {
                list($day, $period) = explode('-', $key);
                $oldSubjId = $oldPeriods[$key] ?? null;

                if ($oldSubjId !== $newSubjId) {
                    $newTeacherId = $getTeacherId($newSubjId);
                    if ($newTeacherId) {
                        $subjObj = $subjectsById->get($newSubjId);
                        $subjName = $subjObj ? $subjObj->name_ar : '';
                        $dayAr = $dayNamesAr[$day] ?? $day;
                        $periodAr = $periodNamesAr[$period] ?? "الحصة {$period}";
                        
                        $notificationsToSend[] = [
                            'teacher_id' => $newTeacherId,
                            'title' => '➕ إضافة حصة جديدة لجدولك',
                            'body' => "تم إضافة حصة جديدة لك (مادة {$subjName}) في جدول فصل {$className} ليوم {$dayAr} {$periodAr}.",
                        ];
                    }
                }
            }

            // Send calculated notifications (DB insertions inside transaction)
            foreach ($notificationsToSend as $notif) {
                \App\Models\Notification::create([
                    'title' => $notif['title'],
                    'content' => $notif['body'],
                    'type' => 'general',
                    'is_read' => false,
                    'teacher_id' => $notif['teacher_id'],
                ]);

                $teacherUser = \App\Models\User::find($notif['teacher_id']);
                if ($teacherUser) {
                    $teacherFcmToSend[] = [
                        'user' => $teacherUser,
                        'title' => $notif['title'] . ' 📅',
                        'body' => $notif['body']
                    ];
                }
            }
            // 7. Notify parents of the class as usual (DB insertions inside transaction)
            \App\Models\Notification::create([
                'title' => 'تحديث الجدول الدراسي الأسبوعي',
                'content' => 'تم تحديث الجدول الدراسي الأسبوعي للفصل ' . $className,
                'type' => 'general',
                'is_read' => false,
                'class_id' => $cls->id,
            ]);

            $students = \App\Models\Student::with('parentUser')->where('class_id', $cls->id)->get();
            $parentUsers = $students->pluck('parentUser')->filter()->unique('id');
            foreach ($parentUsers as $parentUser) {
                $parentsToNotify[] = [
                    'user' => $parentUser,
                    'title' => 'تحديث الجدول الدراسي الأسبوعي 📅',
                    'body' => 'تم تحديث الجدول الدراسي الأسبوعي لصف ابنكم: ' . $className
                ];
            }

            // 8. Register post-commit hook to dispatch synchronous FCM requests ONLY after transaction commits successfully
            DB::afterCommit(function() use ($teacherFcmToSend, $parentsToNotify, $cls) {
                foreach ($teacherFcmToSend as $item) {
                    \App\Services\FcmService::sendToUser(
                        $item['user'],
                        $item['title'],
                        $item['body'],
                        [
                            'type' => 'weekly_schedule',
                            'class_id' => (string)$cls->id
                        ]
                    );
                }

                foreach ($parentsToNotify as $item) {
                    \App\Services\FcmService::sendToUser(
                        $item['user'],
                        $item['title'],
                        $item['body'],
                        [
                            'type' => 'weekly_schedule',
                            'class_id' => (string)$cls->id
                        ]
                    );
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ جدول الفصل بنجاح'
            ]);
        });

        return $response;
    }
}
