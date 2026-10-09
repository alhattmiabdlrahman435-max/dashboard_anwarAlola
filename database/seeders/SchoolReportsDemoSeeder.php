<?php

namespace Database\Seeders;

use App\Support\SchoolReportsDemoDatabase;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/** Deterministic fixtures on a dedicated demo database; never truncates a table or disables FKs. */
class SchoolReportsDemoSeeder extends Seeder
{
    private string $passwordHash;

    private array $classes = [];

    private array $subjects = [];

    private array $teachers = [];

    private array $parents = [];

    private array $students = [];

    private int $admin;

    private int $preparation;

    public function run(): void
    {
        SchoolReportsDemoDatabase::assertSafeConnection();
        $this->passwordHash = Hash::make(SchoolReportsDemoDatabase::PASSWORD);
        DB::transaction(function () {
            $this->seedStructure();
            $this->seedPeople();
            $this->seedFinanceAndGrades();
            $this->seedAttendance();
            $this->seedSchoolActivities();
        });
        $this->command?->info('School reports demo seeded. No current-school data was modified.');
    }

    private function row(string $table, array $key, array $values): int
    {
        DB::table($table)->updateOrInsert($key, $values + ['created_at' => '2026-08-01 08:00:00', 'updated_at' => '2026-08-01 08:00:00']);

        return (int) DB::table($table)->where($key)->value('id');
    }

    private function user(string $username, string $role, string $arabic, string $english, int $number, array $permissions = []): int
    {
        return $this->row('users', ['username' => $username], [
            'name' => $arabic, 'name_ar' => $arabic, 'name_en' => $english, 'role' => $role,
            'national_id' => '990'.str_pad((string) $number, 7, '0', STR_PAD_LEFT),
            'job_id' => $role === 'parent' ? null : 'DEMO-JOB-'.$number,
            'phone' => '000'.str_pad((string) $number, 6, '0', STR_PAD_LEFT),
            'address' => 'عنوان تجريبي — لا يمثل شخصًا حقيقيًا', 'photo_url' => null, 'is_active' => true,
            'password' => $this->passwordHash, 'permissions' => json_encode($permissions), 'fcm_token' => null,
        ]);
    }

    private function seedStructure(): void
    {
        foreach ([7 => 'السابع', 8 => 'الثامن', 9 => 'التاسع'] as $grade => $arabic) {
            $level = $this->row('grade_levels', ['order_no' => $grade], ['name_ar' => 'الصف '.$arabic, 'name_en' => 'Grade '.$grade]);
            foreach (['أ' => 'A', 'ب' => 'B'] as $section => $english) {
                $key = $grade.$english;
                $id = $this->row('classes', ['grade_level_id' => $level, 'section_en' => $english], [
                    'grade_ar' => 'الصف '.$arabic, 'grade_en' => 'Grade '.$grade, 'section_ar' => $section,
                ]);
                $this->classes[$key] = ['id' => $id, 'grade' => $grade, 'subjects' => $grade - 1,
                    'students' => match ($key) {
                        '7A' => 32, '7B' => 28, '8A', '8B' => 30, default => 24
                    }];
            }
        }
        $level = (int) DB::table('grade_levels')->where('order_no', 9)->value('id');
        foreach (['C' => ['ج', 4], 'D' => ['د', 0]] as $section => [$arabic, $count]) {
            $id = $this->row('classes', ['grade_level_id' => $level, 'section_en' => $section], ['grade_ar' => 'الصف التاسع', 'grade_en' => 'Grade 9', 'section_ar' => $arabic]);
            $this->classes['9'.$section] = ['id' => $id, 'grade' => 9, 'subjects' => 0, 'students' => $count];
        }
        foreach ([['الرياضيات', 'Mathematics'], ['اللغة العربية', 'Arabic'], ['اللغة الإنجليزية', 'English'], ['العلوم', 'Science'],
            ['التربية الإسلامية', 'Islamic Education'], ['الاجتماعيات', 'Social Studies'], ['القرآن الكريم', 'Quran'], ['الحاسوب', 'Computer Studies']] as $i => [$arabic, $english]) {
            $this->subjects[$i + 1] = $this->row('subjects', ['name_en' => $english], ['name_ar' => $arabic]);
        }
    }

