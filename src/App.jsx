import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import StudentCardModal from './components/StudentCardModal';

// Tabs
import DashboardTab from './tabs/DashboardTab';
import StudentsTab from './tabs/StudentsTab';
import ParentsTab from './tabs/ParentsTab';
import TeachersTab from './tabs/TeachersTab';
import ClassesTab from './tabs/ClassesTab';
import SubjectsTab from './tabs/SubjectsTab';
import ScheduleTab from './tabs/ScheduleTab';
import ScannerTab from './tabs/ScannerTab';
import AbsenceRequestsTab from './tabs/AbsenceRequestsTab';
import AssignmentsTab from './tabs/AssignmentsTab';
import DetailedGradesTab from './tabs/DetailedGradesTab';
import ExamSchedulesTab from './tabs/ExamSchedulesTab';
import FinanceTab from './tabs/FinanceTab';
import CommunicationsTab from './tabs/CommunicationsTab';
import ControlTab from './tabs/ControlTab';
import ReportsTab from './tabs/ReportsTab';
import TeacherReportsTab from './tabs/TeacherReportsTab';
import SettingsTab from './tabs/SettingsTab';
import PrepSupervisorsTab from './tabs/PrepSupervisorsTab';
import SupervisorsTab from './tabs/SupervisorsTab';

import ConfirmModal from './components/ConfirmModal';

import './App.css';

function DashboardShell() {
  const {
    isAuthenticated,
    activeTab,
    lang,
    darkMode
  } = useApp();

  // Handle Dark mode / RTL dynamically
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'students':
        return <StudentsTab />;
      case 'parents':
        return <ParentsTab />;
      case 'prepSupervisors':
        return <PrepSupervisorsTab />;
      case 'teachers':
        return <TeachersTab />;
      case 'classes':
        return <ClassesTab />;
      case 'subjects':
        return <SubjectsTab />;
      case 'schedule':
        return <ScheduleTab />;
      case 'scanner':
        return <ScannerTab />;
      case 'absenceRequests':
        return <AbsenceRequestsTab />;
      case 'assignments':
        return <AssignmentsTab />;
      case 'detailedGrades':
        return <DetailedGradesTab />;
      case 'examSchedules':
        return <ExamSchedulesTab />;
      case 'finance':
        return <FinanceTab />;
      case 'communications':
        return <CommunicationsTab />;
      case 'control':
        return <ControlTab />;
      case 'reports':
        return <ReportsTab />;
      case 'teacherReports':
        return <TeacherReportsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'supervisors':
        return <SupervisorsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-workspace">
        <Navbar />
        <main className="main-content-layout">
          <div className="content-area">
            {renderActiveTab()}
          </div>
        </main>
      </div>
      <StudentCardModal />
      <ConfirmModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  );
}
