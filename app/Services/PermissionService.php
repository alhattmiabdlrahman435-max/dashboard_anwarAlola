<?php

namespace App\Services;

use App\Models\User;
use App\Models\SchoolClass;

class PermissionService
{
    /**
     * Check if a user has permission to perform an action on a module.
     */
    public static function can(User $user, string $module, string $action): bool
    {
        // Admin always has full access
        if ($user->role === 'admin') {
            return true;
        }

        // Parents permissions
        if ($user->role === 'parent') {
            if (in_array($module, ['absenceRequests', 'contactMessages', 'reports', 'teacherReports']) && in_array($action, ['view', 'create', 'update', 'delete'])) {
                return true;
            }
            if ($action === 'view') {
                return true;
            }
        }

        // Teachers permissions
        if ($user->role === 'teacher') {
            if (in_array($module, ['assignments', 'teacherReports', 'reports', 'attendance', 'detailedGrades', 'grades', 'control', 'schedules', 'schedule', 'examSchedules', 'communications', 'notifications', 'students', 'classes', 'subjects']) && in_array($action, ['view', 'create', 'update', 'delete', 'mark', 'saveDetailed', 'markAllRead'])) {
                return true;
            }
            if ($action === 'view' || $action === 'create' || $action === 'update' || $action === 'mark') {
                return true;
            }
        }

        // Preparation Supervisors permissions
        if ($user->role === 'preparation_supervisor') {
            if (in_array($module, ['attendance', 'absenceRequests', 'scanner', 'teacherReports', 'reports', 'communications', 'notifications', 'students', 'classes', 'schedule', 'schedules', 'examSchedules']) && in_array($action, ['view', 'create', 'update', 'delete', 'approve', 'reject', 'mark', 'markAllRead'])) {
                return true;
            }
            if ($action === 'view' || $action === 'create' || $action === 'update' || $action === 'approve' || $action === 'reject' || $action === 'mark') {
                return true;
            }
        }

        // Supervisors / Vice Principals custom permissions check
        if ($user->role !== 'supervisor' && $user->role !== 'vice_principal') {
            return false;
        }

        $permissions = $user->permissions;

        if (empty($permissions)) {
            return false;
        }

        // Check full_access flag
        if (!empty($permissions['full_access'])) {
            return true;
        }

        // Check if module permissions exist (with bi-directional fallback alias)
        if (!isset($permissions[$module])) {
            $altKey = match($module) {
                'detailedGrades' => 'grades',
                'grades' => 'detailedGrades',
                'teacherReports' => 'reports',
                'reports' => 'teacherReports',
                'communications' => 'notifications',
                'notifications' => 'communications',
                'scanner' => 'attendance',
                'attendance' => 'scanner',
                'absenceRequests' => 'absence',
                'absence' => 'absenceRequests',
                default => null
            };
            if (!$altKey || !isset($permissions[$altKey])) {
                return false;
            }
            $module = $altKey;
        }

        $modulePerms = $permissions[$module];

        $candidateActions = [$action];
        if ($module === 'finance' && $action === 'collect') {
            $candidateActions[] = 'create';
            $candidateActions[] = 'update';
        } elseif ($module === 'control' && in_array($action, ['enterGrades', 'generateSecretCodes'])) {
            $candidateActions[] = 'update';
        } elseif (in_array($module, ['detailedGrades', 'grades']) && $action === 'publish') {
            $candidateActions[] = 'update';
        } elseif (in_array($module, ['absenceRequests', 'attendance', 'absence', 'scanner']) && $action === 'approveExcuse') {
            $candidateActions[] = 'approve';
        }

        // Simple array of actions: ["view", "create"]
        if (is_array($modulePerms) && array_is_list($modulePerms)) {
            foreach ($candidateActions as $cand) {
                if (in_array($cand, $modulePerms)) return true;
            }
            return false;
        }

        // Structured object: {"actions": [...], "scope": "..."}
        if (is_array($modulePerms) && isset($modulePerms['actions'])) {
            foreach ($candidateActions as $cand) {
                if (in_array($cand, $modulePerms['actions'])) return true;
            }
            return false;
        }

        return false;
    }

