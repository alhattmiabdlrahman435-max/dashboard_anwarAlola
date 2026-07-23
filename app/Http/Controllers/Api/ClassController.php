<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Services\PermissionService;

class ClassController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('check.permission:classes,view', only: ['index', 'show']),
            new Middleware('check.permission:classes,create', only: ['store']),
            new Middleware('check.permission:classes,update', only: ['update', 'syncSubjects']),
            new Middleware('check.permission:classes,delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // Scope classes only if explicitly requested via 'scoped' param or for student/parent roles
        $scopedClassIds = null;
        if ($request->boolean('scoped')) {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'classes');
        } elseif ($user && in_array($user->role, ['parent', 'student'])) {
            $scopedClassIds = PermissionService::getScopedClassIds($user, 'classes');
        }

        $query = SchoolClass::query();
        if ($scopedClassIds !== null) {
            $query->whereIn('id', $scopedClassIds);
        }

        $classes = $query->with(['gradeLevel', 'subjects'])->withCount('students')->get();
        
        foreach ($classes as $class) {
            // جلب معرفات المواد المسجلة في جدول الحصص الأسبوعي لهذا الفصل
            $scheduleSubjectIds = \App\Models\Schedule::where('class_id', $class->id)->pluck('subject_id')->toArray();
            
            // جلب المواد المقابلة
            $scheduleSubjects = \App\Models\Subject::whereIn('id', $scheduleSubjectIds)->get();
            
            // دمج المواد دون تكرار
            $mergedSubjects = $class->subjects->concat($scheduleSubjects)->unique('id')->values();
            
            // تعيين القائمة المدمجة كعلاقة المواد المقررة للفصل
            $class->setRelation('subjects', $mergedSubjects);
        }

        return response()->json([
            'success' => true,
            'classes' => $classes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'grade_ar' => 'required|string',
            'grade_en' => 'required|string',
            'section_ar' => 'required|string',
            'section_en' => 'required|string',
            'grade_level_id' => 'nullable|integer'
        ]);

        $class = SchoolClass::create($request->only([
            'grade_ar', 'grade_en',
            'section_ar', 'section_en',
            'grade_level_id'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الفصل بنجاح',
            'class' => $class
        ], 201);
    }

    public function show(string $id)
    {
        $class = SchoolClass::with(['gradeLevel', 'subjects'])->find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }
        
        // جلب معرفات المواد المسجلة في جدول الحصص الأسبوعي لهذا الفصل
        $scheduleSubjectIds = \App\Models\Schedule::where('class_id', $class->id)->pluck('subject_id')->toArray();
        $scheduleSubjects = \App\Models\Subject::whereIn('id', $scheduleSubjectIds)->get();
        
        // دمج المواد دون تكرار
        $mergedSubjects = $class->subjects->concat($scheduleSubjects)->unique('id')->values();
        $class->setRelation('subjects', $mergedSubjects);

        return response()->json(['success' => true, 'class' => $class]);
    }

    public function update(Request $request, string $id)
    {
        $class = SchoolClass::find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }

        $request->validate([
            'grade_ar' => 'nullable|string',
            'grade_en' => 'nullable|string',
            'section_ar' => 'nullable|string',
            'section_en' => 'nullable|string',
            'grade_level_id' => 'nullable|integer'
        ]);

        $class->update($request->only([
            'grade_ar', 'grade_en',
            'section_ar', 'section_en',
            'grade_level_id'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الفصل بنجاح',
            'class' => $class
        ]);
    }

    public function destroy(string $id)
    {
        $class = SchoolClass::find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }
        $class->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الفصل بنجاح']);
    }

    public function syncSubjects(Request $request, $id)
    {
        $class = SchoolClass::find($id);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'الفصل غير موجود'], 404);
        }

        $request->validate([
            'subjects' => 'required|array',
        ]);

        $subjectIds = \App\Models\Subject::whereIn('name_ar', $request->subjects)->pluck('id')->toArray();

        \App\Models\TeacherSubject::where('class_id', $class->id)
            ->whereNotIn('subject_id', $subjectIds)
            ->delete();

        $defaultTeacher = \App\Models\User::where('role', 'teacher')->first() ?? \App\Models\User::where('role', 'admin')->first();
        $defaultTeacherId = $defaultTeacher ? $defaultTeacher->id : 1;

        foreach ($subjectIds as $subId) {
            $exists = \App\Models\TeacherSubject::where('class_id', $class->id)
                ->where('subject_id', $subId)
                ->exists();
            if (!$exists) {
                $otherAssign = \App\Models\TeacherSubject::where('subject_id', $subId)
                    ->whereNotNull('teacher_id')
                    ->first();
                $tId = $otherAssign ? $otherAssign->teacher_id : $defaultTeacherId;

                \App\Models\TeacherSubject::create([
                    'class_id' => $class->id,
                    'subject_id' => $subId,
                    'teacher_id' => $tId,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث مواد الفصل بنجاح'
        ]);
    }
}
