<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'password',
        'username', 'role',
        'national_id', 'job_id',
        'name_ar', 'name_en',
        'phone', 'photo_url',
        'is_active', 'last_login',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'last_login' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    // Scopes
    public function scopeParents($query)
    {
        return $query->where('role', 'parent');
    }

    public function scopeTeachers($query)
    {
        return $query->where('role', 'teacher');
    }

    public function scopeSupervisors($query)
    {
        return $query->where('role', 'supervisor');
    }

    public function scopePreparationSupervisors($query)
    {
        return $query->where('role', 'preparation_supervisor');
    }

    // العلاقات
    public function children()
    {
        return $this->hasMany(Student::class, 'parent_id');
    }

    public function teacherSubjects()
    {
        return $this->hasMany(TeacherSubject::class, 'teacher_id');
    }

    public function supervisorClasses()
    {
        return $this->hasMany(SupervisorClass::class, 'supervisor_id');
    }
}
