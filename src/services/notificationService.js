import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';

// Helper to get token from localStorage (أو حسب مكان تخزينك)
function getToken() {
  return localStorage.getItem('access_token');
}

export async function getNotifications() {
  const token = getToken();
  const res = await axios.get(`${API_BASE}/notification`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getNotificationCount() {
  const token = getToken();
  const res = await axios.get(`${API_BASE}/notification/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
} 