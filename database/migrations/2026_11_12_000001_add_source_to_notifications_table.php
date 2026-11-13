<?php

use App\Models\Notification;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // مصدر الإشعار: admin | assignments | grades | attendance | exams | schedule | absence | finance | reports | teaching | other
            $table->string('source', 20)->nullable()->after('type');
            $table->index('source');
        });

        // تصنيف الإشعارات الموجودة مرة واحدة
        DB::table('notifications')
            ->select(['id', 'type', 'title', 'student_id', 'class_id', 'teacher_id'])
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('notifications')->where('id', $row->id)->update([
                        'source' => Notification::inferSource(
                            $row->type, $row->title, $row->student_id, $row->class_id, $row->teacher_id
                        ),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropColumn('source');
        });
    }
};
