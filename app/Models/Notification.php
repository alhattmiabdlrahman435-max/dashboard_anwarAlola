<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $guarded = [];

    protected $casts = [
        'edited_at' => 'datetime',
    ];

    /**
     * مصادر الإشعار (حقل source). الأسماء تطابق صفحات تطبيق ولي الأمر.
     */
    public const SOURCE_ADMIN = 'admin';            // إدارة المدرسة (إنشاء إشعار فوري)
    public const SOURCE_ASSIGNMENTS = 'assignments'; // الواجبات المدرسية
    public const SOURCE_GRADES = 'grades';           // الدرجات
    public const SOURCE_ATTENDANCE = 'attendance';   // سجل الحضور
    public const SOURCE_EXAMS = 'exams';             // الاختبارات
    public const SOURCE_SCHEDULE = 'schedule';       // جدول الحصص
    public const SOURCE_ABSENCE = 'absence';         // طلب غياب
    public const SOURCE_FINANCE = 'finance';         // الرسوم الدراسية
    public const SOURCE_REPORTS = 'reports';         // البلاغات
    public const SOURCE_TEACHING = 'teaching';       // تكليفات تدريس (للمعلمين)
    public const SOURCE_OTHER = 'other';

    protected static function booted(): void
    {
        // كل إشعار يُحفظ بمصدره لحظة إنشائه، أينما أُنشئ في النظام
        static::creating(function (Notification $notif) {
            if (empty($notif->source)) {
                $notif->source = self::inferSource(
                    $notif->type,
                    $notif->title,
                    $notif->student_id,
                    $notif->class_id,
                    $notif->teacher_id
                );
            }
        });
    }

    /**
     * يحدد مصدر الإشعار من نوعه وعنوانه. يُستخدم للإشعارات الجديدة وللتصنيف المرة الأولى للقديمة.
     */
    public static function inferSource(?string $type, ?string $title, $studentId = null, $classId = null, $teacherId = null): string
    {
        $type = (string) $type;
        $title = (string) $title;

        if (str_starts_with($type, 'broadcast')) return self::SOURCE_ADMIN;
        // "إشعار عام" لجميع المستخدمين من صفحة الإشعارات
        if ($type === 'general' && !$studentId && !$classId && !$teacherId) return self::SOURCE_ADMIN;

        if ($type === 'attendance') return self::SOURCE_ATTENDANCE;
        if ($type === 'exam_schedule' || str_contains($title, 'جدول اختبارات')) return self::SOURCE_EXAMS;
        if (str_starts_with($type, 'grade_published') || str_contains($title, 'درجات')) return self::SOURCE_GRADES;
        if (in_array($type, ['alert', 'report'], true) || str_contains($title, 'بلاغ')) return self::SOURCE_REPORTS;
        if (str_contains($title, 'واجب')) return self::SOURCE_ASSIGNMENTS;
        if (str_contains($title, 'الجدول الدراسي') || str_contains($title, 'جدول الحصص')) return self::SOURCE_SCHEDULE;
        if (str_contains($title, 'طلب الغياب') || str_contains($title, 'استئذان')) return self::SOURCE_ABSENCE;
        if (str_contains($title, 'سند قبض') || str_contains($title, 'مالي') || str_contains($title, 'رسوم')) return self::SOURCE_FINANCE;
        if (str_contains($title, 'تكليف تدريس')) return self::SOURCE_TEACHING;

        return self::SOURCE_OTHER;
    }

    /** من قرأ هذا الإشعار من أولياء الأمور والمعلمين */
    public function reads()
    {
        return $this->hasMany(NotificationRead::class);
    }

    /** المستخدمون الذين تُحفظ قراءتهم لكل شخص على حدة */
    public static function tracksReadPerUser($user): bool
    {
        return $user && in_array($user->role, ['parent', 'teacher'], true);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
