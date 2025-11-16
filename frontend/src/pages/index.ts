// Auth pages
export { LoginPage, RegisterPage } from './auth';

// Employee pages
export {
  DashboardPage,
  ProfilePage,
  ReservationsPage,
  QrPage,
  SupportPage,
  ReportsPage as EmployeeReportsPage,
  LocationsPage,
  NotificationsPage,
  SettingsPage,
} from './employee';

// Manager pages
export {
  DashboardPage as ManagerDashboardPage,
  LogsPage as ManagerLogsPage,
  NotificationsPage as ManagerNotificationsPage,
  ReportsPage as ManagerReportsPage,
  ReservationsPage as ManagerReservationsPage,
  UsersPage as ManagerUsersPage,
} from './manager';

// Admin pages
export {
  ApprovalPage,
  BackupPage,
  FloorplanPage,
  LocationsPage as AdminLocationsPage,
  LogsPage as AdminLogsPage,
  NotificationsPage as AdminNotificationsPage,
  RulesPage,
  UsersPage as AdminUsersPage,
  ReportsPage as AdminReportsPage,
} from './admin';
