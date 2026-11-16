<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * قسم الأرشيف حسب ملف «احصائية قسم الارشيف»:
 *  - الاحصائية: عدد الذكور / الإناث / الإجمالي لكل شعبة — تُحسب لحظياً من سجلات الطلاب.
 *  - بيانات الطلاب: نموذج استمارة التسجيل لكل صف وشعبة (يُعبَّأ يدوياً ويُطبع).
 */
class ArchiveController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:students,view', only: ['statistics', 'students']),
            new Middleware('check.permission:students,update', only: ['saveStudents', 'saveGenders']),
        ];
    }

    /** ترتيب الصفوف + الاسم المختصر كما في الملف + المرحلة (لنموذج 2) */
    private const GRADES = [
        'تمهيدي'              => ['تمهيدي', 1],
        'الصف الأول'          => ['اول', 1],
        'الصف الثاني'         => ['ثاني', 1],
        'الصف الثالث'         => ['ثالث', 1],
        'الصف الرابع'         => ['رابع', 1],
        'الصف الخامس'         => ['خامس', 1],
        'الصف السادس'         => ['سادس', 1],
        // تسمية الاستضافة
        'الصف السابع'         => ['سابع', 2],
        'الصف الثامن'         => ['ثامن', 2],
        'الصف التاسع'         => ['تاسع', 2],
        'الصف العاشر'         => ['عاشر', 2],
        // التسمية البديلة (نفس الصفوف)
        'الصف الأول المتوسط'  => ['سابع', 2],
        'الصف الثاني المتوسط' => ['ثامن', 2],
        'الصف الثالث المتوسط' => ['تاسع', 2],
        'الصف الأول الثانوي'  => ['عاشر', 2],
        'الصف الثاني الثانوي' => ['2ع', 2],
        'الصف الثالث الثانوي' => ['3ع', 2],
    ];

    /**
     * أرقام الشعب مرتبة حسب ترتيب المدرسة (الصف ثم الشعبة) — مشترك بين الأرشيف والكنترول
     * حتى لا تظهر شعبة أُضيفت متأخراً (مثل «الصف الثاني ج») في آخر الكشوفات.
     */
    public static function orderedClassIds(): array
    {
        $order = array_keys(self::GRADES);
        return SchoolClass::query()->get(['id', 'grade_ar', 'section_ar'])
            ->sortBy(fn($c) => [
                ($i = array_search(trim((string) $c->grade_ar), $order, true)) === false ? 99 : $i,
                (string) $c->section_ar,
                $c->id,
            ])->pluck('id')->map(fn($id) => (int) $id)->values()->all();
    }

    private const FORM_FIELDS = [
        'birth_date', 'governorate', 'address', 'phone_call', 'phone_whatsapp',
        'phone_other', 'guardian_national_id', 'archive_notes',
    ];

    private function scoped(Request $request): ?array
    {
        return PermissionService::getScopedClassIds($request->user(), 'students');
    }

    /** GET /archive/statistics — كل الشعب مع الفرع والمرحلة وعدد الذكور والإناث */
    public function statistics(Request $request)
    {
        $scoped = $this->scoped($request);

        // الاحصائية حسب العام المختار: لو للعام قيود طلاب تُحسب منها (الصف كما كان في ذلك العام)،
        // وإلا من سجل الطلاب الحالي (العام الحالي قبل أي ترحيل).
        $yearId = \App\Services\AcademicYearService::resolveId($request);
        $useEnrollments = $yearId && \App\Models\StudentEnrollment::where('academic_year_id', $yearId)->exists();

        $sums = "SUM(CASE WHEN students.gender = 'male' THEN 1 ELSE 0 END) AS males,
                SUM(CASE WHEN students.gender = 'female' THEN 1 ELSE 0 END) AS females,
                SUM(CASE WHEN students.gender IS NULL OR students.gender NOT IN ('male','female') THEN 1 ELSE 0 END) AS unknown,
                COUNT(*) AS total";

        if ($useEnrollments) {
            $counts = DB::table('student_enrollments as e')
                ->join('students', 'students.id', '=', 'e.student_id')
                ->where('e.academic_year_id', $yearId)
                ->where('e.status', '!=', 'withdrawn')
                ->when($scoped !== null, fn($q) => $q->whereIn('e.class_id', $scoped))
                ->selectRaw('e.class_id AS class_id, ' . $sums)
                ->groupBy('e.class_id')->get()->keyBy('class_id');
        } else {
            $counts = DB::table('students')->where('students.is_active', true)
                ->when($scoped !== null, fn($q) => $q->whereIn('students.class_id', $scoped))
                ->selectRaw('students.class_id AS class_id, ' . $sums)
                ->groupBy('students.class_id')->get()->keyBy('class_id');
        }

        $order = array_keys(self::GRADES);
        $classes = SchoolClass::query()
            ->when($scoped !== null, fn($q) => $q->whereIn('id', $scoped))
            ->get(['id', 'grade_ar', 'section_ar', 'branch'])
            ->sortBy(fn($c) => [
                ($i = array_search(trim($c->grade_ar), $order, true)) === false ? 99 : $i,
                $c->section_ar,
            ])->values();

        $rows = $classes->map(function ($c) use ($counts) {
            $meta = self::GRADES[trim($c->grade_ar)] ?? [trim($c->grade_ar), 2];
            $n = $counts[$c->id] ?? null;
            return [
                'class_id'   => $c->id,
                'class_name' => trim($c->grade_ar . ' - ' . $c->section_ar),
                'short_name' => $meta[0] . ' ' . $c->section_ar,
                'stage'      => $meta[1],
                'branch'     => $c->branch,
                'males'      => (int) ($n->males ?? 0),
                'females'    => (int) ($n->females ?? 0),
                'unknown'    => (int) ($n->unknown ?? 0),
                'total'      => (int) ($n->total ?? 0),
            ];
        });

        return response()->json(['success' => true, 'rows' => $rows]);
    }

    /** GET /archive/students?class_id= — نموذج بيانات الطلاب لشعبة */
    public function students(Request $request)
    {
        // class_id = رقم الشعبة، أو all (مع missing_gender=1 لعرض كل الطلاب بدون جنس في المدرسة)
        $request->validate(['class_id' => 'required']);
        $all = $request->input('class_id') === 'all';
        $scoped = $this->scoped($request);
        if (!$all) {
            $request->validate(['class_id' => 'integer|exists:classes,id']);
            if ($scoped !== null && !in_array((int) $request->class_id, $scoped)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بهذه الشعبة.'], 403);
            }
        }

        $order = array_keys(self::GRADES);
        $students = Student::with(['parentUser:id,phone,national_id', 'schoolClass:id,grade_ar,section_ar,branch'])
            ->where('is_active', true)
            ->when(!$all, fn($q) => $q->where('class_id', (int) $request->class_id))
            ->when($all && $scoped !== null, fn($q) => $q->whereIn('class_id', $scoped))
            ->when($request->boolean('missing_gender'), fn($q) => $q->where(fn($w) => $w->whereNull('gender')->orWhereNotIn('gender', ['male', 'female'])))
            ->orderBy('name_ar')->orderBy('id')->get()
            // ترتيب الصفوف كما في المدرسة ثم الشعبة ثم الاسم
            ->sortBy(fn($s) => [
                ($i = array_search(trim((string) $s->schoolClass?->grade_ar), $order, true)) === false ? 99 : $i,
                (string) $s->schoolClass?->section_ar,
                $s->name_ar,
            ])->values();

        return response()->json([
            'success'  => true,
            'students' => $students->map(fn($s) => [
                'id'                   => $s->id,
                'name_ar'              => $s->name_ar,
                'class_id'             => $s->class_id,
                'class_name'           => $s->schoolClass ? trim($s->schoolClass->grade_ar . ' - ' . $s->schoolClass->section_ar) : '',
                'branch'               => $s->schoolClass?->branch,
                // 1 = تمهيدي–سادس (شعب مختلطة)، 2 = سابع فما فوق
                'stage'                => (self::GRADES[trim((string) $s->schoolClass?->grade_ar)] ?? [null, null])[1],
                'gender'               => $s->gender,
                'birth_date'           => $s->birth_date,
                'governorate'          => $s->governorate,
                'address'              => $s->address,
                'phone_call'           => $s->phone_call,
                'phone_whatsapp'       => $s->phone_whatsapp,
                'phone_other'          => $s->phone_other,
                'guardian_national_id' => $s->guardian_national_id,
                'archive_notes'        => $s->archive_notes,
                // قيم مبدئية من حساب ولي الأمر (تُقترح فقط إذا كانت الخانة فارغة، ولا تُحفظ إلا عند الحفظ)
                'parent_phone'         => $s->parentUser?->phone,
                'parent_national_id'   => $s->parentUser?->national_id,
            ])->values(),
        ]);
    }

    /** PUT /archive/students { students: [{id, ...حقول الاستمارة}] } — حفظ النموذج */
    public function saveStudents(Request $request)
    {
        $data = $request->validate([
            'students'                        => 'required|array',
            'students.*.id'                   => 'required|integer|exists:students,id',
            'students.*.birth_date'           => 'nullable|date',
            'students.*.governorate'          => 'nullable|string|max:100',
            'students.*.address'              => 'nullable|string|max:255',
            'students.*.phone_call'           => 'nullable|string|max:30',
            'students.*.phone_whatsapp'       => 'nullable|string|max:30',
            'students.*.phone_other'          => 'nullable|string|max:30',
            'students.*.guardian_national_id' => 'nullable|string|max:30',
            'students.*.archive_notes'        => 'nullable|string|max:2000',
        ]);

        $scoped = $this->scoped($request);
        DB::transaction(function () use ($data, $scoped) {
            foreach ($data['students'] as $row) {
                $updates = [];
                foreach (self::FORM_FIELDS as $f) {
                    if (array_key_exists($f, $row)) {
                        $v = is_string($row[$f]) ? trim($row[$f]) : $row[$f];
                        $updates[$f] = ($v === '' ? null : $v);
                    }
                }
                if (!$updates) continue;
                Student::where('id', $row['id'])
                    ->when($scoped !== null, fn($q) => $q->whereIn('class_id', $scoped))
                    ->update($updates);
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ بيانات الطلاب.']);
    }

    /** PUT /archive/genders { students: [{id, gender: male|female}] } — تحديد الجنس (لاكتمال الاحصائية) */
    public function saveGenders(Request $request)
    {
        $data = $request->validate([
            'students'          => 'required|array|min:1',
            'students.*.id'     => 'required|integer|distinct|exists:students,id',
            'students.*.gender' => 'required|in:male,female',
        ]);

        $scoped = $this->scoped($request);
        $saved = 0;
        DB::transaction(function () use ($data, $scoped, &$saved) {
            foreach ($data['students'] as $row) {
                $saved += Student::where('id', $row['id'])
                    ->when($scoped !== null, fn($q) => $q->whereIn('class_id', $scoped))
                    ->update(['gender' => $row['gender']]);
            }
        });

        if ($saved !== count($data['students'])) {
            return response()->json([
                'success' => false,
                'message' => 'لم يُحفظ الجنس لبعض الطلاب (خارج صلاحياتك). المحفوظ: ' . $saved . ' من ' . count($data['students']),
            ], 422);
        }

        return response()->json(['success' => true, 'saved' => $saved, 'message' => "تم حفظ الجنس لـ {$saved} طالب."]);
    }
}
