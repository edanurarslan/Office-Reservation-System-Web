import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import ManagerUsersPage from '../pages/manager/ManagerUsersPage';
import ManagerReservationsPage from '../pages/manager/ManagerReservationsPage';
import ManagerReportsPage from '../pages/manager/ManagerReportsPage';
import ManagerNotificationsPage from '../pages/manager/ManagerNotificationsPage';
import ManagerLogsPage from '../pages/manager/ManagerLogsPage';
import BackupPage from '../pages/admin/BackupPage';
import LogsPage from '../pages/admin/LogsPage';
import ApprovalPage from '../pages/admin/ApprovalPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/login/RegisterPage';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardPage from '../pages/my/DashboardPage';
import ReservationsPage from '../pages/reserve/ReservationsPage';
import ProfilePage from '../pages/my/ProfilePage';
import QrPage from '../pages/qr/QrPage';
import UsersPage from '../pages/admin/UsersPage';
import LocationsPage from '../pages/admin/LocationsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SupportPage from '../pages/support/SupportPage';
import FloorplanPage from '../pages/admin/FloorplanPage';
import OverviewPage from '../pages/admin/OverviewPage';
import RulesPage from '../pages/admin/RulesPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const PublicLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const RoleProtectedRoute: React.FC<{ allowedRoles: UserRole[]; element: React.ReactNode }> = ({ allowedRoles, element }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{element}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedLayout />}> 
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/qr" element={<QrPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/users" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager]} element={<UsersPage />} />} />
        <Route path="/locations" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<LocationsPage />} />} />
        <Route path="/reports" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager]} element={<ReportsPage />} />} />
          <Route path="/admin/floorplan" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<FloorplanPage />} />} />
          <Route path="/admin/overview" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<OverviewPage />} />} />
          <Route path="/admin/rules" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<RulesPage />} />} />
    <Route path="/admin/notifications" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<NotificationsPage />} />} />
  <Route path="/admin/approval" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<ApprovalPage />} />} />
  <Route path="/admin/logs" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<LogsPage />} />} />
  <Route path="/admin/backup" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<BackupPage />} />} />
          <Route path="/manager/dashboard" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerDashboardPage />} />} />
          <Route path="/manager/users" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerUsersPage />} />} />
          <Route path="/manager/reservations" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerReservationsPage />} />} />
          <Route path="/manager/reports" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerReportsPage />} />} />
          <Route path="/manager/notifications" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerNotificationsPage />} />} />
          <Route path="/manager/logs" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerLogsPage />} />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
