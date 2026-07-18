<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SubjectController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:subjects,view', only: ['index', 'show']),
            new Middleware('check.permission:subjects,create', only: ['store']),
            new Middleware('check.permission:subjects,update', only: ['update']),
            new Middleware('check.permission:subjects,delete', only: ['destroy']),
        ];
    }

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

    public function syncClasses(Request $request, $id)
    {
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'المادة الدراسية غير موجودة'], 404);
        }

        $request->validate([
            'classes' => 'present|array',
        ]);

        // Look up class IDs by their grade_ar - section_ar (name_ar)
        $classNames = $request->classes;
        $classIds = [];
        foreach ($classNames as $name) {
            $parts = explode(' - ', $name);
            if (count($parts) === 2) {
                $cls = \App\Models\SchoolClass::where('grade_ar', $parts[0])
                    ->where('section_ar', $parts[1])
                    ->first();
                if ($cls) {
                    $classIds[] = $cls->id;
                }
            }
        }

        // Delete relations for classes not in the list
        \App\Models\TeacherSubject::where('subject_id', $subject->id)
            ->whereNotIn('class_id', $classIds)
            ->delete();

        // Assign to new classes
        $defaultTeacher = \App\Models\User::where('role', 'teacher')->first() ?? \App\Models\User::where('role', 'admin')->first();
        $defaultTeacherId = $defaultTeacher ? $defaultTeacher->id : null;

        foreach ($classIds as $clsId) {
            $exists = \App\Models\TeacherSubject::where('class_id', $clsId)
                ->where('subject_id', $subject->id)
                ->exists();
            if (!$exists) {
                $otherAssign = \App\Models\TeacherSubject::where('subject_id', $subject->id)
                    ->whereNotNull('teacher_id')
                    ->first();
                $tId = $otherAssign ? $otherAssign->teacher_id : $defaultTeacherId;

                \App\Models\TeacherSubject::create([
                    'class_id' => $clsId,
                    'subject_id' => $subject->id,
                    'teacher_id' => $tId,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث فصول المادة بنجاح'
        ]);
    }
}
