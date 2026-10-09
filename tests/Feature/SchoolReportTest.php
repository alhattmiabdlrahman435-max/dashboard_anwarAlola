<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

class SchoolReportTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // This suite creates its fixtures only in an in-memory database, never the school's database.
        $this->app['config']->set('database.default', 'sqlite');
        $this->app['config']->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        foreach ([
            'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, name_ar TEXT, name_en TEXT, role TEXT, permissions TEXT, created_at TEXT, updated_at TEXT)',
            'CREATE TABLE classes (id INTEGER PRIMARY KEY, grade_ar TEXT, grade_en TEXT, section_ar TEXT, section_en TEXT)',
            'CREATE TABLE students (id INTEGER PRIMARY KEY, student_code TEXT, name_ar TEXT, name_en TEXT, class_id INTEGER, tuition_fee NUMERIC, is_active INTEGER)',
            'CREATE TABLE subjects (id INTEGER PRIMARY KEY, name_ar TEXT, name_en TEXT)',
            'CREATE TABLE teacher_subjects (teacher_id INTEGER, class_id INTEGER, subject_id INTEGER)',
            'CREATE TABLE supervisor_classes (supervisor_id INTEGER, class_id INTEGER)',
            'CREATE TABLE payments (student_id INTEGER, amount NUMERIC)',
            'CREATE TABLE attendance (student_id INTEGER, status TEXT, record_date TEXT)',
            'CREATE TABLE grades (student_id INTEGER, subject_id INTEGER, term INTEGER, month INTEGER, is_control INTEGER, homework NUMERIC, attendance NUMERIC, behavior NUMERIC, oral NUMERIC, written NUMERIC, final_exam NUMERIC)',
        ] as $sql) DB::statement($sql);
        DB::table('classes')->insert([
            ['id' => 1, 'grade_ar' => 'الخامس', 'grade_en' => 'Grade 5', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['id' => 2, 'grade_ar' => 'الخامس', 'grade_en' => 'Grade 5', 'section_ar' => 'ب', 'section_en' => 'B'],
        ]);
        $students = [];
        for ($i = 1; $i <= 27; $i++) $students[] = ['id' => $i, 'student_code' => 'S'.$i, 'name_ar' => 'طالب '.$i, 'name_en' => 'Student '.$i, 'class_id' => $i === 27 ? 2 : 1, 'tuition_fee' => 1000, 'is_active' => 1];
        DB::table('students')->insert($students);
        DB::table('payments')->insert([['student_id' => 1, 'amount' => 300], ['student_id' => 1, 'amount' => 200], ['student_id' => 2, 'amount' => 1200]]);
        DB::table('subjects')->insert([['id' => 1, 'name_ar' => 'الرياضيات', 'name_en' => 'Mathematics'], ['id' => 2, 'name_ar' => 'العلوم', 'name_en' => 'Science']]);
        DB::table('teacher_subjects')->insert([['teacher_id' => 10, 'class_id' => 1, 'subject_id' => 1], ['teacher_id' => 11, 'class_id' => 1, 'subject_id' => 2]]);
    }

    private function login(array $permissions = [], string $role = 'admin'): void
    {
        $user = User::create(['name' => 'Test staff', 'role' => $role, 'permissions' => $permissions]);
        Sanctum::actingAs($user);
    }

    private function grade(int $student, int $subject, int $month, float $written = 50, ?float $final = null, int $term = 1, bool $control = false): void
    {
        DB::table('grades')->insert(['student_id' => $student, 'subject_id' => $subject, 'term' => $term, 'month' => $month, 'is_control' => $control ? 1 : 0,
            'homework' => $month ? 15 : 0, 'attendance' => $month ? 15 : 0, 'behavior' => $month ? 10 : 0, 'oral' => $month ? 10 : 0, 'written' => $written, 'final_exam' => $final]);
    }

    public function test_financial_totals_include_all_matching_students_and_multiple_payments_once(): void
    {
        $this->login();
        $response = $this->getJson('/api/school-reports/finance?class_ids[]=1');
        $response->assertOk()->assertJsonPath('summary.students', 26)->assertJsonPath('totals.fees', 26000)
            ->assertJsonPath('totals.paid', 1700)->assertJsonPath('totals.remaining', 24300);
        $first = collect($response->json('rows'))->firstWhere('id', 1);
        $this->assertEquals(500, $first['remaining']);
        $credit = $this->getJson('/api/school-reports/finance?status=credit')->assertOk();
        $credit->assertJsonCount(1, 'rows')->assertJsonPath('rows.0.remaining', -200);
    }

    public function test_report_and_domain_scopes_intersect_and_other_classes_are_rejected(): void
    {
        $this->login(['reports' => ['actions' => ['view', 'export'], 'scope' => 'all'], 'finance' => ['actions' => ['view'], 'scope' => 'class', 'scope_ids' => [1]]], 'supervisor');
        $this->getJson('/api/school-reports/finance')->assertOk()->assertJsonPath('summary.students', 26);
        $this->getJson('/api/school-reports/finance?class_ids[]=2')->assertForbidden();
        $this->getJson('/api/school-reports/month')->assertForbidden();
        $this->getJson('/api/school-reports/options')->assertOk()->assertJsonCount(1, 'reports');
    }

    public function test_teacher_report_permission_does_not_grant_analytics_and_export_requires_permission(): void
    {
        $this->login(['teacherReports' => ['view'], 'finance' => ['view']], 'supervisor');
        $this->getJson('/api/school-reports/options')->assertForbidden();
        $this->login(['reports' => ['view'], 'finance' => ['view']], 'supervisor');
        $this->getJson('/api/school-reports/finance?export=1')->assertForbidden();
        $this->getJson('/api/school-reports/finance')->assertOk();
    }

    public function test_missing_and_zero_grades_are_distinct_and_control_records_are_not_merged(): void
    {
        $this->grade(1, 1, 1, 0);
        $this->grade(1, 1, 0, 0, 30, 1, true);
        DB::table('grades')->insert(['student_id' => 2, 'subject_id' => 1, 'term' => 1, 'month' => 1, 'is_control' => 0, 'homework' => 0, 'attendance' => 0, 'behavior' => 0, 'oral' => 0, 'written' => 0, 'final_exam' => null]);
        $this->login();
        $response = $this->getJson('/api/school-reports/month?student_id=2&class_ids[]=1&subject_id=1')->assertOk();
        $response->assertJsonPath('rows.0.total', 0)->assertJsonPath('rows.0.status', 'complete');
        $this->getJson('/api/school-reports/term?student_id=1&class_ids[]=1')->assertOk()
            ->assertJsonPath('rows.0.total', null)->assertJsonPath('rows.0.status', 'incomplete');
    }

    public function test_term_and_annual_results_use_actual_subject_count_and_preserve_incomplete_students(): void
    {
        foreach ([1, 2] as $term) foreach ([1, 2] as $subject) {
            foreach ([1, 2, 3] as $month) $this->grade(1, $subject, $month, 50, null, $term);
            $this->grade(1, $subject, 0, 0, 30, $term);
        }
        $this->login();
        $this->getJson('/api/school-reports/term-result?student_id=1&class_ids[]=1')->assertOk()
            ->assertJsonPath('summary.total', 100)->assertJsonPath('summary.maximum', 100)->assertJsonPath('summary.percentage', 100);
        $this->getJson('/api/school-reports/annual-result?student_id=1&class_ids[]=1')->assertOk()
            ->assertJsonPath('summary.total', 200)->assertJsonPath('summary.maximum', 200)->assertJsonPath('summary.percentage', 100);
        $this->getJson('/api/school-reports/annual-result?student_id=2&class_ids[]=1')->assertOk()
            ->assertJsonPath('summary.total', null)->assertJsonPath('summary.complete', 0);
        $this->getJson('/api/school-reports/term-result')->assertUnprocessable();
    }

    public function test_attendance_without_records_has_no_invented_percentage_and_dates_filter_records(): void
    {
        DB::table('attendance')->insert([['student_id' => 1, 'status' => 'present', 'record_date' => '2026-10-01'], ['student_id' => 1, 'status' => 'absent', 'record_date' => '2026-10-02']]);
        $this->login();
        $this->getJson('/api/school-reports/attendance?student_id=1&from=2026-10-02&to=2026-10-02')->assertOk()->assertJsonPath('rows.0.rate', 0);
        $this->getJson('/api/school-reports/attendance?student_id=2')->assertOk()->assertJsonPath('rows.0.rate', null);
        $this->getJson('/api/school-reports/attendance?from=2026-10-03&to=2026-10-01')->assertUnprocessable();
    }

    public function test_student_picker_obeys_grade_scope_and_reports_do_not_write_to_the_database(): void
    {
        $this->login(['reports' => ['view'], 'detailedGrades' => ['actions' => ['view'], 'scope' => 'class', 'scope_ids' => [1]]], 'supervisor');
        $writes = [];
        DB::listen(function ($query) use (&$writes) { if (preg_match('/^\s*(insert|update|delete|alter|create|drop)\b/i', $query->sql)) $writes[] = $query->sql; });
        $this->getJson('/api/school-reports/students?class_ids[]=1')->assertOk()->assertJsonCount(26, 'students');
        $this->getJson('/api/school-reports/students?class_ids[]=2')->assertForbidden();
        $this->getJson('/api/school-reports/options')->assertOk();
        $this->getJson('/api/school-reports/month?class_ids[]=1')->assertOk();
        $this->getJson('/api/school-reports/annual-result?student_id=27&class_ids[]=1')->assertForbidden();
        $this->assertSame([], $writes);
        $this->assertSame(27, DB::table('students')->count());
    }

    public function test_no_authenticated_access_or_mutation_routes(): void
    {
        $this->getJson('/api/school-reports/options')->assertUnauthorized();
        $this->login();
        $this->postJson('/api/school-reports/finance', [])->assertStatus(405);
        $this->getJson('/api/school-reports/not-real')->assertNotFound();
    }
}
