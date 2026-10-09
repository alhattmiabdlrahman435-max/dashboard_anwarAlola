@echo off
chcp 65001 > nul
echo ========================================================
echo   رياض ومدارس أنوار العلى الدولية النموذجية
echo   تثبيت مهمة الجدولة التلقائية للنسخ الاحتياطي في Windows
echo ========================================================
echo.

set PROJECT_DIR=D:\laragon\www\dashboard_anwarAlola
set TASK_NAME=AnwarAlola_Backup_Scheduler

echo [+] جاري إنشاء مهمة مجدول المهام (Windows Task Scheduler)...
schtasks /create /tn "%TASK_NAME%" /tr "cmd.exe /c cd /d %PROJECT_DIR% && php artisan schedule:run >> storage\logs\scheduler.log 2>&1" /sc minute /mo 1 /f

if %ERRORLEVEL% equ 0 (
    echo.
    echo [✔] تم تثبيت المهمة بنجاح!
    echo     اسم المهمة: %TASK_NAME%
    echo     التكرار: يتم الفحص والتشغيل كل دقيقة تلقائياً في الخلفية.
    echo     موعد النسخ الاحتياطي: يومياً 02:00 صباحاً.
    echo     موعد تنظيف النسخ القديمة: يومياً 02:30 صباحاً.
    echo     سجل التشغيل: storage\logs\scheduler.log
) else (
    echo.
    echo [X] تعذر إنشاء المهمة. يرجى تشغيل هذا الملف كمسؤول (Run as Administrator).
)

echo.
pause
