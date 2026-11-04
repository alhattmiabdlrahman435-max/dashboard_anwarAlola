<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class AcademicYearArchiveService
{
    /**
     * Build and return all data for the academic year.
     */
    public function gatherYearData(string $academicYear = '2026-2027م'): array
    {
        $schoolName = 'رياض ومدارس أنوار العلى الدولية النموذجية';
        $exportDate = Carbon::now()->format('Y/m/d h:i A');

        // 1. Classes
        $classes = SchoolClass::orderBy('grade_ar')->orderBy('section_ar')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'grade_ar' => $c->grade_ar,
                'grade_en' => $c->grade_en,
                'section_ar' => $c->section_ar,
                'section_en' => $c->section_en,
                'full_name' => "{$c->grade_ar} - شعبة ({$c->section_ar})",
            ];
        });

        // 2. Subjects
        $subjects = Subject::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'name_ar' => $s->name_ar,
                'name_en' => $s->name_en,
                'code' => $s->code ?? '',
            ];
        });

        // 3. Parents
        $parents = User::where('role', 'parent')->get()->map(function ($p) {
            $children = Student::where('parent_id', $p->id)->select('id', 'name_ar', 'student_code', 'class_id')->get();
            return [
                'id' => $p->id,
                'name' => $p->name_ar ?: $p->name,
                'national_id' => $p->national_id ?? '-',
                'phone' => $p->phone ?? '-',
                'address' => $p->address ?? '-',
                'children_count' => $children->count(),
                'children' => $children,
            ];
        });

        // 4. Students
        $students = Student::with(['schoolClass', 'parentUser'])->get()->map(function ($st) {
            $paidSum = Payment::where('student_id', $st->id)->sum('amount');
            $tuition = (float) ($st->tuition_fee ?? 0);
            $remaining = max(0, $tuition - $paidSum);

            return [
                'id' => $st->id,
                'student_code' => $st->student_code ?? "STD-{$st->id}",
                'name_ar' => $st->name_ar,
                'name_en' => $st->name_en ?? '',
                'class_id' => $st->class_id,
                'class_name' => $st->schoolClass ? "{$st->schoolClass->grade_ar} - {$st->schoolClass->section_ar}" : '-',
                'grade' => $st->schoolClass ? $st->schoolClass->grade_ar : '-',
                'section' => $st->schoolClass ? $st->schoolClass->section_ar : '-',
                'parent_id' => $st->parent_id,
                'parent_name' => $st->parentUser ? ($st->parentUser->name_ar ?: $st->parentUser->name) : '-',
                'parent_phone' => $st->parentUser ? $st->parentUser->phone : '-',
                'tuition_fee' => $tuition,
                'paid_fee' => (float) $paidSum,
                'remaining_fee' => $remaining,
                'status' => $st->is_active ? 'منتظم' : 'منقطع',
            ];
        });

        // 5. Teachers & Supervisors
        $teachers = User::whereIn('role', ['teacher', 'prep_supervisor', 'supervisor'])->get()->map(function ($t) {
            $classesAssigned = DB::table('teacher_subjects')
                ->join('classes', 'classes.id', '=', 'teacher_subjects.class_id')
                ->join('subjects', 'subjects.id', '=', 'teacher_subjects.subject_id')
                ->where('teacher_subjects.teacher_id', $t->id)
                ->select('classes.grade_ar', 'classes.section_ar', 'subjects.name_ar as subject_name')
                ->get();

            return [
                'id' => $t->id,
                'name' => $t->name_ar ?: $t->name,
                'role' => $t->role === 'teacher' ? 'معلم' : 'مشرف',
                'job_id' => $t->job_id ?? '-',
                'phone' => $t->phone ?? '-',
                'assignments_count' => $classesAssigned->count(),
                'assignments' => $classesAssigned,
            ];
        });

        // 6. Grades
        $grades = Grade::all()->map(function ($g) {
            $monthTotal = (float) $g->homework + (float) $g->attendance + (float) $g->behavior + (float) $g->oral + (float) $g->written;
            return [
                'id' => $g->id,
                'student_id' => $g->student_id,
                'subject_id' => $g->subject_id,
                'term' => $g->term,
                'month' => $g->month,
                'homework' => (float) $g->homework,
                'attendance' => (float) $g->attendance,
                'behavior' => (float) $g->behavior,
                'oral' => (float) $g->oral,
                'written' => (float) $g->written,
                'month_total' => $monthTotal,
                'coursework' => (float) $g->coursework,
                'final_exam' => (float) $g->final_exam,
            ];
        });

        // 7. Attendance Summary
        $attendanceTotal = Attendance::count();
        $presentTotal = Attendance::where('status', 'present')->count();
        $absentTotal = Attendance::where('status', 'absent')->count();

        // 8. Financial Summary
        $totalTuition = $students->sum('tuition_fee');
        $totalPaid = $students->sum('paid_fee');
        $totalRemaining = $students->sum('remaining_fee');

        return [
            'meta' => [
                'school_name' => $schoolName,
                'academic_year' => $academicYear,
                'export_date' => $exportDate,
                'total_students' => $students->count(),
                'total_classes' => $classes->count(),
                'total_teachers' => $teachers->count(),
                'total_parents' => $parents->count(),
                'total_grades' => $grades->count(),
                'attendance_rate' => $attendanceTotal > 0 ? round(($presentTotal / $attendanceTotal) * 100, 1) : 100,
                'total_tuition' => $totalTuition,
                'total_paid' => $totalPaid,
                'total_remaining' => $totalRemaining,
            ],
            'classes' => $classes,
            'subjects' => $subjects,
            'students' => $students,
            'parents' => $parents,
            'teachers' => $teachers,
            'grades' => $grades,
        ];
    }

    /**
     * Generate the complete standalone single-file HTML viewer.
     */
    public function generateHtmlViewer(array $data): string
    {
        $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
        $schoolName = htmlspecialchars($data['meta']['school_name']);
        $year = htmlspecialchars($data['meta']['academic_year']);
        $exportDate = htmlspecialchars($data['meta']['export_date']);

        return <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$schoolName} - أرشيف العام الدراسي {$year}</title>
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-light: #3b82f6;
            --secondary: #0f766e;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text-dark: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --success: #16a34a;
            --danger: #dc2626;
            --warning: #d97706;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        body {
            background-color: var(--bg);
            color: var(--text-dark);
            line-height: 1.5;
            padding-bottom: 50px;
        }

        /* Top Header */
        .archive-topbar {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 20px 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .archive-topbar-content {
            max-width: 1300px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
        }

        .school-info h1 {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 4px;
        }

        .school-info p {
            font-size: 13px;
            color: #bfdbfe;
        }

        .badge-offline {
            background: rgba(16, 185, 129, 0.25);
            border: 1px solid #34d399;
            color: #d1fae5;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        /* Main Container */
        .main-container {
            max-width: 1300px;
            margin: 25px auto;
            padding: 0 20px;
        }

        /* Nav Tabs */
        .archive-nav {
            display: flex;
            gap: 8px;
            background: var(--surface);
            padding: 8px;
            border-radius: 12px;
            border: 1px solid var(--border);
            margin-bottom: 25px;
            overflow-x: auto;
        }

        .nav-btn {
            background: transparent;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .nav-btn:hover {
            color: var(--primary);
            background: #eff6ff;
        }

        .nav-btn.active {
            background: var(--primary);
            color: white;
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 25px;
        }

        .kpi-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .kpi-card .label {
            font-size: 12.5px;
            color: var(--text-muted);
            font-weight: 600;
            margin-bottom: 6px;
        }

        .kpi-card .value {
            font-size: 28px;
            font-weight: 800;
            color: var(--primary);
        }

        .kpi-card .sub {
            font-size: 11.5px;
            color: var(--text-muted);
            margin-top: 4px;
        }

        /* Panels */
        .tab-panel {
            display: none;
        }

        .tab-panel.active {
            display: block;
        }

        /* Filter & Search Bar */
        .toolbar {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 15px 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }

        .search-input, .select-input {
            padding: 8px 14px;
            border: 1.5px solid var(--border);
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            background: var(--bg);
        }

        .search-input:focus, .select-input:focus {
            border-color: var(--primary-light);
            background: white;
        }

        .search-input {
            min-width: 250px;
        }

        .btn-print {
            background: var(--secondary);
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-print:hover {
            opacity: 0.9;
        }

        /* Table */
        .table-responsive {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow-x: auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: right;
            font-size: 13px;
        }

        thead tr {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            border-bottom: 2px solid var(--border);
        }

        th, td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }

        tbody tr:hover {
            background-color: #f8fafc;
        }

        .badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
        }

        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-warning { background: #fef3c7; color: #b45309; }
        .badge-danger { background: #fee2e2; color: #b91c1c; }
        .badge-primary { background: #dbeafe; color: #1d4ed8; }

        /* Print Header - Hidden on Screen */
        .print-header {
            display: none;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        @media print {
            body { background: white; padding: 0; color: black; }
            .archive-topbar, .archive-nav, .toolbar, .no-print { display: none !important; }
            .tab-panel { display: block !important; }
            .print-header { display: block !important; }
            .table-responsive { border: 1px solid #000; box-shadow: none; border-radius: 0; }
            th, td { border: 1px solid #333; padding: 6px 10px; }
            thead tr { background: #eee !important; color: black !important; }
            .kpi-grid { display: none !important; }
        }
    </style>
</head>
<body>

    <header class="archive-topbar no-print">
        <div class="archive-topbar-content">
            <div class="school-info">
                <h1>{$schoolName}</h1>
                <p>الأرشيف الإداري والأكاديمي الشامل للعام الدراسي: <strong>{$year}</strong> • تم التصدير بتاريخ: {$exportDate}</p>
            </div>
            <div>
                <span class="badge-offline">✔ نسخة مستقلة تعمل بدون إنترنت (Offline Archive)</span>
            </div>
        </div>
    </header>

    <main class="main-container">
        <!-- Print Header -->
        <div class="print-header">
            <h2>{$schoolName}</h2>
            <p>سجل العام الدراسي: {$year} • تاريخ الاستخراج: {$exportDate}</p>
        </div>

        <!-- Navigation Tabs -->
        <nav class="archive-nav no-print">
            <button class="nav-btn active" onclick="switchTab('dashboard')">📊 لوحة التحكم والإحصائيات</button>
            <button class="nav-btn" onclick="switchTab('students')">👨‍🎓 سجل الطلاب</button>
            <button class="nav-btn" onclick="switchTab('parents')">👨‍👩‍👧 أولياء الأمور</button>
            <button class="nav-btn" onclick="switchTab('teachers')">👨‍🏫 المعلمون والمشرفون</button>
            <button class="nav-btn" onclick="switchTab('classes')">🏫 الفصول والشعب</button>
            <button class="nav-btn" onclick="switchTab('grades')">📝 كشوف الدرجات والكنترول</button>
            <button class="nav-btn" onclick="switchTab('finance')">💰 السجل المالي</button>
        </nav>

        <!-- 1. Dashboard Tab -->
        <section id="tab-dashboard" class="tab-panel active">
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="label">إجمالي الطلاب المقيدين</div>
                    <div class="value" id="kpi-students">0</div>
                    <div class="sub">طالباً وطالبة في جميع المراحل</div>
                </div>
                <div class="kpi-card">
                    <div class="label">الشعب والفصول النشطة</div>
                    <div class="value" id="kpi-classes">0</div>
                    <div class="sub">شعبة دراسية معتمدة</div>
                </div>
                <div class="kpi-card">
                    <div class="label">الكادر التعليمي</div>
                    <div class="value" id="kpi-teachers">0</div>
                    <div class="sub">معلماً ومشرفاً</div>
                </div>
                <div class="kpi-card">
                    <div class="label">سجلات أولياء الأمور</div>
                    <div class="value" id="kpi-parents">0</div>
                    <div class="sub">ولي أمر مسجل</div>
                </div>
                <div class="kpi-card">
                    <div class="label">إجمالي الرسوم المحصلة</div>
                    <div class="value" id="kpi-paid" style="color: var(--success);">0</div>
                    <div class="sub" id="kpi-remaining-sub">المتبقي: 0</div>
                </div>
                <div class="kpi-card">
                    <div class="label">سجلات رصد الدرجات</div>
                    <div class="value" id="kpi-grades">0</div>
                    <div class="sub">رصدة تقييمية وأعمال سنة</div>
                </div>
            </div>

            <div class="table-responsive" style="padding: 20px;">
                <h3 style="margin-bottom: 12px; font-size: 16px; font-weight: 800;">ℹ️ معلومات النسخة الأرشيفية المرجعية</h3>
                <p style="color: var(--text-muted); font-size: 13px; line-height: 1.8;">
                    تم إنشاء هذه النسخة خصيصاً كمرجع أساسي ودائم للعام الدراسي <strong>{$year}</strong>، تحتوي على قاعدة البيانات الكاملة للعام الدراسي بما فيها شؤون الطلاب والدرجات والمالية والمعلمين.
                    <br>
                    يمكنك الاحتفاظ بهذا الملف على <strong>فلاشة USB</strong>، <strong>هارد خارجي</strong>، أو في أي مجلد بالكمبيوتر، ويعمل بصورة كاملة <strong>دون الحاجة لتوفر شبكة إنترنت أو تشغيل خوادم محلية</strong>.
                </p>
            </div>
        </section>

        <!-- 2. Students Tab -->
        <section id="tab-students" class="tab-panel">
            <div class="toolbar no-print">
                <input type="text" id="student-search" class="search-input" placeholder="🔍 ابحث باسم الطالب أو الرقم الأكاديمي..." oninput="renderStudents()">
                <select id="student-class-filter" class="select-input" onchange="renderStudents()">
                    <option value="all">جميع الفصول والشعب</option>
                </select>
                <button class="btn-print" onclick="window.print()">🖨️ طباعة كشف الطلاب</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الرقم الأكاديمي</th>
                            <th>اسم الطالب</th>
                            <th>الصف والشعبة</th>
                            <th>ولي الأمر</th>
                            <th>رقم هاتف التواصل</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody id="students-tbody"></tbody>
                </table>
            </div>
        </section>

        <!-- 3. Parents Tab -->
        <section id="tab-parents" class="tab-panel">
            <div class="toolbar no-print">
                <input type="text" id="parent-search" class="search-input" placeholder="🔍 ابحث باسم ولي الأمر أو الرقم الوطني..." oninput="renderParents()">
                <button class="btn-print" onclick="window.print()">🖨️ طباعة كشف أولياء الأمور</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم ولي الأمر</th>
                            <th>الرقم الوطني</th>
                            <th>رقم الهاتف</th>
                            <th>عدد الأبناء</th>
                            <th>أسماء الأبناء والصفوف</th>
                        </tr>
                    </thead>
                    <tbody id="parents-tbody"></tbody>
                </table>
            </div>
        </section>

        <!-- 4. Teachers Tab -->
        <section id="tab-teachers" class="tab-panel">
            <div class="toolbar no-print">
                <input type="text" id="teacher-search" class="search-input" placeholder="🔍 ابحث باسم المعلم أو الرقم الوظيفي..." oninput="renderTeachers()">
                <button class="btn-print" onclick="window.print()">🖨️ طباعة كشف الهيئة التعليمية</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم الكامل</th>
                            <th>الصفة</th>
                            <th>الرقم الوظيفي</th>
                            <th>رقم الهاتف</th>
                            <th>المواد والصفوف المكلف بها</th>
                        </tr>
                    </thead>
                    <tbody id="teachers-tbody"></tbody>
                </table>
            </div>
        </section>

        <!-- 5. Classes Tab -->
        <section id="tab-classes" class="tab-panel">
            <div class="toolbar no-print">
                <button class="btn-print" onclick="window.print()">🖨️ طباعة كشف الفصول والشعب</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الصف الدراسي</th>
                            <th>الشعبة</th>
                            <th>عدد الطلاب المسجلين</th>
                        </tr>
                    </thead>
                    <tbody id="classes-tbody"></tbody>
                </table>
            </div>
        </section>

        <!-- 6. Grades & Control Tab -->
        <section id="tab-grades" class="tab-panel">
            <div class="toolbar no-print">
                <input type="text" id="grade-student-search" class="search-input" placeholder="🔍 ابحث باسم الطالب في الكنترول..." oninput="renderGrades()">
                <select id="grade-class-filter" class="select-input" onchange="renderGrades()">
                    <option value="all">جميع الصفوف والشعب</option>
                </select>
                <select id="grade-term-filter" class="select-input" onchange="renderGrades()">
                    <option value="1">الترم الأول</option>
                    <option value="2">الترم الثاني</option>
                </select>
                <button class="btn-print" onclick="window.print()">🖨️ طباعة كشف رصد الدرجات</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم الطالب</th>
                            <th>الصف / الشعبة</th>
                            <th>المادة</th>
                            <th>الشهر 1</th>
                            <th>الشهر 2</th>
                            <th>الشهر 3</th>
                            <th>المحصلة</th>
                            <th>اختبار النهاية</th>
                        </tr>
                    </thead>
                    <tbody id="grades-tbody"></tbody>
                </table>
            </div>
        </section>

        <!-- 7. Finance Tab -->
        <section id="tab-finance" class="tab-panel">
            <div class="toolbar no-print">
                <input type="text" id="finance-search" class="search-input" placeholder="🔍 ابحث باسم الطالب في السجل المالي..." oninput="renderFinance()">
                <button class="btn-print" onclick="window.print()">🖨️ طباعة السجل المالي</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الرقم الأكاديمي</th>
                            <th>اسم الطالب</th>
                            <th>الصف والشعبة</th>
                            <th>الرسوم المقررة</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>حالة السداد</th>
                        </tr>
                    </thead>
                    <tbody id="finance-tbody"></tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Embedded Offline JSON Database -->
    <script id="archive-data" type="application/json">
        {$jsonData}
    </script>

    <script>
        const DATA = JSON.parse(document.getElementById('archive-data').textContent);

        function init() {
            // Populate KPIs
            document.getElementById('kpi-students').textContent = Number(DATA.meta.total_students).toLocaleString();
            document.getElementById('kpi-classes').textContent = Number(DATA.meta.total_classes).toLocaleString();
            document.getElementById('kpi-teachers').textContent = Number(DATA.meta.total_teachers).toLocaleString();
            document.getElementById('kpi-parents').textContent = Number(DATA.meta.total_parents).toLocaleString();
            document.getElementById('kpi-grades').textContent = Number(DATA.meta.total_grades).toLocaleString();
            document.getElementById('kpi-paid').textContent = Number(DATA.meta.total_paid).toLocaleString() + ' ريال';
            document.getElementById('kpi-remaining-sub').textContent = 'المتبقي: ' + Number(DATA.meta.total_remaining).toLocaleString() + ' ريال';

            // Populate Class Filter Dropdowns
            const studentClassSelect = document.getElementById('student-class-filter');
            const gradeClassSelect = document.getElementById('grade-class-filter');
            DATA.classes.forEach(c => {
                const opt1 = new Option(c.full_name, c.id);
                const opt2 = new Option(c.full_name, c.id);
                studentClassSelect.add(opt1);
                gradeClassSelect.add(opt2);
            });

            // Initial renders
            renderStudents();
            renderParents();
            renderTeachers();
            renderClasses();
            renderGrades();
            renderFinance();
        }

        function switchTab(tabId) {
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

            const panel = document.getElementById('tab-' + tabId);
            if (panel) panel.classList.add('active');

            const btns = Array.from(document.querySelectorAll('.nav-btn'));
            const matchedBtn = btns.find(b => b.getAttribute('onclick').includes(tabId));
            if (matchedBtn) matchedBtn.classList.add('active');
        }

        function renderStudents() {
            const query = (document.getElementById('student-search').value || '').trim().toLowerCase();
            const classId = document.getElementById('student-class-filter').value;
            const tbody = document.getElementById('students-tbody');

            const filtered = DATA.students.filter(st => {
                const matchesClass = (classId === 'all' || String(st.class_id) === String(classId));
                const matchesQuery = !query || st.name_ar.toLowerCase().includes(query) || st.student_code.toLowerCase().includes(query);
                return matchesClass && matchesQuery;
            });

            tbody.innerHTML = filtered.map((st, i) => `
                <tr>
                    <td>\${i + 1}</td>
                    <td><code>\${st.student_code}</code></td>
                    <td><strong>\${st.name_ar}</strong></td>
                    <td>\${st.class_name}</td>
                    <td>\${st.parent_name}</td>
                    <td>\${st.parent_phone}</td>
                    <td><span class="badge badge-success">\${st.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center; padding: 20px;">لا توجد نتائج مطابقة</td></tr>';
        }

        function renderParents() {
            const query = (document.getElementById('parent-search').value || '').trim().toLowerCase();
            const tbody = document.getElementById('parents-tbody');

            const filtered = DATA.parents.filter(p => {
                return !query || p.name.toLowerCase().includes(query) || String(p.national_id).toLowerCase().includes(query);
            });

            tbody.innerHTML = filtered.map((p, i) => {
                const kidsStr = (p.children || []).map(k => k.name_ar).join('، ') || '-';
                return `
                    <tr>
                        <td>\${i + 1}</td>
                        <td><strong>\${p.name}</strong></td>
                        <td><code>\${p.national_id}</code></td>
                        <td>\${p.phone}</td>
                        <td><span class="badge badge-primary">\${p.children_count} أبناء</span></td>
                        <td>\${kidsStr}</td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="6" style="text-align:center; padding: 20px;">لا توجد نتائج مطابقة</td></tr>';
        }

        function renderTeachers() {
            const query = (document.getElementById('teacher-search').value || '').trim().toLowerCase();
            const tbody = document.getElementById('teachers-tbody');

            const filtered = DATA.teachers.filter(t => {
                return !query || t.name.toLowerCase().includes(query) || String(t.job_id).toLowerCase().includes(query);
            });

            tbody.innerHTML = filtered.map((t, i) => {
                const assignStr = (t.assignments || []).map(a => `\${a.subject_name} (\${a.grade_ar}-\${a.section_ar})`).join(' • ') || 'غير محدد';
                return `
                    <tr>
                        <td>\${i + 1}</td>
                        <td><strong>\${t.name}</strong></td>
                        <td><span class="badge badge-warning">\${t.role}</span></td>
                        <td><code>\${t.job_id}</code></td>
                        <td>\${t.phone}</td>
                        <td>\${assignStr}</td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="6" style="text-align:center; padding: 20px;">لا توجد نتائج مطابقة</td></tr>';
        }

        function renderClasses() {
            const tbody = document.getElementById('classes-tbody');
            tbody.innerHTML = DATA.classes.map((c, i) => {
                const count = DATA.students.filter(s => String(s.class_id) === String(c.id)).length;
                return `
                    <tr>
                        <td>\${i + 1}</td>
                        <td><strong>\${c.grade_ar}</strong></td>
                        <td>شعبة (\${c.section_ar})</td>
                        <td><span class="badge badge-primary">\${count} طالب</span></td>
                    </tr>
                `;
            }).join('');
        }

        function renderGrades() {
            const query = (document.getElementById('grade-student-search').value || '').trim().toLowerCase();
            const classId = document.getElementById('grade-class-filter').value;
            const term = document.getElementById('grade-term-filter').value;
            const tbody = document.getElementById('grades-tbody');

            const studentMap = {};
            DATA.students.forEach(s => { studentMap[s.id] = s; });
            const subjectMap = {};
            DATA.subjects.forEach(sb => { subjectMap[sb.id] = sb.name_ar; });

            const filtered = DATA.grades.filter(g => {
                if (term && String(g.term) !== String(term)) return false;
                const student = studentMap[g.student_id];
                if (!student) return false;
                if (classId !== 'all' && String(student.class_id) !== String(classId)) return false;
                if (query && !student.name_ar.toLowerCase().includes(query)) return false;
                return true;
            }).slice(0, 500); // Limit rendered items for maximum DOM performance

            tbody.innerHTML = filtered.map((g, i) => {
                const st = studentMap[g.student_id];
                const subj = subjectMap[g.subject_id] || 'مادة';
                return `
                    <tr>
                        <td>\${i + 1}</td>
                        <td><strong>\${st.name_ar}</strong></td>
                        <td>\${st.class_name}</td>
                        <td><span class="badge badge-primary">\${subj}</span></td>
                        <td>\${g.month === 1 ? g.month_total : '-'}</td>
                        <td>\${g.month === 2 ? g.month_total : '-'}</td>
                        <td>\${g.month === 3 ? g.month_total : '-'}</td>
                        <td><strong>\${g.coursework || '-'}</strong></td>
                        <td><strong style="color:var(--primary);">\${g.final_exam || '-'}</strong></td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="9" style="text-align:center; padding: 20px;">لا توجد درجات مسجلة للمحدد</td></tr>';
        }

        function renderFinance() {
            const query = (document.getElementById('finance-search').value || '').trim().toLowerCase();
            const tbody = document.getElementById('finance-tbody');

            const filtered = DATA.students.filter(st => {
                return !query || st.name_ar.toLowerCase().includes(query) || st.student_code.toLowerCase().includes(query);
            });

            tbody.innerHTML = filtered.map((st, i) => {
                const isPaid = st.remaining_fee <= 0;
                return `
                    <tr>
                        <td>\${i + 1}</td>
                        <td><code>\${st.student_code}</code></td>
                        <td><strong>\${st.name_ar}</strong></td>
                        <td>\${st.class_name}</td>
                        <td>\${st.tuition_fee.toLocaleString()} ريال</td>
                        <td style="color:var(--success); font-weight:700;">\${st.paid_fee.toLocaleString()} ريال</td>
                        <td style="color:var(--danger); font-weight:700;">\${st.remaining_fee.toLocaleString()} ريال</td>
                        <td><span class="badge \${isPaid ? 'badge-success' : 'badge-warning'}">\${isPaid ? 'خالص' : 'متبقي'}</span></td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="8" style="text-align:center; padding: 20px;">لا توجد نتائج مطابقة</td></tr>';
        }

        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
HTML;
    }

    /**
     * Build an academic year package (.zip) or single HTML archive file.
     */
    public function exportArchive(string $academicYear = '2026-2027م', bool $asZip = true): array
    {
        $yearData = $this->gatherYearData($academicYear);
        $htmlContent = $this->generateHtmlViewer($yearData);

        $safeYear = preg_replace('/[^\w\-]/u', '_', $academicYear);
        $timestamp = Carbon::now()->format('Y-m-d_H-i');
        $backupName = config('backup.backup.name', 'anwar-alola');
        $destinationDir = storage_path("app/private/{$backupName}");
        File::ensureDirectoryExists($destinationDir);

        if (! $asZip) {
            $htmlFileName = "ارشيف_العام_الدراسي_{$safeYear}_{$timestamp}.html";
            $htmlFilePath = "{$destinationDir}/{$htmlFileName}";
            File::put($htmlFilePath, $htmlContent);

            return [
                'file_name' => $htmlFileName,
                'full_path' => $htmlFilePath,
                'mime' => 'text/html; charset=UTF-8',
                'size' => filesize($htmlFilePath),
            ];
        }

        // Create complete ZIP package (HTML viewer + JSON data + SQL dump if available)
        $zipFileName = "ارشيف_العام_الدراسي_{$safeYear}_{$timestamp}.zip";
        $zipFilePath = "{$destinationDir}/{$zipFileName}";

        $zip = new ZipArchive();
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            // 1. Add interactive offline viewer HTML
            $zip->addFromString("فتح_الارشيف_بدون_انترنت.html", $htmlContent);

            // 2. Add raw JSON database
            $zip->addFromString("بيانات_العام_الدراسي.json", json_encode($yearData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // 3. Add instructions Readme
            $readme = "رياض ومدارس أنوار العلى الدولية النموذجية\n"
                    . "الأرشيف الإداري والأكاديمي الشامل للعام الدراسي: {$academicYear}\n"
                    . "تاريخ التصدير: " . Carbon::now()->format('Y-m-d H:i') . "\n\n"
                    . "طريقة الاستخدام:\n"
                    . "1. افتح ملف (فتح_الارشيف_بدون_انترنت.html) بالنقر المزدوج في أي متصفح (Chrome, Edge, Safari, Firefox).\n"
                    . "2. يعمل الأرشيف بشكل كامل وتفاعلي بدون إنترنت نهائياً.\n"
                    . "3. يمكنك البحث وطباعة الكشوفات مباشرة.\n";
            $zip->addFromString("تعليمات_الاستخدام.txt", $readme);

            // 4. Try to append latest DB SQL dump if available in backups folder
            $latestZip = collect(File::files($destinationDir))
                ->filter(fn($f) => str_ends_with($f->getFilename(), '.zip') && $f->getFilename() !== $zipFileName)
                ->sortByDesc(fn($f) => $f->getMTime())
                ->first();

            if ($latestZip) {
                $subZip = new ZipArchive();
                if ($subZip->open($latestZip->getRealPath()) === true) {
                    for ($i = 0; $i < $subZip->numFiles; $i++) {
                        $stat = $subZip->statIndex($i);
                        if (str_ends_with($stat['name'], '.sql')) {
                            $sqlStream = $subZip->getFromIndex($i);
                            if ($sqlStream) {
                                $zip->addFromString("نسخة_قاعدة_البيانات_الخام.sql", $sqlStream);
                            }
                            break;
                        }
                    }
                    $subZip->close();
                }
            }

            $zip->close();
        }

        return [
            'file_name' => $zipFileName,
            'full_path' => $zipFilePath,
            'mime' => 'application/zip',
            'size' => filesize($zipFilePath),
        ];
    }
}
