import { AuthProvider } from '../../contexts/Auth/AuthProvider';
import { AppProvider } from '../../context/AppContext';
import SubjectsProvider from '../../contexts/Subjects/SubjectsProvider';
import ParentsProvider from '../../contexts/Parents/ParentsProvider';
import AttendanceProvider from '../../contexts/Attendance/AttendanceProvider';
import NotificationsProvider from '../../contexts/Notifications/NotificationsProvider';
import FinanceProvider from '../../contexts/Finance/FinanceProvider';
import ReportsProvider from '../../contexts/Reports/ReportsProvider';
import SettingsProvider from '../../contexts/Settings/SettingsProvider';
import StudentsProvider from '../../contexts/Students/StudentsProvider';
import TeachersProvider from '../../contexts/Teachers/TeachersProvider';
import ClassesProvider from '../../contexts/Classes/ClassesProvider';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        <SubjectsProvider>
          <ClassesProvider>
            <ParentsProvider>
              <AttendanceProvider>
                <NotificationsProvider>
                  <FinanceProvider>
                    <ReportsProvider>
                      <SettingsProvider>
                        <StudentsProvider>
                          <TeachersProvider>
                            {children}
                          </TeachersProvider>
                        </StudentsProvider>
                      </SettingsProvider>
                    </ReportsProvider>
                  </FinanceProvider>
                </NotificationsProvider>
              </AttendanceProvider>
            </ParentsProvider>
          </ClassesProvider>
        </SubjectsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
