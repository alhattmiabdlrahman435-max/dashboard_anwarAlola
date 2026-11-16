<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPriorRecord extends Model
{
    protected $fillable = [
        'student_id',
        'school_name',
        'academic_year_label',
        'grade_name',
        'term_label',
        'total_score',
        'max_score',
        'percentage',
        'result_status',
        'subject_grades',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'total_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'subject_grades' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
