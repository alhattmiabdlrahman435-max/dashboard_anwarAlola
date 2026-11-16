<?php

namespace App\Services;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearService
{
    /**
     * Resolve the active AcademicYear for the current request:
     * 1. Explicit `?academic_year_id=` query parameter
     * 2. `X-Academic-Year-Id` HTTP header
     * 3. The year marked `is_current = true`
     * 4. Latest AcademicYear record as fallback
     */
    public static function resolve(?Request $request = null): ?AcademicYear
    {
        $req = $request ?? request();
        $requestedId = $req?->input('academic_year_id')
            ?? $req?->query('academic_year_id')
            ?? $req?->header('X-Academic-Year-Id');

        if ($requestedId !== null && $requestedId !== '') {
            $year = AcademicYear::find((int) $requestedId);
            if ($year) {
                return $year;
            }
        }

        return AcademicYear::where('is_current', true)->first()
            ?? AcademicYear::orderByDesc('id')->first();
    }

    public static function resolveId(?Request $request = null): ?int
    {
        return self::resolve($request)?->id;
    }

    public static function current(): ?AcademicYear
    {
        return AcademicYear::where('is_current', true)->first()
            ?? AcademicYear::orderByDesc('id')->first();
    }

    public static function currentId(): ?int
    {
        return self::current()?->id;
    }
}
