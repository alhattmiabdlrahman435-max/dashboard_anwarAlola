<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class AttendanceController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'record_date', 'arrival_time', 'status', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:scanner,view', only: ['index']),
            new Middleware('check.permission:scanner,create', only: ['store']),
            new Middleware('check.permission:scanner,update', only: ['update']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'scanner');

        $query = Attendance::with('student');

        if ($scopedClassIds !== null) {
            $query->whereHas('student', function($q) use ($scopedClassIds) {
                $q->whereIn('class_id', $scopedClassIds);
            });
        }

        // Apply filters
        if ($request->filled('date')) {
            $query->where('record_date', $request->input('date'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('class_id')) {
            $cleanClassId = preg_replace('/\D/', '', $request->input('class_id'));
            if (!empty($cleanClassId)) {
                $query->whereHas('student', function($q) use ($cleanClassId) {
                    $q->where('class_id', $cleanClassId);
                });
            }
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('student_code', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'student_id', 'record_date', 'status', 'arrival_time', 'note', 'created_by', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $records = $paginator->getCollection()->map(function($record) {
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
            'attendance' => $records,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
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

        $student = Student::findOrFail($request->student_id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'scanner');
        if ($scopedClassIds !== null && !in_array($student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتحضير طالب خارج فصولك المحددة.',
            ], 403);
        }
        $date = $request->date;
        
        if ($request->user()->role !== 'admin') {
            $isLocked = \Illuminate\Support\Facades\DB::table('attendance_submissions')
                ->where('class_id', $student->class_id)
                ->where('record_date', $date)
                ->exists();
            if ($isLocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'تم إرسال تقرير التحضير بالفعل لهذا اليوم ولا يمكن تعديله. التعديل متاح للمسؤولين فقط.'
                ], 403);
            }
        }

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'record_date' => $date,
            ],
            [
                'status' => $request->status,
                'arrival_time' => $request->arrival_time,
                'note' => $request->note,
                'created_by' => $request->user()->id
            ]
        );

        // Notify parent
        $student = Student::with('parentUser')->find($request->student_id);
        if ($student && $student->parent_id) {
            $statusAr = $request->status === 'present' ? 'حاضراً' : 'غائباً';
            $title = 'تحديث سجل الحضور المدرسي';
            $content = "تم تسجيل الطالب {$student->name_ar} {$statusAr} اليوم.";

            Notification::create([
                'title' => $title,
                'content' => $content,
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);

            // Send FCM Push Notification
            $parentUser = $student->parentUser;
            if ($parentUser) {
                \App\Services\FcmService::sendToUser($parentUser, $title, $content, [
                    'type' => 'attendance',
                    'student_id' => $student->id
                ]);
            }
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

        $student = Student::findOrFail($attendance->student_id);
        $date = $attendance->record_date;
        
        if ($request->user()->role !== 'admin') {
            $isLocked = \Illuminate\Support\Facades\DB::table('attendance_submissions')
                ->where('class_id', $student->class_id)
                ->where('record_date', $date)
                ->exists();
            if ($isLocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'تم إرسال تقرير التحضير بالفعل لهذا اليوم ولا يمكن تعديله. التعديل متاح للمسؤولين فقط.'
                ], 403);
            }
        }

        $attendance->update([
            'status' => $request->status,
            'arrival_time' => $request->arrival_time,
            'note' => $request->note,
        ]);

        // Notify parent
        $student = Student::with('parentUser')->find($attendance->student_id);
        if ($student && $student->parent_id) {
            $statusAr = $request->status === 'present' ? 'حاضراً' : 'غائباً';
            $title = 'تحديث سجل الحضور المدرسي';
            $content = "تم تعديل حالة حضور الطالب {$student->name_ar} إلى {$statusAr} اليوم.";

            Notification::create([
                'title' => $title,
                'content' => $content,
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);

            // Send FCM Push Notification
            $parentUser = $student->parentUser;
            if ($parentUser) {
                \App\Services\FcmService::sendToUser($parentUser, $title, $content, [
                    'type' => 'attendance',
                    'student_id' => $student->id
                ]);
            }
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
