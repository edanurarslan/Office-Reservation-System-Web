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
  PaginatedResponse
} from '../types';

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
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', data);
    return response.data.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', data);
    return response.data.data;
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
    const response: AxiosResponse<ApiResponse<Location[]>> = await this.api.get('/locations');
    return response.data.data;
  }

  async getLocation(id: string): Promise<Location> {
    const response: AxiosResponse<ApiResponse<Location>> = await this.api.get(`/locations/${id}`);
    return response.data.data;
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
    const response: AxiosResponse<ApiResponse<Reservation[]>> = await this.api.get('/reservations/my');
    return response.data.data;
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
}

export default new ApiService();