<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ربط إشعار "واجب مدرسي جديد" بالواجب نفسه، حتى يفتح التطبيق الواجب عند النقر على الإشعار.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('assignment_id')->nullable()->after('teacher_id')
                ->constrained('assignments')->nullOnDelete();
        });

        // ربط إشعارات الواجبات القديمة بالواجب المطابق (نفس الصف والعنوان ووقت الإنشاء تقريباً)
        $rows = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('source', 'assignments')->whereNotNull('class_id')->whereNull('assignment_id')
            ->get(['id', 'class_id', 'content', 'created_at']);
        foreach ($rows as $n) {
            $a = \Illuminate\Support\Facades\DB::table('assignments')
                ->where('class_id', $n->class_id)
                ->whereBetween('created_at', [
                    \Carbon\Carbon::parse($n->created_at)->subMinutes(2),
                    \Carbon\Carbon::parse($n->created_at)->addMinutes(2),
                ])
                ->orderBy('id')->get(['id', 'title'])
                ->first(fn($a) => str_contains((string) $n->content, (string) $a->title));
            if ($a) {
                \Illuminate\Support\Facades\DB::table('notifications')->where('id', $n->id)->update(['assignment_id' => $a->id]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assignment_id');
        });
    }
};