    private function seedPeople(): void
    {
        $this->admin = $this->user('demo-admin', 'admin', 'مدير المدرسة التجريبية', 'Demo School Director', 1);
        $full = $this->user('demo-supervisor', 'supervisor', 'وكيل المدرسة التجريبية', 'Demo Vice Principal', 2, ['full_access' => true]);
        $this->preparation = $this->user('demo-preparation', 'preparation_supervisor', 'مشرف التحضير التجريبي', 'Demo Attendance Supervisor', 3);
        $scope = fn (array $ids, array $actions) => ['actions' => $actions, 'scope' => 'class', 'scope_ids' => $ids];
        $financeClass = [$this->classes['7A']['id']];
        $finance = $this->user('demo-finance', 'supervisor', 'مراجع مالي — السابع أ فقط', 'Scoped Finance Reviewer', 4,
            ['reports' => $scope($financeClass, ['view', 'export']), 'finance' => $scope($financeClass, ['view']), 'students' => $scope($financeClass, ['view'])]);
        $academicClasses = [$this->classes['8A']['id'], $this->classes['8B']['id']];
        $academic = $this->user('demo-academic', 'supervisor', 'مراجع أكاديمي — الثامن دون تصدير', 'Read-only Academic Reviewer', 5,
            ['reports' => $scope($academicClasses, ['view']), 'detailedGrades' => $scope($academicClasses, ['view']),
                'scanner' => $scope($academicClasses, ['view']), 'students' => $scope($academicClasses, ['view'])]);
        foreach ($this->classes as $class) {
            foreach ([$full, $this->preparation] as $supervisor) {
                $this->row('supervisor_classes', ['supervisor_id' => $supervisor, 'class_id' => $class['id']], []);
            }
        }
        foreach ([[$finance, $financeClass], [$academic, $academicClasses]] as [$user, $ids]) {
            foreach ($ids as $id) {
                $this->row('supervisor_classes', ['supervisor_id' => $user, 'class_id' => $id], []);
            }
        }
        foreach ($this->subjects as $number => $subject) {
            $this->teachers[$number] = $this->user('demo-teacher-'.$number, 'teacher', 'معلم تجريبي '.$number, 'Demo Teacher '.$number, 10 + $number);
            foreach ($this->classes as $class) {
                if ($number <= $class['subjects']) {
                    $this->row('teacher_subjects', ['teacher_id' => $this->teachers[$number], 'subject_id' => $subject, 'class_id' => $class['id']], []);
                }
            }
        }
        foreach (range(1, 86) as $number) {
            $this->parents[$number] = $this->user('demo-parent-'.$number, 'parent', 'ولي أمر تجريبي '.$number, 'Demo Parent '.$number, 100 + $number);
        }
        $number = 0;
        foreach ($this->classes as $key => $class) {
            for ($position = 1; $position <= $class['students']; $position++) {
                $number++;
                $family = ($number - 1) % 86 + 1;
                $code = 'DEMO-2026-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT);
                $scenario = match ($number) {
                    1 => 'درجات كاملة', 2 => 'صفر مرصود', 3 => 'محصلة ناقصة', 4 => 'اختبار الفصل الثاني ناقص',
                    5 => 'لا يوجد رصد', 6 => 'كنترول فقط', 7 => 'الفصل الثاني فقط', 8 => 'الفصل الأول فقط',
                    9 => 'غير نشط', 10 => 'رصيد دائن', 11 => 'رسوم صفرية', 12 => 'اختبار فارغ', default => 'بيانات متنوعة',
                };
                $id = $this->row('students', ['student_code' => $code], [
                    'name_ar' => sprintf('طالب تجريبي %03d — %s', $number, $scenario), 'name_en' => 'Demo Student '.str_pad((string) $number, 3, '0', STR_PAD_LEFT),
                    'class_id' => $class['id'], 'parent_id' => $this->parents[$family], 'photo_url' => null,
                    'qr_code' => $code, 'secret_code' => 'DEM'.str_pad((string) $number, 5, '0', STR_PAD_LEFT),
                    'enrollment_date' => '2026-08-01', 'is_active' => $number !== 9,
                    'tuition_fee' => $number === 11 ? 0 : 4000 + ($class['grade'] - 7) * 1000,
                ]);
                $this->students[$number] = ['id' => $id, 'code' => $code, 'class' => $key, 'parent' => $this->parents[$family]];
            }
        }
    }

