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
    public function stats()
    {
        $today = now()->format('Y-m-d');

        $totalStudents = Student::count();
        $totalTeachers = User::teachers()->count();
        $totalClasses = SchoolClass::count();

        // الحضور والغياب اليوم
        $presentToday = Attendance::where('record_date', $today)->where('status', 'present')->count();
        $absentToday = Attendance::where('record_date', $today)->where('status', 'absent')->count();
        $lateToday = 0; // Removed from schema

        // طلبات الغياب المعلقة
        $pendingAbsences = AbsenceRequest::where('status', 'pending')->count();

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
            ]
        ]);
    }
}
