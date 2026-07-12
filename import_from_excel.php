<?php

/**
 * سكربت استيراد بيانات أولياء الأمور والطلاب من ملف الإكسل
 * يتم تشغيله عبر: php artisan tinker < import_from_excel.php
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// Boot Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$filePath = __DIR__ . '/ارقام بطائق اولياء الامور للعام 2026-2027.xlsx';

// Mapping: sheet name => [grade_ar, section_ar, grade_en, section_en]
$sheetMapping = [
    'تمهيدي أ'        => ['التمهيدي', 'أ', 'Preschool', 'A'],
    'تمهيدي - ب'      => ['التمهيدي', 'ب', 'Preschool', 'B'],
    'اول أ'           => ['الصف الأول', 'أ', 'Grade 1', 'A'],
    'اول ب'           => ['الصف الأول', 'ب', 'Grade 1', 'B'],
    'اول ج'           => ['الصف الأول', 'ج', 'Grade 1', 'C'],
    'ثاني أ'          => ['الصف الثاني', 'أ', 'Grade 2', 'A'],
    'ثاني ب'          => ['الصف الثاني', 'ب', 'Grade 2', 'B'],
    'ثالث أ'          => ['الصف الثالث', 'أ', 'Grade 3', 'A'],
    'ثالث ب'          => ['الصف الثالث', 'ب', 'Grade 3', 'B'],
    'رابع أ'          => ['الصف الرابع', 'أ', 'Grade 4', 'A'],
    'رابع ب'          => ['الصف الرابع', 'ب', 'Grade 4', 'B'],
    'خامس أ'          => ['الصف الخامس', 'أ', 'Grade 5', 'A'],
    'خامس ب'          => ['الصف الخامس', 'ب', 'Grade 5', 'B'],
    'سادس أ'          => ['الصف السادس', 'أ', 'Grade 6', 'A'],
    'سادس ب'          => ['الصف السادس', 'ب', 'Grade 6', 'B'],
    'سابع أ'          => ['الصف السابع', 'أ', 'Grade 7', 'A'],
    'سابع ب'          => ['الصف السابع', 'ب', 'Grade 7', 'B'],
    'سابع ج'          => ['الصف السابع', 'ج', 'Grade 7', 'C'],
    'ثامن أ'          => ['الصف الثامن', 'أ', 'Grade 8', 'A'],
    'ثامن ب'          => ['الصف الثامن', 'ب', 'Grade 8', 'B'],
    'ثامن ج'          => ['الصف الثامن', 'ج', 'Grade 8', 'C'],
    'تاسع أ'          => ['الصف التاسع', 'أ', 'Grade 9', 'A'],
    'تاسع ب'          => ['الصف التاسع', 'ب', 'Grade 9', 'B'],
    'تاسع ج'          => ['الصف التاسع', 'ج', 'Grade 9', 'C'],
    'عاشر أ'          => ['الصف العاشر', 'أ', 'Grade 10', 'A'],
    'عاشر ب'          => ['الصف العاشر', 'ب', 'Grade 10', 'B'],
    'عاشر ج'          => ['الصف العاشر', 'ج', 'Grade 10', 'C'],
    'عاشر د'          => ['الصف العاشر', 'د', 'Grade 10', 'D'],
    'ثاني ثانوي أ'    => ['الثاني الثانوي', 'أ', 'Grade 11', 'A'],
    'ثاني ثانوي ب'    => ['الثاني الثانوي', 'ب', 'Grade 11', 'B'],
    'ثاني ثانوي ج'    => ['الثاني الثانوي', 'ج', 'Grade 11', 'C'],
    'ثالث ثانوي أ'    => ['الثالث الثانوي', 'أ', 'Grade 12', 'A'],
    'ثالث ثانوي ب'    => ['الثالث الثانوي', 'ب', 'Grade 12', 'B'],
    'ثالث ثانوي ج'    => ['الثالث الثانوي', 'ج', 'Grade 12', 'C'],
];

echo "=== بدء استيراد البيانات ===" . PHP_EOL;
echo "الملف: $filePath" . PHP_EOL . PHP_EOL;

$reader = IOFactory::createReaderForFile($filePath);
$reader->setReadDataOnly(true);
$spreadsheet = $reader->load($filePath);

$totalParents = 0;
$totalStudents = 0;
$totalClassesCreated = 0;
$errors = [];
$skipped = 0;

// Stage mapping for student code generation
$stageMap = [
    'التمهيدي' => 0,
    'الصف الأول' => 1, 'الصف الثاني' => 2, 'الصف الثالث' => 3,
    'الصف الرابع' => 4, 'الصف الخامس' => 5, 'الصف السادس' => 6,
    'الصف السابع' => 7, 'الصف الثامن' => 8, 'الصف التاسع' => 9,
    'الصف العاشر' => 10,
    'الثاني الثانوي' => 11, 'الثالث الثانوي' => 12,
];

DB::beginTransaction();

try {
    for ($s = 0; $s < $spreadsheet->getSheetCount(); $s++) {
        $sheet = $spreadsheet->getSheet($s);
        $sheetName = trim($sheet->getTitle());

        // Find mapping
        $mapping = null;
        foreach ($sheetMapping as $key => $val) {
            if (trim($key) === $sheetName) {
                $mapping = $val;
                break;
            }
        }
        if (!$mapping) {
            $errors[] = "لم يتم العثور على تعيين للورقة: $sheetName";
            continue;
        }

        [$gradeAr, $sectionAr, $gradeEn, $sectionEn] = $mapping;

        // Find or create class
        $class = SchoolClass::where('grade_ar', $gradeAr)
            ->where('section_ar', $sectionAr)
            ->first();

        if (!$class) {
            $class = SchoolClass::create([
                'grade_ar' => $gradeAr,
                'section_ar' => $sectionAr,
                'grade_en' => $gradeEn,
                'section_en' => $sectionEn,
            ]);
            $totalClassesCreated++;
            echo "✅ فصل جديد: $gradeAr - $sectionAr (ID: {$class->id})" . PHP_EOL;
        }

        $stageNum = $stageMap[$gradeAr] ?? 3;

        // Parse rows
        $data = $sheet->toArray();
        foreach ($data as $rowIdx => $row) {
            // Skip empty row and header row(s)
            if ($rowIdx <= 1) continue;

            $parentName = trim($row[1] ?? '');
            $nationalId = trim($row[2] ?? '');
            $studentName = trim($row[3] ?? '');

            if (empty($parentName) || empty($studentName)) continue;

            // Clean national ID (remove spaces, dots, etc.)
            $nationalId = preg_replace('/[^0-9]/', '', $nationalId);

            // Find or create parent
            $parent = null;
            if (!empty($nationalId)) {
                $parent = User::where('national_id', $nationalId)->where('role', 'parent')->first();
            }
            if (!$parent && !empty($parentName)) {
                // Try to find by name (exact match)
                $parent = User::where('name', $parentName)->where('role', 'parent')->first();
            }

            if (!$parent) {
                // Generate password from national_id or default
                $password = !empty($nationalId) ? $nationalId : '123456';

                $parent = User::create([
                    'name' => $parentName,
                    'name_ar' => $parentName,
                    'name_en' => $parentName,
                    'national_id' => !empty($nationalId) ? $nationalId : null,
                    'phone' => null,
                    'role' => 'parent',
                    'password' => Hash::make($password),
                    'is_active' => true,
                ]);
                $totalParents++;
            }

            // Find or create student
            $student = Student::where('name_ar', $studentName)
                ->where('parent_id', $parent->id)
                ->first();

            if (!$student) {
                // Generate student code
                $seqCount = Student::where('class_id', $class->id)->count() + 1;
                $studentCode = "2026" . $stageNum . $seqCount;
                while (Student::where('student_code', $studentCode)->exists()) {
                    $seqCount++;
                    $studentCode = "2026" . $stageNum . $seqCount;
                }

                $student = Student::create([
                    'student_code' => $studentCode,
                    'name_ar' => $studentName,
                    'name_en' => $studentName,
                    'class_id' => $class->id,
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'tuition_fee' => 0,
                ]);
                $totalStudents++;
            } else {
                // Update class if different
                if ($student->class_id != $class->id) {
                    $student->update(['class_id' => $class->id]);
                }
                $skipped++;
            }
        }

        echo "📋 ورقة [$sheetName] → $gradeAr - $sectionAr (ID:{$class->id}) - تمت المعالجة" . PHP_EOL;
    }

    DB::commit();

    echo PHP_EOL . "=== ✅ اكتمل الاستيراد بنجاح ===" . PHP_EOL;
    echo "فصول جديدة: $totalClassesCreated" . PHP_EOL;
    echo "أولياء أمور جدد: $totalParents" . PHP_EOL;
    echo "طلاب جدد: $totalStudents" . PHP_EOL;
    echo "تم تخطيهم (موجودون مسبقاً): $skipped" . PHP_EOL;

    if (count($errors) > 0) {
        echo PHP_EOL . "⚠️ أخطاء:" . PHP_EOL;
        foreach ($errors as $err) {
            echo "  - $err" . PHP_EOL;
        }
    }

} catch (\Exception $e) {
    DB::rollBack();
    echo "❌ خطأ: " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
