import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import sloganLogo from "../assets/slogan.jpeg";

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
    loginSubtitle:
      "لوحة التحكم والإدارة الرقمية لرياض ومدارس انوار العلى الدولية النموذجية",
    usernameOrId: "اسم المستخدم أو الرقم الوظيفي",
    passwordLabel: "كلمة المرور",
    loginBtn: "دخول آمن",
    roleAdmin: "مدير النظام",
    roleSupervisor: "وكيل المدرسة",
    invalidCredentials:
      "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى",
    quickFill: "بيانات الدخول السريع للمحاكاة",
    rememberMe: "تذكرني على هذا الجهاز",
    usernamePlaceholder: "أدخل اسم المستخدم أو المعرف...",
    passwordPlaceholder: "أدخل كلمة المرور الخاصة بك...",
    loginFooter:
      "جميع الحقوق محفوظة لرياض ومدارس انوار العلى الدولية النموذجية © 2026",

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
    phoneError: "الرجاء إدخال رقم جوال صحيح (9 أرقام يبدأ بـ 7)",
    nationalIdError: "الرجاء إدخال رقم هوية وطنية صحيح لولي الأمر (10 أرقام تبدأ بـ 1 أو 2)",
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
    saturday: "السبت",
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
    gradesAlertText:
      "يتم استخدام الأرقام السرية وتشفير كشوف الأسماء آلياً لضمان السرية التامة أثناء تصحيح ومراجعة كراسات الامتحانات.",

    // Reports Tab
    reportsTitle: "تقارير الأداء العام والغياب والواجبات",
    attendanceRate: "معدل الحضور العام بالمدرسة",
    homeworkCompletionRate: "معدل تسليم الواجبات المنزلية",
    homeworkCompleted: "تم التسليم",
    homeworkDelayed: "متأخر",
    homeworkUnsubmitted: "لم يسلم بعد",
    absenceAlertTitle: "تنبيهات الغياب المتكرر وسلوك الطلاب",
    highAbsenceDesc:
      "الطلاب الذين تجاوز غيابهم 3 أيام هذا الشهر (تنبيه تلقائي لأولياء الأمور):",
    lowPerformanceDesc:
      "الطلاب ذوو الأداء الأكاديمي الضعيف (أقل من 60% في درجات الكنترول):",
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
    detailedGrades: "الدرجات",
    examSchedulesBuilder: "جداول الاختبارات",
    finance: "المالية والرسوم",
    communications: "الإشعارات",
    teacherReports: "بلاغات المعلمين",
    teacherReportsTitle: "مراجعة بلاغات ومخالفات الطلاب",

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
    paymentSuccessToast:
      "تم تسجيل الدفعة المالية بنجاح وتحديث كشف حساب الطالب!",

    // Communications
    communicationsTitle: "لوحة تحكم إشعارات الإدارة",
    sendGeneralNotificationBtn: "إرسال إشعار عام للكل",
    sendPrivateNotificationBtn: "إرسال إشعار خاص لطالب محدد",
    notificationTitleLabel: "عنوان الإشعار",
    notificationContentLabel: "نص الرسالة / الإشعار",
    notificationsHistoryTitle: "سجل الإرسال التاريخي",
    noNotifications: "لم يتم إرسال أي إشعارات سابقة.",
    notificationSuccessToast:
      "تم إرسال الإشعار وتوجيهه فوراً إلى الجهة المستهدفة!",
    targetLabel: "الفئة المستهدفة",
    targetAllParents: "جميع أولياء الأمور",
    targetByClass: "حسب الصف الدراسي",
    targetByStudent: "حسب الطالب",
    targetAllTeachers: "جميع المعلمين",
    targetSpecificTeacher: "معلم محدد",
    selectClass: "اختر الصف الدراسي",
    selectTeacher: "اختر المعلم",
    formulaTitle: "إعدادات معادلة الكنترول الرقمي",
    formulaDesc:
      "توليد الأرقام السرية آلياً بعملية حسابية على رقم الطالب وفقاً للمعادلة المحددة.",
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
    loginSubtitle:
      "Riyadh & Anwar Al-Ola International Model Schools Dashboard & Portal",
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
    loginFooter:
      "All rights reserved to Riyadh & Anwar Al-Ola International Model Schools © 2026",

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
    phoneError: "Please enter a valid phone number (9 digits starting with 7)",
    nationalIdError:
      "Please enter a valid Parent National ID (10 digits starting with 1 or 2)",
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
    saturday: "Saturday",
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
    gradesAlertText:
      "Student names are masked and replaced with unique secret numbers automatically to ensure grading confidentiality during exam corrections.",

    // Reports Tab
    reportsTitle: "General Performance, Absences & Assignments Reports",
    attendanceRate: "Overall Attendance Rate",
    homeworkCompletionRate: "Homework Completion Rate",
    homeworkCompleted: "Submitted",
    homeworkDelayed: "Delayed",
    homeworkUnsubmitted: "Not Submitted",
    absenceAlertTitle: "Repeated Absence & Academic Alerts",
    highAbsenceDesc:
      "Students who missed >= 3 days this month (Auto SMS warning sent to parents):",
    lowPerformanceDesc:
      "Students with low academic performance (Average grades below 60%):",
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
    detailedGrades: "Grades",
    examSchedulesBuilder: "Exam Schedules",
    finance: "Finance & Fees",
    communications: "Notifications",
    teacherReports: "Teacher Reports",
    teacherReportsTitle: "Review Student Incident Reports",

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
    approvedNoteToast:
      "Absence request approved and student attendance updated.",
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
    assignmentSuccessToast:
      "Assignment published and parents notified successfully!",

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
    paymentSuccessToast:
      "Payment recorded successfully and balance recalculated!",

    // Communications
    communicationsTitle: "Administration Notifications Dashboard",
    sendGeneralNotificationBtn: "Send Broadcast Notification",
    sendPrivateNotificationBtn: "Send Private Student Alert",
    notificationTitleLabel: "Notification Title",
    notificationContentLabel: "Notification Body",
    notificationsHistoryTitle: "Sent Notifications History",
    noNotifications: "No historical notifications sent.",
    notificationSuccessToast:
      "Notification broadcasted and pushed to targets successfully!",
    targetLabel: "Target Audience",
    targetAllParents: "All Parents / Guardians",
    targetByClass: "By Class / Grade",
    targetByStudent: "By Student",
    targetAllTeachers: "All Teachers",
    targetSpecificTeacher: "Specific Teacher",
    selectClass: "Select Class / Grade",
    selectTeacher: "Select Teacher",
    formulaTitle: "Digital Control Formula Settings",
    formulaDesc:
      "Generate secret codes automatically by applying an arithmetic operation on the Student ID (Reg No).",
    formulaPrefix: "Text Prefix (e.g. SEC-)",
    formulaMultiplier: "Multiplier Coefficient (×)",
    formulaOffset: "Additive Offset (+)",
    formulaModulo: "Modulo Divisor (%)",
    formulaPreviewLabel: "Active formula expression:",
    formulaExampleLabel: "Calculation example for ID (202601) ➔ ",
    generateFormulaBtn: "Calculate & Apply Secret Codes",
  },
};

const initialStudents = [
  {
    id: 202601,
    name: "ياسر بن محمد الرويلي",
    nameEn: "Yasser bin Mohammed Al-Ruwayli",
    grade: "الصف الأول",
    gradeEn: "Grade 1",
    section: "أ",
    sectionEn: "A",
    parentName: "محمد الرويلي",
    parentNameEn: "Mohammed Al-Ruwayli",
    parentNationalId: "1023948576",
    phone: "554129930",
    status: "present",
    time: "07:32",
    qrCode: "ANWAR-202601",
    photo: "👨‍🎓",
    parentPhoto: "🧔",
  },
  {
    id: 202602,
    name: "عبدالرحمن بن خالد العسيري",
    nameEn: "Abdulrahman bin Khalid Al-Asiri",
    grade: "الصف الثاني",
    gradeEn: "Grade 2",
    section: "ب",
    sectionEn: "B",
    parentName: "خالد العسيري",
    parentNameEn: "Khalid Al-Asiri",
    parentNationalId: "1098765432",
    phone: "542331908",
    status: "present",
    time: "07:42",
    qrCode: "ANWAR-202602",
    photo: "👦",
    parentPhoto: "🧔",
  },
  {
    id: 202603,
    name: "مازن بن فيصل الشمري",
    nameEn: "Mazen bin Faisal Al-Shammari",
    grade: "الصف الأول",
    gradeEn: "Grade 1",
    section: "أ",
    sectionEn: "A",
    parentName: "فيصل الشمري",
    parentNameEn: "Faisal Al-Shammari",
    parentNationalId: "1055443322",
    phone: "508129322",
    status: "present",
    time: "07:44",
    qrCode: "ANWAR-202603",
    photo: "🧑‍🎓",
    parentPhoto: "🧔",
  },
  {
    id: 202604,
    name: "عبدالعزيز بن عبدالله القحطاني",
    nameEn: "Abdulaziz bin Abdullah Al-Qahtani",
    grade: "الصف الثالث",
    gradeEn: "Grade 3",
    section: "أ",
    sectionEn: "A",
    parentName: "عبدالله القحطاني",
    parentNameEn: "Abdullah Al-Qahtani",
    parentNationalId: "1077665544",
    phone: "569940212",
    status: "absent",
    time: "--:--",
    qrCode: "ANWAR-202604",
    photo: "👨‍🎓",
    parentPhoto: "🧔",
  },
  {
    id: 202605,
    name: "سلطان بن عادل العتيبي",
    nameEn: "Sultan bin Adel Al-Otaibi",
    grade: "الصف الثاني",
    gradeEn: "Grade 2",
    section: "أ",
    sectionEn: "A",
    parentName: "عادل العتيبي",
    parentNameEn: "Adel Al-Otaibi",
    parentNationalId: "1011223344",
    phone: "531204481",
    status: "present",
    time: "07:28",
    qrCode: "ANWAR-202605",
    photo: "👦",
    parentPhoto: "🧔",
  },
  {
    id: 202606,
    name: "فهد بن محمد الرويلي",
    nameEn: "Fahad bin Mohammed Al-Ruwayli",
    grade: "الصف الثالث",
    gradeEn: "Grade 3",
    section: "ب",
    sectionEn: "B",
    parentName: "محمد الرويلي",
    parentNameEn: "Mohammed Al-Ruwayli",
    parentNationalId: "1023948576",
    phone: "554129930",
    status: "present",
    time: "07:40",
    qrCode: "ANWAR-202606",
    photo: "👦",
    parentPhoto: "🧔",
  },
];

