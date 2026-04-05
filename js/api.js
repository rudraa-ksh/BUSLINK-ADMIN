/**
 * BusLink Admin — API Client
 * Centralized API calls with automatic token handling and refresh.
 */

const API = (import.meta.env.VITE_API_URL || '') + '/api/v1';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('buslink_admin_access_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let res = await fetch(`${API}${endpoint}`, config);

  // Token expired — try refresh
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = localStorage.getItem('buslink_admin_access_token');
      config.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API}${endpoint}`, config);
    } else {
      localStorage.removeItem('buslink_admin_access_token');
      localStorage.removeItem('buslink_admin_refresh_token');
      localStorage.removeItem('buslink_admin_user');
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('buslink_admin_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem('buslink_admin_access_token', data.accessToken);
    localStorage.setItem('buslink_admin_refresh_token', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Convenience methods ────────────────────────────────
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// ─── Toast Notifications ────────────────────────────────
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success'
        ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        : type === 'error'
          ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
          : '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
      }
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Date formatting helpers ────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getDateStatus(dateStr) {
  if (!dateStr) return 'expired';
  const d = new Date(dateStr);
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (d <= now) return 'expired';
  if (d - now <= thirtyDays) return 'warning';
  return 'valid';
}

export function formatOdometer(km) {
  if (km === undefined || km === null) return '—';
  return Math.round(km).toLocaleString() + 'km';
}
