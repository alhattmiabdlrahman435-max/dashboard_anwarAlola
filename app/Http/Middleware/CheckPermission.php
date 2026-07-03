<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\PermissionService;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     * Usage in routes: ->middleware('check.permission:module,action')
     * Example: ->middleware('check.permission:students,delete')
     */
    public function handle(Request $request, Closure $next, string $module, string $action): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصادق. يرجى تسجيل الدخول.',
            ], 401);
        }

        if (!PermissionService::can($user, $module, $action)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإجراء هذه العملية.',
            ], 403);
        }

        return $next($request);
    }
}
