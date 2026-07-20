<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;
use App\Http\Requests\ListRequest;

class ReportController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:teacherReports,view', only: ['index']),
            new Middleware('check.permission:teacherReports,create', only: ['store']),
            new Middleware('check.permission:teacherReports,delete', only: ['destroy']),
            new Middleware('check.permission:teacherReports,deleteAll', only: ['deleteAll']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();

        $query = Report::with(['student.schoolClass', 'teacher']);

        // المعلم يرى بلاغاته فقط، الإدارة والمشرف يرون الكل
        if ($user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        } else {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'teacherReports');
            if ($scopedClassIds !== null) {
                $query->whereHas('student', function($q) use ($scopedClassIds) {
                    $q->whereIn('class_id', $scopedClassIds);
                });
            }
        }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('student', function($sq) use ($search) {
                      $sq->where('name_ar', 'LIKE', "%{$search}%")
                        ->orWhere('name_en', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('teacher', function($tq) use ($search) {
                      $tq->where('name_ar', 'LIKE', "%{$search}%")
                        ->orWhere('name_en', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        if (in_array($sortBy, ['id', 'status', 'type', 'created_at'])) {
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);

        $reports = $paginator->getCollection()->map(function ($report) {
            return [
                'id'              => (string) $report->id,
                'studentId'       => (string) $report->student_id,
                'studentName'     => $report->student->name_ar ?? $report->student->name ?? 'غير معروف',
                'studentPhotoUrl' => $report->student->photo_url ?? null,
                'className'       => $report->student->schoolClass
                    ? ($report->student->schoolClass->name_ar ?? $report->student->schoolClass->name ?? '')
                    : '',
                'teacherName'     => $report->teacher->name_ar ?? $report->teacher->name ?? 'غير معروف',
                'type'            => $report->type,
                'description'     => $report->description,
                'imageUrl'        => $report->image_url,
                'status'          => $report->status,
                'createdAt'       => $report->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success'      => true,
            'reports'      => $reports,
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id'  => 'required|integer',
            'type'        => 'required|string|in:academic,behavioral,homework,psychological',
            'description' => 'required|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $ext      = strtolower($file->getClientOriginalExtension());
            $filename = time() . '_' . uniqid() . '.' . $ext;
            $file->move(public_path('uploads/reports'), $filename);
            $imageUrl = asset('uploads/reports/' . $filename);
        }

        $report = Report::create([
            'student_id'  => $request->student_id,
            'teacher_id'  => $request->user()->id,
            'type'        => $request->type,
            'description' => $request->description,
            'image_url'   => $imageUrl,
            'status'      => 'pending',
        ]);

        $report->load(['student.schoolClass', 'teacher']);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال البلاغ بنجاح وهو قيد الانتظار للموافقة من الإدارة.',
            'report'  => [
                'id'              => (string) $report->id,
                'studentId'       => (string) $report->student_id,
                'studentName'     => $report->student->name_ar ?? $report->student->name ?? 'غير معروف',
                'studentPhotoUrl' => $report->student->photo_url ?? null,
                'className'       => $report->student->schoolClass
                    ? ($report->student->schoolClass->name_ar ?? $report->student->schoolClass->name ?? '')
                    : '',
                'teacherName'     => $report->teacher->name_ar ?? $report->teacher->name ?? 'غير معروف',
                'type'            => $report->type,
                'description'     => $report->description,
                'imageUrl'        => $report->image_url,
                'status'          => $report->status,
                'createdAt'       => $report->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,reviewed,archived',
        ]);

        $report    = Report::with('student')->findOrFail($id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'teacherReports');
        if ($scopedClassIds !== null && $report->student && !in_array($report->student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتحديث بلاغ لطالب خارج فصولك المحددة.',
            ], 403);
        }

        $status = $request->status;
        if ($status === 'approved') {
            if (!PermissionService::can($user, 'teacherReports', 'approve')) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك باعتماد بلاغات المعلمين.'], 403);
            }
        } elseif ($status === 'rejected') {
            if (!PermissionService::can($user, 'teacherReports', 'reject')) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك برفض بلاغات المعلمين.'], 403);
            }
        } else {
            if (!PermissionService::can($user, 'teacherReports', 'approve') && !PermissionService::can($user, 'teacherReports', 'reject')) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بتعديل حالة بلاغات المعلمين.'], 403);
            }
        }

        $oldStatus = $report->status;
        $report->status = $status;
        $report->save();

        // تحميل العلاقات للاستخدام في الإشعارات
        $report->load(['student', 'teacher']);

        $typeLabels = [
            'academic'      => 'أكاديمي',
            'behavioral'    => 'سلوكي',
            'homework'      => 'واجبات',
            'psychological' => 'نفسي',
        ];

        $typeLabel   = $typeLabels[$report->type] ?? $report->type;
        $studentName = $report->student->name_ar ?? $report->student->name ?? 'الطالب';
        $teacherName = $report->teacher->name_ar ?? $report->teacher->name ?? 'المعلم';
        $teacherId   = $report->teacher_id;

        // ✅ الموافقة على البلاغ
        if ($request->status === 'approved' && $oldStatus !== 'approved') {

            // 1) إشعار للمعلم: تمت الموافقة على بلاغك
            Notification::create([
                'title'      => "✅ تمت الموافقة على بلاغك بشأن {$studentName}",
                'content'    => "قامت الإدارة بمراجعة البلاغ {$typeLabel} الذي قدمته بشأن الطالب {$studentName} والموافقة عليه.\nسيتم إبلاغ ولي الأمر بالتفاصيل فوراً.",
                'type'       => 'alert',
                'is_read'    => false,
                'student_id' => null,
                'class_id'   => null,
                'teacher_id' => $teacherId,
            ]);

            if ($report->teacher) {
                \App\Services\FcmService::sendToUser(
                    $report->teacher,
                    "✅ تمت الموافقة على بلاغك بشأن {$studentName}",
                    "قامت الإدارة بمراجعة البلاغ {$typeLabel} الذي قدمته بشأن الطالب {$studentName} والموافقة عليه.",
                    [
                        'type' => 'report_status',
                        'report_id' => (string)$report->id
                    ]
                );
            }

            // 2) إشعار لولي الأمر: بنفس محتوى البلاغ الذي كتبه المعلم
            $parentContent = "تفيدكم إدارة المدرسة بأنه تم رصد الملاحظة التالية من قِبَل معلم {$typeLabel} بشأن ابنكم {$studentName}:\n\n";
            $parentContent .= $report->description;

            if ($report->image_url) {
                $parentContent .= "\n\nملاحظة: يوجد مرفق صورة إثبات مع هذا البلاغ يمكن الاطلاع عليه في التطبيق.";
            }

            $parentContent .= "\n\nيرجى التواصل مع إدارة المدرسة لمتابعة هذا الأمر.";

            Notification::create([
                'title'      => "📋 إشعار من الإدارة: بلاغ {$typeLabel} بشأن {$studentName}",
                'content'    => $parentContent,
                'type'       => 'alert',
                'is_read'    => false,
                'student_id' => $report->student_id, // يصل لولي الأمر عبر معرف الطالب
                'class_id'   => null,
                'teacher_id' => null,
                'attachment_url' => $report->image_url,
            ]);

            $parentUser = $report->student ? $report->student->parentUser : null;
            if ($parentUser) {
                \App\Services\FcmService::sendToUser(
                    $parentUser,
                    "📋 إشعار من الإدارة: بلاغ {$typeLabel} بشأن {$studentName}",
                    $parentContent,
                    [
                        'type' => 'report',
                        'report_id' => (string)$report->id
                    ]
                );
            }
        }

        // ❌ رفض البلاغ
        if ($request->status === 'rejected' && $oldStatus !== 'rejected') {

            // إشعار للمعلم فقط: تم رفض بلاغك نهائياً
            Notification::create([
                'title'      => "❌ تم رفض البلاغ بشأن {$studentName}",
                'content'    => "تم مراجعة البلاغ {$typeLabel} الذي قدمته بشأن الطالب {$studentName} من قِبَل الإدارة، وتقرر رفض البلاغ نهائياً كإجراء رسمي ولا يمكن التعديل عليه.",
                'type'       => 'info',
                'is_read'    => false,
                'student_id' => null,
                'class_id'   => null,
                'teacher_id' => $teacherId,
            ]);

            if ($report->teacher) {
                \App\Services\FcmService::sendToUser(
                    $report->teacher,
                    "❌ تم رفض البلاغ بشأن {$studentName}",
                    "تم مراجعة البلاغ {$typeLabel} الذي قدمته بشأن الطالب {$studentName} من قِبَل الإدارة، وتقرر رفض البلاغ نهائياً.",
                    [
                        'type' => 'report_status',
                        'report_id' => (string)$report->id
                    ]
                );
            }
        }

        $message = match ($request->status) {
            'approved' => 'تمت الموافقة على البلاغ وتم إرسال إشعار للمعلم ولولي الأمر.',
            'rejected' => 'تم رفض البلاغ وتم إرسال إشعار للمعلم.',
            default    => 'تم تحديث حالة البلاغ بنجاح.',
        };

        return response()->json([
            'success' => true,
            'message' => $message,
            'report'  => $report,
        ]);
     }

     public function destroy($id)
     {
         $report = Report::findOrFail($id);
         $report->delete();
         return response()->json([
             'success' => true,
             'message' => 'تم حذف البلاغ بنجاح.'
         ]);
     }

     public function deleteAll()
     {
         Report::query()->delete();
         return response()->json([
             'success' => true,
             'message' => 'تم حذف جميع البلاغات بنجاح.'
         ]);
     }
}
