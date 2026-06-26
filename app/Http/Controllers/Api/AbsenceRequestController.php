<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbsenceRequest;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AbsenceRequestController extends Controller
{
    public function index()
    {
        $requests = AbsenceRequest::with(['student', 'parentUser'])->orderBy('created_at', 'desc')->get()->map(function($req) {
            return [
                'id' => $req->id,
                'student_id' => $req->student_id,
                'student' => $req->student,
                'parent_id' => $req->parent_id,
                'parent_user' => $req->parentUser,
                'start_date' => $req->start_date,
                'end_date' => $req->end_date,
                'requested_date' => $req->start_date, // Mapped for backwards compatibility
                'reason_ar' => $req->reason_ar,
                'reason_en' => $req->reason_en,
                'status' => $req->status,
                'attachment_url' => $req->attachment_url,
                'admin_note_ar' => $req->admin_note_ar,
                'admin_note_en' => $req->admin_note_en,
                'created_at' => $req->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'absence_requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'parent_id' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'reason_ar' => 'required|string',
            'reason_en' => 'nullable|string',
            'attachment_url' => 'nullable|string',
        ]);

        $absenceRequest = AbsenceRequest::create([
            'student_id' => $request->student_id,
            'parent_id' => $request->parent_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?: $request->start_date,
            'reason_ar' => $request->reason_ar,
            'reason_en' => $request->reason_en,
            'attachment_url' => $request->attachment_url,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفع طلب الغياب بنجاح وبانتظار المراجعة',
            'absence_request' => $absenceRequest
        ], 201);
    }

    public function show(string $id)
    {
        $absenceRequest = AbsenceRequest::with(['student', 'parentUser'])->find($id);
        if (!$absenceRequest) {
            return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
        }
        return response()->json(['success' => true, 'absence_request' => $absenceRequest]);
    }

    public function update(Request $request, string $id)
    {
        $absenceRequest = AbsenceRequest::find($id);
        if (!$absenceRequest) {
            return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
        }

        $absenceRequest->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث طلب الغياب بنجاح',
            'absence_request' => $absenceRequest
        ]);
    }

    public function destroy(string $id)
    {
        $absenceRequest = AbsenceRequest::find($id);
        if (!$absenceRequest) {
            return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
        }
        $absenceRequest->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الطلب بنجاح']);
    }

    /**
     * الموافقة على العذر وتحديث الحضور
     */
    public function approve(Request $request, string $id)
    {
        $absenceRequest = AbsenceRequest::find($id);
        if (!$absenceRequest) {
            return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
        }

        $absenceRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_note_ar' => $request->admin_note_ar ?: 'تم قبول العذر وتبرير الغياب',
        ]);

        $startDate = Carbon::parse($absenceRequest->start_date);
        $endDate = Carbon::parse($absenceRequest->end_date ?: $absenceRequest->start_date);

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $absenceRequest->student_id,
                    'record_date' => $date->toDateString(),
                ],
                [
                    'status' => 'absent', // marked absent but with note that it is excused/justified
                    'note' => 'غياب مبرر بعذر مقبول: ' . $absenceRequest->reason_ar,
                    'created_by' => auth()->id()
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة على طلب العذر بنجاح وتحديث حضور الطالب',
            'absence_request' => $absenceRequest
        ]);
    }

    /**
     * رفض الطلب
     */
    public function reject(Request $request, string $id)
    {
        $absenceRequest = AbsenceRequest::find($id);
        if (!$absenceRequest) {
            return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
        }

        $absenceRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_note_ar' => $request->admin_note_ar ?: 'تم رفض العذر المرفق لعدم كفاية البيانات',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب العذر بنجاح',
            'absence_request' => $absenceRequest
        ]);
    }
}
