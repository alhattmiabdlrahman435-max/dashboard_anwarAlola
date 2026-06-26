<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $table = 'classes';
    protected $guarded = [];

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }
}
