import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import sloganLogo from '../assets/slogan.jpeg';

const AppContext = createContext();

export const dictionary = {
  ar: {
    appName: "رياض و مدارس انوار العلى",
    appSubtitle: "الدولية النموذجية",
    dashboard: "الرئيسية",
    students: "الطلاب",
    prepSupervisors: "مشرفو التحضير",
    teachers: "المعلمون",
    classes: "الفصول الدراسية",
    subjects: "المواد الدراسية",
    schedule: "الجدول الدراسي",
    qrScanner: "سجل الحضور",
    control: "الكنترول الرقمي",
    reports: "التقارير الشاملة",
    settings: "الإعدادات",
    
    // Login Screen Keys
    loginTitle: "تسجيل الدخول للنظام",
    loginSubtitle: "لوحة التحكم والإدارة الرقمية لرياض ومدارس انوار العلى الدولية النموذجية",
    usernameOrId: "اسم المستخدم أو الرقم الوظيفي",
    passwordLabel: "كلمة المرور",
    loginBtn: "دخول آمن",
    roleAdmin: "مدير النظام",
    roleSupervisor: "وكيل المدرسة",
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى",
    quickFill: "بيانات الدخول السريع للمحاكاة",
    rememberMe: "تذكرني على هذا الجهاز",
    usernamePlaceholder: "أدخل اسم المستخدم أو المعرف...",
    passwordPlaceholder: "أدخل كلمة المرور الخاصة بك...",
    loginFooter: "جميع الحقوق محفوظة لرياض ومدارس انوار العلى الدولية النموذجية © 2026",
    
    // Overview Metrics
    metricStudents: "إجمالي الطلاب",
    metricTeachers: "أعضاء هيئة التدريس",
    metricAbsence: "حالات الغياب اليوم",
    metricHomework: "واجبات لم تُسلم",
    metricClasses: "الشُعب الدراسية",
    
    // Actions & Buttons
    requestCardBtn: "تسجيل طالب جديد",
    addTeacherBtn: "إضافة معلم",
    generateSecretCodes: "توليد الأرقام السرية وتشفير الأسماء",
    decryptNames: "فك التشفير وإظهار الأسماء",
    printSheet: "طباعة كشف الكنترول",
    scanCardSimulator: "محاكاة مسح بطاقة QR",
    saveSchedule: "حفظ الجدول الأسبوعي",
    cancel: "إلغاء",
    submit: "إرسال البيانات",
    viewCard: "عرض البطاقة الذكية",
    
    // Student Form
    addStudentTitle: "تسجيل طالب جديد في رياض ومدارس انوار العلى",
    formStudentName: "اسم الطالب رباعي",
    formGrade: "الصف الدراسي",
    formSection: "الشعبة (الفصل)",
    formParentNationalId: "الرقم الوطني لولي الأمر (10 أرقام)",
    formParentName: "اسم ولي الأمر",
    formParentPhone: "رقم هاتف ولي الأمر",
    emptyError: "الرجاء تعبئة جميع الحقول المطلوبة",
    phoneError: "الرجاء إدخال رقم جوال صحيح (9 أرقام يبدأ بـ 5)",
    nationalIdError: "الرجاء إدخال رقم وطني صحيح لولي الأمر (10 أرقام تبدأ بـ 1 أو 2)",
    siblings: "الأبناء المسجلون في المدرسة",
    formPhoto: "صورة شخصية",
    required: "إجباري",
    optional: "اختياري",
    uploadPhoto: "اختر صورة شخصية",
    photoErrorStudent: "الرجاء رفع صورة الطالب (إجباري)",
    photoErrorParent: "الرجاء رفع صورة ولي الأمر (إجباري)",
    addTeacherTitle: "إضافة معلم جديد لرياض ومدارس انوار العلى",
    formTeacherName: "اسم المعلم ثنائي أو ثلاثي",
    formTeacherSubject: "المادة الدراسية الأساسية",
    formTeacherClasses: "الفصول والصفوف (مفصولة بفاصلة)",
    successToast: "تم تسجيل الطالب وتوليد كارت QR بنجاح!",
    
    // Student Table headers
    studentId: "رقم الطالب",
    studentName: "اسم الطالب",
    grade: "الصف",
    section: "الشعبة",
    status: "حالة الحضور اليوم",
    arrivalTime: "وقت الحضور",
    parentName: "ولي الأمر",
    parentPhone: "رقم التواصل",
    action: "الإجراءات",
    
    // Attendance Statuses
    present: "حاضر",
    late: "متأخر",
    absent: "غائب",
    filterAll: "الكل",
    
    // Weekly Schedule Tab
    scheduleTitle: "إدارة وتعديل الجداول الدراسية الأسبوعية",
    selectGrade: "اختر الصف الدراسي",
    day: "اليوم / الحصة",
    sunday: "الأحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    period: "الحصة",
    
    // Teachers & Classes Tab
    teachersTitle: "هيئة التدريس وتوزيع المواد الدراسية",
    teacherName: "اسم المعلم",
    subject: "المادة الدراسية",
    assignedClasses: "الفصول والأنصبة",
    gradesEntered: "الدرجات المدخلة",
    assignmentsPublished: "الواجبات المنشورة",
    
    // Gate Scanner Simulator
    smsLogTitle: "سجل الرسائل النصية القصيرة (SMS) المرسلة لأولياء الأمور",
    noSmsLogs: "لم يتم إرسال أي رسائل نصية اليوم بعد.",
    
    // Control Room Tab
    controlTitle: "الكنترول المدرسي الرقمي ورصد الدرجات",
    gradesSheetTitle: "كشف رصد درجات الفصل الدراسي النهائي",
    secretCode: "الرقم السري",
    math: "الرياضيات",
    science: "العلوم",
    arabic: "اللغة العربية",
    english: "اللغة الإنجليزية",
    total: "المجموع",
    encryptionStatus: "حالة التشفير",
    encrypted: "مشفر (سرية تامة)",
    normal: "عادي (معلن)",
    gradesAlertText: "يتم استخدام الأرقام السرية وتشفير كشوف الأسماء آلياً لضمان السرية التامة أثناء تصحيح ومراجعة كراسات الامتحانات.",
    
    // Reports Tab
    reportsTitle: "تقارير الأداء العام والغياب والواجبات",
    attendanceRate: "معدل الحضور العام بالمدرسة",
    homeworkCompletionRate: "معدل تسليم الواجبات المنزلية",
    homeworkCompleted: "تم التسليم",
    homeworkDelayed: "متأخر",
    homeworkUnsubmitted: "لم يسلم بعد",
    absenceAlertTitle: "تنبيهات الغياب المتكرر وسلوك الطلاب",
    highAbsenceDesc: "الطلاب الذين تجاوز غيابهم 3 أيام هذا الشهر (تنبيه تلقائي لأولياء الأمور):",
    lowPerformanceDesc: "الطلاب ذوو الأداء الأكاديمي الضعيف (أقل من 60% في درجات الكنترول):",
    absenceDaysCount: "غياب {count} أيام",
    performanceAverage: "المعدل الأكاديمي {average}%",
    teacherPerformanceTitle: "إحصائيات إدخال الدرجات والواجبات للمعلمين",
    
    // Settings Tab
    settingsTitle: "الإعدادات العامة لرياض ومدارس انوار العلى",
    schoolConfig: "بيانات المدرسة",
    schoolNameLabel: "اسم المدرسة الرسمي",
    schoolType: "نوع التعليم",
    generalConfig: "إعدادات النظام",
    gateTimeConfig: "وقت تسجيل التأخر التلقائي",
    autoSmsLabel: "إرسال رسائل SMS تلقائية لأولياء الأمور",
    saveSettings: "حفظ الإعدادات",
    
    // General Translations
    languageLabel: "اللغة / Language",
    themeLabel: "مظهر النظام",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    printBtn: "طباعة الكرت",
    closeBtn: "إغلاق",
    parents: "أولياء الأمور",
    parentsTitle: "سجل أولياء الأمور وبيانات الاتصال الأسرية",
    parentNationalIdShort: "الرقم الوطني لولي الأمر",
    parentSonsCount: "عدد الأبناء المسجلين",
    parentSonsList: "الأبناء في المدرسة",
    searchParentPlaceholder: "البحث باسم ولي الأمر أو الرقم الوطني...",
    assignmentsHub: "منصة الواجبات",
    absenceRequests: "طلبات الغياب",
    detailedGrades: "الرصد التفصيلي",
    examSchedulesBuilder: "جداول الاختبارات",
    finance: "المالية والرسوم",
    communications: "الإشعارات",
    
    // Absence Requests
    absenceRequestsTitle: "إدارة طلبات غياب الطلاب",
    requestedDate: "تاريخ الغياب المطلوب",
    reason: "السبب",
    adminNoteLabel: "ملاحظة الإدارة",
    approveBtn: "قبول الطلب",
    rejectBtn: "رفض الطلب",
    pendingStatus: "قيد الانتظار",
    approvedStatus: "مقبول",
    rejectedStatus: "مرفوض",
    noAbsenceRequests: "لا توجد طلبات غياب حالياً.",
    approvedNoteToast: "تم قبول طلب الغياب وتحديث سجل الحضور.",
    rejectedNoteToast: "تم رفض طلب الغياب وتدوين الملاحظة.",
    
    // Assignments
    assignmentsHubTitle: "إدارة الواجبات المنزلية والتسليمات",
    addAssignmentBtn: "إضافة واجب جديد",
    assignmentTitleLabel: "عنوان الواجب",
    assignmentContentLabel: "تفاصيل الواجب",
    dueDateLabel: "تاريخ التسليم",
    subjectLabel: "المادة",
    submissionsTitle: "تسليمات الطلاب للواجب",
    submittedStatus: "تم التسليم",
    notSubmittedStatus: "لم يتم التسليم",
    submittedLateStatus: "سلم متأخراً",
    teacherNoteLabel: "ملاحظة المعلم",
    saveSubmissionsBtn: "حفظ التغييرات في التسليمات",
    noAssignments: "لا يوجد واجبات منشورة حالياً لهذا الفصل.",
    assignmentSuccessToast: "تم نشر الواجب وإشعار أولياء الأمور بنجاح!",
    
    // Detailed Grades
    detailedGradesTitle: "نظام رصد الدرجات الأكاديمي التفصيلي",
    selectStudent: "اختر الطالب",
    selectTerm: "اختر الترم الدراسي",
    term1Label: "الترم الأول",
    term2Label: "الترم الثاني",
    m1Label: "الشهر الأول",
    m2Label: "الشهر الثاني",
    m3Label: "الشهر الثالث",
    hwLabel: "الواجبات (١٥)",
    attLabel: "المواظبة (١٥)",
    behLabel: "السلوك (١٠)",
    oralLabel: "الشفوي (١٠)",
    wrtLabel: "التحريري (٥٠)",
    monthTotalLabel: "مجموع الشهر",
    termAverageLabel: "المحصلة (٢٠)",
    finalExamLabel: "النهائي (٣٠)",
    termTotalLabel: "مجموع الترم (٥٠)",
    yearlyTotalLabel: "المجموع السنوي (١٠٠)",
    saveGradesBtn: "حفظ الدرجات المدخلة",
    gradesSaveSuccess: "تم حفظ الدرجات وتحديث كشوف الطالب بنجاح!",
    
    // Print Options Modal
    printOptionsTitle: "خيارات طباعة الدرجات",
    printModeLabel: "اختر طريقة الطباعة",
    printByMonth: "طباعة حسب الشهر",
    printByMonthDesc: "طباعة درجات شهر واحد محدد لجميع المواد",
    printBySubject: "طباعة حسب المادة",
    printBySubjectDesc: "طباعة جميع الأشهر لمادة دراسية محددة",
    printByTerm: "طباعة حسب الترم",
    printByTermDesc: "طباعة كشف شامل لجميع المواد في ترم كامل",
    selectMonthLabel: "اختر الشهر",
    confirmPrintBtn: "تأكيد الطباعة",
    printOptionsSubtitle: "حدد نطاق الطباعة للبيانات المطلوبة",
    
    // Exam Schedules
    examSchedulesTitle: "منشئ جداول الاختبارات الفصلية والشهرية",
    addExamScheduleBtn: "إنشاء جدول اختبار جديد",
    examDateLabel: "تاريخ الاختبار",
    examTimeLabel: "وقت الاختبار",
    examNoteLabel: "المقرر / الملاحظات",
    addExamSubjectBtn: "إضافة مادة للجدول",
    examSchedulesList: "الجداول المنشأة",
    noExamSchedules: "لا توجد جداول اختبارات منشأة حالياً.",
    
    // Finance
    financeTitle: "الإدارة المالية ورسوم الطلاب الدراسية",
    totalRequiredFees: "إجمالي الرسوم المستحقة",
    totalPaidFees: "إجمالي المبالغ المدفوعة",
    totalRemainingFees: "إجمالي المبالغ المتبقية",
    logPaymentBtn: "تسجيل سند قبض مالي",
    paymentAmountLabel: "قيمة الدفعة (بالريال)",
    paymentDateLabel: "تاريخ الدفع",
    referenceNoLabel: "رقم السند/المرجع",
    paymentsHistoryTitle: "سجل المدفوعات التاريخي للطالب",
    noPayments: "لا توجد أي دفعات مسجلة لهذا الطالب.",
    paymentSuccessToast: "تم تسجيل الدفعة المالية بنجاح وتحديث كشف حساب الطالب!",
    
    // Communications
    communicationsTitle: "لوحة تحكم إشعارات الإدارة",
    sendGeneralNotificationBtn: "إرسال إشعار عام للكل",
    sendPrivateNotificationBtn: "إرسال إشعار خاص لطالب محدد",
    notificationTitleLabel: "عنوان الإشعار",
    notificationContentLabel: "نص الرسالة / الإشعار",
    notificationsHistoryTitle: "سجل الإرسال التاريخي",
    noNotifications: "لم يتم إرسال أي إشعارات سابقة.",
    notificationSuccessToast: "تم إرسال الإشعار وتوجيهه فوراً إلى الجهة المستهدفة!",
    targetLabel: "الفئة المستهدفة",
    targetAllParents: "جميع أولياء الأمور",
    targetByClass: "حسب الصف الدراسي",
    targetByStudent: "حسب الطالب",
    targetAllTeachers: "جميع المعلمين",
    targetSpecificTeacher: "معلم محدد",
    selectClass: "اختر الصف الدراسي",
    selectTeacher: "اختر المعلم",
    formulaTitle: "إعدادات معادلة الكنترول الرقمي",
    formulaDesc: "توليد الأرقام السرية آلياً بعملية حسابية على رقم الطالب وفقاً للمعادلة المحددة.",
    formulaPrefix: "البادئة النصية (مثل SEC-)",
    formulaMultiplier: "المعامل (الضرب ×)",
    formulaOffset: "الإزاحة الحسابية (+)",
    formulaModulo: "المقسوم عليه (الموديلو %)",
    formulaPreviewLabel: "صيغة المعادلة الحالية:",
    formulaExampleLabel: "مثال حسابي لرقم الطالب (202601) ➔ ",
    generateFormulaBtn: "توليد وتطبيق الأرقام السرية",
  },
  en: {
    appName: "Riyadh & Anwar Al-Ola",
    appSubtitle: "Int. Model Schools",
    dashboard: "Home",
    students: "Students",
    prepSupervisors: "Prep Supervisors",
    teachers: "Teachers",
    classes: "Classes",
    subjects: "Subjects",
    schedule: "Timetable Schedule",
    qrScanner: "Attendance Log",
    control: "Digital Control",
    reports: "Comprehensive Reports",
    settings: "Settings",
    
    // Login Screen Keys
    loginTitle: "System Sign In",
    loginSubtitle: "Riyadh & Anwar Al-Ola International Model Schools Dashboard & Portal",
    usernameOrId: "Username or ID",
    passwordLabel: "Password",
    loginBtn: "Secure Sign In",
    roleAdmin: "System Administrator",
    roleSupervisor: "Vice Principal",
    invalidCredentials: "Invalid username or password, please try again",
    quickFill: "Quick Login Credentials for Demo",
    rememberMe: "Remember me on this device",
    usernamePlaceholder: "Enter your username or ID...",
    passwordPlaceholder: "Enter your password...",
    loginFooter: "All rights reserved to Riyadh & Anwar Al-Ola International Model Schools © 2026",
    
    // Overview Metrics
    metricStudents: "Total Students",
    metricTeachers: "Teaching Faculty",
    metricAbsence: "Absences Today",
    metricHomework: "Unsubmitted Homeworks",
    metricClasses: "Class Sections",
    
    // Actions & Buttons
    requestCardBtn: "Register New Student",
    addTeacherBtn: "Add Teacher",
    generateSecretCodes: "Generate Secret Codes & Mask Names",
    decryptNames: "Reveal Names & Decrypt",
    printSheet: "Print Control Sheet",
    scanCardSimulator: "Simulate QR Scan",
    saveSchedule: "Save Timetable",
    cancel: "Cancel",
    submit: "Submit Details",
    viewCard: "View Smart Card",
    
    // Student Form
    addStudentTitle: "Register New Student at Riyadh & Anwar Al-Ola",
    formStudentName: "Student Full Name",
    formGrade: "Academic Grade",
    formSection: "Section / Class",
    formParentNationalId: "Parent National ID (10 digits)",
    formParentName: "Parent Name",
    formParentPhone: "Parent Phone Number",
    emptyError: "Please fill all required fields",
    phoneError: "Please enter a valid phone number (9 digits starting with 5)",
    nationalIdError: "Please enter a valid Parent National ID (10 digits starting with 1 or 2)",
    siblings: "Registered Siblings at School",
    formPhoto: "Profile Photo",
    required: "Required",
    optional: "Optional",
    uploadPhoto: "Choose Profile Photo",
    photoErrorStudent: "Student photo is required",
    photoErrorParent: "Parent photo is required",
    addTeacherTitle: "Add New Teacher to Riyadh & Anwar Al-Ola",
    formTeacherName: "Teacher Full Name",
    formTeacherSubject: "Primary Subject",
    formTeacherClasses: "Assigned Classes (comma separated)",
    successToast: "Student registered and QR Card generated successfully!",
    
    // Student Table headers
    studentId: "Student ID",
    studentName: "Student Name",
    grade: "Grade",
    section: "Section",
    status: "Attendance Today",
    arrivalTime: "Arrival Time",
    parentName: "Parent Name",
    parentPhone: "Contact Phone",
    action: "Actions",
    
    // Attendance Statuses
    present: "Present",
    late: "Late",
    absent: "Absent",
    filterAll: "All",
    
    // Weekly Schedule Tab
    scheduleTitle: "Manage & Edit Weekly Academic Timetable",
    selectGrade: "Select Grade Level",
    day: "Day / Period",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    period: "Period",
    
    // Teachers & Classes Tab
    teachersTitle: "Teaching Faculty & Subjects Distribution",
    teacherName: "Teacher Name",
    subject: "Subject",
    assignedClasses: "Assigned Classes",
    gradesEntered: "Grades Entered",
    assignmentsPublished: "Assignments Published",
    
    // Gate Scanner Simulator
    smsLogTitle: "Sent SMS Notifications Log (Simulated)",
    noSmsLogs: "No SMS alerts sent today yet.",
    
    // Control Room Tab
    controlTitle: "Digital School Control & Exam Grading Sheet",
    gradesSheetTitle: "Final Semester Student Grading Sheet",
    secretCode: "Secret Number",
    math: "Mathematics",
    science: "Science",
    arabic: "Arabic",
    english: "English",
    total: "Total Score",
    encryptionStatus: "Encryption Status",
    encrypted: "Encrypted (Secret)",
    normal: "Normal (Public)",
    gradesAlertText: "Student names are masked and replaced with unique secret numbers automatically to ensure grading confidentiality during exam corrections.",
    
    // Reports Tab
    reportsTitle: "General Performance, Absences & Assignments Reports",
    attendanceRate: "Overall Attendance Rate",
    homeworkCompletionRate: "Homework Completion Rate",
    homeworkCompleted: "Submitted",
    homeworkDelayed: "Delayed",
    homeworkUnsubmitted: "Not Submitted",
    absenceAlertTitle: "Repeated Absence & Academic Alerts",
    highAbsenceDesc: "Students who missed >= 3 days this month (Auto SMS warning sent to parents):",
    lowPerformanceDesc: "Students with low academic performance (Average grades below 60%):",
    absenceDaysCount: "{count} days absent",
    performanceAverage: "Academic GPA {average}%",
    teacherPerformanceTitle: "Teachers Grading & Publishing Activity",
    
    // Settings Tab
    settingsTitle: "Riyadh & Anwar Al-Ola School General Configuration",
    schoolConfig: "School Information",
    schoolNameLabel: "Official School Name",
    schoolType: "Education Type",
    generalConfig: "System Settings",
    gateTimeConfig: "Late Status Registration Time",
    autoSmsLabel: "Automatic SMS Notifications to Parents",
    saveSettings: "Save Configuration",
    
    // General Translations
    languageLabel: "Language",
    themeLabel: "Theme Mode",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    printBtn: "Print Card",
    closeBtn: "Close",
    parents: "Parents Directory",
    parentsTitle: "Parents Directory & Contact Details",
    parentNationalIdShort: "Parent National ID",
    parentSonsCount: "Children Count",
    parentSonsList: "Enrolled Children",
    searchParentPlaceholder: "Search by parent name or National ID...",
    assignmentsHub: "Assignments Hub",
    absenceRequests: "Absence Requests",
    detailedGrades: "Detailed Grading",
    examSchedulesBuilder: "Exam Schedules",
    finance: "Finance & Fees",
    communications: "Notifications",
    
    // Absence Requests
    absenceRequestsTitle: "Manage Student Absence Requests",
    requestedDate: "Requested Date",
    reason: "Reason",
    adminNoteLabel: "Admin Note",
    approveBtn: "Approve Request",
    rejectBtn: "Reject Request",
    pendingStatus: "Pending",
    approvedStatus: "Approved",
    rejectedStatus: "Rejected",
    noAbsenceRequests: "No absence requests at the moment.",
    approvedNoteToast: "Absence request approved and student attendance updated.",
    rejectedNoteToast: "Absence request rejected and note recorded.",
    
    // Assignments
    assignmentsHubTitle: "Homework & Submissions Hub",
    addAssignmentBtn: "Publish New Assignment",
    assignmentTitleLabel: "Assignment Title",
    assignmentContentLabel: "Content / Instructions",
    dueDateLabel: "Due Date",
    subjectLabel: "Subject",
    submissionsTitle: "Student Homework Submissions",
    submittedStatus: "Submitted",
    notSubmittedStatus: "Not Submitted",
    submittedLateStatus: "Submitted Late",
    teacherNoteLabel: "Teacher Note",
    saveSubmissionsBtn: "Save Submissions Changes",
    noAssignments: "No assignments published for this class yet.",
    assignmentSuccessToast: "Assignment published and parents notified successfully!",
    
    // Detailed Grades
    detailedGradesTitle: "Academic Detailed Grading System",
    selectStudent: "Select Student",
    selectTerm: "Select Term",
    term1Label: "First Term",
    term2Label: "Second Term",
    m1Label: "Month 1",
    m2Label: "Month 2",
    m3Label: "Month 3",
    hwLabel: "Homework (15)",
    attLabel: "Attendance (15)",
    behLabel: "Behavior (10)",
    oralLabel: "Oral (10)",
    wrtLabel: "Written (50)",
    monthTotalLabel: "Month Total",
    termAverageLabel: "Months Avg (20)",
    finalExamLabel: "Final Exam (30)",
    termTotalLabel: "Term Total (50)",
    yearlyTotalLabel: "Year Total (100)",
    saveGradesBtn: "Save Grades Sheet",
    gradesSaveSuccess: "Academic grades updated and saved successfully!",
    
    // Print Options Modal
    printOptionsTitle: "Print Grades Options",
    printModeLabel: "Select Print Mode",
    printByMonth: "Print by Month",
    printByMonthDesc: "Print grades for a specific month across all subjects",
    printBySubject: "Print by Subject",
    printBySubjectDesc: "Print all months for a selected subject",
    printByTerm: "Print by Term",
    printByTermDesc: "Print a full term report for all subjects",
    selectMonthLabel: "Select Month",
    confirmPrintBtn: "Confirm & Print",
    printOptionsSubtitle: "Choose the print scope for the required data",
    
    // Exam Schedules
    examSchedulesTitle: "Term & Monthly Exam Schedules Builder",
    addExamScheduleBtn: "Create Exam Timetable",
    examDateLabel: "Exam Date",
    examTimeLabel: "Exam Time",
    examNoteLabel: "Topics / Notes",
    addExamSubjectBtn: "Add Subject to Schedule",
    examSchedulesList: "Published Exam Schedules",
    noExamSchedules: "No exam schedules published yet.",
    
    // Finance
    financeTitle: "Tuition Fees & Financial Management",
    totalRequiredFees: "Total Fees Required",
    totalPaidFees: "Total Fees Paid",
    totalRemainingFees: "Remaining Balance",
    logPaymentBtn: "Log Payment Receipt",
    paymentAmountLabel: "Amount Paid (SAR)",
    paymentDateLabel: "Payment Date",
    referenceNoLabel: "Receipt / Reference No",
    paymentsHistoryTitle: "Student Payments History Logs",
    noPayments: "No payments recorded for this student yet.",
    paymentSuccessToast: "Payment recorded successfully and balance recalculated!",
    
    // Communications
    communicationsTitle: "Administration Notifications Dashboard",
    sendGeneralNotificationBtn: "Send Broadcast Notification",
    sendPrivateNotificationBtn: "Send Private Student Alert",
    notificationTitleLabel: "Notification Title",
    notificationContentLabel: "Notification Body",
    notificationsHistoryTitle: "Sent Notifications History",
    noNotifications: "No historical notifications sent.",
    notificationSuccessToast: "Notification broadcasted and pushed to targets successfully!",
    targetLabel: "Target Audience",
    targetAllParents: "All Parents / Guardians",
    targetByClass: "By Class / Grade",
    targetByStudent: "By Student",
    targetAllTeachers: "All Teachers",
    targetSpecificTeacher: "Specific Teacher",
    selectClass: "Select Class / Grade",
    selectTeacher: "Select Teacher",
    formulaTitle: "Digital Control Formula Settings",
    formulaDesc: "Generate secret codes automatically by applying an arithmetic operation on the Student ID (Reg No).",
    formulaPrefix: "Text Prefix (e.g. SEC-)",
    formulaMultiplier: "Multiplier Coefficient (×)",
    formulaOffset: "Additive Offset (+)",
    formulaModulo: "Modulo Divisor (%)",
    formulaPreviewLabel: "Active formula expression:",
    formulaExampleLabel: "Calculation example for ID (202601) ➔ ",
    generateFormulaBtn: "Calculate & Apply Secret Codes",
  }
};

