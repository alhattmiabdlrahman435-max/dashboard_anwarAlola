@echo off
chcp 65001 > nul
echo ========================================================
echo   رياض ومدارس أنوار العلى الدولية النموذجية
echo   تشغيل مراقب المجدول الآلي (Schedule Worker)
echo ========================================================
echo.
cd /d D:\laragon\www\dashboard_anwarAlola
echo [+] جاري مراقبة المهام المجدولة والنسخ الاحتياطي التلقائي...
echo [+] اضغط Ctrl+C للإيقاف في أي وقت.
echo.
php artisan schedule:work
pause
