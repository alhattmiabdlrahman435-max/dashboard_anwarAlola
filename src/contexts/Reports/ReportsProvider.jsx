import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReportsContext } from './ReportsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { dashboardService } from '../../services/dashboard/dashboard.service';
import { reportsService } from '../../services/reports/reports.service';

export default function ReportsProvider({ children }) {
  const { lang, setToastMessage } = useApp();
  const { isAuthenticated } = useAuth();

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  // Teacher reports state
  const [teacherReports, setTeacherReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchDashboardStatsRequestRef = useRef(0);
  const fetchTeacherReportsRequestRef = useRef(0);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    const tokenArg = args.find(a => typeof a === 'string');
    const activeToken = tokenArg || localStorage.getItem("auth_token");
    if (!activeToken) return;

    if (!force && !isStale && dashboardStats !== null) {
      return;
    }

    const reqId = ++fetchDashboardStatsRequestRef.current;
    setStatsLoading(true);
    dashboardService.getStats()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchDashboardStatsRequestRef.current) return;
        if (data.success) {
          setDashboardStats(data.stats);
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (reqId === fetchDashboardStatsRequestRef.current) {
          console.error("Error fetching dashboard stats:", err);
        }
      })
      .finally(() => {
        if (reqId === fetchDashboardStatsRequestRef.current) {
          setStatsLoading(false);
        }
      });
  }, [isStale, dashboardStats]);

  // Fetch teacher reports
  const fetchTeacherReports = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    const tokenArg = args.find(a => typeof a === 'string');
    const activeToken = tokenArg || localStorage.getItem("auth_token");
    if (!activeToken) return;

    if (!force && !isStale && teacherReports.length > 0) {
      return;
    }

    const reqId = ++fetchTeacherReportsRequestRef.current;
    setReportsLoading(true);
    reportsService.getReports()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchTeacherReportsRequestRef.current) return;
        if (data.success) {
          setTeacherReports(data.reports);
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (reqId === fetchTeacherReportsRequestRef.current) {
          console.error("Error fetching teacher reports:", err);
        }
      })
      .finally(() => {
        if (reqId === fetchTeacherReportsRequestRef.current) {
          setReportsLoading(false);
        }
      });
  }, [isStale, teacherReports.length]);

  // Update report status
  const handleUpdateReportStatus = useCallback((reportId, newStatus) => {
    const token = localStorage.getItem("auth_token");
    setTeacherReports((prev) =>
      prev.map((r) => (r.id === String(reportId) ? { ...r, status: newStatus } : r))
    );

    if (token) {
      return reportsService.updateReportStatus(reportId, { status: newStatus })
        .then((data) => {
          if (data.success) {
            setToastMessage(lang === "ar" ? "تم تحديث حالة التقرير بنجاح." : "Report status updated successfully.");
            fetchTeacherReports(token, true);
            return { success: true };
          } else {
            console.error("Failed to update report status:", data.message);
            return { success: false, message: data.message };
          }
        })
        .catch((err) => {
          console.error("Error updating report status:", err);
          return { success: false, message: err.message };
        });
    } else {
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage, fetchTeacherReports]);

  // Delete a report
  const handleDeleteTeacherReport = useCallback((reportId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return reportsService.deleteReport(reportId)
        .then((data) => {
          if (data.success) {
            setTeacherReports((prev) => prev.filter((r) => r.id !== String(reportId)));
            setToastMessage(lang === "ar" ? "تم حذف التقرير بنجاح." : "Report deleted successfully.");
            return { success: true };
          } else {
            console.error("Failed to delete report:", data.message);
            return { success: false, message: data.message };
          }
        })
        .catch((err) => {
          console.error("Error deleting teacher report:", err);
          return { success: false, message: err.message };
        });
    } else {
      setTeacherReports((prev) => prev.filter((r) => r.id !== String(reportId)));
      setToastMessage(lang === "ar" ? "تم حذف التقرير بنجاح." : "Report deleted successfully.");
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  // Delete all reports
  const handleDeleteAllTeacherReports = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return reportsService.deleteAllReports()
        .then((data) => {
          if (data.success) {
            setTeacherReports([]);
            setToastMessage(lang === "ar" ? "تم حذف جميع التقارير بنجاح." : "All reports deleted successfully.");
            return { success: true };
          } else {
            console.error("Failed to delete all reports:", data.message);
            return { success: false, message: data.message };
          }
        })
        .catch((err) => {
          console.error("Error deleting all teacher reports:", err);
          return { success: false, message: err.message };
        });
    } else {
      setTeacherReports([]);
      setToastMessage(lang === "ar" ? "تم حذف جميع التقارير بنجاح." : "All reports deleted successfully.");
      return Promise.resolve({ success: true });
    }
  }, [lang, setToastMessage]);

  // Load initially
  useEffect(() => {
    if (!isAuthenticated) {
      setDashboardStats(null);
      setTeacherReports([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const reportsContextValue = useMemo(() => ({
    dashboardStats,
    setDashboardStats,
    statsLoading,
    fetchDashboardStats,
    teacherReports,
    setTeacherReports,
    reportsLoading,
    fetchTeacherReports,
    handleUpdateReportStatus,
    handleDeleteTeacherReport,
    handleDeleteAllTeacherReports,
  }), [
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
    teacherReports,
    reportsLoading,
    fetchTeacherReports,
    handleUpdateReportStatus,
    handleDeleteTeacherReport,
    handleDeleteAllTeacherReports,
  ]);

  return (
    <ReportsContext.Provider value={reportsContextValue}>
      {children}
    </ReportsContext.Provider>
  );
}
