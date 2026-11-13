<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * إصلاح بيانات الطلاب (موجودة في بيانات الاستضافة):
 *  1) طالب مسجل مرتين في نفس الشعبة (نفس الاسم): يُدمج المكرر في السجل الصحيح ثم يُحذف المكرر.
 *     - السجل المحتفَظ به: المرتبط بولي أمر، ثم الأكثر درجات، ثم الأحدث.
 *     - يُنقل للسجل الصحيح كل ما ليس عنده (درجات/حضور/تسليمات/إشعارات/دفعات/طلبات غياب/بلاغات).
 *     - إذا اختلفت بيانات نفس اليوم/الواجب/الدرجة بين السجلين → لا يُدمج، ويُعرض للمراجعة اليدوية.
 *     - إذا كان لكل سجل ولي أمر مختلف → لا يُدمج (قد يكونان طالبين مختلفين بنفس الاسم).
 *  2) رقم سري مكرر بين أكثر من طالب: يبقى مع أقدم طالب، ويأخذ الباقون رقماً جديداً غير مكرر.
 *  3) طالب بلا ولي أمر: يُعرض فقط (لا يمكن معرفة ولي أمره آلياً).
 *
 * الاستخدام:  php artisan students:fix-data           (عرض فقط — لا يغيّر شيئاً)
 *             php artisan students:fix-data --apply   (تنفيذ داخل معاملة واحدة)
 */
class FixStudentDataCommand extends Command
{
    protected $signature = 'students:fix-data {--apply : تنفيذ الإصلاح فعلياً (بدونه عرض فقط)}';
    protected $description = 'دمج الطلاب المكررين وإصلاح الأرقام السرية المكررة (عرض فقط بدون --apply)';

    /** جداول مرتبطة بالطالب + الأعمدة التي تمنع التكرار لكل طالب */
    private const RELATED = [
        'attendance'             => ['record_date'],
        'assignment_submissions' => ['assignment_id'],
        'grades'                 => ['subject_id', 'term', 'month', 'is_control'],
        'notifications'          => null,
        'payments'               => null,
        'absence_requests'       => null,
        'reports'                => null,
    ];

    /** أعمدة المقارنة عند وجود نفس الصف في السجلين */
    private const COMPARE = [
        'attendance'             => ['status', 'arrival_time', 'note'],
        'assignment_submissions' => ['status', 'teacher_note'],
        'grades'                 => ['homework', 'attendance', 'behavior', 'oral', 'written', 'coursework', 'final_exam'],
    ];

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $this->info($apply ? '== تنفيذ الإصلاح ==' : '== عرض فقط (لم يتغير شيء). للتنفيذ أضف --apply ==');

        $ok = true;
        DB::beginTransaction();
        try {
            $freedCodes = $this->mergeDuplicateStudents();
            $this->fixDuplicateSecretCodes($freedCodes);
            $this->reportOrphans();

            if ($apply) {
                DB::commit();
                $this->info('✓ تم الحفظ.');
            } else {
                DB::rollBack();
                $this->warn('لم يُحفظ شيء (عرض فقط).');
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('توقف الإصلاح ولم يُحفظ شيء: ' . $e->getMessage());
            $ok = false;
        }

        return $ok ? self::SUCCESS : self::FAILURE;
    }

    /** @return array<int,string> student_id المحتفظ به → الرقم السري للسجل المحذوف (لإعادة استخدامه) */
    private function mergeDuplicateStudents(): array
    {
        $this->line('');
        $this->info('1) الطلاب المكررون (نفس الاسم في نفس الشعبة):');
        $groups = DB::table('students')
            ->select('name_ar', 'class_id', DB::raw('COUNT(*) c'))
            ->whereNotNull('class_id')
            ->groupBy('name_ar', 'class_id')->having('c', '>', 1)->get();

        if ($groups->isEmpty()) {
            $this->line('   لا يوجد.');
            return [];
        }

        $freed = [];
        foreach ($groups as $g) {
            $rows = DB::table('students')->where('name_ar', $g->name_ar)->where('class_id', $g->class_id)->get();
            $parents = $rows->pluck('parent_id')->filter()->unique();
            if ($parents->count() > 1) {
                $this->warn("   ✗ «{$g->name_ar}»: لكل سجل ولي أمر مختلف — قد يكونان طالبين مختلفين. يحتاج مراجعة يدوية.");
                continue;
            }

            $keeper = $rows->sortByDesc(fn($s) => [
                $s->parent_id ? 1 : 0,
                DB::table('grades')->where('student_id', $s->id)->count(),
                $s->created_at,
            ])->first();

            foreach ($rows->where('id', '!=', $keeper->id) as $dup) {
                $plan = $this->planMerge($dup->id, $keeper->id);
                if ($plan['conflicts']) {
                    $this->warn("   ✗ «{$g->name_ar}» ({$dup->id}): بيانات مختلفة بين السجلين في " . implode('، ', $plan['conflicts']) . ' — لم يُدمج، يحتاج مراجعة يدوية.');
                    continue;
                }
                $moved = [];
                foreach ($plan['move'] as $table => $ids) {
                    if ($ids) {
                        DB::table($table)->whereIn('id', $ids)->update(['student_id' => $keeper->id]);
                        $moved[] = "{$table}: " . count($ids);
                    }
                }
                $dupCounts = collect($plan['identical'])->filter()->map(fn($n, $t) => "{$t}: {$n}")->values()->all();
                DB::table('students')->where('id', $dup->id)->delete(); // يحذف معه نسخه المكررة (CASCADE)
                if ($dup->secret_code) {
                    // رقم السجل المحذوف أصبح متاحاً — يُستخدم للسجل الصحيح إن كان رقمه مكرراً
                    $freed[$keeper->id] = $dup->secret_code;
                }
                $this->line("   ✓ «{$g->name_ar}»: الاحتفاظ بالسجل {$keeper->id}" . ($keeper->parent_id ? " (ولي الأمر {$keeper->parent_id})" : '')
                    . "، حذف المكرر {$dup->id}.");
                $this->line('     نُقل للسجل الصحيح: ' . ($moved ? implode('، ', $moved) : 'لا شيء'));
                $this->line('     حُذف مع المكرر (نسخ مطابقة موجودة أصلاً في السجل الصحيح): ' . ($dupCounts ? implode('، ', $dupCounts) : 'لا شيء'));
            }
        }
        return $freed;
    }

