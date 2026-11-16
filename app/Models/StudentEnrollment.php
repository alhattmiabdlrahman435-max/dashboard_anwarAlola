<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends Model
{
    protected $fillable = [
        'student_id',
        'academic_year_id',
        'class_id',
        'status',
        'seat_number',
        'secret_code',
        'committee_number',
        'tuition_fee',
        'previous_balance',
        'notes',
    ];

    protected $casts = [
        'tuition_fee' => 'decimal:2',
        'previous_balance' => 'decimal:2',
        'seat_number' => 'string',
        'committee_number' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }
}
