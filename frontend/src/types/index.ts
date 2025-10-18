// Enums matching backend
export const UserRole = {
  Employee: 'Employee',
  Manager: 'Manager',
  Admin: 'Admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ReservationStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  CheckedIn: 'CheckedIn',
  CheckedOut: 'CheckedOut',
  NoShow: 'NoShow'
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus];

export const ResourceType = {
  Desk: 'Desk',
  Room: 'Room'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Location types
export interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  floors: Floor[];
}

export interface Floor {
  id: string;
  name: string;
  floorNumber: number;
  locationId: string;
  zones: Zone[];
}

export interface Zone {
  id: string;
  name: string;
  floorId: string;
  desks: Desk[];
  rooms: Room[];
}

export interface Desk {
  id: string;
  name: string;
  description?: string;
  zoneId: string;
  isActive: boolean;
  hasMonitor: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  reservations: Reservation[];
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  locationId: string;
  isActive: boolean;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  reservations: Reservation[];
}

// Reservation types
export interface Reservation {
  id: string;
  userId: string;
  user?: User;
  deskId?: string;
  desk?: Desk;
  roomId?: string;
  room?: Room;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  checkIns: CheckIn[];
}

export interface CheckIn {
  id: string;
  reservationId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  qrTokenId?: string;
}

export interface CreateReservationRequest {
  deskId?: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// QR Code types
export interface QrToken {
  id: string;
  token: string;
  reservationId: string;
  userId: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalDesks: number;
  availableDesks: number;
  totalRooms: number;
  availableRooms: number;
  myActiveReservations: number;
  todayReservations: number;
}

export interface AnalyticsData {
  date: string;
  occupancyRate: number;
  reservationCount: number;
  checkInRate: number;
}