const initialStudents = [
  { id: 202601, name: "ياسر بن محمد الرويلي", nameEn: "Yasser bin Mohammed Al-Ruwayli", grade: "الصف الأول", gradeEn: "Grade 1", section: "أ", sectionEn: "A", parentName: "محمد الرويلي", parentNameEn: "Mohammed Al-Ruwayli", parentNationalId: "1023948576", phone: "554129930", status: "present", time: "07:32", qrCode: "ANWAR-202601", photo: "👨‍🎓", parentPhoto: "🧔" },
  { id: 202602, name: "عبدالرحمن بن خالد العسيري", nameEn: "Abdulrahman bin Khalid Al-Asiri", grade: "الصف الثاني", gradeEn: "Grade 2", section: "ب", sectionEn: "B", parentName: "خالد العسيري", parentNameEn: "Khalid Al-Asiri", parentNationalId: "1098765432", phone: "542331908", status: "present", time: "07:42", qrCode: "ANWAR-202602", photo: "👦", parentPhoto: "🧔" },
  { id: 202603, name: "مازن بن فيصل الشمري", nameEn: "Mazen bin Faisal Al-Shammari", grade: "الصف الأول", gradeEn: "Grade 1", section: "أ", sectionEn: "A", parentName: "فيصل الشمري", parentNameEn: "Faisal Al-Shammari", parentNationalId: "1055443322", phone: "508129322", status: "present", time: "07:44", qrCode: "ANWAR-202603", photo: "🧑‍🎓", parentPhoto: "🧔" },
  { id: 202604, name: "عبدالعزيز بن عبدالله القحطاني", nameEn: "Abdulaziz bin Abdullah Al-Qahtani", grade: "الصف الثالث", gradeEn: "Grade 3", section: "أ", sectionEn: "A", parentName: "عبدالله القحطاني", parentNameEn: "Abdullah Al-Qahtani", parentNationalId: "1077665544", phone: "569940212", status: "absent", time: "--:--", qrCode: "ANWAR-202604", photo: "👨‍🎓", parentPhoto: "🧔" },
  { id: 202605, name: "سلطان بن عادل العتيبي", nameEn: "Sultan bin Adel Al-Otaibi", grade: "الصف الثاني", gradeEn: "Grade 2", section: "أ", sectionEn: "A", parentName: "عادل العتيبي", parentNameEn: "Adel Al-Otaibi", parentNationalId: "1011223344", phone: "531204481", status: "present", time: "07:28", qrCode: "ANWAR-202605", photo: "👦", parentPhoto: "🧔" },
  { id: 202606, name: "فهد بن محمد الرويلي", nameEn: "Fahad bin Mohammed Al-Ruwayli", grade: "الصف الثالث", gradeEn: "Grade 3", section: "ب", sectionEn: "B", parentName: "محمد الرويلي", parentNameEn: "Mohammed Al-Ruwayli", parentNationalId: "1023948576", phone: "554129930", status: "present", time: "07:40", qrCode: "ANWAR-202606", photo: "👦", parentPhoto: "🧔" }
];

