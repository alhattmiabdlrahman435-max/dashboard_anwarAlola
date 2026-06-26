<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('day_of_week');
            $table->integer('period');
            $table->timestamps();
            $table->unique(['class_id', 'day_of_week', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
