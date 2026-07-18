import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ParentsContext } from './ParentsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { parentsService } from '../../services/parents/parents.service';

export default function ParentsProvider({ children }) {
  const { lang, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  const [parentUsers, setParentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const fetchRequestRef = useRef(0);

  const fetchParents = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    const tokenArg = args.find(a => typeof a === 'string');
    const activeToken = tokenArg || localStorage.getItem("auth_token");
    if (!activeToken) return;

    if (!force && !isStale && parentUsers.length > 0) {
      return;
    }

    const reqId = ++fetchRequestRef.current;
    setLoading(true);
    parentsService.getParents()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchRequestRef.current) return;
        if (data.success) {
          const mapped = data.parents.map((p) => ({
            id: p.id,
            nationalId: p.national_id,
            name: p.name_ar || p.name,
            nameEn: p.name_en || p.name,
            phone: p.phone,
            username: p.username,
            password: "parent_password123",
            photo: p.photo_url || "🧔",
          }));
          setParentUsers(mapped);
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (reqId === fetchRequestRef.current) {
          console.error("Error fetching parents:", err);
        }
      })
      .finally(() => {
        if (reqId === fetchRequestRef.current) {
          setLoading(false);
        }
      });
  }, [isStale, parentUsers.length]);

  const handleAddParent = useCallback((newParent) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return parentsService.createParent({
        national_id: newParent.nationalId,
        name_ar: newParent.name,
        name_en: newParent.nameEn,
        phone: newParent.phone,
        photo_url: newParent.photo,
      })
      .then(data => {
        if (data.success) {
          const mapped = {
            ...newParent,
            id: data.parent.id,
          };
          setParentUsers((prev) => [...prev, mapped]);
          setToastMessage(
            lang === "ar"
              ? "تم تسجيل حساب ولي الأمر بنجاح!"
              : "Parent account registered successfully!",
          );
          setTimeout(() => setToastMessage(""), 4000);
          return { success: true };
        } else {
          const msg = lang === "ar" ? `فشل تسجيل ولي الأمر: ${data.message}` : `Failed to add parent: ${data.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 4000);
          return { success: false, message: msg };
        }
      })
      .catch(err => {
        console.error("Error adding parent:", err);
        const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
        return { success: false, message: msg };
      });
    } else {
      setParentUsers((prev) => [...prev, newParent]);
      setToastMessage(
        lang === "ar"
          ? "تم تسجيل حساب ولي الأمر بنجاح!"
          : "Parent account registered successfully!",
      );
      setTimeout(() => setToastMessage(""), 4000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  const handleEditParent = useCallback((
    updatedParent,
    linkedNameSync,
    parentNationalId,
  ) => {
    const parent = parentUsers.find(p => p.nationalId === parentNationalId);
    const parentId = parent?.id;
    const token = localStorage.getItem("auth_token");

    if (token && parentId) {
      return parentsService.updateParent(parentId, {
        name_ar: updatedParent.name,
        name_en: updatedParent.nameEn,
        phone: updatedParent.phone,
        photo_url: updatedParent.photo,
      })
      .then((data) => {
        if (data.success) {
          const finalParent = {
            ...updatedParent,
            id: parentId,
          };
          setParentUsers((prev) =>
            prev.map((p) => (p.nationalId === parentNationalId ? finalParent : p)),
          );
          setToastMessage(
            lang === "ar"
              ? "تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!"
              : "Parent account details updated successfully!",
          );
          setTimeout(() => setToastMessage(""), 4000);
          return { success: true };
        } else {
          const msg = lang === "ar" ? "فشل تحديث بيانات ولي الأمر" : "Failed to update parent details";
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 4000);
          return { success: false, message: msg };
        }
      })
      .catch((err) => {
        console.error("Error updating parent:", err);
        const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
        return { success: false, message: msg };
      });

    } else {
      setParentUsers((prev) =>
        prev.map((p) => (p.nationalId === parentNationalId ? updatedParent : p)),
      );
      setToastMessage(
        lang === "ar"
          ? "تم تحديث حساب ولي الأمر وتعديل بيانات الاتصال بنجاح!"
          : "Parent account details updated successfully!",
      );
      setTimeout(() => setToastMessage(""), 4000);
      return Promise.resolve({ success: true });
    }
  }, [parentUsers, lang, setToastMessage]);

  const handleDeleteParent = useCallback((parentId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return parentsService.deleteParent(parentId)
        .then((data) => {
          if (data.success) {
            setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
            setToastMessage(
              lang === "ar"
                ? "تم حذف ولي الأمر بنجاح!"
                : "Parent deleted successfully!",
            );
            setTimeout(() => setToastMessage(""), 3000);
            return { success: true };
          } else {
            const msg = lang === "ar" ? "فشل حذف ولي الأمر" : "Failed to delete parent";
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 3000);
            return { success: false, message: msg };
          }
        })
        .catch((err) => {
          console.error("Error deleting parent:", err);
          const msg = lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(""), 3000);
          return { success: false, message: msg };
        });
    } else {
      setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
      setToastMessage(
        lang === "ar"
          ? "تم حذف ولي الأمر بنجاح!"
          : "Parent deleted successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  useEffect(() => {
    if (!isAuthenticated) {
      setParentUsers([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const parentsContextValue = useMemo(() => ({
    parentUsers,
    setParentUsers,
    loading,
    fetchParents,
    handleAddParent,
    handleEditParent,
    handleDeleteParent,
  }), [
    parentUsers,
    loading,
    fetchParents,
    handleAddParent,
    handleEditParent,
    handleDeleteParent,
  ]);

  return (
    <ParentsContext.Provider value={parentsContextValue}>
      {children}
    </ParentsContext.Provider>
  );
}
