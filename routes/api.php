<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AbsenceRequestController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ExamScheduleController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\PrepSupervisorController;
use App\Http\Controllers\Api\VicePrincipalController;
use App\Http\Controllers\Api\ExportImportController;


/*
|--------------------------------------------------------------------------
| API Routes - مدارس انوار العلى
|--------------------------------------------------------------------------
*/

// ===== Public Routes - مسارات عامة (بدون مصادقة) =====
Route::post('/login', [AuthController::class, 'login']);

// ===== Protected Routes - مسارات محمية (تحتاج Token) =====
Route::middleware('auth:sanctum')->group(function () {

    // Export / Import - استيراد وتصدير البيانات (MUST BE BEFORE RESOURCES)
    Route::get('/{module}/export', [ExportImportController::class, 'export'])
        ->where('module', 'students|teachers|parents|grades');
    Route::post('/{module}/import', [ExportImportController::class, 'import'])
        ->where('module', 'students|teachers|parents');
    Route::get('/{module}/template', [ExportImportController::class, 'template'])
        ->where('module', 'students|teachers|parents');

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/update-photo', [AuthController::class, 'updatePhoto']);
    Route::post('/user/update-password', [AuthController::class, 'updatePassword']);
    Route::post('/user/fcm-token', [AuthController::class, 'updateFcmToken']);

    // Dashboard - الرئيسية
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Students - الطلاب
    Route::apiResource('students', StudentController::class);
    Route::get('/students/{id}/card', [StudentController::class, 'card']);       // بطاقة QR
    Route::post('/students/{id}/scan', [StudentController::class, 'scanQr']);    // مسح QR للحضور

    // Teachers - المعلمون
    Route::apiResource('teachers', TeacherController::class);

    // Prep Supervisors - مشرفو التحضير
    Route::apiResource('supervisors', PrepSupervisorController::class);

    // Parents - أولياء الأمور
    Route::apiResource('parents', ParentController::class);
    Route::get('/parents/{id}/students', [ParentController::class, 'children']); // أبناء ولي الأمر

    // Classes - الفصول الدراسية
    Route::apiResource('classes', ClassController::class);
    Route::post('/classes/{id}/subjects', [ClassController::class, 'syncSubjects']);

    // Subjects - المواد الدراسية
    Route::apiResource('subjects', SubjectController::class);
    Route::post('/subjects/{id}/classes', [SubjectController::class, 'syncClasses']);

    // Attendance - الحضور والغياب
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::put('/attendance/{id}', [AttendanceController::class, 'update']);
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/student/{studentId}', [AttendanceController::class, 'byStudent']);

    // Absence Requests - طلبات الغياب
    Route::apiResource('absence-requests', AbsenceRequestController::class);
    Route::post('/absence-requests/{id}/approve', [AbsenceRequestController::class, 'approve']);
    Route::post('/absence-requests/{id}/reject', [AbsenceRequestController::class, 'reject']);

    // Assignments - الواجبات
    Route::apiResource('assignments', AssignmentController::class);
    Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions']);
    Route::put('/assignments/{id}/submissions', [AssignmentController::class, 'updateSubmissions']);

    // Grades - الدرجات
    Route::get('/grades/detailed/{studentId}', [GradeController::class, 'detailed']);
    Route::post('/grades/detailed', [GradeController::class, 'saveDetailed']);
    Route::get('/grades/class/{classId}/subject/{subjectId}', [GradeController::class, 'getByClassAndSubject']);
    Route::get('/grades/control', [GradeController::class, 'control']);
    Route::put('/grades/control/{studentId}', [GradeController::class, 'updateControl']);
    Route::post('/grades/generate-codes', [GradeController::class, 'generateSecretCodes']);

    // Reports - البلاغات والتقارير
    Route::apiResource('reports', ReportController::class);

    // Contact Messages - اتصل بنا
    Route::post('/contact-messages', [ContactMessageController::class, 'store']);

    // Exam Schedules - جداول الاختبارات
    Route::apiResource('exam-schedules', ExamScheduleController::class);

    // Weekly Schedules - الجداول الدراسية الأسبوعية
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::post('/schedules', [ScheduleController::class, 'store']);

    // Finance - المالية
    Route::get('/finance/students', [FinanceController::class, 'index']);
    Route::get('/finance/student/{studentId}', [FinanceController::class, 'show']);
    Route::post('/finance/payment', [FinanceController::class, 'addPayment']);
    Route::get('/finance/stats', [FinanceController::class, 'stats']);

    // Notifications - الإشعارات
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/send', [NotificationController::class, 'send']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'read']);

    // --- المعلم (Teacher) ---
    Route::group(['prefix' => 'teacher'], function () {
        Route::get('/classes', [TeacherController::class, 'getClasses']);
        Route::get('/classes/{classId}/subjects', [TeacherController::class, 'getSubjectsByClass']);
        Route::get('/classes/{classId}/students', [TeacherController::class, 'getStudents']);
        Route::put('/students/{studentId}/attendance', [TeacherController::class, 'markAttendance']);
        Route::get('/classes/{classId}/attendance-history', [TeacherController::class, 'getClassAttendanceHistory']);
        Route::get('/attendance-history', [TeacherController::class, 'getTeacherAttendanceHistory']);
        Route::get('/schedule', [TeacherController::class, 'getSchedule']);
    });

    // --- مشرفة الأدوار (Floor Supervisor) ---
    Route::group(['prefix' => 'supervisor'], function () {
        Route::get('/classes', [TeacherController::class, 'getClasses']);
        Route::get('/classes/{classId}/students', [TeacherController::class, 'getStudents']);
        Route::put('/students/{studentId}/attendance', [TeacherController::class, 'markAttendance']);
        Route::get('/classes/{classId}/attendance-history', [TeacherController::class, 'getClassAttendanceHistory']);
        Route::get('/attendance-history', [TeacherController::class, 'getTeacherAttendanceHistory']);
        Route::get('/reports', [TeacherController::class, 'getSupervisorReports']);
    });

    // Vice Principals (Supervisors) - وكلاء المدرسة
    Route::apiResource('vice-principals', VicePrincipalController::class);
});
