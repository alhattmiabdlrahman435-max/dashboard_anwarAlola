<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Attendance;
use App\Models\AbsenceRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $today = now()->format('Y-m-d');

        // Basic Aggregates
        $totalStudents = Student::count();
        $totalTeachers = User::teachers()->count();
        $totalClasses = SchoolClass::count();

        // Attendance stats
        $presentToday = Attendance::where('record_date', $today)->where('status', 'present')->count();
        $absentToday = Attendance::where('record_date', $today)->where('status', 'absent')->count();
        $lateToday = Attendance::where('record_date', $today)->where('status', 'late')->count();

        // Pending absences
        $pendingAbsences = AbsenceRequest::where('status', 'pending')->count();

        // Finance stats
        $totalRequired = (float)Student::sum('tuition_fee');
        $totalPaid = (float)\App\Models\Payment::sum('amount');
        $collectionRate = $totalRequired > 0 ? round(($totalPaid / $totalRequired) * 100) : 0;
        $paidStudentsCount = \App\Models\Payment::distinct()->count('student_id');

        // Subject averages (from control grades: month = 0, is_control = true)
        $subjectAverages = [];
        $subjects = [
            'math' => 1,
            'science' => 2,
            'arabic' => 3,
            'english' => 4,
        ];
        foreach ($subjects as $name => $id) {
            $avg = \App\Models\Grade::where('is_control', true)
                ->where('month', 0)
                ->where('subject_id', $id)
                ->avg('final_exam') ?? 0;
            $subjectAverages[$name] = round($avg);
        }

        // Top 3 performing students in control grades
        $topStudentsRaw = Student::with(['schoolClass', 'grades' => function($q) {
            $q->where('is_control', true)->where('month', 0);
        }])->get();

        $topStudents = $topStudentsRaw->map(function($student) {
            $grades = $student->grades;
            $mathVal = $grades->firstWhere('subject_id', 1)?->final_exam;
            $scienceVal = $grades->firstWhere('subject_id', 2)?->final_exam;
            $arabicVal = $grades->firstWhere('subject_id', 3)?->final_exam;
            $englishVal = $grades->firstWhere('subject_id', 4)?->final_exam;

            $vals = array_filter([$mathVal, $scienceVal, $arabicVal, $englishVal], fn($v) => !is_null($v));
            $average = count($vals) > 0 ? round(array_sum($vals) / count($vals)) : 0;

            return [
                'student_id' => $student->id,
                'name' => $student->name_ar,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'nameEn' => $student->name_en,
                'grade' => $student->schoolClass ? $student->schoolClass->grade_ar : '',
                'gradeEn' => $student->schoolClass ? $student->schoolClass->grade_en : '',
                'section' => $student->schoolClass ? $student->schoolClass->section_ar : '',
                'sectionEn' => $student->schoolClass ? $student->schoolClass->section_en : '',
                'average' => $average
            ];
        })
        ->sortByDesc('average')
        ->take(3)
        ->values()
        ->toArray();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_classes' => $totalClasses,
                'present_today' => $presentToday,
                'absent_today' => $absentToday,
                'late_today' => $lateToday,
                'pending_absences' => $pendingAbsences,
                'total_required_fees' => $totalRequired,
                'total_paid_fees' => $totalPaid,
                'collection_rate' => $collectionRate,
                'paid_students_count' => $paidStudentsCount,
                'subject_averages' => $subjectAverages,
                'top_students' => $topStudents,
            ]
        ]);
    }
}
