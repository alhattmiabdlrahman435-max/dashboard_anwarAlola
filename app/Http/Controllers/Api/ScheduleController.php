<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Schedule;
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

        return DB::transaction(function() use ($request, $cls) {
            // Delete old schedules for this class
            Schedule::where('class_id', $cls->id)->delete();
            
            foreach ($request->schedule as $day => $periods) {
                foreach ($periods as $idx => $subjName) {
                    if (empty($subjName)) continue;
                    
                    // Find subject by name_ar
                    $subj = Subject::where('name_ar', $subjName)->first();
                    if ($subj) {
                        Schedule::create([
                            'class_id' => $cls->id,
                            'subject_id' => $subj->id,
                            'day_of_week' => strtolower($day),
                            'period' => $idx + 1, // 1-indexed for DB
                        ]);
                    }
                }
            }

            // 1. Notify parents of the class
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

            // 2. Notify teachers of the class
            $teacherIds = \App\Models\TeacherSubject::where('class_id', $cls->id)->pluck('teacher_id')->filter()->unique();
            foreach ($teacherIds as $teacherId) {
                $teacherUser = \App\Models\User::find($teacherId);
                if ($teacherUser) {
                    \App\Models\Notification::create([
                        'title' => 'تحديث الجدول الأسبوعي',
                        'content' => 'تم تحديث الجدول الأسبوعي لفصل تدرسه: ' . $className,
                        'type' => 'general',
                        'is_read' => false,
                        'teacher_id' => $teacherId,
                    ]);

                    if ($teacherUser->fcm_token) {
                        \App\Services\FcmService::sendNotification(
                            $teacherUser->fcm_token,
                            'تحديث الجدول الدراسي الأسبوعي 📅',
                            'تم تحديث الجدول الدراسي الأسبوعي لفصل تدرسه: ' . $className,
                            [
                                'type' => 'weekly_schedule',
                                'class_id' => (string)$cls->id
                            ]
                        );
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ جدول الفصل بنجاح'
            ]);
        });
    }
}
