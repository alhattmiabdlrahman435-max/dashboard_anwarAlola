<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\SupervisorClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

use App\Http\Requests\ListRequest;

class PrepSupervisorController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'job_id', 'phone', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:prepSupervisors,view', only: ['index']),
            new Middleware('check.permission:prepSupervisors,create', only: ['store']),
            new Middleware('check.permission:prepSupervisors,update', only: ['update']),
            new Middleware('check.permission:prepSupervisors,delete', only: ['destroy']),
        ];
    }
    public function index(ListRequest $request)
    {
        $query = User::preparationSupervisors()->with('supervisorClasses.schoolClass');

        // Apply filters
        if ($request->filled('class_id')) {
            $query->whereHas('supervisorClasses', function($q) use ($request) {
                $q->where('class_id', $request->input('class_id'));
            });
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('job_id', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'name', 'username', 'role', 'national_id', 'job_id', 'phone', 'name_ar', 'name_en', 'photo_url', 'address', 'is_active', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $supervisors = $paginator->getCollection()->map(function ($s) {
            return [
                'id'      => $s->id,
                'jobId'   => $s->job_id,
                'name'    => $s->name_ar ?? $s->name,
                'nameEn'  => $s->name_en ?? $s->name,
                'phone'   => $s->phone,
                'photo'   => $s->photo_url ?: '👩‍🏫',
                'classes' => $s->supervisorClasses->map(function ($sc) {
                    return $sc->schoolClass ? ($sc->schoolClass->name_ar ?? $sc->schoolClass->name) : '';
                })->filter()->values()->toArray()
            ];
        });

        return response()->json([
            'success'     => true,
            'supervisors' => $supervisors,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    private function findClassByName($className)
    {
        $parts = explode(' - ', $className);
        if (count($parts) === 2) {
            $class = SchoolClass::where('grade_ar', trim($parts[0]))
                ->where('section_ar', trim($parts[1]))
                ->first();
            if ($class) {
                return $class;
            }

            $class = SchoolClass::where('grade_en', trim($parts[0]))
                ->where('section_en', trim($parts[1]))
                ->first();
            if ($class) {
                return $class;
            }
        }

        return SchoolClass::where('grade_ar', $className)
            ->orWhere('grade_en', $className)
            ->first();
    }

    public function store(Request $request)
    {
        $request->validate([
            'jobId'   => 'required|string|unique:users,job_id',
            'name'    => 'required|string',
            'phone'   => 'required|string',
            'password'=> 'nullable|string',
            'classes' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request) {
            $nameEnFallback = collect(explode(' ', $request->name))
                ->map(fn($n) => ucfirst($n))
                ->implode(' ');

            $user = User::create([
                'name'        => $request->name,
                'username'    => $request->jobId,
                'national_id' => $request->jobId,
                'job_id'      => $request->jobId,
                'password'    => Hash::make($request->password ?: $request->phone),
                'role'        => 'preparation_supervisor',
                'name_ar'     => $request->name,
                'name_en'     => $nameEnFallback,
                'phone'       => $request->phone,
                'photo_url'   => '👩‍🏫',
                'is_active'   => true,
            ]);

            // Handle base64 photo upload
            if ($request->filled('photo') && str_starts_with($request->photo, 'data:image')) {
                $photoData = $request->photo;
                $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $photoData);
                $photoData = base64_decode($photoData);
                $fileName = 'supervisor_' . $user->id . '_' . time() . '.jpg';
                $uploadPath = public_path('uploads/avatars');
                if (!File::isDirectory($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                }
                file_put_contents($uploadPath . '/' . $fileName, $photoData);
                $user->update(['photo_url' => asset('uploads/avatars/' . $fileName)]);
            }

            if ($request->has('classes') && is_array($request->classes)) {
                foreach ($request->classes as $className) {
                    $class = $this->findClassByName($className);
                    if ($class) {
                        SupervisorClass::create([
                            'supervisor_id' => $user->id,
                            'class_id'      => $class->id
                        ]);
                    }
                }
            }

            return response()->json([
                'success'    => true,
                'message'    => 'تم إضافة مشرف التحضير بنجاح وقابل للدخول من التطبيق.',
                'supervisor' => [
                    'id'      => $user->id,
                    'jobId'   => $user->job_id,
                    'name'    => $user->name_ar,
                    'nameEn'  => $user->name_en,
                    'phone'   => $user->phone,
                    'photo'   => $user->photo_url,
                    'classes' => $request->classes ?: []
                ]
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'jobId'   => 'required|string|unique:users,job_id,' . $user->id,
            'name'    => 'required|string',
            'phone'   => 'required|string',
            'password'=> 'nullable|string',
            'classes' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $user) {
            $user->name = $request->name;
            $user->name_ar = $request->name;
            $user->job_id = $request->jobId;
            $user->username = $request->jobId;
            $user->phone = $request->phone;
            $user->national_id = $request->jobId;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            // Handle base64 photo upload
            if ($request->filled('photo') && str_starts_with($request->photo, 'data:image')) {
                $photoData = $request->photo;
                $photoData = preg_replace('/^data:image\/\w+;base64,/', '', $photoData);
                $photoData = base64_decode($photoData);
                $fileName = 'supervisor_' . $user->id . '_' . time() . '.jpg';
                $uploadPath = public_path('uploads/avatars');
                if (!File::isDirectory($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                }
                file_put_contents($uploadPath . '/' . $fileName, $photoData);
                $user->photo_url = asset('uploads/avatars/' . $fileName);
            }

            $user->save();

            // Sync classes
            SupervisorClass::where('supervisor_id', $user->id)->delete();
            if ($request->has('classes') && is_array($request->classes)) {
                foreach ($request->classes as $className) {
                    $class = $this->findClassByName($className);
                    if ($class) {
                        SupervisorClass::create([
                            'supervisor_id' => $user->id,
                            'class_id'      => $class->id
                        ]);
                    }
                }
            }

            return response()->json([
                'success'    => true,
                'message'    => 'تم تحديث بيانات مشرف التحضير بنجاح.',
                'supervisor' => [
                    'id'      => $user->id,
                    'jobId'   => $user->job_id,
                    'name'    => $user->name_ar,
                    'nameEn'  => $user->name_en,
                    'phone'   => $user->phone,
                    'photo'   => $user->photo_url,
                    'classes' => $request->classes ?: []
                ]
            ]);
        });
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        SupervisorClass::where('supervisor_id', $user->id)->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف مشرف التحضير بنجاح.'
        ]);
    }
}
