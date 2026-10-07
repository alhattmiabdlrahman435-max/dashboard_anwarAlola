<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with complete, realistic school data.
     */
    public function run(): void
    {
        // Disable foreign keys check
        if (config('database.default') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }
        
        // Truncate tables
        DB::table('users')->truncate();
        DB::table('classes')->truncate();
        DB::table('supervisor_classes')->truncate();
        DB::table('subjects')->truncate();
        DB::table('students')->truncate();
        DB::table('teacher_subjects')->truncate();
        DB::table('schedules')->truncate();
        DB::table('attendance')->truncate();
        DB::table('absence_requests')->truncate();
        DB::table('exam_schedules')->truncate();
        DB::table('exam_subjects')->truncate();
        DB::table('grades')->truncate();
        DB::table('assignments')->truncate();
        DB::table('assignment_submissions')->truncate();
        DB::table('payments')->truncate();
        DB::table('notifications')->truncate();
        DB::table('reports')->truncate();
        
        if (config('database.default') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        // ==========================================
        // 1. Administrative Users
        // ==========================================
        $adminId = DB::table('users')->insertGetId([
            'name' => 'admin',
            'username' => 'admin',
            'national_id' => '1000000001',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'name_ar' => 'مدير المدارس',
            'name_en' => 'Schools Director',
            'phone' => '500000001',
            'photo_url' => 'أ ع',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $supervisorId = DB::table('users')->insertGetId([
            'name' => 'supervisor',
            'username' => 'supervisor',
            'national_id' => '1000000002',
            'password' => Hash::make('super123'),
            'role' => 'supervisor',
            'name_ar' => 'وكيل المدرسة',
            'name_en' => 'Vice Principal',
            'phone' => '500000002',
            'photo_url' => 'و ك',
            'is_active' => true,
            'permissions' => json_encode(['full_access' => true]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $prepSupervisorId = DB::table('users')->insertGetId([
            'name' => 'prep_supervisor',
            'username' => '1000000101',
            'national_id' => '1000000101',
            'job_id' => '1000000101',
            'password' => Hash::make('500000101'),
            'role' => 'preparation_supervisor',
            'name_ar' => 'أ. منى الحربي',
            'name_en' => 'Ms. Mona Al-Harbi',
            'phone' => '500000101',
            'photo_url' => '👩‍🏫',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Teachers (Users)
        $teachersData = [
            ['username' => '1011111111', 'nationalId' => '1011111111', 'name' => 'الأستاذ فهد الهذلول', 'nameEn' => 'Mr. Fahad Al-Hathloul', 'phone' => '501111111', 'specialty' => 'الرياضيات'],
            ['username' => '1022222222', 'nationalId' => '1022222222', 'name' => 'الأستاذ سليمان الحربي', 'nameEn' => 'Mr. Sulaiman Al-Harbi', 'phone' => '502222222', 'specialty' => 'العلوم'],
            ['username' => '1033333333', 'nationalId' => '1033333333', 'name' => 'الأستاذ خالد الدوسري', 'nameEn' => 'Mr. Khalid Al-Dawsari', 'phone' => '503333333', 'specialty' => 'لغتي'],
            ['username' => '1044444444', 'nationalId' => '1044444444', 'name' => 'الأستاذ أحمد الشريف', 'nameEn' => 'Mr. Ahmed Al-Sharif', 'phone' => '504444444', 'specialty' => 'اللغة الإنجليزية'],
            ['username' => '1055555555', 'nationalId' => '1055555555', 'name' => 'الأستاذ عبدالرحمن الغامدي', 'nameEn' => 'Mr. Abdulrahman Al-Ghamdi', 'phone' => '505555555', 'specialty' => 'القرآن الكريم'],
            ['username' => '1066666666', 'nationalId' => '1066666666', 'name' => 'الأستاذ عمر بن عبدالعزيز', 'nameEn' => 'Mr. Omar Bin Abdulaziz', 'phone' => '506666666', 'specialty' => 'التربية الإسلامية'],
            ['username' => '1077777777', 'nationalId' => '1077777777', 'name' => 'الأستاذ ياسين المنصوري', 'nameEn' => 'Mr. Yassin Al-Mansouri', 'phone' => '507777777', 'specialty' => 'الدراسات الاجتماعية'],
            ['username' => '1088888888', 'nationalId' => '1088888888', 'name' => 'الأستاذ طارق الشمري', 'nameEn' => 'Mr. Tariq Al-Shammari', 'phone' => '508888888', 'specialty' => 'الحاسب الآلي'],
            ['username' => '1099999999', 'nationalId' => '1099999999', 'name' => 'الأستاذ ماجد المهيدب', 'nameEn' => 'Mr. Majid Al-Muhaidib', 'phone' => '509999999', 'specialty' => 'الفيزياء'],
            ['username' => '1010101010', 'nationalId' => '1010101010', 'name' => 'الأستاذ سلطان الراجحي', 'nameEn' => 'Mr. Sultan Al-Rajhi', 'phone' => '501010101', 'specialty' => 'الكيمياء'],
            ['username' => '1012121212', 'nationalId' => '1012121212', 'name' => 'الأستاذ بدر العتيبي', 'nameEn' => 'Mr. Bader Al-Otaibi', 'phone' => '501212121', 'specialty' => 'الأحياء'],
            ['username' => '1013131313', 'nationalId' => '1013131313', 'name' => 'الأستاذ زياد القحطاني', 'nameEn' => 'Mr. Ziyad Al-Qahtani', 'phone' => '501313131', 'specialty' => 'التربية البدنية'],
            ['username' => '1014141414', 'nationalId' => '1014141414', 'name' => 'الأستاذ حسام الشهري', 'nameEn' => 'Mr. Hossam Al-Shehri', 'phone' => '501414141', 'specialty' => 'التربية الفنية'],
        ];

        $teacherUserIds = [];
        $teacherBySpecialty = [];
        foreach ($teachersData as $tData) {
            $tUserId = DB::table('users')->insertGetId([
                'name' => $tData['username'],
                'username' => $tData['username'],
                'national_id' => $tData['nationalId'],
                'job_id' => $tData['username'],
                'password' => Hash::make($tData['phone']),
                'role' => 'teacher',
                'name_ar' => $tData['name'],
                'name_en' => $tData['nameEn'],
                'phone' => $tData['phone'],
                'photo_url' => '👨‍🏫',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $teacherUserIds[$tData['username']] = $tUserId;
            $teacherBySpecialty[$tData['specialty']] = $tUserId;
        }

        // ==========================================
        // 2. Subjects Catalog (Full Official Curriculum)
        // ==========================================
        $subjectsData = [
            ['name_ar' => 'القرآن الكريم', 'name_en' => 'Holy Quran'],
            ['name_ar' => 'التربية الإسلامية', 'name_en' => 'Islamic Studies'],
            ['name_ar' => 'لغتي', 'name_en' => 'Arabic Language'],
            ['name_ar' => 'اللغة الإنجليزية', 'name_en' => 'English Language'],
            ['name_ar' => 'الرياضيات', 'name_en' => 'Mathematics'],
            ['name_ar' => 'العلوم', 'name_en' => 'General Science'],
            ['name_ar' => 'الدراسات الاجتماعية', 'name_en' => 'Social Studies'],
            ['name_ar' => 'الحاسب الآلي', 'name_en' => 'Computer Science'],
            ['name_ar' => 'التربية الفنية', 'name_en' => 'Art Education'],
            ['name_ar' => 'التربية البدنية', 'name_en' => 'Physical Education'],
            ['name_ar' => 'الفيزياء', 'name_en' => 'Physics'],
            ['name_ar' => 'الكيمياء', 'name_en' => 'Chemistry'],
            ['name_ar' => 'الأحياء', 'name_en' => 'Biology'],
        ];

        $subjectIds = [];
        foreach ($subjectsData as $sData) {
            $sId = DB::table('subjects')->insertGetId(array_merge($sData, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
            $subjectIds[$sData['name_ar']] = $sId;
        }

        // ==========================================
        // 3. Classes and Sections
        // ==========================================
        $classesDefinitions = [
            ['grade_ar' => 'تمهيدي', 'grade_en' => 'KG', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'تمهيدي', 'grade_en' => 'KG', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الأول', 'grade_en' => 'Grade 1', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الأول', 'grade_en' => 'Grade 1', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الأول', 'grade_en' => 'Grade 1', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الثاني', 'grade_en' => 'Grade 2', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثاني', 'grade_en' => 'Grade 2', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثاني', 'grade_en' => 'Grade 2', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الثالث', 'grade_en' => 'Grade 3', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثالث', 'grade_en' => 'Grade 3', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الرابع', 'grade_en' => 'Grade 4', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الرابع', 'grade_en' => 'Grade 4', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الخامس', 'grade_en' => 'Grade 5', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الخامس', 'grade_en' => 'Grade 5', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف السادس', 'grade_en' => 'Grade 6', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف السادس', 'grade_en' => 'Grade 6', 'section_ar' => 'ب', 'section_en' => 'B'],
            // Middle School
            ['grade_ar' => 'الصف الأول المتوسط', 'grade_en' => 'Grade 7', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الأول المتوسط', 'grade_en' => 'Grade 7', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الأول المتوسط', 'grade_en' => 'Grade 7', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الثاني المتوسط', 'grade_en' => 'Grade 8', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثاني المتوسط', 'grade_en' => 'Grade 8', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثاني المتوسط', 'grade_en' => 'Grade 8', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الثالث المتوسط', 'grade_en' => 'Grade 9', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثالث المتوسط', 'grade_en' => 'Grade 9', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثالث المتوسط', 'grade_en' => 'Grade 9', 'section_ar' => 'ج', 'section_en' => 'C'],
            // Secondary School
            ['grade_ar' => 'الصف الأول الثانوي', 'grade_en' => 'Grade 10', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الأول الثانوي', 'grade_en' => 'Grade 10', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الأول الثانوي', 'grade_en' => 'Grade 10', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الأول الثانوي', 'grade_en' => 'Grade 10', 'section_ar' => 'د', 'section_en' => 'D'],
            ['grade_ar' => 'الصف الثاني الثانوي', 'grade_en' => 'Grade 11', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثاني الثانوي', 'grade_en' => 'Grade 11', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثاني الثانوي', 'grade_en' => 'Grade 11', 'section_ar' => 'ج', 'section_en' => 'C'],
            ['grade_ar' => 'الصف الثالث الثانوي', 'grade_en' => 'Grade 12', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثالث الثانوي', 'grade_en' => 'Grade 12', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثالث الثانوي', 'grade_en' => 'Grade 12', 'section_ar' => 'ج', 'section_en' => 'C'],
        ];

        $classIds = [];
        foreach ($classesDefinitions as $cData) {
            $nameAr = $cData['grade_ar'] . ' - ' . $cData['section_ar'];
            $cId = DB::table('classes')->insertGetId(array_merge($cData, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
            $classIds[$nameAr] = $cId;
        }

        // Assign classes to preparation supervisor
        if (isset($classIds['الصف الأول - أ']) && isset($classIds['الصف الثاني - أ'])) {
            DB::table('supervisor_classes')->insert([
                ['supervisor_id' => $prepSupervisorId, 'class_id' => $classIds['الصف الأول - أ'], 'created_at' => now(), 'updated_at' => now()],
                ['supervisor_id' => $prepSupervisorId, 'class_id' => $classIds['الصف الثاني - أ'], 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // ==========================================
        // 4. Map Subjects to Classes & Teachers
        // ==========================================
        $elementarySubjects = ['القرآن الكريم', 'التربية الإسلامية', 'لغتي', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية', 'الدراسات الاجتماعية', 'التربية الفنية', 'التربية البدنية'];
        $middleSubjects = ['القرآن الكريم', 'التربية الإسلامية', 'لغتي', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية', 'الدراسات الاجتماعية', 'الحاسب الآلي', 'التربية البدنية'];
        $secondarySubjects = ['القرآن الكريم', 'التربية الإسلامية', 'لغتي', 'اللغة الإنجليزية', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'الحاسب الآلي', 'التربية البدنية'];

        foreach ($classIds as $className => $cId) {
            $isSecondary = str_contains($className, 'الثانوي');
            $isMiddle = str_contains($className, 'المتوسط');
            
            $assignedSubjects = $isSecondary ? $secondarySubjects : ($isMiddle ? $middleSubjects : $elementarySubjects);

            foreach ($assignedSubjects as $subName) {
                if (isset($subjectIds[$subName])) {
                    $sId = $subjectIds[$subName];
                    $tUserId = $teacherBySpecialty[$subName] ?? $teacherUserIds['1011111111'];

                    DB::table('teacher_subjects')->insert([
                        'teacher_id' => $tUserId,
                        'subject_id' => $sId,
                        'class_id' => $cId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ==========================================
        // 5. Parents (Users)
        // ==========================================
        $parentsData = [
            ['name' => 'محمد الرويلي', 'nameEn' => 'Mohammed Al-Ruwayli', 'phone' => '554129930', 'nationalId' => '1023948576'],
            ['name' => 'خالد العسيري', 'nameEn' => 'Khalid Al-Asiri', 'phone' => '542331908', 'nationalId' => '1098765432'],
            ['name' => 'فيصل الشمري', 'nameEn' => 'Faisal Al-Shammari', 'phone' => '508129322', 'nationalId' => '1055443322'],
            ['name' => 'عبدالله القحطاني', 'nameEn' => 'Abdullah Al-Qahtani', 'phone' => '569940212', 'nationalId' => '1077665544'],
            ['name' => 'عادل العتيبي', 'nameEn' => 'Adel Al-Otaibi', 'phone' => '531204481', 'nationalId' => '1011223344'],
            ['name' => 'عبدالله احمد الجرموزي', 'nameEn' => 'Abdullah Al-Jarmouzi', 'phone' => '555555555', 'nationalId' => '1010305738'],
            ['name' => 'سالم الشطي', 'nameEn' => 'Salem Al-Shatti', 'phone' => '555123456', 'nationalId' => '1020304050'],
            ['name' => 'طه شرقي', 'nameEn' => 'Taha Sharqi', 'phone' => '555234567', 'nationalId' => '1030405060'],
            ['name' => 'حميد بطاح', 'nameEn' => 'Hameed Battah', 'phone' => '555345678', 'nationalId' => '1040506070'],
            ['name' => 'يحيى السياني', 'nameEn' => 'Yahya Al-Sayani', 'phone' => '555456789', 'nationalId' => '1050607080'],
            ['name' => 'غانم العزعزي', 'nameEn' => 'Ghanem Al-Azaazi', 'phone' => '555567890', 'nationalId' => '1060708090'],
            ['name' => 'حسن الخولاني', 'nameEn' => 'Hassan Al-Khawlani', 'phone' => '555678901', 'nationalId' => '1070809010'],
        ];

        $parentUserIds = [];
        foreach ($parentsData as $pData) {
            $pUserId = DB::table('users')->insertGetId([
                'name' => $pData['nationalId'],
                'username' => $pData['nationalId'],
                'national_id' => $pData['nationalId'],
                'password' => Hash::make($pData['phone']),
                'role' => 'parent',
                'name_ar' => $pData['name'],
                'name_en' => $pData['nameEn'],
                'phone' => $pData['phone'],
                'photo_url' => '🧔',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $parentUserIds[$pData['nationalId']] = $pUserId;
        }

        // Default parent for fallback
        $defaultParentId = $parentUserIds['1023948576'];

        // ==========================================
        // 6. Students Data (All classes populated!)
        // ==========================================
        $studentsList = [];

        // Class 1: الصف الثاني الثانوي - أ (The 22 real students from the school's actual record)
        $sec2Students = [
            'عبدالله عبدالكريم احمد ناجي قاسم',
            'شادي اكرم محمود هادي هيج',
            'قحطان خالد قحطان سيف العكابي',
            'ايمن عصام علي جارالله سالم الشطي',
            'امير طه محمد شيبه كشوبع شرقي',
            'مهيب محمد حميد يحيى عبدالعزيز بطاح',
            'طه احمد يحيى احمد السياني',
            'رامي عارف محمد غانم صالح العزعزي',
            'علي عرفات محمد حسن الخولاني',
            'علي عماد علي صغير محمد زيلعي',
            'رائد عبدالرحمن احمد علي محمد الحطامي',
            'مؤيد محمد منصور قاسم احمد الريمي',
            'رئيسي عبدالرحمن درهم ثابت القدسي',
            'حذيفة مفيد سيف حمود فارع',
            'سعيد عاصم سعيد عبده صالح الاثوري',
            'اسيد مختار الصغير علي الشيباني',
            'محمد كامل علي احمد قاسم الاهدل',
            'محمد فؤاد عبدالله علي المقطري',
            'امجد عصام ياسين عثمان ثابت العواضي',
            'مجد فؤاد علي علوان غالب',
            'هلال ياسر هلال عبدالوهاب الاسودي',
            'عبدالرحمن بندر علي صغير حجر',
        ];

        $stdCodeBase = 20261300;
        foreach ($sec2Students as $idx => $sName) {
            $studentsList[] = [
                'id' => $stdCodeBase + $idx,
                'student_code' => (string)($stdCodeBase + $idx),
                'name_ar' => $sName,
                'name_en' => 'Student ' . ($idx + 1),
                'parent_id' => $defaultParentId,
                'class_name' => 'الصف الثاني الثانوي - أ',
                'qr_code' => (string)($stdCodeBase + $idx),
                'secret_code' => 'SEC-' . (700 + $idx),
                'photo_url' => '👨‍🎓',
            ];
        }

        // Class 2: الصف الأول - أ
        $grade1Students = [
            ['id' => 202631, 'name_ar' => 'ياسر بن محمد الرويلي', 'parent' => '1023948576'],
            ['id' => 202632, 'name_ar' => 'مازن بن فيصل الشمري', 'parent' => '1055443322'],
            ['id' => 202633, 'name_ar' => 'كنان عبدالرحيم يحيى الاهدل', 'parent' => '1023948576'],
            ['id' => 202634, 'name_ar' => 'منار اسامة علي العامري', 'parent' => '1023948576'],
            ['id' => 202635, 'name_ar' => 'كريمة جميل عبدالله سنان', 'parent' => '1023948576'],
            ['id' => 202636, 'name_ar' => 'رائف رمزي علي هيثم', 'parent' => '1023948576'],
            ['id' => 202637, 'name_ar' => 'الياس عبده صادق المران', 'parent' => '1023948576'],
            ['id' => 202638, 'name_ar' => 'جنات عبدالكريم احمد المصنعي', 'parent' => '1023948576'],
            ['id' => 202639, 'name_ar' => 'سامح اسامة فيصل العريقي', 'parent' => '1023948576'],
            ['id' => 202640, 'name_ar' => 'طلال عايش محمد يحيى', 'parent' => '1023948576'],
        ];
        foreach ($grade1Students as $st) {
            $studentsList[] = [
                'id' => $st['id'],
                'student_code' => (string)$st['id'],
                'name_ar' => $st['name_ar'],
                'name_en' => 'Student ' . $st['id'],
                'parent_id' => $parentUserIds[$st['parent']] ?? $defaultParentId,
                'class_name' => 'الصف الأول - أ',
                'qr_code' => (string)$st['id'],
                'secret_code' => 'SEC-' . substr($st['id'], -3),
                'photo_url' => '🧑‍🎓',
            ];
        }

        // Class 3: الصف الثاني المتوسط - أ
        $mid2Students = [
            'يزن عبده محمد عريم',
            'احمد عبدالكريم احمد الاغبري',
            'اواب محمد عبدالقادر حسان',
            'معين عبدالعزيز حنش راجح',
            'سليمان عبده محمد عريم',
            'زياد فيصل خالد الشمري',
            'طارق وليد ناصر القحطاني',
            'عمار ياسر سالم الرويلي',
            'بسام عادل فهد العتيبي',
            'هشام ابراهيم خليل القعاري',
        ];
        $midCodeBase = 20262200;
        foreach ($mid2Students as $idx => $sName) {
            $studentsList[] = [
                'id' => $midCodeBase + $idx,
                'student_code' => (string)($midCodeBase + $idx),
                'name_ar' => $sName,
                'name_en' => 'Middle Student ' . ($idx + 1),
                'parent_id' => $defaultParentId,
                'class_name' => 'الصف الثاني المتوسط - أ',
                'qr_code' => (string)($midCodeBase + $idx),
                'secret_code' => 'SEC-' . (400 + $idx),
                'photo_url' => '👦',
            ];
        }

        // Seed 4-6 students for EVERY remaining class so no class is empty
        $familyNames = ['الرويلي', 'العسيري', 'الشمري', 'القحطاني', 'العتيبي', 'الجرموزي', 'الحكيمي', 'الاهدل', 'العامري', 'سنان', 'القعاري', 'المران', 'المصنعي'];
        $firstNames = ['محمد', 'احمد', 'علي', 'عمر', 'خالد', 'عبدالله', 'سلطان', 'فيصل', 'يوسف', 'سعود', 'فهد', 'ريان'];

        $genericIdCounter = 20265000;
        foreach ($classIds as $className => $cId) {
            if (in_array($className, ['الصف الثاني الثانوي - أ', 'الصف الأول - أ', 'الصف الثاني المتوسط - أ'])) {
                continue; // already filled
            }
            for ($k = 0; $k < 5; $k++) {
                $genericIdCounter++;
                $fName = $firstNames[($genericIdCounter + $k) % count($firstNames)];
                $lName = $familyNames[($genericIdCounter + $k * 3) % count($familyNames)];
                $sFullName = $fName . ' بن ' . $firstNames[($k + 2) % count($firstNames)] . ' ' . $lName;

                $studentsList[] = [
                    'id' => $genericIdCounter,
                    'student_code' => (string)$genericIdCounter,
                    'name_ar' => $sFullName,
                    'name_en' => 'Student ' . $genericIdCounter,
                    'parent_id' => $defaultParentId,
                    'class_name' => $className,
                    'qr_code' => (string)$genericIdCounter,
                    'secret_code' => 'SEC-' . substr($genericIdCounter, -3),
                    'photo_url' => '👨‍🎓',
                ];
            }
        }

        // Insert Students
        foreach ($studentsList as $stData) {
            if (isset($classIds[$stData['class_name']])) {
                DB::table('students')->insert([
                    'id' => $stData['id'],
                    'student_code' => $stData['student_code'],
                    'name_ar' => $stData['name_ar'],
                    'name_en' => $stData['name_en'],
                    'parent_id' => $stData['parent_id'],
                    'class_id' => $classIds[$stData['class_name']],
                    'photo_url' => $stData['photo_url'],
                    'qr_code' => $stData['qr_code'],
                    'secret_code' => $stData['secret_code'],
                    'is_active' => true,
                    'enrollment_date' => now()->subYears(1)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ==========================================
        // 7. Weekly Schedules
        // ==========================================
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        $subjectIdValues = array_values($subjectIds);
        foreach ($classIds as $className => $cId) {
            // Get class subjects
            $cSubjects = DB::table('teacher_subjects')->where('class_id', $cId)->pluck('subject_id')->toArray();
            if (empty($cSubjects)) {
                $cSubjects = $subjectIdValues;
            }
            foreach ($days as $dayIndex => $day) {
                for ($period = 1; $period <= 6; $period++) {
                    $subId = $cSubjects[($period + $dayIndex) % count($cSubjects)];
                    DB::table('schedules')->insert([
                        'class_id' => $cId,
                        'subject_id' => $subId,
                        'day_of_week' => $day,
                        'period' => $period,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ==========================================
        // 8. Attendance (Past 5 school days)
        // ==========================================
        $allStudents = DB::table('students')->get();
        for ($i = 4; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            if ($date->isWeekend()) {
                continue;
            }
            $formattedDate = $date->toDateString();
            foreach ($allStudents as $student) {
                $status = ($student->id % 13 == 0) ? 'absent' : 'present';
                DB::table('attendance')->insert([
                    'student_id' => $student->id,
                    'record_date' => $formattedDate,
                    'status' => $status,
                    'note' => $status === 'absent' ? 'غائب بدون عذر' : 'حضور اعتيادي',
                    'arrival_time' => $status === 'present' ? '07:25:00' : null,
                    'created_by' => $supervisorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ==========================================
        // 9. Absence Requests
        // ==========================================
        DB::table('absence_requests')->insert([
            'student_id' => 202631,
            'parent_id' => $defaultParentId,
            'start_date' => Carbon::now()->subDays(2)->toDateString(),
            'end_date' => Carbon::now()->subDays(2)->toDateString(),
            'reason_ar' => 'وعكة صحية طارئة مرافقة لارتفاع بالحرارة.',
            'reason_en' => 'Emergency flu sickness.',
            'status' => 'approved',
            'admin_note_ar' => 'تم قبول العذر الطبي بعد تقديمه رسمياً.',
            'admin_note_en' => 'Approved medical report.',
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
            'created_at' => now()->subDays(3),
            'updated_at' => now(),
        ]);

        // ==========================================
        // 10. Exam Schedules & Exam Subjects
        // ==========================================
        $examDates = [
            'القرآن الكريم' => Carbon::now()->addDays(8)->toDateString(),
            'التربية الإسلامية' => Carbon::now()->addDays(9)->toDateString(),
            'لغتي' => Carbon::now()->addDays(10)->toDateString(),
            'اللغة الإنجليزية' => Carbon::now()->addDays(11)->toDateString(),
            'الرياضيات' => Carbon::now()->addDays(12)->toDateString(),
            'العلوم' => Carbon::now()->addDays(13)->toDateString(),
            'الفيزياء' => Carbon::now()->addDays(14)->toDateString(),
            'الكيمياء' => Carbon::now()->addDays(15)->toDateString(),
        ];

        foreach ($classIds as $className => $cId) {
            $examSchId = DB::table('exam_schedules')->insertGetId([
                'title' => 'جدول اختبارات نهاية الفصل الدراسي الأول',
                'class_id' => $cId,
                'term' => 1,
                'created_by' => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $classSubIds = DB::table('teacher_subjects')->where('class_id', $cId)->pluck('subject_id')->toArray();
            foreach ($examDates as $sName => $eDate) {
                if (isset($subjectIds[$sName]) && in_array($subjectIds[$sName], $classSubIds)) {
                    DB::table('exam_subjects')->insert([
                        'exam_schedule_id' => $examSchId,
                        'subject_id' => $subjectIds[$sName],
                        'exam_date' => $eDate,
                        'exam_time' => '08:30 AM',
                        'note' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ==========================================
        // 11. Grades: المحصلة الأولى، الثانية، الثالثة
        // ==========================================
        // Exact real scores for Class "الصف الثاني الثانوي - أ" for Month 1 (Arabic)
        $realScoresMonth1 = [
            0, 70, 80, 82, 83, 92, 94, 84, 95, 75, 94, 71, 85, 93, 70, 94, 78, 84, 84, 91, 93, 87
        ];

        foreach ($allStudents as $sIndex => $student) {
            // Find class subjects
            $classSubjects = DB::table('teacher_subjects')
                ->where('class_id', $student->class_id)
                ->pluck('subject_id')
                ->toArray();

            foreach ($classSubjects as $sId) {
                // Term 1: Month 1 (المحصلة الأولى), Month 2 (المحصلة الثانية), Month 3 (المحصلة الثالثة)
                for ($month = 1; $month <= 3; $month++) {
                    $hw = rand(12, 15);
                    $att = rand(13, 15);
                    $beh = rand(9, 10);
                    $oral = rand(8, 10);
                    $written = rand(40, 50);

                    // If student is in الصف الثاني الثانوي - أ and month = 1 and subject is لغتي
                    if ($student->class_id == ($classIds['الصف الثاني الثانوي - أ'] ?? 0) && $month == 1 && $sId == ($subjectIds['لغتي'] ?? 0)) {
                        $targetTotal = $realScoresMonth1[$sIndex % count($realScoresMonth1)];
                        if ($targetTotal == 0) {
                            $hw = 0; $att = 0; $beh = 0; $oral = 0; $written = 0;
                        } else {
                            $hw = 15;
                            $att = 15;
                            $beh = 10;
                            $oral = 10;
                            $written = max(0, $targetTotal - 50);
                        }
                    }

                    DB::table('grades')->insert([
                        'student_id' => $student->id,
                        'subject_id' => $sId,
                        'term' => 1,
                        'month' => $month,
                        'homework' => $hw,
                        'attendance' => $att,
                        'behavior' => $beh,
                        'oral' => $oral,
                        'written' => $written,
                        'final_exam' => null,
                        'is_control' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Final Exam record (month = 0)
                $finalScore = rand(22, 30);
                DB::table('grades')->insert([
                    'student_id' => $student->id,
                    'subject_id' => $sId,
                    'term' => 1,
                    'month' => 0,
                    'homework' => 0,
                    'attendance' => 0,
                    'behavior' => 0,
                    'oral' => 0,
                    'written' => 0,
                    'final_exam' => $finalScore,
                    'is_control' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ==========================================
        // 12. Assignments & Submissions
        // ==========================================
        $firstClassId = reset($classIds);
        $firstSubId = reset($subjectIds);
        $assignmentId = DB::table('assignments')->insertGetId([
            'title' => 'واجب تطبيقي لمادة الرياضيات',
            'content' => 'الرجاء حل الأسئلة المذكورة في الكتاب صفحة 24 وإرفاق الحل بصيغة PDF.',
            'class_id' => $firstClassId,
            'subject_id' => $firstSubId,
            'teacher_id' => $teacherUserIds['1011111111'],
            'date_created' => Carbon::now()->toDateString(),
            'due_date' => Carbon::now()->addDays(5)->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ==========================================
        // 13. Payments
        // ==========================================
        $sampleStudents = DB::table('students')->take(5)->pluck('id');
        foreach ($sampleStudents as $idx => $stId) {
            DB::table('payments')->insert([
                'student_id' => $stId,
                'amount' => 3000,
                'payment_date' => Carbon::now()->subMonths(1)->toDateString(),
                'reference_no' => 'PAY-2026' . $stId,
                'recorded_by' => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ==========================================
        // 14. Notifications & Reports
        // ==========================================
        DB::table('notifications')->insert([
            'title' => 'بدء التسجيل للعام الدراسي الجديد',
            'content' => 'تعلن إدارة مدارس أنوار العلا عن فتح باب التسجيل والقبول للعام الدراسي.',
            'type' => 'general',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
