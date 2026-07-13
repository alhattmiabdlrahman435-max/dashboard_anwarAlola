<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\Request;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

class GradeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:grades,view', only: ['detailed', 'control', 'getByClassAndSubject', 'getByClass']),
            new Middleware('check.permission:grades,update', only: ['saveDetailed', 'updateControl', 'generateSecretCodes']),
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
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');
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
            'hw_grade' => 'numeric',
            'att_grade' => 'numeric',
            'beh_grade' => 'numeric',
            'oral_grade' => 'numeric',
            'wrt_grade' => 'numeric',
            'final_exam' => 'nullable|numeric',
        ]);

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

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'subject_id' => $request->subject_id,
                'term' => $termVal,
                'month' => $monthVal,
                'is_control' => false,
            ],
            [
                'homework' => $request->hw_grade ?: 0,
                'attendance' => $request->att_grade ?: 0,
                'behavior' => $request->beh_grade ?: 0,
                'oral' => $request->oral_grade ?: 0,
                'written' => $request->wrt_grade ?: 0,
                'final_exam' => $request->final_exam,
            ]
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
                    'm1' => 'للشهر الأول',
                    'm2' => 'للشهر الثاني',
                    'm3' => 'للشهر الثالث',
                    '1' => 'للشهر الأول',
                    '2' => 'للشهر الثاني',
                    '3' => 'للشهر الثالث',
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
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');

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
            'm1' => 'للشهر الأول',
            'm2' => 'للشهر الثاني',
            'm3' => 'للشهر الثالث',
            'final' => 'النهائية',
        ];
        $monthName = $monthNamesMap[$monthNorm] ?? ('للشهر ' . $monthNorm);

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

                // Send FCM
                if ($student->parentUser->fcm_token) {
                    \App\Services\FcmService::sendNotification(
                        $student->parentUser->fcm_token,
                        'اعتماد الدرجات 📊',
                        'تم اعتماد درجات ابنكم ' . ($student->name_ar ?? '') . ' ' . $monthName . '.',
                        [
                            'type' => 'grade',
                            'student_id' => (string)$student->id,
                            'month' => (string)$request->month,
                        ]
                    );
                }
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
    public function control(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        $students = $query->with(['grades' => function($q) {
            $q->where('is_control', true)->where('month', 0);
        }])->get();

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
                'math' => $mathVal,
                'science' => $scienceVal,
                'arabic' => $arabicVal,
                'english' => $englishVal,
                'total' => $total,
            ];
        });

        return response()->json([
            'success' => true,
            'control_grades' => $controlGrades
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
        $students = Student::all();

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
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');

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
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');

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
}

