<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class NotificationController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:communications,view', only: ['index', 'markAllRead']),
            new Middleware('check.permission:communications,create', only: ['send']),
            new Middleware('check.permission:communications,delete', only: ['destroy']),
            new Middleware('check.permission:communications,deleteAll', only: ['deleteAll']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $query = Notification::query();

        if ($user->role === 'parent') {
            $studentIds = Student::where('parent_id', $user->id)->pluck('id')->toArray();
            $classIds = Student::where('parent_id', $user->id)->pluck('class_id')->filter()->unique()->toArray();

            $query->where(function($q) use ($studentIds, $classIds) {
                $q->whereIn('student_id', $studentIds)
                  ->orWhereIn('class_id', $classIds)
                  ->orWhere(function($subQ) {
                      $subQ->whereNull('student_id')
                           ->whereNull('class_id')
                           ->whereNull('teacher_id')
                           ->whereIn('type', ['broadcast_parents', 'general']);
                  });
            });
        } elseif ($user->role === 'teacher') {
            $query->where(function($q) use ($user) {
                $q->where('teacher_id', $user->id)
                  ->orWhere(function($subQ) {
                      $subQ->whereNull('student_id')
                           ->whereNull('class_id')
                           ->whereNull('teacher_id')
                           ->whereIn('type', ['broadcast_teachers', 'general']);
                  });
            });
        } else {
            // Admins/Supervisors: Exclude transactional notifications meant for parent/teacher mobile apps.
            // - type 'alert', 'attendance', 'excuse_status' are for mobile apps only.
            // - notifications with teacher_id set are private feedback for that teacher only.
            $query->whereNotIn('type', ['alert', 'attendance', 'excuse_status'])
                  ->whereNull('teacher_id');

            $scopedClassIds = PermissionService::getScopedClassIds($user, 'communications');
            if ($scopedClassIds !== null) {
                $query->where(function($q) use ($scopedClassIds) {
                    $q->whereIn('class_id', $scopedClassIds)
                      ->orWhereHas('student', function($sq) use ($scopedClassIds) {
                          $sq->whereIn('class_id', $scopedClassIds);
                      })
                      ->orWhere(function($subQ) {
                          $subQ->whereNull('student_id')
                               ->whereNull('class_id')
                               ->whereNull('teacher_id');
                      });
                });
            }
        }

        // Apply filters
        if ($request->filled('target_type')) {
            $targetType = $request->input('target_type');
            if ($targetType === 'all_parents' || $targetType === 'parents') {
                $query->where('type', 'broadcast_parents');
            } elseif ($targetType === 'all_teachers' || $targetType === 'teachers') {
                $query->where('type', 'broadcast_teachers');
            } elseif ($targetType === 'by_class' || $targetType === 'classes') {
                $query->where('type', 'broadcast')->whereNotNull('class_id');
            } elseif ($targetType === 'by_student' || $targetType === 'private' || $targetType === 'student') {
                $query->where('type', 'broadcast')->where(function($q) {
                    $q->whereNotNull('student_id')->orWhereNotNull('teacher_id');
                });
            }
        } elseif ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'title', 'content', 'type', 'is_read', 'student_id', 'class_id', 'teacher_id', 'attachment_url', 'created_at'
        ]);

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $notifications = $paginator->getCollection()->map(function($notif) use ($request) {
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
            } elseif ($notif->type === 'broadcast_teachers') {
                $targetType = 'all_teachers';
            } elseif ($notif->type === 'broadcast_parents') {
                $targetType = 'all_parents';
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
            'notifications' => $notifications,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'target_type' => 'required|string|in:all_users,all_parents,by_class,by_student,all_teachers,specific_teacher',
            'target_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'communications');
        if ($scopedClassIds !== null) {
            if ($request->target_type === 'by_class' && !in_array($request->target_id, $scopedClassIds)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بنشر إشعار لهذا الصف الدراسي.'], 403);
            }
            if ($request->target_type === 'by_student') {
                $student = Student::find($request->target_id);
                if ($student && !in_array($student->class_id, $scopedClassIds)) {
                    return response()->json(['success' => false, 'message' => 'غير مصرح لك بنشر إشعار لهذا الطالب.'], 403);
                }
            }
            if (in_array($request->target_type, ['all_users', 'all_parents', 'all_teachers', 'specific_teacher'])) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بنشر إشعارات عامة لجميع المعلمين أو أولياء الأمور.'], 403);
            }
        }

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

        $type = 'broadcast';
        if ($request->target_type === 'all_users') {
            $type = 'general';
        } elseif ($request->target_type === 'all_teachers') {
            $type = 'broadcast_teachers';
        } elseif ($request->target_type === 'all_parents') {
            $type = 'broadcast_parents';
        }

        $notification = Notification::create([
            'title' => $request->title,
            'content' => $request->content,
            'type' => $type,
            'is_read' => false,
            'student_id' => $studentId,
            'class_id' => $classId,
            'teacher_id' => $teacherId,
        ]);

        // Collect target FCM tokens
        $tokens = [];
        if ($request->target_type === 'all_users') {
            $tokens = \App\Models\UserFcmToken::whereHas('user', function($q) {
                    $q->whereIn('role', ['parent', 'teacher']);
                })
                ->pluck('fcm_token')
                ->toArray();
            
            $oldTokens = \App\Models\User::whereIn('role', ['parent', 'teacher'])
                ->whereNotNull('fcm_token')
                ->where('fcm_token', '!=', '')
                ->pluck('fcm_token')
                ->toArray();
            $tokens = array_unique(array_merge($tokens, $oldTokens));
        } elseif ($request->target_type === 'all_parents') {
            $tokens = \App\Models\UserFcmToken::whereHas('user', function($q) {
                    $q->where('role', 'parent');
                })
                ->pluck('fcm_token')
                ->toArray();
            
            $oldTokens = \App\Models\User::where('role', 'parent')
                ->whereNotNull('fcm_token')
                ->where('fcm_token', '!=', '')
                ->pluck('fcm_token')
                ->toArray();
            $tokens = array_unique(array_merge($tokens, $oldTokens));
        } elseif ($request->target_type === 'all_teachers') {
            $tokens = \App\Models\UserFcmToken::whereHas('user', function($q) {
                    $q->where('role', 'teacher');
                })
                ->pluck('fcm_token')
                ->toArray();

            $oldTokens = \App\Models\User::where('role', 'teacher')
                ->whereNotNull('fcm_token')
                ->where('fcm_token', '!=', '')
                ->pluck('fcm_token')
                ->toArray();
            $tokens = array_unique(array_merge($tokens, $oldTokens));
        } elseif ($request->target_type === 'specific_teacher') {
            $teacher = \App\Models\User::find($teacherId);
            if ($teacher) {
                $teacherTokens = \App\Models\UserFcmToken::where('user_id', $teacher->id)->pluck('fcm_token')->toArray();
                if ($teacher->fcm_token) $teacherTokens[] = $teacher->fcm_token;
                $tokens = array_unique($teacherTokens);
            }
        } elseif ($request->target_type === 'by_student') {
            $student = \App\Models\Student::with('parentUser')->find($studentId);
            if ($student && $student->parentUser) {
                $parentUser = $student->parentUser;
                $parentTokens = \App\Models\UserFcmToken::where('user_id', $parentUser->id)->pluck('fcm_token')->toArray();
                if ($parentUser->fcm_token) $parentTokens[] = $parentUser->fcm_token;
                $tokens = array_unique($parentTokens);
            }
        } elseif ($request->target_type === 'by_class') {
            $students = \App\Models\Student::with('parentUser')->where('class_id', $classId)->get();
            $parentIds = $students->pluck('parentUser')->filter()->pluck('id')->unique()->toArray();
            $tokens = \App\Models\UserFcmToken::whereIn('user_id', $parentIds)->pluck('fcm_token')->toArray();
            
            $oldTokens = \App\Models\User::whereIn('id', $parentIds)
                ->whereNotNull('fcm_token')
                ->where('fcm_token', '!=', '')
                ->pluck('fcm_token')
                ->toArray();
            $tokens = array_unique(array_merge($tokens, $oldTokens));
        }

        // Send FCM push notifications
        foreach ($tokens as $token) {
            \App\Services\FcmService::sendNotification(
                $token,
                $request->title,
                $request->content,
                [
                    'type' => 'notifications',
                    'id' => (string)$notification->id,
                ]
            );
        }

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

    public function readAll()
    {
        $user = auth()->user();
        $query = Notification::where('is_read', false);

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
        } else {
            $query->whereNotIn('type', ['alert', 'attendance', 'excuse_status']);
        }

        $query->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديد جميع الإشعارات كمقروءة'
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $notif = Notification::findOrFail($id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'communications');
        if ($scopedClassIds !== null) {
            if ($notif->class_id && !in_array($notif->class_id, $scopedClassIds)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بحذف هذا الإشعار.'], 403);
            }
            if ($notif->student_id) {
                $student = Student::find($notif->student_id);
                if ($student && !in_array($student->class_id, $scopedClassIds)) {
                    return response()->json(['success' => false, 'message' => 'غير مصرح لك بحذف هذا الإشعار.'], 403);
                }
            }
            if (!$notif->class_id && !$notif->student_id) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بحذف الإشعارات العامة.'], 403);
            }
        }

        $notif->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإشعار بنجاح.'
        ]);
    }

    public function deleteAll()
    {
        Notification::query()->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف جميع الإشعارات بنجاح.'
        ]);
    }
}
