<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * مرفقات الواجب (أكثر من صورة/ملف للواجب الواحد).
     * عمود assignments.attachment_url يبقى للتوافق، ويحمل أول مرفق.
     */
    public function up(): void
    {
        Schema::create('assignment_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->string('url');
            $table->string('original_name')->nullable();
            $table->string('mime', 100)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['assignment_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_attachments');
    }
};
