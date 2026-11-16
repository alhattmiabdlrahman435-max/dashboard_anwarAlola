<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** ربط طلبات الغياب والبلاغات بالعام الدراسي (البيانات الحالية تُسجَّل على العام الحالي) */
return new class extends Migration
{
    private const TABLES = ['absence_requests', 'reports'];

    public function up(): void
    {
        $currentId = DB::table('academic_years')->where('is_current', true)->value('id')
            ?? DB::table('academic_years')->orderByDesc('id')->value('id');

        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'academic_year_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->foreignId('academic_year_id')->nullable()->after('id')
                        ->constrained('academic_years')->nullOnDelete();
                });
            }
            if ($currentId && Schema::hasColumn($table, 'academic_year_id')) {
                DB::table($table)->whereNull('academic_year_id')->update(['academic_year_id' => $currentId]);
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'academic_year_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropConstrainedForeignId('academic_year_id');
                });
            }
        }
    }
};
