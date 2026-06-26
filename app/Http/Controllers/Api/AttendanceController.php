<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Notification;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('student');

        if ($request->has('date')) {
            $query->where('record_date', $request->date);
        }

        $records = $query->get()->map(function($record) {
            return [
                'id' => $record->id,
                'student_id' => $record->student_id,
                'student' => $record->student,
                'date' => $record->record_date,
                'record_date' => $record->record_date,
                'status' => $record->status,
                'arrival_time' => $record->arrival_time,
                'note' => $record->note,
                'created_by' => $record->created_by,
                'created_at' => $record->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'attendance' => $records
        ]);
    }

    public function store(Request $request)
    {
        // VERIFICATION: Only supervisor/admin can mark attendance
        if ($request->user()->role === 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'المعلم لا يملك صلاحية تحضير الطلاب. التحضير من صلاحيات المشرفة فقط.'
            ], 403);
        }

        $request->validate([
            'student_id' => 'required|integer',
            'date' => 'required|date',
            'status' => 'required|string|in:present,absent',
            'arrival_time' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'record_date' => $request->date,
            ],
            [
                'status' => $request->status,
                'arrival_time' => $request->arrival_time,
                'note' => $request->note,
                'created_by' => $request->user()->id
            ]
        );

        // Notify parent
        $student = Student::find($request->student_id);
        if ($student && $student->parent_id) {
            $statusAr = $request->status === 'present' ? 'حاضراً' : 'غائباً';

            Notification::create([
                'title' => 'تحديث سجل الحضور المدرسي',
                'content' => "تم تسجيل الطالب {$student->name_ar} {$statusAr} اليوم.",
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل حضور الطالب بنجاح',
            'attendance' => $attendance
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        // VERIFICATION: Only supervisor/admin can mark attendance
        if ($request->user()->role === 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'المعلم لا يملك صلاحية تحضير الطلاب. التحضير من صلاحيات المشرفة فقط.'
            ], 403);
        }

        $attendance = Attendance::find($id);
        if (!$attendance) {
            return response()->json(['success' => false, 'message' => 'سجل التحضير غير موجود'], 404);
        }

        $request->validate([
            'status' => 'required|string|in:present,absent',
            'arrival_time' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $attendance->update([
            'status' => $request->status,
            'arrival_time' => $request->arrival_time,
            'note' => $request->note,
        ]);

        // Notify parent
        $student = Student::find($attendance->student_id);
        if ($student && $student->parent_id) {
            $statusAr = $request->status === 'present' ? 'حاضراً' : 'غائباً';

            Notification::create([
                'title' => 'تحديث سجل الحضور المدرسي',
                'content' => "تم تعديل حالة حضور الطالب {$student->name_ar} إلى {$statusAr} اليوم.",
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث سجل التحضير بنجاح',
            'attendance' => $attendance
        ]);
    }

    public function today()
    {
        $today = now()->format('Y-m-d');
        $records = Attendance::with('student')
                             ->where('record_date', $today)
                             ->get();

        return response()->json([
            'success' => true,
            'date' => $today,
            'attendance' => $records
        ]);
    }

    public function byStudent(string $studentId)
    {
        $records = Attendance::where('student_id', $studentId)
                             ->orderBy('record_date', 'desc')
                             ->get();

        return response()->json([
            'success' => true,
            'attendance' => $records
        ]);
    }
}
