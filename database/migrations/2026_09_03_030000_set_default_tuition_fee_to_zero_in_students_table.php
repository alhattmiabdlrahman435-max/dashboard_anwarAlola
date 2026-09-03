<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->decimal('tuition_fee', 10, 2)->default(0.00)->change();
        });

        // Update existing student records with default 10000.00 to 0.00
        DB::table('students')->where('tuition_fee', 10000.00)->update(['tuition_fee' => 0.00]);
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->decimal('tuition_fee', 10, 2)->default(10000.00)->change();
        });
    }
};
