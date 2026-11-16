<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearPromotionController extends Controller
{
    /**
     * معاينة ترحيل الطلاب من عام دراسي إلى عام جديد مع التوصية التلقائية
     */
    public function preview(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'صلاحية الترحيل متاحة للمسؤول فقط.'], 403);
        }

        $request->validate([
            'from_year_id' => 'required|exists:academic_years,id',
            'to_year_id' => 'required|exists:academic_years,id|different:from_year_id',
            'class_id' => 'nullable|integer|exists:classes,id',
            'passing_score' => 'nullable|numeric|between:1,100',
            'subject_pass_score' => 'nullable|numeric|between:1,100',
            'max_supplementary_subjects' => 'nullable|integer|min:0|max:10',
        ]);

        $fromYearId = (int) $request->from_year_id;
        $toYearId = (int) $request->to_year_id;
        $passingPct = (float) ($request->input('passing_score', 50));
        $subjectPassPct = (float) ($request->input('subject_pass_score', $passingPct));
        $maxSuppSubjects = (int) ($request->input('max_supplementary_subjects', 2));

        $orderedIds = ArchiveController::orderedClassIds();
        $classesQuery = SchoolClass::query();
        if (!empty($orderedIds)) {
            $classesQuery->orderByRaw('FIELD(id, ' . implode(',', array_map('intval', $orderedIds)) . ')');
        }
        $allClasses = $classesQuery->get(['id', 'grade_ar', 'section_ar', 'branch']);

        // Build ordered unique grades list to find the next grade for any class
        $orderedGrades = [];
        foreach ($allClasses as $cls) {
            if (!in_array($cls->grade_ar, $orderedGrades, true)) {
                $orderedGrades[] = $cls->grade_ar;
            }
        }

        $findNextClassId = function (?SchoolClass $currentClass) use ($allClasses, $orderedGrades) {
            if (!$currentClass) return null;
            $idx = array_search($currentClass->grade_ar, $orderedGrades, true);
            if ($idx === false || $idx >= count($orderedGrades) - 1) {
                return null; // Final grade -> graduate
            }
            $nextGrade = $orderedGrades[$idx + 1];
            $sameSection = $allClasses->first(fn($c) => $c->grade_ar === $nextGrade && $c->section_ar === $currentClass->section_ar);
            if ($sameSection) return $sameSection->id;
            // لا توجد نفس الشعبة في الصف التالي: نفضّل شعبة من نفس الفرع (بنين/بنات)
            // حتى لا تُرحَّل شعبة بنات إلى شعبة بنين (مثل: العاشر د ← الثاني الثانوي أ).
            // آخر شعبة من نفس الفرع أقرب ترتيباً (د ← ج).
            if ($currentClass->branch) {
                $sameBranch = $allClasses->last(fn($c) => $c->grade_ar === $nextGrade && $c->branch === $currentClass->branch);
                if ($sameBranch) return $sameBranch->id;
            }
            $firstInNext = $allClasses->first(fn($c) => $c->grade_ar === $nextGrade);
            return $firstInNext?->id;
        };

        // Resolve students enrolled in source year
        $enrollments = StudentEnrollment::where('academic_year_id', $fromYearId)->get()->keyBy('student_id');
        $studentsQuery = Student::query();
        if ($enrollments->isNotEmpty()) {
            $studentsQuery->whereIn('id', $enrollments->keys());
        }
        if ($request->filled('class_id')) {
            $filterClassId = (int) $request->class_id;
            if ($enrollments->isNotEmpty()) {
                $matchingIds = $enrollments->where('class_id', $filterClassId)->keys();
                $studentsQuery->whereIn('id', $matchingIds);
            } else {
                $studentsQuery->where('class_id', $filterClassId);
            }
        }
        $students = $studentsQuery->orderBy('name_ar')->get();

        $targetEnrollmentsCount = StudentEnrollment::where('academic_year_id', $toYearId)->count();
        $paymentsByStudent = Payment::forAcademicYear($fromYearId)
            ->selectRaw('student_id, SUM(amount) as total_paid')
            ->groupBy('student_id')
            ->pluck('total_paid', 'student_id');

        $classesById = $allClasses->keyBy('id');
        $subjectsById = Subject::all()->keyBy('id');
        $items = [];

        foreach ($students as $student) {
            $enr = $enrollments->get($student->id);
            $sourceClassId = $enr ? $enr->class_id : $student->class_id;
            $sourceClass = $sourceClassId ? $classesById->get($sourceClassId) : null;
            $nextClassId = $findNextClassId($sourceClass);

            // Calculate yearly average % and subject-level pass/fail (including second_round_score)
            $grades = Grade::forAcademicYear($fromYearId)
                ->where('student_id', $student->id)
                ->where('is_control', false)
                ->get();

            $percentage = null;
            $failedSubjects = [];
            if ($grades->isNotEmpty()) {
                $subjectIds = $grades->pluck('subject_id')->unique();
                $sumTotal = 0.0;
                $gradedTermSlots = 0;
                foreach ($subjectIds as $subId) {
                    $subjSum = 0.0;
                    $subjSlots = 0;
                    $secondRound = null;
                    foreach ([1, 2] as $tVal) {
                        $subGrades = $grades->where('subject_id', $subId)->where('term', $tVal);
                        if ($subGrades->isEmpty()) {
                            continue;
                        }
                        $gradedTermSlots++;
                        $subjSlots++;
                        $finalRec = $subGrades->where('month', 0)->first();
                        if ($finalRec && $finalRec->second_round_score !== null) {
                            $secondRound = (float) $finalRec->second_round_score;
                        }
                        if ($finalRec && $finalRec->coursework !== null) {
                            $cw = (float) $finalRec->coursework;
                        } else {
                            $mSum = $subGrades->whereIn('month', [1, 2, 3])->sum(function ($g) {
                                return (float)$g->homework + (float)$g->attendance + (float)$g->behavior + (float)$g->oral + (float)$g->written;
                            });
                            $cw = round($mSum / 15, 2);
                        }
                        $fe = $finalRec ? (float) ($finalRec->final_exam ?? 0) : 0.0;
                        $subjSum += ($cw + $fe);
                    }
                    if ($subjSlots > 0) {
                        $subjMax = $subjSlots * 50;
                        $effectiveSubjScore = $secondRound !== null ? max($subjSum, $secondRound) : $subjSum;
                        $sumTotal += $effectiveSubjScore;
                        $subjPct = round(($effectiveSubjScore / $subjMax) * 100, 2);
                        if ($subjPct < $subjectPassPct) {
                            $subjObj = $subjectsById->get($subId);
                            $failedSubjects[] = [
                                'subject_id' => $subId,
                                'subject_name' => $subjObj ? ($subjObj->name_ar ?? $subjObj->name ?? "مادة #{$subId}") : "مادة #{$subId}",
                                'score' => round($effectiveSubjScore, 2),
                                'max' => $subjMax,
                                'percentage' => $subjPct,
                                'second_round_score' => $secondRound,
                            ];
                        }
                    }
                }
                if ($gradedTermSlots > 0) {
                    $maxTotal = $gradedTermSlots * 50;
                    $percentage = round(($sumTotal / $maxTotal) * 100, 2);
                }
            }

            $sourceTuition = (float) ($enr ? $enr->tuition_fee : ($student->tuition_fee ?? 0));
            $sourcePrevBal = (float) ($enr ? ($enr->previous_balance ?? 0) : 0);
            $paidInSource = (float) ($paymentsByStudent->get($student->id) ?? 0);
            $arrears = max(0.0, round(($sourceTuition + $sourcePrevBal) - $paidInSource, 2));

            if (!$student->is_active || ($enr && $enr->status === 'withdrawn')) {
                $recommendedAction = 'withdraw';
                $recommendedClassId = null;
            } elseif (count($failedSubjects) > 0 && count($failedSubjects) <= $maxSuppSubjects && ($percentage === null || $percentage >= ($passingPct - 15))) {
                $recommendedAction = 'supplementary';
                $recommendedClassId = $nextClassId ?? $sourceClassId;
            } elseif (($percentage !== null && $percentage < $passingPct) || count($failedSubjects) > $maxSuppSubjects) {
                $recommendedAction = 'retain';
                $recommendedClassId = $sourceClassId;
            } elseif ($nextClassId === null && $sourceClass !== null) {
                $recommendedAction = 'graduate';
                $recommendedClassId = null;
            } else {
                $recommendedAction = 'promote';
                $recommendedClassId = $nextClassId;
            }

            $items[] = [
                'student_id' => $student->id,
                'student_code' => $student->student_code,
                'name_ar' => $student->name_ar,
                'source_class_id' => $sourceClassId,
                'source_class_name' => $sourceClass ? "{$sourceClass->grade_ar} - {$sourceClass->section_ar}" : '-',
                'percentage' => $percentage,
                // طالب بلا أي درجات في العام المصدر: الإجراء المقترح له افتراضي وليس مبنياً على نتيجة — يحتاج مراجعة يدوية
                'no_grades' => $percentage === null,
                'failed_subjects' => $failedSubjects,
                'recommended_action' => $recommendedAction,
                'target_class_id' => $recommendedClassId,
                'tuition_fee' => $sourceTuition,
                'previous_balance' => $arrears,
                'paid_in_source' => $paidInSource,
            ];
        }

        return response()->json([
            'success' => true,
            'target_existing_enrollments' => $targetEnrollmentsCount,
            'classes' => $allClasses->map(fn($c) => [
                'id' => $c->id,
                'name' => "{$c->grade_ar} - {$c->section_ar}",
            ])->values(),
            'items' => $items,
        ]);
    }

    /**
     * تنفيذ ترحيل الطلاب إلى العام الدراسي الهدف
     */
    public function execute(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'صلاحية الترحيل متاحة للمسؤول فقط.'], 403);
        }

        $request->validate([
            'from_year_id' => 'required|exists:academic_years,id',
            'to_year_id' => 'required|exists:academic_years,id|different:from_year_id',
            'items' => 'required|array|min:1',
            'items.*.student_id' => 'required|exists:students,id',
            'items.*.action' => 'required|in:promote,retain,supplementary,graduate,withdraw',
            'items.*.target_class_id' => 'nullable|exists:classes,id',
            'items.*.tuition_fee' => 'nullable|numeric|min:0',
            'items.*.previous_balance' => 'nullable|numeric|min:0',
            'carryover_arrears' => 'nullable|boolean',
            'close_source_year' => 'nullable|boolean',
            'set_target_current' => 'nullable|boolean',
            'reset_control_numbers' => 'nullable|boolean',
        ]);

        $fromYearId = (int) $request->from_year_id;
        $toYearId = (int) $request->to_year_id;
        $closeSource = $request->boolean('close_source_year');
        $setTargetCurrent = $request->boolean('set_target_current');
        // أرقام الكنترول (جلوس/سرية/لجنة) تخص العام: تُحفظ في قيد العام المصدر وتُصفَّر للعام الجديد (الافتراضي نعم)
        $resetControl = $request->boolean('reset_control_numbers', true);
        $carryoverArrears = $request->boolean('carryover_arrears', true);

        $stats = ['promoted' => 0, 'retained' => 0, 'supplementary' => 0, 'graduated' => 0, 'withdrawn' => 0];
        $paymentsByStudent = $carryoverArrears
            ? Payment::forAcademicYear($fromYearId)
                ->selectRaw('student_id, SUM(amount) as total_paid')
                ->groupBy('student_id')
                ->pluck('total_paid', 'student_id')
            : collect();

        DB::transaction(function () use ($request, $fromYearId, $toYearId, $closeSource, $setTargetCurrent, $carryoverArrears, $resetControl, $paymentsByStudent, &$stats) {
            if ($setTargetCurrent) {
                AcademicYear::where('is_current', true)->update(['is_current' => false]);
                AcademicYear::where('id', $toYearId)->update(['is_current' => true, 'status' => 'active']);
            }
            if ($closeSource) {
                AcademicYear::where('id', $fromYearId)->update(['status' => 'archived', 'is_current' => false]);
            }

            $targetYear = AcademicYear::find($toYearId);
            $syncStudentMaster = $targetYear && $targetYear->is_current;

            foreach ($request->items as $item) {
                $student = Student::find($item['student_id']);
                if (!$student) continue;

                $action = $item['action'];
                $targetClassId = $item['target_class_id'] ?? null;
                $tuition = $item['tuition_fee'] ?? $student->tuition_fee ?? 0;

                $sourceEnr = StudentEnrollment::where('student_id', $student->id)
                    ->where('academic_year_id', $fromYearId)
                    ->first();

                if (!$carryoverArrears) {
                    $prevBalance = 0.0;
                } elseif (isset($item['previous_balance'])) {
                    $prevBalance = max(0.0, (float)$item['previous_balance']);
                } else {
                    $srcTuition = (float) ($sourceEnr ? $sourceEnr->tuition_fee : ($student->tuition_fee ?? 0));
                    $srcPrev = (float) ($sourceEnr ? ($sourceEnr->previous_balance ?? 0) : 0);
                    $paid = (float) ($paymentsByStudent->get($student->id) ?? 0);
                    $prevBalance = max(0.0, round(($srcTuition + $srcPrev) - $paid, 2));
                }

                $sourceStatus = match ($action) {
                    'promote' => 'promoted',
                    'retain' => 'retained',
                    'supplementary' => 'supplementary',
                    'graduate' => 'graduated',
                    default => 'withdrawn',
                };
                $stats[$sourceStatus]++;

                // Update source enrollment status
                StudentEnrollment::updateOrCreate(
                    ['student_id' => $student->id, 'academic_year_id' => $fromYearId],
                    [
                        'class_id' => $sourceEnr ? $sourceEnr->class_id : $student->class_id,
                        'status' => $sourceStatus,
                        'tuition_fee' => $sourceEnr ? $sourceEnr->tuition_fee : ($student->tuition_fee ?? 0),
                        'previous_balance' => $sourceEnr ? ($sourceEnr->previous_balance ?? 0) : 0,
                        'secret_code' => $student->secret_code,
                        'seat_number' => $student->seat_number,
                        'committee_number' => $student->committee_number,
                    ]
                );

                // Create target enrollment for continuing students (promote / retain / supplementary)
                if (in_array($action, ['promote', 'retain', 'supplementary'], true) && $targetClassId) {
                    StudentEnrollment::updateOrCreate(
                        ['student_id' => $student->id, 'academic_year_id' => $toYearId],
                        [
                            'class_id' => $targetClassId,
                            'status' => $action === 'supplementary' ? 'supplementary' : 'active',
                            'tuition_fee' => $tuition,
                            'previous_balance' => $prevBalance,
                            'secret_code' => null,
                            'seat_number' => null,
                            'committee_number' => null,
                        ]
                    );

                    if ($syncStudentMaster) {
                        $student->update([
                            'class_id' => $targetClassId,
                            'tuition_fee' => $tuition,
                            'is_active' => true,
                        ] + ($resetControl ? ['seat_number' => null, 'secret_code' => null, 'committee_number' => null] : []));
                    }
                } elseif ($syncStudentMaster) {
                    $student->update(['is_active' => false]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'message' => "تم تنفيذ الترحيل بنجاح: ترفيع ({$stats['promoted']})، إبقاء ({$stats['retained']})، تخريج ({$stats['graduated']})، منسحب ({$stats['withdrawn']}).",
        ]);
    }

    /**
     * التراجع الآمن عن ترحيل عام دراسي هدف وإعادة الطلاب لحالتهم في العام المصدر
     */
    public function rollback(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'صلاحية التراجع متاحة للمسؤول فقط.'], 403);
        }

        $request->validate([
            'from_year_id' => 'required|exists:academic_years,id',
            'to_year_id' => 'required|exists:academic_years,id|different:from_year_id',
        ]);

        $fromYearId = (int) $request->from_year_id;
        $toYearId = (int) $request->to_year_id;

        $removedCount = 0;

        // حماية: لا تراجع إذا بدأ العمل في العام الهدف (درجات/حضور/واجبات/دفعات/اختبارات)،
        // لأن حذف قيوده يترك هذه البيانات بلا طلاب مقيدين.
        $used = [];
        foreach ([
            'درجات' => Grade::class,
            'حضور' => \App\Models\Attendance::class,
            'واجبات' => \App\Models\Assignment::class,
            'دفعات' => Payment::class,
            'جداول اختبارات' => \App\Models\ExamSchedule::class,
        ] as $label => $model) {
            $n = $model::where('academic_year_id', $toYearId)->count();
            if ($n > 0) $used[] = "{$label} ({$n})";
        }
        if ($used) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن التراجع عن الترحيل: العام الهدف فيه بيانات مسجلة — ' . implode('، ', $used) . '.',
            ], 422);
        }

        DB::transaction(function () use ($fromYearId, $toYearId, &$removedCount) {
            $removedCount = StudentEnrollment::where('academic_year_id', $toYearId)->delete();

            $sourceEnrollments = StudentEnrollment::where('academic_year_id', $fromYearId)->get();
            foreach ($sourceEnrollments as $enr) {
                // المنسحب قبل الترحيل يبقى منسحباً — لا يُعاد تفعيله بالتراجع
                if ($enr->status === 'withdrawn') {
                    Student::where('id', $enr->student_id)->update(['is_active' => false]);
                    continue;
                }
                $enr->update(['status' => 'active']);
                Student::where('id', $enr->student_id)->update([
                    'class_id' => $enr->class_id,
                    'tuition_fee' => $enr->tuition_fee,
                    'is_active' => true,
                    // أرقام الكنترول التي حُفظت في قيد العام عند الترحيل
                    'seat_number' => $enr->seat_number,
                    'secret_code' => $enr->secret_code,
                    'committee_number' => $enr->committee_number,
                ]);
            }

            AcademicYear::where('id', $toYearId)->update(['is_current' => false]);
            AcademicYear::where('id', $fromYearId)->update(['is_current' => true, 'status' => 'active']);
        });

        return response()->json([
            'success' => true,
            'removed_count' => $removedCount,
            'message' => "تم التراجع عن الترحيل بأمان وحذف {$removedCount} قيد من العام الهدف واستعادة قيود العام المصدر.",
        ]);
    }

    /**
     * رصد درجات الدور الثاني / الإكمال للمواد المتعثرة في عام محدد
     */
    public function saveSecondRound(Request $request)
    {
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'super_admin'], true)) {
            return response()->json(['success' => false, 'message' => 'صلاحية رصد الدور الثاني متاحة للمسؤول فقط.'], 403);
        }

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'student_id' => 'required|exists:students,id',
            'scores' => 'required|array|min:1',
            'scores.*.subject_id' => 'required|exists:subjects,id',
            'scores.*.second_round_score' => 'required|numeric|min:0|max:100',
        ]);

        $yearId = (int) $validated['academic_year_id'];
        $studentId = (int) $validated['student_id'];

        $targetYear = AcademicYear::find($yearId);
        if ($targetYear && $targetYear->status === 'archived' && !$request->boolean('force_archived_edit')) {
            return response()->json([
                'success' => false,
                'code' => 'ARCHIVED_YEAR_READONLY',
                'message' => "العام الدراسي ({$targetYear->name}) مؤرشف ومغلق للقراءة فقط؛ لا يمكن رصد درجات الدور الثاني له.",
            ], 423);
        }

        DB::transaction(function () use ($validated, $yearId, $studentId) {
            foreach ($validated['scores'] as $row) {
                $existing = Grade::where('academic_year_id', $yearId)
                    ->where('student_id', $studentId)
                    ->where('subject_id', $row['subject_id'])
                    ->where('month', 0)
                    ->where('is_control', false)
                    ->orderByDesc('term')
                    ->first();

                if ($existing) {
                    $existing->update(['second_round_score' => $row['second_round_score']]);
                } else {
                    Grade::create([
                        'academic_year_id' => $yearId,
                        'student_id' => $studentId,
                        'subject_id' => $row['subject_id'],
                        'term' => 2,
                        'month' => 0,
                        'is_control' => false,
                        'second_round_score' => $row['second_round_score'],
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ درجات الدور الثاني بنجاح وتحديث حالة التقييم.',
        ]);
    }
}
