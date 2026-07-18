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

use App\Services\PermissionService;

class TeacherController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:teachers,view', only: ['index', 'show']),
            new Middleware('check.permission:teachers,create', only: ['store']),
            new Middleware('check.permission:teachers,update', only: ['update']),
            new Middleware('check.permission:teachers,delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'teachers');

        $query = User::teachers()->with('teacherSubjects.subject', 'teacherSubjects.schoolClass');
        if ($scopedClassIds !== null) {
            $query->whereHas('teacherSubjects', function($q) use ($scopedClassIds) {
                $q->whereIn('class_id', $scopedClassIds);
            });
        }

        $teachers = $query->get()->map(function($t) {
            return [
                'id' => $t->id,
                'job_id' => $t->job_id,
                'name_ar' => $t->name_ar,
                'name_en' => $t->name_en,
                'phone' => $t->phone,
                'address' => $t->address,
                'photo_url' => $t->photo_url ?: '👨‍🏫',
                'email' => null,
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
            'phone' => 'required|string',
            'address' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'assignments' => 'nullable|array', // array of { subject_id, class_id }
        ]);

        try {
            return DB::transaction(function () use ($request) {
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

                $user = User::create([
                    'name' => $request->name_ar,
                    'username' => $request->job_id,
                    'job_id' => $request->job_id,
                    'national_id' => $request->job_id,
                    'password' => Hash::make($request->phone),
                    'role' => 'teacher',
                    'name_ar' => $request->name_ar,
                    'name_en' => $request->name_en,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'photo_url' => $photoUrl ?: '👨‍🏫',
                    'is_active' => true,
                ]);

                if ($request->has('assignments')) {
                    foreach ($request->assignments as $assign) {
                        // التحقق من تعارض الإسناد مع معلمين آخرين
                        $exists = TeacherSubject::where('class_id', $assign['class_id'])
                            ->where('subject_id', $assign['subject_id'])
                            ->whereNotNull('teacher_id')
                            ->first();
                        if ($exists) {
                            $className = SchoolClass::find($assign['class_id'])->name_ar ?? 'الفصل';
                            $subjectName = \App\Models\Subject::find($assign['subject_id'])->name_ar ?? 'المادة';
                            $otherTeacher = User::find($exists->teacher_id)->name_ar ?? 'معلم آخر';
                            
                            throw new \Exception("المادة ({$subjectName}) في الفصل ({$className}) مسندة بالفعل للمعلم ({$otherTeacher}). يرجى إلغاء تكليفه أولاً.");
                        }

                        TeacherSubject::create([
                            'teacher_id' => $user->id,
                            'subject_id' => $assign['subject_id'],
                            'class_id' => $assign['class_id'],
                        ]);

                        // Send notification to the teacher
                        $subject = \App\Models\Subject::find($assign['subject_id']);
                        $cls = SchoolClass::find($assign['class_id']);

                        if ($subject && $cls) {
                            $className = $cls->grade_ar . ' - ' . $cls->section_ar;
                            $subjectName = $subject->name_ar;

                            $title = '➕ تكليف تدريس جديد';
                            $body = "تم تكليفك بتدريس مادة ({$subjectName}) للفصل ({$className}).";

                            \App\Models\Notification::create([
                                'title' => $title,
                                'content' => $body,
                                'type' => 'general',
                                'is_read' => false,
                                'teacher_id' => $user->id,
                            ]);

                            \App\Services\FcmService::sendToUser(
                                $user,
                                $title . ' 📅',
                                $body,
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
                    'message' => 'تم إضافة المعلم وتكليفاته بنجاح',
                    'teacher' => $user->load('teacherSubjects')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
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
            'address' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'assignments' => 'nullable|array',
        ]);

        try {
            return DB::transaction(function () use ($request, $teacher) {
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

                $updateData = [
                    'name' => $request->name_ar,
                    'name_ar' => $request->name_ar,
                    'name_en' => $request->name_en,
                    'phone' => $request->phone,
                    'address' => $request->address,
                ];

                if ($photoUrl) {
                    $updateData['photo_url'] = $photoUrl;
                }

                // إذا تغير رقم الجوال، نحدث كلمة المرور أيضاً
                if ($request->phone && $request->phone !== $teacher->phone) {
                    $updateData['password'] = Hash::make($request->phone);
                }

                $teacher->update($updateData);

                if ($request->has('assignments')) {
                    // Get old assignments keys
                    $oldAssignments = TeacherSubject::where('teacher_id', $teacher->id)->get();
                    $oldKeys = $oldAssignments->map(function($a) {
                        return $a->class_id . '-' . $a->subject_id;
                    })->toArray();

                    // التحقق من تعارض الإسناد مع معلمين آخرين قبل المضي قدماً
                    foreach ($request->assignments as $assign) {
                        $exists = TeacherSubject::where('class_id', $assign['class_id'])
                            ->where('subject_id', $assign['subject_id'])
                            ->where('teacher_id', '!=', $teacher->id)
                            ->whereNotNull('teacher_id')
                            ->first();
                        if ($exists) {
                            $className = SchoolClass::find($assign['class_id'])->name_ar ?? 'الفصل';
                            $subjectName = \App\Models\Subject::find($assign['subject_id'])->name_ar ?? 'المادة';
                            $otherTeacher = User::find($exists->teacher_id)->name_ar ?? 'معلم آخر';
                            
                            throw new \Exception("المادة ({$subjectName}) في الفصل ({$className}) مسندة بالفعل للمعلم ({$otherTeacher}). يرجى إلغاء تكليفه أولاً.");
                        }
                    }

                    // Delete old subjects assignments
                    TeacherSubject::where('teacher_id', $teacher->id)->delete();

                    foreach ($request->assignments as $assign) {
                        TeacherSubject::create([
                            'teacher_id' => $teacher->id,
                            'subject_id' => $assign['subject_id'],
                            'class_id' => $assign['class_id'],
                        ]);

                        $key = $assign['class_id'] . '-' . $assign['subject_id'];
                        if (!in_array($key, $oldKeys)) {
                            // This is a newly added teaching assignment!
                            $subject = \App\Models\Subject::find($assign['subject_id']);
                            $cls = SchoolClass::find($assign['class_id']);
                            
                            if ($subject && $cls) {
                                $className = $cls->grade_ar . ' - ' . $cls->section_ar;
                                $subjectName = $subject->name_ar;

                                $title = '➕ تكليف تدريس جديد';
                                $body = "تم تكليفك بتدريس مادة ({$subjectName}) للفصل ({$className}).";

                                // Create database notification
                                \App\Models\Notification::create([
                                    'title' => $title,
                                    'content' => $body,
                                    'type' => 'general',
                                    'is_read' => false,
                                    'teacher_id' => $teacher->id,
                                ]);

                                // Send push notification via FCM
                                \App\Services\FcmService::sendToUser(
                                    $teacher,
                                    $title . ' 📅',
                                    $body,
                                    [
                                        'type' => 'weekly_schedule',
                                        'class_id' => (string)$cls->id
                                    ]
                                );
                            }
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'تم تحديث بيانات المعلم وتكليفاته بنجاح',
                    'teacher' => $teacher->load('teacherSubjects')
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
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
            $classes = SchoolClass::withCount('students')->get();
        } elseif ($user->role === 'preparation_supervisor') {
            $classIds = \App\Models\SupervisorClass::where('supervisor_id', $user->id)->pluck('class_id')->unique();
            $classes = SchoolClass::whereIn('id', $classIds)->withCount('students')->get();
        } else {
            $classIds = TeacherSubject::where('teacher_id', $user->id)->pluck('class_id')->unique();
            $classes = SchoolClass::whereIn('id', $classIds)->withCount('students')->get();
            
            foreach ($classes as $class) {
                $subjectNames = TeacherSubject::where('teacher_id', $user->id)
                    ->where('class_id', $class->id)
                    ->with('subject')
                    ->get()
                    ->pluck('subject.name_ar')
                    ->filter()
                    ->unique()
                    ->values()
                    ->toArray();
                
                $class->subjects_list = $subjectNames;
            }
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
        $date = $request->input('date', today()->toDateString());

        $isLocked = false;
        if ($request->user()->role !== 'admin') {
            $isLocked = \Illuminate\Support\Facades\DB::table('attendance_submissions')
                ->where('class_id', $classId)
                ->where('record_date', $date)
                ->exists();
        }

        $result = $students->map(function($student) use ($date, $isLocked) {
            $attendance = Attendance::where('student_id', $student->id)
                ->where('record_date', $date)
                ->first();

            return [
                'id' => (string) $student->id,
                'name' => $student->name_ar ?? 'غير معروف',
                'parentName' => $student->parentUser ? $student->parentUser->name_ar : 'غير محدد',
                'parentPhone' => $student->parentUser ? $student->parentUser->phone : 'غير محدد',
                'photoUrl' => $student->photo_url,
                'status' => $attendance ? $attendance->status : 'pending',
                'isLocked' => $isLocked,
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
        // VERIFICATION: Only admin, supervisor, and preparation_supervisor can mark attendance
        if (!in_array($request->user()->role, ['admin', 'supervisor', 'preparation_supervisor'])) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتحضير الطلاب. التحضير من صلاحيات الإدارة ومشرفة التحضير فقط.'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:present,absent',
        ]);

        $student = Student::where('id', $studentId)
            ->orWhere('student_code', $studentId)
            ->firstOrFail();

        $date = today()->toDateString();
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
            'message' => 'تم تسجيل الحضور بنجاح', 
            'attendance' => $attendance
        ]);
    }

    /**
     * Submit bulk attendance for a class and lock it.
     */
    public function submitClassAttendance(Request $request, $classId)
    {
        // VERIFICATION: Check if user is allowed to submit attendance
        if (!in_array($request->user()->role, ['admin', 'supervisor', 'preparation_supervisor'])) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتحضير الطلاب. التحضير من صلاحيات الإدارة ومشرفة التحضير فقط.'
            ], 403);
        }

        $request->validate([
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|integer',
            'attendance.*.status' => 'required|in:present,absent',
        ]);

        $date = today()->toDateString();

        // Check if already submitted/locked
        $alreadySubmitted = \Illuminate\Support\Facades\DB::table('attendance_submissions')
            ->where('class_id', $classId)
            ->where('record_date', $date)
            ->exists();

        if ($alreadySubmitted && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'تم إرسال تقرير التحضير بالفعل لهذا اليوم لهذا الفصل ولا يمكن إعادة إرساله.'
            ], 400);
        }

        try {
            return DB::transaction(function () use ($request, $classId, $date) {
                foreach ($request->attendance as $record) {
                    $student = Student::findOrFail($record['student_id']);
                    
                    // Verify student belongs to this class
                    if ($student->class_id != $classId) {
                        throw new \Exception("الطالب {$student->name_ar} لا ينتمي لهذا الفصل.");
                    }

                    $attendance = Attendance::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'record_date' => $date,
                        ],
                        [
                            'status' => $record['status'],
                            'arrival_time' => $record['status'] === 'present' ? now()->format('H:i:s') : null,
                            'created_by' => $request->user()->id,
                        ]
                    );

                    // Notify parent
                    if ($student->parent_id) {
                        $statusAr = $record['status'] === 'present' ? 'حاضراً' : 'غائباً';
                        $title = 'تحديث سجل الحضور المدرسي';
                        $content = "تم تسجيل الطالب {$student->name_ar} {$statusAr} اليوم.";

                        \App\Models\Notification::create([
                            'title' => $title,
                            'content' => $content,
                            'type' => 'attendance',
                            'is_read' => false,
                            'student_id' => $student->id,
                        ]);

                        $student->load('parentUser');
                        $parentUser = $student->parentUser;
                        if ($parentUser) {
                            \App\Services\FcmService::sendToUser($parentUser, $title, $content, [
                                'type' => 'attendance',
                                'student_id' => $student->id
                            ]);
                        }
                    }
                }

                // Create submission record
                \Illuminate\Support\Facades\DB::table('attendance_submissions')->updateOrInsert(
                    [
                        'class_id' => $classId,
                        'record_date' => $date,
                    ],
                    [
                        'submitted_by' => $request->user()->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'تم إنهاء وإرسال تقرير حضور الطلاب بنجاح.'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
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
        } elseif ($user->role === 'preparation_supervisor') {
            $classIds = \App\Models\SupervisorClass::where('supervisor_id', $user->id)->pluck('class_id')->unique();
            $classes = SchoolClass::whereIn('id', $classIds)->get();
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

    /**
     * Get supervisor reports / stats dynamically from database.
     */
    public function getSupervisorReports(Request $request)
    {
        // Support filtering by month (e.g. YYYY-MM)
        $month = $request->input('month');

        $today = now()->format('Y-m-d');
        $totalStudents = Student::count();
        
        $presentToday = Attendance::where('record_date', $today)->where('status', 'present')->count();
        $absentToday = Attendance::where('record_date', $today)->where('status', 'absent')->count();
        $unmarkedToday = max(0, $totalStudents - ($presentToday + $absentToday));

        // Average attendance calculation over all recorded days
        $totalDaysQuery = Attendance::select('record_date')->distinct();
        if ($month) {
            $totalDaysQuery->where('record_date', 'like', $month . '%');
        }
        $totalDays = $totalDaysQuery->count();

        if ($totalDays > 0) {
            $totalPresentQuery = Attendance::where('status', 'present');
            if ($month) {
                $totalPresentQuery->where('record_date', 'like', $month . '%');
            }
            $totalPresent = $totalPresentQuery->count();
            $totalPossible = $totalStudents * $totalDays;
            $averageAttendance = $totalPossible > 0 ? round(($totalPresent / $totalPossible) * 100, 1) : 100.0;
        } else {
            $averageAttendance = 100.0;
        }

        // Weekly trend (last 5 days)
        $weeklyTrend = [];
        for ($i = 4; $i >= 0; $i--) {
            $date = now()->subDays($i);
            if ($date->isWeekend()) {
                continue;
            }
            $dateStr = $date->toDateString();
            $pCount = Attendance::where('record_date', $dateStr)->where('status', 'present')->count();
            $pct = $totalStudents > 0 ? round(($pCount / $totalStudents) * 100, 1) : 100.0;
            $weeklyTrend[] = [
                'date' => $dateStr,
                'attendancePercentage' => $pct
            ];
        }

        // Student stats reports
        $studentReports = [];
        $students = Student::all();
        foreach ($students as $student) {
            $pQuery = Attendance::where('student_id', $student->id)->where('status', 'present');
            $aQuery = Attendance::where('student_id', $student->id)->where('status', 'absent');

            if ($month) {
                $pQuery->where('record_date', 'like', $month . '%');
                $aQuery->where('record_date', 'like', $month . '%');
            }

            $pCount = $pQuery->count();
            $aCount = $aQuery->count();

            $studentReports[] = [
                'id' => (string) $student->id,
                'name' => $student->name_ar ?? 'غير معروف',
                'nameEn' => $student->name_en ?? '',
                'civilId' => $student->student_code ?? '',
                'presentCount' => $pCount,
                'absentCount' => $aCount,
                'photoUrl' => $student->photo_url,
            ];
        }

        return response()->json([
            'totalStudents' => $totalStudents,
            'presentToday' => $presentToday,
            'absentToday' => $absentToday,
            'unmarkedToday' => $unmarkedToday,
            'averageAttendance' => $averageAttendance,
            'weeklyTrend' => $weeklyTrend,
            'studentReports' => $studentReports,
        ]);
    }

    /**
     * جلب المواد التي يدرسها المعلم لصف دراسي محدد
     */
    public function getSubjectsByClass(Request $request, $classId)
    {
        $user = $request->user();
        
        $subjectIds = TeacherSubject::where('teacher_id', $user->id)
            ->where('class_id', $classId)
            ->pluck('subject_id')
            ->unique();
            
        $subjects = \App\Models\Subject::whereIn('id', $subjectIds)->get();

        return response()->json([
            'success' => true,
            'subjects' => $subjects
        ]);
    }

    /**
     * جلب الجدول الدراسي الأسبوعي للمعلم
     */
    public function getSchedule(Request $request)
    {
        $user = $request->user();
        
        // Find teacher's assigned subjects and classes
        $assignments = TeacherSubject::where('teacher_id', $user->id)->get();
        $classIds = $assignments->pluck('class_id')->unique()->toArray();
        $subjectIds = $assignments->pluck('subject_id')->unique()->toArray();
        
        // Fetch all schedules matching the classes
        $schedules = \App\Models\Schedule::with(['schoolClass', 'subject'])
            ->whereIn('class_id', $classIds)
            ->whereIn('subject_id', $subjectIds)
            ->get();
            
        $days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
        $scheduleData = [];
        
        foreach ($days as $day) {
            $scheduleData[$day] = array_fill(0, 7, [
                'subject_name' => '',
                'class_name' => '',
                'startTime' => '',
                'endTime' => '',
            ]);
        }
        
        $defaultTimings = [
            ['start' => '08:00', 'end' => '08:45'],
            ['start' => '08:45', 'end' => '09:30'],
            ['start' => '09:45', 'end' => '10:30'],
            ['start' => '10:30', 'end' => '11:15'],
            ['start' => '11:30', 'end' => '12:15'],
            ['start' => '12:15', 'end' => '01:00'],
            ['start' => '01:00', 'end' => '01:45'],
        ];
        
        foreach ($schedules as $sch) {
            $day = strtolower($sch->day_of_week);
            $periodIdx = $sch->period - 1; // 0-indexed
            
            if (isset($scheduleData[$day]) && $periodIdx >= 0 && $periodIdx < 7) {
                $hasAssignment = $assignments->where('class_id', $sch->class_id)
                                             ->where('subject_id', $sch->subject_id)
                                             ->isNotEmpty();
                                             
                if ($hasAssignment) {
                    $timings = $periodIdx < count($defaultTimings) 
                        ? $defaultTimings[$periodIdx] 
                        : ['start' => '00:00', 'end' => '00:00'];
                        
                    $scheduleData[$day][$periodIdx] = [
                        'subject_name' => $sch->subject ? $sch->subject->name_ar : '',
                        'class_name' => $sch->schoolClass ? ($sch->schoolClass->grade_ar . ' - ' . $sch->schoolClass->section_ar) : '',
                        'startTime' => $timings['start'],
                        'endTime' => $timings['end'],
                    ];
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'schedule' => $scheduleData
        ]);
    }
}
