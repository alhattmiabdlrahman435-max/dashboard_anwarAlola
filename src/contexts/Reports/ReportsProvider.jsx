import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Teacher reports state
  const [teacherReports, setTeacherReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    setStatsLoading(true);
    dashboardService.getStats()
      .then((data) => {
        if (data.success) {
          setDashboardStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch teacher reports
  const fetchTeacherReports = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    setReportsLoading(true);
    reportsService.getReports()
      .then((data) => {
        if (data.success) {
          setTeacherReports(data.reports);
        }
      })
      .catch((err) => console.error("Error fetching teacher reports:", err))
      .finally(() => setReportsLoading(false));
  }, []);

  // Update report status
  const handleUpdateReportStatus = useCallback((reportId, newStatus) => {
    const token = localStorage.getItem("auth_token");
    setTeacherReports((prev) =>
      prev.map((r) => (r.id === String(reportId) ? { ...r, status: newStatus } : r))
    );

    if (token) {
      reportsService.updateReportStatus(reportId, { status: newStatus })
        .then((data) => {
          if (data.success) {
            setToastMessage(lang === "ar" ? "تم تحديث حالة التقرير بنجاح." : "Report status updated successfully.");
            fetchTeacherReports(token);
          } else {
            console.error("Failed to update report status:", data.message);
          }
        })
        .catch((err) => console.error("Error updating report status:", err));
    }
  }, [lang, setToastMessage, fetchTeacherReports]);

  // Delete a report
  const handleDeleteTeacherReport = useCallback((reportId) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      reportsService.deleteReport(reportId)
        .then((data) => {
          if (data.success) {
            setTeacherReports((prev) => prev.filter((r) => r.id !== String(reportId)));
            setToastMessage(lang === "ar" ? "تم حذف التقرير بنجاح." : "Report deleted successfully.");
          } else {
            console.error("Failed to delete report:", data.message);
          }
        })
        .catch((err) => {
          console.error("Error deleting teacher report:", err);
        });
    } else {
      setTeacherReports((prev) => prev.filter((r) => r.id !== String(reportId)));
      setToastMessage(lang === "ar" ? "تم حذف التقرير بنجاح." : "Report deleted successfully.");
    }
  }, [lang, setToastMessage]);

  // Delete all reports
  const handleDeleteAllTeacherReports = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      reportsService.deleteAllReports()
        .then((data) => {
          if (data.success) {
            setTeacherReports([]);
            setToastMessage(lang === "ar" ? "تم حذف جميع التقارير بنجاح." : "All reports deleted successfully.");
          } else {
            console.error("Failed to delete all reports:", data.message);
          }
        })
        .catch((err) => {
          console.error("Error deleting all teacher reports:", err);
        });
    } else {
      setTeacherReports([]);
      setToastMessage(lang === "ar" ? "تم حذف جميع التقارير بنجاح." : "All reports deleted successfully.");
    }
  }, [lang, setToastMessage]);

  // Load initially
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboardStats(token);
      fetchTeacherReports(token);
    } else {
      setDashboardStats(null);
      setTeacherReports([]);
    }
  }, [isAuthenticated, fetchDashboardStats, fetchTeacherReports]);

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
