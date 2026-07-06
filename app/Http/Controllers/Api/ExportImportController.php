<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportImportController extends Controller
{
    // ========================
    // EXPORT (CSV with UTF-8 BOM for Excel Arabic support)
    // ========================

    public function export(Request $request, string $module)
    {
        $user = $request->user();

        if (!PermissionService::can($user, $module, 'export')) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتصدير البيانات.'], 403);
        }

        return match ($module) {
            'students' => $this->exportStudents($user),
            'teachers' => $this->exportTeachers($user),
            'parents' => $this->exportParents($user),
            'grades' => $this->exportGrades($user),
            default => response()->json(['success' => false, 'message' => 'الموديول غير مدعوم.'], 400),
        };
    }

    private function exportStudents(User $user): StreamedResponse
    {
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');

        $query = DB::table('students')
            ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
            ->leftJoin('users as parents', 'students.parent_id', '=', 'parents.id')
            ->select('students.id', 'students.name_ar', 'students.name_en', 'parents.national_id as parent_national_id', 'parents.phone as parent_phone', 'classes.grade_ar', 'classes.section_ar');

        if ($scopedClassIds !== null) {
            $query->whereIn('students.class_id', $scopedClassIds);
        }

        $data = $query->get();
        $rows = [];
        foreach ($data as $row) {
            $className = $row->grade_ar ? "{$row->grade_ar} - {$row->section_ar}" : '';
            $rows[] = [$row->id, $row->name_ar, $row->name_en, $row->parent_national_id, $row->parent_phone, $className];
        }

        return $this->streamCsv(
            'students_export.csv',
            ['#', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'رقم الهوية', 'رقم الجوال', 'الفصل'],
            $rows
        );
    }

    private function exportTeachers(User $user): StreamedResponse
    {
        $data = User::where('role', 'teacher')->get();
        $rows = [];
        foreach ($data as $t) {
            $rows[] = [$t->name_ar ?? $t->name, $t->job_id, $t->phone, $t->address];
        }

        return $this->streamCsv(
            'teachers_export.csv',
            ['الاسم (عربي)', 'الرقم الوظيفي', 'رقم الجوال', 'عنوان السكن'],
            $rows
        );
    }

    private function exportParents(User $user): StreamedResponse
    {
        $data = User::where('role', 'parent')->get();
        $rows = [];
        foreach ($data as $p) {
            $rows[] = [$p->id, $p->name_ar ?? $p->name, $p->name_en, $p->national_id, $p->phone];
        }

        return $this->streamCsv(
            'parents_export.csv',
            ['#', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'رقم الهوية', 'رقم الجوال'],
            $rows
        );
    }

    private function exportGrades(User $user): StreamedResponse
    {
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'grades');

        $query = DB::table('grades')
            ->join('students', 'grades.student_id', '=', 'students.id')
            ->leftJoin('users as parents', 'students.parent_id', '=', 'parents.id')
            ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
            ->leftJoin('subjects', 'grades.subject_id', '=', 'subjects.id')
            ->select(
                'students.name_ar as student_name',
                'parents.national_id as parent_national_id',
                'classes.grade_ar', 'classes.section_ar',
                'subjects.name_ar as subject_name',
                'grades.term',
                'grades.month',
                'grades.homework',
                'grades.attendance',
                'grades.behavior',
                'grades.oral',
                'grades.written',
                'grades.final_exam'
            );

        if ($scopedClassIds !== null) {
            $query->whereIn('students.class_id', $scopedClassIds);
        }

        $data = $query->get();
        $rows = [];
        foreach ($data as $r) {
            $className = $r->grade_ar ? "{$r->grade_ar} - {$r->section_ar}" : '';
            
            $termText = $r->term == 1 ? 'الترم الأول' : 'الترم الثاني';
            $monthText = match((int)$r->month) {
                1 => 'الشهر الأول',
                2 => 'الشهر الثاني',
                3 => 'الشهر الثالث',
                0 => 'النهائي',
                default => 'الشهر الأول'
            };
            $periodName = "{$termText} - {$monthText}";

            // Calculate columns matching headers:
            // ['اسم الطالب', 'رقم الهوية', 'الفصل', 'المادة', 'الفترة', 'المشاركة', 'الواجبات', 'الاختبار', 'المجموع']
            if ((int)$r->month === 0) {
                $participation = 0;
                $homework = 0;
                $exam = $r->final_exam !== null ? (float)$r->final_exam : 0;
                $total = $exam;
            } else {
                $participation = (float)$r->attendance + (float)$r->behavior + (float)$r->oral;
                $homework = (float)$r->homework + (float)$r->written;
                $exam = 0;
                $total = $participation + $homework;
            }

            $rows[] = [
                $r->student_name,
                $r->parent_national_id,
                $className,
                $r->subject_name,
                $periodName,
                $participation,
                $homework,
                $r->month == 0 ? $exam : '',
                $total
            ];
        }

        return $this->streamCsv(
            'grades_export.csv',
            ['اسم الطالب', 'رقم الهوية', 'الفصل', 'المادة', 'الفترة', 'المشاركة', 'الواجبات', 'الاختبار', 'المجموع'],
            $rows
        );
    }

    private function streamCsv(string $filename, array $headers, array $rows): StreamedResponse
    {
        return new StreamedResponse(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel Arabic support
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ========================
    // IMPORT (CSV parsing)
    // ========================

    public function import(Request $request, string $module)
    {
        $user = $request->user();

        if (!PermissionService::can($user, $module, 'import')) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك باستيراد البيانات.'], 403);
        }

        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt'])) {
            return response()->json([
                'success' => false,
                'message' => 'يجب أن يكون الملف المرفوع بصيغة CSV أو TXT فقط.'
            ], 422);
        }

        $path = $file->getRealPath();

        return match ($module) {
            'students' => $this->importStudents($path),
            'teachers' => $this->importTeachers($path),
            'parents' => $this->importParents($path),
            default => response()->json(['success' => false, 'message' => 'الموديول غير مدعوم للاستيراد.'], 400),
        };
    }

    private function importStudents(string $path)
    {
        $parsed = $this->parseCsv($path);
        $headers = array_map('trim', $parsed['headers'] ?? []);
        $rows = $parsed['rows'] ?? [];
        $imported = 0;
        $errors = [];

        // Helper to find column index based on search terms
        $findIdx = function($terms, $default) use ($headers) {
            foreach ($terms as $term) {
                $idx = array_search($term, $headers);
                if ($idx !== false) return $idx;
                foreach ($headers as $i => $h) {
                    if (str_contains($h, $term)) return $i;
                }
            }
            return $default;
        };

        // Determine column indexes dynamically
        $nameIdx = $findIdx(['الاسم (عربي)', 'الاسم', 'اسم الطالب'], 0);
        $parentNationalIdIdx = $findIdx(['رقم الهوية', 'الهوية', 'ولي الأمر'], 1);
        $phoneIdx = $findIdx(['رقم الجوال', 'الجوال', 'الهاتف'], 2);
        $classNameIdx = $findIdx(['الفصل', 'اسم الفصل', 'الصف'], 3);

        foreach ($rows as $index => $row) {
            $lineNum = $index + 2; // +2 because header is line 1

            $nameAr = isset($row[$nameIdx]) ? trim($row[$nameIdx]) : '';
            $parentNationalId = isset($row[$parentNationalIdIdx]) ? trim($row[$parentNationalIdIdx]) : '';
            $phone = isset($row[$phoneIdx]) ? trim($row[$phoneIdx]) : '';
            $className = isset($row[$classNameIdx]) ? trim($row[$classNameIdx]) : '';

            // Skip if the row is empty
            if (empty($nameAr) || empty($parentNationalId)) {
                $errors[] = "سطر {$lineNum}: الاسم أو رقم هوية ولي الأمر فارغ.";
                continue;
            }

            // Find or create parent user
            $parent = User::where('national_id', $parentNationalId)
                ->orWhere('username', $parentNationalId)
                ->first();

            if (!$parent) {
                // Let's create the parent user dynamically
                $parent = User::create([
                    'name' => 'ولي أمر ' . $nameAr,
                    'name_ar' => 'ولي أمر ' . $nameAr,
                    'name_en' => 'Parent of ' . $nameAr,
                    'username' => $parentNationalId,
                    'national_id' => $parentNationalId,
                    'phone' => $phone ?: '555555555',
                    'password' => Hash::make($phone ?: '123456'),
                    'role' => 'parent',
                    'is_active' => true,
                    'photo_url' => '🧔',
                ]);
            }

            // Find class ID by splitting grade and section
            $classId = null;
            if (!empty($className)) {
                $gradeAr = '';
                $sectionAr = '';
                if (str_contains($className, '-')) {
                    $parts = explode('-', $className);
                    $gradeAr = trim($parts[0] ?? '');
                    $sectionAr = trim($parts[1] ?? '');
                } else {
                    $parts = explode(' ', $className);
                    if (count($parts) >= 2) {
                        $gradeAr = $parts[0] . ' ' . $parts[1];
                        $sectionAr = $parts[2] ?? '';
                    } else {
                        $gradeAr = $className;
                    }
                }

                $class = SchoolClass::where('grade_ar', 'like', "%{$gradeAr}%")
                    ->where('section_ar', 'like', "%{$sectionAr}%")
                    ->first();
                $classId = $class?->id;
            }

            $getStageIndex = function ($grade) {
                if (str_contains($grade, "تمهيدي أول") || str_contains($grade, "KG1") || str_contains($grade, "الروضة الأولى")) return 1;
                if (str_contains($grade, "تمهيدي ثاني") || str_contains($grade, "KG2") || str_contains($grade, "الروضة الثانية")) return 2;
                if (str_contains($grade, "الأول") && !str_contains($grade, "المتوسط") && !str_contains($grade, "الثانوي")) return 3;
                if (str_contains($grade, "الثاني") && !str_contains($grade, "المتوسط") && !str_contains($grade, "الثانوي")) return 4;
                if (str_contains($grade, "الثالث") && !str_contains($grade, "المتوسط") && !str_contains($grade, "الثانوي")) return 5;
                if (str_contains($grade, "الرابع")) return 6;
                if (str_contains($grade, "الخامس")) return 7;
                if (str_contains($grade, "السادس")) return 8;
                if (str_contains($grade, "المتوسط") && str_contains($grade, "الأول")) return 9;
                if (str_contains($grade, "المتوسط") && str_contains($grade, "الثاني")) return 10;
                if (str_contains($grade, "المتوسط") && str_contains($grade, "الثالث")) return 11;
                if (str_contains($grade, "الثانوي") && str_contains($grade, "الأول")) return 12;
                if (str_contains($grade, "الثانوي") && str_contains($grade, "الثاني")) return 13;
                if (str_contains($grade, "الثانوي") && str_contains($grade, "الثالث")) return 14;
                return 3;
            };

            $stageNum = $getStageIndex($gradeAr ?: $className);
            $seqCount = DB::table('students')->where('class_id', $classId)->count() + 1;
            $studentCode = "2026" . $stageNum . $seqCount;
            while (DB::table('students')->where('student_code', $studentCode)->exists()) {
                $seqCount++;
                $studentCode = "2026" . $stageNum . $seqCount;
            }

            DB::table('students')->insert([
                'id' => (int)$studentCode,
                'student_code' => $studentCode,
                'name_ar' => $nameAr,
                'name_en' => $nameAr,
                'class_id' => $classId,
                'parent_id' => $parent->id,
                'qr_code' => $studentCode,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $imported++;
        }

        $msg = "تم استيراد {$imported} طالب بنجاح.";
        if (count($errors) > 0) {
            $msg .= " الأخطاء: " . implode(', ', $errors);
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    private function importTeachers(string $path)
    {
        $parsed = $this->parseCsv($path);
        $headers = array_map('trim', $parsed['headers'] ?? []);
        $rows = $parsed['rows'] ?? [];
        $imported = 0;
        $errors = [];

        $findIdx = function($terms, $default) use ($headers) {
            foreach ($terms as $term) {
                $idx = array_search($term, $headers);
                if ($idx !== false) return $idx;
                foreach ($headers as $i => $h) {
                    if (str_contains($h, $term)) return $i;
                }
            }
            return $default;
        };

        $nameIdx = $findIdx(['الاسم (عربي)', 'الاسم', 'اسم المعلم'], 0);
        $jobIdIdx = $findIdx(['الرقم الوظيفي', 'الرقم', 'رقم الوظيفة', 'job_id'], 1);
        $phoneIdx = $findIdx(['رقم الجوال', 'جوال', 'الجوال', 'الهاتف'], 2);
        $addressIdx = $findIdx(['عنوان السكن', 'العنوان', 'address'], 3);

        foreach ($rows as $index => $row) {
            $lineNum = $index + 2;

            $nameAr = isset($row[$nameIdx]) ? trim($row[$nameIdx]) : '';
            $jobId = isset($row[$jobIdIdx]) ? trim($row[$jobIdIdx]) : '';
            $phone = isset($row[$phoneIdx]) ? trim($row[$phoneIdx]) : '';
            $address = isset($row[$addressIdx]) ? trim($row[$addressIdx]) : '';

            if (empty($nameAr) || empty($jobId)) {
                $errors[] = "سطر {$lineNum}: الاسم أو الرقم الوظيفي فارغ.";
                continue;
            }

            $exists = User::where('job_id', $jobId)->orWhere('username', $jobId)->orWhere('national_id', $jobId)->first();
            if ($exists) {
                $errors[] = "سطر {$lineNum}: الرقم الوظيفي {$jobId} مسجل مسبقاً.";
                continue;
            }

            User::create([
                'name' => $nameAr,
                'name_ar' => $nameAr,
                'name_en' => $nameAr,
                'username' => $jobId,
                'national_id' => $jobId,
                'job_id' => $jobId,
                'phone' => $phone,
                'address' => $address,
                'password' => Hash::make($phone),
                'role' => 'teacher',
                'is_active' => true,
                'photo_url' => '👨‍🏫',
            ]);
            $imported++;
        }

        $msg = "تم استيراد {$imported} معلم بنجاح.";
        if (count($errors) > 0) {
            $msg .= " الأخطاء: " . implode(', ', $errors);
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    private function importParents(string $path)
    {
        $parsed = $this->parseCsv($path);
        $headers = array_map('trim', $parsed['headers'] ?? []);
        $rows = $parsed['rows'] ?? [];
        $imported = 0;
        $errors = [];

        $findIdx = function($terms, $default) use ($headers) {
            foreach ($terms as $term) {
                $idx = array_search($term, $headers);
                if ($idx !== false) return $idx;
                foreach ($headers as $i => $h) {
                    if (str_contains($h, $term)) return $i;
                }
            }
            return $default;
        };

        $nameIdx = $findIdx(['الاسم (عربي)', 'الاسم', 'اسم ولي الأمر'], 0);
        $nationalIdIdx = $findIdx(['رقم الهوية', 'الهوية', 'national_id'], 1);
        $phoneIdx = $findIdx(['رقم الجوال', 'جوال', 'الجوال', 'الهاتف'], 2);
        $passwordIdx = $findIdx(['كلمة المرور', 'المرور', 'password'], 3);

        foreach ($rows as $index => $row) {
            $lineNum = $index + 2;

            $nameAr = isset($row[$nameIdx]) ? trim($row[$nameIdx]) : '';
            $nationalId = isset($row[$nationalIdIdx]) ? trim($row[$nationalIdIdx]) : '';
            $phone = isset($row[$phoneIdx]) ? trim($row[$phoneIdx]) : '';
            $password = isset($row[$passwordIdx]) ? trim($row[$passwordIdx]) : '';

            if (empty($nameAr) || empty($nationalId)) {
                $errors[] = "سطر {$lineNum}: الاسم أو رقم الهوية فارغ.";
                continue;
            }

            $exists = User::where('national_id', $nationalId)->orWhere('username', $nationalId)->first();
            if ($exists) {
                $errors[] = "سطر {$lineNum}: رقم الهوية {$nationalId} مسجل مسبقاً.";
                continue;
            }

            User::create([
                'name' => $nameAr,
                'name_ar' => $nameAr,
                'name_en' => $nameAr,
                'username' => $nationalId,
                'national_id' => $nationalId,
                'job_id' => $nationalId,
                'phone' => $phone,
                'password' => !empty($password) ? Hash::make($password) : Hash::make($phone),
                'role' => 'parent',
                'is_active' => true,
                'photo_url' => '👨‍👧‍👦',
            ]);
            $imported++;
        }

        $msg = "تم استيراد {$imported} ولي أمر بنجاح.";
        if (count($errors) > 0) {
            $msg .= " الأخطاء: " . implode(', ', $errors);
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    // ========================
    // TEMPLATE DOWNLOAD
    // ========================

    public function template(Request $request, string $module)
    {
        $templates = [
            'students' => [
                'filename' => 'students_template.csv',
                'headers' => ['الاسم (عربي)', 'رقم الهوية', 'رقم الجوال', 'اسم الفصل'],
                'example' => ['أحمد محمد', '1055555555', '0501234567', 'الصف الأول - أ'],
            ],
            'teachers' => [
                'filename' => 'teachers_template.csv',
                'headers' => ['الاسم (عربي)', 'الرقم الوظيفي', 'رقم الجوال', 'عنوان السكن'],
                'example' => ['خالد الدوسري', '1066666666', '0507654321', 'حي النزهة، الرياض'],
            ],
            'parents' => [
                'filename' => 'parents_template.csv',
                'headers' => ['الاسم (عربي)', 'رقم الهوية', 'رقم الجوال', 'كلمة المرور'],
                'example' => ['محمد العمري', '1077777777', '0509876543', '123456'],
            ],
        ];

        if (!isset($templates[$module])) {
            return response()->json(['success' => false, 'message' => 'نموذج غير متوفر.'], 400);
        }

        $tmpl = $templates[$module];

        return $this->streamCsv($tmpl['filename'], $tmpl['headers'], [$tmpl['example']]);
    }

    // ========================
    // CSV HELPER
    // ========================

    private function parseCsv(string $path): array
    {
        $rows = [];
        $content = @file_get_contents($path);
        if ($content === false) {
            return $rows;
        }

        // Auto detect character encoding and convert to UTF-8
        $candidateEncodings = ['UTF-8', 'UTF-16LE', 'UTF-16BE', 'CP1256', 'ISO-8859-1', 'Windows-1256'];
        $availableEncodings = mb_list_encodings();
        $encodings = array_values(array_intersect(
            array_map('strtolower', $candidateEncodings),
            array_map('strtolower', $availableEncodings)
        ));

        $encoding = mb_detect_encoding($content, $encodings ?: null, true);
        if ($encoding && strtolower($encoding) !== 'utf-8') {
            $content = mb_convert_encoding($content, 'UTF-8', $encoding);
        }

        // Remove UTF-8 BOM if present
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
        }

        // Standardize line breaks and split lines
        $content = str_replace("\r\n", "\n", $content);
        $content = str_replace("\r", "\n", $content);
        $lines = explode("\n", $content);

        if (empty($lines)) {
            return $rows;
        }

        // Auto detect delimiter on header line
        $headerLine = $lines[0] ?? '';
        $delimiter = ",";
        if (str_contains($headerLine, ';') && !str_contains($headerLine, ',')) {
            $delimiter = ";";
        } elseif (str_contains($headerLine, "\t")) {
            $delimiter = "\t";
        }

        $headers = [];
        if (!empty(trim($headerLine))) {
            $headerData = str_getcsv($headerLine, $delimiter);
            $headers = array_map(function($val) {
                return trim($val, " \t\n\r\0\x0B\"'#");
            }, $headerData);
        }

        // Parse remaining lines
        for ($i = 1; $i < count($lines); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) {
                continue;
            }

            $data = str_getcsv($line, $delimiter);
            
            // Clean values (trim spaces and quotes)
            $cleanData = array_map(function($val) {
                return trim($val, " \t\n\r\0\x0B\"'");
            }, $data);

            $rows[] = $cleanData;
        }

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }
}