    /** يحدد ما يُنقل، وما هو مطابق (يُحذف مع المكرر)، وما يتعارض */
    private function planMerge(int $dupId, int $keeperId): array
    {
        $move = [];
        $identical = [];
        $conflicts = [];
        foreach (self::RELATED as $table => $keys) {
            $dupRows = DB::table($table)->where('student_id', $dupId)->get();
            $move[$table] = [];
            $identical[$table] = 0;
            foreach ($dupRows as $r) {
                if ($keys === null) { $move[$table][] = $r->id; continue; }
                $q = DB::table($table)->where('student_id', $keeperId);
                foreach ($keys as $k) $q->where($k, $r->$k);
                $same = $q->first();
                if (!$same) { $move[$table][] = $r->id; continue; }
                $differs = collect(self::COMPARE[$table] ?? [])->contains(function ($c) use ($r, $same) {
                    $a = (string) ($r->$c ?? '');
                    $b = (string) ($same->$c ?? '');
                    // وقت الحضور: نفس المشرف يسجّل السجلين بفارق ثانية — فرق حتى دقيقة يُعدّ نفس التسجيل
                    if ($c === 'arrival_time' && $a !== '' && $b !== '') {
                        return abs(strtotime("1970-01-01 $a") - strtotime("1970-01-01 $b")) > 60;
                    }
                    return $a !== $b;
                });
                if ($differs) $conflicts[$table] = $table; else $identical[$table]++;
            }
        }
        return ['move' => $move, 'identical' => $identical, 'conflicts' => array_values($conflicts)];
    }

    /** @param array<int,string> $freedCodes */
    private function fixDuplicateSecretCodes(array $freedCodes): void
    {
        $this->line('');
        $this->info('2) الأرقام السرية المكررة:');
        $dups = DB::table('students')->whereNotNull('secret_code')->where('secret_code', '!=', '')
            ->select('secret_code')->groupBy('secret_code')->havingRaw('COUNT(*) > 1')->pluck('secret_code');

        if ($dups->isEmpty()) {
            $this->line('   لا يوجد.');
            return;
        }

        foreach ($dups as $code) {
            $students = DB::table('students')->where('secret_code', $code)->orderBy('id')->get(['id', 'name_ar', 'secret_code']);
            $keep = $students->first();
            $this->line("   الرقم {$code}: يبقى مع «{$keep->name_ar}» ({$keep->id})");
            foreach ($students->slice(1) as $s) {
                $new = null;
                if (isset($freedCodes[$s->id]) && !DB::table('students')->where('secret_code', $freedCodes[$s->id])->exists()) {
                    $new = $freedCodes[$s->id]; // رقمه السابق من سجله المكرر المحذوف
                }
                $new ??= $this->newUniqueCode($s->id);
                $hasControl = DB::table('grades')->where('student_id', $s->id)->where('is_control', 1)->exists();
                DB::table('students')->where('id', $s->id)->update(['secret_code' => $new, 'updated_at' => now()]);
                $this->line("     → «{$s->name_ar}» ({$s->id}): رقم جديد {$new}" . ($hasControl ? '  ⚠ له درجات كنترول مرصودة' : ''));
            }
        }
    }

    /** نفس صيغة النظام: SEC-NNNN، مع التأكد أنه غير مستخدم */
    private function newUniqueCode(int $studentId): string
    {
        $n = ($studentId * 3 + 1000) % 10000;
        for ($i = 0; $i < 10000; $i++) {
            $code = 'SEC-' . str_pad((string) (($n + $i) % 10000), 4, '0', STR_PAD_LEFT);
            if (!DB::table('students')->where('secret_code', $code)->exists()) return $code;
        }
        throw new \RuntimeException('لا يوجد رقم سري متاح');
    }

    private function reportOrphans(): void
    {
        $this->line('');
        $this->info('3) طلاب بلا ولي أمر:');
        $orphans = DB::table('students')
            ->where(fn($q) => $q->whereNull('parent_id')->orWhereNotIn('parent_id', DB::table('users')->select('id')))
            ->get(['id', 'name_ar', 'class_id']);
        if ($orphans->isEmpty()) {
            $this->line('   لا يوجد.');
            return;
        }
        foreach ($orphans as $o) {
            $this->warn("   ! «{$o->name_ar}» ({$o->id}) — اربطه بولي أمره من صفحة الطلاب.");
        }
    }
}
