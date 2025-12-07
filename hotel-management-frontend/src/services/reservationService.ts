import axios from 'axios';
import type { Reservation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Transform snake_case API response to camelCase for frontend
const transformReservation = (data: any): Reservation => ({
  id: data.id,
  userId: data.user_id,
  roomId: data.room_id,
  checkInDate: data.check_in_date,
  checkOutDate: data.check_out_date,
  guestName: data.guest_name,
  guestEmail: data.guest_email,
  guestPhone: data.guest_phone || '',
  numberOfGuests: Number(data.number_of_guests) || 0,
  totalPrice: Number(data.total_price) || 0,
  status: data.status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  roomDetails: data.room_details ? {
    roomNumber: data.room_details.room_number,
    roomType: data.room_details.room_type || data.room_details.amenities,
    floor: Number(data.room_details.floor) || 0,
    pricePerNight: Number(data.room_details.price_per_night) || 0,
  } : undefined,
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export interface ReservationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reservation[];
}

export interface CreateReservationData {
  check_in_date: string;
  number_of_guests: number;
  total_price: number;
  duration: number;
  hour?: number;
  room_id: number;
}

export interface UpdateReservationData {
  check_in_date?: string;
  number_of_guests?: number;
  total_price?: number;
  duration?: number;
  hour?: number;
  room_id?: number;
}

export const reservationService = {
  /**
   * Get all reservations for the current user
   */
  async getMyReservations(status?: string, ordering?: string): Promise<Reservation[]> {
    try {
      const params: any = {};
      if (status && status !== 'all') {
        params.status = status;
      }
      if (ordering) {
        params.ordering = ordering;
      }

      const response = await api.get<any>('/reservations/my_reservations/', { params });
      const data = response.data.results || response.data;
      // Transform each reservation from snake_case to camelCase
      return Array.isArray(data) ? data.map(transformReservation) : [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: number): Promise<Reservation> {
    try {
      const response = await api.get<any>(`/reservations/${id}/`);
      return transformReservation(response.data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  },

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    try {
      const response = await api.post<any>('/reservations/', data);
      return transformReservation(response.data);
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  /**
   * Update an existing reservation
   */
  async updateReservation(id: number, data: UpdateReservationData): Promise<Reservation> {
    try {
      const response = await api.patch<any>(`/reservations/${id}/`, data);
      return transformReservation(response.data);
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: number): Promise<Reservation> {
    try {
      const response = await api.post<any>(`/reservations/${id}/cancel/`);
      return transformReservation(response.data);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  },

  /**
   * Update reservation status
   */
  async updateReservationStatus(id: number, status: string): Promise<Reservation> {
    try {
      const response = await api.post<any>(`/reservations/${id}/update_status/`, { status });
      return transformReservation(response.data);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  },
};

export default reservationService;