const initialParentUsers = [
  { nationalId: "1023948576", name: "محمد الرويلي", nameEn: "Mohammed Al-Ruwayli", phone: "554129930", username: "1023948576", password: "parent_password123", photo: "🧔" },
  { nationalId: "1098765432", name: "خالد العسيري", nameEn: "Khalid Al-Asiri", phone: "542331908", username: "1098765432", password: "parent_password123", photo: "🧔" },
  { nationalId: "1055443322", name: "فيصل الشمري", nameEn: "Faisal Al-Shammari", phone: "508129322", username: "1055443322", password: "parent_password123", photo: "🧔" },
  { nationalId: "1077665544", name: "عبدالله القحطاني", nameEn: "Abdullah Al-Qahtani", phone: "569940212", username: "1077665544", password: "parent_password123", photo: "🧔" },
  { nationalId: "1011223344", name: "عادل العتيبي", nameEn: "Adel Al-Otaibi", phone: "531204481", username: "1011223344", password: "parent_password123", photo: "🧔" }
];

const initialSupervisors = [
  { 
    id: 301, 
    jobId: "P101", 
    password: "500000101", 
    name: "أ. منى الحربي", 
    nameEn: "Ms. Mona Al-Harbi", 
    classes: ["الصف الأول - أ", "الصف الثاني - أ"], 
    photo: "👩‍🏫",
    phone: "500000101"
  }
];

