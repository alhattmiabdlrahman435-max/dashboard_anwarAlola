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
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

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
        $classId = request()->query('class_id');
        $className = request()->query('class_name');

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'students');

        $query = DB::table('students')
            ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
            ->leftJoin('users as parents', 'students.parent_id', '=', 'parents.id')
            ->select('students.id', 'students.name_ar', 'parents.name_ar as parent_name', 'parents.national_id as parent_national_id', 'classes.grade_ar', 'classes.section_ar');

        if ($scopedClassIds !== null) {
            $query->whereIn('students.class_id', $scopedClassIds);
        }

        if ($classId) {
            $query->where('students.class_id', $classId);
            $class = DB::table('classes')->where('id', $classId)->first();
            $classNameStr = $class ? "{$class->grade_ar} - {$class->section_ar}" : "محدد";
        } elseif ($className && $className !== 'all') {
            $query->where(DB::raw("CONCAT(classes.grade_ar, ' - ', classes.section_ar)"), $className);
            $classNameStr = $className;
        } else {
            $classNameStr = "كل الفصول";
        }

        $data = $query->get();

        return new StreamedResponse(function () use ($classNameStr, $data) {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setRightToLeft(true);
            $sheet->setShowGridlines(true);

            // Title banner text
            $titleText = "كشف بأسماء أولياء أمور طلاب الصف ( {$classNameStr} ) وأرقام بطائقهم الشخصية للعام 2026 - 2027م";
            $sheet->mergeCells('A1:E1');
            $sheet->setCellValue('A1', $titleText);

            // Styling the Banner
            $sheet->getRowDimension(1)->setRowHeight(45);
            $sheet->getStyle('A1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 14,
                    'name' => 'Segoe UI'
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'color' => ['argb' => 'FF31859C'] // beautiful teal color from image
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]);

            // Headers
            $headers = ['م', 'اسم ولي الأمر', 'رقم البطاقة', 'اسم الطالب', 'ملاحظات'];
            $sheet->fromArray([$headers], null, 'A2');
            $sheet->getRowDimension(2)->setRowHeight(30);

            // Header Styling
            $sheet->getStyle('A2:E2')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FF000000'],
                    'size' => 11,
                    'name' => 'Segoe UI'
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'color' => ['argb' => 'FFF2F2F2']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FFCCCCCC']
                    ]
                ]
            ]);

            // Add Data Rows
            $rowIndex = 3;
            foreach ($data as $index => $row) {
                $sheet->setCellValue('A' . $rowIndex, $index + 1);
                $sheet->setCellValue('B' . $rowIndex, $row->parent_name ?: ('ولي أمر ' . $row->name_ar));
                $sheet->setCellValueExplicit('C' . $rowIndex, $row->parent_national_id, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValue('D' . $rowIndex, $row->name_ar);
                $sheet->setCellValue('E' . $rowIndex, '');

                $sheet->getRowDimension($rowIndex)->setRowHeight(25);
                $rowIndex++;
            }

            // Apply gridline border and alignment to data rows
            if ($rowIndex > 3) {
                $sheet->getStyle('A3:E' . ($rowIndex - 1))->applyFromArray([
                    'font' => [
                        'size' => 11,
                        'name' => 'Segoe UI'
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFE0E0E0']
                        ]
                    ]
                ]);
            }

            // Column Widths
            $sheet->getColumnDimension('A')->setWidth(8);
            $sheet->getColumnDimension('B')->setWidth(25);
            $sheet->getColumnDimension('C')->setWidth(20);
            $sheet->getColumnDimension('D')->setWidth(25);
            $sheet->getColumnDimension('E')->setWidth(25);

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="students_export.xlsx"',
            'Cache-Control' => 'max-age=0',
        ]);
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
        $parents = User::where('role', 'parent')->with('children.schoolClass')->get();

        // Calculate max children count for any parent to define headers dynamically
        $maxChildren = 0;
        foreach ($parents as $p) {
            $maxChildren = max($maxChildren, $p->children->count());
        }
        $maxChildren = max($maxChildren, 2); // Default to at least 2 slots

        $headers = ['رقم الهوية', 'الاسم (عربي)', 'رقم الجوال'];
        for ($i = 1; $i <= $maxChildren; $i++) {
            $headers[] = "اسم الابن {$i}";
            $headers[] = "صف الابن {$i}";
        }

        $rows = [];
        foreach ($parents as $p) {
            $row = [
                $p->national_id,
                $p->name_ar ?? $p->name,
                $p->phone,
            ];

            foreach ($p->children as $child) {
                $row[] = $child->name_ar;
                $row[] = $child->schoolClass ? "{$child->schoolClass->grade_ar} - {$child->schoolClass->section_ar}" : '';
            }

            // Fill remaining columns with empty strings
            $remaining = $maxChildren - $p->children->count();
            for ($k = 0; $k < $remaining; $k++) {
                $row[] = '';
                $row[] = '';
            }

            $rows[] = $row;
        }

        return $this->streamCsv(
            'parents_export.csv',
            $headers,
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
        if (!in_array($extension, ['csv', 'txt', 'xlsx'])) {
            return response()->json([
                'success' => false,
                'message' => 'يجب أن يكون الملف المرفوع بصيغة CSV أو TXT أو XLSX فقط.'
            ], 422);
        }

        $path = $file->getRealPath();

        return match ($module) {
            'students' => $this->importStudents($path, $extension),
            'teachers' => $this->importTeachers($path, $extension),
            'parents' => $this->importParents($path, $extension),
            default => response()->json(['success' => false, 'message' => 'الموديول غير مدعوم للاستيراد.'], 400),
        };
    }

    private function importStudents(string $path, string $extension = 'csv')
    {
        if ($extension === 'xlsx') {
            $parsed = $this->parseXlsx($path);
        } else {
            $parsed = $this->parseCsv($path);
        }
        
        $allRows = $parsed['rows'] ?? [];
        $firstRow = $parsed['headers'] ?? [];
        
        // Combine headers and rows to analyze
        $data = array_merge([$firstRow], $allRows);
        if (empty($data)) {
            return response()->json([
                'success' => false,
                'message' => 'الملف المرفوع فارغ أو غير صالح.'
            ], 422);
        }

        // Detect banner
        $hasBanner = false;
        $bannerText = '';
        if (isset($data[0][0]) && (str_contains($data[0][0], 'كشف') || str_contains($data[0][0], 'أولياء أمور'))) {
            $hasBanner = true;
            $bannerText = $data[0][0];
        }

        // Extract class name from banner
        $class = null;
        $classId = request()->input('class_id'); // default class_id from request parameter
        
        if ($hasBanner && !empty($bannerText)) {
            if (preg_match('/\(([^)]+)\)/', $bannerText, $matches)) {
                $classNameFromBanner = trim($matches[1]);
                if (!empty($classNameFromBanner) && $classNameFromBanner !== 'كل الفصول') {
                    $gradeAr = '';
                    $sectionAr = '';
                    if (str_contains($classNameFromBanner, '-')) {
                        $parts = explode('-', $classNameFromBanner);
                        $gradeAr = trim($parts[0] ?? '');
                        $sectionAr = trim($parts[1] ?? '');
                    } else {
                        $parts = explode(' ', $classNameFromBanner);
                        if (count($parts) >= 2) {
                            $gradeAr = $parts[0] . ' ' . $parts[1];
                            $sectionAr = $parts[2] ?? '';
                        } else {
                            $gradeAr = $classNameFromBanner;
                        }
                    }

                    $class = SchoolClass::where('grade_ar', 'like', "%{$gradeAr}%")
                        ->where('section_ar', 'like', "%{$sectionAr}%")
                        ->first();
                }
            }
        }

        if (!$class && $classId) {
            $class = SchoolClass::find($classId);
        }

        if (!$class) {
            $class = SchoolClass::first();
        }

        $classId = $class ? $class->id : null;

        // Set headers and rows index based on banner presence
        if ($hasBanner) {
            $headers = array_map('trim', $data[1] ?? []);
            $rows = array_slice($data, 2);
        } else {
            $headers = array_map('trim', $data[0] ?? []);
            $rows = array_slice($data, 1);
        }

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
        $parentNameIdx = $findIdx(['اسم ولي الأمر', 'ولي الأمر', 'الاب', 'الأب'], 1);
        $parentNationalIdIdx = $findIdx(['رقم البطاقة', 'الهوية', 'الرقم الوطني', 'national_id'], 2);
        $studentNameIdx = $findIdx(['اسم الطالب', 'الطالب', 'الابن', 'الاسم'], 3);

        $imported = 0;
        $errors = [];

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

        foreach ($rows as $index => $row) {
            $lineNum = $hasBanner ? ($index + 3) : ($index + 2); // Excel line number

            $studentName = isset($row[$studentNameIdx]) ? trim($row[$studentNameIdx]) : '';
            $parentNationalId = isset($row[$parentNationalIdIdx]) ? trim($row[$parentNationalIdIdx]) : '';
            $parentName = isset($row[$parentNameIdx]) ? trim($row[$parentNameIdx]) : '';

            // Check if row is completely empty (all cells empty or null)
            $isEmptyRow = true;
            foreach ($row as $val) {
                if ($val !== null && trim((string)$val) !== '') {
                    $isEmptyRow = false;
                    break;
                }
            }
            if ($isEmptyRow) {
                continue; // Ignore completely empty rows silently
            }

            // Skip if the student name or parent ID is empty
            if (empty($studentName) || empty($parentNationalId)) {
                $errors[] = "سطر {$lineNum}: تم تجاهله لعدم توفر اسم الطالب أو رقم هوية ولي الأمر.";
                continue;
            }

            // Find or create parent user
            $parent = User::where('role', 'parent')
                ->where(function($q) use ($parentNationalId) {
                    $q->where('national_id', $parentNationalId)
                      ->orWhere('username', $parentNationalId);
                })->first();

            if (!$parent) {
                // Let's create the parent user dynamically with password '12345678'
                $parent = User::create([
                    'name' => $parentName ?: 'ولي أمر ' . $studentName,
                    'name_ar' => $parentName ?: 'ولي أمر ' . $studentName,
                    'name_en' => $parentName ?: 'Parent of ' . $studentName,
                    'username' => $parentNationalId,
                    'national_id' => $parentNationalId,
                    'phone' => '0555555555',
                    'password' => Hash::make('12345678'), // default password 1-8
                    'role' => 'parent',
                    'is_active' => true,
                    'photo_url' => '🧔',
                ]);
            } else {
                // Update parent name if empty or changed
                if (!empty($parentName) && $parentName !== $parent->name_ar) {
                    $parent->update([
                        'name' => $parentName,
                        'name_ar' => $parentName,
                    ]);
                }
            }

            // Check if student with same name is already linked to this parent
            $studentExists = Student::where('name_ar', $studentName)
                ->where('parent_id', $parent->id)
                ->exists();

            if ($studentExists) {
                $errors[] = "سطر {$lineNum}: الطالب {$studentName} مسجل مسبقاً لولي الأمر.";
                continue;
            }

            // Generate student code
            $stageNum = $class ? $getStageIndex($class->grade_ar) : 3;
            $seqCount = DB::table('students')->where('class_id', $classId)->count() + 1;
            $studentCode = "2026" . $stageNum . $seqCount;
            while (DB::table('students')->where('student_code', $studentCode)->exists()) {
                $seqCount++;
                $studentCode = "2026" . $stageNum . $seqCount;
            }

            DB::table('students')->insert([
                'id' => (int)$studentCode,
                'student_code' => $studentCode,
                'name_ar' => $studentName,
                'name_en' => $studentName,
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

        return response()->json([
            'success' => true,
            'message' => $msg,
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    private function importTeachers(string $path, string $extension = 'csv')
    {
        if ($extension === 'xlsx') {
            $parsed = $this->parseXlsx($path);
        } else {
            $parsed = $this->parseCsv($path);
        }
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

    private function importParents(string $path, string $extension = 'csv')
    {
        if ($extension === 'xlsx') {
            $parsed = $this->parseXlsx($path);
        } else {
            $parsed = $this->parseCsv($path);
        }
        $headers = array_map('trim', $parsed['headers'] ?? []);
        $rows = $parsed['rows'] ?? [];
        $importedParents = 0;
        $importedStudents = 0;
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
        $passwordIdx = $findIdx(['كلمة المرور', 'المرور', 'password'], -1);

        // Find child columns dynamically
        $childSlots = [];
        foreach ($headers as $idx => $header) {
            $isChildName = str_contains($header, 'اسم الابن') || str_contains($header, 'اسم الطالب');
            if ($isChildName && !str_contains($header, 'صف') && !str_contains($header, 'فصل')) {
                // Try to find the matching class column
                // Get number from header (e.g. "1" from "اسم الابن 1")
                preg_match('/\d+/', $header, $matches);
                $num = $matches[0] ?? null;

                $classIdx = null;
                if ($num !== null) {
                    foreach ($headers as $cIdx => $cHeader) {
                        $isClass = str_contains($cHeader, 'صف') || str_contains($cHeader, 'فصل') || str_contains($cHeader, 'Class') || str_contains($cHeader, 'class');
                        if ($isClass && str_contains($cHeader, $num)) {
                            $classIdx = $cIdx;
                            break;
                        }
                    }
                }

                // Fallback to next column if class index is not found
                if ($classIdx === null && isset($headers[$idx + 1])) {
                    $nextHeader = $headers[$idx + 1];
                    $isClass = str_contains($nextHeader, 'صف') || str_contains($nextHeader, 'فصل') || str_contains($nextHeader, 'Class') || str_contains($nextHeader, 'class');
                    if ($isClass) {
                        $classIdx = $idx + 1;
                    }
                }

                $childSlots[] = [
                    'name_idx' => $idx,
                    'class_idx' => $classIdx
                ];
            }
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

        foreach ($rows as $index => $row) {
            $lineNum = $index + 2;

            $nameAr = isset($row[$nameIdx]) ? trim($row[$nameIdx]) : '';
            $nationalId = isset($row[$nationalIdIdx]) ? trim($row[$nationalIdIdx]) : '';
            $phone = isset($row[$phoneIdx]) ? trim($row[$phoneIdx]) : '';
            $password = ($passwordIdx !== -1 && isset($row[$passwordIdx])) ? trim($row[$passwordIdx]) : '';

            if (empty($nationalId)) {
                $errors[] = "سطر {$lineNum}: رقم الهوية فارغ.";
                continue;
            }

            if (empty($nameAr)) {
                // If parent doesn't exist, name is required
                $parentExists = User::where('national_id', $nationalId)->orWhere('username', $nationalId)->first();
                if (!$parentExists) {
                    $errors[] = "سطر {$lineNum}: اسم ولي الأمر فارغ لحساب جديد.";
                    continue;
                }
            }

            // Find or create parent
            $parent = User::where('national_id', $nationalId)->orWhere('username', $nationalId)->first();
            if ($parent) {
                $parent->update([
                    'name' => $nameAr ?: $parent->name,
                    'name_ar' => $nameAr ?: $parent->name_ar,
                    'phone' => $phone ?: $parent->phone,
                ]);
            } else {
                $parent = User::create([
                    'name' => $nameAr,
                    'name_ar' => $nameAr,
                    'name_en' => $nameAr,
                    'username' => $nationalId,
                    'national_id' => $nationalId,
                    'job_id' => $nationalId,
                    'phone' => $phone ?: '777777777',
                    'password' => !empty($password) ? Hash::make($password) : Hash::make($phone ?: '123456'),
                    'role' => 'parent',
                    'is_active' => true,
                    'photo_url' => '🧔',
                ]);
                $importedParents++;
            }

            // Process children
            foreach ($childSlots as $slot) {
                $studentName = isset($row[$slot['name_idx']]) ? trim($row[$slot['name_idx']]) : '';
                $className = ($slot['class_idx'] !== null && isset($row[$slot['class_idx']])) ? trim($row[$slot['class_idx']]) : '';

                if (empty($studentName)) {
                    continue;
                }

                // Check if student already exists for this parent
                $student = Student::where('name_ar', $studentName)
                    ->where('parent_id', $parent->id)
                    ->first();

                // Find class
                $classId = null;
                $class = null;
                if (!empty($className)) {
                    $gradeAr = '';
                    $sectionAr = '';
                    // Try exact match first on combined name: "{$grade_ar} - {$section_ar}"
                    $classes = SchoolClass::all();
                    foreach ($classes as $c) {
                        $combined = "{$c->grade_ar} - {$c->section_ar}";
                        if (trim($combined) === trim($className)) {
                            $class = $c;
                            $classId = $c->id;
                            break;
                        }
                    }

                    if (!$class) {
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
                }

                if (!$student) {
                    // Generate student code
                    $stageNum = 3;
                    if ($class) {
                        $stageNum = $getStageIndex($class->grade_ar);
                    } elseif (!empty($className)) {
                        $stageNum = $getStageIndex($className);
                    }

                    $seqCount = DB::table('students')->where('class_id', $classId)->count() + 1;
                    $studentCode = "2026" . $stageNum . $seqCount;
                    while (DB::table('students')->where('student_code', $studentCode)->exists()) {
                        $seqCount++;
                        $studentCode = "2026" . $stageNum . $seqCount;
                    }

                    DB::table('students')->insert([
                        'id' => (int)$studentCode,
                        'student_code' => $studentCode,
                        'name_ar' => $studentName,
                        'name_en' => $studentName,
                        'class_id' => $classId,
                        'parent_id' => $parent->id,
                        'qr_code' => $studentCode,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $importedStudents++;
                } else {
                    // Update student class if changed
                    if ($classId && $student->class_id !== $classId) {
                        DB::table('students')->where('id', $student->id)->update([
                            'class_id' => $classId,
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        $msg = "تم استيراد/تحديث {$importedParents} أولياء أمور بنجاح، وربط {$importedStudents} طلاب أبناء بنجاح.";
        if (count($errors) > 0) {
            $msg .= " الأخطاء: " . implode(', ', $errors);
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'imported' => $importedParents,
            'errors' => $errors,
        ]);
    }

    // ========================
    // TEMPLATE DOWNLOAD
    // ========================


    public function template(Request $request, string $module)
    {
        if ($module === 'students') {
            $classId = $request->query('class_id');
            $classNameStr = "الصف الثالث الثانوي - ج"; // standard default example
            if ($classId) {
                $class = DB::table('classes')->where('id', $classId)->first();
                if ($class) {
                    $classNameStr = "{$class->grade_ar} - {$class->section_ar}";
                }
            }

            return new StreamedResponse(function () use ($classNameStr) {
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setRightToLeft(true);
                $sheet->setShowGridlines(true);

                // Title banner text
                $titleText = "كشف بأسماء أولياء أمور طلاب الصف ( {$classNameStr} ) وأرقام بطائقهم الشخصية للعام 2026 - 2027م";
                $sheet->mergeCells('A1:E1');
                $sheet->setCellValue('A1', $titleText);

                // Styling the Banner
                $sheet->getRowDimension(1)->setRowHeight(45);
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => 'FFFFFFFF'],
                        'size' => 14,
                        'name' => 'Segoe UI'
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'color' => ['argb' => 'FF31859C'] // beautiful teal color
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);

                // Headers
                $headers = ['م', 'اسم ولي الأمر', 'رقم البطاقة', 'اسم الطالب', 'ملاحظات'];
                $sheet->fromArray([$headers], null, 'A2');
                $sheet->getRowDimension(2)->setRowHeight(30);

                // Header Styling
                $sheet->getStyle('A2:E2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => 'FF000000'],
                        'size' => 11,
                        'name' => 'Segoe UI'
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'color' => ['argb' => 'FFF2F2F2']
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFCCCCCC']
                        ]
                    ]
                ]);



                // Column Widths
                $sheet->getColumnDimension('A')->setWidth(8);
                $sheet->getColumnDimension('B')->setWidth(25);
                $sheet->getColumnDimension('C')->setWidth(20);
                $sheet->getColumnDimension('D')->setWidth(25);
                $sheet->getColumnDimension('E')->setWidth(25);

                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            }, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="students_template.xlsx"',
                'Cache-Control' => 'max-age=0',
            ]);
        }

        if ($module === 'parents') {
            return new StreamedResponse(function () {
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                
                // Headers
                $headers = ['رقم الهوية', 'الاسم (عربي)', 'رقم الجوال', 'اسم الابن 1', 'صف الابن 1', 'اسم الابن 2', 'صف الابن 2'];
                $sheet->fromArray([$headers], null, 'A1');
                
                // Example Row
                $exampleRow = ['1077777777', 'محمد العمري', '0509876543', 'أحمد محمد العمري', '', 'سارة محمد العمري', ''];
                $sheet->fromArray([$exampleRow], null, 'A2');
                
                // Fetch classes
                $classes = SchoolClass::all();
                $classNames = [];
                foreach ($classes as $class) {
                    $classNames[] = "{$class->grade_ar} - {$class->section_ar}";
                }
                
                if (!empty($classNames)) {
                    // Create list sheet
                    $listSheet = $spreadsheet->createSheet();
                    $listSheet->setTitle('ClassesList');
                    
                    foreach ($classNames as $idx => $name) {
                        $listSheet->setCellValue('A' . ($idx + 1), $name);
                    }
                    
                    $listSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
                    
                    // Set validation formula
                    $validation = $sheet->getCell('E2')->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setErrorStyle(DataValidation::STYLE_STOP);
                    $validation->setAllowBlank(true);
                    $validation->setShowInputMessage(true);
                    $validation->setShowErrorMessage(true);
                    $validation->setShowDropDown(true);
                    $validation->setErrorTitle('الصف غير صحيح');
                    $validation->setError('يرجى اختيار الصف من القائمة المتاحة فقط.');
                    $validation->setPromptTitle('اختر الصف');
                    $validation->setPrompt('يرجى اختيار الصف المناسب من القائمة.');
                    $validation->setFormula1('ClassesList!$A$1:$A$' . count($classNames));
                    
                    // Apply validation to E2:E500 and G2:G500
                    for ($row = 2; $row <= 500; $row++) {
                        $sheet->getCell('E' . $row)->setDataValidation(clone $validation);
                        $sheet->getCell('G' . $row)->setDataValidation(clone $validation);
                    }
                }
                
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            }, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="parents_template.xlsx"',
                'Cache-Control' => 'max-age=0',
            ]);
        }

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

    private function parseXlsx(string $path): array
    {
        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($path);
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($path);
        $sheet = $spreadsheet->getActiveSheet();
        
        $data = $sheet->toArray();
        if (empty($data)) {
            return [
                'headers' => [],
                'rows' => []
            ];
        }
        
        $headers = array_map(function($val) {
            return trim($val, " \t\n\r\0\x0B\"'#");
        }, $data[0]);
        
        $rows = [];
        for ($i = 1; $i < count($data); $i++) {
            $row = $data[$i];
            // Check if row is completely empty
            $isEmpty = true;
            foreach ($row as $val) {
                if ($val !== null && trim((string)$val) !== '') {
                    $isEmpty = false;
                    break;
                }
            }
            if ($isEmpty) continue;
            
            $cleanRow = array_map(function($val) {
                return $val === null ? '' : trim((string)$val);
            }, $row);
            
            $rows[] = $cleanRow;
        }
        
        return [
            'headers' => $headers,
            'rows' => $rows
        ];
    }
}
