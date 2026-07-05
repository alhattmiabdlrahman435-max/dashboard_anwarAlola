<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Notification::orderBy('created_at', 'desc');

        if ($user->role === 'parent') {
            $studentIds = Student::where('parent_id', $user->id)->pluck('id')->toArray();
            $classIds = Student::where('parent_id', $user->id)->pluck('class_id')->filter()->unique()->toArray();

            $query->where(function($q) use ($studentIds, $classIds) {
                $q->whereIn('student_id', $studentIds)
                  ->orWhereIn('class_id', $classIds)
                  ->orWhere(function($subQ) {
                      $subQ->whereNull('student_id')
                           ->whereNull('class_id')
                           ->whereNull('teacher_id');
                  });
            });
        } elseif ($user->role === 'teacher') {
            $query->where(function($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhere(function($subQ) {
                      $subQ->whereNull('student_id')
                           ->whereNull('class_id')
                           ->whereNull('teacher_id');
                  });
            });
        }

        $notifications = $query->get()->map(function($notif) use ($request) {
            // Map back to legacy target_type format to support frontend if it inspects them
            $targetType = 'all_parents';
            $targetId = null;
            
            if ($notif->student_id) {
                $targetType = 'by_student';
                $targetId = $notif->student_id;
            } elseif ($notif->class_id) {
                $targetType = 'by_class';
                $targetId = $notif->class_id;
            } elseif ($notif->teacher_id) {
                $targetType = 'specific_teacher';
                $targetId = $notif->teacher_id;
            }

            $attachmentUrl = $notif->attachment_url;
            if ($attachmentUrl) {
                $requestHost = $request->headers->get('host') ?: '192.168.8.188:8000';
                $attachmentUrl = str_replace(['127.0.0.1:8000', 'localhost:8000'], $requestHost, $attachmentUrl);
            }

            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'content' => $notif->content,
                'type' => $notif->type ?: 'general',
                'is_read' => $notif->is_read,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'attachment_url' => $attachmentUrl,
                'created_at' => $notif->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'target_type' => 'required|string|in:all_parents,by_class,by_student,all_teachers,specific_teacher',
            'target_id' => 'nullable|integer',
        ]);

        $studentId = null;
        $classId = null;
        $teacherId = null;

        if ($request->target_type === 'by_student') {
            $studentId = $request->target_id;
        } elseif ($request->target_type === 'by_class') {
            $classId = $request->target_id;
        } elseif ($request->target_type === 'specific_teacher') {
            $teacherId = $request->target_id;
        }

        $notification = Notification::create([
            'title' => $request->title,
            'content' => $request->content,
            'type' => 'broadcast',
            'is_read' => false,
            'student_id' => $studentId,
            'class_id' => $classId,
            'teacher_id' => $teacherId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم بث الإشعار بنجاح وإرساله للجهة المستهدفة',
            'notification' => [
                'id' => $notification->id,
                'title' => $notification->title,
                'content' => $notification->content,
                'target_type' => $request->target_type,
                'target_id' => $request->target_id,
                'created_at' => $notification->created_at,
            ]
        ], 201);
    }

    public function read($id)
    {
        $notif = Notification::findOrFail($id);
        $notif->update(['is_read' => true]);
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة قراءة الإشعار'
        ]);
    }
}
