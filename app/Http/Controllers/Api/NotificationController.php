<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            new Middleware('check.permission:communications,update', only: ['update']),
            new Middleware('check.permission:communications,delete', only: ['destroy', 'deleteAll']),
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
            if ($targetType === 'all_users' || $targetType === 'general') {
                $query->whereIn('type', ['general', 'all_users']);
            } elseif ($targetType === 'all_parents' || $targetType === 'parents') {
                $query->where(function($q) {
                    $q->whereIn('type', ['broadcast_parents', 'parents', 'general', 'broadcast'])
                      ->whereNull('teacher_id')
                      ->whereNull('student_id')
                      ->whereNull('class_id');
                });
            } elseif ($targetType === 'all_teachers' || $targetType === 'teachers') {
                $query->where(function($q) {
                    $q->whereIn('type', ['broadcast_teachers', 'teachers', 'general', 'broadcast'])
                      ->whereNull('student_id')
                      ->whereNull('class_id')
                      ->whereNull('teacher_id');
                });
            } elseif ($targetType === 'by_class' || $targetType === 'classes') {
                $query->whereNotNull('class_id');
            } elseif ($targetType === 'by_student' || $targetType === 'private' || $targetType === 'student') {
                $query->where(function($q) {
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
        // ترتيب ثابت عند تساوي القيم (منع تكرار/اختفاء صفوف بين الصفحات)
        if ($sortBy !== 'id') $query->orderBy($query->getModel()->getQualifiedKeyName(), $direction);

        $query->with([
            'student:id,name_ar,name_en',
            'teacher:id,name',
            'schoolClass:id,grade_ar,grade_en,section_ar,section_en'
        ]);

        // Safe Column Selection
        $query->select([
            'id', 'title', 'content', 'type', 'source', 'is_read', 'student_id', 'class_id', 'teacher_id', 'assignment_id', 'attachment_url', 'edited_at', 'created_at'
        ]);

        // ولي الأمر والمعلم: "مقروء" خاص بكل شخص (قراءة أحدهم لا تؤثر على غيره)
        $perUserRead = Notification::tracksReadPerUser($user);
        if ($perUserRead) {
            $query->withExists(['reads as read_by_me' => fn($q) => $q->where('user_id', $user->id)]);
        }

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $notifications = $paginator->getCollection()->map(function($notif) use ($request, $perUserRead) {
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

            $studentName = $notif->student ? ($notif->student->name_ar ?: $notif->student->name_en) : null;
            $studentNameEn = $notif->student ? ($notif->student->name_en ?: $notif->student->name_ar) : null;
            $teacherName = $notif->teacher ? $notif->teacher->name : null;
            $teacherNameEn = $notif->teacher ? $notif->teacher->name : null;
            $className = $notif->schoolClass ? ($notif->schoolClass->name_ar ?: $notif->schoolClass->name_en) : null;

            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'content' => $notif->content,
                'type' => $notif->type ?: 'general',
                'source' => $notif->source ?: 'other',
                // is_read القديم (قبل القراءة لكل شخص) يبقى محترماً للإشعارات السابقة
                'is_read' => $perUserRead
                    ? ((bool) $notif->is_read || (bool) $notif->read_by_me)
                    : (bool) $notif->is_read,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'student_id' => $notif->student_id,
                'student_name' => $studentName,
                'student_name_en' => $studentNameEn,
                'teacher_id' => $notif->teacher_id,
                'teacher_name' => $teacherName,
                'teacher_name_en' => $teacherNameEn,
                'class_id' => $notif->class_id,
                'class_name' => $className,
                'attachment_url' => $attachmentUrl,
                'edited_at' => $notif->edited_at,
                // إشعار الواجب: رقم الواجب لفتحه مباشرة في صفحة الواجبات
                'assignment_id' => $notif->assignment_id,
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
            'target_id' => 'nullable|integer|required_if:target_type,by_class,by_student,specific_teacher',
        ]);

        // The exact recipient must exist: never fall back to another student / class / teacher
        if ($request->target_type === 'by_student' && !Student::whereKey($request->target_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'الطالب المحدد غير موجود.'], 422);
        }
        if ($request->target_type === 'by_class' && !\App\Models\SchoolClass::whereKey($request->target_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'الصف المحدد غير موجود.'], 422);
        }
        if ($request->target_type === 'specific_teacher' && !\App\Models\User::whereKey($request->target_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'المعلم المحدد غير موجود.'], 422);
        }

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
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'type' => $type,
            'source' => Notification::SOURCE_ADMIN,
            'is_read' => false,
            'student_id' => $studentId,
            'class_id' => $classId,
            'teacher_id' => $teacherId,
        ]);

        // تحديث فوري للتطبيقات المفتوحة عبر WebSocket
        \App\Events\NotificationsChanged::safeDispatch('created', $notification->id);

        $tokens = $this->collectTargetTokens($request->target_type, $studentId, $classId, $teacherId);

        // Send FCM push notifications
        foreach ($tokens as $token) {
            \App\Services\FcmService::sendNotification(
                $token,
                $request->input('title'),
                $request->input('content'),
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

    /**
     * تعديل عنوان ونص إشعار بعد إرساله، وإرسال تنبيه للجوال لنفس الجهة المستهدفة.
     * الجهة المستهدفة لا تتغير (تغييرها يعني إشعاراً جديداً).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $notif = Notification::findOrFail($id);

        $denied = $this->scopeDeniedMessage($request->user(), $notif, 'تعديل');
        if ($denied) {
            return response()->json(['success' => false, 'message' => $denied], 403);
        }

        $notif->update([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'edited_at' => now(),
            // الإشعار المعدَّل يظهر كجديد غير مقروء لدى المستلم
            'is_read' => false,
        ]);

        // الإشعار المعدَّل يعود "جديداً" عند كل المستلمين
        $notif->reads()->delete();

        \App\Events\NotificationsChanged::safeDispatch('updated', $notif->id);

        $tokens = $this->collectTargetTokens(
            $this->targetTypeOf($notif),
            $notif->student_id,
            $notif->class_id,
            $notif->teacher_id
        );

        foreach ($tokens as $token) {
            \App\Services\FcmService::sendNotification(
                $token,
                'تم تعديل إشعار: ' . $notif->title,
                $notif->content,
                [
                    'type' => 'notifications',
                    'id' => (string)$notif->id,
                    'action' => 'updated',
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعديل الإشعار وإرسال التعديل للجهة المستهدفة',
            'notification' => [
                'id' => $notif->id,
                'title' => $notif->title,
                'content' => $notif->content,
                'edited_at' => $notif->edited_at,
                'created_at' => $notif->created_at,
            ],
        ]);
    }

    /** نوع الجهة المستهدفة لإشعار محفوظ (نفس منطق send) */
    private function targetTypeOf(Notification $notif): string
    {
        if ($notif->student_id) return 'by_student';
        if ($notif->class_id) return 'by_class';
        if ($notif->teacher_id) return 'specific_teacher';
        if ($notif->type === 'general') return 'all_users';
        if ($notif->type === 'broadcast_teachers') return 'all_teachers';
        return 'all_parents';
    }

    /** رسالة الرفض إذا كان الإشعار خارج صلاحية المستخدم المقيّدة بصفوف، وإلا null */
    private function scopeDeniedMessage($user, Notification $notif, string $actionAr): ?string
    {
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'communications');
        if ($scopedClassIds === null) {
            return null;
        }
        if ($notif->class_id && !in_array($notif->class_id, $scopedClassIds)) {
            return "غير مصرح لك ب{$actionAr} هذا الإشعار.";
        }
        if ($notif->student_id) {
            $student = Student::find($notif->student_id);
            if ($student && !in_array($student->class_id, $scopedClassIds)) {
                return "غير مصرح لك ب{$actionAr} هذا الإشعار.";
            }
        }
        if (!$notif->class_id && !$notif->student_id) {
            return "غير مصرح لك ب{$actionAr} الإشعارات العامة.";
        }
        return null;
    }

    /** رموز FCM لأجهزة الجهة المستهدفة */
    private function collectTargetTokens(string $targetType, $studentId, $classId, $teacherId): array
    {
        $tokens = [];
        if ($targetType === 'all_users') {
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
        } elseif ($targetType === 'all_parents') {
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
        } elseif ($targetType === 'all_teachers') {
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
        } elseif ($targetType === 'specific_teacher') {
            $teacher = \App\Models\User::find($teacherId);
            if ($teacher) {
                $teacherTokens = \App\Models\UserFcmToken::where('user_id', $teacher->id)->pluck('fcm_token')->toArray();
                if ($teacher->fcm_token) $teacherTokens[] = $teacher->fcm_token;
                $tokens = array_unique($teacherTokens);
            }
        } elseif ($targetType === 'by_student') {
            $student = \App\Models\Student::with('parentUser')->find($studentId);
            if ($student && $student->parentUser) {
                $parentUser = $student->parentUser;
                $parentTokens = \App\Models\UserFcmToken::where('user_id', $parentUser->id)->pluck('fcm_token')->toArray();
                if ($parentUser->fcm_token) $parentTokens[] = $parentUser->fcm_token;
                $tokens = array_unique($parentTokens);
            }
        } elseif ($targetType === 'by_class') {
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

        return array_values($tokens);
    }

    public function read(Request $request, $id)
    {
        $notif = Notification::findOrFail($id);
        $user = $request->user();

        if (Notification::tracksReadPerUser($user)) {
            // يُسجَّل لهذا المستخدم فقط
            \App\Models\NotificationRead::firstOrCreate(
                ['notification_id' => $notif->id, 'user_id' => $user->id],
                ['read_at' => now()]
            );
        } else {
            $notif->update(['is_read' => true]);
        }
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة قراءة الإشعار'
        ]);
    }

    public function readAll(Request $request)
    {
        $user = $request->user() ?? Auth::user();
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
            $query->whereNotIn('type', ['alert', 'attendance', 'excuse_status']);
        }

        if (Notification::tracksReadPerUser($user)) {
            // نسجّل القراءة لهذا المستخدم فقط، دون تغيير حالة بقية المستلمين
            $ids = $query->whereDoesntHave('reads', fn($q) => $q->where('user_id', $user->id))->pluck('id');
            $now = now();
            foreach ($ids->chunk(500) as $chunk) {
                \App\Models\NotificationRead::insertOrIgnore($chunk->map(fn($id) => [
                    'notification_id' => $id,
                    'user_id' => $user->id,
                    'read_at' => $now,
                ])->values()->all());
            }
        } else {
            $query->where('is_read', false)->update(['is_read' => true]);
        }

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

        // نحدد المستلمين قبل الحذف، ثم نرسل رسالة صامتة ليُزيل التطبيق الإشعار فوراً
        $tokens = $this->collectTargetTokens(
            $this->targetTypeOf($notif),
            $notif->student_id,
            $notif->class_id,
            $notif->teacher_id
        );
        $deletedId = (string) $notif->id;

        $notif->delete();

        \App\Events\NotificationsChanged::safeDispatch('deleted', (int) $deletedId);

        foreach ($tokens as $token) {
            \App\Services\FcmService::sendDataMessage($token, [
                'type' => 'notifications',
                'action' => 'deleted',
                'id' => $deletedId,
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإشعار بنجاح.'
        ]);
    }

    public function deleteAll(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'communications');

        $query = Notification::query();
        if ($scopedClassIds !== null) {
            $studentIds = Student::whereIn('class_id', $scopedClassIds)->pluck('id')->toArray();
            $query->where(function($q) use ($scopedClassIds, $studentIds) {
                $q->whereIn('class_id', $scopedClassIds)
                  ->orWhereIn('student_id', $studentIds);
            });
        }

        $query->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإشعارات المحددة بنجاح.'
        ]);
    }
}
