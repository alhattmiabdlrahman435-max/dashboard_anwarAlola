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
        if ($module === 'grades') {
            $module = 'detailedGrades';
        }

        // Admin always has full access
        if ($user->role === 'admin') {
            return true;
        }

        // Only supervisors can have custom permissions
        if ($user->role !== 'supervisor') {
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

        // Check if module permissions exist
        if (!isset($permissions[$module])) {
            return false;
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
        if ($module === 'grades') {
            $module = 'detailedGrades';
        }

        // Admin = unrestricted
        if ($user->role === 'admin') {
            return null;
        }

        $permissions = $user->permissions;

        // full_access = unrestricted
        if (!empty($permissions['full_access'])) {
            return null;
        }

        if (!isset($permissions[$module]) || !is_array($permissions[$module])) {
            return []; // No access
        }

        $modulePerms = $permissions[$module];

        // Simple array (no scope) = unrestricted
        if (array_is_list($modulePerms)) {
            return null;
        }

        $scope = $modulePerms['scope'] ?? 'all';
        $scopeIds = $modulePerms['scope_ids'] ?? [];

        if ($scope === 'all') {
            return null;
        }

        if ($scope === 'class') {
            // scope_ids are class IDs directly
            return array_map('intval', $scopeIds);
        }

        if ($scope === 'grade') {
            // scope_ids are grade names like ["الصف الأول", "الصف الثاني"]
            return SchoolClass::where(function ($q) use ($scopeIds) {
                $q->whereIn('grade_ar', $scopeIds)
                  ->orWhereIn('grade_en', $scopeIds);
            })->pluck('id')->toArray();
        }

        if ($scope === 'stage') {
            // scope_ids are stage IDs: 1 = KG (تمهيدي), 2 = Elementary (ابتدائي)
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

        return [];
    }

    /**
     * Get the list of allowed actions for a user on a given module.
     */
    public static function getAllowedActions(User $user, string $module): array
    {
        if ($module === 'grades') {
            $module = 'detailedGrades';
        }

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
            return [];
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
