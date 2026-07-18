import { useState, useEffect, useCallback, useMemo } from 'react';
import { ParentsContext } from './ParentsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { parentsService } from '../../services/parents/parents.service';

export default function ParentsProvider({ children }) {
  const { lang, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  const [parentUsers, setParentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParents = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    setLoading(true);
    parentsService.getParents()
      .then((data) => {
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
        }
      })
      .catch((err) => console.error("Error fetching parents:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddParent = useCallback((newParent) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      parentsService.createParent({
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
        } else {
          console.error("Failed to add parent:", data.message);
        }
      })
      .catch(err => console.error("Error adding parent:", err));
    } else {
      setParentUsers((prev) => [...prev, newParent]);
      setToastMessage(
        lang === "ar"
          ? "تم تسجيل حساب ولي الأمر بنجاح!"
          : "Parent account registered successfully!",
      );
      setTimeout(() => setToastMessage(""), 4000);
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
      parentsService.updateParent(parentId, {
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
        } else {
          setToastMessage(lang === "ar" ? "فشل تحديث بيانات ولي الأمر" : "Failed to update parent details");
          setTimeout(() => setToastMessage(""), 4000);
        }
      })
      .catch((err) => {
        console.error("Error updating parent:", err);
        setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
        setTimeout(() => setToastMessage(""), 4000);
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
    }
  }, [parentUsers, lang, setToastMessage]);

  const handleDeleteParent = useCallback((parentId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      parentsService.deleteParent(parentId)
        .then((data) => {
          if (data.success) {
            setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
            setToastMessage(
              lang === "ar"
                ? "تم حذف ولي الأمر بنجاح!"
                : "Parent deleted successfully!",
            );
            setTimeout(() => setToastMessage(""), 3000);
          } else {
            setToastMessage(lang === "ar" ? "فشل حذف ولي الأمر" : "Failed to delete parent");
            setTimeout(() => setToastMessage(""), 3000);
          }
        })
        .catch((err) => {
          console.error("Error deleting parent:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      setParentUsers((prev) => prev.filter((p) => p.id !== parentId));
      setToastMessage(
        lang === "ar"
          ? "تم حذف ولي الأمر بنجاح!"
          : "Parent deleted successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [lang, setToastMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchParents(token);
    }
  }, [isAuthenticated, fetchParents]);

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
