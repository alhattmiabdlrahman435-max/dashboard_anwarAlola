import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NotificationsContext } from './NotificationsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { notificationsService } from '../../services/notifications/notifications.service';
import { smsBus } from '../../utils/smsBus';

export default function NotificationsProvider({ children }) {
  const { lang, t, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const fetchRequestRef = useRef(0);

  const fetchNotifications = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    const reqId = ++fetchRequestRef.current;
    notificationsService.getNotifications()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchRequestRef.current) return;
        if (data.success) {
          const mapped = data.notifications.map((notif) => {
            let type = "parents";
            if (notif.target_type === "by_class") type = "class";
            else if (notif.target_type === "by_student") type = "student";
            else if (notif.target_type === "specific_teacher") type = "teacher";

            let studentName = null;
            let studentNameEn = null;
            const teacherName = null;
            const teacherNameEn = null;
            let gradeName = null;

            return {
              id: notif.id,
              title: notif.title,
              content: notif.content,
              date: notif.created_at
                ? notif.created_at.substring(0, 16).replace("T", " ")
                : "",
              type: type,
              isRead: !!notif.is_read,
              studentId:
                notif.target_type === "by_student" ? notif.target_id : null,
              studentName: studentName,
              studentNameEn: studentNameEn,
              teacherId:
                notif.target_type === "specific_teacher"
                  ? notif.target_id
                  : null,
              teacherName: teacherName,
              teacherNameEn: teacherNameEn,
              grade: gradeName,
            };
          });
          setNotifications(mapped);
        }
      })
      .catch((err) => {
        if (reqId === fetchRequestRef.current) {
          console.error("Error fetching notifications:", err);
        }
      });
  }, []);

  const handleSendNotification = useCallback((newNotification, extraLogs = []) => {
    const token = localStorage.getItem("auth_token");

    let targetType = "all_parents";
    let targetId = null;

    if (newNotification.type === "student") {
      targetType = "by_student";
      targetId = newNotification.studentId;
    } else if (newNotification.type === "teacher") {
      targetType = "specific_teacher";
      targetId = newNotification.teacherId;
    } else if (newNotification.type === "teachers") {
      targetType = "all_teachers";
    }

    if (token) {
      notificationsService.sendNotification({
          title: newNotification.title,
          content: newNotification.content,
          target_type: targetType,
          target_id: targetId,
        })
        .then((data) => {
          if (data.success) {
            setToastMessage(t.notificationSuccessToast);
            setTimeout(() => setToastMessage(""), 3000);
            fetchNotifications(token);
          }
        })
        .catch((err) => {
          console.error("Error sending notification via API:", err);
          setNotifications((prev) => [newNotification, ...prev]);
          setToastMessage(t.notificationSuccessToast);
          setTimeout(() => setToastMessage(""), 3000);
        });
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
      setToastMessage(t.notificationSuccessToast);
      setTimeout(() => setToastMessage(""), 3000);
    }

    if (extraLogs.length > 0) {
      setSmsLogs((logs) => [...extraLogs, ...logs]);
    }
  }, [t, setToastMessage, fetchNotifications]);

  const handleMarkNotificationAsRead = useCallback((id) => {
    const token = localStorage.getItem("auth_token");

    // Update local state immediately (optimistic UI)
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );

    if (token) {
      notificationsService.markNotificationAsRead(id)
        .then((data) => {
          if (!data.success) {
            console.error("Failed to mark notification as read:", data.message);
          }
        })
        .catch((err) => console.error("Error marking notification as read:", err));
    }
  }, []);

  const handleDeleteNotification = useCallback((id) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      notificationsService.deleteNotification(id)
        .then((data) => {
          if (data.success) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setToastMessage(lang === "ar" ? "تم حذف الإشعار بنجاح." : "Notification deleted successfully.");
            setTimeout(() => setToastMessage(""), 3000);
          } else {
            setToastMessage(lang === "ar" ? `فشل الحذف: ${data.message}` : `Delete failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 4000);
          }
        })
        .catch((err) => {
          console.error("Error deleting notification:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 4000);
        });
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setToastMessage(lang === "ar" ? "تم حذف الإشعار بنجاح." : "Notification deleted successfully.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [lang, setToastMessage]);

  const handleDeleteAllNotifications = useCallback(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      notificationsService.deleteAllNotifications()
        .then((data) => {
          if (data.success) {
            setNotifications([]);
            setToastMessage(lang === "ar" ? "تم حذف جميع الإشعارات بنجاح." : "All notifications deleted successfully.");
            setTimeout(() => setToastMessage(""), 3000);
          } else {
            setToastMessage(lang === "ar" ? `فشل الحذف: ${data.message}` : `Delete failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 4000);
          }
        })
        .catch((err) => {
          console.error("Error deleting all notifications:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 4000);
        });
    } else {
      setNotifications([]);
      setToastMessage(lang === "ar" ? "تم حذف جميع الإشعارات بنجاح." : "All notifications deleted successfully.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [lang, setToastMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      fetchNotifications(token);
    } else {
      setNotifications([]);
      setSmsLogs([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const unsubscribe = smsBus.subscribe((logOrFn) => {
      setSmsLogs(logOrFn);
    });
    return unsubscribe;
  }, []);

  const notificationCount = notifications.filter((n) => !n.isRead).length;

  const notificationsContextValue = useMemo(() => ({
    notifications,
    setNotifications,
    smsLogs,
    setSmsLogs,
    showNotificationsDropdown,
    setShowNotificationsDropdown,
    notificationCount,
    fetchNotifications,
    handleSendNotification,
    handleMarkNotificationAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  }), [
    notifications,
    smsLogs,
    showNotificationsDropdown,
    notificationCount,
    fetchNotifications,
    handleSendNotification,
    handleMarkNotificationAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  ]);

  return (
    <NotificationsContext.Provider value={notificationsContextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}
