/**
 * BusLink Admin — App Initialization
 * Tab navigation, auth guard, and initial data loading.
 */
import { api } from './api.js';
import { loadBuses, initBusListeners, closeBusModal } from './buses.js';
import { loadDrivers, initDriverListeners, closeDriverModal } from './drivers.js';
import { loadRoutes, loadAllStops, initRouteListeners, closeRouteModal } from './routes.js';
import { loadStops, initStopListeners, closeStopModal } from './stops.js';
import { loadMappings, initMappingListeners, closeMappingModal } from './mappings.js';

document.addEventListener('DOMContentLoaded', () => {
  // ─── Auth Guard ────────────────────────────────────────
  const token = localStorage.getItem('buslink_admin_access_token');
  const userStr = localStorage.getItem('buslink_admin_user');

  if (!token || !userStr) {
    window.location.href = '/';
    return;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    window.location.href = '/';
    return;
  }

  if (user.role !== 'admin') {
    localStorage.clear();
    window.location.href = '/';
    return;
  }

  // ─── Set Admin Info ────────────────────────────────────
  const adminNameEl = document.getElementById('admin-name');
  const adminAvatarEl = document.getElementById('admin-avatar');
  if (adminNameEl) adminNameEl.textContent = user.name || 'Admin';
  if (adminAvatarEl) adminAvatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();

  // ─── Logout ────────────────────────────────────────────
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      const refreshToken = localStorage.getItem('buslink_admin_refresh_token');
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('buslink_admin_access_token');
    localStorage.removeItem('buslink_admin_refresh_token');
    localStorage.removeItem('buslink_admin_user');
    window.location.href = '/';
  });

  // ─── Tab Navigation ───────────────────────────────────
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`panel-${tabId}`).classList.add('active');

      switch (tabId) {
        case 'buses': loadBuses(); break;
        case 'drivers': loadDrivers(); break;
        case 'routes': loadRoutes(); break;
        case 'stops': loadStops(); break;
        case 'mappings': loadMappings(); break;
      }
    });
  });

  // ─── Initialize Listeners ─────────────────────────────
  initBusListeners();
  initDriverListeners();
  initRouteListeners();
  initStopListeners();
  initMappingListeners();

  // ─── Modal close via data-close attributes ────────────
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      document.getElementById(modalId).classList.remove('visible');
    });
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('visible');
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.visible').forEach(m => {
        m.classList.remove('visible');
      });
    }
  });

  // ─── Initial Data Load ────────────────────────────────
  loadAllStops();
  loadBuses();
});
