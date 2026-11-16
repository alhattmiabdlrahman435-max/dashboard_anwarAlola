<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * رقم الجلوس في الطلاب نص (حتى 20 خانة) لكنه أُنشئ في قيود العام الدراسي كرقم صحيح،
 * فيفشل حفظ أي رقم جلوس طويل أو يحتوي حروفاً/أصفاراً في البداية. نوحّد النوع.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('student_enrollments') && Schema::hasColumn('student_enrollments', 'seat_number')) {
            Schema::table('student_enrollments', function (Blueprint $table) {
                $table->string('seat_number', 20)->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        // لا نرجع للنوع الرقمي حتى لا تُفقد أرقام الجلوس النصية
    }
};
