<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable foreign keys check
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Truncate tables
        DB::table('users')->truncate();
        DB::table('classes')->truncate();
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
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Users
        $adminId = DB::table('users')->insertGetId([
            'name' => 'admin',
            'username' => 'admin',
            'national_id' => '1000000001',
            'password' => Hash::make('500000001'),
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
            'password' => Hash::make('500000002'),
            'role' => 'supervisor',
            'name_ar' => 'وكيل المدرسة',
            'name_en' => 'Vice Principal',
            'phone' => '500000002',
            'photo_url' => 'و ك',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $prepSupervisorId = DB::table('users')->insertGetId([
            'name' => 'prep_supervisor',
            'username' => 'prep_supervisor',
            'national_id' => '1000000101',
            'job_id' => 'P101',
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
            ['username' => 'T101', 'nationalId' => '1011111111', 'name' => 'الأستاذ فهد الهذلول', 'nameEn' => 'Mr. Fahad Al-Hathloul', 'phone' => '501111111'],
            ['username' => 'T102', 'nationalId' => '1022222222', 'name' => 'الأستاذ سليمان الحربي', 'nameEn' => 'Mr. Sulaiman Al-Harbi', 'phone' => '502222222'],
            ['username' => 'T103', 'nationalId' => '1033333333', 'name' => 'الأستاذ خالد الدوسري', 'nameEn' => 'Mr. Khalid Al-Dawsari', 'phone' => '503333333'],
            ['username' => 'T104', 'nationalId' => '1044444444', 'name' => 'الأستاذ أحمد الشريف', 'nameEn' => 'Mr. Ahmed Al-Sharif', 'phone' => '504444444'],
        ];

        $teacherUserIds = [];
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
        }

        // Parents (Users)
        $parentsData = [
            ['name' => 'محمد الرويلي', 'nameEn' => 'Mohammed Al-Ruwayli', 'phone' => '554129930', 'nationalId' => '1023948576'],
            ['name' => 'خالد العسيري', 'nameEn' => 'Khalid Al-Asiri', 'phone' => '542331908', 'nationalId' => '1098765432'],
            ['name' => 'فيصل الشمري', 'nameEn' => 'Faisal Al-Shammari', 'phone' => '508129322', 'nationalId' => '1055443322'],
            ['name' => 'عبدالله القحطاني', 'nameEn' => 'Abdullah Al-Qahtani', 'phone' => '569940212', 'nationalId' => '1077665544'],
            ['name' => 'عادل العتيبي', 'nameEn' => 'Adel Al-Otaibi', 'phone' => '531204481', 'nationalId' => '1011223344'],
        ];

        $parentUserIds = [];
        foreach ($parentsData as $pData) {
            $pUserId = DB::table('users')->insertGetId([
                'name' => $pData['nationalId'],
                'username' => $pData['nationalId'],
                'national_id' => $pData['nationalId'],
                'password' => Hash::make('parent_password123'),
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

        // 2. Classes
        $classesData = [
            ['grade_ar' => 'الصف الأول', 'grade_en' => 'Grade 1', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثاني', 'grade_en' => 'Grade 2', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثاني', 'grade_en' => 'Grade 2', 'section_ar' => 'ب', 'section_en' => 'B'],
            ['grade_ar' => 'الصف الثالث', 'grade_en' => 'Grade 3', 'section_ar' => 'أ', 'section_en' => 'A'],
            ['grade_ar' => 'الصف الثالث', 'grade_en' => 'Grade 3', 'section_ar' => 'ب', 'section_en' => 'B'],
        ];

        $classIds = [];
        foreach ($classesData as $cData) {
            $name_ar = $cData['grade_ar'] . ' - ' . $cData['section_ar'];
            $cId = DB::table('classes')->insertGetId(array_merge($cData, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
            $classIds[$name_ar] = $cId;
        }

        // 3. Subjects
        $subjectsData = [
            ['name_ar' => 'الرياضيات', 'name_en' => 'Mathematics'],
            ['name_ar' => 'العلوم', 'name_en' => 'Science'],
            ['name_ar' => 'لغتي', 'name_en' => 'Arabic'],
            ['name_ar' => 'اللغة الإنجليزية', 'name_en' => 'English'],
        ];

        $subjectIds = [];
        foreach ($subjectsData as $sData) {
            $sId = DB::table('subjects')->insertGetId(array_merge($sData, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
            $subjectIds[$sData['name_ar']] = $sId;
        }

        // 4. Students
        $studentsData = [
            [
                'id' => 202601, 'student_code' => 'ANWAR-202601', 'name_ar' => 'ياسر بن محمد الرويلي', 'name_en' => 'Yasser bin Mohammed Al-Ruwayli',
                'parent_national_id' => '1023948576', 'class_name' => 'الصف الأول - أ', 'qr_code' => 'ANWAR-202601', 'secret_code' => 'SEC-892', 'photo_url' => '👨‍🎓'
            ],
            [
                'id' => 202602, 'student_code' => 'ANWAR-202602', 'name_ar' => 'عبدالرحمن بن خالد العسيري', 'name_en' => 'Abdulrahman bin Khalid Al-Asiri',
                'parent_national_id' => '1098765432', 'class_name' => 'الصف الثاني - ب', 'qr_code' => 'ANWAR-202602', 'secret_code' => 'SEC-451', 'photo_url' => '👦'
            ],
            [
                'id' => 202603, 'student_code' => 'ANWAR-202603', 'name_ar' => 'مازن بن فيصل الشمري', 'name_en' => 'Mazen bin Faisal Al-Shammari',
                'parent_national_id' => '1055443322', 'class_name' => 'الصف الأول - أ', 'qr_code' => 'ANWAR-202603', 'secret_code' => 'SEC-234', 'photo_url' => '🧑‍🎓'
            ],
            [
                'id' => 202604, 'student_code' => 'ANWAR-202604', 'name_ar' => 'عبدالعزيز بن عبدالله القحطاني', 'name_en' => 'Abdulaziz bin Abdullah Al-Qahtani',
                'parent_national_id' => '1077665544', 'class_name' => 'الصف الثالث - أ', 'qr_code' => 'ANWAR-202604', 'secret_code' => 'SEC-112', 'photo_url' => '👨‍🎓'
            ],
            [
                'id' => 202605, 'student_code' => 'ANWAR-202605', 'name_ar' => 'سلطان بن عادل العتيبي', 'name_en' => 'Sultan bin Adel Al-Otaibi',
                'parent_national_id' => '1011223344', 'class_name' => 'الصف الثاني - أ', 'qr_code' => 'ANWAR-202605', 'secret_code' => 'SEC-701', 'photo_url' => '👦'
            ],
            [
                'id' => 202606, 'student_code' => 'ANWAR-202606', 'name_ar' => 'فهد بن محمد الرويلي', 'name_en' => 'Fahad bin Mohammed Al-Ruwayli',
                'parent_national_id' => '1023948576', 'class_name' => 'الصف الثالث - ب', 'qr_code' => 'ANWAR-202606', 'secret_code' => 'SEC-389', 'photo_url' => '👦'
            ],
        ];

        foreach ($studentsData as $stData) {
            DB::table('students')->insert([
                'id' => $stData['id'],
                'student_code' => $stData['student_code'],
                'name_ar' => $stData['name_ar'],
                'name_en' => $stData['name_en'],
                'parent_id' => $parentUserIds[$stData['parent_national_id']],
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

        // 5. Teacher Subjects Assignments
        // Map teachers to subjects
        $teacherAssignments = [
            'T101' => 'الرياضيات',
            'T102' => 'العلوم',
            'T103' => 'لغتي',
            'T104' => 'اللغة الإنجليزية',
        ];

        foreach ($teacherAssignments as $tCode => $sName) {
            $tUserId = $teacherUserIds[$tCode];
            $sId = $subjectIds[$sName];
            
            // Assign to all classes
            foreach ($classIds as $className => $cId) {
                DB::table('teacher_subjects')->insert([
                    'teacher_id' => $tUserId,
                    'subject_id' => $sId,
                    'class_id' => $cId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 6. Weekly Schedules
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        foreach ($classIds as $className => $cId) {
            foreach ($days as $day) {
                for ($period = 1; $period <= 6; $period++) {
                    // Rotate subjects for seeding
                    $subKeys = array_values($subjectIds);
                    $subId = $subKeys[($period + strlen($day)) % count($subKeys)];
                    
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

        // 7. Attendance (present / absent only)
        $students = DB::table('students')->get();
        for ($i = 4; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }
            
            $formattedDate = $date->toDateString();
            
            foreach ($students as $student) {
                // Default is present
                $status = 'present';
                $note = 'حضور اعتيادي';
                $arrivalTime = '07:' . rand(15, 45) . ':00';
                
                // Student 4 (Abdulaziz Al-Qahtani) absent for 3 days to trigger alerts
                if ($student->id == 202604 && in_array($i, [1, 2, 4])) {
                    $status = 'absent';
                    $note = 'غائب بدون عذر مسبق';
                    $arrivalTime = null;
                }

                DB::table('attendance')->insert([
                    'student_id' => $student->id,
                    'record_date' => $formattedDate,
                    'status' => $status,
                    'note' => $note,
                    'arrival_time' => $arrivalTime,
                    'created_by' => $supervisorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 8. Absence Requests
        DB::table('absence_requests')->insert([
            'student_id' => 202603,
            'parent_id' => $parentUserIds['1055443322'],
            'start_date' => Carbon::now()->addDays(1)->toDateString(),
            'end_date' => Carbon::now()->addDays(2)->toDateString(),
            'reason_ar' => 'زيارة طبيب الأسنان لوجود آلام شديدة.',
            'reason_en' => 'Dentist visit due to severe pain.',
            'status' => 'pending',
            'attachment_url' => 'medical_report_mazen.pdf',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('absence_requests')->insert([
            'student_id' => 202601,
            'parent_id' => $parentUserIds['1023948576'],
            'start_date' => Carbon::now()->subDays(3)->toDateString(),
            'end_date' => Carbon::now()->subDays(3)->toDateString(),
            'reason_ar' => 'وعكة صحية طارئة مرافقة لارتفاع بالحرارة.',
            'reason_en' => 'Emergency flu sickness.',
            'status' => 'approved',
            'admin_note_ar' => 'تم قبول العذر الطبي بعد تقديمه رسمياً.',
            'admin_note_en' => 'Approved medical report.',
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
            'created_at' => now()->subDays(4),
            'updated_at' => now(),
        ]);

        // 9. Exam Schedules
        foreach ($classIds as $className => $cId) {
            $examSchId = DB::table('exam_schedules')->insertGetId([
                'title' => 'جدول اختبارات نهاية الفصل الدراسي الأول',
                'class_id' => $cId,
                'term' => 1,
                'created_by' => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 10. Exam Subjects details
            $examDates = [
                'الرياضيات' => Carbon::now()->addDays(10)->toDateString(),
                'العلوم' => Carbon::now()->addDays(11)->toDateString(),
                'لغتي' => Carbon::now()->addDays(12)->toDateString(),
                'اللغة الإنجليزية' => Carbon::now()->addDays(13)->toDateString(),
            ];

            foreach ($examDates as $sName => $eDate) {
                DB::table('exam_subjects')->insert([
                    'exam_schedule_id' => $examSchId,
                    'subject_id' => $subjectIds[$sName],
                    'exam_date' => $eDate,
                    'exam_time' => '08:30 AM',
                    'note' => 'يشمل المنهج بالكامل، احضار الأدوات الهندسية.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 11. Grades Seeding
        // Term 1, Month 1, 2, 3 and Final (month = 0)
        // Term 2, Month 1, 2, 3
        foreach ($students as $student) {
            foreach ($subjectIds as $sName => $sId) {
                // Monthly grades
                for ($term = 1; $term <= 2; $term++) {
                    for ($month = 1; $month <= 3; $month++) {
                        // Generate realistic grade distribution
                        $hw = rand(12, 15);
                        $att = rand(13, 15);
                        $beh = rand(8, 10);
                        $oral = rand(8, 10);
                        $written = rand(40, 50);
                        
                        // Abdulaziz has slightly lower performance to trigger alerts
                        if ($student->id == 202604) {
                            $hw = rand(8, 11);
                            $att = rand(5, 10);
                            $beh = rand(6, 8);
                            $oral = rand(6, 8);
                            $written = rand(20, 35);
                        }

                        DB::table('grades')->insert([
                            'student_id' => $student->id,
                            'subject_id' => $sId,
                            'term' => $term,
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

                    // Final Exam (month = 0)
                    $finalScore = rand(22, 30);
                    if ($student->id == 202604) {
                        $finalScore = rand(12, 18);
                    }

                    DB::table('grades')->insert([
                        'student_id' => $student->id,
                        'subject_id' => $sId,
                        'term' => $term,
                        'month' => 0, // 0 indicates final exam record
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

                    // Control Grade (is_control = true) for digital control validation
                    DB::table('grades')->insert([
                        'student_id' => $student->id,
                        'subject_id' => $sId,
                        'term' => $term,
                        'month' => 0,
                        'homework' => 0,
                        'attendance' => 0,
                        'behavior' => 0,
                        'oral' => 0,
                        'written' => 0,
                        'final_exam' => $finalScore,
                        'is_control' => true, // Control record
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 12. Assignments & 13. Submissions
        foreach ($classIds as $className => $cId) {
            foreach ($subjectIds as $sName => $sId) {
                // Teacher assignment
                $tCode = array_search($sName, $teacherAssignments);
                $tUserId = $teacherUserIds[$tCode];

                $assignmentId = DB::table('assignments')->insertGetId([
                    'title' => 'واجب تطبيقي لمادة ' . $sName,
                    'content' => 'الرجاء حل الأسئلة المذكورة في الكتاب صفحة 24 وإرفاق الحل بصيغة PDF.',
                    'class_id' => $cId,
                    'subject_id' => $sId,
                    'teacher_id' => $tUserId,
                    'date_created' => Carbon::now()->toDateString(),
                    'due_date' => Carbon::now()->addDays(5)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Submissions
                $classStudents = DB::table('students')->where('class_id', $cId)->get();
                foreach ($classStudents as $st) {
                    $status = rand(0, 1) ? 'submitted' : 'pending';
                    $attachment = $status == 'submitted' ? 'homework_solution_' . $st->id . '.pdf' : null;

                    DB::table('assignment_submissions')->insert([
                        'assignment_id' => $assignmentId,
                        'student_id' => $st->id,
                        'status' => $status,
                        'attachment_url' => $attachment,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 14. Payments
        // Seed payments for students
        $paymentsMap = [
            202601 => [4000, 3000, 3000],
            202602 => [5000, 5000],
            202603 => [6000, 2000],
            202604 => [], // Paid nothing
            202605 => [4000, 4000],
            202606 => [3000, 2000, 2000],
        ];

        foreach ($paymentsMap as $stId => $payments) {
            foreach ($payments as $idx => $amount) {
                DB::table('payments')->insert([
                    'student_id' => $stId,
                    'amount' => $amount,
                    'payment_date' => Carbon::now()->subMonths($idx + 1)->toDateString(),
                    'reference_no' => 'PAY-20260' . $stId . 'R' . $idx,
                    'recorded_by' => $adminId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 15. Notifications
        // Broadcast notification to all
        DB::table('notifications')->insert([
            'title' => 'بدء التسجيل للعام الدراسي الجديد',
            'content' => 'تعلن إدارة مدارس أنوار العلا عن فتح باب التسجيل والقبول للعام الدراسي القادم.',
            'type' => 'general',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Private alert to student 4 (finance)
        DB::table('notifications')->insert([
            'title' => 'تنبيه سداد الرسوم الدراسية المتبقية',
            'content' => 'نرجو من ولي أمر الطالب مراجعة الشؤون المالية لتسوية الدفعات المتبقية.',
            'type' => 'finance',
            'is_read' => false,
            'student_id' => 202604,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 16. Behavioral/Academic Reports
        DB::table('reports')->insert([
            'student_id' => 202604,
            'teacher_id' => $teacherUserIds['T101'],
            'type' => 'academic',
            'description' => 'تراجع ملحوظ في مستوى أداء الواجبات الأسبوعية ومستوى الدرجات في مادة الرياضيات.',
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        DB::table('reports')->insert([
            'student_id' => 202604,
            'teacher_id' => $teacherUserIds['T103'],
            'type' => 'behavioral',
            'description' => 'الطالب كثير التشتت أثناء الحصة ولا يلتزم بتوجيهات المعلم، نأمل التوجيه والمتابعة المنزلية.',
            'status' => 'reviewed',
            'created_at' => now()->subDays(10),
            'updated_at' => now(),
        ]);
    }
}
