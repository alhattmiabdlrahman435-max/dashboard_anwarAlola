<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * الكنترول (ملحق المدرسة): رقم الجلوس ورقم اللجنة لكل طالب، وجدول اللجان.
     * الرقم السري يُحفظ في students.secret_code الموجود (نفس الرقم المستخدم في رصد الدرجات بالرقم السري).
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('seat_number', 20)->nullable()->unique()->after('secret_code');
            $table->unsignedInteger('committee_number')->nullable()->index()->after('seat_number');
        });

        Schema::create('exam_committees', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('number')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_committees');
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['seat_number']);
            $table->dropIndex(['committee_number']);
            $table->dropColumn(['seat_number', 'committee_number']);
        });
    }
};