const initialTeachers = [
  { 
    id: 101, 
    jobId: "T101", 
    password: "teacher_password123", 
    name: "الأستاذ فهد الهذلول", 
    nameEn: "Mr. Fahad Al-Hathloul", 
    subject: "الرياضيات", 
    subjectEn: "Mathematics", 
    subjects: ["الرياضيات"], 
    classes: ["الصف الأول - أ", "الصف الثاني - أ"], 
    teachingAssignments: [
      { subject: "الرياضيات", class: "الصف الأول - أ" },
      { subject: "الرياضيات", class: "الصف الثاني - أ" }
    ],
    gradesEntered: 55, 
    assignments: 12, 
    photo: "👨‍🏫",
    phone: "501111111"
  },
  { 
    id: 102, 
    jobId: "T102", 
    password: "teacher_password123", 
    name: "الأستاذ سليمان الحربي", 
    nameEn: "Mr. Sulaiman Al-Harbi", 
    subject: "اللغة العربية", 
    subjectEn: "Arabic Language", 
    subjects: ["اللغة العربية"], 
    classes: ["الصف الأول - أ", "الصف الثالث - أ"], 
    teachingAssignments: [
      { subject: "اللغة العربية", class: "الصف الأول - أ" },
      { subject: "اللغة العربية", class: "الصف الثالث - أ" }
    ],
    gradesEntered: 62, 
    assignments: 18, 
    photo: "👨‍🏫",
    phone: "502222222"
  },
  { 
    id: 103, 
    jobId: "T103", 
    password: "teacher_password123", 
    name: "الأستاذ خالد الدوسري", 
    nameEn: "Mr. Khalid Al-Dawsari", 
    subject: "العلوم والفيزياء", 
    subjectEn: "Science & Physics", 
    subjects: ["العلوم والفيزياء"], 
    classes: ["الصف الثاني - أ", "الصف الثاني - ب"], 
    teachingAssignments: [
      { subject: "العلوم والفيزياء", class: "الصف الثاني - أ" },
      { subject: "العلوم والفيزياء", class: "الصف الثاني - ب" }
    ],
    gradesEntered: 48, 
    assignments: 10, 
    photo: "👨‍🏫",
    phone: "503333333"
  },
  { 
    id: 104, 
    jobId: "T104", 
    password: "teacher_password123", 
    name: "الأستاذ أحمد الشريف", 
    nameEn: "Mr. Ahmed Al-Sharif", 
    subject: "اللغة الإنجليزية", 
    subjectEn: "English Language", 
    subjects: ["اللغة الإنجليزية"], 
    classes: ["الصف الأول - أ", "الصف الثاني - ب", "الصف الثالث - أ"], 
    teachingAssignments: [
      { subject: "اللغة الإنجليزية", class: "الصف الأول - أ" },
      { subject: "اللغة الإنجليزية", class: "الصف الثاني - ب" },
      { subject: "اللغة الإنجليزية", class: "الصف الثالث - أ" }
    ],
    gradesEntered: 58, 
    assignments: 15, 
    photo: "👨‍🏫",
    phone: "504444444"
  }
];

const initialSubjects = [
  { id: 'sub-1', name: "الرياضيات", nameEn: "Mathematics" },
  { id: 'sub-2', name: "اللغة العربية", nameEn: "Arabic Language" },
  { id: 'sub-3', name: "العلوم والفيزياء", nameEn: "Science & Physics" },
  { id: 'sub-4', name: "اللغة الإنجليزية", nameEn: "English Language" },
  { id: 'sub-5', name: "التربية الإسلامية", nameEn: "Islamic Education" },
  { id: 'sub-6', name: "التربية البدنية", nameEn: "Physical Education" },
  { id: 'sub-7', name: "الرسم الفني", nameEn: "Art Education" }
];

const initialClasses = [
  { id: 'cls-1', name: "الصف الأول - أ", nameEn: "Grade 1 - A", grade: "الصف الأول", gradeEn: "Grade 1", section: "أ", sectionEn: "A", subjects: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "اللغة الإنجليزية", "التربية البدنية"] },
  { id: 'cls-2', name: "الصف الأول - ب", nameEn: "Grade 1 - B", grade: "الصف الأول", gradeEn: "Grade 1", section: "ب", sectionEn: "B", subjects: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "اللغة الإنجليزية"] },
  { id: 'cls-3', name: "الصف الثاني - أ", nameEn: "Grade 2 - A", grade: "الصف الثاني", gradeEn: "Grade 2", section: "أ", sectionEn: "A", subjects: ["الرياضيات", "اللغة العربية", "العلوم والفيزياء", "اللغة الإنجليزية", "التربية البدنية"] },
  { id: 'cls-4', name: "الصف الثاني - ب", nameEn: "Grade 2 - B", grade: "الصف الثاني", gradeEn: "Grade 2", section: "ب", sectionEn: "B", subjects: ["الرياضيات", "اللغة العربية", "العلوم والفيزياء", "اللغة الإنجليزية"] },
  { id: 'cls-5', name: "الصف الثالث - أ", nameEn: "Grade 3 - A", grade: "الصف الثالث", gradeEn: "Grade 3", section: "أ", sectionEn: "A", subjects: ["الرياضيات", "اللغة العربية", "العلوم والفيزياء", "التربية الإسلامية", "اللغة الإنجليزية"] }
];

const initialSchedule = {
  "الصف الأول - أ": {
    sunday: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    monday: ["اللغة العربية", "الرياضيات", "العلوم", "التربية الإسلامية", "اللغة الإنجليزية", "الرسم الفني"],
    tuesday: ["التربية الإسلامية", "اللغة العربية", "الرياضيات", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    wednesday: ["العلوم", "الرياضيات", "اللغة العربية", "التربية الإسلامية", "الرسم الفني", "اللغة الإنجليزية"],
    thursday: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "نشاط حر"]
  },
  "الصف الأول - ب": {
    sunday: ["اللغة العربية", "الرياضيات", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "الرسم الفني"],
    monday: ["الرياضيات", "اللغة العربية", "العلوم", "التربية الإسلامية", "اللغة الإنجليزية", "التربية البدنية"],
    tuesday: ["العلوم", "اللغة العربية", "الرياضيات", "التربية الإسلامية", "اللغة الإنجليزية", "الرسم الفني"],
    wednesday: ["التربية الإسلامية", "الرياضيات", "اللغة العربية", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    thursday: ["اللغة العربية", "الرياضيات", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "نشاط حر"]
  },
  "الصف الثاني - أ": {
    sunday: ["اللغة العربية", "الرياضيات", "العلوم", "التربية الإسلامية", "اللغة الإنجليزية", "الرسم الفني"],
    monday: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    tuesday: ["العلوم", "الرياضيات", "اللغة العربية", "التربية الإسلامية", "الرسم الفني", "اللغة الإنجليزية"],
    wednesday: ["التربية الإسلامية", "اللغة العربية", "الرياضيات", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    thursday: ["اللغة العربية", "الرياضيات", "العلوم", "التربية الإسلامية", "نشاط حر", "اللغة الإنجليزية"]
  },
  "الصف الثاني - ب": {
    sunday: ["الرياضيات", "اللغة العربية", "العلوم", "التربية الإسلامية", "اللغة الإنجليزية", "التربية البدنية"],
    monday: ["اللغة العربية", "الرياضيات", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "الرسم الفني"],
    tuesday: ["التربية الإسلامية", "الرياضيات", "اللغة العربية", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    wednesday: ["العلوم", "اللغة العربية", "الرياضيات", "التربية الإسلامية", "الرسم الفني", "اللغة الإنجليزية"],
    thursday: ["الرياضيات", "اللغة العربية", "العلوم", "التربية الإسلامية", "نشاط حر", "اللغة الإنجليزية"]
  },
  "الصف الثالث - أ": {
    sunday: ["العلوم", "اللغة العربية", "الرياضيات", "التربية الإسلامية", "اللغة الإنجليزية", "التربية البدنية"],
    monday: ["اللغة العربية", "العلوم", "الرياضيات", "التربية الإسلامية", "اللغة الإنجليزية", "الرسم الفني"],
    tuesday: ["الرياضيات", "اللغة العربية", "التربية الإسلامية", "العلوم", "اللغة الإنجليزية", "التربية البدنية"],
    wednesday: ["التربية الإسلامية", "اللغة العربية", "الرياضيات", "العلوم", "اللغة الإنجليزية", "الرسم الفني"],
    thursday: ["الرياضيات", "العلوم", "اللغة العربية", "التربية الإسلامية", "اللغة الإنجليزية", "نشاط حر"]
  }
};

const initialGrades = [
  { studentId: 202601, name: "ياسر بن محمد الرويلي", nameEn: "Yasser bin Mohammed Al-Ruwayli", secretCode: "SEC-9102", math: 92, science: 88, arabic: 95, english: 90 },
  { studentId: 202602, name: "عبدالرحمن بن خالد العسيري", nameEn: "Abdulrahman bin Khalid Al-Asiri", secretCode: "SEC-4412", math: 74, science: 80, arabic: 78, english: 82 },
  { studentId: 202603, name: "مازن بن فيصل الشمري", nameEn: "Mazen bin Faisal Al-Shammari", secretCode: "SEC-3081", math: 85, science: 90, arabic: 82, english: 88 },
  { studentId: 202604, name: "عبدالعزيز بن عبدالله القحطاني", nameEn: "Abdulaziz bin Abdullah Al-Qahtani", secretCode: "SEC-5991", math: 50, science: 55, arabic: 62, english: 48 },
  { studentId: 202605, name: "سلطان بن عادل العتيبي", nameEn: "Sultan bin Adel Al-Otaibi", secretCode: "SEC-2311", math: 98, science: 96, arabic: 94, english: 95 }
];

const initialAbsenceRequests = [
  {
    id: 1,
    studentId: 202604,
    studentName: "عبدالعزيز بن عبدالله القحطاني",
    requestedDate: "2026-06-16",
    reason: "زيارة مستشفى قوى الأمن لوجود حالة طارئة للفحص الطبي",
    reasonEn: "Appointment at Security Forces Hospital for an emergency check-up",
    status: "pending",
    attachment: "medical_report_yasser.pdf",
    createdAt: "2026-06-15T08:30:00Z"
  },
  {
    id: 2,
    studentId: 202602,
    studentName: "عبدالرحمن بن خالد العسيري",
    requestedDate: "2026-06-14",
    reason: "السفر مع الأسرة لظرف عائلي طارئ خارج المدينة",
    reasonEn: "Traveling with family due to an emergency family circumstance",
    status: "approved",
    attachment: "travel_permit_abdulrahman.png",
    adminNote: "تم قبول الإذن وتعديل سجل الحضور ليكون غياباً بعذر",
    adminNoteEn: "Request approved. Attendance updated to excused absence.",
    createdAt: "2026-06-13T10:15:00Z"
  },
  {
    id: 3,
    studentId: 202603,
    studentName: "مازن بن فيصل الشمري",
    requestedDate: "2026-06-10",
    reason: "وعكة صحية حادة (نزلة برد شديدة)",
    reasonEn: "Severe flu and cold",
    status: "rejected",
    attachment: null,
    adminNote: "الرجاء إرفاق تقرير طبي معتمد ليتم تحويل الغياب بعذر",
    adminNoteEn: "Please attach a certified medical report to excuse the absence.",
    createdAt: "2026-06-09T07:45:00Z"
  }
];

const initialAssignments = [
  {
    id: 501,
    grade: "الصف الأول",
    section: "أ",
    subjectName: "اللغة العربية",
    subjectNameEn: "Arabic Language",
    title: "حل واجب درس (حرف السين)",
    content: "كتابة حرف السين بالحركات الثلاث (سَ، سُ، سِ) في دفتر الواجب وحل صفحة ٣٢ في كتاب الطالب.",
    dateCreated: "2026-06-14",
    dueDate: "2026-06-17",
    attachments: ["arabic_letters_exercise.pdf"],
    submissions: [
      { studentId: 202601, studentName: "ياسر بن محمد الرويلي", status: "submitted", teacherNote: "أحسنت خطك جميل ومرتب يا ياسر!" },
      { studentId: 202603, studentName: "مازن بن فيصل الشمري", status: "notSubmitted", teacherNote: "" }
    ]
  },
  {
    id: 502,
    grade: "الصف الثاني",
    section: "أ",
    subjectName: "الرياضيات",
    subjectNameEn: "Mathematics",
    title: "جمع الأعداد المكونة من رقمين",
    content: "حل المسائل من ١ إلى ١٠ في كتاب التمارين صفحة ١٥، والتدرب على الجمع الذهني السريع.",
    dateCreated: "2026-06-15",
    dueDate: "2026-06-18",
    attachments: ["math_addition_worksheet.png"],
    submissions: [
      { studentId: 202605, studentName: "سلطان بن عادل العتيبي", status: "submittedLate", teacherNote: "ممتاز ولكن يرجى الالتزام بالموعد المحدد مستقبلاً" }
    ]
  }
];

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  m2: { homework: Math.max(0, hw - 1), attendance: att, behavior: beh, oral: Math.max(0, oral - 1), written: Math.max(0, wrt - 2) },
  m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wrt },
  finalExam: final
});

