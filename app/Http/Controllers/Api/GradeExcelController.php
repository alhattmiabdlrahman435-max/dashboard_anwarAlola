<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GradeExcelController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:detailedGrades,view', only: ['exportTemplate', 'inspectWorkbook', 'mapColumns', 'reconcileData']),
            new Middleware('check.permission:detailedGrades,update', only: ['previewImport', 'confirmImport', 'commitReconciliation']),
        ];
    }

    /**
     * Normalize Arabic string for accurate matching
     */
    private function normalizeArabic(?string $text): string
    {
        if (!$text) return '';
        $text = preg_replace('/[\x{0640}]/u', '', $text); // strip tatweel ـ
        $text = preg_replace('/[إأآا]/u', 'ا', $text);
        $text = preg_replace('/[ىي]/u', 'ي', $text);
        $text = preg_replace('/[ةه]/u', 'ه', $text);
        $text = preg_replace('/[\x{064B}-\x{065F}]/u', '', $text); // tashkeel
        // Compound name spacing normalization
        $text = str_replace('عبد الرحمن', 'عبدالرحمن', $text);
        $text = str_replace('عبد الله', 'عبدالله', $text);
        $text = str_replace('ابو بكر', 'ابوبكر', $text);
        $text = str_replace('ايلين', 'الين', $text);
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    /**
     * Smart subject recognition from Excel header text
     */
    private function matchSubjectByHeader(string $headerText, $allSubjects): ?Subject
    {
        $cleanH = $this->normalizeArabic($headerText);
        $lowerRaw = strtolower(trim($headerText));

        if ($cleanH === '') return null;

        // 1. Exact normalized match
        foreach ($allSubjects as $sub) {
            $subNorm = $this->normalizeArabic($sub->name_ar);
            if ($subNorm === $cleanH || strtolower(trim((string)$sub->name_en)) === $lowerRaw) {
                return $sub;
            }
        }

        // 2. Keyword root rules
        foreach ($allSubjects as $sub) {
            $subNorm = $this->normalizeArabic($sub->name_ar);
            $subLowerEn = strtolower(trim((string)$sub->name_en));

            // Quran
            if (str_contains($cleanH, 'قران') && str_contains($subNorm, 'قران')) {
                return $sub;
            }

            // Islamic Studies
            if ((str_contains($cleanH, 'اسلام') || str_contains($cleanH, 'دين')) && (str_contains($subNorm, 'اسلام') || str_contains($subNorm, 'دين'))) {
                return $sub;
            }

            // Arabic Language
            if (str_contains($cleanH, 'عرب') && str_contains($subNorm, 'عرب')) {
                return $sub;
            }

            // English Language
            if ((str_contains($cleanH, 'انجليز') || str_contains($cleanH, 'انقليز') || str_contains($lowerRaw, 'english')) && (str_contains($subNorm, 'انجليز') || str_contains($subLowerEn, 'english'))) {
                return $sub;
            }

            // Physical Education vs Mathematics
            if (str_contains($cleanH, 'تربيه رياضيه') || str_contains($cleanH, 'بدني') || str_contains($cleanH, 'رياضه')) {
                if (str_contains($subNorm, 'تربيه رياضيه') || str_contains($subNorm, 'بدني')) return $sub;
            } elseif (str_contains($cleanH, 'رياض') && !str_contains($cleanH, 'تربي')) {
                if (str_contains($subNorm, 'رياضيات') || $subLowerEn === 'math') return $sub;
            }

            // Art Education
            if ((str_contains($cleanH, 'فني') || str_contains($cleanH, 'رسم')) && str_contains($subNorm, 'فني')) {
                return $sub;
            }

            // Science
            if (str_contains($cleanH, 'علوم') && str_contains($subNorm, 'علوم')) {
                return $sub;
            }

            // Social Studies
            if (str_contains($cleanH, 'اجتماع') && str_contains($subNorm, 'اجتماع')) {
                return $sub;
            }

            // Computer
            if ((str_contains($cleanH, 'حاسوب') || str_contains($cleanH, 'كمبيوتر') || str_contains($cleanH, 'حاسب')) && str_contains($subNorm, 'حاسوب')) {
                return $sub;
            }

            // Physics
            if (str_contains($cleanH, 'فيزيا') && str_contains($subNorm, 'فيزيا')) {
                return $sub;
            }

            // Chemistry
            if (str_contains($cleanH, 'كيميا') && str_contains($subNorm, 'كيميا')) {
                return $sub;
            }

            // Biology
            if (str_contains($cleanH, 'احيا') && str_contains($subNorm, 'احيا')) {
                return $sub;
            }

            // History
            if (str_contains($cleanH, 'تاريخ') && str_contains($subNorm, 'تاريخ')) {
                return $sub;
            }

            // Geography
            if (str_contains($cleanH, 'جغرافي') && str_contains($subNorm, 'جغرافي')) {
                return $sub;
            }

            // Yemeni Society
            if (str_contains($cleanH, 'مجتمع') && str_contains($subNorm, 'مجتمع')) {
                return $sub;
            }
        }

        // 3. Substring match fallback
        foreach ($allSubjects as $sub) {
            $subNorm = $this->normalizeArabic($sub->name_ar);
            if (str_contains($subNorm, $cleanH) || str_contains($cleanH, $subNorm)) {
                return $sub;
            }
        }

        return null;
    }

    /**
     * تصدير قالب رصد الدرجات لشعبة وفصل معين
     */
    public function exportTemplate(Request $request)
    {
        $user = $request->user();
        $classId = (int) $request->input('class_id');
        $term = (int) $request->input('term', 1);
        if (!in_array($term, [1, 2])) $term = 1;

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لهذه الشعبة.'], 403);
        }

        $schoolClass = SchoolClass::find($classId);
        if (!$schoolClass) {
            return response()->json(['success' => false, 'message' => 'الشعبة غير موجودة.'], 404);
        }

        // 1. Fetch Students alphabetically sorted (من أول حرف إلى آخر حرف)
        $students = Student::where('class_id', $classId)
            ->where('is_active', true)
            ->orderBy('name_ar', 'asc')
            ->get();

        if ($students->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'لا يوجد طلاب مسجلين في هذه الشعبة.'], 422);
        }

        // 2. Fetch Subjects for this class
        $assignedSubjectIds = TeacherSubject::where('class_id', $classId)
            ->pluck('subject_id')
            ->unique()
            ->toArray();

        if (!empty($assignedSubjectIds)) {
            $subjects = Subject::whereIn('id', $assignedSubjectIds)->orderBy('id')->get();
        } else {
            $subjects = Subject::orderBy('id')->get();
        }

        // 3. Fetch existing grades for pre-filling
        $existingGrades = Grade::whereIn('student_id', $students->pluck('id'))
            ->whereIn('subject_id', $subjects->pluck('id'))
            ->where('term', $term)
            ->where('is_control', false)
            ->get();

        $gradesMap = [];
        foreach ($existingGrades as $g) {
            $sid = $g->student_id;
            $subid = $g->subject_id;
            $m = (int) $g->month;

            if ($m === 0) {
                $gradesMap[$sid][$subid]['final_exam'] = $g->final_exam !== null ? (float)$g->final_exam : null;
                if ($g->coursework !== null) {
                    $gradesMap[$sid][$subid]['coursework'] = (float)$g->coursework;
                }
            } else {
                $sum = (float)$g->homework + (float)$g->attendance + (float)$g->behavior + (float)$g->oral + (float)$g->written;
                $gradesMap[$sid][$subid]['months'][$m] = $sum;
            }
        }

        // Calculate coursework out of 20 from months only if direct coursework is not set
        foreach ($gradesMap as $sid => $subs) {
            foreach ($subs as $subid => $info) {
                if (!isset($info['coursework']) && isset($info['months']) && count($info['months']) > 0) {
                    $mSum = array_sum($info['months']);
                    $mCount = count($info['months']);
                    $coursework = round(($mSum / ($mCount * 100)) * 20, 2);
                    $gradesMap[$sid][$subid]['coursework'] = $coursework;
                }
            }
        }

        // 4. Create Spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('كشف رصد الدرجات');
        $sheet->setRightToLeft(true);

        // Styling definitions
        $navyStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E3A8A']], // Navy blue
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCBD5E1']]],
        ];

        $subHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FF1E293B'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2E8F0']], // Slate 200
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCBD5E1']]],
        ];

        $titleStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FF1E3A8A'], 'size' => 16],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];

        $subTitleStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FF475569'], 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];

        // Title Block
        $termText = $term === 1 ? 'الأول' : 'الثاني';
        $classNameText = $schoolClass->grade_ar . ' - شعبة ' . $schoolClass->section_ar;

        $sheet->setCellValue('A1', 'مدارس أنوار العُلى الأهلية النموذجية');
        $sheet->setCellValue('A2', "كشف رصد درجات الفصل الدراسي {$termText} - العام الدراسي 2026/2027م");
        $sheet->setCellValue('A3', "الصف والشعبة: {$classNameText} | عدد الطلاب: {$students->count()} طالب");

        // Calculate total columns needed
        $fixedColsCount = 3; // ID, Code, Name
        $subjectColsCount = $subjects->count() * 2;
        $totalCols = $fixedColsCount + $subjectColsCount;
        $lastColLetter = Coordinate::stringFromColumnIndex($totalCols);

        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->mergeCells("A2:{$lastColLetter}2");
        $sheet->mergeCells("A3:{$lastColLetter}3");
        $sheet->getStyle('A1')->applyFromArray($titleStyle);
        $sheet->getStyle('A2')->applyFromArray($subTitleStyle);
        $sheet->getStyle('A3')->applyFromArray($subTitleStyle);

        // Header Row 5 & 6
        // Fixed Columns
        $sheet->setCellValue('A5', 'معرف النظام');
        $sheet->setCellValue('A6', '[مخفي - لا تعدل]');
        $sheet->setCellValue('B5', 'رقم الطالب');
        $sheet->setCellValue('B6', 'Code');
        $sheet->setCellValue('C5', 'اسم الطالب (مرتب أبجدياً)');
        $sheet->setCellValue('C6', 'Student Name');

        $sheet->getStyle('A5:A6')->applyFromArray($navyStyle);
        $sheet->getStyle('B5:B6')->applyFromArray($navyStyle);
        $sheet->getStyle('C5:C6')->applyFromArray($navyStyle);

        // Subject Columns
        $currentCol = 4;
        foreach ($subjects as $sub) {
            $col1Letter = Coordinate::stringFromColumnIndex($currentCol);
            $col2Letter = Coordinate::stringFromColumnIndex($currentCol + 1);

            // Row 5: Subject Name merged
            $sheet->mergeCells("{$col1Letter}5:{$col2Letter}5");
            $sheet->setCellValue("{$col1Letter}5", $sub->name_ar);
            $sheet->getStyle("{$col1Letter}5:{$col2Letter}5")->applyFromArray($navyStyle);

            // Row 6: Sub-headers
            $sheet->setCellValue("{$col1Letter}6", "أعمال (م{$term} / 20)");
            $sheet->setCellValue("{$col2Letter}6", "اختبار (ن{$term} / 30)");
            $sheet->getStyle("{$col1Letter}6")->applyFromArray($subHeaderStyle);
            $sheet->getStyle("{$col2Letter}6")->applyFromArray($subHeaderStyle);

            $currentCol += 2;
        }

        // Data Rows starting at Row 7
        $currentRow = 7;
        foreach ($students as $student) {
            $sheet->setCellValue("A{$currentRow}", $student->id);
            $sheet->setCellValue("B{$currentRow}", $student->student_code);
            $sheet->setCellValue("C{$currentRow}", $student->name_ar);

            $colIdx = 4;
            foreach ($subjects as $sub) {
                $c1 = Coordinate::stringFromColumnIndex($colIdx);
                $c2 = Coordinate::stringFromColumnIndex($colIdx + 1);

                $workVal = $gradesMap[$student->id][$sub->id]['coursework'] ?? '';
                $examVal = $gradesMap[$student->id][$sub->id]['final_exam'] ?? '';

                if ($workVal !== '') {
                    $sheet->setCellValue("{$c1}{$currentRow}", $workVal);
                }
                if ($examVal !== '') {
                    $sheet->setCellValue("{$c2}{$currentRow}", $examVal);
                }

                $colIdx += 2;
            }

            // Alternating Row Styling
            $rowBg = ($currentRow % 2 === 0) ? 'FFF8FAFC' : 'FFFFFFFF';
            $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Alignment: Student info
            $sheet->getStyle("A{$currentRow}:B{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            // Grade columns centered
            $sheet->getStyle("D{$currentRow}:{$lastColLetter}{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $currentRow++;
        }

        // Auto-size columns
        foreach (range(1, $totalCols) as $colIndex) {
            $colLetter = Coordinate::stringFromColumnIndex($colIndex);
            if ($colLetter === 'A') {
                $sheet->getColumnDimension('A')->setWidth(14);
            } elseif ($colLetter === 'B') {
                $sheet->getColumnDimension('B')->setWidth(15);
            } elseif ($colLetter === 'C') {
                $sheet->getColumnDimension('C')->setWidth(38);
            } else {
                $sheet->getColumnDimension($colLetter)->setWidth(16);
            }
        }

        // Set row heights
        $sheet->getRowDimension(1)->setRowHeight(28);
        $sheet->getRowDimension(2)->setRowHeight(24);
        $sheet->getRowDimension(3)->setRowHeight(22);
        $sheet->getRowDimension(5)->setRowHeight(26);
        $sheet->getRowDimension(6)->setRowHeight(24);

        $filename = "قالب_رصد_درجات_{$schoolClass->grade_ar}_{$schoolClass->section_ar}_فصل_{$term}.xlsx";
        $filename = preg_replace('/\s+/', '_', $filename);

        $tempPath = tempnam(sys_get_temp_dir(), 'tpl_');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);
        $content = file_get_contents($tempPath);
        @unlink($tempPath);

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($content),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * معاينة ملف الإكسل والتحقق من صحة البيانات قبل الحفظ
     */
    public function previewImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'class_id' => 'required|integer',
            'term' => 'required|in:1,2',
        ]);

        $user = $request->user();
        $classId = (int) $request->input('class_id');
        $term = (int) $request->input('term');

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك باستيراد درجات لهذه الشعبة.'], 403);
        }

        $schoolClass = SchoolClass::find($classId);
        if (!$schoolClass) {
            return response()->json(['success' => false, 'message' => 'الشعبة غير موجودة.'], 404);
        }

        // Fetch students in this class
        $classStudents = Student::where('class_id', $classId)
            ->where('is_active', true)
            ->get();

        $studentsById = $classStudents->keyBy('id');
        $studentsByCode = $classStudents->keyBy('student_code');
        $studentsByNormName = [];
        foreach ($classStudents as $s) {
            $studentsByNormName[$this->normalizeArabic($s->name_ar)] = $s;
        }

        // Fetch assigned subjects
        $assignedSubjectIds = TeacherSubject::where('class_id', $classId)->pluck('subject_id')->unique()->toArray();
        if (!empty($assignedSubjectIds)) {
            $subjects = Subject::whereIn('id', $assignedSubjectIds)->get();
        } else {
            $subjects = Subject::all();
        }

        $allSubjects = Subject::all();
        $subjectsByNormName = [];
        foreach ($allSubjects as $sub) {
            $subjectsByNormName[$this->normalizeArabic($sub->name_ar)] = $sub;
        }

        // Load Excel File
        $uploadedFile = $request->file('file');
        $filePath = $uploadedFile->getRealPath();

        try {
            $reader = IOFactory::createReaderForFile($filePath);
            $reader->setReadDataOnly(true);

            // Instant sheet discovery without loading all 23 sheets data
            $sheetNames = $reader->listWorksheetNames($filePath);
            $targetSheetName = null;

            if (count($sheetNames) > 1) {
                $gClean = $this->normalizeArabic($schoolClass->grade_ar);
                $sClean = $this->normalizeArabic($schoolClass->section_ar);

                foreach ($sheetNames as $name) {
                    $tClean = $this->normalizeArabic($name);
                    if (str_contains($tClean, $sClean)) {
                        foreach (['اول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس', 'سابع', 'ثامن', 'تاسع', 'عاشر', 'تمهيدي'] as $lvl) {
                            if (str_contains($gClean, $lvl) && str_contains($tClean, $lvl)) {
                                $targetSheetName = $name;
                                break 2;
                            }
                        }
                    }
                }
            }

            if ($targetSheetName) {
                // Load ONLY the relevant class sheet (e.g. 'اول أ')
                $reader->setLoadSheetsOnly([$targetSheetName]);
            }

            $spreadsheet = $reader->load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'تعذر قراءة ملف الإكسل: ' . $e->getMessage()], 422);
        }

        $highestRow = $sheet->getHighestRow();
        $highestCol = Coordinate::columnIndexFromString($sheet->getHighestColumn());

        // Find header row (either row 5, 6, 7, 8 or scan for 'اسم' or 'name')
        $headerRow = null;
        $subHeaderRow = null;
        for ($r = 1; $r <= min(15, $highestRow); $r++) {
            for ($c = 1; $c <= min(15, $highestCol); $c++) {
                $rawVal = (string) $sheet->getCell([$c, $r])->getValue();
                $valNorm = $this->normalizeArabic($rawVal);
                if (str_contains($valNorm, 'اسم') || str_contains(strtolower($rawVal), 'student')) {
                    $headerRow = $r;
                    $subHeaderRow = $r + 1;
                    break 2;
                }
            }
        }

        if (!$headerRow) {
            return response()->json(['success' => false, 'message' => 'لم يتم العثور على ترويسة الأعمدة (اسم الطالب) في ورقة العمل المختارة (' . $sheet->getTitle() . ').'], 422);
        }

        // Map Columns to Subjects
        $idCol = null;
        $codeCol = null;
        $nameCol = null;
        $subjectColMap = []; // colIndex => ['subject_id' => X, 'type' => 'work'|'exam']

        // Scan header row to identify ID, Code, Name
        for ($c = 1; $c <= $highestCol; $c++) {
            $val = $this->normalizeArabic((string) $sheet->getCell([$c, $headerRow])->getValue());
            $rawVal = strtolower(trim((string) $sheet->getCell([$c, $headerRow])->getValue()));

            if (str_contains($val, 'معرف') || $rawVal === 'id') {
                $idCol = $c;
            } elseif (str_contains($val, 'رقم الطالب') || str_contains($val, 'كود') || str_contains($rawVal, 'code')) {
                $codeCol = $c;
            } elseif (str_contains($val, 'رقم الجلوس')) {
                // If there's a seat number column, use as secondary code
                if (!$codeCol) $codeCol = $c;
            } elseif (str_contains($val, 'اسم') || str_contains($rawVal, 'name')) {
                $nameCol = $c;
            }
        }

        if (!$nameCol) {
            $nameCol = 3; // Default fallback
        }

        // Now map Subjects
        for ($c = 1; $c <= $highestCol; $c++) {
            if ($c === $idCol || $c === $codeCol || $c === $nameCol) {
                continue;
            }

            $hVal = trim((string) $sheet->getCell([$c, $headerRow])->getValue());
            $subHVal = trim((string) $sheet->getCell([$c, $subHeaderRow])->getValue());

            // If header cell is empty (e.g. merged across 2 or 3 cols in Excel), inherit from previous column
            if ($hVal === '' && $c > 1) {
                for ($back = $c - 1; $back >= 1; $back--) {
                    $prevH = trim((string) $sheet->getCell([$back, $headerRow])->getValue());
                    if ($prevH !== '') {
                        $hVal = $prevH;
                        break;
                    }
                }
            }

            if ($hVal === '' || str_contains($hVal, 'المجموع') || str_contains($hVal, 'الرقم السري')) {
                continue;
            }

            // Match Subject using smart recognition
            $matchedSubject = $this->matchSubjectByHeader($hVal, $allSubjects);

            if ($matchedSubject) {
                $normSubH = $this->normalizeArabic($subHVal);
                $type = 'work';

                // Check if this sub-column is exam or coursework or total
                if (str_contains($normSubH, 'مج') || str_contains($normSubH, 'مجموع')) {
                    // Ignore the 'مج1' column, as it's a sum formula!
                    continue;
                } elseif (str_contains($normSubH, 'ن' . $term) || str_contains($normSubH, 'اختبار') || str_contains($normSubH, 'نهائي') || str_contains(strtolower($subHVal), 'exam')) {
                    $type = 'exam';
                } elseif (str_contains($normSubH, 'م' . $term) || str_contains($normSubH, 'اعمال') || str_contains(strtolower($subHVal), 'work')) {
                    $type = 'work';
                } else {
                    // Check if previous column was already work for this subject
                    if (isset($subjectColMap[$c - 1]) && $subjectColMap[$c - 1]['subject_id'] === $matchedSubject->id && $subjectColMap[$c - 1]['type'] === 'work') {
                        $type = 'exam';
                    } else {
                        $type = 'work';
                    }
                }

                $subjectColMap[$c] = [
                    'subject_id' => $matchedSubject->id,
                    'subject_name' => $matchedSubject->name_ar,
                    'type' => $type,
                ];
            }
        }

        if (empty($subjectColMap)) {
            return response()->json(['success' => false, 'message' => 'لم يتم التعرف على أي أعمدة مواد دراسية في الملف. تأكد من مطابقة أسماء المواد.'], 422);
        }

        // Fetch existing grades in DB for comparison
        $existingGrades = Grade::whereIn('student_id', $classStudents->pluck('id'))
            ->where('term', $term)
            ->where('is_control', false)
            ->get();

        $existingGradesIndex = [];
        foreach ($existingGrades as $eg) {
            $sid = $eg->student_id;
            $subid = $eg->subject_id;
            $m = (int) $eg->month;
            if ($m === 0) {
                if ($eg->final_exam !== null) {
                    $existingGradesIndex["{$sid}_{$subid}_exam"] = true;
                }
                if ($eg->coursework !== null) {
                    $existingGradesIndex["{$sid}_{$subid}_work"] = true;
                }
            } else {
                $existingGradesIndex["{$sid}_{$subid}_work"] = true;
            }
        }

        // Process Data Rows
        $dataStartRow = $subHeaderRow + 1;
        $previewRows = [];
        $errors = [];
        $warnings = [];
        $totalGradesFound = 0;
        $newGradesCount = 0;
        $updateGradesCount = 0;
        $matchedStudentsCount = 0;
        $unmatchedRowsCount = 0;

        for ($r = $dataStartRow; $r <= $highestRow; $r++) {
            $rawId = $idCol ? trim((string) $sheet->getCell([$idCol, $r])->getValue()) : '';
            $rawCode = $codeCol ? trim((string) $sheet->getCell([$codeCol, $r])->getValue()) : '';
            $rawName = $nameCol ? trim((string) $sheet->getCell([$nameCol, $r])->getValue()) : '';

            // Check if row is completely empty
            if ($rawId === '' && $rawCode === '' && $rawName === '') {
                continue;
            }

            // Student Matching
            $student = null;
            if ($rawId !== '' && is_numeric($rawId) && isset($studentsById[(int)$rawId])) {
                $student = $studentsById[(int)$rawId];
            } elseif ($rawCode !== '' && isset($studentsByCode[$rawCode])) {
                $student = $studentsByCode[$rawCode];
            } elseif ($rawName !== '') {
                $normName = $this->normalizeArabic($rawName);
                if (isset($studentsByNormName[$normName])) {
                    $student = $studentsByNormName[$normName];
                } else {
                    // Try robust fuzzy matching across words
                    $inputParts = array_filter(explode(' ', $normName));
                    if (count($inputParts) >= 2) {
                        $firstWord = reset($inputParts);
                        $lastWord = end($inputParts);
                        foreach ($studentsByNormName as $dbNorm => $dbStud) {
                            $dbParts = array_filter(explode(' ', $dbNorm));
                            $dbFirst = reset($dbParts);
                            $dbLast = end($dbParts);
                            if ($firstWord === $dbFirst && ($lastWord === $dbLast || str_contains($dbNorm, $lastWord))) {
                                $student = $dbStud;
                                break;
                            }
                        }
                    }
                }
            }

            if (!$student) {
                $normRawName = $this->normalizeArabic($rawName);
                $isFooterRow = str_contains($normRawName, 'عدد') || str_contains($normRawName, 'نسبه') || str_contains($normRawName, 'مجموع') || str_contains($normRawName, 'اسم') || str_contains($normRawName, 'راسب') || str_contains($normRawName, 'ناجح');
                if ($rawName !== '' && !$isFooterRow) {
                    $unmatchedRowsCount++;
                    $warnings[] = "السطر {$r}: الطالب ({$rawName}) غير مسجل في هذه الشعبة بالنظام وتم تخطيه.";
                }
                continue;
            }

            $matchedStudentsCount++;
            $rowGrades = [];
            $rowHasError = false;

            foreach ($subjectColMap as $colIdx => $colInfo) {
                $subId = $colInfo['subject_id'];
                $type = $colInfo['type'];
                $cellVal = $sheet->getCell([$colIdx, $r])->getValue();

                if ($cellVal === null || trim((string)$cellVal) === '' || trim((string)$cellVal) === '-') {
                    continue; // Skip empty
                }

                if (!is_numeric($cellVal)) {
                    $errors[] = "السطر {$r} ({$student->name_ar}): قيمة غير رقمية '{$cellVal}' في مادة {$colInfo['subject_name']}.";
                    $rowHasError = true;
                    continue;
                }

                $numericVal = (float) $cellVal;
                $maxVal = ($type === 'work') ? 20.0 : 30.0;

                if ($numericVal < 0 || $numericVal > $maxVal) {
                    $errors[] = "السطر {$r} ({$student->name_ar}): الدرجة ({$numericVal}) في مادة {$colInfo['subject_name']} تتجاوز الحد المسموح (0 - {$maxVal}).";
                    $rowHasError = true;
                    continue;
                }

                // Check if existing
                $isUpdate = isset($existingGradesIndex["{$student->id}_{$subId}_{$type}"]);
                if ($isUpdate) {
                    $updateGradesCount++;
                } else {
                    $newGradesCount++;
                }
                $totalGradesFound++;

                if (!isset($rowGrades[$subId])) {
                    $rowGrades[$subId] = [
                        'subject_id' => $subId,
                        'subject_name' => $colInfo['subject_name'],
                        'work' => null,
                        'exam' => null,
                        'is_work_update' => false,
                        'is_exam_update' => false,
                    ];
                }

                if ($type === 'work') {
                    $rowGrades[$subId]['work'] = $numericVal;
                    $rowGrades[$subId]['is_work_update'] = $isUpdate;
                } else {
                    $rowGrades[$subId]['exam'] = $numericVal;
                    $rowGrades[$subId]['is_exam_update'] = $isUpdate;
                }
            }

            $previewRows[] = [
                'row_index' => $r,
                'student_id' => $student->id,
                'student_code' => $student->student_code,
                'student_name' => $student->name_ar,
                'status' => $rowHasError ? 'error' : 'ready',
                'grades' => array_values($rowGrades),
            ];
        }

        // Generate cache token for confirm step
        $importToken = Str::random(40);
        Cache::put("grade_import_{$importToken}", [
            'class_id' => $classId,
            'term' => $term,
            'rows' => $previewRows,
            'user_id' => $user->id,
        ], now()->addMinutes(45));

        // Group detected subjects for table header
        $detectedSubjects = [];
        foreach ($subjectColMap as $info) {
            $detectedSubjects[$info['subject_id']] = [
                'id' => $info['subject_id'],
                'name_ar' => $info['subject_name'],
            ];
        }

        return response()->json([
            'success' => true,
            'import_token' => $importToken,
            'summary' => [
                'total_rows_processed' => count($previewRows) + $unmatchedRowsCount,
                'matched_students' => $matchedStudentsCount,
                'unmatched_rows' => $unmatchedRowsCount,
                'total_grades' => $totalGradesFound,
                'new_grades' => $newGradesCount,
                'update_grades' => $updateGradesCount,
                'errors_count' => count($errors),
                'warnings_count' => count($warnings),
            ],
            'subjects' => array_values($detectedSubjects),
            'rows' => $previewRows,
            'errors' => $errors,
            'warnings' => $warnings,
        ]);
    }

    /**
     * تأكيد وحفظ الدرجات بعد المعاينة داخل Transaction آمن
     */
    public function confirmImport(Request $request)
    {
        $request->validate([
            'import_token' => 'required|string',
            'overwrite_existing' => 'required|boolean',
        ]);

        $user = $request->user();
        $token = $request->input('import_token');
        $overwriteExisting = (bool) $request->input('overwrite_existing');

        $cachedData = Cache::get("grade_import_{$token}");
        if (!$cachedData) {
            return response()->json(['success' => false, 'message' => 'انتهت صلاحية جلسة المعاينة، يرجى إعادة رفع الملف.'], 422);
        }

        $classId = (int) $cachedData['class_id'];
        $term = (int) $cachedData['term'];
        $rows = $cachedData['rows'];

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك باستيراد درجات لهذه الشعبة.'], 403);
        }

        $insertedCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                if ($row['status'] === 'error') {
                    continue; // Skip any rows with errors
                }

                $studentId = $row['student_id'];

                foreach ($row['grades'] as $g) {
                    $subId = (int) $g['subject_id'];
                    $workVal = $g['work'] !== null ? (float)$g['work'] : null;
                    $examVal = $g['exam'] !== null ? (float)$g['exam'] : null;

                    // Process Final Exam and Coursework directly in month = 0
                    if ($examVal !== null || $workVal !== null) {
                        $existingTermGrade = Grade::where([
                            'student_id' => $studentId,
                            'subject_id' => $subId,
                            'term' => $term,
                            'month' => 0,
                            'is_control' => false,
                        ])->first();

                        if ($existingTermGrade && !$overwriteExisting) {
                            $skippedCount++;
                        } else {
                            $updateData = [
                                'homework' => 0,
                                'attendance' => 0,
                                'behavior' => 0,
                                'oral' => 0,
                                'written' => 0,
                            ];
                            if ($examVal !== null) {
                                $updateData['final_exam'] = $examVal;
                            }
                            if ($workVal !== null) {
                                $updateData['coursework'] = $workVal;
                            }

                            Grade::updateOrCreate(
                                [
                                    'student_id' => $studentId,
                                    'subject_id' => $subId,
                                    'term' => $term,
                                    'month' => 0,
                                    'is_control' => false,
                                ],
                                $updateData
                            );
                            if ($existingTermGrade) $updatedCount++; else $insertedCount++;
                        }
                    }
                }
            }

            DB::commit();

            // Clear cache token
            Cache::forget("grade_import_{$token}");

            return response()->json([
                'success' => true,
                'message' => 'تم استيراد وحفظ الدرجات بنجاح تام وبأمان كامل في قاعدة البيانات.',
                'stats' => [
                    'inserted' => $insertedCount,
                    'updated' => $updatedCount,
                    'skipped' => $skippedCount,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحفظ، تم التراجع عن جميع التغييرات: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * WIZARD STEP 1: فحص الملف واكتشاف الشيتات المتاحة
     */
    public function inspectWorkbook(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'class_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        $classId = (int) $request->input('class_id');

        $file = $request->file('file');
        $token = Str::random(40);

        // Store file in storage/app/temp_imports
        $tempDir = storage_path('app/temp_imports');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $ext = $file->getClientOriginalExtension() ?: 'xlsx';
        $tempFilename = "{$token}.{$ext}";
        $fullPath = "{$tempDir}/{$tempFilename}";
        copy($file->getRealPath(), $fullPath);

        try {
            $reader = IOFactory::createReaderForFile($fullPath);
            $sheetNames = $reader->listWorksheetNames($fullPath);
        } catch (\Exception $e) {
            @unlink($fullPath);
            return response()->json(['success' => false, 'message' => 'تعذر قراءة ملف الإكسل: ' . $e->getMessage()], 422);
        }

        $recommendedSheet = null;
        if ($classId) {
            $schoolClass = SchoolClass::find($classId);
            if ($schoolClass) {
                $gClean = $this->normalizeArabic($schoolClass->grade_ar);
                $sClean = $this->normalizeArabic($schoolClass->section_ar);

                foreach ($sheetNames as $shName) {
                    $tClean = $this->normalizeArabic($shName);
                    if (str_contains($tClean, $sClean)) {
                        foreach (['اول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس', 'سابع', 'ثامن', 'تاسع', 'عاشر', 'تمهيدي'] as $lvl) {
                            if (str_contains($gClean, $lvl) && str_contains($tClean, $lvl)) {
                                $recommendedSheet = $shName;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        if (!$recommendedSheet && !empty($sheetNames)) {
            $recommendedSheet = $sheetNames[0];
        }

        // Cache file metadata for 60 minutes
        Cache::put("excel_wizard_{$token}", [
            'path' => $fullPath,
            'original_name' => $file->getClientOriginalName(),
            'sheets' => $sheetNames,
            'user_id' => $user->id,
        ], now()->addMinutes(60));

        return response()->json([
            'success' => true,
            'file_token' => $token,
            'filename' => $file->getClientOriginalName(),
            'sheets' => $sheetNames,
            'recommended_sheet' => $recommendedSheet,
        ]);
    }

    /**
     * WIZARD STEP 2: اكتشاف ترويسات الأعمدة واقتراح مطابقة المواد
     */
    public function mapColumns(Request $request)
    {
        $request->validate([
            'file_token' => 'required|string',
            'sheet_name' => 'required|string',
            'class_id' => 'required|integer',
            'term' => 'required|in:1,2',
        ]);

        $token = $request->input('file_token');
        $sheetName = $request->input('sheet_name');
        $classId = (int) $request->input('class_id');
        $term = (int) $request->input('term');

        $fileData = Cache::get("excel_wizard_{$token}");
        if (!$fileData || !file_exists($fileData['path'])) {
            return response()->json(['success' => false, 'message' => 'انتهت صلاحية الملف المؤقت، يرجى إعادة رفعه.'], 422);
        }

        $filePath = $fileData['path'];

        try {
            $reader = IOFactory::createReaderForFile($filePath);
            $reader->setReadDataOnly(true);
            $reader->setLoadSheetsOnly([$sheetName]);
            $spreadsheet = $reader->load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'تعذر قراءة الورقة المختارة: ' . $e->getMessage()], 422);
        }

        $highestRow = min(25, $sheet->getHighestRow());
        $highestCol = Coordinate::columnIndexFromString($sheet->getHighestColumn());

        // Find header row (search for student name header)
        $headerRow = null;
        $subHeaderRow = null;
        for ($r = 1; $r <= min(15, $highestRow); $r++) {
            for ($c = 1; $c <= min(15, $highestCol); $c++) {
                $rawVal = (string) $sheet->getCell([$c, $r])->getValue();
                $valNorm = $this->normalizeArabic($rawVal);
                if (str_contains($valNorm, 'اسم') || str_contains(strtolower($rawVal), 'student')) {
                    $headerRow = $r;
                    $subHeaderRow = $r + 1;
                    break 2;
                }
            }
        }

        if (!$headerRow) {
            return response()->json(['success' => false, 'message' => 'لم يتم العثور على ترويسة الأسماء في هذه الورقة.'], 422);
        }

        // Identify ID, Code, Name columns
        $idCol = null;
        $codeCol = null;
        $nameCol = null;
        for ($c = 1; $c <= $highestCol; $c++) {
            $val = $this->normalizeArabic((string) $sheet->getCell([$c, $headerRow])->getValue());
            $rawVal = strtolower(trim((string) $sheet->getCell([$c, $headerRow])->getValue()));

            if (str_contains($val, 'معرف') || $rawVal === 'id') {
                $idCol = $c;
            } elseif (str_contains($val, 'رقم الطالب') || str_contains($val, 'كود') || str_contains($rawVal, 'code')) {
                $codeCol = $c;
            } elseif (str_contains($val, 'رقم الجلوس')) {
                if (!$codeCol) $codeCol = $c;
            } elseif (str_contains($val, 'اسم') || str_contains($rawVal, 'name')) {
                $nameCol = $c;
            }
        }

        if (!$nameCol) $nameCol = 3;

        // Fetch subjects
        $assignedSubjectIds = TeacherSubject::where('class_id', $classId)->pluck('subject_id')->unique()->toArray();
        $allSubjects = Subject::orderBy('name_ar')->get();
        $availableSubjects = $allSubjects->map(function ($sub) use ($assignedSubjectIds) {
            return [
                'id' => $sub->id,
                'name_ar' => $sub->name_ar,
                'name_en' => $sub->name_en,
                'is_assigned' => in_array($sub->id, $assignedSubjectIds),
            ];
        });

        $subjectsByNormName = [];
        foreach ($allSubjects as $sub) {
            $subjectsByNormName[$this->normalizeArabic($sub->name_ar)] = $sub;
        }

        // Analyze subject columns
        $detectedSubjectMappings = [];
        for ($c = 1; $c <= $highestCol; $c++) {
            if ($c === $idCol || $c === $codeCol || $c === $nameCol) continue;

            $hVal = trim((string) $sheet->getCell([$c, $headerRow])->getValue());
            $subHVal = trim((string) $sheet->getCell([$c, $subHeaderRow])->getValue());

            if ($hVal === '' && $c > 1) {
                for ($back = $c - 1; $back >= 1; $back--) {
                    $prevH = trim((string) $sheet->getCell([$back, $headerRow])->getValue());
                    if ($prevH !== '') { $hVal = $prevH; break; }
                }
            }

            if ($hVal === '' || str_contains($hVal, 'المجموع') || str_contains($hVal, 'الرقم السري')) continue;

            $matchedSub = $this->matchSubjectByHeader($hVal, $allSubjects);

            if ($matchedSub) {
                $subId = $matchedSub->id;
                $normSubH = $this->normalizeArabic($subHVal);

                if (str_contains($normSubH, 'مج') || str_contains($normSubH, 'مجموع')) {
                    continue; // Skip formula sum column
                }

                $type = 'work';
                if (str_contains($normSubH, 'ن' . $term) || str_contains($normSubH, 'اختبار') || str_contains($normSubH, 'نهائي') || str_contains(strtolower($subHVal), 'exam')) {
                    $type = 'exam';
                } elseif (str_contains($normSubH, 'م' . $term) || str_contains($normSubH, 'اعمال') || str_contains(strtolower($subHVal), 'work')) {
                    $type = 'work';
                } else {
                    if (isset($detectedSubjectMappings[$subId]['work_col']) && !isset($detectedSubjectMappings[$subId]['exam_col'])) {
                        $type = 'exam';
                    } else {
                        $type = 'work';
                    }
                }

                if (!isset($detectedSubjectMappings[$subId])) {
                    $detectedSubjectMappings[$subId] = [
                        'subject_id' => $subId,
                        'subject_name' => $matchedSub->name_ar,
                        'work_col' => null,
                        'exam_col' => null,
                        'header_text' => $hVal,
                        'is_included' => true,
                    ];
                }

                if ($type === 'work' && !$detectedSubjectMappings[$subId]['work_col']) {
                    $detectedSubjectMappings[$subId]['work_col'] = $c;
                } elseif ($type === 'exam' && !$detectedSubjectMappings[$subId]['exam_col']) {
                    $detectedSubjectMappings[$subId]['exam_col'] = $c;
                }
            }
        }

        // Get 3 sample preview rows
        $sampleRows = [];
        $dataStartRow = $subHeaderRow + 1;
        for ($r = $dataStartRow; $r <= min($dataStartRow + 3, $sheet->getHighestRow()); $r++) {
            $nameVal = trim((string) $sheet->getCell([$nameCol, $r])->getValue());
            if ($nameVal === '') continue;

            $rowSample = [
                'excel_name' => $nameVal,
                'excel_code' => $codeCol ? trim((string) $sheet->getCell([$codeCol, $r])->getValue()) : '',
                'cells' => [],
            ];
            foreach ($detectedSubjectMappings as $subMap) {
                $w = $subMap['work_col'] ? $sheet->getCell([$subMap['work_col'], $r])->getValue() : null;
                $e = $subMap['exam_col'] ? $sheet->getCell([$subMap['exam_col'], $r])->getValue() : null;
                $rowSample['cells'][$subMap['subject_id']] = [
                    'work' => $w,
                    'exam' => $e,
                ];
            }
            $sampleRows[] = $rowSample;
        }

        return response()->json([
            'success' => true,
            'header_row' => $headerRow,
            'sub_header_row' => $subHeaderRow,
            'name_col' => $nameCol,
            'code_col' => $codeCol,
            'id_col' => $idCol,
            'mappings' => array_values($detectedSubjectMappings),
            'available_subjects' => $availableSubjects,
            'sample_rows' => $sampleRows,
        ]);
    }

    /**
     * WIZARD STEP 3: محرك تسوية الطلاب والمطابقة الذكية اللحظية
     */
    public function reconcileData(Request $request)
    {
        $request->validate([
            'file_token' => 'required|string',
            'sheet_name' => 'required|string',
            'class_id' => 'required|integer',
            'term' => 'required|in:1,2',
            'mappings' => 'required|array',
            'name_col' => 'required|integer',
            'code_col' => 'nullable|integer',
            'id_col' => 'nullable|integer',
        ]);

        $token = $request->input('file_token');
        $sheetName = $request->input('sheet_name');
        $classId = (int) $request->input('class_id');
        $term = (int) $request->input('term');
        $mappings = $request->input('mappings');
        $nameCol = (int) $request->input('name_col');
        $codeCol = $request->input('code_col') ? (int) $request->input('code_col') : null;
        $idCol = $request->input('id_col') ? (int) $request->input('id_col') : null;

        $fileData = Cache::get("excel_wizard_{$token}");
        if (!$fileData || !file_exists($fileData['path'])) {
            return response()->json(['success' => false, 'message' => 'انتهت صلاحية الملف المؤقت، يرجى إعادة رفعه.'], 422);
        }

        $filePath = $fileData['path'];

        try {
            $reader = IOFactory::createReaderForFile($filePath);
            $reader->setReadDataOnly(true);
            $reader->setLoadSheetsOnly([$sheetName]);
            $spreadsheet = $reader->load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'تعذر قراءة الورقة المختارة: ' . $e->getMessage()], 422);
        }

        // Fetch students in class
        $classStudents = Student::where('class_id', $classId)
            ->where('is_active', true)
            ->get();

        $studentsById = $classStudents->keyBy('id');
        $studentsByCode = $classStudents->keyBy('student_code');
        $studentsByNormName = [];
        foreach ($classStudents as $s) {
            $studentsByNormName[$this->normalizeArabic($s->name_ar)] = $s;
        }

        // Fetch existing grades in DB for comparison
        $existingGrades = Grade::whereIn('student_id', $classStudents->pluck('id'))
            ->where('term', $term)
            ->where('is_control', false)
            ->get();

        $existingGradesIndex = [];
        foreach ($existingGrades as $eg) {
            $sid = $eg->student_id;
            $subid = $eg->subject_id;
            $m = (int) $eg->month;
            if ($m === 0) {
                if ($eg->final_exam !== null) {
                    $existingGradesIndex["{$sid}_{$subid}_exam"] = true;
                }
                if ($eg->coursework !== null) {
                    $existingGradesIndex["{$sid}_{$subid}_work"] = true;
                }
            } else {
                $existingGradesIndex["{$sid}_{$subid}_work"] = true;
            }
        }

        // Filter active mappings (included only)
        $activeMappings = array_filter($mappings, fn($m) => !empty($m['is_included']));

        // Find header row
        $headerRow = (int) $request->input('header_row', 7);
        $highestRow = $sheet->getHighestRow();

        $reconciledRows = [];
        $matchedSystemStudentIds = [];
        $totalGradesFound = 0;

        for ($r = $headerRow + 2; $r <= $highestRow; $r++) {
            $rawId = $idCol ? trim((string) $sheet->getCell([$idCol, $r])->getValue()) : '';
            $rawCode = $codeCol ? trim((string) $sheet->getCell([$codeCol, $r])->getValue()) : '';
            $rawName = trim((string) $sheet->getCell([$nameCol, $r])->getValue());

            if ($rawId === '' && $rawCode === '' && $rawName === '') continue;

            $normRawName = $this->normalizeArabic($rawName);
            $isFooterRow = str_contains($normRawName, 'عدد') || str_contains($normRawName, 'نسبه') || str_contains($normRawName, 'مجموع') || str_contains($normRawName, 'اسم') || str_contains($normRawName, 'راسب') || str_contains($normRawName, 'ناجح');
            if ($isFooterRow) continue;

            // Student Entity Resolution
            $matchedStudent = null;
            $confidence = 'none';

            if ($rawId !== '' && is_numeric($rawId) && isset($studentsById[(int)$rawId])) {
                $matchedStudent = $studentsById[(int)$rawId];
                $confidence = 'exact';
            } elseif ($rawCode !== '' && isset($studentsByCode[$rawCode])) {
                $matchedStudent = $studentsByCode[$rawCode];
                $confidence = 'exact';
            } elseif ($rawName !== '') {
                if (isset($studentsByNormName[$normRawName])) {
                    $matchedStudent = $studentsByNormName[$normRawName];
                    $confidence = 'high';
                } else {
                    $inputParts = array_filter(explode(' ', $normRawName));
                    if (count($inputParts) >= 2) {
                        $firstWord = reset($inputParts);
                        $lastWord = end($inputParts);
                        foreach ($studentsByNormName as $dbNorm => $dbStud) {
                            $dbParts = array_filter(explode(' ', $dbNorm));
                            $dbFirst = reset($dbParts);
                            $dbLast = end($dbParts);
                            if ($firstWord === $dbFirst && ($lastWord === $dbLast || str_contains($dbNorm, $lastWord))) {
                                $matchedStudent = $dbStud;
                                $confidence = 'fuzzy';
                                break;
                            }
                        }
                    }
                }
            }

            if ($matchedStudent) {
                $matchedSystemStudentIds[$matchedStudent->id] = true;
            }

            // Extract grades for this row
            $rowGrades = [];
            foreach ($activeMappings as $m) {
                $subId = (int) $m['subject_id'];
                $wCol = !empty($m['work_col']) ? (int) $m['work_col'] : null;
                $eCol = !empty($m['exam_col']) ? (int) $m['exam_col'] : null;

                $wVal = $wCol ? $sheet->getCell([$wCol, $r])->getValue() : null;
                $eVal = $eCol ? $sheet->getCell([$eCol, $r])->getValue() : null;

                $numWork = is_numeric($wVal) ? (float)$wVal : null;
                $numExam = is_numeric($eVal) ? (float)$eVal : null;

                if ($numWork !== null || $numExam !== null) {
                    $totalGradesFound++;
                }

                $isWorkUpdate = ($matchedStudent && isset($existingGradesIndex["{$matchedStudent->id}_{$subId}_work"]));
                $isExamUpdate = ($matchedStudent && isset($existingGradesIndex["{$matchedStudent->id}_{$subId}_exam"]));

                $rowGrades[$subId] = [
                    'subject_id' => $subId,
                    'subject_name' => $m['subject_name'],
                    'work' => $numWork,
                    'exam' => $numExam,
                    'is_work_update' => $isWorkUpdate,
                    'is_exam_update' => $isExamUpdate,
                    'work_error' => ($numWork !== null && ($numWork < 0 || $numWork > 20)) ? 'يجب أن تكون الدرجة بين 0 و 20' : null,
                    'exam_error' => ($numExam !== null && ($numExam < 0 || $numExam > 30)) ? 'يجب أن تكون الدرجة بين 0 و 30' : null,
                ];
            }

            $reconciledRows[] = [
                'row_id' => $r,
                'excel_name' => $rawName,
                'excel_code' => $rawCode,
                'matched_student' => $matchedStudent ? [
                    'id' => $matchedStudent->id,
                    'student_code' => $matchedStudent->student_code,
                    'name_ar' => $matchedStudent->name_ar,
                ] : null,
                'match_confidence' => $confidence,
                'is_included' => $matchedStudent !== null,
                'grades' => $rowGrades,
            ];
        }

        // Identify Missing Students in Class
        $missingStudents = [];
        foreach ($classStudents as $s) {
            if (!isset($matchedSystemStudentIds[$s->id])) {
                $missingStudents[] = [
                    'id' => $s->id,
                    'student_code' => $s->student_code,
                    'name_ar' => $s->name_ar,
                ];
            }
        }

        $allClassStudentsSimple = $classStudents->map(function ($s) {
            return [
                'id' => $s->id,
                'student_code' => $s->student_code,
                'name_ar' => $s->name_ar,
            ];
        })->values();

        $reconToken = Str::random(40);
        Cache::put("grade_recon_{$reconToken}", [
            'class_id' => $classId,
            'term' => $term,
            'rows' => $reconciledRows,
        ], now()->addMinutes(45));

        return response()->json([
            'success' => true,
            'reconciliation_token' => $reconToken,
            'summary' => [
                'total_rows' => count($reconciledRows),
                'matched_count' => count(array_filter($reconciledRows, fn($r) => $r['matched_student'] !== null)),
                'unmatched_count' => count(array_filter($reconciledRows, fn($r) => $r['matched_student'] === null)),
                'missing_students_count' => count($missingStudents),
                'total_grades' => $totalGradesFound,
            ],
            'rows' => $reconciledRows,
            'missing_students' => $missingStudents,
            'all_class_students' => $allClassStudentsSimple,
            'active_subjects' => array_values($activeMappings),
        ]);
    }

    /**
     * WIZARD STEP 4: الاعتماد والحفظ النهائي للدرجات بعد التسوية والتعديل
     */
    public function commitReconciliation(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer',
            'term' => 'required|in:1,2',
            'overwrite_existing' => 'required|boolean',
            'rows' => 'required|array',
        ]);

        $user = $request->user();
        $classId = (int) $request->input('class_id');
        $term = (int) $request->input('term');
        $overwriteExisting = (bool) $request->input('overwrite_existing');
        $rows = $request->input('rows');

        $scopedClassIds = PermissionService::getScopedClassIds($user, 'detailedGrades');
        if ($scopedClassIds !== null && !in_array($classId, $scopedClassIds)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك باستيراد درجات لهذه الشعبة.'], 403);
        }

        // Validate uniqueness of matched student IDs to prevent duplicate collisions
        $assignedIds = [];
        foreach ($rows as $row) {
            if (!empty($row['is_included']) && !empty($row['matched_student']['id'])) {
                $sid = (int) $row['matched_student']['id'];
                if (isset($assignedIds[$sid])) {
                    $dupName = $row['matched_student']['name_ar'] ?? "ID {$sid}";
                    return response()->json([
                        'success' => false,
                        'message' => "تم ربط الطالب ({$dupName}) بأكثر من سطر واحد في الكشف. يرجى إزالة التكرار قبل الحفظ.",
                    ], 422);
                }
                $assignedIds[$sid] = true;
            }
        }

        $insertedCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;
        $savedStudentsCount = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                if (empty($row['is_included']) || empty($row['matched_student']['id'])) {
                    continue; // Skip excluded or unlinked rows
                }

                $studentId = (int) $row['matched_student']['id'];
                $savedStudentsCount++;

                foreach ($row['grades'] as $subId => $g) {
                    $workVal = (isset($g['work']) && $g['work'] !== null && $g['work'] !== '') ? (float)$g['work'] : null;
                    $examVal = (isset($g['exam']) && $g['exam'] !== null && $g['exam'] !== '') ? (float)$g['exam'] : null;

                    // Process Final Exam and Coursework directly in month = 0
                    if ($examVal !== null || $workVal !== null) {
                        $existingTermGrade = Grade::where([
                            'student_id' => $studentId,
                            'subject_id' => (int)$subId,
                            'term' => $term,
                            'month' => 0,
                            'is_control' => false,
                        ])->first();

                        if ($existingTermGrade && !$overwriteExisting) {
                            $skippedCount++;
                        } else {
                            $updateData = [
                                'homework' => 0,
                                'attendance' => 0,
                                'behavior' => 0,
                                'oral' => 0,
                                'written' => 0,
                            ];
                            if ($examVal !== null) {
                                $updateData['final_exam'] = $examVal;
                            }
                            if ($workVal !== null) {
                                $updateData['coursework'] = $workVal;
                            }

                            Grade::updateOrCreate(
                                [
                                    'student_id' => $studentId,
                                    'subject_id' => (int)$subId,
                                    'term' => $term,
                                    'month' => 0,
                                    'is_control' => false,
                                ],
                                $updateData
                            );
                            if ($existingTermGrade) $updatedCount++; else $insertedCount++;
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم استيراد وحفظ الدرجات بنجاح تام وفق التسوية المعتمدة.',
                'stats' => [
                    'students_count' => $savedStudentsCount,
                    'inserted' => $insertedCount,
                    'updated' => $updatedCount,
                    'skipped' => $skippedCount,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحفظ، تم التراجع عن جميع التغييرات: ' . $e->getMessage(),
            ], 500);
        }
    }
}
