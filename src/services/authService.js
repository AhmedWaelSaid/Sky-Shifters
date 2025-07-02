import axios from 'axios';

const API_BASE_URL = 'https://sky-shifters.duckdns.org';

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token') || (() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.refreshToken;
  })();
  if (!refreshToken) throw new Error('No refresh token available');
  try {
    const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
    // Update user object in storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.token = accessToken;
    user.accessToken = accessToken;
    user.refreshToken = newRefreshToken;
    localStorage.setItem('user', JSON.stringify(user));
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new Error('Failed to refresh access token');
  }
} 