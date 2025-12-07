import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  amenities: string;
  scenery: string;
  isAvailable: boolean;
  pricePerNight: number;
  capacity: number;
  maintenance: boolean;
}

// Transform snake_case API response to camelCase for frontend
const transformRoom = (data: any): Room => ({
  id: data.id,
  roomNumber: String(data.room_number),
  roomType: data.room_type || data.amenities || 'Standard',
  amenities: data.amenities || '',
  scenery: data.scenery || '',
  isAvailable: data.is_available !== false,
  pricePerNight: Number(data.price_per_night) || 0,
  capacity: Number(data.capacity) || 2,
  maintenance: data.maintenance || false,
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomService = {
  /**
   * Get all available rooms
   */
  async getAvailableRooms(filters?: {
    roomType?: string;
    minPrice?: number;
    maxPrice?: number;
    checkIn?: string;
    checkOut?: string;
  }): Promise<Room[]> {
    try {
      const params: any = {};
      
      if (filters?.roomType && filters.roomType !== 'all') {
        params.room_type = filters.roomType;
      }
      if (filters?.minPrice) {
        params.min_price = filters.minPrice;
      }
      if (filters?.maxPrice) {
        params.max_price = filters.maxPrice;
      }
      if (filters?.checkIn) {
        params.check_in = filters.checkIn;
      }
      if (filters?.checkOut) {
        params.check_out = filters.checkOut;
      }

      const response = await api.get<any[]>('/rooms/available/', { params });
      return response.data.map(transformRoom);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  /**
   * Get a single room by ID
   */
  async getRoomById(id: number): Promise<Room> {
    try {
      const response = await api.get<any>(`/rooms/${id}/`);
      return transformRoom(response.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  /**
   * Get all rooms (including unavailable)
   */
  async getAllRooms(): Promise<Room[]> {
    try {
      const response = await api.get<any[]>('/rooms/');
      return response.data.map(transformRoom);
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      throw error;
    }
  },
};

export default roomService;
