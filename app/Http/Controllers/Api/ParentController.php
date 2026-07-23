<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Services\PermissionService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

use App\Http\Requests\ListRequest;

class ParentController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'national_id', 'phone', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:parents,view', only: ['index', 'show']),
            new Middleware('check.permission:parents,create', only: ['store']),
            new Middleware('check.permission:parents,update', only: ['update']),
            new Middleware('check.permission:parents,delete', only: ['destroy']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'parents');

        $query = User::parents();
        if ($scopedClassIds !== null) {
            $query->whereHas('children', function($q) use ($scopedClassIds) {
                $q->whereIn('class_id', $scopedClassIds);
            });
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->whereHas('children', function($q) use ($request) {
                $q->where('class_id', $request->input('class_id'));
            });
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('national_id', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe column selection
        $query->select([
            'id', 'name', 'username', 'role', 'national_id', 'phone', 'name_ar', 'name_en', 'photo_url', 'address', 'is_active', 'created_at'
        ]);

        $query->with(['children.schoolClass', 'children.attendances' => function($q) {
            $q->where('record_date', today()->toDateString());
        }]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $parents = collect($paginator->items())->map(function($parent) {
            $children = $parent->children->map(function($student) use ($parent) {
                $attendance = $student->attendances->first();
                return [
                    'id' => $student->id,
                    'student_code' => $student->student_code,
                    'name' => $student->name_ar,
                    'name_ar' => $student->name_ar,
                    'name_en' => $student->name_en,
                    'nameEn' => $student->name_en,
                    'grade' => $student->schoolClass ? $student->schoolClass->grade_ar : '',
                    'gradeEn' => $student->schoolClass ? $student->schoolClass->grade_en : '',
                    'section' => $student->schoolClass ? $student->schoolClass->section_ar : '',
                    'sectionEn' => $student->schoolClass ? $student->schoolClass->section_en : '',
                    'status' => $attendance ? $attendance->status : 'absent',
                    'photo' => $student->photo_url ?: '👨‍🎓',
                    'parentNationalId' => $parent->national_id,
                ];
            });

            return [
                'id' => $parent->id,
                'name' => $parent->name_ar,
                'name_ar' => $parent->name_ar,
                'name_en' => $parent->name_en,
                'username' => $parent->username,
                'role' => $parent->role,
                'national_id' => $parent->national_id,
                'phone' => $parent->phone,
                'photo' => $parent->photo_url ?: '🧔',
                'photo_url' => $parent->photo_url ?: '🧔',
                'address' => $parent->address,
                'is_active' => $parent->is_active,
                'created_at' => $parent->created_at,
                'children' => $children,
            ];
        });

        return response()->json([
            'success' => true,
            'parents' => $parents,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function store(Request $request)
    {
        $cleanNationalId = trim($request->input('national_id'));

        $request->merge(['national_id' => $cleanNationalId]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'national_id' => 'required|string',
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'phone' => 'required|string',
            'photo_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Check if national ID already exists in users or parents
        $existingUser = User::where('national_id', $cleanNationalId)
            ->orWhere('username', $cleanNationalId)
            ->first();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'عفواً، الرقم الوطني مُسجل مسبقاً لحساب ولي أمر آخر.'
            ], 400);
        }

        $photoUrl = $request->photo_url;
        if ($photoUrl && preg_match('/^data:image\/(\w+);base64,/', $photoUrl, $type)) {
            $data = substr($photoUrl, strpos($photoUrl, ',') + 1);
            $type = strtolower($type[1]);
            if (in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                $data = str_replace(' ', '+', $data);
                $data = base64_decode($data);
                if ($data !== false) {
                    $filename = time() . '_' . uniqid() . '.' . $type;
                    if (!file_exists(public_path('uploads/avatars'))) {
                        mkdir(public_path('uploads/avatars'), 0755, true);
                    }
                    file_put_contents(public_path('uploads/avatars/' . $filename), $data);
                    $photoUrl = asset('uploads/avatars/' . $filename);
                }
            }
        }

        try {
            $user = \Illuminate\Support\Facades\DB::transaction(function() use ($request, $cleanNationalId, $photoUrl) {
                $newUser = User::create([
                    'name' => $request->name_ar,
                    'username' => $cleanNationalId,
                    'national_id' => $cleanNationalId,
                    'password' => Hash::make($request->phone),
                    'role' => 'parent',
                    'name_ar' => $request->name_ar,
                    'name_en' => $request->name_en,
                    'phone' => $request->phone,
                    'photo_url' => $photoUrl ?: '🧔',
                    'is_active' => true,
                ]);

                // Also ensure record exists in parents table if applicable
                if (\Illuminate\Support\Facades\Schema::hasTable('parents')) {
                    \App\Models\ParentModel::firstOrCreate(
                        ['national_id' => $cleanNationalId],
                        [
                            'user_id' => $newUser->id,
                            'name_ar' => $request->name_ar,
                            'name_en' => $request->name_en,
                            'phone' => $request->phone,
                        ]
                    );
                }

                return $newUser;
            });

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة وتسجيل ولي الأمر بنجاح',
                'parent' => $user
            ], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error storing parent: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ غير متوقع أثناء إضافة ولي الأمر. يرجى التأكد من البيانات والمحاولة مرة أخرى.'
            ], 500);
        }
    }

    public function show(string $id)
    {
        $parent = User::parents()->find($id);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'ولي الأمر غير موجود'], 404);
        }
        return response()->json(['success' => true, 'parent' => $parent]);
    }

    public function update(Request $request, string $id)
    {
        $parent = User::parents()->find($id);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'ولي الأمر غير موجود'], 404);
        }

        $request->validate([
            'name_ar' => 'required|string',
            'name_en' => 'nullable|string',
            'phone' => 'required|string',
            'photo_url' => 'nullable|string',
        ]);

        $photoUrl = $request->photo_url;
        if ($photoUrl && preg_match('/^data:image\/(\w+);base64,/', $photoUrl, $type)) {
            $data = substr($photoUrl, strpos($photoUrl, ',') + 1);
            $type = strtolower($type[1]);
            if (in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                $data = str_replace(' ', '+', $data);
                $data = base64_decode($data);
                if ($data !== false) {
                    $filename = time() . '_' . uniqid() . '.' . $type;
                    if (!file_exists(public_path('uploads/avatars'))) {
                        mkdir(public_path('uploads/avatars'), 0755, true);
                    }
                    file_put_contents(public_path('uploads/avatars/' . $filename), $data);
                    $photoUrl = asset('uploads/avatars/' . $filename);
                }
            }
        }

        $parent->update([
            'name' => $request->name_ar,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'phone' => $request->phone,
            'password' => Hash::make($request->phone),
            'photo_url' => $photoUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات ولي الأمر بنجاح',
            'parent' => $parent
        ]);
    }

    public function destroy(string $id)
    {
        $parent = User::parents()->find($id);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'ولي الأمر غير موجود'], 404);
        }

        $parent->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف ولي الأمر وحسابه بالكامل']);
    }

    /**
     * جلب أبناء ولي الأمر
     */
    public function children(string $id)
    {
        $parent = User::parents()->find($id);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'ولي الأمر غير موجود'], 404);
        }

        $students = Student::where('parent_id', $parent->id)->with('schoolClass')->get();

        return response()->json([
            'success' => true,
            'students' => $students
        ]);
    }
}
