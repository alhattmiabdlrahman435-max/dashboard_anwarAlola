<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\User;
use App\Models\Report;
use App\Models\Assignment;

class CleanOrphanFilesCommand extends Command
{
    protected $signature   = 'files:clean-orphans {--dry-run : Show what would be deleted without actually deleting}';
    protected $description = 'Delete uploaded files not referenced in the database (avatars, reports, assignments)';

    private array $directories = [
        'avatars'     => 'uploads/avatars',
        'reports'     => 'uploads/reports',
        'assignments' => 'uploads/assignments',
    ];

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->warn('🔍 DRY RUN — no files will be deleted.');
        }

        $totalDeleted = 0;
        $totalSize    = 0;

        // Collect all DB-referenced URLs
        $referenced = $this->collectReferencedFiles();

        foreach ($this->directories as $label => $relativePath) {
            $dir = public_path($relativePath);

            if (!File::isDirectory($dir)) {
                $this->line("⚠️  Directory not found: {$relativePath}");
                continue;
            }

            $files   = File::files($dir);
            $orphans = 0;

            foreach ($files as $file) {
                $url = asset($relativePath . '/' . $file->getFilename());

                if (!in_array($url, $referenced)) {
                    $size  = $file->getSize();
                    $orphans++;
                    $totalSize += $size;

                    $this->line(
                        "🗑️  [{$label}] " . $file->getFilename() .
                        ' (' . $this->formatBytes($size) . ')' .
                        ($isDryRun ? ' [would delete]' : '')
                    );

                    if (!$isDryRun) {
                        File::delete($file->getPathname());
                        $totalDeleted++;
                    }
                }
            }

            if ($orphans === 0) {
                $this->info("✅ [{$label}] No orphan files found.");
            }
        }

        $this->newLine();

        if ($isDryRun) {
            $this->warn("Would delete {$totalDeleted} files (" . $this->formatBytes($totalSize) . ')');
        } else {
            $this->info("✅ Done. Deleted {$totalDeleted} orphan files (" . $this->formatBytes($totalSize) . ' freed).');
        }

        return Command::SUCCESS;
    }

    /**
     * Collect all file URLs currently stored in the database.
     */
    private function collectReferencedFiles(): array
    {
        $refs = [];

        // Avatars → users table
        User::whereNotNull('photo_url')->pluck('photo_url')->each(fn($url) => $refs[] = $url);

        // Report images
        Report::whereNotNull('image_url')->pluck('image_url')->each(fn($url) => $refs[] = $url);

        // Assignment attachments
        Assignment::whereNotNull('attachment_url')->pluck('attachment_url')->each(fn($url) => $refs[] = $url);

        return $refs;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1_048_576) return round($bytes / 1_048_576, 2) . ' MB';
        if ($bytes >= 1_024)    return round($bytes / 1_024, 1) . ' KB';
        return $bytes . ' B';
    }
}
