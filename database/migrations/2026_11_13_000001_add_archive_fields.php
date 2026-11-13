<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * قسم الأرشيف (ملف «احصائية قسم الارشيف»):
 *  - classes.branch: فرع الشعبة (boys = فرع البنين، girls = فرع البنات) — تُبنى عليه الإحصائية.
 *  - students.gender: male / female — لحساب عدد الذكور وعدد الإناث.
 *  - بيانات استمارة التسجيل للطالب (نافذة «بيانات الطلاب») — مستقلة عن بيانات دخول ولي الأمر.
 */
return new class extends Migration
{
    /** توزيع الشعب على الفرعين حسب «احصائية شاملة للفرعين نموذج 1» */
    private const BOYS = [
        'تمهيدي' => ['أ'],
        'الصف الأول' => ['أ'],
        'الصف الثاني' => ['أ'],
        'الصف الثالث' => ['أ'],
        'الصف الرابع' => ['أ'],
        'الصف الخامس' => ['أ'],
        'الصف السادس' => ['أ'],
        // تسمية الاستضافة (سابع/ثامن/تاسع/عاشر) — نفس الملف: «سابع أ، سابع ب ... عاشر أ، عاشر ب»
        'الصف السابع' => ['أ', 'ب'],
        'الصف الثامن' => ['أ', 'ب'],
        'الصف التاسع' => ['أ', 'ب'],
        'الصف العاشر' => ['أ', 'ب'],
        // التسمية البديلة (متوسط/ثانوي)
        'الصف الأول المتوسط' => ['أ', 'ب'],
        'الصف الثاني المتوسط' => ['أ', 'ب'],
        'الصف الثالث المتوسط' => ['أ', 'ب'],
        'الصف الأول الثانوي' => ['أ', 'ب'],
        'الصف الثاني الثانوي' => ['أ', 'ب'],
        'الصف الثالث الثانوي' => ['أ', 'ب'],
    ];

    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('branch', 10)->nullable()->after('section_en')->index();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->string('gender', 10)->nullable()->after('name_en')->index();
            $table->date('birth_date')->nullable()->after('gender');
            $table->string('governorate', 100)->nullable()->after('birth_date');
            $table->string('address', 255)->nullable()->after('governorate');
            $table->string('phone_call', 30)->nullable()->after('address');
            $table->string('phone_whatsapp', 30)->nullable()->after('phone_call');
            $table->string('phone_other', 30)->nullable()->after('phone_whatsapp');
            $table->string('guardian_national_id', 30)->nullable()->after('phone_other');
            $table->text('archive_notes')->nullable()->after('guardian_national_id');
        });

        // تعبئة الفرع مبدئياً حسب نموذج 1 (بالاسم لا بالرقم حتى يعمل على أي قاعدة بيانات)
        foreach (DB::table('classes')->get(['id', 'grade_ar', 'section_ar']) as $c) {
            $boys = in_array(trim((string) $c->section_ar), self::BOYS[trim((string) $c->grade_ar)] ?? [], true);
            DB::table('classes')->where('id', $c->id)->update(['branch' => $boys ? 'boys' : 'girls']);
        }
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['gender']);
            $table->dropColumn(['gender', 'birth_date', 'governorate', 'address', 'phone_call', 'phone_whatsapp', 'phone_other', 'guardian_national_id', 'archive_notes']);
        });
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex(['branch']);
            $table->dropColumn('branch');
        });
    }
};
