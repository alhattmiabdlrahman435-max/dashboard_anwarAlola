<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Notification;
use Illuminate\Http\Request;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

class StudentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:students,view', only: ['index', 'show']),
            new Middleware('check.permission:students,create', only: ['store']),
            new Middleware('check.permission:students,update', only: ['update']),
            new Middleware('check.permission:students,delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        $students = $query->with(['schoolClass', 'parentUser'])->get()->map(function($student) {
            // Get today's attendance
            $attendance = Attendance::where('student_id', $student->id)
                ->where('record_date', today()->toDateString())
                ->first();

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
            'students' => $students
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

        $student = Student::create([
            'student_code' => $request->student_code,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'class_id' => $request->class_id,
            'parent_id' => $request->parent_id,
            'photo_url' => $photoUrl ?: '👨‍🎓',
            'qr_code' => $request->qr_code ?: ('ANWAR-' . rand(100000, 999999)),
            'secret_code' => $request->secret_code,
            'tuition_fee' => $request->tuition_fee ?? 10000.00,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الطالب بنجاح',
            'student' => $student
        ], 201);
    }

    public function show(string $id)
    {
        $student = Student::with(['schoolClass', 'parentUser'])->find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }
        return response()->json(['success' => true, 'student' => $student]);
    }

    public function update(Request $request, string $id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
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

        $student->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الطالب بنجاح',
            'student' => $student
        ]);
    }

    public function destroy(string $id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
        }
        $student->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الطالب بنجاح']);
    }

    /**
     * تفاصيل بطاقة الطالب الذكية
     */
    public function card(string $id)
    {
        $student = Student::with(['schoolClass', 'parentUser'])->find($id);
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
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
            if ($parentUser && $parentUser->fcm_token) {
                \App\Services\FcmService::sendNotification($parentUser->fcm_token, $title, $content, [
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
