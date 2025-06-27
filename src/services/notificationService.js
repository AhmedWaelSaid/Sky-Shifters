import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';

// Helper to get token from localStorage (أو حسب مكان تخزينك)
function getToken() {
  return localStorage.getItem('access_token');
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