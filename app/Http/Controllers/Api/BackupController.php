<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    /**
     * Helper to verify if user is admin.
     */
    protected function authorizeAdmin(Request $request): bool
    {
        $user = $request->user();

        // Support token in query string for direct download links
        if (! $user && $request->filled('token')) {
            $accessToken = PersonalAccessToken::findToken($request->query('token'));
            if ($accessToken) {
                $user = $accessToken->tokenable;
                auth('sanctum')->setUser($user);
            }
        }

        return $user && ($user->role === 'admin' || $user->is_admin ?? false);
    }

    /**
     * List all system backups and statistics.
     */
    public function index(Request $request)
    {
        if (! $this->authorizeAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول إلى إدارة النسخ الاحتياطي.',
            ], 403);
        }

        $backupName = config('backup.backup.name', 'anwar-alola');
        $diskName = config('backup.backup.destination.disks.0', 'local');
        $disk = Storage::disk($diskName);
        $backupPath = "{$backupName}";

        $backups = [];
        $totalBytes = 0;

        if ($disk->exists($backupPath)) {
            $files = $disk->files($backupPath);

            foreach ($files as $file) {
                if (str_ends_with(strtolower($file), '.zip')) {
                    $size = $disk->size($file);
                    $totalBytes += $size;
                    $lastModified = $disk->lastModified($file);

                    // Estimate type by size or name
                    // In general DB-only backup is much smaller (< 50MB) unless large attachments exist
                    $isDbOnly = $size < (20 * 1024 * 1024);

                    $backups[] = [
                        'file_name' => basename($file),
                        'path' => $file,
                        'size_raw' => $size,
                        'size_formatted' => $this->formatBytes($size),
                        'is_db_only' => $isDbOnly,
                        'type_label' => $isDbOnly ? 'قاعدة البيانات فقط' : 'شامل (قاعدة البيانات + المرفقات)',
                        'created_at' => Carbon::createFromTimestamp($lastModified)->toIso8601String(),
                        'created_at_human' => Carbon::createFromTimestamp($lastModified)->diffForHumans(),
                        'created_at_formatted' => Carbon::createFromTimestamp($lastModified)->format('Y/m/d h:i A'),
                    ];
                }
            }
        }

        // Sort backups by latest first
        usort($backups, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        $lastBackup = ! empty($backups) ? $backups[0] : null;

        $stats = [
            'total_count' => count($backups),
            'total_size' => $this->formatBytes($totalBytes),
            'total_bytes' => $totalBytes,
            'last_backup_date' => $lastBackup ? $lastBackup['created_at_human'] : 'لا توجد نسخ حتى الآن',
            'last_backup_formatted' => $lastBackup ? $lastBackup['created_at_formatted'] : '-',
            'backup_name' => $backupName,
            'disk_name' => $diskName,
            'schedule_time' => 'يومياً 02:00 صباحاً',
            'cleanup_time' => 'يومياً 02:30 صباحاً',
            'retention_days' => config('backup.cleanup.default_strategy.keep_all_backups_for_days', 7),
            'keep_daily_days' => config('backup.cleanup.default_strategy.keep_daily_backups_for_days', 16),
            'db_connection' => config('database.default', 'mysql'),
            'status' => 'healthy',
        ];

        return response()->json([
            'success' => true,
            'backups' => $backups,
            'stats' => $stats,
        ]);
    }

    /**
     * Trigger a new manual backup immediately.
     */
    public function store(Request $request)
    {
        if (! $this->authorizeAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإنشاء نسخ احتياطي.',
            ], 403);
        }

        $onlyDb = true;
        if ($request->has('only_db')) {
            $onlyDb = filter_var($request->input('only_db'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;
        } elseif ($request->has('type')) {
            $onlyDb = $request->input('type') !== 'full';
        }

        try {
            // Prevent request timeout during backup
            set_time_limit(600);
            ini_set('max_execution_time', '600');

            $options = [];
            if ($onlyDb) {
                $options['--only-db'] = true;
            }

            // Run Spatie backup command
            $exitCode = Artisan::call('backup:run', $options);
            $output = Artisan::output();

            if ($exitCode === 0) {
                Log::info('Backup created manually successfully.', ['only_db' => $onlyDb]);

                return response()->json([
                    'success' => true,
                    'message' => $onlyDb
                        ? 'تم إنشاء نسخة احتياطية لقاعدة البيانات بنجاح.'
                        : 'تم إنشاء النسخة الاحتياطية الشاملة (قاعدة البيانات والملفات) بنجاح.',
                    'output' => $output,
                ]);
            }

            Log::warning('Backup completed with non-zero exit code: ' . $exitCode, ['output' => $output]);

            return response()->json([
                'success' => false,
                'message' => 'تم إنهاء عملية النسخ مع تحذيرات. يرجى مراجعة السجلات.',
                'output' => $output,
            ], 422);

        } catch (\Throwable $e) {
            Log::error('Backup execution failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل تنفيذ النسخ الاحتياطي: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Trigger cleanup of old backups according to retention policy.
     */
    public function clean(Request $request)
    {
        if (! $this->authorizeAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك.'], 403);
        }

        try {
            $exitCode = Artisan::call('backup:clean');
            $output = Artisan::output();

            return response()->json([
                'success' => $exitCode === 0,
                'message' => 'تم تنفيذ عملية تنظيف النسخ الاحتياطية القديمة بنجاح وفق خطة الاحتفاظ.',
                'output' => $output,
            ]);
        } catch (\Throwable $e) {
            Log::error('Backup cleanup failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'فشل تنظيف النسخ القديمة: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a specific backup archive.
     */
    public function download(Request $request, string $fileName)
    {
        if (! $this->authorizeAdmin($request)) {
            abort(403, 'غير مصرح لك بتحميل النسخ الاحتياطية.');
        }

        $safeFileName = basename($fileName);

        // Security check: must end with .zip
        if (! str_ends_with(strtolower($safeFileName), '.zip')) {
            abort(400, 'ملف النسخة الاحتياطية غير صالح.');
        }

        $backupName = config('backup.backup.name', 'anwar-alola');
        $diskName = config('backup.backup.destination.disks.0', 'local');
        $disk = Storage::disk($diskName);
        $filePath = "{$backupName}/{$safeFileName}";

        if (! $disk->exists($filePath)) {
            abort(404, 'ملف النسخة الاحتياطية غير موجود أو تم حذفه.');
        }

        $fullPath = $disk->path($filePath);

        return response()->download($fullPath, $safeFileName, [
            'Content-Type' => 'application/zip',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Delete a specific backup archive.
     */
    public function destroy(Request $request, string $fileName)
    {
        if (! $this->authorizeAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك.'], 403);
        }

        $safeFileName = basename($fileName);
        $backupName = config('backup.backup.name', 'anwar-alola');
        $diskName = config('backup.backup.destination.disks.0', 'local');
        $disk = Storage::disk($diskName);
        $filePath = "{$backupName}/{$safeFileName}";

        if ($disk->exists($filePath)) {
            $disk->delete($filePath);

            return response()->json([
                'success' => true,
                'message' => "تم حذف ملف النسخة الاحتياطية ({$safeFileName}) بنجاح.",
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'ملف النسخة الاحتياطية غير موجود.',
        ], 404);
    }

    /**
     * Format bytes to human-readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
