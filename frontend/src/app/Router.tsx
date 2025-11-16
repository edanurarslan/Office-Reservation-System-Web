import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
// Auth pages
import { LoginPage, RegisterPage, SplashPage } from '../pages/auth';
// Employee pages
import { DashboardPage, ProfilePage, ReservationsPage, QrPage, ReportsPage, SupportPage, LocationsPage, NotificationsPage, SettingsPage } from '../pages/employee';
// Manager pages
import {
  DashboardPage as ManagerDashboardPage,
  LogsPage as ManagerLogsPage,
  NotificationsPage as ManagerNotificationsPage,
  ReportsPage as ManagerReportsPage,
  ReservationsPage as ManagerReservationsPage,
  UsersPage as ManagerUsersPage,
} from '../pages/manager';
// Admin pages
import {
  ApprovalPage,
  BackupPage,
  FloorplanPage,
  LocationsPage as AdminLocationsPage,
  LogsPage as AdminLogsPage,
  NotificationsPage as AdminNotificationsPage,
  ReportsPage as AdminReportsPage,
  RulesPage,
  UsersPage as AdminUsersPage,
} from '../pages/admin';
// Common widgets
import { Layout, LoadingSpinner } from '../widgets';

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
      <Route path="/" element={<SplashPage />} />
      
      <Route element={<PublicLayout />}> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedLayout />}> 
        {/* Employee Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employee/dashboard" element={<DashboardPage />} />
        <Route path="/employee/reservations" element={<ReservationsPage />} />
        <Route path="/employee/locations" element={<LocationsPage />} />
        <Route path="/employee/notifications" element={<NotificationsPage />} />
        <Route path="/employee/settings" element={<SettingsPage />} />
        <Route path="/employee/profile" element={<ProfilePage />} />
        <Route path="/employee/qr" element={<QrPage />} />
        <Route path="/employee/reports" element={<ReportsPage />} />
        <Route path="/employee/support" element={<SupportPage />} />
        
        {/* Legacy Routes */}
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/qr" element={<QrPage />} />
        <Route path="/support" element={<SupportPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/locations" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<AdminLocationsPage />} />} />
        <Route path="/admin/floorplan" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<FloorplanPage />} />} />
        <Route path="/admin/rules" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<RulesPage />} />} />
        <Route path="/admin/notifications" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<AdminNotificationsPage />} />} />
        <Route path="/admin/approval" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<ApprovalPage />} />} />
        <Route path="/admin/logs" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<AdminLogsPage />} />} />
        <Route path="/admin/backup" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<BackupPage />} />} />
        <Route path="/admin/users" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<AdminUsersPage />} />} />
        <Route path="/admin/reports" element={<RoleProtectedRoute allowedRoles={[UserRole.Admin]} element={<AdminReportsPage />} />} />
        
        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerDashboardPage />} />} />
        <Route path="/manager/users" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerUsersPage />} />} />
        <Route path="/manager/reservations" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerReservationsPage />} />} />
        <Route path="/manager/reports" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerReportsPage />} />} />
        <Route path="/manager/notifications" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerNotificationsPage />} />} />
        <Route path="/manager/logs" element={<RoleProtectedRoute allowedRoles={[UserRole.Manager]} element={<ManagerLogsPage />} />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
