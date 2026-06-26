<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with('gradeLevel')->get();
        return response()->json([
            'success' => true,
            'classes' => $classes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_ar' => 'required|string',
            'name_en' => 'required|string',
            'grade_ar' => 'required|string',
            'grade_en' => 'required|string',
            'section_ar' => 'required|string',
            'section_en' => 'required|string',
            'grade_level_id' => 'nullable|integer'
        ]);

        $class = SchoolClass::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الفصل بنجاح',
            'class' => $class
        ], 201);
    }

    public function show(string $id)
    {
        $class = SchoolClass::with('gradeLevel')->find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }
        return response()->json(['success' => true, 'class' => $class]);
    }

    public function update(Request $request, string $id)
    {
        $class = SchoolClass::find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }

        $class->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الفصل بنجاح',
            'class' => $class
        ]);
    }

    public function destroy(string $id)
    {
        $class = SchoolClass::find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }
        $class->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الفصل بنجاح']);
    }
}