const initialParentUsers = [
  {
    nationalId: "1023948576",
    name: "محمد الرويلي",
    nameEn: "Mohammed Al-Ruwayli",
    phone: "554129930",
    username: "1023948576",
    password: "parent_password123",
    photo: "🧔",
  },
  {
    nationalId: "1098765432",
    name: "خالد العسيري",
    nameEn: "Khalid Al-Asiri",
    phone: "542331908",
    username: "1098765432",
    password: "parent_password123",
    photo: "🧔",
  },
  {
    nationalId: "1055443322",
    name: "فيصل الشمري",
    nameEn: "Faisal Al-Shammari",
    phone: "508129322",
    username: "1055443322",
    password: "parent_password123",
    photo: "🧔",
  },
  {
    nationalId: "1077665544",
    name: "عبدالله القحطاني",
    nameEn: "Abdullah Al-Qahtani",
    phone: "569940212",
    username: "1077665544",
    password: "parent_password123",
    photo: "🧔",
  },
  {
    nationalId: "1011223344",
    name: "عادل العتيبي",
    nameEn: "Adel Al-Otaibi",
    phone: "531204481",
    username: "1011223344",
    password: "parent_password123",
    photo: "🧔",
  },
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
    address: "حي النزهة، الرياض",
    name: "الأستاذ فهد الهذلول",
    nameEn: "Mr. Fahad Al-Hathloul",
    subject: "الرياضيات",
    subjectEn: "Mathematics",
    subjects: ["الرياضيات"],
    classes: ["الصف الأول - أ", "الصف الثاني - أ"],
    teachingAssignments: [
      { subject: "الرياضيات", class: "الصف الأول - أ" },
      { subject: "الرياضيات", class: "الصف الثاني - أ" },
    ],
    gradesEntered: 55,
    assignments: 12,
    photo: "👨‍🏫",
    phone: "501111111",
  },
  {
    id: 102,
    jobId: "T102",
    address: "حي الملقا، الرياض",
    name: "الأستاذ سليمان الحربي",
    nameEn: "Mr. Sulaiman Al-Harbi",
    subject: "اللغة العربية",
    subjectEn: "Arabic Language",
    subjects: ["اللغة العربية"],
    classes: ["الصف الأول - أ", "الصف الثالث - أ"],
    teachingAssignments: [
      { subject: "اللغة العربية", class: "الصف الأول - أ" },
      { subject: "اللغة العربية", class: "الصف الثالث - أ" },
    ],
    gradesEntered: 62,
    assignments: 18,
    photo: "👨‍🏫",
    phone: "502222222",
  },
  {
    id: 103,
    jobId: "T103",
    address: "حي العليا، الرياض",
    name: "الأستاذ خالد الدوسري",
    nameEn: "Mr. Khalid Al-Dawsari",
    subject: "العلوم والفيزياء",
    subjectEn: "Science & Physics",
    subjects: ["العلوم والفيزياء"],
    classes: ["الصف الثاني - أ", "الصف الثاني - ب"],
    teachingAssignments: [
      { subject: "العلوم والفيزياء", class: "الصف الثاني - أ" },
      { subject: "العلوم والفيزياء", class: "الصف الثاني - ب" },
    ],
    gradesEntered: 48,
    assignments: 10,
    photo: "👨‍🏫",
    phone: "503333333",
  },
  {
    id: 104,
    jobId: "T104",
    address: "حي الربيع، الرياض",
    name: "الأستاذ أحمد الشريف",
    nameEn: "Mr. Ahmed Al-Sharif",
    subject: "اللغة الإنجليزية",
    subjectEn: "English Language",
    subjects: ["اللغة الإنجليزية"],
    classes: ["الصف الأول - أ", "الصف الثاني - ب", "الصف الثالث - أ"],
    teachingAssignments: [
      { subject: "اللغة الإنجليزية", class: "الصف الأول - أ" },
      { subject: "اللغة الإنجليزية", class: "الصف الثاني - ب" },
      { subject: "اللغة الإنجليزية", class: "الصف الثالث - أ" },
    ],
    gradesEntered: 58,
    assignments: 15,
    photo: "👨‍🏫",
    phone: "504444444",
  },
];

const initialSubjects = [
  { id: "sub-1", name: "الرياضيات", nameEn: "Mathematics" },
  { id: "sub-2", name: "اللغة العربية", nameEn: "Arabic Language" },
  { id: "sub-3", name: "العلوم والفيزياء", nameEn: "Science & Physics" },
  { id: "sub-4", name: "اللغة الإنجليزية", nameEn: "English Language" },
  { id: "sub-5", name: "التربية الإسلامية", nameEn: "Islamic Education" },
  { id: "sub-6", name: "التربية البدنية", nameEn: "Physical Education" },
  { id: "sub-7", name: "الرسم الفني", nameEn: "Art Education" },
];

const initialClasses = [
  {
    id: "cls-1",
    name: "الصف الأول - أ",
    nameEn: "Grade 1 - A",
    grade: "الصف الأول",
    gradeEn: "Grade 1",
    section: "أ",
    sectionEn: "A",
    subjects: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
  },
  {
    id: "cls-2",
    name: "الصف الأول - ب",
    nameEn: "Grade 1 - B",
    grade: "الصف الأول",
    gradeEn: "Grade 1",
    section: "ب",
    sectionEn: "B",
    subjects: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
    ],
  },
  {
    id: "cls-3",
    name: "الصف الثاني - أ",
    nameEn: "Grade 2 - A",
    grade: "الصف الثاني",
    gradeEn: "Grade 2",
    section: "أ",
    sectionEn: "A",
    subjects: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم والفيزياء",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
  },
  {
    id: "cls-4",
    name: "الصف الثاني - ب",
    nameEn: "Grade 2 - B",
    grade: "الصف الثاني",
    gradeEn: "Grade 2",
    section: "ب",
    sectionEn: "B",
    subjects: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم والفيزياء",
      "اللغة الإنجليزية",
    ],
  },
  {
    id: "cls-5",
    name: "الصف الثالث - أ",
    nameEn: "Grade 3 - A",
    grade: "الصف الثالث",
    gradeEn: "Grade 3",
    section: "أ",
    sectionEn: "A",
    subjects: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم والفيزياء",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
    ],
  },
];

const initialSchedule = {
  "الصف الأول - أ": {
    saturday: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    sunday: [
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    monday: [
      "التربية الإسلامية",
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    tuesday: [
      "العلوم",
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "الرسم الفني",
      "اللغة الإنجليزية",
    ],
    wednesday: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "نشاط حر",
    ],
  },
  "الصف الأول - ب": {
    saturday: [
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    sunday: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    monday: [
      "العلوم",
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    tuesday: [
      "التربية الإسلامية",
      "الرياضيات",
      "اللغة العربية",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    wednesday: [
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "نشاط حر",
    ],
  },
  "الصف الثاني - أ": {
    saturday: [
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    sunday: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    monday: [
      "العلوم",
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "الرسم الفني",
      "اللغة الإنجليزية",
    ],
    tuesday: [
      "التربية الإسلامية",
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    wednesday: [
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "التربية الإسلامية",
      "نشاط حر",
      "اللغة الإنجليزية",
    ],
  },
  "الصف الثاني - ب": {
    saturday: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    sunday: [
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    monday: [
      "التربية الإسلامية",
      "الرياضيات",
      "اللغة العربية",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    tuesday: [
      "العلوم",
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "الرسم الفني",
      "اللغة الإنجليزية",
    ],
    wednesday: [
      "الرياضيات",
      "اللغة العربية",
      "العلوم",
      "التربية الإسلامية",
      "نشاط حر",
      "اللغة الإنجليزية",
    ],
  },
  "الصف الثالث - أ": {
    saturday: [
      "العلوم",
      "اللغة العربية",
      "الرياضيات",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    sunday: [
      "اللغة العربية",
      "العلوم",
      "الرياضيات",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    monday: [
      "الرياضيات",
      "اللغة العربية",
      "التربية الإسلامية",
      "العلوم",
      "اللغة الإنجليزية",
      "التربية البدنية",
    ],
    tuesday: [
      "التربية الإسلامية",
      "اللغة العربية",
      "الرياضيات",
      "العلوم",
      "اللغة الإنجليزية",
      "الرسم الفني",
    ],
    wednesday: [
      "الرياضيات",
      "العلوم",
      "اللغة العربية",
      "التربية الإسلامية",
      "اللغة الإنجليزية",
      "نشاط حر",
    ],
  },
};

const initialGrades = [
  {
    studentId: 202601,
    name: "ياسر بن محمد الرويلي",
    nameEn: "Yasser bin Mohammed Al-Ruwayli",
    secretCode: "SEC-9102",
    math: 92,
    science: 88,
    arabic: 95,
    english: 90,
  },
  {
    studentId: 202602,
    name: "عبدالرحمن بن خالد العسيري",
    nameEn: "Abdulrahman bin Khalid Al-Asiri",
    secretCode: "SEC-4412",
    math: 74,
    science: 80,
    arabic: 78,
    english: 82,
  },
  {
    studentId: 202603,
    name: "مازن بن فيصل الشمري",
    nameEn: "Mazen bin Faisal Al-Shammari",
    secretCode: "SEC-3081",
    math: 85,
    science: 90,
    arabic: 82,
    english: 88,
  },
  {
    studentId: 202604,
    name: "عبدالعزيز بن عبدالله القحطاني",
    nameEn: "Abdulaziz bin Abdullah Al-Qahtani",
    secretCode: "SEC-5991",
    math: 50,
    science: 55,
    arabic: 62,
    english: 48,
  },
  {
    studentId: 202605,
    name: "سلطان بن عادل العتيبي",
    nameEn: "Sultan bin Adel Al-Otaibi",
    secretCode: "SEC-2311",
    math: 98,
    science: 96,
    arabic: 94,
    english: 95,
  },
];

const initialAbsenceRequests = [];

const initialAssignments = [
  {
    id: 501,
    grade: "الصف الأول",
    section: "أ",
    subjectName: "اللغة العربية",
    subjectNameEn: "Arabic Language",
    title: "حل واجب درس (حرف السين)",
    content:
      "كتابة حرف السين بالحركات الثلاث (سَ، سُ، سِ) في دفتر الواجب وحل صفحة ٣٢ في كتاب الطالب.",
    dateCreated: "2026-06-14",
    dueDate: "2026-06-17",
    attachments: ["arabic_letters_exercise.pdf"],
    submissions: [
      {
        studentId: 202601,
        studentName: "ياسر بن محمد الرويلي",
        status: "submitted",
        teacherNote: "أحسنت خطك جميل ومرتب يا ياسر!",
      },
      {
        studentId: 202603,
        studentName: "مازن بن فيصل الشمري",
        status: "notSubmitted",
        teacherNote: "",
      },
    ],
  },
  {
    id: 502,
    grade: "الصف الثاني",
    section: "أ",
    subjectName: "الرياضيات",
    subjectNameEn: "Mathematics",
    title: "جمع الأعداد المكونة من رقمين",
    content:
      "حل المسائل من ١ إلى ١٠ في كتاب التمارين صفحة ١٥، والتدرب على الجمع الذهني السريع.",
    dateCreated: "2026-06-15",
    dueDate: "2026-06-18",
    attachments: ["math_addition_worksheet.png"],
    submissions: [
      {
        studentId: 202605,
        studentName: "سلطان بن عادل العتيبي",
        status: "submittedLate",
        teacherNote: "ممتاز ولكن يرجى الالتزام بالموعد المحدد مستقبلاً",
      },
    ],
  },
];

const defaultDetailedGradeObj = (hw, att, beh, oral, wrt, final) => ({
  m1: {
    homework: hw,
    attendance: att,
    behavior: beh,
    oral: oral,
    written: wrt,
  },
  m2: {
    homework: Math.max(0, hw - 1),
    attendance: att,
    behavior: beh,
    oral: Math.max(0, oral - 1),
    written: Math.max(0, wrt - 2),
  },
  m3: {
    homework: hw,
    attendance: att,
    behavior: beh,
    oral: oral,
    written: wrt,
  },
  finalExam: final,
});

const initialDetailedGrades = [
  {
    studentId: 202601,
    studentName: "ياسر بن محمد الرويلي",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(14, 15, 10, 9, 48, 28),
        العلوم: defaultDetailedGradeObj(15, 15, 10, 10, 46, 27),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 49, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(13, 15, 9, 9, 44, 26),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(15, 15, 10, 10, 49, 29),
        العلوم: defaultDetailedGradeObj(14, 15, 10, 9, 47, 28),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(14, 14, 9, 10, 45, 27),
      },
    },
  },
  {
    studentId: 202602,
    studentName: "عبدالرحمن بن خالد العسيري",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(12, 13, 9, 8, 40, 24),
        العلوم: defaultDetailedGradeObj(13, 14, 9, 9, 42, 25),
        "اللغة العربية": defaultDetailedGradeObj(14, 15, 10, 9, 44, 27),
        "اللغة الإنجليزية": defaultDetailedGradeObj(11, 12, 8, 7, 38, 22),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(13, 14, 9, 8, 42, 25),
        العلوم: defaultDetailedGradeObj(14, 13, 9, 9, 41, 26),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 46, 28),
        "اللغة الإنجليزية": defaultDetailedGradeObj(12, 13, 8, 8, 39, 23),
      },
    },
  },
  {
    studentId: 202603,
    studentName: "مازن بن فيصل الشمري",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(15, 15, 10, 10, 49, 29),
        العلوم: defaultDetailedGradeObj(14, 15, 10, 9, 48, 29),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(14, 15, 10, 9, 46, 28),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        العلوم: defaultDetailedGradeObj(15, 15, 10, 10, 49, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 48, 29),
      },
    },
  },
  {
    studentId: 202604,
    studentName: "عبدالعزيز بن عبدالله القحطاني",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(8, 10, 7, 6, 28, 15),
        العلوم: defaultDetailedGradeObj(9, 11, 7, 7, 30, 16),
        "اللغة العربية": defaultDetailedGradeObj(10, 12, 8, 8, 32, 18),
        "اللغة الإنجليزية": defaultDetailedGradeObj(8, 9, 6, 6, 26, 14),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(9, 11, 7, 7, 30, 16),
        العلوم: defaultDetailedGradeObj(10, 12, 8, 7, 31, 17),
        "اللغة العربية": defaultDetailedGradeObj(11, 13, 8, 8, 34, 19),
        "اللغة الإنجليزية": defaultDetailedGradeObj(9, 10, 7, 7, 28, 15),
      },
    },
  },
  {
    studentId: 202605,
    studentName: "سلطان بن عادل العتيبي",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        العلوم: defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 49, 29),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        العلوم: defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
        "اللغة الإنجليزية": defaultDetailedGradeObj(15, 15, 10, 10, 50, 30),
      },
    },
  },
  {
    studentId: 202606,
    studentName: "فهد بن محمد الرويلي",
    grades: {
      term1: {
        الرياضيات: defaultDetailedGradeObj(13, 14, 9, 9, 43, 26),
        العلوم: defaultDetailedGradeObj(14, 14, 9, 9, 44, 26),
        "اللغة العربية": defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        "اللغة الإنجليزية": defaultDetailedGradeObj(12, 13, 9, 8, 41, 25),
      },
      term2: {
        الرياضيات: defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        العلوم: defaultDetailedGradeObj(14, 15, 10, 9, 45, 27),
        "اللغة العربية": defaultDetailedGradeObj(15, 15, 10, 10, 46, 28),
        "اللغة الإنجليزية": defaultDetailedGradeObj(13, 14, 9, 9, 42, 26),
      },
    },
  },
];

