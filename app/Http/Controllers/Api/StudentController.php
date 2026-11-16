<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Attendance;
use App\Models\Notification;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Services\AcademicYearService;
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

        $yearId = AcademicYearService::resolveId($request);
        $hasYearEnrollments = $yearId && StudentEnrollment::where('academic_year_id', $yearId)->exists();

        $query = Student::with(['schoolClass', 'parentUser']);
        if ($hasYearEnrollments) {
            $query->with(['enrollments' => fn ($eq) => $eq->where('academic_year_id', $yearId)->with('schoolClass')]);
            $query->whereHas('enrollments', function ($eq) use ($yearId, $scopedClassIds, $request) {
                $eq->where('academic_year_id', $yearId);
                if ($scopedClassIds !== null) {
                    $eq->whereIn('class_id', $scopedClassIds);
                }
                if ($request->filled('class_id')) {
                    $cleanClassId = preg_replace('/\D/', '', $request->input('class_id'));
                    if (!empty($cleanClassId)) {
                        $eq->where('class_id', $cleanClassId);
                    }
                }
            });
        } else {
            if ($scopedClassIds !== null) {
                $query->whereIn('class_id', $scopedClassIds);
            }

            // Apply filters
            if ($request->filled('class_id')) {
                $cleanClassId = preg_replace('/\D/', '', $request->input('class_id'));
                if (!empty($cleanClassId)) {
                    $query->where('class_id', $cleanClassId);
                }
            }
        }
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->input('parent_id'));
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $statusParam = $request->input('status');
            $todayDate = today()->toDateString();
            if ($statusParam === 'present') {
                $query->whereHas('attendances', function($aq) use ($todayDate) {
                    $aq->where('record_date', $todayDate)
                       ->whereIn('status', ['present', 'late']);
                });
            } elseif ($statusParam === 'absent') {
                $query->whereDoesntHave('attendances', function($aq) use ($todayDate) {
                    $aq->where('record_date', $todayDate)
                       ->whereIn('status', ['present', 'late']);
                });
            }
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('student_code', 'LIKE', "%{$search}%")
                  ->orWhere('secret_code', 'LIKE', "%{$search}%")
                  ->orWhereHas('parentUser', function($pq) use ($search) {
                      $pq->where('national_id', 'LIKE', "%{$search}%")
                        ->orWhere('phone', 'LIKE', "%{$search}%")
                        ->orWhere('name_ar', 'LIKE', "%{$search}%")
                        ->orWhere('name_en', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Compute accurate status_counts across the full filtered scope (before enrollment_status filter)
        $matchingIds = (clone $query)->pluck('students.id');
        $statusCounts = [
            'all' => $matchingIds->count(),
            'active' => 0,
            'supplementary' => 0,
            'graduated' => 0,
            'withdrawn' => 0,
            'retained' => 0,
        ];
        if ($matchingIds->isNotEmpty()) {
            if ($hasYearEnrollments) {
                $uniqueEnrollments = StudentEnrollment::where('academic_year_id', $yearId)
                    ->whereIn('student_id', $matchingIds)
                    ->orderByDesc('id')
                    ->get(['student_id', 'status'])
                    ->unique('student_id');
                foreach ($uniqueEnrollments as $row) {
                    $st = array_key_exists($row->status, $statusCounts) && $row->status !== 'all'
                        ? $row->status
                        : 'active';
                    $statusCounts[$st]++;
                }
            } else {
                $agg = (clone $query)
                    ->selectRaw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_cnt, SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as withdrawn_cnt')
                    ->first();
                $statusCounts['active'] = (int) ($agg->active_cnt ?? 0);
                $statusCounts['withdrawn'] = (int) ($agg->withdrawn_cnt ?? 0);
            }
        }

        // Apply enrollment_status filter after computing counts
        if ($request->filled('enrollment_status') && $request->input('enrollment_status') !== 'all') {
            $enrollmentStatus = $request->input('enrollment_status');
            if ($hasYearEnrollments) {
                $query->whereHas('enrollments', function ($eq) use ($yearId, $enrollmentStatus) {
                    $eq->where('academic_year_id', $yearId)
                       ->where('status', $enrollmentStatus);
                });
            } else {
                if ($enrollmentStatus === 'active') {
                    $query->where('is_active', true);
                } elseif ($enrollmentStatus === 'withdrawn') {
                    $query->where('is_active', false);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);
        // ترتيب ثابت عند تساوي القيم (منع تكرار/اختفاء صفوف بين الصفحات)
        if ($sortBy !== 'id') $query->orderBy($query->getModel()->getQualifiedKeyName(), $direction);

        // Safe column selection
        $query->select([
            'id',
            'student_code',
            'name_ar',
            'name_en',
            'gender',
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
        $todayAttendance = Attendance::forAcademicYear()
            ->whereIn('student_id', $studentIds)
            ->where('record_date', today()->toDateString())
            ->get()
            ->keyBy('student_id');

        $students = $studentsModels->map(function($student) use ($todayAttendance, $hasYearEnrollments) {
            $attendance = $todayAttendance->get($student->id);
            $enr = $hasYearEnrollments ? $student->enrollments->first() : null;
            $effectiveClass = $enr?->schoolClass ?? $student->schoolClass;
            $effectiveClassId = $enr?->class_id ?? $student->class_id;
            $effectiveTuition = $enr ? (float)$enr->tuition_fee : (float)($student->tuition_fee ?? 0.00);

            return [
                'id' => $student->id,
                'class_id' => $effectiveClassId,
                'student_code' => $student->student_code,
                'name' => $student->name_ar,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'parent_id' => $student->parent_id,
                'grade' => $effectiveClass ? $effectiveClass->grade_ar : '',
                'gradeEn' => $effectiveClass ? $effectiveClass->grade_en : '',
                'section' => $effectiveClass ? $effectiveClass->section_ar : '',
                'sectionEn' => $effectiveClass ? $effectiveClass->section_en : '',
                'parentName' => $student->parentUser ? $student->parentUser->name_ar : '',
                'parentNameEn' => $student->parentUser ? $student->parentUser->name_en : '',
                'parentNationalId' => $student->parentUser ? ($student->parentUser->national_id ?: $student->parentUser->username) : '',
                'phone' => $student->parentUser ? $student->parentUser->phone : '',
                'status' => $attendance ? $attendance->status : 'absent',
                'time' => $attendance ? ($attendance->arrival_time ? substr($attendance->arrival_time, 0, 5) : '--:--') : '--:--',
                'qrCode' => $student->qr_code,
                'photo' => $student->photo_url ?: '👨‍🎓',
                'secret_code' => $student->secret_code,
                'tuition_fee' => $effectiveTuition,
                'previous_balance' => $enr ? (float)($enr->previous_balance ?? 0.00) : 0.00,
                'enrollment_status' => $enr ? $enr->status : ($student->is_active ? 'active' : 'withdrawn'),
                'is_active' => $student->is_active,
                'gender' => $student->gender,
            ];
        });

        return response()->json([
            'success' => true,
            'students' => $students,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'status_counts' => $statusCounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_code' => 'nullable|string',
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'class_id' => 'required|integer',
            'parent_id' => 'required|integer',
            'photo_url' => 'nullable|string',
            'qr_code' => 'nullable|string',
            'secret_code' => 'nullable|string',
            'tuition_fee' => 'nullable|numeric',
            'gender' => 'nullable|in:male,female',
        ]);

        $user = $request->user();
        if ($user && !PermissionService::isClassAllowed($user, 'students', (int)$request->class_id)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإضافة طالب في هذا الفصل الدراسي خارج نطاق صلاحياتك.',
            ], 403);
        }

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

        $studentCode = $request->student_code;
        if (empty($studentCode) || Student::where('student_code', $studentCode)->exists()) {
            $seqCount = Student::where('class_id', $request->class_id)->count() + 1;
            do {
                $studentCode = "2026" . $request->class_id . $seqCount;
                $seqCount++;
            } while (Student::where('student_code', $studentCode)->exists());
        }

        $qrCode = $request->qr_code;
        if (empty($qrCode) || Student::where('qr_code', $qrCode)->exists()) {
            $qrCode = $studentCode;
        }

        $student = Student::create([
            'student_code' => $studentCode,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'class_id' => $request->class_id,
            'parent_id' => $request->parent_id,
            'photo_url' => $photoUrl ?: '👨‍🎓',
            'qr_code' => $qrCode,
            'secret_code' => $request->secret_code,
            'tuition_fee' => $request->tuition_fee ?? 0.00,
            'gender' => $request->gender ?: null,
            'is_active' => true,
        ]);

        if ($yearId = AcademicYearService::resolveId($request)) {
            StudentEnrollment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_year_id' => $yearId,
                ],
                [
                    'class_id' => $student->class_id,
                    'status' => 'active',
                    'tuition_fee' => $student->tuition_fee ?? 0,
                    'secret_code' => $student->secret_code,
                ]
            );
        }

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

        $allowedFields = [
            'student_code',
            'name_ar',
            'name_en',
            'class_id',
            'parent_id',
            'photo_url',
            'qr_code',
            'secret_code',
            'tuition_fee',
            'is_active',
            'gender',
        ];
        $request->validate(['gender' => 'nullable|in:male,female']);
        $updateData = $request->only($allowedFields);

        if ($request->filled('class_id') && !PermissionService::isClassAllowed($user, 'students', (int)$request->class_id)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بنقل الطالب إلى فصل خارج نطاق صلاحياتك'], 403);
        }

        // Handle parent assignment by parent_id or parent_national_id
        if ($request->filled('parent_id')) {
            $updateData['parent_id'] = (int) $request->parent_id;
        } elseif ($request->filled('parent_national_id')) {
            $parentUser = User::where('role', 'parent')
                ->where(function ($q) use ($request) {
                    $q->where('national_id', $request->parent_national_id)
                      ->orWhere('username', $request->parent_national_id);
                })->first();
            if ($parentUser) {
                $updateData['parent_id'] = $parentUser->id;
            }
        }

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

        if ($yearId = AcademicYearService::resolveId($request)) {
            $existingEnrollment = StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year_id', $yearId)
                ->first();

            $newStatus = 'active';
            if ($request->has('is_active') && !$request->boolean('is_active')) {
                $newStatus = 'withdrawn';
            } elseif ($request->filled('enrollment_status')) {
                $newStatus = $request->input('enrollment_status');
            } elseif ($existingEnrollment && in_array($existingEnrollment->status, ['supplementary', 'graduated', 'retained', 'transferred', 'promoted'], true)) {
                $newStatus = $existingEnrollment->status;
            } elseif (!$student->is_active) {
                $newStatus = 'withdrawn';
            }

            StudentEnrollment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_year_id' => $yearId,
                ],
                [
                    'class_id' => $student->class_id,
                    'status' => $newStatus,
                    'tuition_fee' => $student->tuition_fee ?? 0,
                    'secret_code' => $student->secret_code,
                ]
            );
        }

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

        $student->load(['schoolClass', 'parentUser']);

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
        $existing = Attendance::forAcademicYear()
                              ->where('student_id', $student->id)
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
