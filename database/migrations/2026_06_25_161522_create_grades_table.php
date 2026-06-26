<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->integer('term'); // 1 or 2
            $table->integer('month'); // 1, 2, 3 or 0 for Final
            $table->decimal('homework', 5, 2)->default(0);
            $table->decimal('attendance', 5, 2)->default(0);
            $table->decimal('behavior', 5, 2)->default(0);
            $table->decimal('oral', 5, 2)->default(0);
            $table->decimal('written', 5, 2)->default(0);
            $table->decimal('final_exam', 5, 2)->nullable();
            $table->boolean('is_control')->default(false); // للكنترول الرقمي
            $table->timestamps();
            
            $table->unique(['student_id', 'subject_id', 'term', 'month', 'is_control']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
