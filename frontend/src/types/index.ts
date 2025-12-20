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
  resourceType: ResourceType;
  resourceId: string;
  desk?: Desk;
  room?: Room;
  deskName?: string;
  roomName?: string;
  startsAt: string;
  endsAt: string;
  status: ReservationStatus;
  notes?: string;
  purpose?: string;
  expectedAttendees?: number;
  checkInAt?: string;
  checkOutAt?: string;
  createdAt: string;
  updatedAt: string;
  checkIns?: CheckIn[];
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
  resourceType: string; // "desk" | "room"
  resourceId: string;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
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

// HeatMap types (Phase 3)
export interface HeatMapData {
  timestamp: string;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  colorCode: string;
  trend: string;
  byFloor?: FloorOccupancy[];
  byZone?: ZoneOccupancy[];
  byDesk?: DeskOccupancy[];
}

export interface FloorOccupancy {
  floorId: string;
  floorName: string;
  capacity: number;
  occupancy: number;
  occupancyPercentage: number;
}

export interface ZoneOccupancy {
  zoneId: string;
  zoneName: string;
  capacity: number;
  occupancy: number;
  occupancyPercentage: number;
}

export interface DeskOccupancy {
  deskId: string;
  deskName: string;
  isOccupied: boolean;
  currentUser?: string;
  reservedUntil?: string;
}

// Floor Plan types (Phase 3)
export interface FloorPlan {
  id: string;
  floorId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  width?: number;
  height?: number;
  isActive: boolean;
  annotations: FloorPlanAnnotation[];
  uploadedBy: string;
  uploadedAt: string;
}

export interface FloorPlanAnnotation {
  id: string;
  floorPlanId: string;
  type: string;
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  label: string;
  color: string;
  createdAt: string;
}

export interface CreateFloorPlanRequest {
  floorId: string;
  file: File;
}

// Rule types (Phase 3)
export interface Rule {
  id: string;
  name: string;
  description?: string;
  ruleType: 'Pricing' | 'Availability' | 'NoShow' | 'Capacity' | 'Notification';
  scope: 'Global' | 'Location' | 'Floor' | 'Zone' | 'Resource';
  targetId?: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
  priority: number;
  validFrom?: string;
  validUntil?: string;
  appliedCount: number;
  lastAppliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  ruleType: 'Pricing' | 'Availability' | 'NoShow' | 'Capacity' | 'Notification';
  scope: 'Global' | 'Location' | 'Floor' | 'Zone' | 'Resource';
  targetId?: string;
  configuration: Record<string, unknown>;
  priority: number;
  validFrom?: string;
  validUntil?: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  isApplicable: boolean;
  evaluation: Record<string, unknown>;
  appliedActions?: string[];
}

// No-Show types (Phase 3)
export interface NoShowHistory {
  id: string;
  userId: string;
  user?: User;
  reservationId: string;
  reservation?: Reservation;
  occurrenceDate: string;
  gracePeriodMinutes: number;
  isPenalized: boolean;
  penaltyWaived: boolean;
  waiverReason?: string;
  waivedBy?: string;
  locationId: string;
  createdAt: string;
}

export interface NoShowStatistics {
  userId: string;
  currentMonthCount: number;
  isRestricted: boolean;
  restrictionEndsAt?: string;
  totalCount: number;
  lastOccurrence?: string;
}

export interface LocationStatistics {
  locationId: string;
  totalNoShows: number;
  averagePerUser: number;
  trendPercentage: number;
  topOffenders: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}

// Health Check types
export interface HealthCheckResponse {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  timestamp: string;
  checks: Record<string, {
    status: string;
    message?: string;
    responseTime: number;
  }>;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Error' | 'Success';
  isRead: boolean;
  createdAt: string;
}