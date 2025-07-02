import axios from 'axios';
import { refreshAccessToken } from './authService';

const API_BASE_URL = 'https://sky-shifters.duckdns.org';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      if (userData?.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config.url);
      // Don't throw for 404s, just log them
      return Promise.resolve({ data: null, status: 404 });
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Try to refresh token
      try {
        const newTokens = await refreshAccessToken();
        if (newTokens && newTokens.accessToken) {
          // Update the original request with new token
          error.config.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
          // Retry the original request
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const bookingService = {
  // Get user bookings with error handling
  async getMyBookings() {
    try {
      const response = await apiClient.get('/booking/my-bookings');
      return response.data?.data?.bookings || [];
    } catch (error) {
      console.warn('Failed to fetch bookings:', error.message);
      return [];
    }
  },

  // Delete booking with error handling
  async deleteBooking(bookingId) {
    try {
      const response = await apiClient.delete(`/booking/${bookingId}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.warn('Failed to delete booking:', bookingId, error.message);
      return false;
    }
  },

  // Cancel booking with error handling
  async cancelBooking(bookingId, reason = 'Change of plans') {
    try {
      const response = await apiClient.post(`/booking/${bookingId}/cancel`, { reason });
      return response.data?.success || false;
    } catch (error) {
      console.warn('Failed to cancel booking:', bookingId, error.message);
      return false;
    }
  },

  // Get booking details with error handling
  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/booking/${bookingId}`);
      return response.data?.data || null;
    } catch (error) {
      console.warn('Failed to fetch booking details:', bookingId, error.message);
      return null;
    }
  }
};

export default bookingService; 