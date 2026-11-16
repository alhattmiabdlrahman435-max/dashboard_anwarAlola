<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAcademicYear;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use BelongsToAcademicYear;

    protected $guarded = [];

    /** كل روابط مرفقات الواجب بالترتيب (تُرسل للتطبيقات ولوحة التحكم) */
    protected $appends = ['attachment_urls'];

    protected $casts = [
        'edited_at' => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class, 'assignment_id');
    }

    public function attachments()
    {
        return $this->hasMany(AssignmentAttachment::class, 'assignment_id')->orderBy('sort_order');
    }

    /**
     * روابط المرفقات. الواجبات القديمة (قبل تعدد المرفقات) تُرجع attachment_url وحده.
     */
    public function getAttachmentUrlsAttribute(): array
    {
        $urls = $this->relationLoaded('attachments')
            ? $this->attachments->pluck('url')->all()
            : ($this->exists ? $this->attachments()->pluck('url')->all() : []);

        if (empty($urls) && !empty($this->attachment_url)) {
            $urls = [$this->attachment_url];
        }
        return array_values($urls);
    }
}
