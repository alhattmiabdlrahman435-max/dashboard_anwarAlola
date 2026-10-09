<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Automated Daily System & Database Backup
|--------------------------------------------------------------------------
| - backup:run --only-db: Runs daily at 02:00 AM (Asia/Riyadh / Sana'a)
| - backup:clean: Runs daily at 02:30 AM to prune old backups based on retention policy
*/

Schedule::command('backup:run --only-db')
    ->dailyAt('02:00')
    ->timezone(env('APP_TIMEZONE', 'Asia/Riyadh'))
    ->onFailure(function () {
        Log::error('[Backup Scheduler] Daily database backup failed at ' . now());
    })
    ->onSuccess(function () {
        Log::info('[Backup Scheduler] Daily database backup completed successfully at ' . now());
    });

Schedule::command('backup:clean')
    ->dailyAt('02:30')
    ->timezone(env('APP_TIMEZONE', 'Asia/Riyadh'))
    ->onFailure(function () {
        Log::error('[Backup Scheduler] Backup cleanup failed at ' . now());
    })
    ->onSuccess(function () {
        Log::info('[Backup Scheduler] Backup cleanup completed successfully at ' . now());
    });
