import { refreshAccessToken } from './authService';

const BASE_URL = "https://sky-shifters.duckdns.org";

// Helper to handle fetch with auto-refresh
async function fetchWithAutoRefresh(url, options = {}, retry = true) {
  let token = options.headers?.Authorization?.split(' ')[1] || options.token;
  try {
    const res = await fetch(url, options);
    if ((res.status === 401 || res.status === 403) && retry) {
      // Try to refresh token
      const newTokens = await refreshAccessToken();
      if (newTokens && newTokens.accessToken) {
        // Retry with new token
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newTokens.accessToken}`,
          },
        };
        return fetchWithAutoRefresh(url, newOptions, false);
      }
    }
    return res;
  } catch (err) {
    throw err;
  }
}

export async function getUserProfile(token) {
  const res = await fetchWithAutoRefresh(`${BASE_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('API response (getUserProfile):', text);
    throw new Error('Failed to fetch profile');
  }
  return res.json();
}

export async function updateUserProfile(data, token) {
  const res = await fetchWithAutoRefresh(`${BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('API response (updateUserProfile):', text);
    throw new Error('Failed to update profile');
  }
  return res.json();
}

export async function changeUserPassword(oldPassword, newPassword, token) {
  const res = await fetchWithAutoRefresh(`${BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('API response (changeUserPassword):', text);
    throw new Error('Failed to change password');
  }
  return res.json();
}

export async function deleteUserAccount(token) {
  const res = await fetchWithAutoRefresh(`${BASE_URL}/users/delete-account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('API response (deleteUserAccount):', text);
    throw new Error('Failed to delete user account');
  }
  return res.json();
} 