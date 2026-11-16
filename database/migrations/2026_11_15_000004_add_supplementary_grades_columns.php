<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('grades') && !Schema::hasColumn('grades', 'second_round_score')) {
            Schema::table('grades', function (Blueprint $table) {
                $table->decimal('second_round_score', 6, 2)->nullable()->after('final_exam');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('grades') && Schema::hasColumn('grades', 'second_round_score')) {
            Schema::table('grades', function (Blueprint $table) {
                $table->dropColumn('second_round_score');
            });
        }
    }
};
