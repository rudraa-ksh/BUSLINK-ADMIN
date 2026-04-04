/**
 * BusLink Admin — Sign Up Module
 * Handles registration, OTP verification, Google OAuth, and auth guards.
 */

const API_BASE = '/api/v1';

// ─── Token helpers (shared pattern with auth.js) ────────
function setTokens(accessToken, refreshToken) {
  localStorage.setItem('buslink_admin_access_token', accessToken);
  localStorage.setItem('buslink_admin_refresh_token', refreshToken);
}

function setUser(user) {
  localStorage.setItem('buslink_admin_user', JSON.stringify(user));
}

function getAccessToken() {
  return localStorage.getItem('buslink_admin_access_token');
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

// ─── OTP Input Behavior ─────────────────────────────────
function setupOTPInputs() {
  const inputs = document.querySelectorAll('.otp-digit');

  inputs.forEach((input, index) => {
    // Auto-focus next input on entry
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      // Only allow digits
      e.target.value = val.replace(/[^0-9]/g, '');
      if (e.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Handle backspace to go to previous input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Handle paste (paste full OTP)
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = pasted.replace(/[^0-9]/g, '').slice(0, 4);
      digits.split('').forEach((d, i) => {
        if (inputs[i]) {
          inputs[i].value = d;
        }
      });
      // Focus the last filled or next empty
      const nextIndex = Math.min(digits.length, inputs.length - 1);
      inputs[nextIndex].focus();
    });
  });
}

function getOTPValue() {
  const inputs = document.querySelectorAll('.otp-digit');
  return Array.from(inputs).map((i) => i.value).join('');
}

function clearOTPInputs() {
  const inputs = document.querySelectorAll('.otp-digit');
  inputs.forEach((i) => { i.value = ''; });
  if (inputs[0]) inputs[0].focus();
}

// ─── OTP Countdown Timer ────────────────────────────────
let countdownInterval = null;

function startCountdown(seconds = 60) {
  const timerEl = document.getElementById('otp-timer');
  const countdownEl = document.getElementById('otp-countdown');
  const resendBtn = document.getElementById('btn-resend-otp');

  if (countdownInterval) clearInterval(countdownInterval);

  let remaining = seconds;
  resendBtn.disabled = true;
  timerEl.style.display = 'block';

  countdownEl.textContent = remaining;

  countdownInterval = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      timerEl.style.display = 'none';
      resendBtn.disabled = false;
    }
  }, 1000);
}

// ─── State ──────────────────────────────────────────────
let registeredEmail = '';

// ─── Main Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go to dashboard
  if (getAccessToken() && getUser()) {
    const user = getUser();
    if (user.role === 'admin') {
      window.location.href = '/dashboard.html';
      return;
    }
  }

  // Setup
  setupPasswordToggle('toggle-signup-password', 'signup-password');
  setupOTPInputs();

  // ─── Back to signup view ────────────────────────────
  const backToSignup = document.getElementById('back-to-signup');
  if (backToSignup) {
    backToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-signup');
    });
  }

  // ─── Sign Up Form ───────────────────────────────────
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      const btn = document.getElementById('btn-signup');

      hideMessage('signup-error');

      // Client-side validation
      if (name.length < 2) {
        showError('signup-error', 'Name must be at least 2 characters.');
        return;
      }

      if (password.length < 8) {
        showError('signup-error', 'Password must be at least 8 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        showError('signup-error', 'Passwords do not match.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creating account...';

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Store email for OTP verification
        registeredEmail = email;

        // Switch to OTP view
        document.getElementById('otp-subtitle').textContent =
          `Enter the 4-digit OTP sent to ${email}`;
        switchView('view-otp');
        clearOTPInputs();
        startCountdown(60);
      } catch (err) {
        showError('signup-error', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }

  // ─── OTP Verification Form ─────────────────────────
  const otpForm = document.getElementById('otp-form');
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const otp = getOTPValue();
      const btn = document.getElementById('btn-verify-otp');

      hideMessage('otp-error');
      hideMessage('otp-success');

      if (otp.length !== 4) {
        showError('otp-error', 'Please enter the complete 4-digit OTP.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const res = await fetch(`${API_BASE}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registeredEmail, otp }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'OTP verification failed');
        }

        // Store tokens and user data
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);

        showSuccess('otp-success', 'Account verified successfully! Redirecting...');

        // Check role and redirect
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/dashboard.html';
          } else {
            // Non-admin users land on login with a message
            window.location.href = '/?verified=true';
          }
        }, 1500);
      } catch (err) {
        showError('otp-error', err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Verify OTP';
      }
    });
  }

  // ─── Resend OTP ─────────────────────────────────────
  const resendBtn = document.getElementById('btn-resend-otp');
  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      if (!registeredEmail) return;

      hideMessage('otp-error');
      hideMessage('otp-success');
      resendBtn.disabled = true;
      resendBtn.textContent = 'Sending...';

      try {
        const res = await fetch(`${API_BASE}/auth/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registeredEmail }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to resend OTP');
        }

        showSuccess('otp-success', 'A new OTP has been sent to your email.');
        clearOTPInputs();
        startCountdown(60);
      } catch (err) {
        showError('otp-error', err.message);
      } finally {
        resendBtn.textContent = 'Resend OTP';
      }
    });
  }

  // ─── Google Sign-Up ─────────────────────────────────
  const googleBtn = document.getElementById('btn-google-signup');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        });
        google.accounts.id.prompt();
      } else {
        showError('signup-error', 'Google Sign-In is not configured. Please use email/password.');
      }
    });
  }
});

// ─── Google OAuth Callback ──────────────────────────────
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

    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);

    if (data.user.role === 'admin') {
      window.location.href = '/dashboard.html';
    } else {
      window.location.href = '/?verified=true';
    }
  } catch (err) {
    showError('signup-error', err.message);
  }
}
