/**
 * BusLink Admin — Authentication Module
 * Handles login, Google OAuth, forgot/reset password, token management, and auth guards.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1';

// ─── Token Management ──────────────────────────────────
function getAccessToken() {
  return localStorage.getItem('buslink_admin_access_token');
}

function getRefreshToken() {
  return localStorage.getItem('buslink_admin_refresh_token');
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem('buslink_admin_access_token', accessToken);
  localStorage.setItem('buslink_admin_refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('buslink_admin_access_token');
  localStorage.removeItem('buslink_admin_refresh_token');
  localStorage.removeItem('buslink_admin_user');
}

function setUser(user) {
  localStorage.setItem('buslink_admin_user', JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('buslink_admin_user'));
  } catch {
    return null;
  }
}

// ─── View Switching ─────────────────────────────────────
function switchView(viewId) {
  document.querySelectorAll('.auth-view').forEach((v) => {
    v.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
  // Clear all error/success messages when switching
  document.querySelectorAll('.login-error, .login-success').forEach((el) => {
    el.classList.remove('visible');
    el.textContent = '';
  });
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.add('visible');
  }
}

function showSuccess(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.add('visible');
  }
}

function hideMessage(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('visible');
    el.textContent = '';
  }
}

// ─── Toggle Password Visibility ─────────────────────────
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (toggle && input) {
    toggle.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggle.innerHTML = isPassword
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    });
  }
}

// ─── Main Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (getAccessToken() && getUser()) {
    const user = getUser();
    if (user.role === 'admin') {
      window.location.href = '/dashboard.html';
      return;
    }
  }

  // Setup password toggles
  setupPasswordToggle('toggle-password', 'login-password');
  setupPasswordToggle('toggle-reset-password', 'reset-new-password');

  // ─── View Navigation ────────────────────────────────
  const showForgot = document.getElementById('show-forgot');
  if (showForgot) {
    showForgot.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-forgot');
    });
  }

  const backToLogin1 = document.getElementById('back-to-login-1');
  if (backToLogin1) {
    backToLogin1.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-login');
    });
  }

  const backToLogin2 = document.getElementById('back-to-login-2');
  if (backToLogin2) {
    backToLogin2.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-login');
    });
  }

  // ─── Login Form ──────────────────────────────────────
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('btn-login');

      hideMessage('login-error');
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Login failed');
        }

        if (data.user.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);

        window.location.href = '/dashboard.html';
      } catch (err) {
        showError('login-error', err.message);
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  }

  // ─── Forgot Password Form ───────────────────────────
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('forgot-email').value.trim();
      const btn = document.getElementById('btn-forgot');

      hideMessage('forgot-error');
      hideMessage('forgot-success');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to send reset token');
        }

        showSuccess('forgot-success', data.message || 'If that email exists, a reset token has been sent. Check your email or server console.');

        // Auto-transition to reset view after a short delay
        setTimeout(() => {
          document.getElementById('reset-email').value = email;
          switchView('view-reset');
        }, 2000);
      } catch (err) {
        showError('forgot-error', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Reset Token';
      }
    });
  }

  // ─── Reset Password Form ────────────────────────────
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('reset-email').value.trim();
      const resetToken = document.getElementById('reset-token').value.trim();
      const newPassword = document.getElementById('reset-new-password').value;
      const confirmPassword = document.getElementById('reset-confirm-password').value;
      const btn = document.getElementById('btn-reset');

      hideMessage('reset-error');
      hideMessage('reset-success');

      // Client-side validation
      if (newPassword.length < 8) {
        showError('reset-error', 'Password must be at least 8 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        showError('reset-error', 'Passwords do not match.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Resetting...';

      try {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, resetToken, newPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to reset password');
        }

        showSuccess('reset-success', 'Password reset successfully! Redirecting to login...');

        // Redirect to login after success
        setTimeout(() => {
          switchView('view-login');
          // Pre-fill the email for convenience
          document.getElementById('login-email').value = email;
        }, 2000);
      } catch (err) {
        showError('reset-error', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Reset Password';
      }
    });
  }

  // ─── Google Sign-In ──────────────────────────────────
  const googleBtn = document.getElementById('btn-google-login');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        });
        google.accounts.id.prompt();
      } else {
        showError('login-error', 'Google Sign-In is not configured. Please use email/password.');
      }
    });
  }
});

async function handleGoogleCallback(response) {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: response.credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }

    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);

    window.location.href = '/dashboard.html';
  } catch (err) {
    showError('login-error', err.message);
  }
}
