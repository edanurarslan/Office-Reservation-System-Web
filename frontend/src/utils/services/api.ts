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

  // Desk methods
  async getDesks(locationId?: string, zoneId?: string): Promise<Desk[]> {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId);
    if (zoneId) params.append('zoneId', zoneId);
    
    const response: AxiosResponse<ApiResponse<Desk[]>> = await this.api.get(`/desks?${params.toString()}`);
    return response.data.data;
  }

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
  async generateQrCode(reservationId: string): Promise<{ qrCodeData: string; token: string }> {
    const response: AxiosResponse<ApiResponse<{ qrCodeData: string; token: string }>> = 
      await this.api.post(`/qr/generate/${reservationId}`);
    return response.data.data;
  }

  async scanQrCode(token: string): Promise<{ reservation: Reservation; isValid: boolean }> {
    const response: AxiosResponse<ApiResponse<{ reservation: Reservation; isValid: boolean }>> = 
      await this.api.post('/qr/scan', { token });
    return response.data.data;
  }

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
  async getUsers(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<User>>> = 
      await this.api.get(`/users?page=${page}&pageSize=${pageSize}`);
    return response.data.data;
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.api.get(`/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.api.put(`/users/${id}`, data);
    return response.data.data;
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
    await this.api.put(`/notifications/${id}/read`, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(`/notifications/${id}`);
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    const response: AxiosResponse<ApiResponse<HealthCheckResponse>> = 
      await this.api.get('/health');
    return response.data.data;
  }

  // Logs methods
  async getLogs(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<any>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> = 
      await this.api.get(`/logs?page=${page}&pageSize=${pageSize}`);
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
}

export default new ApiService();