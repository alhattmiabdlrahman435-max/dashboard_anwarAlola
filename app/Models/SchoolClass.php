<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $table = 'classes';
    protected $guarded = [];
    protected $appends = ['name_ar', 'name_en'];

    public function getNameArAttribute()
    {
        return $this->grade_ar . ' - ' . $this->section_ar;
    }

    public function getNameEnAttribute()
    {
        return $this->grade_en . ' - ' . $this->section_en;
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects', 'class_id', 'subject_id')->distinct();
    }
}
