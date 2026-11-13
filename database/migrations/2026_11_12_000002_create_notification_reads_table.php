<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * حالة "مقروء" لكل مستخدم على حدة (ولي أمر / معلم).
     * قبل هذا الجدول كان عمود notifications.is_read مشتركاً بين كل المستلمين؛
     * يبقى العمود كما هو للإشعارات القديمة (ما كان مقروءاً يبقى مقروءاً)، ويُستخدم لحالة الإدارة.
     */
    public function up(): void
    {
        Schema::create('notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained('notifications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();
            $table->unique(['notification_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_reads');
    }
};
