<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherSubject;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = User::teachers()->with('teacherSubjects.subject', 'teacherSubjects.schoolClass')->get()->map(function($t) {
            return [
                'id' => $t->id,
                'job_id' => $t->job_id,
                'name_ar' => $t->name_ar,
                'name_en' => $t->name_en,
                'phone' => $t->phone,
                'photo_url' => $t->photo_url ?: '👨‍🏫',
                'email' => $t->email,
                'assignments' => $t->teacherSubjects->map(function($sub) {
                    return [
                        'id' => $sub->id,
                        'subject_id' => $sub->subject_id,
                        'class_id' => $sub->class_id,
                        'subject' => $sub->subject,
                        'school_class' => $sub->schoolClass,
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'teachers' => $teachers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'job_id' => 'required|string|unique:users,job_id',
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'phone' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'password' => 'required|string',
            'assignments' => 'nullable|array', // array of { subject_id, class_id }
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name_ar,
                'email' => strtolower($request->job_id) . '@anwaralola.edu.sa',
                'username' => $request->job_id,
                'job_id' => $request->job_id,
                'password' => Hash::make($request->password),
                'role' => 'teacher',
                'name_ar' => $request->name_ar,
                'name_en' => $request->name_en,
                'phone' => $request->phone,
                'photo_url' => $request->photo_url ?: '👨‍🏫',
                'is_active' => true,
            ]);

            if ($request->has('assignments')) {
                foreach ($request->assignments as $assign) {
                    TeacherSubject::create([
                        'teacher_id' => $user->id,
                        'subject_id' => $assign['subject_id'],
                        'class_id' => $assign['class_id'],
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة المعلم وتكليفاته بنجاح',
                'teacher' => $user->load('teacherSubjects')
            ], 201);
        });
    }

    public function show(string $id)
    {
        $teacher = User::teachers()->with('teacherSubjects.subject', 'teacherSubjects.schoolClass')->find($id);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'المعلّم غير موجود'], 404);
        }
        return response()->json(['success' => true, 'teacher' => $teacher]);
    }

    public function update(Request $request, string $id)
    {
        $teacher = User::teachers()->find($id);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'المعلّم غير موجود'], 404);
        }

        $request->validate([
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'phone' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'assignments' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $teacher) {
            $teacher->update([
                'name' => $request->name_ar,
                'name_ar' => $request->name_ar,
                'name_en' => $request->name_en,
                'phone' => $request->phone,
                'photo_url' => $request->photo_url ?: '👨‍🏫',
            ]);

            if ($request->has('assignments')) {
                // Delete old subjects assignments
                TeacherSubject::where('teacher_id', $teacher->id)->delete();

                foreach ($request->assignments as $assign) {
                    TeacherSubject::create([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $assign['subject_id'],
                        'class_id' => $assign['class_id'],
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث بيانات المعلم وتكليفاته بنجاح',
                'teacher' => $teacher->load('teacherSubjects')
            ]);
        });
    }

    public function destroy(string $id)
    {
        $teacher = User::teachers()->find($id);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'المعلّم غير موجود'], 404);
        }

        $teacher->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف المعلم وحسابه بالكامل']);
    }

    /**
     * Get classes taught by the authenticated teacher.
     */
    public function getClasses(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'supervisor' || $user->role === 'admin') {
            $classes = SchoolClass::all();
        } else {
            $classIds = TeacherSubject::where('teacher_id', $user->id)->pluck('class_id')->unique();
            $classes = SchoolClass::whereIn('id', $classIds)->get();
        }

        return response()->json([
            'success' => true,
            'classes' => $classes
        ]);
    }

    /**
     * Get students in a specific class.
     */
    public function getStudents(Request $request, $classId)
    {
        $classroom = SchoolClass::findOrFail($classId);
        $students = Student::where('class_id', $classId)->get();

        $result = $students->map(function($student) {
            $attendance = Attendance::where('student_id', $student->id)
                ->where('record_date', today()->toDateString())
                ->first();

            return [
                'id' => (string) $student->id,
                'name' => $student->name_ar ?? 'غير معروف',
                'parentName' => $student->parentUser ? $student->parentUser->name_ar : 'غير محدد',
                'parentPhone' => $student->parentUser ? $student->parentUser->phone : 'غير محدد',
                'photoUrl' => $student->photo_url,
                'status' => $attendance ? $attendance->status : 'absent',
            ];
        });

        return response()->json($result);
    }

    /**
     * Mark attendance - RESTRICTED TO SUPERVISOR / ADMIN ONLY. TEACHERS FORBIDDEN.
     */
    public function markAttendance(Request $request, $studentId)
    {
        // VERIFICATION: Check if user is a teacher. If yes, disallow (403 Forbidden).
        if ($request->user()->role === 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'المعلم لا يملك صلاحية تحضير الطلاب. التحضير من صلاحيات المشرفة فقط.'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:present,absent',
        ]);

        $student = Student::where('id', $studentId)
            ->orWhere('student_code', $studentId)
            ->firstOrFail();

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $student->id,
                'record_date' => today()->toDateString(),
            ],
            [
                'status' => $request->status,
                'arrival_time' => $request->status === 'present' ? now()->format('H:i:s') : null,
                'created_by' => $request->user()->id,
            ]
        );

        // Notify parent via general notification
        if ($student->parent_id) {
            $statusAr = $request->status === 'present' ? 'حاضراً' : 'غائباً';

            $title = 'تحديث سجل الحضور المدرسي';
            $content = "تم تسجيل الطالب {$student->name_ar} {$statusAr} اليوم.";

            \App\Models\Notification::create([
                'title' => $title,
                'content' => $content,
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الحضور بنجاح', 
            'attendance' => $attendance
        ]);
    }

    /**
     * Get attendance history for a specific classroom by month.
     */
    public function getClassAttendanceHistory(Request $request, $classId)
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->year;
        $month = str_pad($request->month, 2, '0', STR_PAD_LEFT);

        $classroom = SchoolClass::findOrFail($classId);
        $students = Student::where('class_id', $classId)->get();
        $totalStudents = $students->count();

        $attendances = Attendance::with('student')
            ->whereIn('student_id', $students->pluck('id'))
            ->whereYear('record_date', $year)
            ->whereMonth('record_date', $month)
            ->orderBy('record_date', 'desc')
            ->get();

        $dailyRecords = [];
        $groupedByDate = $attendances->groupBy(function($item) {
            return \Carbon\Carbon::parse($item->record_date)->format('Y-m-d');
        });

        foreach ($groupedByDate as $date => $records) {
            $presentCount = $records->where('status', 'present')->count();
            $absentCount = $records->where('status', 'absent')->count();
            
            $attendedStudents = $records->map(function($record) {
                $student = $record->student;
                return [
                    'id' => (string) $record->student_id,
                    'name' => $student ? ($student->name_ar ?? 'غير معروف') : 'غير معروف',
                    'parentName' => $student && $student->parentUser ? $student->parentUser->name_ar : 'غير محدد',
                    'parentPhone' => $student && $student->parentUser ? $student->parentUser->phone : 'غير محدد',
                    'photoUrl' => $student ? $student->photo_url : null,
                    'status' => $record->status,
                ];
            })->values()->all();

            $dailyRecords[] = [
                'date' => $date,
                'totalStudents' => $totalStudents,
                'presentCount' => $presentCount,
                'absentCount' => $absentCount,
                'attendedStudents' => $attendedStudents
            ];
        }

        return response()->json([
            'classId' => (string) $classId,
            'className' => $classroom->name_ar ?? 'غير معروف',
            'dailyRecords' => $dailyRecords
        ]);
    }

    /**
     * Get attendance history for ALL classes for the current month.
     */
    public function getTeacherAttendanceHistory(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'supervisor' || $user->role === 'admin') {
            $classes = SchoolClass::all();
        } elseif ($user->role === 'teacher') {
            $classIds = TeacherSubject::where('teacher_id', $user->id)->pluck('class_id')->unique();
            $classes = SchoolClass::whereIn('id', $classIds)->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $result = [];
        $year = now()->year;
        $month = now()->format('m');

        foreach ($classes as $classroom) {
            $students = Student::where('class_id', $classroom->id)->get();
            $totalStudents = $students->count();

            $attendances = Attendance::with('student')
                ->whereIn('student_id', $students->pluck('id'))
                ->whereYear('record_date', $year)
                ->whereMonth('record_date', $month)
                ->orderBy('record_date', 'desc')
                ->get();

            $dailyRecords = [];
            $groupedByDate = $attendances->groupBy(function($item) {
                return \Carbon\Carbon::parse($item->record_date)->format('Y-m-d');
            });

            foreach ($groupedByDate as $date => $records) {
                $presentCount = $records->where('status', 'present')->count();
                $absentCount = $records->where('status', 'absent')->count();
                
                $attendedStudents = $records->map(function($record) {
                    $student = $record->student;
                    return [
                        'id' => (string) $record->student_id,
                        'name' => $student ? ($student->name_ar ?? 'غير معروف') : 'غير معروف',
                        'parentName' => $student && $student->parentUser ? $student->parentUser->name_ar : 'غير محدد',
                        'parentPhone' => $student && $student->parentUser ? $student->parentUser->phone : 'غير محدد',
                        'photoUrl' => $student ? $student->photo_url : null,
                        'status' => $record->status,
                    ];
                })->values()->all();

                $dailyRecords[] = [
                    'date' => $date,
                    'totalStudents' => $totalStudents,
                    'presentCount' => $presentCount,
                    'absentCount' => $absentCount,
                    'attendedStudents' => $attendedStudents
                ];
            }

            $result[] = [
                'classId' => (string) $classroom->id,
                'className' => $classroom->name_ar ?? 'غير معروف',
                'dailyRecords' => $dailyRecords
            ];
        }

        return response()->json($result);
    }
}
