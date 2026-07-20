<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

use App\Http\Requests\ListRequest;

class FinanceController extends Controller implements HasMiddleware
{
    public $sortableColumns = ['id', 'name_ar', 'name_en', 'created_at'];

    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:finance,view', only: ['index', 'show', 'stats']),
            new Middleware('check.permission:finance,collect', only: ['addPayment']),
        ];
    }

    public function index(ListRequest $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'finance');

        $query = Student::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('class_id', $scopedClassIds);
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        // Apply search
        $search = $request->input('search');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                  ->orWhere('name_en', 'LIKE', "%{$search}%")
                  ->orWhere('student_code', 'LIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc'));
        $query->orderBy($sortBy, $direction);

        // Safe Column Selection
        $query->select([
            'id', 'student_code', 'name_ar', 'name_en', 'class_id', 'tuition_fee', 'created_at'
        ]);

        $query->with('payments');

        $perPage = (int) $request->input('per_page', 20);
        $paginator = $query->paginate($perPage);
        $students = $paginator->getCollection();

        $records = $students->map(function($student) {
            $totalFees = (float)($student->tuition_fee ?? 10000.00);
            $paid = $student->payments->sum('amount');
            $remaining = $totalFees - $paid;

            return [
                'id' => $student->id,
                'student_id' => $student->id,
                'student' => [
                    'id' => $student->id,
                    'name_ar' => $student->name_ar,
                    'name_en' => $student->name_en,
                ],
                'total_fees' => $totalFees,
                'paid_fees' => $paid,
                'remaining_fees' => $remaining,
                'payments' => $student->payments,
            ];
        });

        return response()->json([
            'success' => true,
            'students_fees' => $records,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total()
        ]);
    }

    /**
     * كشف حساب مالي ودفعات لطالب محدد
     */
    public function show(Request $request, string $studentId)
    {
        $student = Student::with('payments')->findOrFail($studentId);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'finance');
        if ($scopedClassIds !== null && !in_array($student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك باستعراض الحساب المالي لطالب خارج فصولك المحددة.',
            ], 403);
        }

        $totalFees = (float)($student->tuition_fee ?? 10000.00);
        $paid = $student->payments->sum('amount');
        $remaining = $totalFees - $paid;

        $tuition = [
            'student_id' => $student->id,
            'total_fees' => $totalFees,
            'paid_fees' => $paid,
            'remaining_fees' => $remaining,
        ];

        $payments = Payment::where('student_id', $studentId)->orderBy('payment_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'tuition' => $tuition,
            'payments' => $payments
        ]);
    }

    /**
     * تسجيل سند قبض مالي جديد للطالب
     */
    public function addPayment(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'reference_no' => 'nullable|string',
        ]);

        $student = Student::findOrFail($request->student_id);

        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'finance');
        if ($scopedClassIds !== null && !in_array($student->class_id, $scopedClassIds)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتسجيل سند مالي لطالب خارج فصولك المحددة.',
            ], 403);
        }

        $refNo = $request->reference_no;
        if (empty($refNo)) {
            do {
                $refNo = 'PAY-' . random_int(100000, 999999);
            } while (Payment::where('reference_no', $refNo)->exists());
        }

        $payment = Payment::create([
            'student_id' => $request->student_id,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'reference_no' => $refNo,
            'recorded_by' => auth()->id()
        ]);

        // Notify parent about new payment receipt
        $student = Student::with('parentUser')->find($request->student_id);
        if ($student && $student->parent_id) {
            $title = 'سند قبض مالي جديد 💳';
            $content = "تم تسجيل دفعة مالية بقيمة " . number_format($request->amount) . " ريال للطالب " . $student->name_ar . " بتاريخ " . $request->payment_date;

            \App\Models\Notification::create([
                'title' => $title,
                'content' => $content,
                'type' => 'general',
                'is_read' => false,
                'student_id' => $student->id,
            ]);

            $parentUser = $student->parentUser;
            if ($parentUser) {
                \App\Services\FcmService::sendToUser($parentUser, $title, $content, [
                    'type' => 'finance',
                    'student_id' => (string)$student->id
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل سند القبض المالي بنجاح وتحديث حساب الطالب',
            'payment' => $payment
        ]);
    }

    /**
     * إحصائيات مالية إجمالية للمدرسة
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $scopedClassIds = PermissionService::getScopedClassIds($user, 'finance');

        $studentQuery = Student::query();
        $paymentQuery = Payment::query();
        if ($scopedClassIds !== null) {
            $studentQuery->whereIn('class_id', $scopedClassIds);
            $paymentQuery->whereHas('student', function($q) use ($scopedClassIds) {
                $q->whereIn('class_id', $scopedClassIds);
            });
        }

        $totalRequired = (float)$studentQuery->sum('tuition_fee');
        $totalPaid = (float)$paymentQuery->sum('amount');
        $totalRemaining = $totalRequired - $totalPaid;

        return response()->json([
            'success' => true,
            'stats' => [
                'total_required' => $totalRequired,
                'total_paid' => $totalPaid,
                'total_remaining' => $totalRemaining,
            ]
        ]);
    }
}
