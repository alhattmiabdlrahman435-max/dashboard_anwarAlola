<?php

namespace App\Console\Commands;

use App\Support\SchoolReportsDemoDatabase;
use Database\Seeders\SchoolReportsDemoSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use Throwable;

class SchoolReportsDemoCommand extends Command
{
    protected $signature = 'school-reports:demo {--serve : Start an isolated local server after seeding} {--port=8001 : Isolated server port}';

    protected $description = 'Prepare a complete demo school in a dedicated SQLite database; never seeds the current school';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('This command only runs in local/testing environments.');

            return self::FAILURE;
        }
        if (app()->configurationIsCached()) {
            $this->error('A cached configuration would prevent reliable server isolation. Use a local uncached checkout.');

            return self::FAILURE;
        }
        $port = filter_var($this->option('port'), FILTER_VALIDATE_INT);
        if ($port === false || $port < 1024 || $port > 65535) {
            $this->error('Choose a port from 1024 to 65535.');

            return self::FAILURE;
        }
        $original = DB::getDefaultConnection();
        $originalConfigured = config('database.default');
        $path = SchoolReportsDemoDatabase::path();
        try {
            File::ensureDirectoryExists(dirname($path));
            if (is_link($path)) {
                throw new \RuntimeException('Refusing a symbolic-link database.');
            }
            $originalPath = config("database.connections.$original.database");
            if ($originalPath && realpath($path) && realpath($path) === realpath($originalPath) && $originalPath !== $path) {
                throw new \RuntimeException('Demo path resolves to the configured school database.');
            }
            if (! File::exists($path) && ! touch($path)) {
                throw new \RuntimeException('Could not create the isolated database.');
            }
            config(['database.connections.reports_demo' => [
                'driver' => 'sqlite', 'database' => $path, 'prefix' => '', 'foreign_key_constraints' => true,
            ], 'database.default' => 'reports_demo']);
            DB::purge('reports_demo');
            DB::setDefaultConnection('reports_demo');
            SchoolReportsDemoDatabase::assertSafeConnection();
            if ($this->call('migrate', ['--database' => 'reports_demo', '--force' => true]) !== self::SUCCESS) {
                return self::FAILURE;
            }
            (new SchoolReportsDemoSeeder)->setContainer($this->laravel)->setCommand($this)->run();
            $tables = ['users', 'grade_levels', 'classes', 'subjects', 'teacher_subjects', 'supervisor_classes', 'students',
                'payments', 'grades', 'attendance', 'attendance_submissions', 'schedules', 'exam_schedules', 'exam_subjects',
                'assignments', 'assignment_submissions', 'absence_requests', 'reports', 'notifications', 'contact_messages'];
            $counts = [];
            foreach ($tables as $table) {
                $counts[$table] = DB::table($table)->count();
            }
            $manifest = [
                'school' => 'مدارس أنوار العلى — بيئة اختبار معزولة',
                'school_storage' => 'The application has no schools/settings table; this label is scenario metadata, not a saved school entity.',
                'database' => $path, 'counts' => $counts,
                'accounts' => ['demo-admin', 'demo-supervisor', 'demo-finance', 'demo-academic', 'demo-preparation', 'demo-teacher-1', 'demo-parent-1'],
                'password' => SchoolReportsDemoDatabase::PASSWORD,
                'term_1_attendance' => ['2026-09-06', '2026-09-24'], 'term_2_attendance' => ['2027-02-07', '2027-02-25'],
                'cases' => ['0001' => 'Perfect grades: term 300/300, annual 600/600, 100%. Fully paid.', '0002' => 'Recorded zeros in both terms; total 0, complete. Absent on all recorded days.',
                    '0003' => 'Missing term 1 / assessment 2 / Mathematics.', '0004' => 'Missing term 2 / final / English; unpaid.',
                    '0005' => 'No detailed grades or attendance; control records exist.', '0006' => 'Control grades only; detailed results remain incomplete.',
                    '0007' => 'Term 2 only.', '0008' => 'Term 1 only.', '0009' => 'Inactive; excluded from report results.',
                    '0010' => 'Fees 4000, paid 4800, balance -800.', '0011' => 'Fees 0, paid 0, balance 0.', '0012' => 'Term 2 final Mathematics record exists but final_exam is null.'],
                'known_limits' => ['No academic-year key in grades/payments.', 'No itemized discounts, transport, prior balances.', 'No issued certificate records or parent delivery.', 'The demo includes future term 2 dates intentionally.'],
            ];
            File::put(dirname($path).'/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            $this->table(['Table', 'Rows'], collect($counts)->map(fn ($count, $table) => [$table, $count])->all());
            $this->info('Database: '.$path);
            $this->info('Demo login: demo-admin / '.SchoolReportsDemoDatabase::PASSWORD);
            $this->comment('Current-school database and .env were not changed. Re-running updates demo fixtures without deleting rows.');
            if (! $this->option('serve')) {
                $this->info('Open the test environment with: php artisan school-reports:demo --serve');

                return self::SUCCESS;
            }
            // A separate process gets its own database selection; no .env edits and no config cache.
            $environment = [
                'APP_ENV' => 'local', 'APP_URL' => 'http://127.0.0.1:'.$port,
                'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $path, 'DB_URL' => '',
                'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'file', 'QUEUE_CONNECTION' => 'sync',
                'BROADCAST_CONNECTION' => 'log', 'MAIL_MAILER' => 'log',
            ];
            $this->info('Isolated school reports: http://127.0.0.1:'.$port.'/reports');
            $process = new Process([PHP_BINARY, 'artisan', 'serve', '--host=127.0.0.1', '--port='.(string) $port], base_path(), $environment);
            $process->setTimeout(null);

            return $process->run(fn ($type, $output) => $this->output->write($output));
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } finally {
            DB::purge('reports_demo');
            config(['database.default' => $originalConfigured]);
            DB::setDefaultConnection($original);
        }
    }
}
