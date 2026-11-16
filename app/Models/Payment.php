<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAcademicYear;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use BelongsToAcademicYear;

    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