const initialNotifications = [];

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("active_tab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
  }, [activeTab]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal & Printing UI States
  const [showCardVisualizerModal, setShowCardVisualizerModal] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState("subject"); // 'month' | 'subject' | 'term'
  const [printSelectedMonth, setPrintSelectedMonth] = useState("m1"); // 'm1' | 'm2' | 'm3'
  const [selectedGradeStudentId, setSelectedGradeStudentId] = useState(202601);
  const [selectedGradeTerm, setSelectedGradeTerm] = useState("term1");
  const [selectedGradeSubject, setSelectedGradeSubject] = useState("الرياضيات");
  const [printStudentObject, setPrintStudentObject] = useState(null);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

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
    "تمهيدي أول",
    "تمهيدي ثاني",
    "الصف الأول",
    "الصف الثاني",
    "الصف الثالث",
    "الصف الرابع",
    "الصف الخامس",
    "الصف السادس",
    "الصف الأول المتوسط",
    "الصف الثاني المتوسط",
    "الصف الثالث المتوسط",
    "الصف الأول الثانوي",
    "الصف الثاني الثانوي",
    "الصف الثالث الثانوي",
  ]);
  const [availableSections, setAvailableSections] = useState([
    "أ",
    "ب",
    "ج",
    "د",
    "هـ",
    "و",
    "ز",
  ]);

  // Standalone parent accounts database
  const [parentUsers, setParentUsers] = useState(initialParentUsers);

  // New integrated features states
  const [absenceRequests, setAbsenceRequests] = useState(
    initialAbsenceRequests,
  );
  const [assignments, setAssignments] = useState(initialAssignments);
  const [detailedGrades, setDetailedGrades] = useState(initialDetailedGrades);
  const [examSchedules, setExamSchedules] = useState([]);
  const [tuitionFees, setTuitionFees] = useState({ baseFees: {}, payments: [] });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [teacherReports, setTeacherReports] = useState([]);

  // Vice Principals (Supervisors) state
  const [vicePrincipals, setVicePrincipals] = useState([]);

  // Permission helper: check if user has view access to a module
  const hasPermission = useCallback((module) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'supervisor') return false;
    const perms = currentUser.permissions;
    if (!perms) return false;
    if (perms.full_access) return true;
    if (!perms[module]) return false;
    const mp = perms[module];
    if (Array.isArray(mp) && !mp.actions) return mp.includes('view');
    if (mp.actions) return mp.actions.includes('view');
    return false;
  }, [currentUser]);

  // Permission helper: check if user can perform a specific action on a module
  const canAction = useCallback((module, action) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'supervisor') return false;
    const perms = currentUser.permissions;
    if (!perms) return false;
    if (perms.full_access) return true;
    if (!perms[module]) return false;
    const mp = perms[module];
    if (Array.isArray(mp) && !mp.actions) return mp.includes(action);
    if (mp.actions) return mp.actions.includes(action);
    return false;
  }, [currentUser]);

  const [toastMessage, setToastMessage] = useState("");

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
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] =
    useState(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    });

  // Attendance records (from backend / API)
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Digital Control states
  const [isGradesEncrypted, setIsGradesEncrypted] = useState(false);
  const [controlPrefix, setControlPrefix] = useState("SEC-");
  const [controlMultiplier, setControlMultiplier] = useState(3);
  const [controlOffset, setControlOffset] = useState(1000);
  const [controlModulo, setControlModulo] = useState(10000);

  const t = dictionary[lang];

  // Auto-login using saved Sanctum token
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
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
              photo: data.user.photo_url || "أ ع",
              email: null,
            };
            setCurrentUser(mappedUser);
          } else {
            localStorage.removeItem("auth_token");
          }
        })
        .catch((err) => {
          console.error("API Auto-Login error:", err);
        });
    }
  }, []);

  const fetchNotifications = (token) => {
    fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.notifications.map((notif) => {
            let type = "parents";
            if (notif.target_type === "by_class") type = "class";
            else if (notif.target_type === "by_student") type = "student";
            else if (notif.target_type === "specific_teacher") type = "teacher";

            let studentName = null;
            let studentNameEn = null;
            if (notif.target_type === "by_student" && notif.target_id) {
              const foundStudent = students.find(
                (s) => s.id === Number(notif.target_id),
              );
              if (foundStudent) {
                studentName = foundStudent.name;
                studentNameEn = foundStudent.nameEn;
              }
            }

            let teacherName = null;
            let teacherNameEn = null;
            if (notif.target_type === "specific_teacher" && notif.target_id) {
              const foundTeacher = teachers.find(
                (t) => t.id === Number(notif.target_id),
              );
              if (foundTeacher) {
                teacherName = foundTeacher.name;
                teacherNameEn = foundTeacher.nameEn;
              }
            }

            let gradeName = null;
            if (notif.target_type === "by_class" && notif.target_id) {
              const foundClass = classes.find(
                (c) =>
                  Number(String(c.id).replace("cls-", "")) ===
                  Number(notif.target_id),
              );
              if (foundClass) {
                gradeName = foundClass.name;
              }
            }

            return {
              id: notif.id,
              title: notif.title,
              content: notif.content,
              date: notif.created_at
                ? notif.created_at.substring(0, 16).replace("T", " ")
                : "",
              type: type,
              isRead: !!notif.is_read,
              studentId:
                notif.target_type === "by_student" ? notif.target_id : null,
              studentName: studentName,
              studentNameEn: studentNameEn,
              teacherId:
                notif.target_type === "specific_teacher"
                  ? notif.target_id
                  : null,
              teacherName: teacherName,
              teacherNameEn: teacherNameEn,
              grade: gradeName,
            };
          });
          setNotifications(mapped);
        }
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  };

  const fetchSubjects = (token) => {
    fetch("/api/subjects", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.subjects.map((sub) => ({
            id: `sub-${sub.id}`,
            name: sub.name_ar,
            nameEn: sub.name_en,
          }));
          setSubjects(mapped);
        }
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  };

  const fetchClasses = (token) => {
    fetch("/api/classes", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.classes.map((cls) => {
            const classSubjects = cls.subjects
              ? cls.subjects.map((sub) => sub.name_ar)
              : [];
            return {
              id: `cls-${cls.id}`,
              name: `${cls.grade_ar} - ${cls.section_ar}`,
              nameEn: `${cls.grade_en} - ${cls.section_en}`,
              grade: cls.grade_ar,
              gradeEn: cls.grade_en,
              section: cls.section_ar,
              sectionEn: cls.section_en,
              subjects: classSubjects,
            };
          });
          setClasses(mapped);

          // Update availableSections (merge with existing to prevent deletion)
          const dbSections = data.classes.map((c) => c.section_ar);
          if (dbSections.length > 0) {
            setAvailableSections((prev) => {
              const merged = new Set([...prev, ...dbSections]);
              return Array.from(merged);
            });
          }
        }
      })
      .catch((err) => console.error("Error fetching classes:", err));
  };

  const fetchStudents = (token) => {
    fetch("/api/students", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.students.map((st) => ({
            id: Number(st.id),
            name: st.name_ar,
            nameEn: st.name_en,
            grade: st.grade,
            gradeEn: st.gradeEn,
            section: st.section,
            sectionEn: st.sectionEn,
            parentName: st.parentName,
            parentNameEn: st.parentNameEn,
            parentNationalId: st.parentNationalId,
            phone: st.phone,
            status: st.status,
            time: st.time,
            qrCode: st.qrCode,
            photo: st.photo,
            parentPhoto: "🧔",
          }));
          setStudents(mapped);
        }
      })
      .catch((err) => console.error("Error fetching students:", err));
  };

  const fetchParents = (token) => {
    fetch("/api/parents", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.parents.map((p) => ({
            id: p.id,
            nationalId: p.national_id,
            name: p.name_ar || p.name,
            nameEn: p.name_en || p.name,
            phone: p.phone,
            username: p.username,
            password: "parent_password123",
            photo: p.photo_url || "🧔",
          }));
          setParentUsers(mapped);
        }
      })
      .catch((err) => console.error("Error fetching parents:", err));
  };

  const fetchAttendance = (token) => {
    fetch("/api/attendance", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.attendance.map((rec) => ({
            id: rec.id,
            studentId: Number(rec.student_id),
            date: rec.record_date,
            status: rec.status,
            time: rec.arrival_time ? rec.arrival_time.substring(0, 5) : "--:--",
          }));
          setAttendanceRecords(mapped);
        }
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  };

  const fetchAbsenceRequests = (token) => {
    fetch("/api/absence-requests", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.absence_requests.map((req) => {
            const studentName = req.student ? req.student.name_ar : "";
            const className = req.student && req.student.school_class
              ? `${req.student.school_class.grade_ar} - ${req.student.school_class.section_ar}`
              : "";
            return {
              id: req.id,
              studentId: Number(req.student_id),
              studentName: studentName,
              className: className,
              requestedDate: req.requested_date || req.start_date,
              reason: req.reason_ar,
              reasonEn: req.reason_en,
              status: req.status,
              attachment: req.attachment_url,
              adminNote: req.admin_note_ar,
              adminNoteEn: req.admin_note_en,
            };
          });
          setAbsenceRequests(mapped);
        }
      })
      .catch((err) => console.error("Error fetching absence requests:", err));
  };

  const fetchControlGrades = (token) => {
    fetch("/api/grades/control", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.control_grades.map((g) => ({
            studentId: Number(g.student_id),
            name: g.student ? g.student.name_ar : "",
            nameEn: g.student ? g.student.name_en : "",
            secretCode: g.secret_code || "",
            math: g.math !== null ? Number(g.math) : null,
            science: g.science !== null ? Number(g.science) : null,
            arabic: g.arabic !== null ? Number(g.arabic) : null,
            english: g.english !== null ? Number(g.english) : null,
          }));
          setGrades(mapped);
        }
      })
      .catch((err) => console.error("Error fetching control grades:", err));
  };

  const fetchFinanceData = (token) => {
    fetch("/api/finance/students", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const allPayments = [];
          data.students_fees.forEach((rec) => {
            if (rec.payments) {
              rec.payments.forEach((p) => {
                allPayments.push({
                  id: p.id,
                  studentId: Number(p.student_id),
                  amount: Number(p.amount),
                  paymentDate: p.payment_date,
                  referenceNo: p.reference_no,
                  status: "completed",
                });
              });
            }
          });

          setTuitionFees({
            baseFees: {
              "الصف الأول": 5000,
              "الصف الثاني": 5500,
              "الصف الثالث": 6000,
            },
            payments: allPayments,
          });
        }
      })
      .catch((err) => console.error("Error fetching finance data:", err));
  };

  const fetchDashboardStats = (token) => {
    fetch("/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDashboardStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err));
  };

  const fetchWeeklySchedules = (token) => {
    fetch("/api/schedules", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schedules && Object.keys(data.schedules).length > 0) {
          setSchedules(data.schedules);
        }
      })
      .catch((err) => console.error("Error fetching weekly schedules:", err));
  };

  const fetchTeacherReports = (token) => {
    fetch("/api/reports", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTeacherReports(data.reports);
        }
      })
      .catch((err) => console.error("Error fetching teacher reports:", err));
  };

  const fetchAssignments = (token) => {
    fetch("/api/assignments", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.assignments.map((ass) => {
            const classObj = ass.school_class || {};
            const subjObj = ass.subject || {};
            const subs = (ass.submissions || []).map((sub) => {
              let status = "notSubmitted";
              if (sub.status === "submitted") status = "submitted";
              else if (sub.status === "submitted_late") status = "submittedLate";
              else if (sub.status === "not_submitted") status = "notSubmitted";
              return {
                studentId: Number(sub.student_id),
                studentName: sub.student ? sub.student.name_ar : "",
                status: status,
                teacherNote: sub.teacher_note || "",
              };
            });

            return {
              id: ass.id,
              grade: classObj.grade_ar || "",
              section: classObj.section_ar || "",
              subjectName: subjObj.name_ar || "",
              subjectNameEn: subjObj.name_en || "",
              title: ass.title,
              content: ass.content || "",
              dateCreated: ass.date_created,
              dueDate: ass.due_date,
              attachments: ass.attachment_url ? [ass.attachment_url] : [],
              submissions: subs,
            };
          });
          setAssignments(mapped);
        }
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  };

  const fetchExamSchedules = (token) => {
    fetch("/api/exam-schedules", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.exam_schedules.map((sch) => {
            const classObj = sch.class || {};
            const subs = (sch.subjects || []).map((sub) => ({
              id: sub.id,
              subjectName: sub.name_ar,
              date: sub.exam_date,
              time: sub.exam_time,
              note: sub.note || "",
            }));

            return {
              id: sch.id,
              grade: classObj.grade_ar || "",
              section: classObj.section_ar || "",
              term: sch.term === "term1" ? "الفصل الأول" : (sch.term === "term2" ? "الفصل الثاني" : sch.term),
              termEn: sch.term === "term1" ? "First Term" : (sch.term === "term2" ? "Second Term" : sch.term),
              period: sch.title,
              periodEn: sch.title,
              subjects: subs,
            };
          });
          setExamSchedules(mapped);
        }
      })
      .catch((err) => console.error("Error fetching exam schedules:", err));
  };

  const fetchTeachers = (token) => {
    fetch("/api/teachers", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mapped = data.teachers.map((t) => {
            const classNames = [];
            const subjectNames = [];
            const teachingAssignments = [];

            if (t.assignments) {
              t.assignments.forEach((assign) => {
                const className = assign.school_class
                  ? assign.school_class.name_ar || assign.school_class.name
                  : "";
                const subjectName = assign.subject
                  ? assign.subject.name_ar || assign.subject.name
                  : "";

                if (className && !classNames.includes(className)) {
                  classNames.push(className);
                }
                if (subjectName && !subjectNames.includes(subjectName)) {
                  subjectNames.push(subjectName);
                }
                if (className && subjectName) {
                  teachingAssignments.push({
                    subject: subjectName,
                    class: className,
                  });
                }
              });
            }

            return {
              id: t.id,
              jobId: t.job_id,
              phone: t.phone || "",
              address: t.address || "",
              name: t.name_ar || t.name_en || "",
              nameEn: t.name_en || t.name_ar || "",
              subject: subjectNames.join("، "),
              subjectEn: subjectNames.join(", "),
              subjects: subjectNames,
              classes: classNames,
              teachingAssignments: teachingAssignments,
              gradesEntered: t.grades_entered || 0,
              assignments: t.assignments_count || 0,
              photo: t.photo_url || "👨‍🏫",
            };
          });
          setTeachers(mapped);
        }
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  };
  const fetchSupervisors = (token) => {
    fetch("/api/supervisors", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSupervisors(data.supervisors);
        }
      })
      .catch((err) => console.error("Error fetching supervisors:", err));
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        fetchNotifications(token);
        fetchTeachers(token);
        fetchSupervisors(token);
        fetchSubjects(token);
        fetchClasses(token);
        fetchStudents(token);
        fetchParents(token);
        fetchAttendance(token);
        fetchAbsenceRequests(token);
        fetchControlGrades(token);
        fetchAssignments(token);
        fetchExamSchedules(token);
        fetchFinanceData(token);
        fetchDashboardStats(token);
        fetchWeeklySchedules(token);
        fetchTeacherReports(token);
      }
    }
  }, [isAuthenticated]);

  // Load detailed grades dynamically for the selected student
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && selectedGradeStudentId) {
      fetch(`/api/grades/detailed/${selectedGradeStudentId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const gradesMap = {
              term1: {
                الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              },
              term2: {
                الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
                "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              },
            };

            data.grades.forEach((g) => {
              const termKey = g.term; // 'term1' or 'term2'
              const subjName = g.subject ? g.subject.name_ar : null;
              if (subjName && gradesMap[termKey] && gradesMap[termKey][subjName]) {
                const monthKey = g.month; // 'm1', 'm2', 'm3', or 'final'
                if (monthKey === 'final') {
                  gradesMap[termKey][subjName].finalExam = Number(g.final_exam) || 0;
                } else if (gradesMap[termKey][subjName][monthKey]) {
                  gradesMap[termKey][subjName][monthKey] = {
                    homework: Number(g.hw_grade) || 0,
                    attendance: Number(g.att_grade) || 0,
                    behavior: Number(g.beh_grade) || 0,
                    oral: Number(g.oral_grade) || 0,
                    written: Number(g.wrt_grade) || 0,
                  };
                }
              }
            });

            setDetailedGrades((prev) => {
              const filtered = prev.filter(item => item.studentId !== selectedGradeStudentId);
              const student = students.find(s => s.id === selectedGradeStudentId);
              return [
                ...filtered,
                {
                  studentId: selectedGradeStudentId,
                  studentName: student ? student.name : "",
                  grades: gradesMap,
                }
              ];
            });
          }
        })
        .catch((err) => console.error("Error fetching detailed grades:", err));
    }
  }, [selectedGradeStudentId, isAuthenticated, students]);

  // Set html page direction
  useEffect(() => {
    document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  // Set dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showNotificationsDropdown &&
        !e.target.closest(".notifications-dropdown-container") &&
        !e.target.closest(".notifications-btn")
      ) {
        setShowNotificationsDropdown(false);
      }
      if (
        showProfileDropdown &&
        !e.target.closest(".profile-dropdown-container") &&
        !e.target.closest(".profile-btn")
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showNotificationsDropdown, showProfileDropdown]);

  // Auto trigger absent parent SMS log alert after 10 AM (simulated)
  useEffect(() => {
    const triggerAbsentAlerts = () => {
      const absents = students.filter((s) => s.status === "absent");
      absents.forEach((student) => {
        // Send SMS to parents if not already sent
        const alreadySent = smsLogs.some(
          (log) => log.studentId === student.id && log.type === "absent",
        );
        if (!alreadySent) {
          const smsText =
            lang === "ar"
              ? `نفيدكم بأن ابنكم ${student.name} غائب عن المدرسة اليوم الأحد. رياض و مدارس انوار العلى الدولية النموذجية.`
              : `We inform you that your son ${student.nameEn} is absent from school today. Riyadh & Anwar Al-Ola International Model Schools.`;

          const newSms = {
            id: Date.now() + student.id,
            studentId: student.id,
            recipient: `+967 ${student.phone}`,
            text: smsText,
            time: "10:00",
            type: "absent",
          };
          setSmsLogs((prev) => [newSms, ...prev]);
        }
      });
    };

    const timer = setTimeout(triggerAbsentAlerts, 2000);
    return () => clearTimeout(timer);
  }, [students, lang, smsLogs]);

  // Render photo utility helper
  const renderAvatar = (photo, defaultEmoji) => {
    if (photo && typeof photo === "string") {
      let resolvedPhoto = photo;
      if (photo.includes("/uploads/avatars/")) {
        const index = photo.indexOf("/uploads/avatars/");
        resolvedPhoto = photo.substring(index);
      }
      if (
        resolvedPhoto.startsWith("data:") ||
        resolvedPhoto.startsWith("http") ||
        resolvedPhoto.startsWith("/")
      ) {
        return (
          <img
            src={resolvedPhoto}
            alt="Avatar"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover",
              verticalAlign: "middle",
              marginInlineEnd: "8px",
            }}
          />
        );
      }
    }
    return (
      <span
        style={{
          fontSize: "18px",
          marginInlineEnd: "8px",
          verticalAlign: "middle",
        }}
      >
        {photo || defaultEmoji}
      </span>
    );
  };

  const handleAddStudentAction = (newStudent, newGradeRow, newParentObj) => {
    const token = localStorage.getItem("auth_token");
    
    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === newStudent.grade && c.section === newStudent.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;
    
    const saveStudent = (parentId) => {
      if (!classId || !parentId) {
        console.error("Missing classId or parentId", { classId, parentId });
        return;
      }
      
      if (token) {
        fetch("/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_code: newStudent.qrCode,
            name_ar: newStudent.name,
            name_en: newStudent.nameEn,
            class_id: classId,
            parent_id: parentId,
            photo_url: newStudent.photo,
            qr_code: newStudent.qrCode,
            secret_code: newGradeRow.secretCode,
            tuition_fee: Number(newStudent.tuitionFee || 10000),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              // Update local state with the returned student (including database ID)
              const addedStudent = {
                ...newStudent,
                id: Number(data.student.id),
                tuition_fee: Number(data.student.tuition_fee || newStudent.tuitionFee || 10000),
              };
              setStudents((prev) => [...prev, addedStudent]);
              
              // Also update grades array
              const addedGrade = {
                ...newGradeRow,
                studentId: Number(data.student.id),
              };
              setGrades((prev) => [...prev, addedGrade]);
              
              setToastMessage(t.successToast);
              setTimeout(() => setToastMessage(""), 4000);
            } else {
              setToastMessage(lang === "ar" ? "فشل إضافة الطالب في قاعدة البيانات" : "Failed to add student to database");
              setTimeout(() => setToastMessage(""), 4000);
            }
          })
          .catch((err) => {
            console.error("Error storing student:", err);
          });
      } else {
        // Fallback for mock environment
        setStudents((prev) => [...prev, newStudent]);
        setGrades((prev) => [...prev, newGradeRow]);
        setToastMessage(t.successToast);
        setTimeout(() => setToastMessage(""), 4000);
      }
    };

    if (newParentObj) {
      if (token) {
        // First create parent on backend
        fetch("/api/parents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            national_id: newParentObj.nationalId,
            name_ar: newParentObj.name,
            name_en: newParentObj.nameEn,
            phone: newParentObj.phone,
            photo_url: newParentObj.photo,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              const createdParentId = data.parent.id;
              const mappedParent = {
                ...newParentObj,
                id: createdParentId,
              };
              setParentUsers((prev) => [...prev, mappedParent]);
              
              // Now save student with the created parent's ID
              saveStudent(createdParentId);
            } else {
              setToastMessage(lang === "ar" ? "فشل إضافة ولي الأمر في قاعدة البيانات" : "Failed to add parent to database");
              setTimeout(() => setToastMessage(""), 4000);
            }
          })
          .catch((err) => {
            console.error("Error storing parent:", err);
          });
      } else {
        // Fallback
        setParentUsers((prev) => [...prev, newParentObj]);
        saveStudent(newStudent.id); // temporary mockup ID
      }
    } else {
      // Parent already exists, find backend ID
      const existingParent = parentUsers.find(p => p.nationalId === newStudent.parentNationalId);
      if (existingParent && existingParent.id) {
        saveStudent(existingParent.id);
      } else {
        // Fallback or missing parent ID mapping
        console.error("Existing parent database ID not found");
        saveStudent(1); // default fallback
      }
    }
  };

  const handleAddTeacherAction = (newTeacher) => {
    const token = localStorage.getItem("auth_token");
    setTeachers((prev) => [...prev, newTeacher]);
    setToastMessage(
      lang === "ar" ? "تم تسجيل المعلم بنجاح!" : "Teacher added successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);

    if (token) {
      // Find subject_id and class_id from names
      const apiAssignments = newTeacher.teachingAssignments.map(a => {
        const sub = subjects.find(s => s.name === a.subject);
        const cls = classes.find(c => c.name === a.class);
        let subjectId = sub?.id;
        if (subjectId && typeof subjectId === 'string' && subjectId.startsWith('sub-')) {
          subjectId = parseInt(subjectId.replace('sub-', ''), 10);
        }
        let classId = cls?.id;
        if (classId && typeof classId === 'string' && classId.startsWith('cls-')) {
          classId = parseInt(classId.replace('cls-', ''), 10);
        }
        return { subject_id: subjectId, class_id: classId };
      }).filter(a => a.subject_id && a.class_id);

      fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          job_id: newTeacher.jobId,
          name_ar: newTeacher.name,
          name_en: newTeacher.nameEn,
          phone: newTeacher.phone,
          address: newTeacher.address,
          photo_url: newTeacher.photo,
          assignments: apiAssignments,
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchTeachers(token);
        } else {
          console.error("Failed to save teacher:", data.message);
        }
      })
      .catch(err => console.error("Error saving teacher:", err));
    }
  };

  const handleAddParentAction = (newParent) => {
    setParentUsers((prev) => [...prev, newParent]);
    setToastMessage(
      lang === "ar"
        ? "تم تسجيل حساب ولي الأمر بنجاح!"
        : "Parent account registered successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleEditParentAction = (
    updatedParent,
    linkedNameSync,
    parentNationalId,
  ) => {
    setParentUsers((prev) =>
      prev.map((p) => (p.nationalId === parentNationalId ? updatedParent : p)),
    );
    setStudents((prev) =>
      prev.map((s) => {
        if (s.parentNationalId === parentNationalId) {
          return {
            ...s,
            parentName: updatedParent.name,
            parentNameEn: updatedParent.nameEn,
            phone: updatedParent.phone,
          };
        }
        return s;
      }),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!"
        : "Parent account details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleEditTeacherAction = (updatedTeacher, teacherId) => {
    const token = localStorage.getItem("auth_token");
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? updatedTeacher : t)),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث بيانات المعلم بنجاح!"
        : "Teacher details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 4000);

    if (token) {
      const apiAssignments = (updatedTeacher.teachingAssignments || []).map(a => {
        const sub = subjects.find(s => s.name === a.subject);
        const cls = classes.find(c => c.name === a.class);
        let subjectId = sub?.id;
        if (subjectId && typeof subjectId === 'string' && subjectId.startsWith('sub-')) {
          subjectId = parseInt(subjectId.replace('sub-', ''), 10);
        }
        let classId = cls?.id;
        if (classId && typeof classId === 'string' && classId.startsWith('cls-')) {
          classId = parseInt(classId.replace('cls-', ''), 10);
        }
        return { subject_id: subjectId, class_id: classId };
      }).filter(a => a.subject_id && a.class_id);

      fetch(`/api/teachers/${teacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          name_ar: updatedTeacher.name,
          name_en: updatedTeacher.nameEn,
          phone: updatedTeacher.phone,
          address: updatedTeacher.address,
          photo_url: updatedTeacher.photo,
          assignments: apiAssignments,
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchTeachers(token);
        } else {
          console.error("Failed to update teacher:", data.message);
        }
      })
      .catch(err => console.error("Error updating teacher:", err));
    }
  };

  const handleAddSupervisorAction = (newSupervisor) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => [...prev, newSupervisor]);
    setToastMessage(lang === 'ar' ? 'تم تسجيل مشرف التحضير بنجاح!' : 'Prep supervisor added successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      fetch("/api/supervisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          jobId: newSupervisor.jobId,
          name: newSupervisor.name,
          phone: newSupervisor.phone,
          password: newSupervisor.password,
          classes: newSupervisor.classes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSupervisors(prev => prev.map(s => s.jobId === newSupervisor.jobId ? data.supervisor : s));
        } else {
          console.error("Failed to save supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error saving supervisor:", err));
    }
  };

  const handleEditSupervisorAction = (updatedSupervisor, supervisorId) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => prev.map(s => s.id === supervisorId ? updatedSupervisor : s));
    setToastMessage(lang === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor details updated successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      fetch(`/api/supervisors/${supervisorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          jobId: updatedSupervisor.jobId,
          name: updatedSupervisor.name,
          phone: updatedSupervisor.phone,
          password: updatedSupervisor.password !== "teacher_password123" ? updatedSupervisor.password : undefined,
          classes: updatedSupervisor.classes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to update supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error updating supervisor:", err));
    }
  };

  const handleDeleteSupervisorAction = (supervisorId) => {
    const token = localStorage.getItem("auth_token");
    setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
    setToastMessage(lang === 'ar' ? 'تم حذف المشرف بنجاح!' : 'Supervisor deleted successfully!');
    setTimeout(() => setToastMessage(''), 4000);

    if (token) {
      fetch(`/api/supervisors/${supervisorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to delete supervisor:", data.message);
        }
      })
      .catch(err => console.error("Error deleting supervisor:", err));
    }
  };

  const handleAddClassAction = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
    setToastMessage(
      lang === "ar"
        ? "تمت إضافة الفصل الدراسي بنجاح!"
        : "Class created successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEditClassAction = (updatedClass, classId) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? updatedClass : c)),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث بيانات الفصل بنجاح!"
        : "Class details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteClassAction = (id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setToastMessage(
      lang === "ar" ? "تم حذف الفصل بنجاح" : "Class deleted successfully",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSubjectAction = (newSubject, classesListToUpdate) => {
    setSubjects((prev) => [...prev, newSubject]);
    setClasses((prev) =>
      prev.map((c) => {
        if (classesListToUpdate.includes(c.name)) {
          if (!c.subjects.includes(newSubject.name)) {
            return { ...c, subjects: [...c.subjects, newSubject.name] };
          }
        } else {
          return {
            ...c,
            subjects: c.subjects.filter((s) => s !== newSubject.name),
          };
        }
        return c;
      }),
    );
    setToastMessage(
      lang === "ar"
        ? "تمت إضافة المادة بنجاح!"
        : "Subject created successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEditSubjectAction = (
    updatedSubject,
    subjectId,
    oldName,
    newName,
    classesListToUpdate,
  ) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? updatedSubject : s)),
    );
    setClasses((prev) =>
      prev.map((c) => {
        let classSubjects = c.subjects;
        if (classesListToUpdate.includes(c.name)) {
          if (classSubjects.includes(oldName)) {
            classSubjects = classSubjects.map((s) =>
              s === oldName ? newName : s,
            );
          } else {
            classSubjects = [...classSubjects, newName];
          }
        } else {
          classSubjects = classSubjects.filter(
            (s) => s !== oldName && s !== newName,
          );
        }
        return { ...c, subjects: classSubjects };
      }),
    );
    setTeachers((prev) =>
      prev.map((t) => {
        let tSubs = t.subjects || [];
        if (tSubs.includes(oldName)) {
          tSubs = tSubs.map((s) => (s === oldName ? newName : s));
        }
        const tSub = t.subject === oldName ? newName : t.subject;
        return { ...t, subject: tSub, subjects: tSubs };
      }),
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث المادة بنجاح!"
        : "Subject details updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteSubjectAction = (id, subName) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        subjects: c.subjects.filter((s) => s !== subName),
      })),
    );
    setToastMessage(
      lang === "ar" ? "تم حذف المادة بنجاح" : "Subject deleted successfully",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddGradeAction = (gradeName) => {
    setAvailableGrades((prev) => [...prev, gradeName]);
    setToastMessage(
      lang === "ar"
        ? `تمت إضافة الصف الدراسي: ${gradeName}`
        : `Grade level added: ${gradeName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemoveGradeAction = (gradeName) => {
    setAvailableGrades((prev) => prev.filter((g) => g !== gradeName));
    setToastMessage(
      lang === "ar"
        ? `تم حذف الصف الدراسي: ${gradeName}`
        : `Grade level removed: ${gradeName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSectionAction = (sectionInput) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز'];
    const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const secMap = {
      'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G',
      'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د', 'E': 'هـ', 'F': 'و', 'G': 'ز'
    };

    if (availableSections.length >= 7) {
      setToastMessage(
        lang === "ar"
          ? "عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!"
          : "Sorry, you cannot add more than 7 class sections!"
      );
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    let targetSection = "";
    const trimmedInput = (sectionInput || "").trim().toUpperCase();

    if (!trimmedInput) {
      // Auto-name: find the first unused letter from arabicLetters
      targetSection = arabicLetters.find(l => !availableSections.includes(l));
      if (!targetSection) {
        setToastMessage(
          lang === "ar"
            ? "عذراً، لا يمكن إضافة أكثر من 7 شعب دراسية!"
            : "Sorry, you cannot add more than 7 class sections!"
        );
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }
    } else {
      // User typed something
      if (englishLetters.includes(trimmedInput)) {
        targetSection = secMap[trimmedInput];
      } else if (arabicLetters.includes(trimmedInput)) {
        targetSection = trimmedInput;
      } else {
        targetSection = trimmedInput.slice(0, 2);
      }

      if (availableSections.includes(targetSection)) {
        setToastMessage(
          lang === "ar"
            ? `الشعبة "${targetSection}" مضافة بالفعل!`
            : `Section "${targetSection}" is already added!`
        );
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }
    }

    setAvailableSections((prev) => [...prev, targetSection]);
    const displayVal = lang === "ar" ? targetSection : (secMap[targetSection] || targetSection);
    setToastMessage(
      lang === "ar"
        ? `تمت إضافة الشعبة: ${displayVal}`
        : `Section added: ${displayVal}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemoveSectionAction = (sectionName) => {
    setAvailableSections((prev) => prev.filter((s) => s !== sectionName));
    setToastMessage(
      lang === "ar"
        ? `تم حذف الشعبة: ${sectionName}`
        : `Section removed: ${sectionName}`,
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleManualAttendanceChangeAction = (
    studentId,
    newStatus,
    rosterDate,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "08:00"
                  : "--:--",
          };
        }
        return s;
      }),
    );

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === rosterDate,
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: newStatus };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId,
            date: rosterDate,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "08:00"
                  : "--:--",
          },
        ];
      }
    });

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (newStatus === "absent") {
      const hasExcuse = absenceRequests.some(
        (r) =>
          r.studentId === studentId &&
          r.requestedDate === rosterDate &&
          r.status === "approved",
      );
      const smsText = hasExcuse
        ? lang === "ar"
          ? `سعادة ولي أمر الطالب ${student.name}: تم تسجيل ابنكم غائباً بعذر مقبول لهذا اليوم ${rosterDate}.`
          : `Dear parent of ${student.nameEn}: Your child has been marked as absent (excused) for today ${rosterDate}.`
        : lang === "ar"
          ? `عاجل من رياض و مدارس انوار العلى: نفيدكم بغياب ابنكم ${student.name} اليوم ${rosterDate} دون عذر مسبق. يرجى التواصل مع الإدارة.`
          : `Urgent from Riyadh & Anwar Al-Ola International Model Schools: Your child ${student.nameEn} is absent today ${rosterDate} without an excuse. Please contact administration.`;

      const newSms = {
        id: Date.now(),
        studentId: studentId,
        studentName: student.name,
        phone: student.phone,
        message: smsText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSmsLogs((prev) => [newSms, ...prev]);
    }

    setToastMessage(
      lang === "ar"
        ? "تم تحديث حالة حضور الطالب بنجاح!"
        : "Attendance status updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleManualAttendanceNoteChangeAction = (studentId, noteText) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, attendanceNote: noteText } : s,
      ),
    );
  };

  const handleCellAttendanceChangeAction = (
    studentId,
    date,
    newStatus,
    rosterDate,
  ) => {
    const token = localStorage.getItem("auth_token");

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === date,
      );
      if (existingIdx > -1) {
        if (!newStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: newStatus };
        return updated;
      } else {
        if (!newStatus) return prev;
        return [
          ...prev,
          {
            studentId,
            date,
            status: newStatus,
            time:
              newStatus === "present"
                ? "07:30"
                : newStatus === "late"
                  ? "07:55"
                  : "--:--",
          },
        ];
      }
    });

    if (date === rosterDate) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              status: newStatus || "absent",
              time:
                newStatus === "present"
                  ? "07:30"
                  : newStatus === "late"
                    ? "07:55"
                    : "--:--",
            };
          }
          return s;
        }),
      );
    }

    if (token && newStatus) {
      fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: Number(studentId),
          date: date,
          status: newStatus === "late" ? "present" : newStatus,
          arrival_time: newStatus === "present" ? "07:30:00" : (newStatus === "late" ? "07:55:00" : null),
          note: "تم التعديل يدوياً من لوحة الإدارة",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error("Failed to sync attendance to backend:", data.message);
          }
        })
        .catch((err) => console.error("Error syncing attendance:", err));
    }
  };

  const handleToggleDayAttendanceAction = (
    studentId,
    dateStr,
    currentStatus,
  ) => {
    let nextStatus = "present";
    if (currentStatus) {
      if (currentStatus === "present") nextStatus = "absent";
      else if (currentStatus === "absent") nextStatus = null;
    }

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === dateStr,
      );
      if (existingIdx > -1) {
        if (!nextStatus) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: nextStatus };
        return updated;
      } else {
        if (!nextStatus) return prev;
        return [
          ...prev,
          {
            studentId,
            date: dateStr,
            status: nextStatus,
            time:
              nextStatus === "present"
                ? "07:30"
                : nextStatus === "late"
                  ? "07:55"
                  : "--:--",
          },
        ];
      }
    });
  };

  const calculateStudentStats = useCallback(
    (studentId) => {
      const records = attendanceRecords.filter(
        (r) =>
          r.studentId === studentId &&
          r.date.startsWith(selectedAttendanceMonth),
      );
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;
      return { total, present, late: 0, absent, rate };
    },
    [attendanceRecords, selectedAttendanceMonth],
  );

  const handleAbsenceDecisionAction = (requestId, newStatus, adminNoteText) => {
    const token = localStorage.getItem("auth_token");

    setAbsenceRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if (newStatus === "approved") {
            setStudents((studs) =>
              studs.map((s) => {
                if (s.id === req.studentId) {
                  return { ...s, status: "present", time: "07:30" };
                }
                return s;
              }),
            );
            const student = students.find((s) => s.id === req.studentId);
            const smsText =
              lang === "ar"
                ? `نفيدكم بقبول طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate} وتم اعتماده بعذر.`
                : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is approved.`;
            setSmsLogs((logs) => [
              {
                id: Date.now(),
                studentId: req.studentId,
                recipient: `+967 ${student?.phone}`,
                text: smsText,
                time: "08:30",
                type: "present",
              },
              ...logs,
            ]);
          } else if (newStatus === "rejected") {
            const student = students.find((s) => s.id === req.studentId);
            const smsText =
              lang === "ar"
                ? `نفيدكم برفض طلب الغياب المقدم للابن ${student?.name} لتاريخ ${req.requestedDate}. ملاحظة الإدارة: ${adminNoteText || "الرجاء التواصل معنا"}`
                : `Leave request for your son ${student?.nameEn} on ${req.requestedDate} is rejected. Admin Note: ${adminNoteText || "Contact admin"}`;
            setSmsLogs((logs) => [
              {
                id: Date.now(),
                studentId: req.studentId,
                recipient: `+967 ${student?.phone}`,
                text: smsText,
                time: "08:30",
                type: "absent",
              },
              ...logs,
            ]);
          }
          return {
            ...req,
            status: newStatus,
            adminNote:
              adminNoteText ||
              (newStatus === "approved"
                ? "تمت الموافقة بعذر مقبول"
                : "مرفوض لعدم اكتمال المبررات"),
            adminNoteEn:
              adminNoteText ||
              (newStatus === "approved"
                ? "Approved with excuse"
                : "Rejected due to insufficient details"),
          };
        }
        return req;
      }),
    );
    setToastMessage(
      newStatus === "approved" ? t.approvedNoteToast : t.rejectedNoteToast,
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      const action = newStatus === "approved" ? "approve" : "reject";
      const endpoint = `/api/absence-requests/${requestId}/${action}`;
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admin_note_ar: adminNoteText,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            fetchAbsenceRequests(token);
            if (newStatus === "approved") {
              fetchAttendance(token);
            }
          } else {
            console.error("Failed to update leave request status:", data.message);
          }
        })
        .catch((err) => console.error("Error updating absence decision:", err));
    }
  };

  const handleAddAssignmentAction = (newAssignment, matchingTeacherId) => {
    setAssignments((prev) => [newAssignment, ...prev]);
    if (matchingTeacherId) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === matchingTeacherId
            ? { ...t, assignments: t.assignments + 1 }
            : t,
        ),
      );
    }
    setToastMessage(t.assignmentSuccessToast);
    setTimeout(() => setToastMessage(""), 3000);

    const classStudents = students.filter(
      (s) =>
        s.grade === newAssignment.grade && s.section === newAssignment.section,
    );
    classStudents.forEach((student) => {
      const smsText =
        lang === "ar"
          ? `تم نشر واجب جديد للمادة ${newAssignment.subjectName}: "${newAssignment.title}". موعد التسليم: ${newAssignment.dueDate}. رياض و مدارس انوار العلى.`
          : `New homework assignment published for ${newAssignment.subjectName}: "${newAssignment.title}". Due: ${newAssignment.dueDate}. Riyadh & Anwar Al-Ola.`;
      setSmsLogs((logs) => [
        {
          id: Date.now() + Math.random(),
          studentId: student.id,
          recipient: `+967 ${student.phone}`,
          text: smsText,
          time: "14:30",
          type: "present",
        },
        ...logs,
      ]);
    });
  };

  const handleUpdateSubmissionStatusAction = (
    assignmentId,
    studentId,
    newStatus,
    note,
  ) => {
    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id === assignmentId) {
          const updatedSubs = assign.submissions.map((sub) => {
            if (sub.studentId === studentId) {
              return { ...sub, status: newStatus, teacherNote: note };
            }
            return sub;
          });
          const exists = assign.submissions.some(
            (sub) => sub.studentId === studentId,
          );
          if (!exists) {
            const student = students.find((s) => s.id === studentId);
            updatedSubs.push({
              studentId,
              studentName: student ? student.name : "",
              status: newStatus,
              teacherNote: note,
            });
          }
          return { ...assign, submissions: updatedSubs };
        }
        return assign;
      }),
    );
  };

  const getStudentDetailedGrades = (studentId, subject, term) => {
    const record = detailedGrades.find((r) => r.studentId === studentId);
    if (!record || !record.grades[term] || !record.grades[term][subject]) {
      return defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
    }
    return record.grades[term][subject];
  };

  const handleDetailedGradeChangeAction = (
    studentId,
    subject,
    term,
    monthKey,
    field,
    num,
  ) => {
    const token = localStorage.getItem("auth_token");

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find((s) => s.id === studentId);
        studentRecord = {
          studentId,
          studentName: student ? student.name : "",
          grades: {
            term1: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
            term2: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
          },
        };
        prev = [...prev, studentRecord];
      }

      return prev.map((r) => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[term] };
          const subjectGrades = { ...termGrades[subject] };

          if (monthKey === "finalExam") {
            subjectGrades.finalExam = num;
          } else {
            subjectGrades[monthKey] = {
              ...subjectGrades[monthKey],
              [field]: num,
            };
          }

          termGrades[subject] = subjectGrades;
          updatedGrades[term] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });
    });

    if (token) {
      const foundSub = subjects.find((s) => s.name === subject || s.id === subject);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;

      if (subjectId) {
        setDetailedGrades((currentDetailed) => {
          const rec = currentDetailed.find((r) => r.studentId === studentId);
          if (rec && rec.grades[term] && rec.grades[term][subject]) {
            const subjGrades = rec.grades[term][subject];

            const reqBody = {
              student_id: Number(studentId),
              subject_id: subjectId,
              term: term === "term1" ? "1" : "2",
              month: monthKey === "finalExam" ? "final" : monthKey,
            };

            if (monthKey === "finalExam") {
              reqBody.final_exam = subjGrades.finalExam;
            } else {
              const mObj = subjGrades[monthKey];
              reqBody.hw_grade = mObj.homework;
              reqBody.att_grade = mObj.attendance;
              reqBody.beh_grade = mObj.behavior;
              reqBody.oral_grade = mObj.oral;
              reqBody.wrt_grade = mObj.written;
            }

            fetch("/api/grades/detailed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(reqBody),
            })
              .then((res) => res.json())
              .then((data) => {
                if (!data.success) {
                  console.error("Failed to save grade:", data.message);
                }
              })
              .catch((err) => console.error("Error saving grade:", err));
          }
          return currentDetailed;
        });
      }
    }
  };

  const syncGeneralGradesAction = (studentId) => {
    const record = detailedGrades.find((r) => r.studentId === studentId);
    if (!record) return;

    const subjectsMap = {
      الرياضيات: "math",
      العلوم: "science",
      "اللغة العربية": "arabic",
      "اللغة الإنجليزية": "english",
    };

    setGrades((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const updatedRow = { ...row };
          Object.keys(subjectsMap).forEach((subName) => {
            const field = subjectsMap[subName];

            const t1 =
              record.grades.term1[subName] ||
              defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
            const t1_m1 =
              t1.m1.homework +
              t1.m1.attendance +
              t1.m1.behavior +
              t1.m1.oral +
              t1.m1.written;
            const t1_m2 =
              t1.m2.homework +
              t1.m2.attendance +
              t1.m2.behavior +
              t1.m2.oral +
              t1.m2.written;
            const t1_m3 =
              t1.m3.homework +
              t1.m3.attendance +
              t1.m3.behavior +
              t1.m3.oral +
              t1.m3.written;
            const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
            const t1_total = t1_avg + t1.finalExam;

            const t2 =
              record.grades.term2[subName] ||
              defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
            const t2_m1 =
              t2.m1.homework +
              t2.m1.attendance +
              t2.m1.behavior +
              t2.m1.oral +
              t2.m1.written;
            const t2_m2 =
              t2.m2.homework +
              t2.m2.attendance +
              t2.m2.behavior +
              t2.m2.oral +
              t2.m2.written;
            const t2_m3 =
              t2.m3.homework +
              t2.m3.attendance +
              t2.m3.behavior +
              t2.m3.oral +
              t2.m3.written;
            const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
            const t2_total = t2_avg + t2.finalExam;

            const yearly = Math.round(t1_total + t2_total);
            updatedRow[field] = yearly;
          });
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handlePublishExamScheduleAction = (newSchedule) => {
    const token = localStorage.getItem("auth_token");

    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === newSchedule.grade && c.section === newSchedule.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    // Resolve term key (term1 / term2)
    const termKey = (newSchedule.term === "الفصل الثاني" || newSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = newSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    setExamSchedules((prev) => [newSchedule, ...prev]);
    setToastMessage(
      lang === "ar"
        ? "تم نشر جدول الاختبارات بنجاح!"
        : "Exam schedule published successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    const classStudents = students.filter(
      (s) => s.grade === newSchedule.grade && s.section === newSchedule.section,
    );
    classStudents.forEach((student) => {
      const smsText =
        lang === "ar"
          ? `تم نشر جدول اختبارات جديد (${newSchedule.period} - ${newSchedule.term}) للصف ${newSchedule.grade}. يرجى مراجعته في تطبيق ولي الأمر.`
          : `New exam schedule published (${newSchedule.periodEn} - ${newSchedule.termEn}) for ${newSchedule.grade}. Please review it in the Parent App.`;
      setSmsLogs((logs) => [
        {
          id: Date.now() + Math.random(),
          studentId: student.id,
          recipient: `+967 ${student.phone}`,
          text: smsText,
          time: "15:00",
          type: "present",
        },
        ...logs,
      ]);
    });

    if (token && classId) {
      fetch("/api/exam-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newSchedule.period,
          class_id: classId,
          term: termKey,
          subjects: mappedSubjects,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
          } else {
            console.error("Failed to store exam schedule:", data.message);
          }
        })
        .catch((err) => console.error("Error storing exam schedule:", err));
    }
  };

  const handleDeleteExamScheduleAction = (id) => {
    const token = localStorage.getItem("auth_token");
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جدول الاختبارات' : 'Delete Exam Schedule',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الجدول نهائياً؟' : 'Are you sure you want to permanently delete this schedule?',
      onConfirm: () => {
        setExamSchedules((prev) => prev.filter((sch) => sch.id !== id));
        setToastMessage(
          lang === "ar"
            ? "تم حذف جدول الاختبارات بنجاح"
            : "Exam schedule deleted successfully",
        );
        setTimeout(() => setToastMessage(""), 3000);

        if (token) {
          fetch(`/api/exam-schedules/${id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (!data.success) {
                console.error("Failed to delete exam schedule from backend:", data.message);
              }
            })
            .catch((err) => console.error("Error deleting exam schedule:", err));
        }
      }
    });
  };

  const handleUpdateExamScheduleAction = (id, updatedSchedule) => {
    const token = localStorage.getItem("auth_token");

    // Resolve class ID
    const foundClass = classes.find(
      (c) => c.grade === updatedSchedule.grade && c.section === updatedSchedule.section
    );
    const classId = foundClass ? Number(String(foundClass.id).replace("cls-", "")) : null;

    // Resolve term key (term1 / term2)
    const termKey = (updatedSchedule.term === "الفصل الثاني" || updatedSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = updatedSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    setExamSchedules((prev) =>
      prev.map((sch) => (sch.id === id ? { ...sch, ...updatedSchedule } : sch))
    );
    setToastMessage(
      lang === "ar"
        ? "تم تحديث جدول الاختبارات بنجاح!"
        : "Exam schedule updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      fetch(`/api/exam-schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedSchedule.period,
          class_id: classId,
          term: termKey,
          subjects: mappedSubjects,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
          } else {
            console.error("Failed to update exam schedule:", data.message);
          }
        })
        .catch((err) => console.error("Error updating exam schedule:", err));
    }
  };



  const handleAddPaymentAction = (newPayment) => {
    const token = localStorage.getItem("auth_token");

    setTuitionFees((prev) => ({
      ...prev,
      payments: [...prev.payments, newPayment],
    }));
    setToastMessage(t.paymentSuccessToast);
    setTimeout(() => setToastMessage(""), 3000);

    const student = students.find((s) => s.id === newPayment.studentId);
    const smsText =
      lang === "ar"
        ? `تم استلام دفعة مالية بقيمة ${newPayment.amount} ريال للسند رقم ${newPayment.referenceNo} بخصوص الطالب ${student?.name}. شكراً لكم. رياض و مدارس انوار العلى.`
        : `Payment of ${newPayment.amount} SAR (Receipt: ${newPayment.referenceNo}) received for student ${student?.nameEn}. Thank you. Riyadh & Anwar Al-Ola.`;
    setSmsLogs((logs) => [
      {
        id: Date.now(),
        studentId: newPayment.studentId,
        recipient: `+967 ${student?.phone}`,
        text: smsText,
        time: "11:30",
        type: "present",
      },
      ...logs,
    ]);

    if (token) {
      fetch("/api/finance/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: Number(newPayment.studentId),
          amount: Number(newPayment.amount),
          payment_date: newPayment.paymentDate,
          reference_no: newPayment.referenceNo,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            fetchFinanceData(token);
          } else {
            console.error("Failed to add payment:", data.message);
          }
        })
        .catch((err) => console.error("Error adding payment:", err));
    }
  };

  const handleSendNotificationAction = (newNotification, extraLogs = []) => {
    const token = localStorage.getItem("auth_token");

    let targetType = "all_parents";
    let targetId = null;

    if (newNotification.type === "student") {
      targetType = "by_student";
      targetId = newNotification.studentId;
    } else if (newNotification.type === "class") {
      targetType = "by_class";
      const foundClass = classes.find(
        (c) =>
          c.name === newNotification.grade ||
          c.name_ar === newNotification.grade,
      );
      targetId = foundClass
        ? Number(String(foundClass.id).replace("cls-", ""))
        : null;
    } else if (newNotification.type === "teacher") {
      targetType = "specific_teacher";
      targetId = newNotification.teacherId;
    } else if (newNotification.type === "teachers") {
      targetType = "all_teachers";
    }

    if (token) {
      fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNotification.title,
          content: newNotification.content,
          target_type: targetType,
          target_id: targetId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setToastMessage(t.notificationSuccessToast);
            setTimeout(() => setToastMessage(""), 3000);
            fetchNotifications(token);
          }
        })
        .catch((err) => {
          console.error("Error sending notification via API:", err);
          setNotifications((prev) => [newNotification, ...prev]);
          setToastMessage(t.notificationSuccessToast);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
      setToastMessage(t.notificationSuccessToast);
      setTimeout(() => setToastMessage(""), 3000);
    }

    if (extraLogs.length > 0) {
      setSmsLogs((logs) => [...extraLogs, ...logs]);
    }
  };

  const handleMarkNotificationAsReadAction = (id) => {
    const token = localStorage.getItem("auth_token");
    
    // Update local state immediately (optimistic UI)
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );

    if (token) {
      fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error("Failed to mark notification as read:", data.message);
          }
        })
        .catch((err) => console.error("Error marking notification as read:", err));
    }
  };

  const handleUpdateReportStatusAction = (reportId, newStatus) => {
    const token = localStorage.getItem("auth_token");
    
    // Optimistic UI update
    setTeacherReports((prev) =>
      prev.map((r) => (r.id === String(reportId) ? { ...r, status: newStatus } : r))
    );

    if (token) {
      fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setToastMessage(lang === "ar" ? "تم تحديث حالة البلاغ بنجاح." : "Report status updated successfully.");
            setTimeout(() => setToastMessage(""), 3000);
            fetchTeacherReports(token);
          } else {
            console.error("Failed to update report status:", data.message);
          }
        })
        .catch((err) => console.error("Error updating report status:", err));
    }
  };

  const handleScheduleChangeAction = (
    dayKey,
    periodIdx,
    val,
    selectedScheduleGrade,
  ) => {
    // Build the updated schedule FIRST (synchronously) before setState
    setSchedules((prev) => {
      const gradeSchedule = { ...prev[selectedScheduleGrade] };
      const dayClasses = [...(gradeSchedule[dayKey] || [])];
      dayClasses[periodIdx] = val;
      gradeSchedule[dayKey] = dayClasses;

      // Send to API inside the updater to get the latest value
      const token = localStorage.getItem("auth_token");
      if (token) {
        fetch("/api/schedules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            class_name: selectedScheduleGrade,
            schedule: gradeSchedule,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              console.error("Failed to save schedule to backend:", data.message);
            }
          })
          .catch((err) => console.error("Error saving schedule to backend:", err));
      }

      return { ...prev, [selectedScheduleGrade]: gradeSchedule };
    });
  };

  const handleGradeCellChangeAction = (studentId, subject, val) => {
    const token = localStorage.getItem("auth_token");
    const num = val === "" ? 0 : Math.min(100, Math.max(0, parseInt(val) || 0));
    
    setGrades((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          return { ...row, [subject]: num };
        }
        return row;
      }),
    );

    if (token) {
      fetch(`/api/grades/control/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [subject]: num,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error("Failed to update control grade:", data.message);
          }
        })
        .catch((err) => console.error("Error updating control grade:", err));
    }
  };

  const handleCalculateSecretCodesAction = () => {
    const token = localStorage.getItem("auth_token");

    setGrades((prev) =>
      prev.map((row) => {
        const calculatedCode =
          row.studentId * Number(controlMultiplier) + Number(controlOffset);
        return { ...row, secretCode: calculatedCode.toString() };
      }),
    );
    setIsGradesEncrypted(true);
    setToastMessage(
      lang === "ar"
        ? "تم توليد الأرقام السرية وتشفير الكشف بنجاح!"
        : "Secret codes generated and grading sheet encrypted successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);

    if (token) {
      fetch("/api/grades/generate-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prefix: controlPrefix,
          multiplier: Number(controlMultiplier),
          offset: Number(controlOffset),
          modulo: Number(controlModulo),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            fetchControlGrades(token);
          } else {
            console.error("Failed to generate secret codes:", data.message);
          }
        })
        .catch((err) => console.error("Error generating secret codes:", err));
    }
  };

  const handleEnterGradeBySecretCodeAction = (
    secretCodeInput,
    secretGradeInput,
    secretSubjectInput,
    secretTermInput,
  ) => {
    const token = localStorage.getItem("auth_token");
    const valNum = Math.min(30, Math.max(0, parseFloat(secretGradeInput) || 0));
    const studentGradeRow = grades.find(
      (g) => g.secretCode === secretCodeInput.trim(),
    );
    if (!studentGradeRow) {
      setToastMessage(
        lang === "ar"
          ? "عذراً، الرقم السري غير صحيح أو غير موجود!"
          : "Sorry, secret code is incorrect or not found!",
      );
      setTimeout(() => setToastMessage(""), 3000);
      return false;
    }

    const studentId = studentGradeRow.studentId;

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = students.find((s) => s.id === studentId);
        studentRecord = {
          studentId,
          studentName: student ? student.name : "",
          grades: {
            term1: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
            term2: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
          },
        };
        prev = [...prev, studentRecord];
      }

      const updatedList = prev.map((r) => {
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

      const record = updatedList.find((r) => r.studentId === studentId);
      const subjectsMap = {
        الرياضيات: "math",
        العلوم: "science",
        "اللغة العربية": "arabic",
        "اللغة الإنجليزية": "english",
      };

      setGrades((prevGrades) =>
        prevGrades.map((row) => {
          if (row.studentId === studentId) {
            const updatedRow = { ...row };
            Object.keys(subjectsMap).forEach((subName) => {
              const field = subjectsMap[subName];

              const t1 =
                record.grades.term1[subName] ||
                defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
              const t1_m1 =
                t1.m1.homework +
                t1.m1.attendance +
                t1.m1.behavior +
                t1.m1.oral +
                t1.m1.written;
              const t1_m2 =
                t1.m2.homework +
                t1.m2.attendance +
                t1.m2.behavior +
                t1.m2.oral +
                t1.m2.written;
              const t1_m3 =
                t1.m3.homework +
                t1.m3.attendance +
                t1.m3.behavior +
                t1.m3.oral +
                t1.m3.written;
              const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
              const t1_total = t1_avg + t1.finalExam;

              const t2 =
                record.grades.term2[subName] ||
                defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
              const t2_m1 =
                t2.m1.homework +
                t2.m1.attendance +
                t2.m1.behavior +
                t2.m1.oral +
                t2.m1.written;
              const t2_m2 =
                t2.m2.homework +
                t2.m2.attendance +
                t2.m2.behavior +
                t2.m2.oral +
                t2.m2.written;
              const t2_m3 =
                t2.m3.homework +
                t2.m3.attendance +
                t2.m3.behavior +
                t2.m3.oral +
                t2.m3.written;
              const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
              const t2_total = t2_avg + t2.finalExam;

              const yearly = Math.round(t1_total + t2_total);
              updatedRow[field] = yearly;
            });
            return updatedRow;
          }
          return row;
        }),
      );

      return updatedList;
    });

    if (token) {
      const foundSub = subjects.find(
        (s) => s.name === secretSubjectInput || s.id === secretSubjectInput,
      );
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;

      if (subjectId) {
        fetch("/api/grades/detailed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_id: Number(studentId),
            subject_id: subjectId,
            term: secretTermInput === "term1" ? "1" : "2",
            month: "final",
            final_exam: valNum,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              console.error("Failed to save grade via secret code:", data.message);
            }
          })
          .catch((err) => console.error("Error saving grade via secret code:", err));
      }
    }

    setToastMessage(
      lang === "ar"
        ? `تم رصد الدرجة (${valNum}/30) لمادة ${secretSubjectInput} بنجاح للطالب ذو الرقم السري: ${secretCodeInput}`
        : `Successfully entered grade (${valNum}/30) for subject ${secretSubjectInput} (Secret Code: ${secretCodeInput})`,
    );
    setTimeout(() => setToastMessage(""), 4000);
    return true;
  };

  const handleQrScanAction = (scannedStudentId) => {
    const token = localStorage.getItem("auth_token");
    const student = students.find((s) => s.id === scannedStudentId);
    if (!student) return false;

    const arrivalTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const isLate = arrivalTime > "07:45"; // school late threshold is 7:45 AM
    const finalStatus = isLate ? "late" : "present";

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === scannedStudentId) {
          return {
            ...s,
            status: finalStatus,
            time: arrivalTime,
          };
        }
        return s;
      }),
    );

    const todayStr = new Date().toISOString().split("T")[0];
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.studentId === scannedStudentId && r.date === todayStr,
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: finalStatus,
          time: arrivalTime,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId: scannedStudentId,
            date: todayStr,
            status: finalStatus,
            time: arrivalTime,
          },
        ];
      }
    });

    const smsText =
      finalStatus === "late"
        ? lang === "ar"
          ? `نفيدكم بتأخر ابنكم ${student.name} عن الطابور الصباحي، حيث حضر الساعة ${arrivalTime}. رياض و مدارس انوار العلى.`
          : `We inform you that your child ${student.nameEn} arrived late at school today at ${arrivalTime}. Riyadh & Anwar Al-Ola.`
        : lang === "ar"
          ? `تم تسجيل دخول ابنكم ${student.name} للمدرسة بنجاح، وقت الحضور ${arrivalTime}. يوم سعيد! رياض و مدارس انوار العلى.`
          : `Your child ${student.nameEn} entered school successfully today at ${arrivalTime}. Have a great day! Riyadh & Anwar Al-Ola.`;

    const newSms = {
      id: Date.now(),
      studentId: scannedStudentId,
      recipient: `+967 ${student.phone}`,
      text: smsText,
      time: arrivalTime,
      type: finalStatus,
    };
    setSmsLogs((prev) => [newSms, ...prev]);

    if (token) {
      fetch(`/api/students/${scannedStudentId}/scan`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error("Gate scan backend error:", data.message);
          }
        })
        .catch((err) => console.error("Error sending gate scan to API:", err));
    }

    return { student, finalStatus, arrivalTime };
  };

  const handleLogoutAction = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch((err) => console.error("API Logout error:", err));
    }
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setToastMessage(
      lang === "ar" ? "تم تسجيل الخروج بنجاح!" : "Logged out successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        darkMode,
        setDarkMode,
        activeTab,
        setActiveTab,
        handleLogout: handleLogoutAction,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        showNotificationsDropdown,
        setShowNotificationsDropdown,
        showProfileDropdown,
        setShowProfileDropdown,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        students,
        setStudents,
        teachers,
        setTeachers,
        supervisors,
        setSupervisors,
        schedules,
        setSchedules,
        grades,
        setGrades,
        subjects,
        setSubjects,
        classes,
        setClasses,
        availableGrades,
        setAvailableGrades,
        availableSections,
        setAvailableSections,
        parentUsers,
        setParentUsers,
        absenceRequests,
        setAbsenceRequests,
        assignments,
        setAssignments,
        detailedGrades,
        setDetailedGrades,
        examSchedules,
        setExamSchedules,
        tuitionFees,
        setTuitionFees,
        notifications,
        setNotifications,
        teacherReports,
        setTeacherReports,
        toastMessage,
        setToastMessage,
        confirmState,
        triggerConfirm,
        smsLogs,
        setSmsLogs,
        attendanceRecords,
        setAttendanceRecords,
        selectedAttendanceMonth,
        setSelectedAttendanceMonth,
        isGradesEncrypted,
        setIsGradesEncrypted,
        controlPrefix,
        setControlPrefix,
        controlMultiplier,
        setControlMultiplier,
        controlOffset,
        setControlOffset,
        controlModulo,
        setControlModulo,
        renderAvatar,
        dashboardStats,
        fetchDashboardStats,
        fetchWeeklySchedules,
        fetchTeacherReports,
        handleUpdateReportStatus: handleUpdateReportStatusAction,

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
        handleManualAttendanceNoteChange:
          handleManualAttendanceNoteChangeAction,
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
        handleUpdateExamSchedule: handleUpdateExamScheduleAction,
        handleDeleteExamSchedule: handleDeleteExamScheduleAction,
        handleAddPayment: handleAddPaymentAction,
        handleSendNotification: handleSendNotificationAction,
        handleMarkNotificationAsRead: handleMarkNotificationAsReadAction,
        handleScheduleChange: handleScheduleChangeAction,
        handleGradeCellChange: handleGradeCellChangeAction,
        handleCalculateSecretCodes: handleCalculateSecretCodesAction,
        handleEnterGradeBySecretCode: handleEnterGradeBySecretCodeAction,
        handleQrScan: handleQrScanAction,
        showCardVisualizerModal,
        setShowCardVisualizerModal,
        selectedStudentForCard,
        setSelectedStudentForCard,
        showPrintModal,
        setShowPrintModal,
        printMode,
        setPrintMode,
        printSelectedMonth,
        setPrintSelectedMonth,
        selectedGradeStudentId,
        setSelectedGradeStudentId,
        selectedGradeTerm,
        setSelectedGradeTerm,
        selectedGradeSubject,
        setSelectedGradeSubject,
        printStudentObject,
        setPrintStudentObject,
        // Vice Principals & Permissions
        vicePrincipals,
        setVicePrincipals,
        hasPermission,
        canAction,
        // Refresh functions
        fetchStudents,
        fetchParents,
        fetchTeachers,
        fetchControlGrades,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
