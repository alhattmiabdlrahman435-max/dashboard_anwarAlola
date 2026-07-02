<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== محتويات جدول الإشعارات في قاعدة البيانات ===\n\n";

$notifications = \App\Models\Notification::all();
foreach ($notifications as $notif) {
    echo "ID: {$notif->id}\n";
    echo "Title: {$notif->title}\n";
    echo "Content: {$notif->content}\n";
    echo "Type: {$notif->type}\n";
    echo "Target ID: " . ($notif->student_id ?: $notif->class_id ?: $notif->teacher_id ?: 'الجميع') . "\n";
    echo "Created At: {$notif->created_at}\n";
    echo "-----------------------------------------\n";
}
