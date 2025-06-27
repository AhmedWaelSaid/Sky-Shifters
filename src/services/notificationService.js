import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';

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

export async function getNotifications() {
  const token = getToken();
  console.log('[notificationService] getNotifications: token', token);
  try {
    const res = await axios.get(`${API_BASE}/notification`, {
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
    const res = await axios.get(`${API_BASE}/notification/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[notificationService] getNotificationCount: response', res.data);
    return res.data;
  } catch (err) {
    console.error('[notificationService] getNotificationCount: error', err);
    throw err;
  }
} 