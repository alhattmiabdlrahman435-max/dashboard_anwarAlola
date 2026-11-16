<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('academic_years')) {
            Schema::create('academic_years', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->unique();
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->boolean('is_current')->default(false)->index();
                $table->string('status', 30)->default('active')->index(); // active | archived | upcoming
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            });
        }

        // Ensure default 2026-2027 academic year exists and is marked current if none is current
        $currentYear = DB::table('academic_years')->where('is_current', true)->first();
        if (!$currentYear) {
            $existingDefault = DB::table('academic_years')->where('name', '2026-2027')->first();
            if ($existingDefault) {
                DB::table('academic_years')->where('id', $existingDefault->id)->update([
                    'is_current' => true,
                    'status' => 'active',
                    'updated_at' => now(),
                ]);
                $currentYearId = $existingDefault->id;
            } else {
                $currentYearId = DB::table('academic_years')->insertGetId([
                    'name' => '2026-2027',
                    'start_date' => '2026-09-01',
                    'end_date' => '2027-06-30',
                    'is_current' => true,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } else {
            $currentYearId = $currentYear->id;
        }

        // Student Enrollments per Academic Year
        if (!Schema::hasTable('student_enrollments')) {
            Schema::create('student_enrollments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
                $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
                $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
                $table->string('status', 30)->default('active')->index(); // active | promoted | retained | graduated | transferred | withdrawn
                $table->integer('seat_number')->nullable();
                $table->string('secret_code', 50)->nullable();
                $table->integer('committee_number')->nullable();
                $table->decimal('tuition_fee', 10, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->unique(['student_id', 'academic_year_id'], 'student_enrollments_student_year_unique');
                $table->index(['academic_year_id', 'class_id'], 'student_enrollments_year_class_idx');
            });
        }

        // Backfill all existing students into student_enrollments for current academic year
        $students = DB::table('students')->get([
            'id', 'class_id', 'is_active', 'seat_number', 'secret_code', 'committee_number', 'tuition_fee'
        ]);
        foreach ($students as $student) {
            $exists = DB::table('student_enrollments')
                ->where('student_id', $student->id)
                ->where('academic_year_id', $currentYearId)
                ->exists();
            if (!$exists) {
                DB::table('student_enrollments')->insert([
                    'student_id' => $student->id,
                    'academic_year_id' => $currentYearId,
                    'class_id' => $student->class_id,
                    'status' => $student->is_active ? 'active' : 'withdrawn',
                    'seat_number' => $student->seat_number,
                    'secret_code' => $student->secret_code,
                    'committee_number' => $student->committee_number,
                    'tuition_fee' => $student->tuition_fee ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Add academic_year_id to core transactional tables and backfill to current academic year
        $tablesToScope = [
            'grades',
            'attendance',
            'attendance_submissions',
            'payments',
            'assignments',
            'exam_schedules',
        ];

        foreach ($tablesToScope as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'academic_year_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('academic_year_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('academic_years')
                        ->nullOnDelete();
                });
            }
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'academic_year_id')) {
                DB::table($tableName)
                    ->whereNull('academic_year_id')
                    ->update(['academic_year_id' => $currentYearId]);
            }
        }

        // Update grades unique index to include academic_year_id so future years don't collide
        if (Schema::hasTable('grades')) {
            $indexes = collect(DB::select('SHOW INDEX FROM grades'))->pluck('Key_name')->unique()->all();
            if (in_array('grades_student_id_subject_id_term_month_is_control_unique', $indexes, true)) {
                Schema::table('grades', function (Blueprint $table) use ($indexes) {
                    if (!in_array('grades_student_id_idx', $indexes, true)) {
                        $table->index('student_id', 'grades_student_id_idx');
                    }
                    $table->dropUnique('grades_student_id_subject_id_term_month_is_control_unique');
                    $table->unique(
                        ['academic_year_id', 'student_id', 'subject_id', 'term', 'month', 'is_control'],
                        'grades_year_student_subject_term_month_control_unique'
                    );
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('grades')) {
            $indexes = collect(DB::select('SHOW INDEX FROM grades'))->pluck('Key_name')->unique()->all();
            if (in_array('grades_year_student_subject_term_month_control_unique', $indexes, true)) {
                Schema::table('grades', function (Blueprint $table) {
                    $table->dropUnique('grades_year_student_subject_term_month_control_unique');
                    $table->unique(
                        ['student_id', 'subject_id', 'term', 'month', 'is_control'],
                        'grades_student_id_subject_id_term_month_is_control_unique'
                    );
                });
            }
        }

        foreach (['exam_schedules', 'assignments', 'payments', 'attendance_submissions', 'attendance', 'grades'] as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'academic_year_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('academic_year_id');
                });
            }
        }

        Schema::dropIfExists('student_enrollments');
        Schema::dropIfExists('academic_years');
    }
};
