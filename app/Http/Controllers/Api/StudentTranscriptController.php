<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentPriorRecord;
use App\Models\Subject;
use Illuminate\Http\Request;

class StudentTranscriptController extends Controller
{
    public function show(Request $request, $studentId)
    {
        $student = Student::with('schoolClass')->findOrFail($studentId);
        $filterYearId = $request->query('academic_year_id');

        $enrollments = StudentEnrollment::with(['academicYear', 'schoolClass'])
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('academic_year_id');

        $gradeYearIds = Grade::where('student_id', $student->id)
            ->whereNotNull('academic_year_id')
            ->distinct()
            ->pluck('academic_year_id');

        $paymentYearIds = Payment::where('student_id', $student->id)
            ->whereNotNull('academic_year_id')
            ->distinct()
            ->pluck('academic_year_id');

        $allYearIds = $enrollments->keys()
            ->merge($gradeYearIds)
            ->merge($paymentYearIds)
            ->unique()
            ->values();

        if ($filterYearId && $filterYearId !== 'all') {
            $allYearIds = $allYearIds->filter(fn ($id) => (int) $id === (int) $filterYearId)->values();
        }

        $yearsMap = AcademicYear::whereIn('id', $allYearIds)
            ->orderByDesc('name')
            ->get();

        $subjectsById = Subject::all()->keyBy('id');
        $classesById = SchoolClass::all()->keyBy('id');

        $yearRecords = [];
        foreach ($yearsMap as $yr) {
            $enr = $enrollments->get($yr->id);
            $cls = $enr?->schoolClass ?? ($student->class_id ? $classesById->get($student->class_id) : null);

            $grades = Grade::forAcademicYear($yr->id)
                ->where('student_id', $student->id)
                ->where('is_control', false)
                ->get();

            $subjectIds = $grades->pluck('subject_id')->unique()->values();
            $subjectRows = [];
            $grandSum = 0.0;
            $grandMax = 0.0;

            foreach ($subjectIds as $subId) {
                $subj = $subjectsById->get($subId);
                $termTotals = [1 => null, 2 => null];

                foreach ([1, 2] as $tVal) {
                    $subGrades = $grades->where('subject_id', $subId)->where('term', $tVal);
                    if ($subGrades->isEmpty()) {
                        continue;
                    }
                    $finalRec = $subGrades->where('month', 0)->first();
                    if ($finalRec && $finalRec->coursework !== null) {
                        $cw = (float) $finalRec->coursework;
                    } else {
                        $mSum = $subGrades->whereIn('month', [1, 2, 3])->sum(function ($g) {
                            return (float) $g->homework + (float) $g->attendance + (float) $g->behavior + (float) $g->oral + (float) $g->written;
                        });
                        $cw = round($mSum / 15, 2);
                    }
                    $fe = $finalRec ? (float) ($finalRec->final_exam ?? 0) : 0.0;
                    $termScore = round($cw + $fe, 2);
                    $termTotals[$tVal] = $termScore;
                    $grandSum += $termScore;
                    $grandMax += 50.0;
                }

                $subjMax = ($termTotals[1] !== null ? 50 : 0) + ($termTotals[2] !== null ? 50 : 0);
                $subjTotal = ($termTotals[1] ?? 0) + ($termTotals[2] ?? 0);

                $subjectRows[] = [
                    'subject_id' => $subId,
                    'subject_name' => $subj ? ($subj->name_ar ?? $subj->name ?? "مادة #{$subId}") : "مادة #{$subId}",
                    'term1' => $termTotals[1],
                    'term2' => $termTotals[2],
                    'total' => round($subjTotal, 2),
                    'max' => $subjMax,
                ];
            }

            $tuitionFee = (float) ($enr ? $enr->tuition_fee : ($student->tuition_fee ?? 0));
            $previousBalance = (float) ($enr ? ($enr->previous_balance ?? 0) : 0);
            $totalDue = round($tuitionFee + $previousBalance, 2);
            $totalPaid = (float) Payment::forAcademicYear($yr->id)->where('student_id', $student->id)->sum('amount');
            $remaining = round($totalDue - $totalPaid, 2);

            $yearRecords[] = [
                'academic_year_id' => $yr->id,
                'academic_year_name' => $yr->name,
                'is_current' => (bool) $yr->is_current,
                'year_status' => $yr->status,
                'enrollment_status' => $enr?->status ?? 'active',
                'class_name' => $cls ? "{$cls->grade_ar} - {$cls->section_ar}" : '-',
                'overall_percentage' => $grandMax > 0 ? round(($grandSum / $grandMax) * 100, 2) : null,
                'grand_total' => round($grandSum, 2),
                'grand_max' => $grandMax,
                'subjects' => $subjectRows,
                'financial' => [
                    'tuition_fee' => $tuitionFee,
                    'previous_balance' => $previousBalance,
                    'total_due' => $totalDue,
                    'total_paid' => $totalPaid,
                    'remaining' => $remaining,
                ],
            ];
        }

        $priorRecords = StudentPriorRecord::where('student_id', $student->id)
            ->orderBy('academic_year_label')
            ->get();

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'student_code' => $student->student_code,
                'name_ar' => $student->name_ar,
                'name_en' => $student->name_en,
                'class_name' => $student->schoolClass
                    ? "{$student->schoolClass->grade_ar} - {$student->schoolClass->section_ar}"
                    : '-',
            ],
            'years' => $yearRecords,
            'prior_records' => $priorRecords,
        ]);
    }

    public function storePriorRecord(Request $request, $studentId)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بإضافة سجل دراسي سابق.'], 403);
        }

        $student = Student::findOrFail($studentId);

        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'academic_year_label' => 'required|string|max:50',
            'grade_name' => 'required|string|max:100',
            'term_label' => 'nullable|string|max:80',
            'total_score' => 'nullable|numeric|min:0',
            'max_score' => 'nullable|numeric|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'result_status' => 'nullable|string|max:40',
            'subject_grades' => 'nullable|array',
            'subject_grades.*.subject' => 'required_with:subject_grades|string|max:120',
            'subject_grades.*.score' => 'required_with:subject_grades|numeric|min:0',
            'subject_grades.*.max_score' => 'nullable|numeric|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $totalScore = $validated['total_score'] ?? null;
        $maxScore = $validated['max_score'] ?? null;
        $percentage = $validated['percentage'] ?? null;

        if ($percentage === null && $totalScore !== null && $maxScore !== null && (float) $maxScore > 0) {
            $percentage = round(((float) $totalScore / (float) $maxScore) * 100, 2);
        }

        $record = StudentPriorRecord::create([
            'student_id' => $student->id,
            'school_name' => trim($validated['school_name']),
            'academic_year_label' => trim($validated['academic_year_label']),
            'grade_name' => trim($validated['grade_name']),
            'term_label' => $validated['term_label'] ?? null,
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'result_status' => $validated['result_status'] ?? 'ناجح',
            'subject_grades' => $validated['subject_grades'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة السجل الدراسي السابق بنجاح.',
            'prior_record' => $record,
        ], 201);
    }

    public function destroyPriorRecord(Request $request, $studentId, $recordId)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بحذف سجل دراسي سابق.'], 403);
        }

        $record = StudentPriorRecord::where('student_id', $studentId)->findOrFail($recordId);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف السجل الدراسي السابق بنجاح.',
        ]);
    }
}
