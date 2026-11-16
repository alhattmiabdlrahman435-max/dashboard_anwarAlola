<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Payment;
use App\Models\StudentEnrollment;
use App\Services\AcademicYearService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $years = AcademicYear::withCount('enrollments')
            ->orderByDesc('is_current')
            ->orderByDesc('name')
            ->get();

        $current = $years->firstWhere('is_current', true) ?? $years->first();
        $resolved = AcademicYearService::resolve($request);

        return response()->json([
            'success' => true,
            'academic_years' => $years,
            'current_year' => $current,
            'active_year' => $resolved,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بإنشاء عام دراسي'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:academic_years,name',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:active,archived,upcoming',
            'is_current' => 'nullable|boolean',
        ]);

        $year = DB::transaction(function () use ($validated, $user) {
            $makeCurrent = (bool) ($validated['is_current'] ?? false);
            if ($makeCurrent) {
                AcademicYear::query()->update(['is_current' => false]);
            }
            return AcademicYear::create([
                'name' => trim($validated['name']),
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'status' => $validated['status'] ?? ($makeCurrent ? 'active' : 'upcoming'),
                'is_current' => $makeCurrent,
                'created_by' => $user->id,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء العام الدراسي بنجاح',
            'academic_year' => $year,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتعديل العام الدراسي'], 403);
        }

        $year = AcademicYear::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50|unique:academic_years,name,' . $year->id,
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|in:active,archived,upcoming',
        ]);

        if ($year->is_current && ($validated['status'] ?? null) === 'archived') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن أرشفة العام الدراسي الحالي قبل تعيين عام آخر كعام حالي.',
            ], 422);
        }

        $year->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات العام الدراسي',
            'academic_year' => $year->fresh(),
        ]);
    }

    public function setCurrent(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتغيير العام الدراسي الحالي'], 403);
        }

        $year = AcademicYear::findOrFail($id);

        DB::transaction(function () use ($year) {
            AcademicYear::query()->update(['is_current' => false]);
            $year->update([
                'is_current' => true,
                'status' => 'active',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => "تم تعيين العام الدراسي ({$year->name}) كعام حالي للنظام",
            'academic_year' => $year->fresh(),
        ]);
    }

    /**
     * قفل / فتح حالة الأرشفة للعام الدراسي
     */
    public function toggleArchive(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['super_admin', 'admin'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتعديل حالة الأرشفة'], 403);
        }

        $year = AcademicYear::findOrFail($id);
        if ($year->is_current && $year->status !== 'archived') {
            return response()->json(['success' => false, 'message' => 'لا يمكن أرشفة العام الدراسي الحالي قبل تعيين عام آخر كعام حالي.'], 422);
        }

        $nextStatus = $year->status === 'archived' ? 'active' : 'archived';
        $year->update(['status' => $nextStatus]);

        return response()->json([
            'success' => true,
            'message' => $nextStatus === 'archived'
                ? "تم قفل وأرشفة العام الدراسي ({$year->name}) للقراءة فقط."
                : "تم فك قفل العام الدراسي ({$year->name}) وتفعيله.",
            'academic_year' => $year->fresh(),
        ]);
    }

    /**
     * مقارنة الإحصائيات الأكاديمية والمالية والحضور عبر جميع الأعوام الدراسية
     */
    public function compare(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['super_admin', 'admin', 'supervisor'], true)) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بالوصول لتقرير مقارنة الأعوام الدراسية'], 403);
        }

        $years = AcademicYear::orderByDesc('name')->get();
        $comparison = [];

        foreach ($years as $yr) {
            $enrollments = StudentEnrollment::where('academic_year_id', $yr->id)->get();
            $totalStudents = $enrollments->count();
            $statusCounts = $enrollments->groupBy('status')->map->count();

            $totalRequired = (float) $enrollments->sum(fn ($e) => (float) $e->tuition_fee + (float) ($e->previous_balance ?? 0));
            $totalPaid = (float) Payment::forAcademicYear($yr->id)->sum('amount');
            $collectionRate = $totalRequired > 0 ? round(($totalPaid / $totalRequired) * 100, 1) : 0.0;

            $attTotal = Attendance::forAcademicYear($yr->id)->count();
            $attPresent = Attendance::forAcademicYear($yr->id)->whereIn('status', ['present', 'late'])->count();
            $attendanceRate = $attTotal > 0 ? round(($attPresent / $attTotal) * 100, 1) : 0.0;

            $comparison[] = [
                'id' => $yr->id,
                'name' => $yr->name,
                'status' => $yr->status,
                'is_current' => (bool) $yr->is_current,
                'students_count' => $totalStudents,
                'active_count' => (int) ($statusCounts['active'] ?? 0),
                'promoted_count' => (int) ($statusCounts['promoted'] ?? 0),
                'retained_count' => (int) ($statusCounts['retained'] ?? 0),
                'supplementary_count' => (int) ($statusCounts['supplementary'] ?? 0),
                'graduated_count' => (int) ($statusCounts['graduated'] ?? 0),
                'withdrawn_count' => (int) ($statusCounts['withdrawn'] ?? 0),
                'total_required' => round($totalRequired, 2),
                'total_paid' => round($totalPaid, 2),
                'remaining' => round(max(0, $totalRequired - $totalPaid), 2),
                'collection_rate' => $collectionRate,
                'attendance_rate' => $attendanceRate,
            ];
        }

        return response()->json([
            'success' => true,
            'comparison' => $comparison,
        ]);
    }
}
