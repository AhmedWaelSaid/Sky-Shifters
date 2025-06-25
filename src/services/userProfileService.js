const BASE_URL = "https://sky-shifters.duckdns.org";

export async function getUserProfile(token) {
  const res = await fetch(`${BASE_URL}/users/profile`, {
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
  const res = await fetch(`${BASE_URL}/users/profile`, {
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
  const res = await fetch(`${BASE_URL}/users/change-password`, {
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