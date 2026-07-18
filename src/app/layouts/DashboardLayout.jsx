import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StudentCardModal from '../../components/StudentCardModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

export default function DashboardLayout() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  return (
    <div className="app-container">
      <Sidebar />
      {/* Mobile backdrop overlay — closes sidebar when tapped outside */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="main-workspace">
        <Navbar />
        <main className="main-content-layout">
          <div className="content-area">
            <Outlet />
          </div>
        </main>
      </div>
      <StudentCardModal />
      <ConfirmModal />
      <Toast />
    </div>
  );
}
