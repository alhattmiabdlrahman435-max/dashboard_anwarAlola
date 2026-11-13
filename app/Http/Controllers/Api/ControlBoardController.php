<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * الكنترول حسب ملحق المدرسة:
 *  - أرقام الجلوس والأرقام السرية: ترقيم آلي متسلسل للشعبة من "بدء الترقيم من" مع إمكانية تعديل رقم أي طالب.
 *  - ترقيم اللجان: عدد اللجان يحدده أعضاء الكنترول (1..N).
 *  - توزيع الطلاب في اللجان: رقم اللجنة أمام كل طالب.
 *  - كشوفات المناداة / المرايا / البطائق: تُبنى من نفس البيانات.
 * الرقم السري = students.secret_code (هو نفسه المستخدم في رصد درجات الاختبار النهائي بالرقم السري).
 */
class ControlBoardController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:control,view', only: ['students', 'committees']),
            new Middleware('check.permission:control,generateSecretCodes', only: ['autoNumber', 'updateStudent', 'saveCommittees', 'saveAssignments']),
        ];
    }

    /** ترتيب الطلاب داخل الشعبة عند الترقيم والعرض: أبجدياً بالاسم */
    private function orderedStudents(?int $classId)
    {
        $q = Student::query()->with('schoolClass:id,grade_ar,section_ar')
            ->where('is_active', true);
        if ($classId) {
            $q->where('class_id', $classId);
        }
        // ترتيب الشعب حسب المدرسة (الصف ثم الشعبة) لا حسب رقم الإنشاء — نفس ترتيب الأرشيف
        $ids = ArchiveController::orderedClassIds();
        if ($ids) {
            $q->orderByRaw('FIELD(class_id, ' . implode(',', $ids) . ')');
        }
        return $q->orderBy('name_ar')->orderBy('id');
    }

    private function scopeAllows(Request $request, ?int $classId): bool
    {
        $scoped = PermissionService::getScopedClassIds($request->user(), 'control');
        if ($scoped === null) return true;
        return $classId !== null && in_array($classId, $scoped);
    }

    private function present(Student $s): array
    {
        return [
            'id'               => $s->id,
            'name_ar'          => $s->name_ar,
            'class_id'         => $s->class_id,
            'class_name'       => $s->schoolClass ? trim($s->schoolClass->grade_ar . ' - ' . $s->schoolClass->section_ar) : '',
            'grade_ar'         => $s->schoolClass?->grade_ar,
            'section_ar'       => $s->schoolClass?->section_ar,
            'seat_number'      => $s->seat_number,
            'secret_number'    => $s->secret_code,
            'committee_number' => $s->committee_number,
            'photo_url'        => $s->photo_url,
        ];
    }

    /** GET /control/board/students?class_id=ID|all */
    public function students(Request $request)
    {
        $classId = $request->filled('class_id') && $request->input('class_id') !== 'all'
            ? (int) $request->input('class_id') : null;

        $scoped = PermissionService::getScopedClassIds($request->user(), 'control');
        $q = $this->orderedStudents($classId);
        if ($scoped !== null) {
            $q->whereIn('class_id', $scoped);
        }

        return response()->json([
            'success'  => true,
            'students' => $q->get()->map(fn($s) => $this->present($s))->values(),
        ]);
    }

    /**
     * POST /control/board/number  { class_id, field: seat|secret, start }
     * "بدء الترقيم": ترقيم جميع طلاب الشعبة آلياً وبالتسلسل من الرقم المُدخل.
     */
    public function autoNumber(Request $request)
    {
        $data = $request->validate([
            'class_id' => 'required|integer|exists:classes,id',
            'field'    => 'required|in:seat,secret',
            'start'    => 'required|integer|min:0|max:999999999',
        ]);
        if (!$this->scopeAllows($request, (int) $data['class_id'])) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بهذه الشعبة.'], 403);
        }

        $column = $data['field'] === 'seat' ? 'seat_number' : 'secret_code';
        $students = $this->orderedStudents((int) $data['class_id'])->get();
        $numbers = [];
        foreach ($students as $i => $s) {
            $numbers[$s->id] = (string) ($data['start'] + $i);
        }

        // منع التكرار مع طلاب شعب أخرى
        $conflicts = Student::whereIn($column, array_values($numbers))
            ->whereNotIn('id', array_keys($numbers))
            ->with('schoolClass:id,grade_ar,section_ar')
            ->get(['id', 'name_ar', 'class_id', $column]);
        if ($conflicts->isNotEmpty()) {
            $first = $conflicts->first();
            $label = $data['field'] === 'seat' ? 'رقم الجلوس' : 'الرقم السري';
            return response()->json([
                'success' => false,
                'message' => "{$label} {$first->$column} مستخدم للطالب {$first->name_ar}"
                    . ($first->schoolClass ? " ({$first->schoolClass->grade_ar} - {$first->schoolClass->section_ar})" : '')
                    . '. اختر رقم بداية آخر.',
                'conflicts' => $conflicts->count(),
            ], 422);
        }

        DB::transaction(function () use ($students, $numbers, $column) {
            // تفريغ مؤقت لتجنب تعارض القيد الفريد أثناء إعادة الترقيم
            Student::whereIn('id', $students->pluck('id'))->update([$column => null]);
            foreach ($students as $s) {
                Student::where('id', $s->id)->update([$column => $numbers[$s->id]]);
            }
        });

        return response()->json([
            'success'  => true,
            'message'  => 'تم الترقيم بنجاح',
            'students' => $this->orderedStudents((int) $data['class_id'])->get()->map(fn($s) => $this->present($s))->values(),
        ]);
    }

    /** PUT /control/board/students/{id}  { seat_number?, secret_number?, committee_number? } — تعديل رقم طالب */
    public function updateStudent(Request $request, string $id)
    {
        $student = Student::with('schoolClass:id,grade_ar,section_ar')->findOrFail($id);
        if (!$this->scopeAllows($request, $student->class_id)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بهذا الطالب.'], 403);
        }

        $request->validate([
            'seat_number'      => 'nullable|string|max:20',
            'secret_number'    => 'nullable|string|max:50',
            'committee_number' => 'nullable|integer|min:1|exists:exam_committees,number',
        ]);

        $updates = [];
        foreach (['seat_number' => 'seat_number', 'secret_number' => 'secret_code'] as $input => $column) {
            if (!$request->exists($input)) continue;
            $value = trim((string) $request->input($input));
            $value = $value === '' ? null : $value;
            if ($value !== null && Student::where($column, $value)->where('id', '!=', $student->id)->exists()) {
                $other = Student::where($column, $value)->first();
                $label = $input === 'seat_number' ? 'رقم الجلوس' : 'الرقم السري';
                return response()->json([
                    'success' => false,
                    'message' => "{$label} {$value} مستخدم للطالب {$other->name_ar}.",
                ], 422);
            }
            $updates[$column] = $value;
        }
        if ($request->exists('committee_number')) {
            $updates['committee_number'] = $request->input('committee_number') ?: null;
        }

        $student->update($updates);

        return response()->json(['success' => true, 'student' => $this->present($student->fresh('schoolClass'))]);
    }

    /** GET /control/board/committees — اللجان مع عدد الطلاب في كل لجنة */
    public function committees()
    {
        $counts = Student::whereNotNull('committee_number')
            ->selectRaw('committee_number, count(*) c')->groupBy('committee_number')
            ->pluck('c', 'committee_number');

        $list = DB::table('exam_committees')->orderBy('number')->pluck('number')
            ->map(fn($n) => ['number' => (int) $n, 'students_count' => (int) ($counts[$n] ?? 0)])->values();

        return response()->json(['success' => true, 'committees' => $list]);
    }

    /** POST /control/board/committees { count } — ترقيم اللجان يدوياً حسب العدد الذي يضعه أعضاء الكنترول */
    public function saveCommittees(Request $request)
    {
        $data = $request->validate(['count' => 'required|integer|min:1|max:500']);
        $count = (int) $data['count'];

        // لا نحذف لجنة فيها طلاب
        $usedAbove = Student::where('committee_number', '>', $count)->distinct()->pluck('committee_number');
        if ($usedAbove->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تقليل عدد اللجان: اللجنة ' . $usedAbove->sort()->implode('، ') . ' فيها طلاب. انقلهم أولاً.',
            ], 422);
        }

        DB::transaction(function () use ($count) {
            DB::table('exam_committees')->where('number', '>', $count)->delete();
            $existing = DB::table('exam_committees')->pluck('number')->all();
            $now = now();
            $rows = [];
            for ($n = 1; $n <= $count; $n++) {
                if (!in_array($n, $existing)) {
                    $rows[] = ['number' => $n, 'created_at' => $now, 'updated_at' => $now];
                }
            }
            if ($rows) DB::table('exam_committees')->insert($rows);
        });

        return $this->committees();
    }

    /** PUT /control/board/committee-assignments { assignments: [{student_id, committee_number|null}] } — توزيع الطلاب في اللجان */
    public function saveAssignments(Request $request)
    {
        $data = $request->validate([
            'assignments'                    => 'required|array',
            'assignments.*.student_id'       => 'required|integer|exists:students,id',
            'assignments.*.committee_number' => 'nullable|integer|min:1',
        ]);

        $valid = DB::table('exam_committees')->pluck('number')->map(fn($n) => (int) $n)->all();
        foreach ($data['assignments'] as $a) {
            if ($a['committee_number'] !== null && !in_array((int) $a['committee_number'], $valid, true)) {
                return response()->json([
                    'success' => false,
                    'message' => "اللجنة رقم {$a['committee_number']} غير موجودة. أضفها من «ترقيم اللجان» أولاً.",
                ], 422);
            }
        }

        $scoped = PermissionService::getScopedClassIds($request->user(), 'control');
        DB::transaction(function () use ($data, $scoped) {
            foreach ($data['assignments'] as $a) {
                $q = Student::where('id', $a['student_id']);
                if ($scoped !== null) $q->whereIn('class_id', $scoped);
                $q->update(['committee_number' => $a['committee_number'] ?: null]);
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ توزيع الطلاب في اللجان.']);
    }
}