const initialDetailedGrades = [
  {
    studentId: 202601,
    studentName: "ياسر بن محمد الرويلي",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(14, 15, 10, 9, 48, 28),
        "العلوم": defaultDetailedGradeObj(15, 15, 10, 10, 46, 27),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 49, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(13, 15, 9, 9, 44, 26)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(15, 15, 10, 10, 49, 29),
        "العلوم": defaultDetailedGradeObj(14, 15, 10, 9, 47, 28),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(14, 14, 9, 10, 45, 27)
      }
    }
  },
  {
    studentId: 202602,
    studentName: "عبدالرحمن بن خالد العسيري",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(12, 13, 9, 8, 40, 24),
        "العلوم": defaultDetailedGradeObj(13, 14, 9, 9, 42, 25),
        "اللغة العربية": defaultDetailedGradeObj(14, 15, 10, 9, 44, 27),
        "اللغة الإنجليزية": defaultDetailedGradeObj(11, 12, 8, 7, 38, 22)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(13, 14, 9, 8, 42, 25),
        "العلوم": defaultDetailedGradeObj(14, 13, 9, 9, 41, 26),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 46, 28),
        "اللغة الإنجليزية": defaultDetailedGradeObj(12, 13, 8, 8, 39, 23)
      }
    }
  },
  {
    studentId: 202603,
    studentName: "مازن بن فيصل الشمري",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(15, 15, 10, 10, 49, 29),
        "العلوم": defaultDetailedGradeObj(14, 15, 10, 9, 48, 29),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(14, 15, 10, 9, 46, 28)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "العلوم": defaultDetailedGradeObj(15, 15, 10, 10, 49, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 48, 29)
      }
    }
  },
  {
    studentId: 202604,
    studentName: "عبدالعزيز بن عبدالله القحطاني",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(8, 10, 7, 6, 28, 15),
        "العلوم": defaultDetailedGradeObj(9, 11, 7, 7, 30, 16),
        "اللغة العربية": defaultDetailedGradeObj(10, 12, 8, 8, 32, 18),
        "اللغة الإنجليزية": defaultDetailedGradeObj(8, 9, 6, 6, 26, 14)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(9, 11, 7, 7, 30, 16),
        "العلوم": defaultDetailedGradeObj(10, 12, 8, 7, 31, 17),
        "اللغة العربية": defaultDetailedGradeObj(11, 13, 8, 8, 34, 19),
        "اللغة الإنجليزية": defaultDetailedGradeObj(9, 10, 7, 7, 28, 15)
      }
    }
  },
  {
    studentId: 202605,
    studentName: "سلطان بن عادل العتيبي",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "العلوم": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 49, 29)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "العلوم": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30)
      }
    }
  },
  {
    studentId: 202606,
    studentName: "فهد بن محمد الرويلي",
    grades: {
      term1: {
        "الرياضيات": defaultDetailedGradeObj(13, 14, 9, 9, 43, 26),
        "العلوم": defaultDetailedGradeObj(14, 14, 9, 9, 44, 26),
        "اللغة العربية": defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        "اللغة الإنجليزية": defaultDetailedGradeObj(12, 13, 9, 8, 41, 25)
      },
      term2: {
        "الرياضيات": defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        "العلوم": defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 46, 28),
        "اللغة الإنجليزية": defaultDetailedGradeObj(13, 14, 9, 9, 42, 26)
      }
    }
  }
];

const initialExamSchedules = [
  {
    id: 801,
    grade: "الصف الأول",
    section: "أ",
    term: "الفصل الأول",
    termEn: "First Term",
    period: "الشهر الأول",
    periodEn: "Month 1",
    subjects: [
      { id: 1, subjectName: "اللغة العربية", date: "2026-10-18", time: "08:00 - 09:30 ص", note: "حروف (أ، ب، ت، ث)" },
      { id: 2, subjectName: "الرياضيات", date: "2026-10-19", time: "08:00 - 09:30 ص", note: "العد حتى رقم ١٠ والأشكال الهندسية" }
    ]
  },
  {
    id: 802,
    grade: "الصف الثاني",
    section: "أ",
    term: "الفصل الأول",
    termEn: "First Term",
    period: "اختبار نهاية الترم",
    periodEn: "Final Term Exam",
    subjects: [
      { id: 1, subjectName: "العلوم والفيزياء", date: "2026-11-20", time: "08:00 - 10:00 ص", note: "الوحدة الأولى والثانية بالكامل" },
      { id: 2, subjectName: "اللغة الإنجليزية", date: "2026-11-22", time: "08:00 - 10:00 ص", note: "الوحدات من ١ إلى ٣" }
    ]
  }
];

const initialTuitionFees = {
  baseFees: {
    "الصف الأول": 5000,
    "الصف الثاني": 5500,
    "الصف الثالث": 6000
  },
  payments: [
    { id: 901, studentId: 202601, amount: 2000, paymentDate: "2026-05-15", referenceNo: "REC-94827", status: 'completed' },
    { id: 902, studentId: 202601, amount: 1500, paymentDate: "2026-06-01", referenceNo: "REC-95012", status: 'completed' },
    { id: 903, studentId: 202602, amount: 5500, paymentDate: "2026-05-10", referenceNo: "REC-10294", status: 'completed' },
    { id: 904, studentId: 202603, amount: 3000, paymentDate: "2026-05-20", referenceNo: "REC-20391", status: 'completed' },
    { id: 905, studentId: 202605, amount: 5000, paymentDate: "2026-05-25", referenceNo: "REC-30912", status: 'completed' }
  ]
};

