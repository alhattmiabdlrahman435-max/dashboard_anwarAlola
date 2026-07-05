<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

    public function index()
    {
        $parents = User::parents()->get();
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

        $user = User::create([
            'name' => $request->name_ar,
            'username' => $request->national_id,
            'national_id' => $request->national_id,
            'password' => Hash::make($request->phone),
            'role' => 'parent',
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'phone' => $request->phone,
            'photo_url' => $request->photo_url ?: '🧔',
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

        $parent->update([
            'name' => $request->name_ar,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'phone' => $request->phone,
            'password' => Hash::make($request->phone),
            'photo_url' => $request->photo_url,
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
