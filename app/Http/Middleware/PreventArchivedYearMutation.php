<?php

namespace App\Http\Middleware;

use App\Services\AcademicYearService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventArchivedYearMutation
{
    /**
     * Block write operations (POST/PUT/PATCH/DELETE) when the active request targets an archived academic year,
     * except for academic-year management, backups, and authentication endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $next($request);
        }

        $path = ltrim($request->path(), '/');

        // Emergency bypass flag: strictly permitted for authenticated admins / super_admins only
        if ($request->boolean('force_archived_edit')) {
            $userRole = $request->user()?->role;
            if (in_array($userRole, ['admin', 'super_admin'], true)) {
                return $next($request);
            }
        }

        // Mutating endpoints that write grades (e.g. second-round scores) MUST NOT bypass the archived year lock
        $isSecondRoundPromotion = str_starts_with($path, 'api/academic-years/promotion/second-round');

        $allowedPrefixes = [
            'api/academic-years',
            'api/backups',
            'api/auth',
            'api/login',
            'api/logout',
        ];

        if (!$isSecondRoundPromotion) {
            foreach ($allowedPrefixes as $prefix) {
                if (str_starts_with($path, $prefix)) {
                    return $next($request);
                }
            }
        }

        $year = AcademicYearService::resolve($request);
        if ($year && $year->status === 'archived') {
            return response()->json([
                'success' => false,
                'code' => 'ARCHIVED_YEAR_READONLY',
                'message' => "العام الدراسي ({$year->name}) مؤرشف ومغلق للقراءة فقط؛ لا يمكن إضافة أو تعديل أو حذف بياناته.",
            ], 423);
        }

        return $next($request);
    }
}
