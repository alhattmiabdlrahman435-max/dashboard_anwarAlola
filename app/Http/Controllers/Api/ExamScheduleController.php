<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\ExamSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamScheduleController extends Controller
{
    public function index()
    {
        $schedules = ExamSchedule::with('examSubjects.subject')->orderBy('created_at', 'desc')->get()->map(function($sch) {
            $subjectsArray = $sch->examSubjects->map(function($item) {
                return [
                    'id' => $item->id,
                    'subject_id' => $item->subject_id,
                    'name_ar' => $item->subject ? $item->subject->name_ar : '',
                    'name_en' => $item->subject ? $item->subject->name_en : '',
                    'exam_date' => $item->exam_date,
                    'exam_time' => $item->exam_time,
                    'note' => $item->note,
                ];
            });

            return [
                'id' => $sch->id,
                'title' => $sch->title,
                'class_id' => $sch->class_id,
                'term' => $sch->term,
                'created_by' => $sch->created_by,
                'subjects' => $subjectsArray,
                'created_at' => $sch->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'exam_schedules' => $schedules
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'class_id' => 'nullable|integer',
            'term' => 'nullable|string',
            'subjects' => 'required|array',
        ]);

        return DB::transaction(function() use ($request) {
            $schedule = ExamSchedule::create([
                'title' => $request->title,
                'class_id' => $request->class_id,
                'term' => $request->term,
                'created_by' => auth()->id()
            ]);

            foreach ($request->subjects as $sub) {
                ExamSubject::create([
                    'exam_schedule_id' => $schedule->id,
                    'subject_id' => $sub['subject_id'],
                    'exam_date' => $sub['exam_date'],
                    'exam_time' => $sub['exam_time'],
                    'note' => $sub['note'] ?? null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء جدول الاختبارات بنجاح',
                'exam_schedule' => $schedule->load('examSubjects.subject')
            ], 201);
        });
    }

    public function show(string $id)
    {
        $schedule = ExamSchedule::with('examSubjects.subject')->find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }

        $subjectsArray = $schedule->examSubjects->map(function($item) {
            return [
                'id' => $item->id,
                'subject_id' => $item->subject_id,
                'name_ar' => $item->subject ? $item->subject->name_ar : '',
                'name_en' => $item->subject ? $item->subject->name_en : '',
                'exam_date' => $item->exam_date,
                'exam_time' => $item->exam_time,
                'note' => $item->note,
            ];
        });

        $mappedSchedule = [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'class_id' => $schedule->class_id,
            'term' => $schedule->term,
            'created_by' => $schedule->created_by,
            'subjects' => $subjectsArray,
            'created_at' => $schedule->created_at,
        ];

        return response()->json([
            'success' => true,
            'exam_schedule' => $mappedSchedule
        ]);
    }

    public function update(Request $request, string $id)
    {
        $schedule = ExamSchedule::find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }

        $request->validate([
            'title' => 'required|string',
            'class_id' => 'nullable|integer',
            'term' => 'nullable|string',
            'subjects' => 'required|array',
        ]);

        return DB::transaction(function() use ($request, $schedule) {
            $schedule->update([
                'title' => $request->title,
                'class_id' => $request->class_id,
                'term' => $request->term,
            ]);

            // Clear old entries
            ExamSubject::where('exam_schedule_id', $schedule->id)->delete();

            foreach ($request->subjects as $sub) {
                ExamSubject::create([
                    'exam_schedule_id' => $schedule->id,
                    'subject_id' => $sub['subject_id'],
                    'exam_date' => $sub['exam_date'],
                    'exam_time' => $sub['exam_time'],
                    'note' => $sub['note'] ?? null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث جدول الاختبارات بنجاح',
                'exam_schedule' => $schedule->load('examSubjects.subject')
            ]);
        });
    }

    public function destroy(string $id)
    {
        $schedule = ExamSchedule::find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'الجدول غير موجود'], 404);
        }
        $schedule->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف جدول الاختبارات بنجاح'
        ]);
    }
}
