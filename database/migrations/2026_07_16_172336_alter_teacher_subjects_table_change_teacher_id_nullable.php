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
        Schema::table('teacher_subjects', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['teacher_id']);
            
            // Drop old unique constraint
            $table->dropUnique(['teacher_id', 'subject_id', 'class_id']);
            
            // Make teacher_id nullable
            $table->foreignId('teacher_id')->nullable()->change();
            
            // Re-add foreign key constraint
            $table->foreign('teacher_id')->references('id')->on('users')->cascadeOnDelete();
            
            // Add new unique constraint (only one teacher per subject per class)
            $table->unique(['class_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_subjects', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropUnique(['class_id', 'subject_id']);
            
            $table->foreignId('teacher_id')->nullable(false)->change();
            $table->foreign('teacher_id')->references('id')->on('users')->cascadeOnDelete();
            
            $table->unique(['teacher_id', 'subject_id', 'class_id']);
        });
    }
};
