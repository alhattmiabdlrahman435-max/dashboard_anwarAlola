<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Read-only reporting. No model saves, notifications, migrations, or shared API changes. */
class SchoolReportController extends Controller
{
    private const MODULES = [
        'registry' => 'students', 'finance' => 'finance', 'attendance' => 'scanner',
        'month' => 'detailedGrades', 'term' => 'detailedGrades', 'annual' => 'detailedGrades',
        'term-result' => 'detailedGrades', 'annual-result' => 'detailedGrades',
    ];

    private function can(User $user, string $module, string $action = 'view'): bool
    {
        // Reports must be explicitly granted; the legacy reports/teacherReports alias is not used.
        if (!in_array($user->role, ['admin', 'supervisor', 'vice_principal'], true)) {
            return false;
        }
        if ($user->role === 'admin' || !empty($user->permissions['full_access'])) {
            return true;
        }
        if ($module !== 'reports') {
            return PermissionService::can($user, $module, $action);
        }
        $permission = $user->permissions['reports'] ?? [];
        $actions = array_is_list($permission) ? $permission : ($permission['actions'] ?? []);
        return in_array($action, $actions, true);
    }

    private function classIds(User $user, string $module): array
    {
        $query = SchoolClass::query();
        foreach (['reports', $module] as $scopeModule) {
            $ids = PermissionService::getScopedClassIds($user, $scopeModule);
            if ($ids !== null) {
                $query->whereIn('id', $ids);
            }
        }
        return $query->pluck('id')->map(fn ($id) => (int) $id)->all();
    }

    public function options(Request $request)
    {
        $user = $request->user();
        abort_unless($this->can($user, 'reports'), 403, 'ليس لديك تصريح لعرض مركز التقارير.');
        $reports = [];
        $allClassIds = [];
        foreach (self::MODULES as $key => $module) {
            if ($this->can($user, $module)) {
                $ids = $this->classIds($user, $module);
                $reports[] = ['key' => $key, 'class_ids' => $ids, 'can_export' => $this->can($user, 'reports', 'export')];
                $allClassIds = array_merge($allClassIds, $ids);
            }
        }
        $classes = SchoolClass::whereIn('id', array_unique($allClassIds))->orderBy('grade_ar')->orderBy('section_ar')
            ->get(['id', 'grade_ar', 'grade_en', 'section_ar', 'section_en']);
        $subjects = DB::table('teacher_subjects')->join('subjects', 'subjects.id', '=', 'teacher_subjects.subject_id')
            ->whereIn('teacher_subjects.class_id', array_unique($allClassIds))
            ->select('subjects.id', 'subjects.name_ar', 'subjects.name_en', 'teacher_subjects.class_id')->distinct()->get();
        return response()->json(['reports' => $reports, 'classes' => $classes, 'subjects' => $subjects])
            ->header('Cache-Control', 'private, no-store');
    }

    public function students(Request $request)
    {
        $user = $request->user();
        abort_unless($this->can($user, 'reports'), 403);
        $filters = $request->validate(['class_ids' => 'required|array|min:1|max:100', 'class_ids.*' => 'integer|min:1|distinct']);
        $allAllowedClassIds = [];
        foreach (self::MODULES as $mod) {
            if ($this->can($user, $mod)) {
                $allAllowedClassIds = array_merge($allAllowedClassIds, $this->classIds($user, $mod));
            }
        }
        $allAllowedClassIds = array_unique($allAllowedClassIds);
        abort_if(count(array_diff($filters['class_ids'], $allAllowedClassIds)) > 0, 403);
        $query = Student::whereIn('class_id', $filters['class_ids'])->where('is_active', true);
        abort_if((clone $query)->count() > 2000, 422, 'اختر صفًا أو شعبًا أقل لتحديد الطالب.');
        return response()->json(['students' => $query->orderBy('name_ar')->get(['id', 'name_ar', 'name_en', 'student_code', 'class_id'])])
            ->header('Cache-Control', 'private, no-store');
    }