    private function seedFinanceAndGrades(): void
    {
        $grades = [];
        foreach ($this->students as $number => $student) {
            $class = $this->classes[$student['class']];
            $fee = $number === 11 ? 0 : 4000 + ($class['grade'] - 7) * 1000;
            $parts = $number === 10 ? [0.6, 0.6] : ($number === 11 ? [] : match ($number % 4) {
                0 => [], 1 => [0.5, 0.5], 2 => [0.25, 0.25], 3 => [0.25]
            });
            foreach ($parts as $i => $fraction) {
                $this->row('payments', ['reference_no' => 'DEMO-PAY-'.$number.'-'.($i + 1)], [
                    'student_id' => $student['id'], 'amount' => $fee * $fraction, 'payment_date' => $i === 0 ? '2026-09-10' : '2027-02-10', 'recorded_by' => $this->admin,
                ]);
            }
            for ($sub = 1; $sub <= $class['subjects']; $sub++) {
                foreach ([1, 2] as $term) {
                    // Control data is separate; deliberately disagreeing values expose accidental source mixing.
                    $grades[] = $this->grade($student['id'], $this->subjects[$sub], $term, 0, true, 0, 82 + $number % 19);
                    foreach ([1, 2, 3, 0] as $month) {
                        if (in_array($number, [5, 6], true) || ($number === 7 && $term === 1) || ($number === 8 && $term === 2)
                            || ($number === 3 && $term === 1 && $month === 2 && $sub === 1)
                            || ($number === 4 && $term === 2 && $month === 0 && $sub === 3)) {
                            continue;
                        }
                        $ratio = $number === 1 ? 1 : ($number === 2 ? 0 : (40 + ($number * 13 + $sub * 7 + $term * 11 + $month * 3) % 61) / 100);
                        $final = $month === 0 ? round(30 * $ratio, 2) : null;
                        if ($number === 12 && $month === 0 && $term === 2 && $sub === 1) {
                            $final = null;
                        }
                        $grades[] = $this->grade($student['id'], $this->subjects[$sub], $term, $month, false, $month ? $ratio : 0, $final);
                    }
                }
            }
        }
        foreach (array_chunk($grades, 100) as $chunk) {
            DB::table('grades')->upsert($chunk,
                ['student_id', 'subject_id', 'term', 'month', 'is_control'], ['homework', 'attendance', 'behavior', 'oral', 'written', 'final_exam', 'updated_at']);
        }
    }

    private function grade(int $student, int $subject, int $term, int $month, bool $control, float $ratio, ?float $exam): array
    {
        return ['student_id' => $student, 'subject_id' => $subject, 'term' => $term, 'month' => $month, 'is_control' => $control,
            'homework' => round(15 * $ratio, 2), 'attendance' => round(15 * $ratio, 2), 'behavior' => round(10 * $ratio, 2),
            'oral' => round(10 * $ratio, 2), 'written' => round(50 * $ratio, 2), 'final_exam' => $exam,
            'created_at' => $term === 1 ? '2026-12-15 08:00:00' : '2027-05-15 08:00:00',
            'updated_at' => $term === 1 ? '2026-12-15 08:00:00' : '2027-05-15 08:00:00'];
    }

    private function seedAttendance(): void
    {
        foreach ([1 => '2026-09-06', 2 => '2027-02-07'] as $term => $start) {
            $dates = [];
            $day = CarbonImmutable::parse($start);
            while (count($dates) < 15) {
                if (! in_array($day->dayOfWeek, [CarbonImmutable::FRIDAY, CarbonImmutable::SATURDAY], true)) {
                    $dates[] = $day->toDateString();
                }
                $day = $day->addDay();
            }
            foreach ($dates as $index => $date) {
                foreach ($this->classes as $class) {
                    if ($class['students']) {
                        $this->row('attendance_submissions', ['class_id' => $class['id'], 'record_date' => $date], ['submitted_by' => $this->preparation]);
                    }
                }
                foreach ($this->students as $number => $student) {
                    // No attendance for 5; explicit absence for 2; a day gap for 3.
                    if ($number === 5 || $number === 9 || ($number === 3 && $index === 4)) {
                        continue;
                    }
                    $absent = $number === 2 || ($number + $index + $term) % 9 === 0;
                    $this->row('attendance', ['student_id' => $student['id'], 'record_date' => $date], [
                        'status' => $absent ? 'absent' : 'present', 'arrival_time' => $absent ? null : ($number % 6 === 0 ? '08:15:00' : '07:40:00'),
                        'note' => $absent ? 'غياب تجريبي' : ($number % 6 === 0 ? 'تأخر تجريبي' : null), 'created_by' => $this->preparation,
                    ]);
                }
            }
        }
    }

