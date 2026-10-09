<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use App\Support\SchoolReportsDemoDatabase;
use Database\Seeders\SchoolReportsDemoSeeder;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

class SchoolReportsDemoSeederTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
        DB::setDefaultConnection('sqlite');
        Http::preventStrayRequests();
        Artisan::call('migrate', ['--database' => 'sqlite', '--force' => true]);
        (new SchoolReportsDemoSeeder)->run();
    }

    private function student(int $number): Student
    {
        return Student::where('student_code', 'DEMO-2026-'.str_pad((string) $number, 4, '0', STR_PAD_LEFT))->firstOrFail();
    }

    private function login(string $username = 'demo-admin'): void
    {
        Sanctum::actingAs(User::where('username', $username)->firstOrFail());
    }

    public function test_full_dataset_has_valid_relationships_and_can_be_seeded_twice(): void
    {
        $tables = ['users', 'classes', 'subjects', 'students', 'grades', 'payments', 'assignments', 'assignment_submissions', 'attendance', 'exam_subjects'];
        $before = [];
        foreach ($tables as $table) {
            $before[$table] = DB::table($table)->count();
        }
        $this->assertSame(99, $before['users']);
        $this->assertSame(172, $before['students']);
        $this->assertSame(8, $before['classes']);
        $this->assertSame(11494, $before['grades']);
        $this->assertSame(214, $before['payments']);
        $this->assertCount(0, DB::select('PRAGMA foreign_key_check'));
        $this->assertSame(86, User::parents()->count());
        $this->assertSame(8, User::teachers()->count());
        $this->assertSame(0, Student::whereHas('parentUser', fn ($query) => $query->where('role', '!=', 'parent'))->count());
        $this->assertSame(2, $this->student(1)->parentUser->children()->count());
        $conflicts = DB::table('schedules')->join('teacher_subjects', fn ($join) => $join->on('teacher_subjects.class_id', '=', 'schedules.class_id')->on('teacher_subjects.subject_id', '=', 'schedules.subject_id'))
            ->select('teacher_subjects.teacher_id', 'day_of_week', 'period')->groupBy('teacher_subjects.teacher_id', 'day_of_week', 'period')->havingRaw('COUNT(*) > 1')->get();
        $this->assertCount(0, $conflicts, 'Demo teachers must not be scheduled in two classes at the same time.');
        $this->assertSame(0, DB::table('assignment_submissions')->join('assignments', 'assignments.id', '=', 'assignment_submissions.assignment_id')
            ->join('students', 'students.id', '=', 'assignment_submissions.student_id')->whereColumn('assignments.class_id', '!=', 'students.class_id')->count());
        (new SchoolReportsDemoSeeder)->run();
        foreach ($before as $table => $count) {
            $this->assertSame($count, DB::table($table)->count(), $table.' duplicated on rerun');
        }
        $this->assertCount(0, DB::select('PRAGMA foreign_key_check'));
    }

    public function test_report_results_match_known_financial_and_academic_cases(): void
    {
        $this->login();
        $first = $this->student(1);
        $zero = $this->student(2);
        $missing = $this->student(3);
        $this->getJson('/api/school-reports/finance?class_ids[]='.$first->class_id)->assertOk()
            ->assertJsonPath('summary.students', 31)->assertJsonPath('totals.fees', 120000)->assertJsonPath('totals.paid', 53800)->assertJsonPath('totals.remaining', 66200);
        $this->getJson('/api/school-reports/registry')->assertOk()->assertJsonPath('summary.students', 171);
        foreach (['term-result' => [300, 300], 'annual-result' => [600, 600]] as $key => [$total, $maximum]) {
            $this->getJson('/api/school-reports/'.$key.'?student_id='.$first->id)->assertOk()->assertJsonPath('summary.complete', 1)
                ->assertJsonPath('summary.total', $total)->assertJsonPath('summary.maximum', $maximum)->assertJsonPath('summary.percentage', 100);
            $this->getJson('/api/school-reports/'.$key.'?student_id='.$zero->id)->assertOk()->assertJsonPath('summary.complete', 1)->assertJsonPath('summary.total', 0);
        }
        foreach ([3, 4, 5, 6, 7, 8, 12, 169] as $number) {
            $this->getJson('/api/school-reports/annual-result?student_id='.$this->student($number)->id)->assertOk()
                ->assertJsonPath('summary.complete', 0)->assertJsonPath('summary.total', null);
        }
        $math = (int) DB::table('subjects')->where('name_en', 'Mathematics')->value('id');
        $this->getJson('/api/school-reports/month?student_id='.$missing->id.'&month=2')->assertOk()->assertJsonPath('rows.0.subject_'.$math, null)->assertJsonPath('rows.0.status', 'incomplete');
        $this->getJson('/api/school-reports/term?student_id='.$first->id.'&subject_id='.$math)->assertOk()->assertJsonPath('rows.0.work', 20)->assertJsonPath('rows.0.exam', 30)->assertJsonPath('rows.0.total', 50);
        $this->getJson('/api/school-reports/term?student_id='.$first->id.'&term=2')->assertOk()->assertJsonPath('rows.0.total', 300);
        $this->getJson('/api/school-reports/attendance?student_id='.$zero->id.'&from=2026-09-06&to=2026-09-24')->assertOk()->assertJsonPath('rows.0.absent', 15)->assertJsonPath('rows.0.rate', 0);
        $this->getJson('/api/school-reports/attendance?student_id='.$this->student(5)->id.'&from=2027-02-07&to=2027-02-25')->assertOk()->assertJsonPath('rows.0.recorded', 0)->assertJsonPath('rows.0.rate', null);
    }

    public function test_scoped_accounts_cannot_read_or_export_outside_their_permissions(): void
    {
        $this->login('demo-finance');
        $this->assertSame(['registry', 'finance'], $this->getJson('/api/school-reports/options')->assertOk()->json('reports.*.key'));
        $this->getJson('/api/school-reports/finance?class_ids[]='.$this->student(61)->class_id)->assertForbidden();
        $this->getJson('/api/school-reports/term')->assertForbidden();
        $this->login('demo-academic');
        $this->getJson('/api/school-reports/term')->assertOk()->assertJsonPath('summary.students', 60);
        $this->getJson('/api/school-reports/term?export=1')->assertForbidden();
        $this->getJson('/api/school-reports/finance')->assertForbidden();
        $this->login('demo-parent-1');
        $this->getJson('/api/students/'.$this->student(1)->id)->assertOk();
        $this->getJson('/api/students/'.$this->student(2)->id)->assertForbidden();
        $published = $this->getJson('/api/grades/detailed/'.$this->student(1)->id)->assertOk()->assertJsonPath('success', true);
        $this->assertNotEmpty($published->json('grades'));
        $this->assertFalse(collect($published->json('grades'))->contains(fn ($grade) => (bool) $grade['is_control']), 'Detailed grades must not include control exam scores.');
        $this->getJson('/api/grades/detailed/'.$this->student(87)->id)->assertOk()->assertJsonCount(0, 'grades');
        $this->getJson('/api/school-reports/options')->assertForbidden();
    }

    public function test_core_pages_can_load_real_seeded_data(): void
    {
        $this->login();
        foreach (['students', 'parents', 'teachers', 'classes', 'subjects', 'attendance', 'absence-requests', 'assignments', 'exam-schedules', 'schedules',
            'reports', 'notifications', 'finance/students', 'finance/stats', 'dashboard/stats', 'grades/control', 'grades/class/'.$this->student(1)->class_id] as $endpoint) {
            $this->getJson('/api/'.$endpoint)->assertOk();
        }
    }

    public function test_real_login_and_save_requests_preserve_values_and_do_not_log_passwords(): void
    {
        // This temporary storage directory isolates the logging regression check from any historical logs.
        $temporaryStorage = storage_path('app/school-reports-demo/test-storage-'.bin2hex(random_bytes(5)));
        File::ensureDirectoryExists($temporaryStorage.'/logs');
        $this->app->useStoragePath($temporaryStorage);
        $this->postJson('/api/login', ['username' => 'demo-admin', 'password' => SchoolReportsDemoDatabase::PASSWORD, 'role' => 'admin'])->assertOk()->assertJsonPath('success', true);
        $this->assertFileDoesNotExist($temporaryStorage.'/logs/login_debug.log');
        $this->login();
        $student = $this->student(1);
        $subject = (int) DB::table('subjects')->where('name_en', 'Mathematics')->value('id');
        $this->postJson('/api/grades/detailed', ['student_id' => $student->id, 'subject_id' => $subject, 'term' => 'term1', 'month' => 'm1',
            'hw_grade' => 12, 'att_grade' => 13, 'beh_grade' => 8, 'oral_grade' => 9, 'wrt_grade' => 40])->assertOk();
        $record = DB::table('grades')->where(['student_id' => $student->id, 'subject_id' => $subject, 'term' => 1, 'month' => 1, 'is_control' => false])->first();
        $this->assertEquals(12, $record->homework);
        $this->assertEquals(40, $record->written);
        $this->getJson('/api/school-reports/term?student_id='.$student->id)->assertOk()->assertJsonPath('rows.0.total', 298.8);
        $this->getJson('/api/school-reports/term?student_id='.$student->id.'&term=2')->assertOk()->assertJsonPath('rows.0.total', 300);
        $this->postJson('/api/finance/payment', ['student_id' => $student->id, 'amount' => 250, 'payment_date' => '2026-10-08', 'reference_no' => 'DEMO-ROUNDTRIP'])->assertOk();
        $this->getJson('/api/school-reports/finance?student_id='.$student->id)->assertOk()->assertJsonPath('rows.0.paid', 4250)->assertJsonPath('rows.0.remaining', -250);
        $this->assertSame(0, DB::table('user_fcm_tokens')->count());
    }

    public function test_invalid_grade_inputs_are_rejected_without_overwriting_existing_grades(): void
    {
        $this->login();
        $student = $this->student(1);
        $subject = (int) DB::table('subjects')->where('name_en', 'Mathematics')->value('id');
        $base = ['student_id' => $student->id, 'subject_id' => $subject, 'term' => 'term1', 'month' => 'm1'];
        foreach ([['hw_grade' => 16], ['wrt_grade' => -1], ['final_exam' => 31, 'month' => 'final'], ['term' => 'wrong-term'], ['month' => 'wrong-month']] as $invalid) {
            $this->postJson('/api/grades/detailed', array_replace($base, $invalid))->assertUnprocessable();
        }
        $this->assertEquals(15, DB::table('grades')->where(['student_id' => $student->id, 'subject_id' => $subject, 'term' => 1, 'month' => 1, 'is_control' => false])->value('homework'));
    }

    public function test_guard_refuses_the_current_school_database_without_querying_or_modifying_it(): void
    {
        $path = database_path('database.sqlite');
        $hash = hash_file('sha256', $path);
        DB::purge('sqlite');
        config(['database.connections.sqlite.database' => $path]);
        $queries = [];
        DB::listen(function ($query) use (&$queries) {
            $queries[] = $query->sql;
        });
        try {
            (new SchoolReportsDemoSeeder)->run();
            $this->fail('The current school database must be rejected.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('Refusing to seed', $exception->getMessage());
        }
        $this->assertSame([], $queries);
        $this->assertSame($hash, hash_file('sha256', $path));
    }
}
