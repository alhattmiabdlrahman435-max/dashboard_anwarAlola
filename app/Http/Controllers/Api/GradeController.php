<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\Request;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class GradeController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'secret_code', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:detailedGrades,view', only: ['detailed', 'getByClassAndSubject', 'getByClass']),
            new Middleware('check.permission:detailedGrades,update', only: ['saveDetailed', 'publishMonthGrades']),
            new Middleware('check.permission:control,view', only: ['control', 'getMidtermControlSheet']),
            new Middleware('check.permission:control,generateSecretCodes', only: ['generateSecretCodes']),
            new Middleware('check.permission:control,enterGrades', only: ['updateControl', 'saveMidtermExamGrade', 'bulkSaveMidtermExamGrades']),
        ];
    }
    /**
     * جلب الدرجات التفصيلية لطالب
     */
    public function detailed(string $studentId)
    {
        $user = request()->user();
        $student = Student::find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'الطالب غير موجود.'
            ], 404);
        }

        // Access Control
        if ($user && $user->role === 'parent') {
            if ($student->parent_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بعرض درجات هذا الطالب.'
                ], 403);
            }
        } elseif ($user && $user->role === 'supervisor') {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
            if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بعرض درجات هذا الطالب.'
                ], 403);
            }
        }

        $gradesQuery = Grade::with('subject')->where('student_id', $studentId);
        $grades = $gradesQuery->get();

        if ($user && $user->role === 'parent') {
            // Get all published period types for this student
            $publishedPeriods = \App\Models\Notification::where('student_id', $studentId)
                ->where('type', 'like', 'grade_published:%')
                ->pluck('type')
                ->toArray();

            $grades = $grades->filter(function($grade) use ($publishedPeriods) {
                $termKey = $grade->term === 1 ? 'term1' : 'term2';
                $monthKey = $grade->month === 0 ? 'final' : ('m' . $grade->month);
                $expectedType = "grade_published:{$termKey}:{$monthKey}";

                return in_array($expectedType, $publishedPeriods);
            });
        }

        $mappedGrades = $grades->map(function($grade) {
            // Map term and month to frontend keys if necessary
            $termKey = $grade->term === 1 ? 'term1' : 'term2';
            $monthKey = $grade->month === 0 ? 'final' : ('m' . $grade->month);

            return [
                'id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'subject' => $grade->subject,
                'term' => $termKey,
                'month' => $monthKey,
                'hw_grade' => $grade->homework,
                'att_grade' => $grade->attendance,
                'beh_grade' => $grade->behavior,
                'oral_grade' => $grade->oral,
                'wrt_grade' => $grade->written,
                'final_exam' => $grade->final_exam,
                'is_control' => $grade->is_control,
                // Calculations mapped for frontend
                'month_total' => $grade->homework + $grade->attendance + $grade->behavior + $grade->oral + $grade->written,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'grades' => $mappedGrades
        ]);
    }

    /**
     * حفظ ورصد الدرجات التفصيلية (حفظ شهري)
     */
    public function saveDetailed(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'term' => 'required|string',
            'month' => 'required|string',
            'hw_grade' => 'nullable|numeric',
            'att_grade' => 'nullable|numeric',
            'beh_grade' => 'nullable|numeric',
            'oral_grade' => 'nullable|numeric',
            'wrt_grade' => 'nullable|numeric',
            'final_exam' => 'nullable|numeric',
            'coursework' => 'nullable|numeric',
        ]);

        $student = Student::findOrFail($request->student_id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك برصد درجات لطالب خارج فصولك المحددة.',
            ], 403);
        }

        // Mapping from string format (term1/term2) to integer (1/2)
        $termVal = ($request->term === 'term2' || $request->term === '2') ? 2 : 1;

        if ($request->month === 'coursework') {
            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $request->student_id,
                    'subject_id' => $request->subject_id,
                    'term' => $termVal,
                    'month' => 0,
                    'is_control' => true,
                ],
                [
                    'written' => $request->coursework,
                ]
            );
        } else {
            // Mapping from month string (m1/m2/m3/final) to integer (1/2/3/0)
            $monthVal = match ($request->month) {
                'm1', '1' => 1,
                'm2', '2' => 2,
                'm3', '3' => 3,
                'final', '0', 0 => 0,
                default => 1,
            };

            $gradeData = [
                'homework' => $request->hw_grade ?: 0,
                'attendance' => $request->att_grade ?: 0,
                'behavior' => $request->beh_grade ?: 0,
                'oral' => $request->oral_grade ?: 0,
                'written' => $request->wrt_grade ?: 0,
            ];
            if ($request->has('final_exam')) {
                $gradeData['final_exam'] = $request->final_exam;
            }

            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $request->student_id,
                    'subject_id' => $request->subject_id,
                    'term' => $termVal,
                    'month' => $monthVal,
                    'is_control' => false,
                ],
                $gradeData
            );
        }

        $grade->load(['student.schoolClass', 'subject']);
        $student = $grade->student;

        if ($student && $student->class_id) {
            $classId = $student->class_id;

            // 1. Get all student IDs in this class
            $studentsInClass = Student::where('class_id', $classId)->get();
            $studentIds = $studentsInClass->pluck('id')->toArray();
            $totalStudentsInClass = count($studentIds);

            // 2. Get subject IDs assigned to this class
            $subjectIds = \App\Models\TeacherSubject::where('class_id', $classId)->pluck('subject_id')->unique()->toArray();
            if (empty($subjectIds)) {
                $subjectIds = \App\Models\Subject::pluck('id')->toArray();
            }
            $totalSubjectsInClass = count($subjectIds);

            // 3. Count existing grade records for these students and subjects for this term/month
            $gradesCount = Grade::whereIn('student_id', $studentIds)
                ->whereIn('subject_id', $subjectIds)
                ->where('term', $termVal)
                ->where('month', $monthVal)
                ->where('is_control', false)
                ->count();

            // 4. Check if all grades are recorded
            if ($gradesCount >= ($totalStudentsInClass * $totalSubjectsInClass)) {
                $className = $student->schoolClass ? ($student->schoolClass->grade_ar . ' - ' . $student->schoolClass->section_ar) : 'غير معروف';
                $monthNames = [
                    'm1' => 'للمحصلة الأولى',
                    'm2' => 'للمحصلة الثانية',
                    'm3' => 'للمحصلة الثالثة',
                    '1' => 'للمحصلة الأولى',
                    '2' => 'للمحصلة الثانية',
                    '3' => 'للمحصلة الثالثة',
                    'final' => 'للاختبار النهائي',
                    '0' => 'للاختبار النهائي',
                ];
                $monthText = $monthNames[$request->month] ?? $request->month;

                $notifTitle = "📊 درجات جاهزة للمراجعة: {$className}";
                $notifContent = "تم اكتمال رصد درجات جميع المواد لجميع الطلاب في {$className} {$monthText} (الترم {$termVal}). يمكنك مراجعتها واعتمادها الآن.";

                $alreadyNotified = \App\Models\Notification::where('title', $notifTitle)
                    ->where('content', $notifContent)
                    ->exists();

                if (!$alreadyNotified) {
                    \App\Models\Notification::create([
                        'title' => $notifTitle,
                        'content' => $notifContent,
                        'type' => 'info',
                        'is_read' => false,
                        'student_id' => null,
                        'class_id' => null,
                        'teacher_id' => null,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رصد الدرجات التفصيلية بنجاح',
            'grade' => $grade
        ]);
    }

    /**
     * إرسال إشعارات مجمعة بدرجات الشهر لأولياء أمور صف معين
     */
    public function publishMonthGrades(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer',
            'term' => 'required|string',
            'month' => 'required|string',
            'student_id' => 'nullable|integer',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'integer',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');

        if ($scopedClassIds !== null && !in_array((int)$request->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإرسال إشعارات درجات هذا الفصل.'
            ], 403);
        }

        // Normalize term and month keys
        $termNorm = ($request->term === 'term2' || $request->term === '2') ? 'term2' : 'term1';
        $monthNorm = $request->month;
        if ($monthNorm === '0' || $monthNorm === 'final') {
            $monthNorm = 'final';
        } elseif ($monthNorm === '1' || $monthNorm === 'm1') {
            $monthNorm = 'm1';
        } elseif ($monthNorm === '2' || $monthNorm === 'm2') {
            $monthNorm = 'm2';
        } elseif ($monthNorm === '3' || $monthNorm === 'm3') {
            $monthNorm = 'm3';
        }

        $query = Student::with('parentUser')->where('class_id', $request->class_id);

        // Targeted publishing: filter by student_id or student_ids if provided
        if ($request->filled('student_id')) {
            $query->where('id', $request->student_id);
        } elseif ($request->filled('student_ids') && is_array($request->student_ids) && count($request->student_ids) > 0) {
            $query->whereIn('id', $request->student_ids);
        }

        $students = $query->get();
        
        $monthNamesMap = [
            'm1' => 'للمحصلة الأولى',
            'm2' => 'للمحصلة الثانية',
            'm3' => 'للمحصلة الثالثة',
            'final' => 'النهائية',
        ];
        $monthName = $monthNamesMap[$monthNorm] ?? ('للمحصلة ' . $monthNorm);

        $sentCount = 0;

        foreach ($students as $student) {
            if ($student->parentUser) {
                // Create database notification with specific type for publication tracking
                $notifRecord = \App\Models\Notification::create([
                    'title' => 'اعتماد درجات جديدة',
                    'content' => 'تم اعتماد درجات ابنكم ' . ($student->name_ar ?? '') . ' ' . $monthName . '. يمكنكم الاطلاع عليها الآن.',
                    'type' => "grade_published:{$termNorm}:{$monthNorm}",
                    'is_read' => false,
                    'student_id' => $student->id,
                ]);

                // Broadcast Realtime event over Reverb WebSocket
                try {
                    event(new \App\Events\BroadcastNotificationCreated($notifRecord));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Reverb broadcast warning: " . $e->getMessage());
                }

                \App\Services\FcmService::sendToUser(
                    $student->parentUser,
                    'اعتماد الدرجات 📊',
                    'تم اعتماد درجات ابنكم ' . ($student->name_ar ?? '') . ' ' . $monthName . '.',
                    [
                        'type' => 'grade',
                        'student_id' => (string)$student->id,
                        'month' => (string)$request->month,
                    ]
                );
                $sentCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال إشعارات الدرجات لـ ' . $sentCount . ' من أولياء الأمور بنجاح.',
        ]);
    }

    /**
     * جلب درجات الكنترول العام
     */
    public function control(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
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

        // Safe Column Selection
        $query->select([
            'id', 'name_ar', 'name_en', 'student_code', 'secret_code', 'class_id', 'created_at'
        ]);

        $query->with(['grades' => function($q) {
            $q->where('is_control', true)->where('month', 0);
        }, 'schoolClass']);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);
        $students = $paginator->getCollection();

        $controlGrades = $students->map(function($student) {
            $mathGrade = $student->grades->firstWhere('subject_id', 1);
            $scienceGrade = $student->grades->firstWhere('subject_id', 2);
            $arabicGrade = $student->grades->firstWhere('subject_id', 3);
            $englishGrade = $student->grades->firstWhere('subject_id', 4);

            $mathVal = $mathGrade ? $mathGrade->final_exam : null;
            $scienceVal = $scienceGrade ? $scienceGrade->final_exam : null;
            $arabicVal = $arabicGrade ? $arabicGrade->final_exam : null;
            $englishVal = $englishGrade ? $englishGrade->final_exam : null;

            $total = ($mathVal ?? 0) + ($scienceVal ?? 0) + ($arabicVal ?? 0) + ($englishVal ?? 0);

            return [
                'id' => $student->id,
                'student_id' => $student->id,
                'student' => [
                    'id' => $student->id,
                    'name_ar' => $student->name_ar,
                    'name_en' => $student->name_en,
                ],
                'secret_code' => $student->secret_code,
                'class_name_ar' => $student->schoolClass ? $student->schoolClass->grade_ar . ' - ' . $student->schoolClass->section_ar : '',
                'class_name_en' => $student->schoolClass ? $student->schoolClass->grade_en . ' - ' . $student->schoolClass->section_en : '',
                'math' => $mathVal,
                'science' => $scienceVal,
                'arabic' => $arabicVal,
                'english' => $englishVal,
                'total' => $total,
            ];
        });

        return response()->json([
            'success' => true,
            'control_grades' => $controlGrades,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    /**
     * تحديث رصد درجات الكنترول لطالب
     */
    public function updateControl(Request $request, string $studentId)
    {
        $request->validate([
            'math' => 'nullable|numeric',
            'science' => 'nullable|numeric',
            'arabic' => 'nullable|numeric',
            'english' => 'nullable|numeric',
        ]);

        $student = Student::findOrFail($studentId);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');
        if ($scopedClassIds !== null && !in_array($student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك برصد درجات الكنترول لطالب خارج فصولك المحددة.',
            ], 403);
        }

        $subjectsMapping = [
            'math' => 1,
            'science' => 2,
            'arabic' => 3,
            'english' => 4
        ];

        foreach ($subjectsMapping as $inputName => $subId) {
            if ($request->has($inputName)) {
                Grade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subId,
                        'term' => 1, // Default to Term 1
                        'month' => 0, // Final Exam indicaiton
                        'is_control' => true
                    ],
                    [
                        'homework' => 0,
                        'attendance' => 0,
                        'behavior' => 0,
                        'oral' => 0,
                        'written' => 0,
                        'final_exam' => $request->$inputName
                    ]
                );
            }
        }

        $student->load('schoolClass');
        if ($student->class_id) {
            $classId = $student->class_id;

            // 1. Get all student IDs in this class
            $studentsInClass = Student::where('class_id', $classId)->get();
            $studentIds = $studentsInClass->pluck('id')->toArray();
            $totalStudentsInClass = count($studentIds);

            // 2. Control subjects are exactly 4
            $subjectIds = [1, 2, 3, 4];
            $totalSubjectsInClass = count($subjectIds);

            // 3. Count existing control grade records
            $gradesCount = Grade::whereIn('student_id', $studentIds)
                ->whereIn('subject_id', $subjectIds)
                ->where('term', 1) // Default to term 1
                ->where('month', 0) // Month 0 for control final exam
                ->where('is_control', true)
                ->count();

            // 4. Check if complete
            if ($gradesCount >= ($totalStudentsInClass * $totalSubjectsInClass)) {
                $className = $student->schoolClass ? ($student->schoolClass->grade_ar . ' - ' . $student->schoolClass->section_ar) : 'غير معروف';
                $notifTitle = "📊 درجات الكنترول جاهزة للمراجعة: {$className}";
                $notifContent = "تم اكتمال رصد درجات الكنترول النهائي لجميع الطلاب في {$className} (الترم 1). يمكنك مراجعتها واعتمادها الآن.";

                $alreadyNotified = \App\Models\Notification::where('title', $notifTitle)
                    ->where('content', $notifContent)
                    ->exists();

                if (!$alreadyNotified) {
                    \App\Models\Notification::create([
                        'title' => $notifTitle,
                        'content' => $notifContent,
                        'type' => 'info',
                        'is_read' => false,
                        'student_id' => null,
                        'class_id' => null,
                        'teacher_id' => null,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رصد درجات الكنترول الرقمي بنجاح'
        ]);
    }

    /**
     * توليد الأرقام السرية للكنترول الرقمي
     */
    public function generateSecretCodes(Request $request)
    {
        $request->validate([
            'prefix' => 'nullable|string',
            'multiplier' => 'required|numeric',
            'offset' => 'required|numeric',
            'modulo' => 'required|numeric',
        ]);

        $prefix = $request->prefix ?: 'SEC-';
        
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }
        $students = $query->get();

        foreach ($students as $student) {
            $reg = $student->id;
            $numVal = ($reg * $request->multiplier + $request->offset) % $request->modulo;
            $code = $prefix . str_pad($numVal, 4, '0', STR_PAD_LEFT);

            $student->update(['secret_code' => $code]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم توليد وتطبيق الأرقام السرية بنجاح لجميع الطلاب'
        ]);
    }

    /**
     * جلب جميع درجات جميع الطلاب في فصل معين (كل المواد)
     */
    public function getByClass(Request $request, string $classId)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');

        if ($scopedClassIds !== null && !in_array((int)$classId, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لدرجات هذا الفصل.'
            ], 403);
        }

        $students = Student::where('class_id', $classId)->get();
        $subjects = \App\Models\Subject::all();

        $result = [];

        foreach ($students as $student) {
            $dbGrades = Grade::with('subject')
                ->where('student_id', $student->id)
                ->where('is_control', false)
                ->get();

            // Build same structure as frontend expects in detailedGrades state
            $gradesMap = [];
            foreach (['term1', 'term2'] as $termKey) {
                $termVal = $termKey === 'term1' ? 1 : 2;
                $gradesMap[$termKey] = [];
                foreach ($subjects as $subject) {
                    $subjectName = $subject->name_ar;
                    $gradesMap[$termKey][$subjectName] = [
                        'm1' => ['homework' => 0, 'attendance' => 0, 'behavior' => 0, 'oral' => 0, 'written' => 0],
                        'm2' => ['homework' => 0, 'attendance' => 0, 'behavior' => 0, 'oral' => 0, 'written' => 0],
                        'm3' => ['homework' => 0, 'attendance' => 0, 'behavior' => 0, 'oral' => 0, 'written' => 0],
                        'finalExam' => 0,
                    ];

                    $termGrades = $dbGrades->filter(fn($g) => $g->term === $termVal && $g->subject && $g->subject->name_ar === $subjectName);

                    foreach ($termGrades as $g) {
                        $monthKey = $g->month === 0 ? null : ('m' . $g->month);
                        if ($monthKey) {
                            $gradesMap[$termKey][$subjectName][$monthKey] = [
                                'homework'   => (float)$g->homework,
                                'attendance' => (float)$g->attendance,
                                'behavior'   => (float)$g->behavior,
                                'oral'       => (float)$g->oral,
                                'written'    => (float)$g->written,
                            ];
                        } else {
                            // month === 0 means final exam
                            $gradesMap[$termKey][$subjectName]['finalExam'] = (float)$g->final_exam;
                        }
                    }
                }
            }

            $result[] = [
                'studentId'   => (string)$student->id,
                'studentName' => $student->name_ar ?? $student->name ?? 'غير معروف',
                'grades'      => $gradesMap,
            ];
        }

        return response()->json([
            'success'  => true,
            'classId'  => (string)$classId,
            'students' => $result,
        ]);
    }

    public function getByClassAndSubject(Request $request, string $classId, string $subjectId)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');

        if ($scopedClassIds !== null && !in_array((int)$classId, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لدرجات هذا الفصل.'
            ], 403);
        }

        $students = Student::where('class_id', $classId)->get();

        $grades = $students->map(function($student) use ($subjectId) {
            $dbGrades = Grade::where('student_id', $student->id)
                ->where('subject_id', $subjectId)
                ->where('is_control', false)
                ->get();

            $termRecords = [];
            for ($term = 1; $term <= 2; $term++) {
                $termGrades = $dbGrades->where('term', $term);
                
                $months = [];
                for ($month = 1; $month <= 3; $month++) {
                    $mGrade = $termGrades->where('month', $month)->first();
                    $months[] = [
                        'monthIndex' => $month,
                        'attendance' => $mGrade ? (float) $mGrade->attendance : 0.0,
                        'behavior' => $mGrade ? (float) $mGrade->behavior : 0.0,
                        'oral' => $mGrade ? (float) $mGrade->oral : 0.0,
                        'homework' => $mGrade ? (float) $mGrade->homework : 0.0,
                        'written' => $mGrade ? (float) $mGrade->written : 0.0,
                        'isSaved' => $mGrade != null,
                    ];
                }

                $finalGrade = $termGrades->where('month', 0)->first();
                $termRecords[$term] = [
                    'termIndex' => $term,
                    'months' => $months,
                    'finalExam' => $finalGrade ? (float) $finalGrade->final_exam : 0.0,
                    'isFinalSaved' => $finalGrade != null,
                ];
            }

            return [
                'studentId' => (string) $student->id,
                'studentName' => $student->name_ar ?? $student->name ?? 'غير معروف',
                'studentPhotoUrl' => $student->photo_url,
                'subjectId' => (string) $subjectId,
                'firstTerm' => $termRecords[1],
                'secondTerm' => $termRecords[2],
            ];
        });

        return response()->json([
            'success' => true,
            'classId' => (string) $classId,
            'subjectId' => (string) $subjectId,
            'grades' => $grades,
        ]);
    }

    /**
     * جلب كشف الكنترول النصفي الشامل لفصل دراسي (مطابق لكشف المدرسة الرسمي)
     */
    public function getMidtermControlSheet(Request $request, string $classId)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');

        if ($scopedClassIds !== null && !in_array((int)$classId, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لكنترول هذا الفصل.'
            ], 403);
        }

        $schoolClass = \App\Models\SchoolClass::with(['gradeLevel', 'subjects'])->find($classId);
        if (!$schoolClass) {
            return response()->json([
                'success' => false,
                'message' => 'الفصل الدراسي غير موجود.'
            ], 404);
        }

        // 1. تحديد المواد المعتمدة للفصل
        $scheduleSubjectIds = \App\Models\Schedule::where('class_id', $classId)->pluck('subject_id')->toArray();
        $scheduleSubjects = \App\Models\Subject::whereIn('id', $scheduleSubjectIds)->get();
        $classSubjects = $schoolClass->subjects->concat($scheduleSubjects)->unique('id')->values();

        // إذا لم تكن هناك مواد مسندة في الجدول، نجلب جميع المواد أو المواد التي لها درجات
        if ($classSubjects->isEmpty()) {
            $classSubjects = \App\Models\Subject::all();
        }

        // ترتيب المواد المعتمد باليمن: (قرآن، إسلامية، لغة عربية، لغة إنجليزي، رياضيات، علوم، اجتماعيات، حاسوب)
        $preferredOrder = ['قرآن', 'إسلامية', 'لغة عربية', 'لغتي', 'لغة إنجليزي', 'إنجليزية', 'رياضيات', 'علوم', 'اجتماعيات', 'حاسوب'];
        $classSubjects = $classSubjects->sortBy(function($sub) use ($preferredOrder) {
            foreach ($preferredOrder as $index => $name) {
                if (str_contains($sub->name_ar, $name)) {
                    return $index;
                }
            }
            return 99;
        })->values();

        // 2. جلب جميع طلاب الفصل
        $students = Student::where('class_id', $classId)
            ->orderBy('name_ar', 'asc')
            ->get(['id', 'student_code', 'secret_code', 'name_ar', 'name_en', 'class_id']);

        $studentIds = $students->pluck('id')->toArray();

        // 3. جلب جميع درجات الفصل للترم الأول
        $allGrades = Grade::whereIn('student_id', $studentIds)
            ->where('term', 1)
            ->get();

        // 4. بناء هيكل الشيت وحساب القيم
        $studentsData = [];

        foreach ($students as $student) {
            $studentGrades = $allGrades->where('student_id', $student->id);
            $subjectsMap = [];
            $studentTotal = 0;
            $presentSubjectsCount = 0;

            foreach ($classSubjects as $subject) {
                $subGrades = $studentGrades->where('subject_id', $subject->id);

                // درجات الأشهر الثلاثة
                $m1Rec = $subGrades->firstWhere('month', 1);
                $m2Rec = $subGrades->firstWhere('month', 2);
                $m3Rec = $subGrades->firstWhere('month', 3);

                $m1Tot = $m1Rec ? ($m1Rec->homework + $m1Rec->attendance + $m1Rec->behavior + $m1Rec->oral + $m1Rec->written) : 0;
                $m2Tot = $m2Rec ? ($m2Rec->homework + $m2Rec->attendance + $m2Rec->behavior + $m2Rec->oral + $m2Rec->written) : 0;
                $m3Tot = $m3Rec ? ($m3Rec->homework + $m3Rec->attendance + $m3Rec->behavior + $m3Rec->oral + $m3Rec->written) : 0;

                // م1: أعمال الفصل محولة إلى 20 درجة: (م1+م2+م3)/15
                $m1Coursework = round(($m1Tot + $m2Tot + $m3Tot) / 15, 2);

                // ن1: درجة الاختبار النصفي من 30 (الأولوية لـ is_control=true)
                $examRec = $subGrades->where('month', 0)->sortByDesc('is_control')->first();
                $n1Exam = ($examRec && $examRec->final_exam !== null) ? (float)$examRec->final_exam : null;

                if ($n1Exam !== null || $m1Coursework > 0) {
                    $presentSubjectsCount++;
                }

                // مج1: مجموع المادة للترم الأول (من 50)
                $maj1Total = round($m1Coursework + ($n1Exam ?? 0), 2);

                $studentTotal += $maj1Total;

                $subjectsMap[$subject->id] = [
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name_ar,
                    'm1' => $m1Coursework, // أعمال الفصل (من 20)
                    'n1' => $n1Exam,       // اختبار النصفي (من 30)
                    'maj1' => $maj1Total,  // المجموع (من 50)
                    'm1_raw' => $m1Tot,
                    'm2_raw' => $m2Tot,
                    'm3_raw' => $m3Tot,
                ];
            }

            $maxTotal = count($classSubjects) * 50;
            $percentage = $maxTotal > 0 ? round(($studentTotal / $maxTotal) * 100, 2) : 0;

            $studentsData[] = [
                'id' => $student->id,
                'student_code' => $student->student_code ?: (string)$student->id,
                'secret_code' => $student->secret_code ?: '—',
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'subjects' => $subjectsMap,
                'total' => $studentTotal,
                'max_total' => $maxTotal,
                'percentage' => $percentage,
                'is_present' => $presentSubjectsCount > 0,
            ];
        }

        // 5. حساب الترتيب (Ranking with tie handling)
        usort($studentsData, function($a, $b) {
            return $b['total'] <=> $a['total'];
        });

        $currentRank = 1;
        for ($i = 0; $i < count($studentsData); $i++) {
            if ($i > 0 && $studentsData[$i]['total'] < $studentsData[$i - 1]['total']) {
                $currentRank = $i + 1;
            }
            $studentsData[$i]['rank'] = $currentRank;
        }

        // 6. الإحصائيات العامة
        $totalStudents = count($studentsData);
        $attendedCount = count(array_filter($studentsData, fn($s) => $s['is_present']));
        $absentCount = $totalStudents - $attendedCount;
        $highestTotal = $totalStudents > 0 ? max(array_column($studentsData, 'total')) : 0;
        $lowestTotal = $totalStudents > 0 ? min(array_column($studentsData, 'total')) : 0;
        $averageTotal = $totalStudents > 0 ? round(array_sum(array_column($studentsData, 'total')) / $totalStudents, 2) : 0;

        return response()->json([
            'success' => true,
            'class' => [
                'id' => $schoolClass->id,
                'name_ar' => $schoolClass->name_ar,
                'name_en' => $schoolClass->name_en,
                'grade_ar' => $schoolClass->grade_ar,
                'section_ar' => $schoolClass->section_ar,
            ],
            'subjects' => $classSubjects->map(fn($s) => [
                'id' => $s->id,
                'name_ar' => $s->name_ar,
                'name_en' => $s->name_en
            ]),
            'students' => $studentsData,
            'statistics' => [
                'total_students' => $totalStudents,
                'attended' => $attendedCount,
                'absent' => $absentCount,
                'highest_total' => $highestTotal,
                'lowest_total' => $lowestTotal,
                'average_total' => $averageTotal,
            ]
        ]);
    }

    /**
     * رصد أو تعديل درجة الاختبار النصفي ن1 (من 30) لطالب في مادة
     */
    public function saveMidtermExamGrade(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'final_exam' => 'required|numeric|min:0|max:30',
            'term'       => 'nullable|integer',
        ]);

        $student = Student::findOrFail($request->student_id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');
        if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك برصد درجات لطالب في هذا الفصل.'
            ], 403);
        }

        $term = $request->input('term', 1);
        $gradeVal = (float)$request->final_exam;

        // الحفظ المزدوج لضمان التوافق مع الكنترول والرصد التفصيلي والتطبيقات
        foreach ([true, false] as $isControl) {
            Grade::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $request->subject_id,
                    'term'       => $term,
                    'month'      => 0, // 0 يعني اختبار نهاية الفصل
                    'is_control' => $isControl,
                ],
                [
                    'homework'   => 0,
                    'attendance' => 0,
                    'behavior'   => 0,
                    'oral'       => 0,
                    'written'    => 0,
                    'final_exam' => $gradeVal,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رصد وحفظ درجة الاختبار بنجاح.',
            'grade' => $gradeVal
        ]);
    }

    /**
     * رصد جماعي لدرجات الاختبار ن1
     */
    public function bulkSaveMidtermExamGrades(Request $request)
    {
        $request->validate([
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|integer',
            'grades.*.subject_id' => 'required|integer',
            'grades.*.final_exam' => 'required|numeric|min:0|max:30',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'control');

        $gradesList = $request->input('grades', []);
        $savedCount = 0;

        foreach ($gradesList as $item) {
            $student = Student::find($item['student_id']);
            if (!$student) continue;

            if ($scopedClassIds !== null && !in_array((int)$student->class_id, $scopedClassIds)) {
                continue;
            }

            $gradeVal = (float)$item['final_exam'];

            foreach ([true, false] as $isControl) {
                Grade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $item['subject_id'],
                        'term'       => 1,
                        'month'      => 0,
                        'is_control' => $isControl,
                    ],
                    [
                        'homework'   => 0,
                        'attendance' => 0,
                        'behavior'   => 0,
                        'oral'       => 0,
                        'written'    => 0,
                        'final_exam' => $gradeVal,
                    ]
                );
            }
            $savedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "تم حفظ درجات {$savedCount} طالب بنجاح.",
            'saved_count' => $savedCount
        ]);
    }
}

