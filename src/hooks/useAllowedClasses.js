import { useMemo } from 'react';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAuth } from '../contexts/Auth/useAuth';

export function useAllowedClasses(moduleKey = 'scanner') {
  const { classes, availableGrades, availableSections } = useClasses();
  const { currentUser } = useAuth();

  const allowedClasses = useMemo(() => {
    if (!currentUser) return classes || [];
    if (currentUser.role === 'admin' || currentUser.permissions?.full_access) {
      return classes || [];
    }

    if (currentUser.role === 'supervisor' || currentUser.role === 'vice_principal') {
      const perms = currentUser.permissions || {};
      
      const modKey = moduleKey;
      const altKey = moduleKey === 'detailedGrades' ? 'grades' 
        : moduleKey === 'scanner' ? 'attendance'
        : moduleKey === 'absenceRequests' ? 'absence'
        : null;

      const modPerm = perms[modKey] || (altKey ? perms[altKey] : null);

      if (!modPerm) return [];

      const userClassesArr = Array.isArray(currentUser.classes) ? currentUser.classes : [];
      const permClassesArr = Array.isArray(perms.assigned_classes) ? perms.assigned_classes : [];
      const assignedClassIds = Array.from(new Set([...userClassesArr, ...permClassesArr]))
        .map(id => Number(String(id).replace(/\D/g, '')))
        .filter(id => !isNaN(id) && id > 0);

      // Check module specific scope if configured as an object
      if (modPerm && typeof modPerm === 'object' && !Array.isArray(modPerm)) {
        const scope = modPerm.scope;
        const scopeIds = Array.isArray(modPerm.scope_ids) ? modPerm.scope_ids : [];

        if (scope === 'class' && scopeIds.length > 0) {
          const classIdsSet = new Set(scopeIds.map(id => Number(String(id).replace(/\D/g, ''))).filter(Boolean));
          return (classes || []).filter(c => classIdsSet.has(Number(c.numericId || String(c.id).replace(/\D/g, ''))));
        }

        if (scope === 'grade' && scopeIds.length > 0) {
          const gradesSet = new Set(scopeIds);
          return (classes || []).filter(c => gradesSet.has(c.grade) || gradesSet.has(c.gradeEn));
        }

        if (scope === 'stage' && scopeIds.length > 0) {
          const stageGrades = new Set();
          scopeIds.forEach(stageId => {
            const sid = Number(stageId);
            if (sid === 1) ['تمهيدي أول', 'تمهيدي ثاني', 'KG1', 'KG2'].forEach(g => stageGrades.add(g));
            if (sid === 2) ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'].forEach(g => stageGrades.add(g));
            if (sid === 3) ['الصف الأول المتوسط', 'الصف الثاني المتوسط', 'الصف الثالث المتوسط'].forEach(g => stageGrades.add(g));
            if (sid === 4) ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'].forEach(g => stageGrades.add(g));
          });
          return (classes || []).filter(c => stageGrades.has(c.grade) || stageGrades.has(c.gradeEn));
        }
      }

      // If specific assigned classes are configured for this supervisor
      if (assignedClassIds.length > 0) {
        const assignedSet = new Set(assignedClassIds);
        return (classes || []).filter(c => assignedSet.has(Number(c.numericId || String(c.id).replace(/\D/g, ''))));
      }

      // If user has permission and no specific class restriction was imposed, return all classes
      return classes || [];
    }

    return classes || [];
  }, [classes, currentUser, moduleKey]);

  const allowedGrades = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin' || currentUser.permissions?.full_access) {
      return availableGrades || [];
    }
    const gradesInAllowed = new Set((allowedClasses || []).map(c => c.grade));
    const filtered = (availableGrades || []).filter(g => gradesInAllowed.has(g));
    return filtered.length > 0 ? filtered : availableGrades || [];
  }, [availableGrades, allowedClasses, currentUser]);

  const allowedSections = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin' || currentUser.permissions?.full_access) {
      return availableSections || [];
    }
    const sectionsInAllowed = new Set((allowedClasses || []).map(c => c.section));
    const filtered = (availableSections || []).filter(s => sectionsInAllowed.has(s));
    return filtered.length > 0 ? filtered : availableSections || [];
  }, [availableSections, allowedClasses, currentUser]);

  return {
    allowedClasses,
    allowedGrades,
    allowedSections,
  };
}