    /**
     * Check if a specific class ID is within the user's allowed scope for a module.
     */
    public static function isClassAllowed(User $user, string $module, ?int $classId): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($classId === null || $classId <= 0) {
            return false;
        }
        $scopedClassIds = self::getScopedClassIds($user, $module);
        if ($scopedClassIds === null) {
            return true; // unrestricted
        }
        return in_array((int)$classId, array_map('intval', $scopedClassIds), true);
    }

    /**
     * Check if a student (or student ID) is within the user's allowed scope for a module.
     */
    public static function isStudentAllowed(User $user, string $module, $student): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if (!$student) {
            return false;
        }
        if (!($student instanceof \App\Models\Student)) {
            $student = \App\Models\Student::find($student);
            if (!$student) {
                return false;
            }
        }
        return self::isClassAllowed($user, $module, (int)$student->class_id);
    }

    /**
     * Get the list of class IDs a user is allowed to access for a given module.
     * Returns null if unrestricted (all classes), or an array of class IDs.
     */
    public static function getScopedClassIds(User $user, string $module): ?array
    {
        // Admin = unrestricted
        if ($user->role === 'admin') {
            return null;
        }

        // Parents
        if ($user->role === 'parent') {
            return $user->children()->pluck('class_id')->filter()->unique()->toArray();
        }

        // Teachers
        if ($user->role === 'teacher') {
            return $user->teacherSubjects()->pluck('class_id')->unique()->toArray();
        }

        // Preparation Supervisors
        if ($user->role === 'preparation_supervisor') {
            return $user->supervisorClasses()->pluck('class_id')->unique()->toArray();
        }

        // Vice Principals / Supervisors
        if ($user->role === 'supervisor' || $user->role === 'vice_principal') {
            $permissions = $user->permissions;

            // full_access = unrestricted
            if (!empty($permissions['full_access'])) {
                return null;
            }

            // Get assigned class IDs from supervisor_classes relation or permissions
            $assignedClassIds = $user->supervisorClasses()->pluck('class_id')->unique()->toArray();
            if (empty($assignedClassIds) && !empty($permissions['assigned_classes']) && is_array($permissions['assigned_classes'])) {
                $assignedClassIds = array_values(array_filter(array_map(function($id) {
                    return (int) preg_replace('/\D/', '', (string) $id);
                }, $permissions['assigned_classes']), function($v) { return $v > 0; }));
            }

            // Fallback for module key aliases
            if (!isset($permissions[$module])) {
                $altKey = match($module) {
                    'detailedGrades' => 'grades',
                    'grades' => 'detailedGrades',
                    'teacherReports' => 'reports',
                    'reports' => 'teacherReports',
                    'communications' => 'notifications',
                    'notifications' => 'communications',
                    'scanner' => 'attendance',
                    'attendance' => 'scanner',
                    'absenceRequests' => 'absence',
                    'absence' => 'absenceRequests',
                    default => null
                };
                if ($altKey && isset($permissions[$altKey])) {
                    $module = $altKey;
                }
            }

            if (!isset($permissions[$module]) || !is_array($permissions[$module])) {
                return !empty($assignedClassIds) ? $assignedClassIds : null;
            }

            $modulePerms = $permissions[$module];

            // Simple array (no scope)
            if (array_is_list($modulePerms)) {
                return !empty($assignedClassIds) ? $assignedClassIds : null;
            }

            $scope = $modulePerms['scope'] ?? 'all';
            $scopeIds = $modulePerms['scope_ids'] ?? [];

            if ($scope === 'class' && !empty($scopeIds)) {
                $cleanIds = array_values(array_filter(array_map(function($id) {
                    return (int) preg_replace('/\D/', '', (string) $id);
                }, $scopeIds), function($v) { return $v > 0; }));

                return !empty($cleanIds) ? $cleanIds : (!empty($assignedClassIds) ? $assignedClassIds : null);
            }

            if ($scope === 'grade' && !empty($scopeIds)) {
                return SchoolClass::where(function ($q) use ($scopeIds) {
                    $q->whereIn('grade_ar', $scopeIds)
                      ->orWhereIn('grade_en', $scopeIds);
                })->pluck('id')->toArray();
            }

            if ($scope === 'stage' && !empty($scopeIds)) {
                $grades = [];
                foreach ($scopeIds as $stageId) {
                    $stageId = (int) $stageId;
                    if ($stageId === 1) {
                        $grades = array_merge($grades, ['تمهيدي أول', 'تمهيدي ثاني', 'KG1', 'KG2']);
                    } elseif ($stageId === 2) {
                        $grades = array_merge($grades, ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس']);
                    } elseif ($stageId === 3) {
                        $grades = array_merge($grades, ['الصف الأول المتوسط', 'الصف الثاني المتوسط', 'الصف الثالث المتوسط']);
                    } elseif ($stageId === 4) {
                        $grades = array_merge($grades, ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي']);
                    }
                }
                return SchoolClass::whereIn('grade_ar', $grades)->pluck('id')->toArray();
            }

            // Default scope ('all' or unconfigured module scope) -> return Vice Principal's assigned classes if available, otherwise null (unrestricted)
            if (!empty($assignedClassIds)) {
                return $assignedClassIds;
            }

            return null;
        }

        return [];
    }

    /**
     * Get the list of allowed actions for a user on a given module.
     */
    public static function getAllowedActions(User $user, string $module): array
    {
        if ($user->role === 'admin') {
            return ['view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'reject'];
        }

        $permissions = $user->permissions;

        if (empty($permissions)) {
            return [];
        }

        if (!empty($permissions['full_access'])) {
            return ['view', 'create', 'update', 'delete', 'export', 'import', 'approve', 'reject'];
        }

        if (!isset($permissions[$module])) {
            $altKey = match($module) {
                'detailedGrades' => 'grades',
                'grades' => 'detailedGrades',
                'teacherReports' => 'reports',
                'reports' => 'teacherReports',
                'communications' => 'notifications',
                'notifications' => 'communications',
                'scanner' => 'attendance',
                'attendance' => 'scanner',
                'absenceRequests' => 'absence',
                'absence' => 'absenceRequests',
                default => null
            };
            if (!$altKey || !isset($permissions[$altKey])) {
                return [];
            }
            $module = $altKey;
        }

        $rawActions = [];
        if (is_array($modulePerms) && array_is_list($modulePerms)) {
            $rawActions = $modulePerms;
        } elseif (is_array($modulePerms) && isset($modulePerms['actions'])) {
            $rawActions = $modulePerms['actions'];
        }

        $actions = $rawActions;
        if (in_array('update', $rawActions)) {
            if ($module === 'control') {
                $actions[] = 'enterGrades';
                $actions[] = 'generateSecretCodes';
            }
            if (in_array($module, ['detailedGrades', 'grades'])) {
                $actions[] = 'publish';
            }
            if ($module === 'finance') {
                $actions[] = 'collect';
            }
        }
        if (in_array('create', $rawActions) && $module === 'finance') {
            $actions[] = 'collect';
        }
        if (in_array('approve', $rawActions)) {
            $actions[] = 'approveExcuse';
        }

        return array_values(array_unique($actions));
    }
}
