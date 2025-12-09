import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Recreate the exact same API instance used in reservationService
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token
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

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = res.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);


export const paymentService = {
  /**
   * Create an online bank payment
   */
  async createOnlineBankPayment(data: any) {
    try {
      const res = await api.post('/online-bank-payments/', data);
      return res.data;
    } catch (error) {
      console.error('Error creating online bank payment:', error);
      throw error;
    }
  },


  async createCashPayment(data: any) {
    try {
      const res = await api.post('/cash-payments/', data);
      return res.data;
    } catch (error) {
      console.error('Error creating cash payment:', error);
      throw error;
    }
  },
};

export default paymentService;
