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
        
        // Load all classes
        $classes = SchoolClass::all();
        foreach ($classes as $cls) {
            $className = $cls->grade_ar . ' - ' . $cls->section_ar;
            
            // Initialize default schedule template
            $grouped[$className] = [
                'sunday' => array_fill(0, 6, 'الرياضيات'),
                'monday' => array_fill(0, 6, 'اللغة العربية'),
                'tuesday' => array_fill(0, 6, 'التربية الإسلامية'),
                'wednesday' => array_fill(0, 6, 'العلوم'),
                'thursday' => array_fill(0, 6, 'اللغة الإنجليزية'),
            ];
        }
        
        foreach ($schedules as $sch) {
            $cls = $sch->schoolClass;
            if (!$cls) continue;
            
            $className = $cls->grade_ar . ' - ' . $cls->section_ar;
            $day = strtolower($sch->day_of_week);
            $periodIdx = $sch->period - 1; // 0-indexed for frontend
            
            if (isset($grouped[$className][$day]) && $periodIdx >= 0 && $periodIdx < 6) {
                $grouped[$className][$day][$periodIdx] = $sch->subject ? $sch->subject->name_ar : '';
            }
        }
        
        return response()->json([
            'success' => true,
            'schedules' => $grouped
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

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ جدول الفصل بنجاح'
            ]);
        });
    }
}
