<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

final class SchoolReportsDemoDatabase
{
    public const PASSWORD = 'DemoReports!2026';

    public static function path(): string
    {
        return storage_path('app/school-reports-demo/database.sqlite');
    }

    public static function assertSafeConnection(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('SchoolReportsDemoSeeder is restricted to local/testing environments.');
        }
        $connection = DB::connection();
        $database = $connection->getDatabaseName();
        if ($connection->getDriverName() !== 'sqlite') {
            throw new RuntimeException('Demo seeding only supports the dedicated SQLite demo database.');
        }
        if ($database === ':memory:' && app()->environment('testing')) {
            return;
        }
        $normalize = fn ($path) => strtolower(str_replace('\\', '/', (string) realpath($path)));
        if (! realpath($database) || is_link(self::path()) || $normalize($database) !== $normalize(self::path())
            || $normalize($database) === $normalize(database_path('database.sqlite'))) {
            throw new RuntimeException('Refusing to seed the current school database. Run: php artisan school-reports:demo');
        }
        // Refuse an existing unrelated dataset even if someone moved it to the demo path.
        if ((Schema::hasTable('users') && DB::table('users')->where(fn ($query) => $query->whereNull('username')->orWhere('username', 'not like', 'demo-%'))->exists())
            || (Schema::hasTable('students') && DB::table('students')->where('student_code', 'not like', 'DEMO-%')->exists())) {
            throw new RuntimeException('The demo database contains non-demo records; no data was changed.');
        }
    }
}
