<?php

namespace App\Models\Concerns;

use App\Models\AcademicYear;
use App\Services\AcademicYearService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToAcademicYear
{
    public static function bootBelongsToAcademicYear(): void
    {
        static::creating(function ($model) {
            if (empty($model->academic_year_id)) {
                $model->academic_year_id = AcademicYearService::resolveId();
            }
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function scopeForAcademicYear(Builder $query, ?int $academicYearId = null): Builder
    {
        $yearId = $academicYearId ?? AcademicYearService::resolveId();
        if (!$yearId) {
            return $query;
        }
        return $query->where($this->getTable() . '.academic_year_id', $yearId);
    }
}
