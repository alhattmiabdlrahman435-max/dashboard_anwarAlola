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
            new Middleware('check.permission:grades,view', only: ['detailed', 'control', 'getByClassAndSubject']),
            new Middleware('check.permission:grades,update', only: ['saveDetailed', 'updateControl', 'generateSecretCodes']),
        ];
    }
    /**
     * جلب الدرجات التفصيلية لطالب
     */
    public function detailed(string $studentId)
    {
        $grades = Grade::with('subject')->where('student_id', $studentId)->get()->map(function($grade) {
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
        });

        return response()->json([
            'success' => true,
            'grades' => $grades
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

        return response()->json([
            'success' => true,
            'message' => 'تم رصد الدرجات التفصيلية بنجاح',
            'grade' => $grade
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
                    ];
                }

                $finalGrade = $termGrades->where('month', 0)->first();
                $termRecords[$term] = [
                    'termIndex' => $term,
                    'months' => $months,
                    'finalExam' => $finalGrade ? (float) $finalGrade->final_exam : 0.0,
                ];
            }

            return [
                'studentId' => (string) $student->id,
                'studentName' => $student->name_ar ?? $student->name ?? 'غير معروف',
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

