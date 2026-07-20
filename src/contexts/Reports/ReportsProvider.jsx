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
  const [reportsPagination, setReportsPagination] = useState({
    total: 0, lastPage: 1, from: 0, to: 0, currentPage: 1, perPage: 20
  });

  const fetchDashboardStatsRequestRef = useRef(0);
  const fetchTeacherReportsRequestRef = useRef(0);
  const reportsAbortRef = useRef(null);

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
        if (reqId !== fetchDashboardStatsRequestRef.current) return;
        console.error("Error fetching dashboard stats:", err);
      })
      .finally(() => {
        if (reqId === fetchDashboardStatsRequestRef.current) {
          setStatsLoading(false);
        }
      });
  }, [isStale, dashboardStats]);

  // Fetch teacher reports
  const fetchTeacherReports = useCallback((arg) => {
    const isForce = arg === true;
    const isQueryString = typeof arg === 'string';
    const queryString = isQueryString ? arg : '?page=1&per_page=20';

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (reportsAbortRef.current) reportsAbortRef.current.abort();
    const controller = new AbortController();
    reportsAbortRef.current = controller;

    const reqId = ++fetchTeacherReportsRequestRef.current;
    setReportsLoading(true);
    reportsService.getReports(queryString)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchTeacherReportsRequestRef.current) return;
        if (data.success) {
          setTeacherReports(data.reports);
          setIsStale(false);

          const pg = data.pagination || data.meta || {};
          setReportsPagination({
            total:       pg.total        ?? data.total        ?? data.reports.length,
            lastPage:    pg.last_page    ?? data.last_page    ?? 1,
            from:        pg.from         ?? data.from         ?? 1,
            to:          pg.to           ?? data.to           ?? data.reports.length,
            currentPage: pg.current_page ?? data.current_page ?? 1,
            perPage:     pg.per_page     ?? data.per_page     ?? data.reports.length,
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        if (reqId !== fetchTeacherReportsRequestRef.current) return;
        console.error("Error fetching teacher reports:", err);
        setToastMessage(err.message, "error");
      })
      .finally(() => {
        if (reqId === fetchTeacherReportsRequestRef.current) {
          setReportsLoading(false);
          reportsAbortRef.current = null;
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
    reportsPagination,
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
    reportsPagination,
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
