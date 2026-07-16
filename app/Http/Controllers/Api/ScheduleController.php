<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Schedule;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index()
    {
        // Fetch all schedules with classes and subjects
        $schedules = Schedule::with(['schoolClass', 'subject'])->get();
        
        // Group by class name (e.g. "الصف الأول - أ")
        $grouped = [];
        $teachersMapping = [];
        
        // Load all classes with teacher subjects
        $classes = SchoolClass::with(['teacherSubjects.teacher', 'teacherSubjects.subject'])->get();
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
            'teachers' => $teachersMapping
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
                    $allSubjectNames[] = $subjName;
                }
            }
        }
        $allSubjectNames = array_unique($allSubjectNames);
        $subjectsMap = Subject::whereIn('name_ar', $allSubjectNames)->get()->keyBy('name_ar');

        // Preload teacher subject assignments for this class
        $teacherSubjectsMap = TeacherSubject::where('class_id', $cls->id)
            ->with('teacher')
            ->get()
            ->groupBy('subject_id');

        foreach ($request->schedule as $day => $periods) {
            foreach ($periods as $idx => $subjName) {
                if (empty($subjName)) continue;
                
                $dayKey = strtolower($day);
                $periodNumber = $idx + 1;
                
                $subj = $subjectsMap->get($subjName);
                if (!$subj) continue;

                $tsList = $teacherSubjectsMap->get($subj->id);
                if (!$tsList || $tsList->isEmpty()) continue;
                
                $ts = $tsList->first();
                if (!$ts->teacher) continue;
                
                $teacherId = $ts->teacher_id;
                $teacherName = $ts->teacher->name_ar ?? $ts->teacher->name;

                // Query DB to check if this teacher is already assigned elsewhere at this day and period
                $conflict = DB::table('schedules')
                    ->join('teacher_subjects', function($join) {
                        $join->on('schedules.class_id', '=', 'teacher_subjects.class_id')
                             ->on('schedules.subject_id', '=', 'teacher_subjects.subject_id');
                    })
                    ->join('classes', 'schedules.class_id', '=', 'classes.id')
                    ->join('subjects', 'schedules.subject_id', '=', 'subjects.id')
                    ->where('schedules.class_id', '!=', $cls->id)
                    ->where('schedules.day_of_week', $dayKey)
                    ->where('schedules.period', $periodNumber)
                    ->where('teacher_subjects.teacher_id', $teacherId)
                    ->select(
                        'classes.grade_ar',
                        'classes.section_ar',
                        'subjects.name_ar as subject_name'
                    )
                    ->first();

                if ($conflict) {
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

        return DB::transaction(function() use ($request, $cls, $className, $dayNamesAr, $periodNamesAr) {
            // 1. Get old schedules for comparison
            $oldSchedules = Schedule::where('class_id', $cls->id)->get();
            $oldPeriods = [];
            foreach ($oldSchedules as $sch) {
                $oldPeriods[strtolower($sch->day_of_week) . '-' . $sch->period] = $sch->subject_id;
            }

            // 2. Preload teacher subjects for this class to map subject_id -> teacher
            $teacherSubjects = TeacherSubject::where('class_id', $cls->id)->get()->keyBy('subject_id');

            // 3. Build new periods mapping from request
            $newPeriods = [];
            foreach ($request->schedule as $day => $periods) {
                foreach ($periods as $idx => $subjName) {
                    if (empty($subjName)) continue;
                    $subj = Subject::where('name_ar', trim($subjName))
                        ->orWhere('name_en', trim($subjName))
                        ->first();
                    if ($subj) {
                        $newPeriods[strtolower($day) . '-' . ($idx + 1)] = $subj->id;
                    }
                }
            }

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

            // 6. Calculate changes and notify teachers
            $notificationsToSend = []; // array of ['teacher_id' => ..., 'title' => ..., 'body' => ...]

            // Helper to get teacher from subject
            $getTeacherId = function($subjectId) use ($teacherSubjects) {
                $ts = $teacherSubjects->get($subjectId);
                return $ts ? $ts->teacher_id : null;
            };

            // Detect deleted periods (existed in old, not in new OR new has different subject)
            foreach ($oldPeriods as $key => $oldSubjId) {
                list($day, $period) = explode('-', $key);
                $newSubjId = $newPeriods[$key] ?? null;

                if ($newSubjId !== $oldSubjId) {
                    // Session deleted or changed for the old subject's teacher
                    $oldTeacherId = $getTeacherId($oldSubjId);
                    if ($oldTeacherId) {
                        $subjName = Subject::find($oldSubjId)->name_ar ?? '';
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

            // Detect added periods (existed in new, not in old OR old had different subject)
            foreach ($newPeriods as $key => $newSubjId) {
                list($day, $period) = explode('-', $key);
                $oldSubjId = $oldPeriods[$key] ?? null;

                if ($oldSubjId !== $newSubjId) {
                    // Session added or changed for the new subject's teacher
                    $newTeacherId = $getTeacherId($newSubjId);
                    if ($newTeacherId) {
                        $subjName = Subject::find($newSubjId)->name_ar ?? '';
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

            // Send calculated notifications
            foreach ($notificationsToSend as $notif) {
                \App\Models\Notification::create([
                    'title' => $notif['title'],
                    'content' => $notif['body'],
                    'type' => 'general',
                    'is_read' => false,
                    'teacher_id' => $notif['teacher_id'],
                ]);

                $teacherUser = \App\Models\User::find($notif['teacher_id']);
                if ($teacherUser && $teacherUser->fcm_token) {
                    \App\Services\FcmService::sendNotification(
                        $teacherUser->fcm_token,
                        $notif['title'] . ' 📅',
                        $notif['body'],
                        [
                            'type' => 'weekly_schedule',
                            'class_id' => (string)$cls->id
                        ]
                    );
                }
            }

            // 7. Notify parents of the class as usual
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
                if ($parentUser->fcm_token) {
                    \App\Services\FcmService::sendNotification(
                        $parentUser->fcm_token,
                        'تحديث الجدول الدراسي الأسبوعي 📅',
                        'تم تحديث الجدول الدراسي الأسبوعي لصف ابنكم: ' . $className,
                        [
                            'type' => 'weekly_schedule',
                            'class_id' => (string)$cls->id
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ جدول الفصل بنجاح'
            ]);
        });
    }
}
