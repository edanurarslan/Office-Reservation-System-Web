import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  User,
  Reservation,
  CreateReservationRequest,
  Location,
  Desk,
  Room,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  HeatMapData,
  FloorPlan,
  Rule,
  NoShowHistory,
  HealthCheckResponse,
  Notification,
  CreateRuleRequest,
  RuleEvaluationResult,
  NoShowStatistics,
  LocationStatistics
} from '../../types';

class ApiService {
  // Support request
  async createSupportRequest(data: { subject: string; message: string }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/v1/support/request', data);
    return response.data;
  }
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5088/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<any> = await this.api.post('/v1/auth/login', data);
    const result = response.data;
    // Backend returns { accessToken, tokenType, expiresIn, user, refreshToken }
    // User role comes as number (1=Employee, 2=Manager, 3=Admin)
    // Map to LoginResponse format { token, user, expiresAt }
    const roleMap: Record<number, string> = { 1: 'Employee', 2: 'Manager', 3: 'Admin' };
    const mappedUser = {
      ...result.user,
      role: typeof result.user.role === 'number' ? roleMap[result.user.role] : result.user.role,
    };
    return {
      token: result.accessToken || result.token,
      user: mappedUser,
      expiresAt: new Date(Date.now() + (result.expiresIn * 1000)).toISOString(),
    };
  }

  async register(data: RegisterRequest): Promise<User> {
    const response: AxiosResponse<any> = await this.api.post('/v1/auth/register', data);
    return response.data.data || response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    return response.data.data;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/dashboard/stats');
    return response.data.data;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    const response: AxiosResponse<any> = await this.api.get('/v1/locations');
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    return data;
  }

  async getLocation(id: string): Promise<Location> {
    const response: AxiosResponse<any> = await this.api.get(`/v1/locations/${id}`);
    return Array.isArray(response.data) ? response.data[0] : response.data.data || response.data;
  }

  // Desk methods (deprecated - use v1 methods at the bottom)
  async getAvailableDesks(startTime: string, endTime: string): Promise<Desk[]> {
    const response: AxiosResponse<ApiResponse<Desk[]>> = await this.api.get(
      `/desks/available?startTime=${startTime}&endTime=${endTime}`
    );
    return response.data.data;
  }

  // Room methods
  async getRooms(locationId?: string): Promise<Room[]> {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId);
    
    const response: AxiosResponse<ApiResponse<Room[]>> = await this.api.get(`/rooms?${params.toString()}`);
    return response.data.data;
  }

  async getAvailableRooms(startTime: string, endTime: string): Promise<Room[]> {
    const response: AxiosResponse<ApiResponse<Room[]>> = await this.api.get(
      `/rooms/available?startTime=${startTime}&endTime=${endTime}`
    );
    return response.data.data;
  }

  // Reservation methods
  async getReservations(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Reservation>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Reservation>>> = await this.api.get(
      `/reservations?page=${page}&pageSize=${pageSize}`
    );
    return response.data.data;
  }

  async getMyReservations(): Promise<Reservation[]> {
    const response = await this.api.get('/reservations/my');
    // Backend returns direct array, not wrapped in ApiResponse
    const data: any[] = Array.isArray(response.data) ? response.data : response.data.data || [];
    // Map backend field names to frontend types
    return data.map((r: any) => ({
      ...r,
      startsAt: r.startsAt || r.startTime,
      endsAt: r.endsAt || r.endTime,
    }));
  }

  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    const response: AxiosResponse<ApiResponse<Reservation>> = await this.api.post('/reservations', data);
    return response.data.data;
  }

  async cancelReservation(id: string): Promise<void> {
    await this.api.delete(`/reservations/${id}`);
  }

  async checkIn(reservationId: string, qrToken?: string): Promise<void> {
    await this.api.post(`/reservations/${reservationId}/checkin`, { qrToken });
  }

  async checkOut(reservationId: string): Promise<void> {
    await this.api.post(`/reservations/${reservationId}/checkout`);
  }

  // QR Code methods


  // HeatMap methods (Phase 3)
  async getCurrentHeatMap(locationId?: string): Promise<HeatMapData> {
    const params = locationId ? `?locationId=${locationId}` : '';
    const response: AxiosResponse<ApiResponse<HeatMapData>> = 
      await this.api.get(`/heatmap/current${params}`);
    return response.data.data;
  }

  async getHistoricalHeatMap(
    from: string, 
    to: string, 
    aggregation: 'minute' | 'hourly' | 'daily' = 'hourly',
    locationId?: string
  ): Promise<HeatMapData[]> {
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('aggregation', aggregation);
    if (locationId) params.append('locationId', locationId);
    
    const response: AxiosResponse<ApiResponse<HeatMapData[]>> = 
      await this.api.get(`/heatmap/historical?${params.toString()}`);
    return response.data.data;
  }

  async getZoneDetailedOccupancy(zoneId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/heatmap/zones/${zoneId}`);
    return response.data.data;
  }

  async getOccupancyPredictions(locationId?: string, hoursAhead: number = 24): Promise<any[]> {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId);
    params.append('hoursAhead', hoursAhead.toString());
    
    const response: AxiosResponse<ApiResponse<any[]>> = 
      await this.api.get(`/heatmap/predictions?${params.toString()}`);
    return response.data.data;
  }

  async getHeatMapConfiguration(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get('/heatmap/configuration');
    return response.data.data;
  }

  async invalidateHeatMapCache(): Promise<void> {
    await this.api.post('/heatmap/invalidate-cache', {});
  }

  // Floor Plan methods (Phase 3)
  async getFloorPlans(floorId: string): Promise<FloorPlan[]> {
    const response: AxiosResponse<ApiResponse<FloorPlan[]>> = 
      await this.api.get(`/floorplans?floorId=${floorId}`);
    return response.data.data;
  }

  async getActiveFloorPlan(floorId: string): Promise<FloorPlan> {
    const response: AxiosResponse<ApiResponse<FloorPlan>> = 
      await this.api.get(`/floorplans/active?floorId=${floorId}`);
    return response.data.data;
  }

  async getFloorPlan(id: string): Promise<FloorPlan> {
    const response: AxiosResponse<ApiResponse<FloorPlan>> = 
      await this.api.get(`/floorplans/${id}`);
    return response.data.data;
  }

  async uploadFloorPlan(floorId: string, file: File): Promise<FloorPlan> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('floorId', floorId);

    const response: AxiosResponse<ApiResponse<FloorPlan>> = 
      await this.api.post('/floorplans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data.data;
  }

  async setActiveFloorPlan(floorPlanId: string): Promise<FloorPlan> {
    const response: AxiosResponse<ApiResponse<FloorPlan>> = 
      await this.api.put(`/floorplans/${floorPlanId}/activate`, {});
    return response.data.data;
  }

  async deleteFloorPlan(id: string): Promise<void> {
    await this.api.delete(`/floorplans/${id}`);
  }

  async downloadFloorPlan(id: string): Promise<Blob> {
    const response = await this.api.get(`/floorplans/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async addFloorPlanAnnotation(floorPlanId: string, annotation: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/floorplans/${floorPlanId}/annotations`, annotation);
    return response.data.data;
  }

  async deleteFloorPlanAnnotation(annotationId: string): Promise<void> {
    await this.api.delete(`/floorplans/annotations/${annotationId}`);
  }

  // Rules Engine methods (Phase 3)
  async getRules(): Promise<Rule[]> {
    const response: AxiosResponse<any> = 
      await this.api.get('/v1/rules');
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    // Backend RuleType enum: 0=Capacity, 1=NoShow, 2=Booking, 3=WorkingHours
    const ruleTypeMap: Record<number, string> = { 0: 'Capacity', 1: 'NoShow', 2: 'Booking', 3: 'WorkingHours' };
    // Map backend response to Rule interface
    return data.map((r: any) => ({
      id: r.id,
      name: r.name || `Rule ${r.id.substring(0, 8)}`,
      description: r.description || r.configuration,
      ruleType: typeof r.type === 'number' ? ruleTypeMap[r.type] || 'Capacity' : (r.type || 'Capacity'),
      scope: 'Global', // Default since not provided
      configuration: r.configuration ? (typeof r.configuration === 'string' ? { config: r.configuration } : r.configuration) : {},
      isActive: r.isActive !== false,
      priority: r.priority || 1,
      validFrom: r.validFrom,
      validUntil: r.validUntil,
      appliedCount: r.appliedCount || 0,
      lastAppliedAt: r.lastAppliedAt,
      createdAt: r.createdAt || new Date().toISOString(),
    }));
  }

  async getRule(id: string): Promise<Rule> {
    const response: AxiosResponse<ApiResponse<Rule>> = 
      await this.api.get(`/v1/rules/${id}`);
    return response.data.data;
  }

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    const response: AxiosResponse<ApiResponse<Rule>> = 
      await this.api.post('/rules', data);
    return response.data.data;
  }

  async updateRule(id: string, data: CreateRuleRequest): Promise<Rule> {
    const response: AxiosResponse<ApiResponse<Rule>> = 
      await this.api.put(`/rules/${id}`, data);
    return response.data.data;
  }

  async deleteRule(id: string): Promise<void> {
    await this.api.delete(`/rules/${id}`);
  }

  async evaluateRules(context: any): Promise<RuleEvaluationResult[]> {
    const response: AxiosResponse<ApiResponse<RuleEvaluationResult[]>> = 
      await this.api.post('/rules/evaluate', context);
    return response.data.data;
  }

  async testRule(ruleId: string, context: any): Promise<RuleEvaluationResult> {
    const response: AxiosResponse<ApiResponse<RuleEvaluationResult>> = 
      await this.api.post(`/rules/${ruleId}/test`, context);
    return response.data.data;
  }

  // No-Show methods (Phase 3)
  async detectNoShows(): Promise<void> {
    await this.api.post('/noshows/detect', {});
  }

  async getUserNoShowHistory(userId: string): Promise<NoShowHistory[]> {
    const response: AxiosResponse<ApiResponse<NoShowHistory[]>> = 
      await this.api.get(`/noshows/user/${userId}`);
    return response.data.data;
  }

  async getUserNoShowStatistics(userId: string): Promise<NoShowStatistics> {
    const response: AxiosResponse<ApiResponse<NoShowStatistics>> = 
      await this.api.get(`/noshows/stats/${userId}`);
    return response.data.data;
  }

  async checkUserRestriction(userId: string): Promise<{ isRestricted: boolean; endsAt?: string }> {
    const response: AxiosResponse<ApiResponse<{ isRestricted: boolean; endsAt?: string }>> = 
      await this.api.get(`/noshows/restriction/${userId}`);
    return response.data.data;
  }

  async waiveNoShow(id: string, reason: string): Promise<NoShowHistory> {
    const response: AxiosResponse<ApiResponse<NoShowHistory>> = 
      await this.api.put(`/noshows/${id}/waive`, { reason });
    return response.data.data;
  }

  async getLocationNoShowStatistics(locationId: string): Promise<LocationStatistics> {
    const response: AxiosResponse<ApiResponse<LocationStatistics>> = 
      await this.api.get(`/noshows/location/${locationId}/statistics`);
    return response.data.data;
  }

  // Analytics methods
  async getAnalytics(from: string, to: string, locationId?: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    if (locationId) params.append('locationId', locationId);

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/analytics?${params.toString()}`);
    return response.data.data;
  }

  // User management methods
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    
    const response = await this.api.get(`/users?${queryParams.toString()}`);
    return response.data;
  }

  async getUser(id: string): Promise<any> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async getUserRoles(): Promise<{ value: string; label: string }[]> {
    const response = await this.api.get('/users/roles');
    return response.data;
  }

  async createUser(data: {
    name: string;
    email: string;
    role: string;
    password?: string;
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
  }): Promise<any> {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    password?: string;
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    isActive?: boolean;
  }): Promise<any> {
    const response = await this.api.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = 
      await this.api.get('/notifications');
    return response.data.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.put(`/v1/notifications/${id}/read`, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(`/v1/notifications/${id}`);
  }

  // Notification management methods (v1)
  async getMyNotifications(unreadOnly: boolean = false): Promise<any[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/notifications${params}`);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response: AxiosResponse<any> = 
      await this.api.get('/v1/notifications/unread-count');
    return response.data.count || 0;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/v1/notifications/read-all', {});
  }

  async getAllNotifications(page: number = 1, pageSize: number = 20): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/notifications/all?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  async getNotificationUsers(): Promise<any[]> {
    const response: AxiosResponse<any> = 
      await this.api.get('/v1/notifications/users');
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async sendBulkNotification(data: { userIds: string[]; title?: string; message: string; type?: string }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/notifications/bulk', data);
    return response.data;
  }

  async sendNotificationByRole(data: { roles: number[]; title?: string; message: string; type?: string }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/notifications/by-role', data);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    const response: AxiosResponse<ApiResponse<HealthCheckResponse>> = 
      await this.api.get('/health');
    return response.data.data;
  }

  // Check-in methods
  async getCheckIns(reservationId: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = 
      await this.api.get(`/checkins?reservationId=${reservationId}`);
    return response.data.data;
  }

  async createCheckIn(reservationId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/checkins`, { reservationId });
    return response.data.data;
  }

  async createCheckOut(reservationId: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/checkouts`, { reservationId });
    return response.data.data;
  }

  // Floor management methods
  async getFloors(locationId?: string): Promise<any[]> {
    const params = locationId ? `?locationId=${locationId}` : '';
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/floors${params}`);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async getFloor(id: string): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/floors/${id}`);
    return response.data.data || response.data;
  }

  async createFloor(data: { name: string; floorNumber: number; description?: string; floorPlanImageUrl?: string; locationId: string }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/floors', data);
    return response.data.data || response.data;
  }

  async updateFloor(id: string, data: { name?: string; floorNumber?: number; description?: string; isActive?: boolean; floorPlanImageUrl?: string }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.put(`/v1/floors/${id}`, data);
    return response.data.data || response.data;
  }

  async deleteFloor(id: string): Promise<void> {
    await this.api.delete(`/v1/floors/${id}`);
  }

  // Zone management methods
  async getZones(floorId?: string): Promise<any[]> {
    const params = floorId ? `?floorId=${floorId}` : '';
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/zones${params}`);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async getZone(id: string): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/zones/${id}`);
    return response.data.data || response.data;
  }

  async createZone(data: { name: string; description?: string; zoneType?: string; maxCapacity?: number; floorId: string }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/zones', data);
    return response.data.data || response.data;
  }

  async updateZone(id: string, data: { name?: string; description?: string; zoneType?: string; isActive?: boolean; maxCapacity?: number }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.put(`/v1/zones/${id}`, data);
    return response.data.data || response.data;
  }

  async deleteZone(id: string): Promise<void> {
    await this.api.delete(`/v1/zones/${id}`);
  }

  // Desk management methods (v1)
  async getDesks(floorId?: string, zoneId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (floorId) params.append('floorId', floorId);
    if (zoneId) params.append('zoneId', zoneId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/desks${queryString}`);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async getDesk(id: string): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/desks/${id}`);
    return response.data.data || response.data;
  }

  async createDesk(data: { name: string; description?: string; zoneId: string; hasMonitor?: boolean; hasKeyboard?: boolean; hasMouse?: boolean; hasDockingStation?: boolean; xCoordinate?: number; yCoordinate?: number }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/desks', data);
    return response.data.data || response.data;
  }

  async updateDesk(id: string, data: { name?: string; description?: string; isActive?: boolean; hasMonitor?: boolean; hasKeyboard?: boolean; hasMouse?: boolean; hasDockingStation?: boolean; xCoordinate?: number; yCoordinate?: number }): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.put(`/v1/desks/${id}`, data);
    return response.data.data || response.data;
  }

  async updateDeskPosition(id: string, xCoordinate: number, yCoordinate: number): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.put(`/v1/desks/${id}/position`, { xCoordinate, yCoordinate });
    return response.data.data || response.data;
  }

  async updateDeskPositions(positions: { deskId: string; xCoordinate: number; yCoordinate: number }[]): Promise<any> {
    const response: AxiosResponse<any> = 
      await this.api.put('/v1/desks/positions', positions);
    return response.data.data || response.data;
  }

  async deleteDesk(id: string): Promise<void> {
    await this.api.delete(`/v1/desks/${id}`);
  }

  // ==================== LOGS ====================
  async getLogs(params?: {
    search?: string;
    action?: string;
    status?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response: AxiosResponse<any> = 
      await this.api.get(`/v1/logs${queryString}`);
    return response.data;
  }

  async getLogActions(): Promise<string[]> {
    const response: AxiosResponse<string[]> = 
      await this.api.get('/v1/logs/actions');
    return response.data;
  }

  async getLogEntityTypes(): Promise<string[]> {
    const response: AxiosResponse<string[]> = 
      await this.api.get('/v1/logs/entity-types');
    return response.data;
  }

  async getLogStats(): Promise<{
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    errorLogs: number;
    actionStats: { action: string; count: number }[];
  }> {
    const response: AxiosResponse<any> = 
      await this.api.get('/v1/logs/stats');
    return response.data;
  }

  async createLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: string;
    newValues?: string;
    additionalData?: string;
  }): Promise<{ id: string; message: string }> {
    const response: AxiosResponse<any> = 
      await this.api.post('/v1/logs', data);
    return response.data;
  }

  async cleanupOldLogs(olderThanDays: number = 90): Promise<{ message: string }> {
    const response: AxiosResponse<any> = 
      await this.api.delete(`/v1/logs/cleanup?olderThanDays=${olderThanDays}`);
    return response.data;
  }

  // ==================== APPROVAL METHODS ====================

  async getApprovals(params?: {
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: ApprovalRequest[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response: AxiosResponse<any> = await this.api.get(`/v1/approvals${queryString}`);
    return response.data;
  }

  async getApproval(id: string): Promise<ApprovalRequest> {
    const response: AxiosResponse<any> = await this.api.get(`/v1/approvals/${id}`);
    return response.data;
  }

  async createApproval(data: {
    requesterId: string;
    type: string;
    description?: string;
    requestData?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<ApprovalRequest> {
    const response: AxiosResponse<any> = await this.api.post('/v1/approvals', data);
    return response.data;
  }

  async approveRequest(id: string, data?: {
    reviewerId?: string;
    notes?: string;
  }): Promise<{ message: string; id: string; status: string; reviewedAt: string }> {
    const response: AxiosResponse<any> = await this.api.put(`/v1/approvals/${id}/approve`, data || {});
    return response.data;
  }

  async rejectRequest(id: string, data?: {
    reviewerId?: string;
    notes?: string;
    rejectionReason?: string;
  }): Promise<{ message: string; id: string; status: string; reviewedAt: string; rejectionReason?: string }> {
    const response: AxiosResponse<any> = await this.api.put(`/v1/approvals/${id}/reject`, data || {});
    return response.data;
  }

  async deleteApproval(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<any> = await this.api.delete(`/v1/approvals/${id}`);
    return response.data;
  }

  async getApprovalPendingCount(): Promise<{ pendingCount: number }> {
    const response: AxiosResponse<any> = await this.api.get('/v1/approvals/pending-count');
    return response.data;
  }

  async getApprovalStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: { type: string; count: number }[];
  }> {
    const response: AxiosResponse<any> = await this.api.get('/v1/approvals/stats');
    return response.data;
  }
}

// ApprovalRequest type
export interface ApprovalRequest {
  id: string;
  userName: string;
  userId: string;
  type: string;
  requestDate: string;
  status: string;
  description?: string;
  requestData?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
}

export default new ApiService();