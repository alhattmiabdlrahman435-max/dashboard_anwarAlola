<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('student_enrollments') && !Schema::hasColumn('student_enrollments', 'previous_balance')) {
            Schema::table('student_enrollments', function (Blueprint $table) {
                $table->decimal('previous_balance', 10, 2)->default(0)->after('tuition_fee');
            });
        }

        if (!Schema::hasTable('student_prior_records')) {
            Schema::create('student_prior_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
                $table->string('school_name');
                $table->string('academic_year_label', 50);
                $table->string('grade_name', 100);
                $table->string('term_label', 80)->nullable();
                $table->decimal('total_score', 8, 2)->nullable();
                $table->decimal('max_score', 8, 2)->nullable();
                $table->decimal('percentage', 5, 2)->nullable();
                $table->string('result_status', 40)->default('ناجح');
                $table->json('subject_grades')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['student_id', 'academic_year_label']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('student_prior_records');

        if (Schema::hasTable('student_enrollments') && Schema::hasColumn('student_enrollments', 'previous_balance')) {
            Schema::table('student_enrollments', function (Blueprint $table) {
                $table->dropColumn('previous_balance');
            });
        }
    }
};
