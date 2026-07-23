<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SupervisorClass;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Http\Requests\ListRequest;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class VicePrincipalController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'job_id', 'phone', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:vicePrincipals,view', only: ['index', 'show']),
            new Middleware('check.permission:vicePrincipals,create', only: ['store']),
            new Middleware('check.permission:vicePrincipals,update', only: ['update']),
            new Middleware('check.permission:vicePrincipals,delete', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of vice principals (supervisors).
     */
    public function index(ListRequest $request)
    {
        $query = User::where('role', 'supervisor')->with('supervisorClasses');

        // Apply filters
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->input('is_active'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('username', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('job_id', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $vicePrincipals = $paginator->getCollection()->map(function ($vp) {
            $assignedClasses = $vp->supervisorClasses->pluck('class_id')->toArray();
            if (empty($assignedClasses) && !empty($vp->permissions['assigned_classes'])) {
                $assignedClasses = array_map('intval', (array) $vp->permissions['assigned_classes']);
            }
            return [
                'id' => $vp->id,
                'name' => $vp->name_ar ?? $vp->name,
                'nameEn' => $vp->name_en,
                'username' => $vp->username,
                'jobId' => $vp->job_id,
                'nationalId' => $vp->national_id,
                'phone' => $vp->phone,
                'photoUrl' => $vp->photo_url,
                'isActive' => $vp->is_active,
                'permissions' => $vp->permissions,
                'classes' => $assignedClasses,
                'lastLogin' => $vp->last_login,
                'createdAt' => $vp->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $vicePrincipals,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    /**
     * Store a newly created vice principal.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name_ar' => 'required|string|max:255',
            'job_id' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:4',
            'permissions' => 'nullable|array',
            'classes' => 'nullable|array',
        ]);

        $jobId = $request->job_id;

        // Check if job_id already exists
        $exists = User::where('job_id', $jobId)
            ->orWhere('username', $jobId)
            ->orWhere('national_id', $jobId)
            ->first();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الرقم الوظيفي مستخدم بالفعل.',
            ], 422);
        }

        $user = User::create([
            'name' => $request->name_ar,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en ?? $request->name_ar,
            'username' => $jobId,
            'national_id' => $jobId,
            'job_id' => $jobId,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'supervisor',
            'is_active' => true,
            'permissions' => $request->permissions,
            'photo_url' => '👨‍💼',
        ]);

        // Sync assigned classes in supervisor_classes table
        $classIds = $request->input('classes', $request->input('permissions.assigned_classes', []));
        if (is_array($classIds)) {
            foreach ($classIds as $cid) {
                SupervisorClass::create([
                    'supervisor_id' => $user->id,
                    'class_id' => (int) $cid
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب الوكيل بنجاح.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name_ar,
                'nameEn' => $user->name_en,
                'username' => $user->username,
                'jobId' => $user->job_id,
                'nationalId' => $user->national_id,
                'phone' => $user->phone,
                'permissions' => $user->permissions,
                'classes' => array_map('intval', (array) $classIds),
                'isActive' => $user->is_active,
            ],
        ], 201);
    }

    /**
     * Display the specified vice principal.
     */
    public function show(string $id)
    {
        $vp = User::where('id', $id)->where('role', 'supervisor')->with('supervisorClasses')->first();

        if (!$vp) {
            return response()->json(['success' => false, 'message' => 'الوكيل غير موجود.'], 404);
        }

        $assignedClasses = $vp->supervisorClasses->pluck('class_id')->toArray();
        if (empty($assignedClasses) && !empty($vp->permissions['assigned_classes'])) {
            $assignedClasses = array_map('intval', (array) $vp->permissions['assigned_classes']);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $vp->id,
                'name' => $vp->name_ar ?? $vp->name,
                'nameEn' => $vp->name_en,
                'username' => $vp->username,
                'jobId' => $vp->job_id,
                'nationalId' => $vp->national_id,
                'phone' => $vp->phone,
                'photoUrl' => $vp->photo_url,
                'isActive' => $vp->is_active,
                'permissions' => $vp->permissions,
                'classes' => $assignedClasses,
                'lastLogin' => $vp->last_login,
            ],
        ]);
    }

    /**
     * Update the specified vice principal.
     */
    public function update(Request $request, string $id)
    {
        $vp = User::where('id', $id)->where('role', 'supervisor')->first();

        if (!$vp) {
            return response()->json(['success' => false, 'message' => 'الوكيل غير موجود.'], 404);
        }

        $request->validate([
            'name_ar' => 'sometimes|string|max:255',
            'job_id' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'permissions' => 'nullable|array',
            'classes' => 'nullable|array',
        ]);

        if ($request->has('name_ar')) {
            $vp->name = $request->name_ar;
            $vp->name_ar = $request->name_ar;
        }
        if ($request->has('name_en')) {
            $vp->name_en = $request->name_en;
        }
        if ($request->has('job_id')) {
            $jobId = $request->job_id;
            // Check uniqueness excluding current user
            $exists = User::where('id', '!=', $vp->id)
                ->where(function ($q) use ($jobId) {
                    $q->where('job_id', $jobId)
                      ->orWhere('username', $jobId)
                      ->orWhere('national_id', $jobId);
                })->first();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا الرقم الوظيفي مستخدم بالفعل.',
                ], 422);
            }

            $vp->username = $jobId;
            $vp->national_id = $jobId;
            $vp->job_id = $jobId;
        }
        if ($request->has('phone')) {
            $vp->phone = $request->phone;
        }
        if ($request->has('password') && !empty($request->password)) {
            $vp->password = Hash::make($request->password);
        }
        if ($request->has('permissions')) {
            $vp->permissions = $request->permissions;
        }
        if ($request->has('is_active')) {
            $vp->is_active = $request->is_active;
        }

        $vp->save();

        if ($request->has('classes') || isset($request->permissions['assigned_classes'])) {
            $classIds = $request->input('classes', $request->input('permissions.assigned_classes', []));
            if (is_array($classIds)) {
                SupervisorClass::where('supervisor_id', $vp->id)->delete();
                foreach ($classIds as $cid) {
                    SupervisorClass::create([
                        'supervisor_id' => $vp->id,
                        'class_id' => (int) $cid
                    ]);
                }
            }
        }

        $assignedClasses = $vp->supervisorClasses()->pluck('class_id')->toArray();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الوكيل بنجاح.',
            'data' => [
                'id' => $vp->id,
                'name' => $vp->name_ar,
                'nameEn' => $vp->name_en,
                'username' => $vp->username,
                'jobId' => $vp->job_id,
                'nationalId' => $vp->national_id,
                'phone' => $vp->phone,
                'permissions' => $vp->permissions,
                'classes' => $assignedClasses,
                'isActive' => $vp->is_active,
            ],
        ]);
    }

    /**
     * Remove the specified vice principal.
     */
    public function destroy(string $id)
    {
        $vp = User::where('id', $id)->where('role', 'supervisor')->first();

        if (!$vp) {
            return response()->json(['success' => false, 'message' => 'الوكيل غير موجود.'], 404);
        }

        $vp->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف حساب الوكيل بنجاح.',
        ]);
    }
}
