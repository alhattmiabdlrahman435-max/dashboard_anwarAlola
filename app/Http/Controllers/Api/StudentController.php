<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Notification;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class StudentController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'student_code', 'secret_code', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:students,view', only: ['index', 'show']),
            new Middleware('check.permission:students,create', only: ['store']),
            new Middleware('check.permission:students,update', only: ['update']),
            new Middleware('check.permission:students,delete', only: ['destroy']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->input('parent_id'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('student_code', 'LIKE', "%{$search}%")
                  ->orWhere('secret_code', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe column selection
        $query->select([
            'id',
            'student_code',
            'name_ar',
            'name_en',
            'class_id',
            'parent_id',
            'photo_url',
            'tuition_fee',
            'qr_code',
            'secret_code',
            'is_active',
            'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);
        $studentsModels = $paginator->getCollection();
        $studentIds = $studentsModels->pluck('id')->toArray();

        // Query today's attendance for all matching students in one query
        $todayAttendance = Attendance::whereIn('student_id', $studentIds)
            ->where('record_date', today()->toDateString())
            ->get()
            ->keyBy('student_id');

        $students = $studentsModels->map(function($student) use ($todayAttendance) {
            $attendance = $todayAttendance->get($student->id);

            return [
                'id' => $student->id,
                'student_code' => $student->student_code,
                'name' => $student->name_ar,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'grade' => $student->schoolClass ? $student->schoolClass->grade_ar : '',
                'gradeEn' => $student->schoolClass ? $student->schoolClass->grade_en : '',
                'section' => $student->schoolClass ? $student->schoolClass->section_ar : '',
                'sectionEn' => $student->schoolClass ? $student->schoolClass->section_en : '',
                'parentName' => $student->parentUser ? $student->parentUser->name_ar : '',
                'parentNameEn' => $student->parentUser ? $student->parentUser->name_en : '',
                'parentNationalId' => $student->parentUser ? $student->parentUser->national_id : '',
                'phone' => $student->parentUser ? $student->parentUser->phone : '',
                'status' => $attendance ? $attendance->status : 'absent',
                'time' => $attendance ? ($attendance->arrival_time ? substr($attendance->arrival_time, 0, 5) : '--:--') : '--:--',
                'qrCode' => $student->qr_code,
                'photo' => $student->photo_url ?: '👨‍🎓',
                'secret_code' => $student->secret_code,
                'tuition_fee' => (float)($student->tuition_fee ?? 10000.00),
                'is_active' => $student->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'students' => $students,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_code' => 'required|string|unique:students,student_code',
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'class_id' => 'required|integer',
            'parent_id' => 'required|integer',
            'photo_url' => 'nullable|string',
            'qr_code' => 'nullable|string|unique:students,qr_code',
            'secret_code' => 'nullable|string',
            'tuition_fee' => 'nullable|numeric',
        ]);

        $photoUrl = $request->photo_url;
        if ($photoUrl && preg_match('/^data:image\/(\w+);base64,/', $photoUrl, $type)) {
            $data = substr($photoUrl, strpos($photoUrl, ',') + 1);
            $type = strtolower($type[1]);
            if (in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                $data = str_replace(' ', '+', $data);
                $data = base64_decode($data);
                if ($data !== false) {
                    $filename = time() . '_' . uniqid() . '.' . $type;
                    if (!file_exists(public_path('uploads/avatars'))) {
                        mkdir(public_path('uploads/avatars'), 0755, true);
                    }
                    file_put_contents(public_path('uploads/avatars/' . $filename), $data);
                    $photoUrl = asset('uploads/avatars/' . $filename);
                }
            }
        }

        $qrCode = $request->qr_code;
        if (empty($qrCode)) {
            do {
                $qrCode = 'ANWAR-' . random_int(100000, 999999);
            } while (Student::where('qr_code', $qrCode)->exists());
        }

        $student = Student::create([
            'student_code' => $request->student_code,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'class_id' => $request->class_id,
            'parent_id' => $request->parent_id,
            'photo_url' => $photoUrl ?: '👨‍🎓',
            'qr_code' => $qrCode,
            'secret_code' => $request->secret_code,
            'tuition_fee' => $request->tuition_fee ?? 10000.00,
            'is_active' => true,
        ]);

        if ($student->class_id) {
            $assignments = Assignment::where('class_id', $student->class_id)->get();
            foreach ($assignments as $assignment) {
                AssignmentSubmission::firstOrCreate([
                    'assignment_id' => $assignment->id,
                    'student_id' => $student->id,
                ], [
                    'status' => 'pending',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الطالب بنجاح',
            'student' => $student
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $student = Student::with(['schoolClass', 'parentUser'])->find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }

        $user = $request->user();
        if ($user && $user->role === 'parent') {
            if ($student->parent_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لهذا الطالب'], 403);
            }
        } else {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');
            if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لهذا الطالب خارج فصولك المحددة'], 403);
            }
        }

        return response()->json(['success' => true, 'student' => $student]);
    }

    public function update(Request $request, string $id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');
        if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتحديث بيانات طالب خارج فصولك المحددة'], 403);
        }

        $updateData = $request->all();

        if ($request->has('photo_url')) {
            $photoUrl = $request->photo_url;
            if ($photoUrl && preg_match('/^data:image\/(\w+);base64,/', $photoUrl, $type)) {
                $data = substr($photoUrl, strpos($photoUrl, ',') + 1);
                $type = strtolower($type[1]);
                if (in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    $data = str_replace(' ', '+', $data);
                    $data = base64_decode($data);
                    if ($data !== false) {
                        $filename = time() . '_' . uniqid() . '.' . $type;
                        if (!file_exists(public_path('uploads/avatars'))) {
                            mkdir(public_path('uploads/avatars'), 0755, true);
                        }
                        file_put_contents(public_path('uploads/avatars/' . $filename), $data);
                        $photoUrl = asset('uploads/avatars/' . $filename);
                        $updateData['photo_url'] = $photoUrl;
                    }
                }
            }
        }

        $oldClassId = $student->class_id;
        $student->update($updateData);

        if ($student->class_id && $student->class_id != $oldClassId) {
            $assignments = Assignment::where('class_id', $student->class_id)->get();
            foreach ($assignments as $assignment) {
                AssignmentSubmission::firstOrCreate([
                    'assignment_id' => $assignment->id,
                    'student_id' => $student->id,
                ], [
                    'status' => 'pending',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الطالب بنجاح',
            'student' => $student
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');
        if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بحذف طالب خارج فصولك المحددة'], 403);
        }

        $student->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الطالب بنجاح']);
    }

    /**
     * تفاصيل بطاقة الطالب الذكية
     */
    public function card(Request $request, string $id)
    {
        $student = Student::with(['schoolClass', 'parentUser'])->find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }

        $user = $request->user();
        if ($user && $user->role === 'parent') {
            if ($student->parent_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لبطاقة هذا الطالب'], 403);
            }
        } else {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');
            if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لبطاقة طالب خارج فصولك المحددة'], 403);
            }
        }

        return response()->json([
            'success' => true,
            'student' => $student
        ]);
    }

    /**
     * تسجيل الحضور عند مسح رمز الـ QR (تحديث للمشرف فقط)
     */
    public function scanQr(Request $request, string $id)
    {
        // التحقق من الصلاحية (مشرف أو مدير فقط)
        if ($request->user()->role !== 'supervisor' && $request->user()->role !== 'admin' && $request->user()->role !== 'preparation_supervisor') {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتسجيل حضور الطالب'
            ], 403);
        }

        $student = Student::find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }

        $today = now()->format('Y-m-d');

        // التحقق مما إذا كان قد تم تسجيل الحضور اليوم مسبقاً
        $existing = Attendance::where('student_id', $student->id)
                              ->where('record_date', $today)
                              ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'تم تسجيل حضور الطالب مسبقاً اليوم عند الساعة ' . substr($existing->arrival_time, 0, 5),
                'attendance' => $existing
            ]);
        }

        $attendance = Attendance::create([
            'student_id' => $student->id,
            'record_date' => $today,
            'status' => 'present',
            'arrival_time' => now()->format('H:i:s'),
            'note' => 'تم تسجيل الحضور من قبل: ' . $request->user()->name_ar,
            'created_by' => $request->user()->id
        ]);

        // Notify parent
        if ($student->parent_id) {
            $title = 'تحديث سجل الحضور المدرسي';
            $content = "تم تسجيل حضور الطالب {$student->name_ar} اليوم.";

            Notification::create([
                'title' => $title,
                'content' => $content,
                'type' => 'attendance',
                'is_read' => false,
                'student_id' => $student->id,
            ]);

            // Load parent relation to get the token
            $student->load('parentUser');
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
            'message' => 'تم تسجيل حضور الطالب بنجاح: ' . $student->name_ar,
            'attendance' => $attendance
        ]);
    }
}
