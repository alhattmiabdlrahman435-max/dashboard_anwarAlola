<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * التأكد من وجود الشعب المطلوبة في ملحق 2 (تمهيدي أ، ب و عاشر أ، ب، ج، د)
     * دون تكرار أو المساس بالشعب الموجودة.
     */
    public function up(): void
    {
        $required = [
            ['grade_ar' => 'تمهيدي',      'grade_en' => 'KG',       'section_ar' => 'أ', 'section_en' => 'A', 'branch' => 'boys'],
            ['grade_ar' => 'تمهيدي',      'grade_en' => 'KG',       'section_ar' => 'ب', 'section_en' => 'B', 'branch' => 'girls'],
            ['grade_ar' => 'الصف العاشر', 'grade_en' => 'Grade 10', 'section_ar' => 'أ', 'section_en' => 'A', 'branch' => 'boys'],
            ['grade_ar' => 'الصف العاشر', 'grade_en' => 'Grade 10', 'section_ar' => 'ب', 'section_en' => 'B', 'branch' => 'boys'],
            ['grade_ar' => 'الصف العاشر', 'grade_en' => 'Grade 10', 'section_ar' => 'ج', 'section_en' => 'C', 'branch' => 'girls'],
            ['grade_ar' => 'الصف العاشر', 'grade_en' => 'Grade 10', 'section_ar' => 'د', 'section_en' => 'D', 'branch' => 'girls'],
        ];

        $now = now();
        foreach ($required as $row) {
            $exists = DB::table('classes')
                ->where('grade_ar', $row['grade_ar'])
                ->where('section_ar', $row['section_ar'])
                ->exists();

            if (!$exists) {
                DB::table('classes')->insert(array_merge($row, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        }
    }

    public function down(): void
    {
        // لا نحذف الشعب عند التراجع حفاظاً على الطلاب المرتبطين بها
    }
};
