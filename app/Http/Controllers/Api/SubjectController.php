<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::all();
        return response()->json([
            'success' => true,
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_ar' => 'required|string',
            'name_en' => 'required|string',
        ]);

        $subject = Subject::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المادة الدراسية بنجاح',
            'subject' => $subject
        ], 201);
    }

    public function show(string $id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'المادة الدراسية غير موجودة'], 404);
        }
        return response()->json(['success' => true, 'subject' => $subject]);
    }

    public function update(Request $request, string $id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'المادة الدراسية غير موجودة'], 404);
        }

        $subject->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المادة الدراسية بنجاح',
            'subject' => $subject
        ]);
    }

    public function destroy(string $id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'المادة الدراسية غير موجودة'], 404);
        }
        $subject->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف المادة الدراسية بنجاح']);
    }
}
