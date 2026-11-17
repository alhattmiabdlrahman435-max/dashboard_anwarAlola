<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Services\AcademicYearService;
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
            new Middleware('check.permission:detailedGrades,update', only: ['saveDetailed', 'publishMonthGrades', 'clearSheet', 'copySheet', 'clearGradeLevel']),
            new Middleware('check.permission:control,view', only: ['control']),
            new Middleware('check.permission:control,generateSecretCodes', only: ['generateSecretCodes']),
            new Middleware('check.permission:control,enterGrades', only: ['updateControl']),
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

        $gradesQuery = Grade::with('subject')
            ->forAcademicYear()
            ->where('student_id', $studentId)
            ->where('is_control', false);
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
                'coursework' => $grade->coursework,
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
            'student_id' => 'required|integer|exists:students,id',
            'subject_id' => 'required|integer|exists:subjects,id',
            'term' => 'required|string|in:term1,term2,1,2',
            'month' => 'required|string|in:m1,m2,m3,final,1,2,3,0',
            'hw_grade' => 'numeric|between:0,15',
            'att_grade' => 'numeric|between:0,15',
            'beh_grade' => 'numeric|between:0,10',
            'oral_grade' => 'numeric|between:0,10',
            'wrt_grade' => 'numeric|between:0,50',
            'final_exam' => 'nullable|numeric|between:0,30',
            'coursework' => 'nullable|numeric|between:0,20',
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

        // Mapping from month string (m1/m2/m3/final) to integer (1/2/3/0)
        $monthVal = match ($request->month) {
            'm1', '1' => 1,
            'm2', '2' => 2,
            'm3', '3' => 3,
            'final', '0', 0 => 0,
            default => 1,
        };

        $yearId = AcademicYearService::resolveId($request);

        $updatePayload = [
            'homework' => $request->hw_grade ?: 0,
            'attendance' => $request->att_grade ?: 0,
            'behavior' => $request->beh_grade ?: 0,
            'oral' => $request->oral_grade ?: 0,
            'written' => $request->wrt_grade ?: 0,
        ];
        if ($request->has('final_exam')) {
            $updatePayload['final_exam'] = $request->final_exam;
        }
        if ($request->has('coursework')) {
            $updatePayload['coursework'] = $request->coursework;
        }

        $grade = Grade::updateOrCreate(
            [
                'academic_year_id' => $yearId,
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'term' => $termVal,
                'month' => $monthVal,
                'is_control' => false,
            ],
            $updatePayload
        );

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
            $gradesCount = Grade::forAcademicYear($yearId)
                ->whereIn('student_id', $studentIds)
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

        $students = Student::with('parentUser')->where('class_id', $request->class_id)->get();
        
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
                \App\Models\Notification::create([
                    'title' => 'اعتماد درجات جديدة',
                    'content' => 'تم اعتماد درجات ابنكم ' . ($student->name_ar ?? '') . ' ' . $monthName . '. يمكنكم الاطلاع عليها الآن.',
                    'type' => "grade_published:{$termNorm}:{$monthNorm}",
                    'is_read' => false,
                    'student_id' => $student->id,
                ]);

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
        // ترتيب ثابت عند تساوي القيم (منع تكرار/اختفاء صفوف بين الصفحات)
        if ($sortBy !== 'id') $query->orderBy($query->getModel()->getQualifiedKeyName(), $direction);

        // Safe Column Selection
        $query->select([
            'id', 'name_ar', 'name_en', 'student_code', 'secret_code', 'class_id', 'created_at'
        ]);

        $query->with(['grades' => function($q) {
            $q->forAcademicYear()->where('is_control', true)->where('month', 0);
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

        $yearId = AcademicYearService::resolveId($request);

        foreach ($subjectsMapping as $inputName => $subId) {
            if ($request->has($inputName)) {
                Grade::updateOrCreate(
                    [
                        'academic_year_id' => $yearId,
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
            $gradesCount = Grade::forAcademicYear($yearId)
                ->whereIn('student_id', $studentIds)
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

        $yearId = AcademicYearService::resolveId($request);
        $enrolledIds = null;
        if ($yearId) {
            $enrolledIds = StudentEnrollment::where('academic_year_id', $yearId)
                ->where('class_id', $classId)
                ->pluck('student_id');
        }

        if ($enrolledIds !== null && $enrolledIds->isNotEmpty()) {
            $students = Student::whereIn('id', $enrolledIds)->get();
        } else {
            $students = Student::where('class_id', $classId)->get();
        }

        $subjects = \App\Models\Subject::all();

        $result = [];

        foreach ($students as $student) {
            $dbGrades = Grade::with('subject')
                ->forAcademicYear($yearId)
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
                        'coursework' => null,
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
                            // month === 0 means final exam & term coursework
                            $gradesMap[$termKey][$subjectName]['finalExam'] = (float)$g->final_exam;
                            $gradesMap[$termKey][$subjectName]['coursework'] = $g->coursework !== null ? (float)$g->coursework : null;
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

        $yearId = AcademicYearService::resolveId($request);
        $enrolledIds = null;
        if ($yearId) {
            $enrolledIds = StudentEnrollment::where('academic_year_id', $yearId)
                ->where('class_id', $classId)
                ->pluck('student_id');
        }

        if ($enrolledIds !== null && $enrolledIds->isNotEmpty()) {
            $students = Student::whereIn('id', $enrolledIds)->get();
        } else {
            $students = Student::where('class_id', $classId)->get();
        }

        $grades = $students->map(function($student) use ($subjectId, $yearId) {
            $dbGrades = Grade::forAcademicYear($yearId)
                ->where('student_id', $student->id)
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
                    'coursework' => ($finalGrade && $finalGrade->coursework !== null) ? (float) $finalGrade->coursework : null,
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
     * ترحيل المحصلة الشهرية (م1 + م2 + م3 ÷ 15 = من 20) إلى سجل المحصلة النهائية للفصل
     */
    public function transferCoursework(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'term' => 'required|string|in:term1,term2,1,2',
            'subject_id' => 'nullable|integer|exists:subjects,id',
        ]);

        $user = $request->user();
        $classId = (int) $request->class_id;
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بترحيل درجات هذا الفصل.',
            ], 403);
        }

        $termVal = ($request->term === 'term2' || $request->term === '2') ? 2 : 1;
        $yearId = AcademicYearService::resolveId($request);

        $students = Student::where('class_id', $classId)->get(['id']);
        $subjectIds = $request->filled('subject_id')
            ? [(int) $request->subject_id]
            : \App\Models\TeacherSubject::where('class_id', $classId)->pluck('subject_id')->unique()->toArray();

        if (empty($subjectIds)) {
            $subjectIds = \App\Models\Subject::pluck('id')->toArray();
        }

        $transferredCount = 0;

        foreach ($students as $student) {
            foreach ($subjectIds as $subId) {
                $monthlyGrades = Grade::forAcademicYear($yearId)
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subId)
                    ->where('term', $termVal)
                    ->where('is_control', false)
                    ->whereIn('month', [1, 2, 3])
                    ->get();

                $sum300 = $monthlyGrades->sum(function ($g) {
                    return (float)$g->homework + (float)$g->attendance + (float)$g->behavior + (float)$g->oral + (float)$g->written;
                });

                $coursework = min(20, max(0, round($sum300 / 15, 2)));

                $existingFinal = Grade::forAcademicYear($yearId)
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subId)
                    ->where('term', $termVal)
                    ->where('month', 0)
                    ->where('is_control', false)
                    ->first();

                if ($existingFinal) {
                    $existingFinal->update(['coursework' => $coursework]);
                } else {
                    Grade::create([
                        'academic_year_id' => $yearId,
                        'student_id' => $student->id,
                        'subject_id' => $subId,
                        'term' => $termVal,
                        'month' => 0,
                        'is_control' => false,
                        'homework' => 0,
                        'attendance' => 0,
                        'behavior' => 0,
                        'oral' => 0,
                        'written' => 0,
                        'coursework' => $coursework,
                        'final_exam' => 0,
                    ]);
                }

                $transferredCount++;
            }
        }

        $termLabel = $termVal === 1 ? 'الترم الأول' : 'الترم الثاني';
        return response()->json([
            'success' => true,
            'transferred_count' => $transferredCount,
            'message' => "تم ترحيل المحصلة (من 20) لـ {$transferredCount} سجل في {$termLabel} بنجاح.",
        ]);
    }

    /**
     * إرسال النتائج النهائية / الفصلية إلى أولياء الأمور
     */
    public function sendResultsToParents(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'scope' => 'required|string|in:term1,term2,yearly',
            'passing_score' => 'nullable|numeric|between:1,100',
        ]);

        $user = $request->user();
        $classId = (int) $request->class_id;
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإرسال نتائج هذا الفصل.',
            ], 403);
        }

        $yearId = AcademicYearService::resolveId($request);
        $scope = $request->scope;
        $passingPct = (float) ($request->input('passing_score', 50));

        $schoolClass = \App\Models\SchoolClass::find($classId);
        $classLabel = $schoolClass ? "{$schoolClass->grade_ar} - {$schoolClass->section_ar}" : '';

        $students = Student::where('class_id', $classId)->get();
        $subjectIds = \App\Models\TeacherSubject::where('class_id', $classId)->pluck('subject_id')->unique()->toArray();
        if (empty($subjectIds)) {
            $subjectIds = \App\Models\Subject::pluck('id')->toArray();
        }
        $subjectsCount = max(1, count($subjectIds));
        $maxPerSubject = $scope === 'yearly' ? 100 : 50;
        $maxTotal = $subjectsCount * $maxPerSubject;

        $rankedList = [];
        foreach ($students as $student) {
            $grades = Grade::forAcademicYear($yearId)
                ->where('student_id', $student->id)
                ->whereIn('subject_id', $subjectIds)
                ->where('is_control', false)
                ->get();

            $sumTotal = 0.0;
            $termsToCalc = $scope === 'yearly' ? [1, 2] : [$scope === 'term1' ? 1 : 2];

            foreach ($subjectIds as $subId) {
                foreach ($termsToCalc as $tVal) {
                    $subGrades = $grades->where('subject_id', $subId)->where('term', $tVal);
                    $finalRec = $subGrades->where('month', 0)->first();
                    if ($finalRec && $finalRec->coursework !== null) {
                        $cw = (float) $finalRec->coursework;
                    } else {
                        $mSum = $subGrades->whereIn('month', [1, 2, 3])->sum(function ($g) {
                            return (float)$g->homework + (float)$g->attendance + (float)$g->behavior + (float)$g->oral + (float)$g->written;
                        });
                        $cw = round($mSum / 15, 2);
                    }
                    $fe = $finalRec ? (float) ($finalRec->final_exam ?? 0) : 0.0;
                    $sumTotal += ($cw + $fe);
                }
            }

            $sumTotal = round($sumTotal, 2);
            $pct = $maxTotal > 0 ? round(($sumTotal / $maxTotal) * 100, 2) : 0;
            $rankedList[] = [
                'student' => $student,
                'total' => $sumTotal,
                'percentage' => $pct,
                'passed' => $pct >= $passingPct,
            ];
        }

        usort($rankedList, fn($a, $b) => $b['total'] <=> $a['total']);

        $scopeLabel = match ($scope) {
            'term1' => 'نصف العام (الترم الأول)',
            'term2' => 'الترم الثاني',
            default => 'نهاية العام الدراسي',
        };

        $sentCount = 0;
        foreach ($rankedList as $idx => $entry) {
            $student = $entry['student'];
            if (!$student->parent_id) {
                continue;
            }
            $rank = $idx + 1;
            $pct = $entry['percentage'];
            $estimate = $pct >= 90 ? 'ممتاز' : ($pct >= 80 ? 'جيد جداً' : ($pct >= 65 ? 'جيد' : ($pct >= 50 ? 'مقبول' : 'ضعيف')));
            $statusAr = $entry['passed'] ? 'ناجح' : 'راسب';

            \App\Models\Notification::create([
                'user_id' => $student->parent_id,
                'student_id' => $student->id,
                'sender_id' => $user ? $user->id : null,
                'type' => 'grade',
                'title' => "إشعار نتيجة {$scopeLabel} — {$student->name_ar}",
                'body' => "السيد ولي أمر الطالب/ـة {$student->name_ar} ({$classLabel}):\n"
                        . "المجموع: {$entry['total']} / {$maxTotal} | النسبة: {$pct}% | التقدير: {$estimate} | الترتيب: {$rank} | الحالة: {$statusAr}.",
                'is_read' => false,
                'sent_at' => now(),
            ]);
            $sentCount++;
        }

        return response()->json([
            'success' => true,
            'sent_count' => $sentCount,
            'message' => $sentCount > 0
                ? "تم إرسال نتائج {$scopeLabel} لـ {$sentCount} ولي أمر بنجاح."
                : 'لا يوجد أولياء أمور مرتبطون بطلاب هذا الفصل.',
        ]);
    }

    /** يحوّل مدخلات الترم والشهر إلى القيم الرقمية المخزنة */
    private function sheetKeys(Request $request): array
    {
        $term = ($request->term === 'term2' || $request->term === '2') ? 2 : 1;
        $month = match ((string) $request->month) {
            'm1', '1' => 1, 'm2', '2' => 2, 'm3', '3' => 3, default => 0,
        };
        return [$term, $month];
    }

    /** يتحقق من أن المستخدم إدارة مخوّلة بالمسح/النقل وأن الصف ضمن صلاحياته */
    private function denySheetActionIfUnauthorized(Request $request, int $classId)
    {
        $user = $request->user();
        if (!$user || $user->role === 'teacher') {
            return response()->json(['success' => false, 'message' => 'مسح أو نقل الكشف متاح للإدارة فقط.'], 403);
        }
        $scoped = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scoped !== null && !in_array($classId, array_map('intval', $scoped), true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بالتعديل على درجات هذا الصف.'], 403);
        }
        return null;
    }

    /** يجلب معرّفات طلاب صف أو مجموعة صفوف في العام الدراسي المحدد (باحترام قيود العام عند وجودها) */
    private function classStudentIdsForYear(int|array $classIds, ?int $yearId)
    {
        $ids = is_array($classIds) ? $classIds : [$classIds];
        if ($yearId && StudentEnrollment::where('academic_year_id', $yearId)->exists()) {
            return StudentEnrollment::where('academic_year_id', $yearId)
                ->whereIn('class_id', $ids)
                ->pluck('student_id');
        }
        return Student::whereIn('class_id', $ids)->pluck('id');
    }

    /** POST /grades/clear-sheet — مسح كل درجات مادة في صف لشهر وترم محددين */
    public function clearSheet(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer|exists:classes,id',
            'subject_id' => 'required|integer|exists:subjects,id',
            'term' => 'required|string|in:term1,term2,1,2',
            'month' => 'required|string|in:m1,m2,m3,1,2,3',
        ]);
        if ($deny = $this->denySheetActionIfUnauthorized($request, (int) $request->class_id)) {
            return $deny;
        }
        [$term, $month] = $this->sheetKeys($request);
        $yearId = AcademicYearService::resolveId($request);
        $studentIds = $this->classStudentIdsForYear((int) $request->class_id, $yearId);
        $deleted = Grade::forAcademicYear($yearId)
            ->whereIn('student_id', $studentIds)
            ->where('subject_id', $request->subject_id)
            ->where('term', $term)->where('month', $month)
            ->where('is_control', false)
            ->delete();

        return response()->json(['success' => true, 'deleted' => $deleted, 'message' => "تم مسح درجات $deleted طالب من الكشف."]);
    }

    /** POST /grades/copy-sheet — نسخ (أو نقل) درجات كشف مادة إلى كشف مادة أخرى لنفس الصف والشهر والترم */
    public function copySheet(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer|exists:classes,id',
            'from_subject_id' => 'required|integer|exists:subjects,id',
            'to_subject_id' => 'required|integer|exists:subjects,id|different:from_subject_id',
            'term' => 'required|string|in:term1,term2,1,2',
            'month' => 'required|string|in:m1,m2,m3,1,2,3',
            'move' => 'sometimes|boolean',
        ]);
        if ($deny = $this->denySheetActionIfUnauthorized($request, (int) $request->class_id)) {
            return $deny;
        }
        [$term, $month] = $this->sheetKeys($request);
        $yearId = AcademicYearService::resolveId($request);
        $studentIds = $this->classStudentIdsForYear((int) $request->class_id, $yearId);

        $sources = Grade::forAcademicYear($yearId)
            ->whereIn('student_id', $studentIds)
            ->where('subject_id', $request->from_subject_id)
            ->where('term', $term)->where('month', $month)
            ->where('is_control', false)->get();

        $count = 0;
        \DB::transaction(function () use ($sources, $request, $term, $month, $yearId, &$count) {
            foreach ($sources as $src) {
                Grade::updateOrCreate(
                    [
                        'academic_year_id' => $yearId,
                        'student_id' => $src->student_id,
                        'subject_id' => $request->to_subject_id,
                        'term' => $term,
                        'month' => $month,
                        'is_control' => false,
                    ],
                    [
                        'homework' => $src->homework,
                        'attendance' => $src->attendance,
                        'behavior' => $src->behavior,
                        'oral' => $src->oral,
                        'written' => $src->written,
                    ]
                );
                $count++;
                if ($request->boolean('move')) {
                    $src->delete();
                }
            }
        });

        $verb = $request->boolean('move') ? 'نقل' : 'نسخ';
        return response()->json(['success' => true, 'count' => $count, 'message' => "تم $verb درجات $count طالب إلى الكشف الجديد."]);
    }

    /** POST /grades/clear-grade-level — مسح جميع درجات صف دراسي كامل بكل شعبه ومواده وأشهره (للمدير فقط) */
    public function clearGradeLevel(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'مسح درجات صف دراسي كامل متاح لمدير النظام فقط.'], 403);
        }

        $request->validate([
            'grade_ar' => 'required|string|max:120',
            'include_control' => 'sometimes|boolean',
        ]);

        $gradeAr = trim((string) $request->input('grade_ar'));
        $classIds = \App\Models\SchoolClass::where('grade_ar', $gradeAr)->pluck('id')->toArray();
        if (empty($classIds)) {
            return response()->json(['success' => false, 'message' => "لم يتم العثور على شعب للصف ({$gradeAr})."], 404);
        }

        $yearId = AcademicYearService::resolveId($request);
        $studentIds = $this->classStudentIdsForYear($classIds, $yearId)->unique()->values();

        $query = Grade::forAcademicYear($yearId)->whereIn('student_id', $studentIds);
        if (!$request->boolean('include_control')) {
            $query->where('is_control', false);
        }
        $deleted = $query->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'students_count' => $studentIds->count(),
            'grade_ar' => $gradeAr,
            'message' => "تم مسح {$deleted} سجل درجة لطلاب ({$gradeAr}) في العام الدراسي المحدد.",
        ]);
    }
}

