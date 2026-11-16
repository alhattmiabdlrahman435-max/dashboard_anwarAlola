<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_current',
        'status',
        'created_by',
    ];

    protected $casts = [
        // Y-m-d صريح: بدونها يُرسل التاريخ بتوقيت UTC فيظهر في الواجهة يوماً أقل (31 أغسطس بدل 1 سبتمبر)
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_current' => 'boolean',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class, 'academic_year_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'academic_year_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'academic_year_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'academic_year_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'academic_year_id');
    }

    public function examSchedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class, 'academic_year_id');
    }
}
