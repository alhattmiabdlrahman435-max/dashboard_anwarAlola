<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAcademicYear;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use BelongsToAcademicYear;

    protected $table = 'attendance';
    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
