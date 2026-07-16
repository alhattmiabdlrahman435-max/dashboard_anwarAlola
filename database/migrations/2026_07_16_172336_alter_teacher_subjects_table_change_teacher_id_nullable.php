<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->dropForeign(['teacher_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->dropUnique(['teacher_id', 'subject_id', 'class_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->foreignId('teacher_id')->nullable()->change();
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->foreign('teacher_id')->references('id')->on('users')->cascadeOnDelete();
            });
        } catch (\Exception $e) {}

        Schema::table('teacher_subjects', function (Blueprint $table) {
            $table->unique(['class_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->dropForeign(['teacher_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->dropUnique(['class_id', 'subject_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->foreignId('teacher_id')->nullable(false)->change();
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->foreign('teacher_id')->references('id')->on('users')->cascadeOnDelete();
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('teacher_subjects', function (Blueprint $table) {
                $table->unique(['teacher_id', 'subject_id', 'class_id']);
            });
        } catch (\Exception $e) {}
    }
};