    private function seedSchoolActivities(): void
    {
        $busy = [];
        foreach ($this->classes as $key => $class) {
            if (! $class['subjects']) {
                continue;
            }
            foreach (['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'] as $dayIndex => $day) {
                for ($period = 1; $period <= 6; $period++) {
                    $sub = ($dayIndex * 6 + $period - 1) % $class['subjects'] + 1;
                    while (isset($busy[$day][$period][$sub])) {
                        $sub = $sub % $class['subjects'] + 1;
                    }
                    $busy[$day][$period][$sub] = true;
                    $this->row('schedules', ['class_id' => $class['id'], 'day_of_week' => $day, 'period' => $period], ['subject_id' => $this->subjects[$sub]]);
                }
            }
            foreach ([1 => '2026-12-13', 2 => '2027-05-09'] as $term => $date) {
                $exam = $this->row('exam_schedules', ['title' => 'DEMO — اختبارات الفصل '.$term.' — '.$key], ['class_id' => $class['id'], 'term' => $term === 1 ? 'الترم الأول' : 'الترم الثاني', 'created_by' => $this->admin]);
                $examDate = CarbonImmutable::parse($date);
                for ($sub = 1; $sub <= $class['subjects']; $sub++) {
                    while (in_array($examDate->dayOfWeek, [CarbonImmutable::FRIDAY, CarbonImmutable::SATURDAY], true)) {
                        $examDate = $examDate->addDay();
                    }
                    $this->row('exam_subjects', ['exam_schedule_id' => $exam, 'subject_id' => $this->subjects[$sub]], ['exam_date' => $examDate->toDateString(), 'exam_time' => '08:00', 'note' => 'جدول تجريبي للفصل '.$term]);
                    $examDate = $examDate->addDay();
                }
                foreach ([1, 2] as $sub) {
                    $assignment = $this->row('assignments', ['title' => 'DEMO — واجب '.$key.' — الفصل '.$term.' — المادة '.$sub], [
                        'teacher_id' => $this->teachers[$sub], 'class_id' => $class['id'], 'subject_id' => $this->subjects[$sub],
                        'content' => 'أسئلة مراجعة تجريبية لاختبار الواجبات وتسليماتها.', 'date_created' => $term === 1 ? '2026-09-06' : '2027-02-07',
                        'due_date' => $term === 1 ? '2026-09-13' : '2027-02-14', 'attachment_url' => null,
                    ]);
                    foreach ($this->students as $number => $student) {
                        if ($student['class'] === $key) {
                            $submitted = $number % 3 !== 0;
                            $this->row('assignment_submissions', ['assignment_id' => $assignment, 'student_id' => $student['id']], ['status' => $submitted ? 'submitted' : 'pending',
                                'submitted_at' => $submitted ? ($term === 1 ? '2026-09-10 10:00:00' : '2027-02-10 10:00:00') : null,
                                'attachment_url' => null, 'teacher_note' => $submitted ? 'تمت المراجعة التجريبية.' : null]);
                        }
                    }
                }
            }
        }
        foreach ([1, 2] as $term) {
            foreach ([1 => 'pending', 2 => 'approved', 3 => 'rejected'] as $number => $status) {
                $student = $this->students[$number];
                $date = $term === 1 ? '2026-09-15' : '2027-02-16';
                $this->row('absence_requests', ['student_id' => $student['id'], 'start_date' => $date], ['parent_id' => $student['parent'], 'end_date' => $date,
                    'reason_ar' => 'طلب غياب تجريبي للفصل '.$term, 'reason_en' => 'Demo absence request for term '.$term, 'status' => $status,
                    'attachment_url' => null, 'admin_note_ar' => $status === 'pending' ? null : 'مراجعة تجريبية',
                    'reviewed_by' => $status === 'pending' ? null : $this->admin, 'reviewed_at' => $status === 'pending' ? null : $date.' 09:00:00']);
                $this->row('reports', ['student_id' => $student['id'], 'description' => 'DEMO — متابعة الطالب '.$number.' للفصل '.$term], ['teacher_id' => $this->teachers[1],
                    'type' => $number === 2 ? 'behavioral' : 'academic', 'status' => match ($number) {
                        1 => 'pending', 2 => 'reviewed', 3 => 'archived'
                    }, 'image_url' => null]);
            }
        }
        foreach ([['عام', 'general', null, null], ['للشعبة', 'info', $this->classes['7A']['id'], null], ['مالي', 'finance', null, $this->students[4]['id']]] as [$title, $type, $class, $student]) {
            $this->row('notifications', ['title' => 'DEMO — إشعار '.$title], ['content' => 'إشعار محفوظ محليًا لاختبار عرض البيانات؛ لا يُرسل إلى أي جهاز.',
                'type' => $type, 'class_id' => $class, 'student_id' => $student, 'teacher_id' => null, 'is_read' => false, 'attachment_url' => null]);
        }
        // Publication markers are stored locally only. The sibling's grades remain unpublished.
        foreach ([1, 2] as $term) {
            foreach (['m1', 'm2', 'm3', 'final'] as $period) {
                $this->row('notifications', ['title' => 'DEMO — نشر درجات الطالب 1 — '.$term.' — '.$period], [
                    'content' => 'علامة نشر تجريبية لاختبار إتاحة الدرجات لولي الأمر دون إرسال خارجي.',
                    'type' => 'grade_published:term'.$term.':'.$period, 'student_id' => $this->students[1]['id'],
                    'class_id' => null, 'teacher_id' => null, 'is_read' => false, 'attachment_url' => null,
                ]);
            }
        }
        foreach (['inquiry', 'suggestion', 'complaint'] as $type) {
            $this->row('contact_messages', ['message' => 'DEMO — رسالة تواصل '.$type], [
                'name' => 'زائر تجريبي', 'phone' => '000000000', 'type' => $type,
            ]);
        }
    }
}
