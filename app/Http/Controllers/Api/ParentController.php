<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Services\PermissionService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ParentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:parents,view', only: ['index', 'show']),
            new Middleware('check.permission:parents,create', only: ['store']),
            new Middleware('check.permission:parents,update', only: ['update']),
            new Middleware('check.permission:parents,delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'parents');

        $query = User::parents();
        if ($scopedClassIds !== null) {
            $query->whereHas('children', function($q) use ($scopedClassIds) {
                $q->whereIn('class_id', $scopedClassIds);
            });
        }

        $parents = $query->get();
        return response()->json([
            'success' => true,
            'parents' => $parents
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'national_id' => 'required|string|unique:users,national_id',
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

        $user = User::create([
            'name' => $request->name_ar,
            'username' => $request->national_id,
            'national_id' => $request->national_id,
            'password' => Hash::make($request->phone),
            'role' => 'parent',
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'phone' => $request->phone,
            'photo_url' => $photoUrl ?: '🧔',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة ولي الأمر بنجاح',
            'parent' => $user
        ], 201);
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
