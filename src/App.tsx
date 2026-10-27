import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EmployeeWizard from './pages/EmployeeWizard';
import EmployeeEdit from './pages/EmployeeEdit';
import EmployeesProfiles from './pages/EmployeesProfiles';
import EmployeesList from './pages/EmployeesList';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import RestEntitlements from './pages/RestEntitlements';
import Payroll from './pages/Payroll';
import LeaveManagement from './pages/LeaveManagement';
import Settings from './pages/Settings';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeeWizard />} />
        <Route path="employees/edit" element={<EmployeeEdit />} />
        <Route path="employees/list" element={<EmployeesList />} />
        <Route path="employees/profiles" element={<EmployeesProfiles />} />
        <Route path="departments" element={<Departments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="rest-entitlements" element={<RestEntitlements />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
