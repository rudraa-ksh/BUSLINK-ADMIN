/**
 * BusLink Admin — Mappings Tab Module
 */
import { api, showToast } from './api.js';
import { loadBuses } from './buses.js';
import { loadDrivers } from './drivers.js';

let mappingsData = [];

export async function loadMappings() {
  try {
    mappingsData = await api.get('/admin/mappings');
    renderMappings();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderMappings() {
  const container = document.getElementById('mappings-content');
  const search = document.getElementById('mapping-search')?.value.trim().toLowerCase() || '';

  let filtered = mappingsData;
  if (search) {
    filtered = mappingsData.filter(m =>
      m.plateNumber.toLowerCase().includes(search) ||
      (m.routeName || '').toLowerCase().includes(search) ||
      (m.driverName || '').toLowerCase().includes(search)
    );
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <h3>No mappings found</h3>
        <p>Assign buses to routes and drivers to get started</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="mapping-grid">${filtered.map(m => `
    <div class="mapping-card">
      <div class="mapping-card-header">
        <div class="mapping-card-title">
          <svg width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="var(--accent-blue)" stroke-width="1.5">
            <rect x="1" y="1" width="22" height="12" rx="2"/>
            <circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/>
          </svg>
          ${m.plateNumber}
        </div>
      </div>
      <div class="mapping-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Route: <strong>${m.routeName || '<span class="unassigned-label">Not assigned</span>'}</strong></span>
      </div>
      <div class="mapping-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Driver: <strong>${m.driverName || '<span class="unassigned-label">Not assigned</span>'}</strong></span>
      </div>
      <div class="mapping-actions">
        ${m.routeId
          ? `<button class="btn-danger btn-sm" data-unassign-route="${m.busId}" data-plate="${m.plateNumber}">Unassign Route</button>`
          : ''
        }
        ${m.driverId
          ? `<button class="btn-danger btn-sm" data-unassign-driver="${m.busId}" data-plate="${m.plateNumber}">Unassign Driver</button>`
          : ''
        }
      </div>
    </div>`).join('')}</div>`;

  // Attach event listeners
  container.querySelectorAll('[data-unassign-route]').forEach(btn => {
    btn.addEventListener('click', () => unassignRoute(btn.dataset.unassignRoute, btn.dataset.plate));
  });
  container.querySelectorAll('[data-unassign-driver]').forEach(btn => {
    btn.addEventListener('click', () => unassignDriver(btn.dataset.unassignDriver, btn.dataset.plate));
  });
}

// ─── Mapping Modal ──────────────────────────────────────
async function openMappingModal() {
  try {
    const [buses, routes, drivers] = await Promise.all([
      api.get('/admin/buses'),
      api.get('/admin/routes'),
      api.get('/admin/drivers'),
    ]);

    const busSelect = document.getElementById('mapping-bus');
    busSelect.innerHTML = `<option value="">Select a bus...</option>` +
      buses.map(b => `<option value="${b.busId}">${b.plateNumber}</option>`).join('');

    const routeSelect = document.getElementById('mapping-route');
    routeSelect.innerHTML = `<option value="">— No route change —</option>` +
      routes.map(r => `<option value="${r.routeId}">${r.name}</option>`).join('');

    const driverSelect = document.getElementById('mapping-driver');
    driverSelect.innerHTML = `<option value="">— No driver change —</option>` +
      drivers.filter(d => d.status === 'active')
        .map(d => `<option value="${d.driverId}">${d.name} (${d.email})</option>`).join('');

    document.getElementById('mapping-modal').classList.add('visible');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function closeMappingModal() {
  document.getElementById('mapping-modal').classList.remove('visible');
}

export async function submitMappingForm() {
  const busId    = document.getElementById('mapping-bus').value;
  const routeId  = document.getElementById('mapping-route').value;
  const driverId = document.getElementById('mapping-driver').value;

  if (!busId) {
    showToast('Please select a bus', 'error');
    return;
  }
  if (!routeId) {
    showToast('Please select a route', 'error');
    return;
  }
  if (!driverId) {
    showToast('Please select a driver', 'error');
    return;
  }

  try {
    const payload = { busId };
    if (routeId)  payload.routeId  = routeId;
    if (driverId) payload.driverId = driverId;

    await api.post('/admin/mappings/assign-all', payload);
    showToast('Assignment saved successfully');

    closeMappingModal();
    loadMappings();
    loadBuses();
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function unassignRoute(busId, plateNumber) {
  if (!confirm(`Unassign route from bus ${plateNumber}?`)) return;
  try {
    await api.delete(`/admin/mappings/bus-route/${busId}`);
    showToast('Route unassigned');
    loadMappings();
    loadBuses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function unassignDriver(busId, plateNumber) {
  if (!confirm(`Unassign driver from bus ${plateNumber}?`)) return;
  try {
    await api.delete(`/admin/mappings/bus-driver/${busId}`);
    showToast('Driver unassigned');
    loadMappings();
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function initMappingListeners() {
  let searchTimeout;
  document.getElementById('mapping-search').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderMappings(), 300);
  });

  document.getElementById('btn-new-mapping').addEventListener('click', openMappingModal);
  document.getElementById('mapping-submit-btn').addEventListener('click', submitMappingForm);
}
