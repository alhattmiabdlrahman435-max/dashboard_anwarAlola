<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    /**
     * قائمة الطلاب والرسوم المالية
     */
    public function index()
    {
        $students = Student::with('payments')->get();
        
        $records = $students->map(function($student) {
            $totalFees = 10000.00; // Constant tuition fee
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
            'students_fees' => $records
        ]);
    }

    /**
     * كشف حساب مالي ودفعات لطالب محدد
     */
    public function show(string $studentId)
    {
        $student = Student::with('payments')->findOrFail($studentId);
        $totalFees = 10000.00;
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

        $payment = Payment::create([
            'student_id' => $request->student_id,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'reference_no' => $request->reference_no ?: 'PAY-' . rand(100000, 999999),
            'recorded_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل سند القبض المالي بنجاح وتحديث حساب الطالب',
            'payment' => $payment
        ]);
    }

    /**
     * إحصائيات مالية إجمالية للمدرسة
     */
    public function stats()
    {
        $studentsCount = Student::count();
        $totalRequired = $studentsCount * 10000.00;
        $totalPaid = Payment::sum('amount');
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
