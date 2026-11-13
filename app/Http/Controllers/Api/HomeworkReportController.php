<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Schedule;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Services\PermissionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/**
 * نموذج تقرير شهري لمتابعة إرسال الواجبات
 * يعرض لكل مادة في الصف/الشعبة الأيام الدراسية التي أُرسل فيها واجب خلال الشهر.
 */
class HomeworkReportController extends Controller implements HasMiddleware
{
    /** أيام الدوام: السبت إلى الأربعاء (الخميس والجمعة عطلة) — كما في نموذج المدرسة الورقي */
    private const SCHOOL_DAYS = [
        Carbon::SATURDAY  => ['ar' => 'السبت', 'short' => 'س', 'en' => 'Saturday'],
        Carbon::SUNDAY    => ['ar' => 'الأحد', 'short' => 'ح', 'en' => 'Sunday'],
        Carbon::MONDAY    => ['ar' => 'الاثنين', 'short' => 'ن', 'en' => 'Monday'],
        Carbon::TUESDAY   => ['ar' => 'الثلاثاء', 'short' => 'ث', 'en' => 'Tuesday'],
        Carbon::WEDNESDAY => ['ar' => 'الأربعاء', 'short' => 'ر', 'en' => 'Wednesday'],
    ];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:assignments,view', only: ['monthly']),
        ];
    }

    /**
     * GET /api/reports/homework-monthly?class_id=..&month=YYYY-MM
     */
    public function monthly(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|integer|exists:classes,id',
            'month'    => ['required', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/'],
        ]);

        $classId = (int) $validated['class_id'];
        $user = $request->user();

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'assignments');
        if ($scopedClassIds !== null && !in_array($classId, array_map('intval', $scopedClassIds), true)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسموح لك بعرض تقرير هذا الصف.',
            ], 403);
        }

        $tz = config('app.timezone');
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $validated['month'] . '-01 00:00:00', $tz)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        // ===== الأيام الدراسية مجمعة حسب الأسبوع (الأسبوع يبدأ السبت) =====
        $days = [];
        $weekIndex = 0;
        $lastWeekStart = null;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dow = $d->dayOfWeek;
            if (!isset(self::SCHOOL_DAYS[$dow])) {
                continue;
            }
            $weekStart = $d->copy()->startOfWeek(Carbon::SATURDAY)->toDateString();
            if ($weekStart !== $lastWeekStart) {
                $weekIndex++;
                $lastWeekStart = $weekStart;
            }
            $days[] = [
                'date'          => $d->toDateString(),
                'day'           => $d->day,
                'weekday'       => $dow,
                'weekday_ar'    => self::SCHOOL_DAYS[$dow]['ar'],
                'weekday_short' => self::SCHOOL_DAYS[$dow]['short'],
                'week'          => $weekIndex,
            ];
        }

        // ===== الواجبات المرسلة خلال الشهر (حسب created_at بتوقيت التطبيق) =====
        // نوسّع النطاق يوماً من الجهتين ثم نفلتر بعد التحويل لتوقيت التطبيق
        $assignments = Assignment::query()
            ->where('class_id', $classId)
            ->whereBetween('created_at', [$start->copy()->subDay(), $end->copy()->addDay()])
            ->with('teacher:id,name,name_ar')
            ->get(['id', 'teacher_id', 'subject_id', 'class_id', 'created_at']);

        $homework = [];          // subject_id => [date => count]
        $assignmentTeachers = []; // subject_id => [teacher names]
        $monthKey = $start->format('Y-m');
        foreach ($assignments as $a) {
            if (!$a->created_at || !$a->subject_id) {
                continue;
            }
            $local = $a->created_at->copy()->setTimezone($tz);
            if ($local->format('Y-m') !== $monthKey) {
                continue;
            }
            $date = $local->toDateString();
            $homework[$a->subject_id][$date] = ($homework[$a->subject_id][$date] ?? 0) + 1;
            $name = $a->teacher->name_ar ?? $a->teacher->name ?? null;
            if ($name) {
                $assignmentTeachers[$a->subject_id][$name] = true;
            }
        }

        // ===== مواد الصف: teacher_subjects ∪ الجدول الدراسي ∪ مواد لها واجبات هذا الشهر =====
        $teacherSubjects = TeacherSubject::where('class_id', $classId)
            ->with('teacher:id,name,name_ar')
            ->get(['id', 'teacher_id', 'subject_id', 'class_id']);

        $assignedTeachers = []; // subject_id => [teacher names]
        foreach ($teacherSubjects as $ts) {
            $name = $ts->teacher->name_ar ?? $ts->teacher->name ?? null;
            if ($name) {
                $assignedTeachers[$ts->subject_id][$name] = true;
            }
        }

        $subjectIds = collect($teacherSubjects->pluck('subject_id'))
            ->merge(Schedule::where('class_id', $classId)->pluck('subject_id'))
            ->merge(array_keys($homework))
            ->filter()
            ->unique()
            ->values();

        $subjects = Subject::whereIn('id', $subjectIds)->orderBy('id')->get(['id', 'name_ar', 'name_en'])
            ->map(function ($s) use ($assignedTeachers, $assignmentTeachers, $homework) {
                $teachers = array_keys($assignedTeachers[$s->id] ?? $assignmentTeachers[$s->id] ?? []);
                $dates = $homework[$s->id] ?? [];
                ksort($dates);
                return [
                    'id'           => $s->id,
                    'name_ar'      => $s->name_ar,
                    'name_en'      => $s->name_en,
                    'teacher_name' => $teachers ? implode('، ', $teachers) : null,
                    'homework'     => (object) $dates, // { "YYYY-MM-DD": count }
                    'total'        => array_sum($dates),
                ];
            })
            ->values();

        $class = SchoolClass::find($classId);
        $weeksCount = $weekIndex;

        return response()->json([
            'success' => true,
            'school_name' => 'مدارس انوار العلى الدولية النموذجية',
            'class' => [
                'id'         => $class->id,
                'name_ar'    => $class->name_ar,
                'name_en'    => $class->name_en,
                'grade_ar'   => $class->grade_ar,
                'section_ar' => $class->section_ar,
            ],
            'month' => [
                'value' => $monthKey,
                'year'  => $start->year,
                'month' => $start->month,
                'start' => $start->toDateString(),
                'end'   => $end->toDateString(),
            ],
            'weeks_count' => $weeksCount,
            'days' => $days,
            'subjects' => $subjects,
            'total_assignments' => $subjects->sum('total'),
        ]);
    }
}