    public function show(Request $request, string $key)
    {
        abort_unless(isset(self::MODULES[$key]), 404);
        $user = $request->user();
        $module = self::MODULES[$key];
        abort_unless($this->can($user, 'reports') && $this->can($user, $module), 403, 'ليس لديك تصريح لهذا التقرير.');
        $filters = $request->validate([
            'class_ids' => 'nullable|array|max:100', 'class_ids.*' => 'integer|min:1|distinct',
            'subject_id' => 'nullable|integer|min:1', 'student_id' => 'nullable|integer|min:1',
            'term' => 'nullable|integer|in:1,2', 'month' => 'nullable|integer|in:1,2,3',
            'from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'search' => 'nullable|string|max:100', 'status' => 'nullable|in:all,complete,incomplete,unpaid,paid,credit',
            'export' => 'nullable|boolean',
        ]);
        if ($request->boolean('export')) {
            abort_unless($this->can($user, 'reports', 'export'), 403, 'ليس لديك تصريح لتصدير التقارير.');
        }
        $allowed = $this->classIds($user, $module);
        $selected = $filters['class_ids'] ?? $allowed;
        abort_if(count(array_diff($selected, $allowed)) > 0, 403, 'الشعبة المختارة خارج نطاق صلاحيتك.');
        $query = Student::query()->with(['schoolClass', 'parentUser'])->whereIn('class_id', $selected)->where('is_active', true);
        if (!empty($filters['student_id'])) {
            abort_unless((clone $query)->where('id', $filters['student_id'])->exists(), 403, 'الطالب خارج نطاق التقرير.');
            $query->where('id', $filters['student_id']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q->where('name_ar', 'like', "%{$search}%")
                ->orWhere('name_en', 'like', "%{$search}%")->orWhere('student_code', 'like', "%{$search}%"));
        }
        abort_if((clone $query)->count() > 2000, 422, 'اختر صفًا أو شعبًا أقل لعرض التقرير كاملًا دون اقتطاع.');
        $students = $query->orderBy('class_id')->orderBy('name_ar')->get();
        $base = fn ($s) => [
            'id' => $s->id, 'code' => $s->student_code, 'name' => $s->name_ar, 'name_en' => $s->name_en,
            'class' => $s->schoolClass?->name_ar, 'class_en' => $s->schoolClass?->name_en,
        ];
        $columns = [['key' => 'name', 'ar' => 'اسم الطالب', 'en' => 'Student'], ['key' => 'class', 'ar' => 'الصف / الشعبة', 'en' => 'Class / section']];
        $notes = []; $summary = []; $totals = []; $student = null;
        if ($key === 'finance') {
            $paid = DB::table('payments')->whereIn('student_id', $students->pluck('id'))
                ->select('student_id')->selectRaw('SUM(amount) AS amount')->groupBy('student_id')->pluck('amount', 'student_id');
            $rows = $students->map(function ($s) use ($base, $paid) {
                $fee = (float) $s->tuition_fee; $amount = (float) ($paid[$s->id] ?? 0);
                $remaining = round($fee - $amount, 2);
                return $base($s) + ['fees' => $fee, 'paid' => $amount, 'remaining' => $remaining,
                    'status' => $remaining > 0 ? 'unpaid' : ($remaining < 0 ? 'credit' : 'paid')];
            })->all();
            foreach (['fees' => ['الرسوم المسجلة', 'Recorded fees'], 'paid' => ['المدفوع', 'Paid'], 'remaining' => ['المتبقي', 'Balance']] as $field => $label) {
                $columns[] = ['key' => $field, 'ar' => $label[0], 'en' => $label[1], 'numeric' => true, 'total' => true];
            }
            $notes = ['financial_details_unavailable', 'finance_current_balance'];
        } elseif ($key === 'attendance') {
            $attendance = DB::table('attendance')->whereIn('student_id', $students->pluck('id'));
            if (!empty($filters['from'])) $attendance->where('record_date', '>=', $filters['from']);
            if (!empty($filters['to'])) $attendance->where('record_date', '<=', $filters['to']);
            $counts = $attendance->select('student_id', 'status')->selectRaw('COUNT(*) AS count')->groupBy('student_id', 'status')->get()->groupBy('student_id');
            $rows = $students->map(function ($s) use ($base, $counts) {
                $records = $counts[$s->id] ?? collect();
                $present = (int) ($records->firstWhere('status', 'present')?->count ?? 0);
                $absent = (int) ($records->firstWhere('status', 'absent')?->count ?? 0);
                $total = $present + $absent;
                return $base($s) + ['present' => $present, 'absent' => $absent, 'recorded' => $total,
                    'rate' => $total > 0 ? round($present / $total * 100, 1) : null, 'status' => $total > 0 ? 'complete' : 'incomplete'];
            })->all();
            foreach (['present' => ['أيام الحضور', 'Present'], 'absent' => ['أيام الغياب', 'Absent'], 'recorded' => ['أيام مسجلة', 'Recorded days'], 'rate' => ['الحضور %', 'Attendance %']] as $field => $label) {
                $columns[] = ['key' => $field, 'ar' => $label[0], 'en' => $label[1], 'numeric' => true, 'total' => $field !== 'rate'];
            }
            $notes = ['attendance_recorded_only'];
        } elseif ($key === 'registry') {
            $columns = [
                ['key' => 'code', 'ar' => 'الرقم المدرسي', 'en' => 'Student ID', 'numeric' => true],
                ['key' => 'name', 'ar' => 'اسم الطالب', 'en' => 'Student Name'],
                ['key' => 'class', 'ar' => 'الصف والشعبة', 'en' => 'Class & Section'],
                ['key' => 'parent_name', 'ar' => 'ولي الأمر', 'en' => 'Guardian'],
                ['key' => 'phone', 'ar' => 'هاتف التواصل', 'en' => 'Phone', 'numeric' => true],
                ['key' => 'enrollment_date', 'ar' => 'تاريخ القيد', 'en' => 'Enrollment Date', 'numeric' => true],
                ['key' => 'status', 'ar' => 'حالة القيد', 'en' => 'Status'],
                ['key' => 'notes_space', 'ar' => 'ملاحظات / توقيع', 'en' => 'Notes / Sign'],
            ];
            $rows = $students->map(function ($s) use ($base) {
                return $base($s) + [
                    'parent_name' => $s->parentUser?->name_ar ?: ($s->parentUser?->name ?: '—'),
                    'phone' => $s->parentUser?->phone ?: '—',
                    'enrollment_date' => $s->enrollment_date ? substr($s->enrollment_date, 0, 10) : '—',
                    'status' => $s->is_active ? 'active' : 'inactive',
                    'notes_space' => '—',
                ];
            })->all();
            $withPhone = count(array_filter($rows, fn ($r) => !empty($r['phone']) && $r['phone'] !== '—'));
            $summary = [
                'students' => count($rows),
                'with_phone' => $withPhone,
            ];
            $notes = ['registry_official_record'];
        } else {
            $term = (int) ($filters['term'] ?? 1); $month = (int) ($filters['month'] ?? 1);
            $annual = in_array($key, ['annual', 'annual-result'], true);
            $document = in_array($key, ['term-result', 'annual-result'], true);
            abort_if($document && empty($filters['student_id']), 422, 'اختر طالبًا لمعاينة نموذج النتيجة.');
            $assigned = DB::table('teacher_subjects')->join('subjects', 'subjects.id', '=', 'teacher_subjects.subject_id')
                ->whereIn('teacher_subjects.class_id', $selected)->select('teacher_subjects.class_id', 'subjects.id', 'subjects.name_ar', 'subjects.name_en')->distinct()->get();
            if (!empty($filters['subject_id'])) {
                abort_unless($assigned->contains('id', (int) $filters['subject_id']), 422, 'المادة غير مسندة إلى الشعب المختارة.');
                $assigned = $assigned->where('id', (int) $filters['subject_id']);
            }
            $subjects = $assigned->unique('id')->sortBy('name_ar')->values();
            $grades = DB::table('grades')->whereIn('student_id', $students->pluck('id'))->where('is_control', false)
                ->whereIn('subject_id', $subjects->pluck('id'))->whereIn('term', $annual ? [1, 2] : [$term])->get()
                ->keyBy(fn ($g) => "{$g->student_id}:{$g->subject_id}:{$g->term}:{$g->month}");
            $monthly = static function ($g): ?float {
                if (!$g) return null;
                $values = [(float) $g->homework, (float) $g->attendance, (float) $g->behavior, (float) $g->oral, (float) $g->written];
                $maxima = [15, 15, 10, 10, 50];
                foreach ($values as $i => $value) if ($value < 0 || $value > $maxima[$i]) return null;
                return array_sum($values);
            };
            $period = static function ($sid, $sub, $t) use ($grades, $monthly): ?array {
                $values = [];
                foreach ([1, 2, 3] as $m) $values[] = $monthly($grades["$sid:$sub:$t:$m"] ?? null);
                $final = $grades["$sid:$sub:$t:0"]->final_exam ?? null;
                if (in_array(null, $values, true) || $final === null || (float) $final < 0 || (float) $final > 30) return null;
                $work = round(array_sum($values) / 15, 2);
                return ['work' => $work, 'exam' => (float) $final, 'total' => round($work + (float) $final, 2)];
            };
            $rows = [];
            foreach ($students as $s) {
                $expected = $assigned->where('class_id', $s->class_id)->pluck('id')->unique()->all();
                $row = $base($s); $complete = count($expected) > 0; $sum = 0;
                foreach ($subjects as $sub) {
                    $value = null;
                    if (in_array($sub->id, $expected)) {
                        if ($key === 'month') $value = $monthly($grades["{$s->id}:{$sub->id}:$term:$month"] ?? null);
                        else {
                            $first = $period($s->id, $sub->id, $term);
                            if ($annual) { $first = $period($s->id, $sub->id, 1); $second = $period($s->id, $sub->id, 2); $value = $first && $second ? round($first['total'] + $second['total'], 2) : null; }
                            else $value = $first['total'] ?? null;
                        }
                        if ($value === null) $complete = false;
                        else $sum += $value;
                    }
                    $row['subject_'.$sub->id] = $value;
                    if ($document && in_array($sub->id, $expected)) {
                        $docRow = ['id' => $sub->id, 'subject' => $sub->name_ar, 'subject_en' => $sub->name_en, 'total' => $value, 'maximum' => $annual ? 100 : 50];
                        if ($annual) $docRow += ['first' => $first['total'] ?? null, 'second' => $second['total'] ?? null];
                        else $docRow += ['work' => $first['work'] ?? null, 'exam' => $first['exam'] ?? null];
                        $rows[] = $docRow;
                    }
                }
                $maximum = count($expected) * (($annual || $key === 'month') ? 100 : 50);
                $row += ['total' => $complete ? round($sum, 2) : null, 'percentage' => $complete && $maximum > 0 ? round($sum / $maximum * 100, 2) : null, 'status' => $complete ? 'complete' : 'incomplete'];
                if (!$document) $rows[] = $row;
                else { $student = $base($s); $summary = ['students' => 1, 'complete' => $complete ? 1 : 0, 'total' => $row['total'], 'maximum' => $maximum, 'percentage' => $row['percentage']]; }
            }
            if ($document) {
                $columns = [['key' => 'subject', 'ar' => 'المادة', 'en' => 'Subject']];
                $fields = $annual ? ['first' => ['الفصل الأول / 50', 'First term / 50'], 'second' => ['الفصل الثاني / 50', 'Second term / 50']] : ['work' => ['أعمال الفصل / 20', 'Coursework / 20'], 'exam' => ['الاختبار / 30', 'Exam / 30']];
                $fields += ['total' => ['المجموع', 'Total'], 'maximum' => ['الدرجة العظمى', 'Maximum']];
                foreach ($fields as $field => $label) $columns[] = ['key' => $field, 'ar' => $label[0], 'en' => $label[1], 'numeric' => true];
            } else {
                if ($key === 'term' && !empty($filters['subject_id'])) {
                    foreach ($rows as &$row) {
                        $sub = (int) $filters['subject_id'];
                        foreach ([1, 2, 3] as $m) $row['m'.$m] = $monthly($grades["{$row['id']}:$sub:$term:$m"] ?? null);
                        $p = $period($row['id'], $sub, $term);
                        $row['work'] = $p['work'] ?? null; $row['exam'] = $p['exam'] ?? null;
                    }
                    unset($row);
                    foreach (['m1' => ['الأولى / 100', 'Assessment 1 / 100'], 'm2' => ['الثانية / 100', 'Assessment 2 / 100'], 'm3' => ['الثالثة / 100', 'Assessment 3 / 100'], 'work' => ['الأعمال / 20', 'Coursework / 20'], 'exam' => ['الاختبار / 30', 'Exam / 30']] as $field => $label) {
                        $columns[] = ['key' => $field, 'ar' => $label[0], 'en' => $label[1], 'numeric' => true];
                    }
                }
                foreach ($subjects as $sub) $columns[] = ['key' => 'subject_'.$sub->id, 'ar' => $sub->name_ar, 'en' => $sub->name_en ?: $sub->name_ar, 'numeric' => true];
                $columns[] = ['key' => 'total', 'ar' => 'المجموع', 'en' => 'Total', 'numeric' => true];
                $columns[] = ['key' => 'percentage', 'ar' => 'النسبة %', 'en' => 'Percentage %', 'numeric' => true];
                $columns[] = ['key' => 'status', 'ar' => 'حالة الرصد', 'en' => 'Completeness'];
            }
            $notes = ['grades_current_context', 'grades_detailed_source', 'grades_calculation'];
            if ($document) $notes[] = 'document_review_only';
            if ($assigned->isEmpty() || $students->contains(fn ($s) => !$assigned->contains('class_id', $s->class_id))) $notes[] = 'subjects_missing';
        }
        $status = $filters['status'] ?? 'all';
        if ($status !== 'all' && !in_array($key, ['term-result', 'annual-result', 'registry'], true)) {
            $rows = array_values(array_filter($rows, fn ($row) => ($row['status'] ?? null) === $status));
        }
        if (!$summary) {
            $summary = ['students' => count($rows)];
            if (in_array($key, ['month', 'term', 'annual', 'attendance'], true)) $summary['complete'] = count(array_filter($rows, fn ($r) => $r['status'] === 'complete'));
        }
        foreach ($columns as $column) {
            if (!empty($column['total'])) $totals[$column['key']] = round(array_sum(array_column($rows, $column['key'])), 2);
        }
        $selectedClasses = SchoolClass::whereIn('id', $selected)->get(['grade_ar', 'section_ar'])->map(fn ($c) => $c->name_ar)->all();
        if ($student && !empty($student['class'])) {
            $scope = [$student['class']];
        } elseif (!empty($filters['student_id']) && $students->count() === 1 && $students->first()->schoolClass) {
            $scope = [$students->first()->schoolClass->name_ar];
        } else {
            $scope = $selectedClasses;
        }
        $data = ['key' => $key, 'columns' => $columns, 'rows' => $rows, 'summary' => $summary, 'totals' => $totals,
            'student' => $student, 'notes' => array_values(array_unique($notes)), 'generated_at' => now()->toIso8601String(),
            'scope' => $scope];
        return response()->json($data)->header('Cache-Control', 'private, no-store');
    }
}
