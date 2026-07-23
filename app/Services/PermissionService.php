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
                default => null
            };
            if (!$altKey || !isset($permissions[$altKey])) {
                return false;
            }
            $module = $altKey;
        }

        $modulePerms = $permissions[$module];

        // Simple array of actions: ["view", "create"]
        if (is_array($modulePerms) && array_is_list($modulePerms)) {
            return in_array($action, $modulePerms);
        }

        // Structured object: {"actions": [...], "scope": "..."}
        if (is_array($modulePerms) && isset($modulePerms['actions'])) {
            return in_array($action, $modulePerms['actions']);
        }

        return false;
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
                $assignedClassIds = array_map('intval', $permissions['assigned_classes']);
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
                    default => null
                };
                if ($altKey && isset($permissions[$altKey])) {
                    $module = $altKey;
                }
            }

            if (!isset($permissions[$module]) || !is_array($permissions[$module])) {
                return !empty($assignedClassIds) ? $assignedClassIds : [];
            }

            $modulePerms = $permissions[$module];

            // Simple array (no scope)
            if (array_is_list($modulePerms)) {
                return !empty($assignedClassIds) ? $assignedClassIds : [];
            }

            $scope = $modulePerms['scope'] ?? 'all';
            $scopeIds = $modulePerms['scope_ids'] ?? [];

            if ($scope === 'class' && !empty($scopeIds)) {
                return array_map('intval', $scopeIds);
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

            // Default scope ('all' or unconfigured module scope) -> return Vice Principal's assigned classes if available!
            if (!empty($assignedClassIds)) {
                return $assignedClassIds;
            }

            return [];
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
                default => null
            };
            if (!$altKey || !isset($permissions[$altKey])) {
                return [];
            }
            $module = $altKey;
        }

        $modulePerms = $permissions[$module];

        if (is_array($modulePerms) && array_is_list($modulePerms)) {
            return $modulePerms;
        }

        if (is_array($modulePerms) && isset($modulePerms['actions'])) {
            return $modulePerms['actions'];
        }

        return [];
    }
}
