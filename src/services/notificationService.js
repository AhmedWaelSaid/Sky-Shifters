import axios from 'axios';
import { refreshAccessToken } from './authService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Helper to get token from localStorage (أو حسب مكان تخزينك)
function getToken() {
  let token = localStorage.getItem('access_token');
  if (token) {
    console.log('[notificationService] getToken: found access_token', token);
    return token;
  }
  // جرب user
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.accessToken) {
        console.log('[notificationService] getToken: found user.accessToken', user.accessToken);
        return user.accessToken;
      }
      if (user.token) {
        console.log('[notificationService] getToken: found user.token', user.token);
        return user.token;
      }
    } catch (e) {
      console.error('[notificationService] getToken: error parsing user', e);
    }
  }
  console.warn('[notificationService] getToken: No token found!');
  return null;
}

// Axios wrapper with auto-refresh
async function axiosWithAutoRefresh(config, retry = true) {
  try {
    return await axios(config);
  } catch (err) {
    if ((err.response?.status === 401 || err.response?.status === 403) && retry) {
      // Try to refresh token
      const newTokens = await refreshAccessToken();
      if (newTokens && newTokens.accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
        };
        return axiosWithAutoRefresh(config, false);
      }
    }
    throw err;
  }
}

export async function getNotifications() {
  const token = getToken();
  console.log('[notificationService] getNotifications: token', token);
  try {
    const res = await axiosWithAutoRefresh({
      method: 'get',
      url: `${API_BASE}/notification`,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[notificationService] getNotifications: response', res.data);
    return res.data;
  } catch (err) {
    console.error('[notificationService] getNotifications: error', err);
    throw err;
  }
}

export async function getNotificationCount() {
  const token = getToken();
  console.log('[notificationService] getNotificationCount: token', token);
  try {
    const res = await axiosWithAutoRefresh({
      method: 'get',
      url: `${API_BASE}/notification/count`,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[notificationService] getNotificationCount: response', res.data);
    return res.data;
  } catch (err) {
    console.error('[notificationService] getNotificationCount: error', err);
    throw err;
  }
}

export async function markNotificationsAsRead() {
  const token = getToken();
  try {
    const res = await axiosWithAutoRefresh({
      method: 'patch',
      url: `${API_BASE}/notification`,
      headers: { Authorization: `Bearer ${token}` },
      data: {}, // body فارغ حسب الدوكيومنت
    });
    return res.data;
  } catch (err) {
    console.error('[notificationService] markNotificationsAsRead: error', err);
    throw err;
  }
} 