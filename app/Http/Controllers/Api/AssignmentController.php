<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index()
    {
        $assignments = Assignment::with(['teacher', 'schoolClass', 'subject'])->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'assignments' => $assignments
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|integer',
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'title' => 'required|string',
            'content' => 'nullable|string',
            'due_date' => 'required|date',
        ]);

        $assignment = Assignment::create([
            'teacher_id' => $request->teacher_id,
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id,
            'title' => $request->title,
            'content' => $request->content,
            'due_date' => $request->due_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الواجب بنجاح',
            'assignment' => $assignment
        ], 201);
    }

    public function show(string $id)
    {
        $assignment = Assignment::with(['teacher', 'schoolClass', 'subject'])->find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }
        return response()->json(['success' => true, 'assignment' => $assignment]);
    }

    public function update(Request $request, string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }

        $assignment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الواجب بنجاح',
            'assignment' => $assignment
        ]);
    }

    public function destroy(string $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'الواجب غير موجود'], 404);
        }
        $assignment->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الواجب بنجاح']);
    }

    /**
     * عرض تسليمات الواجب
     */
    public function submissions(string $id)
    {
        $submissions = AssignmentSubmission::with('student')
                                            ->where('assignment_id', $id)
                                            ->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    /**
     * تحديث رصد تسليمات الواجبات للطلاب
     */
    public function updateSubmissions(Request $request, string $id)
    {
        $request->validate([
            'submissions' => 'required|array', // array of { student_id, status, teacher_note }
        ]);

        foreach ($request->submissions as $sub) {
            AssignmentSubmission::updateOrCreate(
                [
                    'assignment_id' => $id,
                    'student_id' => $sub['student_id'],
                ],
                [
                    'status' => $sub['status'] ?: 'pending',
                    'teacher_note' => $sub['teacher_note'] ?: null,
                    'submitted_at' => $sub['status'] === 'submitted' ? now() : null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث ورصد تسليمات الواجب بنجاح'
        ]);
    }
}