const initialNotifications = [
  { id: 1001, title: "تهنئة بمناسبة العام الدراسي الجديد", content: "تتقدم رياض ومدارس انوار العلى الدولية النموذجية بأجمل التهاني والتبريكات بمناسبة العام الدراسي الجديد، متمنين لطلابنا الأعزاء عاماً حافلاً بالنجاح والتفوق.", date: "2026-06-01 08:30", type: "general", studentId: null },
  { id: 1002, title: "موعد الجمعية العمومية للآباء", content: "ندعوكم لحضور اجتماع الجمعية العمومية لأولياء الأمور يوم الاثنين القادم لمناقشة سبل تعزيز التعاون المشترك.", date: "2026-06-12 11:00", type: "general", studentId: null },
  { id: 1003, title: "ملاحظة سلوكية بخصوص الطالب", content: "يرجى التكرم بزيارة مكتب الإرشاد الطلابي بالمدرسة لمناقشة سلوك الطالب والعمل معاً على تعديله.", date: "2026-06-15 09:15", type: "private", studentId: 202604, studentName: "عبدالعزيز بن عبدالله القحطاني" }
];

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Modal & Printing UI States
  const [showCardVisualizerModal, setShowCardVisualizerModal] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('subject'); // 'month' | 'subject' | 'term'
  const [printSelectedMonth, setPrintSelectedMonth] = useState('m1'); // 'm1' | 'm2' | 'm3'
  const [selectedGradeStudentId, setSelectedGradeStudentId] = useState(202601);
  const [selectedGradeTerm, setSelectedGradeTerm] = useState('term1');
  const [selectedGradeSubject, setSelectedGradeSubject] = useState('الرياضيات');
  const [printStudentObject, setPrintStudentObject] = useState(null);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // School core data states
  const [students, setStudents] = useState(initialStudents);
  const [supervisors, setSupervisors] = useState(initialSupervisors);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [schedules, setSchedules] = useState(initialSchedule);
  const [grades, setGrades] = useState(initialGrades);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [classes, setClasses] = useState(initialClasses);
  
  // Dynamic available classes and sections configuration
  const [availableGrades, setAvailableGrades] = useState([
    'تمهيدي أول', 'تمهيدي ثاني',
    'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس',
    'الصف الأول المتوسط', 'الصف الثاني المتوسط', 'الصف الثالث المتوسط',
    'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
  ]);
  const [availableSections, setAvailableSections] = useState(['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز']);
  
  // Standalone parent accounts database
  const [parentUsers, setParentUsers] = useState(initialParentUsers);
  
  // New integrated features states
  const [absenceRequests, setAbsenceRequests] = useState(initialAbsenceRequests);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [detailedGrades, setDetailedGrades] = useState(initialDetailedGrades);
  const [examSchedules, setExamSchedules] = useState(initialExamSchedules);
  const [tuitionFees, setTuitionFees] = useState(initialTuitionFees);
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const [toastMessage, setToastMessage] = useState('');
  
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const triggerConfirm = ({ title, message, onConfirm, onCancel }) => {
    setConfirmState({
      isOpen: true,
      title: title || (lang === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'),
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };
  
  // Gate Scanner Simulator states
  const [smsLogs, setSmsLogs] = useState([]);
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState('2026-06');
  
  // Attendance records (simulated)
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const records = [];
    const startDay = 1;
    const endDay = 15;
    const year = 2026;
    const month = 5; // June (0-indexed 5)
    
    initialStudents.forEach(student => {
      for (let day = startDay; day <= endDay; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 4 || dayOfWeek === 5) continue; // Skip Thursday/Friday weekends
        
        const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
        
        let status = 'present';
        let time = '07:30';
        
        const hash = (student.id + day) % 15;
        if (hash === 0 || hash === 5) {
          status = 'absent';
          time = '--:--';
        } else if (hash === 2) {
          status = 'present';
          time = '07:45';
        } else if (student.id === 202604 && day === 14) {
          status = 'absent';
          time = '--:--';
        }
        
        records.push({
          studentId: student.id,
          date: dateStr,
          status: status,
          time: time
        });
      }
    });
    return records;
  });
  
  // Digital Control states
  const [isGradesEncrypted, setIsGradesEncrypted] = useState(false);
  const [controlPrefix, setControlPrefix] = useState('SEC-');
  const [controlMultiplier, setControlMultiplier] = useState(3);
  const [controlOffset, setControlOffset] = useState(1000);
  const [controlModulo, setControlModulo] = useState(10000);

  const t = dictionary[lang];

  // Auto-login using saved Sanctum token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          // Convert from database fields to frontend structure if necessary
          const mappedUser = {
            id: data.user.id,
            name: data.user.name,
            name_ar: data.user.name_ar,
            name_en: data.user.name_en,
            username: data.user.username,
            role: data.user.role,
            photo: data.user.photo_url || 'أ ع',
            email: null
          };
          setCurrentUser(mappedUser);
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(err => {
        console.error('API Auto-Login error:', err);
      });
    }
  }, []);

  // Set html page direction
  useEffect(() => {
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // Set dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showNotificationsDropdown && !e.target.closest('.notifications-dropdown-container') && !e.target.closest('.notifications-btn')) {
        setShowNotificationsDropdown(false);
      }
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-container') && !e.target.closest('.profile-btn')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showNotificationsDropdown, showProfileDropdown]);

  // Auto trigger absent parent SMS log alert after 10 AM (simulated)
  useEffect(() => {
    const triggerAbsentAlerts = () => {
      const absents = students.filter(s => s.status === 'absent');
      absents.forEach(student => {
        // Send SMS to parents if not already sent
        const alreadySent = smsLogs.some(log => log.studentId === student.id && log.type === 'absent');
        if (!alreadySent) {
          const smsText = lang === 'ar' 
            ? `نفيدكم بأن ابنكم ${student.name} غائب عن المدرسة اليوم الأحد. رياض و مدارس انوار العلى الدولية النموذجية.`
            : `We inform you that your son ${student.nameEn} is absent from school today. Riyadh & Anwar Al-Ola International Model Schools.`;
          
          const newSms = {
            id: Date.now() + student.id,
            studentId: student.id,
            recipient: `+966 ${student.phone}`,
            text: smsText,
            time: "10:00",
            type: 'absent'
          };
          setSmsLogs(prev => [newSms, ...prev]);
        }
      });
    };
    
    const timer = setTimeout(triggerAbsentAlerts, 2000);
    return () => clearTimeout(timer);
  }, [students, lang, smsLogs]);

  // Render photo utility helper
  const renderAvatar = (photo, defaultEmoji) => {
    if (photo && (photo.startsWith('data:') || photo.startsWith('http') || photo.startsWith('/'))) {
      return (
        <img 
          src={photo} 
          alt="Avatar" 
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginInlineEnd: '8px' }} 
        />
      );
    }
    return <span style={{ fontSize: '18px', marginInlineEnd: '8px', verticalAlign: 'middle' }}>{photo || defaultEmoji}</span>;
  };

  const handleAddStudentAction = (newStudent, newGradeRow, newParentObj) => {
    if (newParentObj) {
      setParentUsers(prev => [...prev, newParentObj]);
    }
    setStudents(prev => [...prev, newStudent]);
    setGrades(prev => [...prev, newGradeRow]);
    
    setToastMessage(t.successToast);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddTeacherAction = (newTeacher) => {
    setTeachers(prev => [...prev, newTeacher]);
    setToastMessage(lang === 'ar' ? 'تم تسجيل المعلم بنجاح!' : 'Teacher added successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddParentAction = (newParent) => {
    setParentUsers(prev => [...prev, newParent]);
    setToastMessage(lang === 'ar' ? 'تم تسجيل حساب ولي الأمر بنجاح!' : 'Parent account registered successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleEditParentAction = (updatedParent, linkedNameSync, parentNationalId) => {
    setParentUsers(prev => prev.map(p => p.nationalId === parentNationalId ? updatedParent : p));
    setStudents(prev => prev.map(s => {
      if (s.parentNationalId === parentNationalId) {
        return {
          ...s,
          parentName: updatedParent.name,
          parentNameEn: updatedParent.nameEn,
          phone: updatedParent.phone
        };
      }
      return s;
    }));
    setToastMessage(lang === 'ar' ? 'تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!' : 'Parent account details updated successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleEditTeacherAction = (updatedTeacher, teacherId) => {
    setTeachers(prev => prev.map(t => t.id === teacherId ? updatedTeacher : t));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المعلم وإعادة تعيين كلمة المرور بنجاح!' : 'Teacher details updated and password reset successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddSupervisorAction = (newSupervisor) => {
    setSupervisors(prev => [...prev, newSupervisor]);
    setToastMessage(lang === 'ar' ? 'تم تسجيل مشرف التحضير بنجاح!' : 'Prep supervisor added successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleEditSupervisorAction = (updatedSupervisor, supervisorId) => {
    setSupervisors(prev => prev.map(s => s.id === supervisorId ? updatedSupervisor : s));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor details updated successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDeleteSupervisorAction = (supervisorId) => {
    setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
    setToastMessage(lang === 'ar' ? 'تم حذف المشرف بنجاح!' : 'Supervisor deleted successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddClassAction = (newClass) => {
    setClasses(prev => [...prev, newClass]);
    setToastMessage(lang === 'ar' ? 'تمت إضافة الفصل الدراسي بنجاح!' : 'Class created successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEditClassAction = (updatedClass, classId) => {
    setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات الفصل بنجاح!' : 'Class details updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteClassAction = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setToastMessage(lang === 'ar' ? 'تم حذف الفصل بنجاح' : 'Class deleted successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddSubjectAction = (newSubject, classesListToUpdate) => {
    setSubjects(prev => [...prev, newSubject]);
    setClasses(prev => prev.map(c => {
      if (classesListToUpdate.includes(c.name)) {
        if (!c.subjects.includes(newSubject.name)) {
          return { ...c, subjects: [...c.subjects, newSubject.name] };
        }
      } else {
        return { ...c, subjects: c.subjects.filter(s => s !== newSubject.name) };
      }
      return c;
    }));
    setToastMessage(lang === 'ar' ? 'تمت إضافة المادة بنجاح!' : 'Subject created successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEditSubjectAction = (updatedSubject, subjectId, oldName, newName, classesListToUpdate) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? updatedSubject : s));
    setClasses(prev => prev.map(c => {
      let classSubjects = c.subjects;
      if (classesListToUpdate.includes(c.name)) {
        if (classSubjects.includes(oldName)) {
          classSubjects = classSubjects.map(s => s === oldName ? newName : s);
        } else {
          classSubjects = [...classSubjects, newName];
        }
      } else {
        classSubjects = classSubjects.filter(s => s !== oldName && s !== newName);
      }
      return { ...c, subjects: classSubjects };
    }));
    setTeachers(prev => prev.map(t => {
      let tSubs = t.subjects || [];
      if (tSubs.includes(oldName)) {
        tSubs = tSubs.map(s => s === oldName ? newName : s);
      }
      const tSub = t.subject === oldName ? newName : t.subject;
      return { ...t, subject: tSub, subjects: tSubs };
    }));
    setToastMessage(lang === 'ar' ? 'تم تحديث المادة بنجاح!' : 'Subject details updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteSubjectAction = (id, subName) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setClasses(prev => prev.map(c => ({
      ...c,
      subjects: c.subjects.filter(s => s !== subName)
    })));
    setToastMessage(lang === 'ar' ? 'تم حذف المادة بنجاح' : 'Subject deleted successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddGradeAction = (gradeName) => {
    setAvailableGrades(prev => [...prev, gradeName]);
    setToastMessage(lang === 'ar' ? `تمت إضافة الصف الدراسي: ${gradeName}` : `Grade level added: ${gradeName}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemoveGradeAction = (gradeName) => {
    setAvailableGrades(prev => prev.filter(g => g !== gradeName));
    setToastMessage(lang === 'ar' ? `تم حذف الصف الدراسي: ${gradeName}` : `Grade level removed: ${gradeName}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddSectionAction = (sectionName) => {
    setAvailableSections(prev => [...prev, sectionName]);
    setToastMessage(lang === 'ar' ? `تمت إضافة الشعبة: ${sectionName}` : `Section added: ${sectionName}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemoveSectionAction = (sectionName) => {
    setAvailableSections(prev => prev.filter(s => s !== sectionName));
    setToastMessage(lang === 'ar' ? `تم حذف الشعبة: ${sectionName}` : `Section removed: ${sectionName}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleManualAttendanceChangeAction = (studentId, newStatus, rosterDate) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: newStatus,
          time: newStatus === 'present' ? '07:30' : newStatus === 'late' ? '08:00' : '--:--'
        };
      }
      return s;
    }));

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === studentId && r.date === rosterDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: newStatus };
        return updated;
      } else {
        return [...prev, {
          studentId,
          date: rosterDate,
          status: newStatus,
          time: newStatus === 'present' ? '07:30' : newStatus === 'late' ? '08:00' : '--:--'
        }];
      }
    });

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (newStatus === 'absent') {
      const hasExcuse = absenceRequests.some(r => r.studentId === studentId && r.requestedDate === rosterDate && r.status === 'approved');
      const smsText = hasExcuse 
        ? (lang === 'ar' 
            ? `سعادة ولي أمر الطالب ${student.name}: تم تسجيل ابنكم غائباً بعذر مقبول لهذا اليوم ${rosterDate}.` 
            : `Dear parent of ${student.nameEn}: Your child has been marked as absent (excused) for today ${rosterDate}.`)
        : (lang === 'ar' 
            ? `عاجل من رياض و مدارس انوار العلى: نفيدكم بغياب ابنكم ${student.name} اليوم ${rosterDate} دون عذر مسبق. يرجى التواصل مع الإدارة.` 
            : `Urgent from Riyadh & Anwar Al-Ola International Model Schools: Your child ${student.nameEn} is absent today ${rosterDate} without an excuse. Please contact administration.`);
      
      const newSms = {
        id: Date.now(),
        studentId: studentId,
        studentName: student.name,
        phone: student.phone,
        message: smsText,
        timestamp: new Date().toLocaleTimeString()
      };
      setSmsLogs(prev => [newSms, ...prev]);
    }

    setToastMessage(lang === 'ar' ? 'تم تحديث حالة حضور الطالب بنجاح!' : 'Attendance status updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleManualAttendanceNoteChangeAction = (studentId, noteText) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendanceNote: noteText } : s));
  };

  const handleCellAttendanceChangeAction = (studentId, date, newStatus, rosterDate) => {
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.studentId === studentId && r.date === date);
      if (existingIdx > -1) {
        if (!newStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: newStatus };
        return updated;
      } else {
        if (!newStatus) return prev;
        return [...prev, {
          studentId,
          date,
          status: newStatus,
          time: newStatus === 'present' ? '07:30' : newStatus === 'late' ? '07:55' : '--:--'
        }];
      }
    });

    if (date === rosterDate) {
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            status: newStatus || 'absent',
            time: newStatus === 'present' ? '07:30' : newStatus === 'late' ? '07:55' : '--:--'
          };
        }
        return s;
      }));
    }
  };

  const handleToggleDayAttendanceAction = (studentId, dateStr, currentStatus) => {
    let nextStatus = 'present';
    if (currentStatus) {
      if (currentStatus === 'present') nextStatus = 'absent';
      else if (currentStatus === 'absent') nextStatus = null;
    }
    
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.studentId === studentId && r.date === dateStr);
      if (existingIdx > -1) {
        if (!nextStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: nextStatus };
        return updated;
      } else {
        if (!nextStatus) return prev;
        return [...prev, {
          studentId,
          date: dateStr,
          status: nextStatus,
          time: nextStatus === 'present' ? '07:30' : nextStatus === 'late' ? '07:55' : '--:--'
        }];
      }
    });
  };

  const calculateStudentStats = useCallback((studentId) => {
    const records = attendanceRecords.filter(r => r.studentId === studentId && r.date.startsWith(selectedAttendanceMonth));
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, late: 0, absent, rate };
  }, [attendanceRecords, selectedAttendanceMonth]);

  const handleAbsenceDecisionAction = (requestId, newStatus, adminNoteText) => {
    setAbsenceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (newStatus === 'approved') {
          setStudents(studs => studs.map(s => {
            if (s.id === req.studentId) {
              return { ...s, status: 'present', time: '07:30' };
            }
            return s;
          }));
          const student = students.find(s => s.id === req.studentId);
          const smsText = lang === 'ar'
            ? `نفيدكم بقبول طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate} وتم اعتماده بعذر.`
            : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is approved.`;
          setSmsLogs(logs => [{
            id: Date.now(),
            studentId: req.studentId,
            recipient: `+966 ${student?.phone}`,
            text: smsText,
            time: "08:30",
            type: 'present'
          }, ...logs]);
        } else if (newStatus === 'rejected') {
          const student = students.find(s => s.id === req.studentId);
          const smsText = lang === 'ar'
            ? `نفيدكم برفض طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate}. ملاحظة الإدارة: ${adminNoteText || 'الرجاء التواصل معنا'}`
            : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is rejected. Admin Note: ${adminNoteText || 'Contact admin'}`;
          setSmsLogs(logs => [{
            id: Date.now(),
            studentId: req.studentId,
            recipient: `+966 ${student?.phone}`,
            text: smsText,
            time: "08:30",
            type: 'absent'
          }, ...logs]);
        }
        return { 
          ...req, 
          status: newStatus, 
          adminNote: adminNoteText || (newStatus === 'approved' ? 'تمت الموافقة بعذر مقبول' : 'مرفوض لعدم اكتمال المبررات'),
          adminNoteEn: adminNoteText || (newStatus === 'approved' ? 'Approved with excuse' : 'Rejected due to insufficient details')
        };
      }
      return req;
    }));
    setToastMessage(newStatus === 'approved' ? t.approvedNoteToast : t.rejectedNoteToast);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddAssignmentAction = (newAssignment, matchingTeacherId) => {
    setAssignments(prev => [newAssignment, ...prev]);
    if (matchingTeacherId) {
      setTeachers(prev => prev.map(t => t.id === matchingTeacherId ? { ...t, assignments: t.assignments + 1 } : t));
    }
    setToastMessage(t.assignmentSuccessToast);
    setTimeout(() => setToastMessage(''), 3000);

    const classStudents = students.filter(s => s.grade === newAssignment.grade && s.section === newAssignment.section);
    classStudents.forEach(student => {
      const smsText = lang === 'ar'
        ? `تم نشر واجب جديد للمادة ${newAssignment.subjectName}: "${newAssignment.title}". موعد التسليم: ${newAssignment.dueDate}. رياض و مدارس انوار العلى.`
        : `New homework assignment published for ${newAssignment.subjectName}: "${newAssignment.title}". Due: ${newAssignment.dueDate}. Riyadh & Anwar Al-Ola.`;
      setSmsLogs(logs => [{
        id: Date.now() + Math.random(),
        studentId: student.id,
        recipient: `+966 ${student.phone}`,
        text: smsText,
        time: "14:30",
        type: 'present'
      }, ...logs]);
    });
  };

  const handleUpdateSubmissionStatusAction = (assignmentId, studentId, newStatus, note) => {
    setAssignments(prev => prev.map(assign => {
      if (assign.id === assignmentId) {
        const updatedSubs = assign.submissions.map(sub => {
          if (sub.studentId === studentId) {
            return { ...sub, status: newStatus, teacherNote: note };
          }
          return sub;
        });
        const exists = assign.submissions.some(sub => sub.studentId === studentId);
        if (!exists) {
          const student = students.find(s => s.id === studentId);
          updatedSubs.push({
            studentId,
            studentName: student ? student.name : '',
            status: newStatus,
            teacherNote: note
          });
        }
        return { ...assign, submissions: updatedSubs };
      }
      return assign;
    }));
  };

  const getStudentDetailedGrades = (studentId, subject, term) => {
    const record = detailedGrades.find(r => r.studentId === studentId);
    if (!record || !record.grades[term] || !record.grades[term][subject]) {
      return defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
    }
    return record.grades[term][subject];
  };

  const handleDetailedGradeChangeAction = (studentId, subject, term, monthKey, field, num) => {
    setDetailedGrades(prev => {
      let studentRecord = prev.find(r => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find(s => s.id === studentId);
        studentRecord = {
          studentId,
          studentName: student ? student.name : '',
          grades: {
            term1: {
              "الرياضيات": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "العلوم": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0)
            },
            term2: {
              "الرياضيات": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "العلوم": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0)
            }
          }
        };
        prev = [...prev, studentRecord];
      }

      return prev.map(r => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[term] };
          const subjectGrades = { ...termGrades[subject] };
          
          if (monthKey === 'finalExam') {
            subjectGrades.finalExam = num;
          } else {
            subjectGrades[monthKey] = {
              ...subjectGrades[monthKey],
              [field]: num
            };
          }
          
          termGrades[subject] = subjectGrades;
          updatedGrades[term] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });
    });
  };

  const syncGeneralGradesAction = (studentId) => {
    const record = detailedGrades.find(r => r.studentId === studentId);
    if (!record) return;

    const subjectsMap = {
      "الرياضيات": "math",
      "العلوم": "science",
      "اللغة العربية": "arabic",
      "اللغة الإنجليزية": "english"
    };

    setGrades(prev => prev.map(row => {
      if (row.studentId === studentId) {
        const updatedRow = { ...row };
        Object.keys(subjectsMap).forEach(subName => {
          const field = subjectsMap[subName];
          
          const t1 = record.grades.term1[subName] || defaultDetailedGradeObj(0,0,0,0,0,0);
          const t1_m1 = t1.m1.homework + t1.m1.attendance + t1.m1.behavior + t1.m1.oral + t1.m1.written;
          const t1_m2 = t1.m2.homework + t1.m2.attendance + t1.m2.behavior + t1.m2.oral + t1.m2.written;
          const t1_m3 = t1.m3.homework + t1.m3.attendance + t1.m3.behavior + t1.m3.oral + t1.m3.written;
          const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
          const t1_total = t1_avg + t1.finalExam;

          const t2 = record.grades.term2[subName] || defaultDetailedGradeObj(0,0,0,0,0,0);
          const t2_m1 = t2.m1.homework + t2.m1.attendance + t2.m1.behavior + t2.m1.oral + t2.m1.written;
          const t2_m2 = t2.m2.homework + t2.m2.attendance + t2.m2.behavior + t2.m2.oral + t2.m2.written;
          const t2_m3 = t2.m3.homework + t2.m3.attendance + t2.m3.behavior + t2.m3.oral + t2.m3.written;
          const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
          const t2_total = t2_avg + t2.finalExam;

          const yearly = Math.round(t1_total + t2_total);
          updatedRow[field] = yearly;
        });
        return updatedRow;
      }
      return row;
    }));
  };

  const handlePublishExamScheduleAction = (newSchedule) => {
    setExamSchedules(prev => [newSchedule, ...prev]);
    setToastMessage(lang === 'ar' ? 'تم نشر جدول الاختبارات بنجاح!' : 'Exam schedule published successfully!');
    setTimeout(() => setToastMessage(''), 3000);

    const classStudents = students.filter(s => s.grade === newSchedule.grade && s.section === newSchedule.section);
    classStudents.forEach(student => {
      const smsText = lang === 'ar'
        ? `تم نشر جدول اختبارات جديد (${newSchedule.period} - ${newSchedule.term}) للصف ${newSchedule.grade}. يرجى مراجعته في تطبيق ولي الأمر.`
        : `New exam schedule published (${newSchedule.periodEn} - ${newSchedule.termEn}) for ${newSchedule.grade}. Please review it in the Parent App.`;
      setSmsLogs(logs => [{
        id: Date.now() + Math.random(),
        studentId: student.id,
        recipient: `+966 ${student.phone}`,
        text: smsText,
        time: "15:00",
        type: 'present'
      }, ...logs]);
    });
  };

  const handleDeleteExamScheduleAction = (id) => {
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جدول الاختبارات' : 'Delete Exam Schedule',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الجدول نهائياً؟' : 'Are you sure you want to permanently delete this schedule?',
      onConfirm: () => {
        setExamSchedules(prev => prev.filter(sch => sch.id !== id));
        setToastMessage(lang === 'ar' ? 'تم حذف جدول الاختبارات بنجاح' : 'Exam schedule deleted successfully');
        setTimeout(() => setToastMessage(''), 3000);
      }
    });
  };

  const handleAddPaymentAction = (newPayment) => {
    setTuitionFees(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));
    setToastMessage(t.paymentSuccessToast);
    setTimeout(() => setToastMessage(''), 3000);

    const student = students.find(s => s.id === newPayment.studentId);
    const smsText = lang === 'ar'
      ? `تم استلام دفعة مالية بقيمة ${newPayment.amount} ريال للسند رقم ${newPayment.referenceNo} بخصوص الطالب ${student?.name}. شكراً لكم. رياض و مدارس انوار العلى.`
      : `Payment of ${newPayment.amount} SAR (Receipt: ${newPayment.referenceNo}) received for student ${student?.nameEn}. Thank you. Riyadh & Anwar Al-Ola.`;
    setSmsLogs(logs => [{
      id: Date.now(),
      studentId: newPayment.studentId,
      recipient: `+966 ${student?.phone}`,
      text: smsText,
      time: "11:30",
      type: 'present'
    }, ...logs]);
  };

  const handleSendNotificationAction = (newNotification, extraLogs = []) => {
    setNotifications(prev => [newNotification, ...prev]);
    setToastMessage(t.notificationSuccessToast);
    setTimeout(() => setToastMessage(''), 3000);

    if (extraLogs.length > 0) {
      setSmsLogs(logs => [...extraLogs, ...logs]);
    }
  };

  const handleScheduleChangeAction = (dayKey, periodIdx, val, selectedScheduleGrade) => {
    setSchedules(prev => {
      const gradeSchedule = { ...prev[selectedScheduleGrade] };
      const dayClasses = [...gradeSchedule[dayKey]];
      dayClasses[periodIdx] = val;
      gradeSchedule[dayKey] = dayClasses;
      return { ...prev, [selectedScheduleGrade]: gradeSchedule };
    });
  };

  const handleGradeCellChangeAction = (studentId, subject, val) => {
    const num = val === '' ? 0 : Math.min(100, Math.max(0, parseInt(val) || 0));
    setGrades(prev => prev.map(row => {
      if (row.studentId === studentId) {
        return { ...row, [subject]: num };
      }
      return row;
    }));
  };

  const handleCalculateSecretCodesAction = () => {
    setGrades(prev => prev.map(row => {
      const calculatedCode = row.studentId * Number(controlMultiplier) + Number(controlOffset);
      return { ...row, secretCode: calculatedCode.toString() };
    }));
    setIsGradesEncrypted(true);
    setToastMessage(lang === 'ar' ? 'تم توليد الأرقام السرية وتشفير الكشف بنجاح!' : 'Secret codes generated and grading sheet encrypted successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEnterGradeBySecretCodeAction = (secretCodeInput, secretGradeInput, secretSubjectInput, secretTermInput) => {
    const valNum = Math.min(30, Math.max(0, parseFloat(secretGradeInput) || 0));
    const studentGradeRow = grades.find(g => g.secretCode === secretCodeInput.trim());
    if (!studentGradeRow) {
      setToastMessage(lang === 'ar' ? 'عذراً، الرقم السري غير صحيح أو غير موجود!' : 'Sorry, secret code is incorrect or not found!');
      setTimeout(() => setToastMessage(''), 3000);
      return false;
    }

    const studentId = studentGradeRow.studentId;

    setDetailedGrades(prev => {
      let studentRecord = prev.find(r => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find(s => s.id === studentId);
        studentRecord = {
          studentId,
          studentName: student ? student.name : '',
          grades: {
            term1: {
              "الرياضيات": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "العلوم": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0)
            },
            term2: {
              "الرياضيات": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "العلوم": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0)
            }
          }
        };
        prev = [...prev, studentRecord];
      }

      const updatedList = prev.map(r => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[secretTermInput] };
          const subjectGrades = { ...termGrades[secretSubjectInput] };
          
          subjectGrades.finalExam = valNum;
          
          termGrades[secretSubjectInput] = subjectGrades;
          updatedGrades[secretTermInput] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });

      const record = updatedList.find(r => r.studentId === studentId);
      const subjectsMap = {
        "الرياضيات": "math",
        "العلوم": "science",
        "اللغة العربية": "arabic",
        "اللغة الإنجليزية": "english"
      };

      setGrades(prevGrades => prevGrades.map(row => {
        if (row.studentId === studentId) {
          const updatedRow = { ...row };
          Object.keys(subjectsMap).forEach(subName => {
            const field = subjectsMap[subName];
            
            const t1 = record.grades.term1[subName] || defaultDetailedGradeObj(0,0,0,0,0,0);
            const t1_m1 = t1.m1.homework + t1.m1.attendance + t1.m1.behavior + t1.m1.oral + t1.m1.written;
            const t1_m2 = t1.m2.homework + t1.m2.attendance + t1.m2.behavior + t1.m2.oral + t1.m2.written;
            const t1_m3 = t1.m3.homework + t1.m3.attendance + t1.m3.behavior + t1.m3.oral + t1.m3.written;
            const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
            const t1_total = t1_avg + t1.finalExam;

            const t2 = record.grades.term2[subName] || defaultDetailedGradeObj(0,0,0,0,0,0);
            const t2_m1 = t2.m1.homework + t2.m1.attendance + t2.m1.behavior + t2.m1.oral + t2.m1.written;
            const t2_m2 = t2.m2.homework + t2.m2.attendance + t2.m2.behavior + t2.m2.oral + t2.m2.written;
            const t2_m3 = t2.m3.homework + t2.m3.attendance + t2.m3.behavior + t2.m3.oral + t2.m3.written;
            const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
            const t2_total = t2_avg + t2.finalExam;

            const yearly = Math.round(t1_total + t2_total);
            updatedRow[field] = yearly;
          });
          return updatedRow;
        }
        return row;
      }));

      return updatedList;
    });

    setToastMessage(lang === 'ar' 
      ? `تم رصد الدرجة (${valNum}/30) لمادة ${secretSubjectInput} بنجاح للطالب ذو الرقم السري: ${secretCodeInput}` 
      : `Successfully entered grade (${valNum}/30) for subject ${secretSubjectInput} (Secret Code: ${secretCodeInput})`);
    setTimeout(() => setToastMessage(''), 4000);
    return true;
  };

  const handleQrScanAction = (scannedStudentId) => {
    const student = students.find(s => s.id === scannedStudentId);
    if (!student) return false;

    const arrivalTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const isLate = arrivalTime > "07:45"; // school late threshold is 7:45 AM
    const finalStatus = isLate ? 'late' : 'present';

    setStudents(prev => prev.map(s => {
      if (s.id === scannedStudentId) {
        return {
          ...s,
          status: finalStatus,
          time: arrivalTime
        };
      }
      return s;
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === scannedStudentId && r.date === todayStr);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: finalStatus, time: arrivalTime };
        return updated;
      } else {
        return [...prev, {
          studentId: scannedStudentId,
          date: todayStr,
          status: finalStatus,
          time: arrivalTime
        }];
      }
    });

    const smsText = finalStatus === 'late'
      ? (lang === 'ar'
          ? `نفيدكم بتأخر ابنكم ${student.name} عن الطابور الصباحي، حيث حضر الساعة ${arrivalTime}. رياض و مدارس انوار العلى.`
          : `We inform you that your child ${student.nameEn} arrived late at school today at ${arrivalTime}. Riyadh & Anwar Al-Ola.`)
      : (lang === 'ar'
          ? `تم تسجيل دخول ابنكم ${student.name} للمدرسة بنجاح، وقت الحضور ${arrivalTime}. يوم سعيد! رياض و مدارس انوار العلى.`
          : `Your child ${student.nameEn} entered school successfully today at ${arrivalTime}. Have a great day! Riyadh & Anwar Al-Ola.`);

    const newSms = {
      id: Date.now(),
      studentId: scannedStudentId,
      recipient: `+966 ${student.phone}`,
      text: smsText,
      time: arrivalTime,
      type: finalStatus
    };
    setSmsLogs(prev => [newSms, ...prev]);
    return { student, finalStatus, arrivalTime };
  };

  const handleLogoutAction = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }).catch(err => console.error('API Logout error:', err));
    }
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
    setToastMessage(lang === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Logged out successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <AppContext.Provider value={{
      lang, setLang, t,
      darkMode, setDarkMode,
      activeTab, setActiveTab,
      handleLogout: handleLogoutAction,
      isSidebarCollapsed, setIsSidebarCollapsed,
      isMobileMenuOpen, setIsMobileMenuOpen,
      showNotificationsDropdown, setShowNotificationsDropdown,
      showProfileDropdown, setShowProfileDropdown,
      isAuthenticated, setIsAuthenticated,
      currentUser, setCurrentUser,
      students, setStudents,
      teachers, setTeachers,
      supervisors, setSupervisors,
      schedules, setSchedules,
      grades, setGrades,
      subjects, setSubjects,
      classes, setClasses,
      availableGrades, setAvailableGrades,
      availableSections, setAvailableSections,
      parentUsers, setParentUsers,
      absenceRequests, setAbsenceRequests,
      assignments, setAssignments,
      detailedGrades, setDetailedGrades,
      examSchedules, setExamSchedules,
      tuitionFees, setTuitionFees,
      notifications, setNotifications,
      toastMessage, setToastMessage,
      confirmState, triggerConfirm,
      smsLogs, setSmsLogs,
      attendanceRecords, setAttendanceRecords,
      selectedAttendanceMonth, setSelectedAttendanceMonth,
      isGradesEncrypted, setIsGradesEncrypted,
      controlPrefix, setControlPrefix,
      controlMultiplier, setControlMultiplier,
      controlOffset, setControlOffset,
      controlModulo, setControlModulo,
      renderAvatar,
      
      // Actions
      handleAddStudent: handleAddStudentAction,
      handleAddTeacher: handleAddTeacherAction,
      handleAddParent: handleAddParentAction,
      handleEditParent: handleEditParentAction,
      handleEditTeacher: handleEditTeacherAction,
      handleAddSupervisor: handleAddSupervisorAction,
      handleEditSupervisor: handleEditSupervisorAction,
      handleDeleteSupervisor: handleDeleteSupervisorAction,
      handleAddClass: handleAddClassAction,
      handleEditClass: handleEditClassAction,
      handleDeleteClass: handleDeleteClassAction,
      handleAddSubject: handleAddSubjectAction,
      handleEditSubject: handleEditSubjectAction,
      handleDeleteSubject: handleDeleteSubjectAction,
      handleAddGrade: handleAddGradeAction,
      handleRemoveGrade: handleRemoveGradeAction,
      handleAddSection: handleAddSectionAction,
      handleRemoveSection: handleRemoveSectionAction,
      handleManualAttendanceChange: handleManualAttendanceChangeAction,
      handleManualAttendanceNoteChange: handleManualAttendanceNoteChangeAction,
      handleCellAttendanceChange: handleCellAttendanceChangeAction,
      handleToggleDayAttendance: handleToggleDayAttendanceAction,
      calculateStudentStats,
      handleAbsenceDecision: handleAbsenceDecisionAction,
      handleAddAssignment: handleAddAssignmentAction,
      handleUpdateSubmissionStatus: handleUpdateSubmissionStatusAction,
      getStudentDetailedGrades,
      handleDetailedGradeChange: handleDetailedGradeChangeAction,
      syncGeneralGrades: syncGeneralGradesAction,
      handlePublishExamSchedule: handlePublishExamScheduleAction,
      handleDeleteExamSchedule: handleDeleteExamScheduleAction,
      handleAddPayment: handleAddPaymentAction,
      handleSendNotification: handleSendNotificationAction,
      handleScheduleChange: handleScheduleChangeAction,
      handleGradeCellChange: handleGradeCellChangeAction,
      handleCalculateSecretCodes: handleCalculateSecretCodesAction,
      handleEnterGradeBySecretCode: handleEnterGradeBySecretCodeAction,
      handleQrScan: handleQrScanAction,
      showCardVisualizerModal, setShowCardVisualizerModal,
      selectedStudentForCard, setSelectedStudentForCard,
      showPrintModal, setShowPrintModal,
      printMode, setPrintMode,
      printSelectedMonth, setPrintSelectedMonth,
      selectedGradeStudentId, setSelectedGradeStudentId,
      selectedGradeTerm, setSelectedGradeTerm,
      selectedGradeSubject, setSelectedGradeSubject,
      printStudentObject, setPrintStudentObject
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
