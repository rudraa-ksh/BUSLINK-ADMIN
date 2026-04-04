/**
 * BusLink Admin — Routes Tab Module
 */
import { api, showToast, formatDate } from './api.js';

let routesData = [];
let allStops = [];
let expandedRouteId = null;

export async function loadRoutes() {
  try {
    const search = document.getElementById('route-search')?.value.trim() || '';
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    routesData = await api.get(`/admin/routes${params}`);
    renderRoutesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export async function loadAllStops() {
  try {
    allStops = await api.get('/admin/stops');
  } catch (err) {
    console.error('Failed to load stops:', err);
  }
}

function renderRoutesTable() {
  const tbody = document.getElementById('routes-tbody');

  if (!routesData.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h3>No routes found</h3>
          <p>Create a new route to get started</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = routesData.map(r => {
    const isExpanded = expandedRouteId === r.routeId;
    const chevronClass = isExpanded ? 'route-chevron expanded' : 'route-chevron';

    let html = `
      <tr class="route-row ${isExpanded ? 'route-row-expanded' : ''}" data-route-id="${r.routeId}">
        <td>
          <div class="route-name-cell">
            <span class="${chevronClass}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
            <strong>${r.name}</strong>
          </div>
        </td>
        <td>${r.city}</td>
        <td>${r.totalStops}</td>
        <td>${r.distanceKm ? r.distanceKm + ' km' : '—'}</td>
        <td>${r.busCount}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-route="${r.routeId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-route="${r.routeId}" data-name="${r.name.replace(/"/g, '&quot;')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;

    // Expanded detail row
    if (isExpanded && r.stops && r.stops.length > 0) {
      html += `
      <tr class="route-detail-row">
        <td colspan="7">
          <div class="route-stops-timeline">
            <div class="timeline-header">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Stop Schedule
              </h4>
              <button class="btn-primary btn-sm" data-save-times="${r.routeId}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Times
              </button>
            </div>
            <div class="timeline-list">
              ${r.stops.map((s, idx) => `
                <div class="timeline-stop">
                  <div class="timeline-marker">
                    <div class="timeline-dot ${idx === 0 ? 'timeline-dot-first' : ''} ${idx === r.stops.length - 1 ? 'timeline-dot-last' : ''}"></div>
                    ${idx < r.stops.length - 1 ? '<div class="timeline-line"></div>' : ''}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-stop-info">
                      <span class="timeline-seq">${s.sequence}</span>
                      <span class="timeline-stop-name">${s.name}</span>
                      <span class="timeline-distance">${s.distanceFromOrigin} km</span>
                    </div>
                    <div class="timeline-time-input">
                      <input type="time" class="form-control form-control-sm"
                        value="${s.arrivalTime || ''}"
                        data-route-id="${r.routeId}"
                        data-stop-id="${s.stopId}"
                        data-stop-idx="${idx}"
                        placeholder="HH:MM"
                        title="Scheduled arrival time">
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </td>
      </tr>`;
    } else if (isExpanded && (!r.stops || r.stops.length === 0)) {
      html += `
      <tr class="route-detail-row">
        <td colspan="7">
          <div class="route-stops-timeline">
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">No stops assigned to this route yet.</p>
          </div>
        </td>
      </tr>`;
    }

    return html;
  }).join('');

  // Bind row click for expand/collapse
  tbody.querySelectorAll('.route-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't toggle if clicking on edit/delete buttons
      if (e.target.closest('[data-edit-route]') || e.target.closest('[data-delete-route]')) return;
      const routeId = row.dataset.routeId;
      expandedRouteId = expandedRouteId === routeId ? null : routeId;
      renderRoutesTable();
    });
  });

  // Bind edit buttons
  tbody.querySelectorAll('[data-edit-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditRoute(btn.dataset.editRoute);
    });
  });

  // Bind delete buttons
  tbody.querySelectorAll('[data-delete-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRoute(btn.dataset.deleteRoute, btn.dataset.name);
    });
  });

  // Bind save times buttons
  tbody.querySelectorAll('[data-save-times]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveArrivalTimes(btn.dataset.saveTimes);
    });
  });
}

async function saveArrivalTimes(routeId) {
  const route = routesData.find(r => r.routeId === routeId);
  if (!route) return;

  const tbody = document.getElementById('routes-tbody');
  const timeInputs = tbody.querySelectorAll(`input[data-route-id="${routeId}"]`);

  const stops = route.stops.map((s, idx) => {
    const input = timeInputs[idx];
    return {
      stopId: s.stopId,
      distanceFromOrigin: s.distanceFromOrigin,
      arrivalTime: input?.value || null,
    };
  });

  try {
    await api.put(`/admin/routes/${routeId}`, { stops });
    showToast('Arrival times saved successfully');
    // Refresh data
    const search = document.getElementById('route-search')?.value.trim() || '';
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    routesData = await api.get(`/admin/routes${params}`);
    renderRoutesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Route Modal ────────────────────────────────────────
let routeStopEntries = [];

function openNewRouteModal() {
  document.getElementById('route-modal-title').textContent = 'New Route';
  document.getElementById('route-submit-btn').textContent = 'Create Route';
  document.getElementById('route-edit-id').value = '';
  document.getElementById('route-form').reset();
  document.getElementById('route-city').value = 'Raipur';
  routeStopEntries = [];
  renderRouteStopsList();
  document.getElementById('route-modal').classList.add('visible');
}

async function openEditRoute(routeId) {
  try {
    const r = await api.get(`/admin/routes/${routeId}`);
    document.getElementById('route-modal-title').textContent = 'Edit Route';
    document.getElementById('route-submit-btn').textContent = 'Update Route';
    document.getElementById('route-edit-id').value = routeId;
    document.getElementById('route-name').value = r.name;
    document.getElementById('route-city').value = r.city;
    document.getElementById('route-distance').value = r.distanceKm || '';
    routeStopEntries = r.stops.map(s => ({
      stopId: s.stopId,
      distanceFromOrigin: s.distanceFromOrigin,
      arrivalTime: s.arrivalTime || '',
    }));
    renderRouteStopsList();
    document.getElementById('route-modal').classList.add('visible');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function closeRouteModal() {
  document.getElementById('route-modal').classList.remove('visible');
}

function renderRouteStopsList() {
  const container = document.getElementById('route-stops-list');

  if (!routeStopEntries.length) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No stops added yet</p>';
    return;
  }

  container.innerHTML = routeStopEntries.map((entry, idx) => {
    const stop = allStops.find(s => s.id === entry.stopId);
    const stopName = stop ? stop.name : 'Unknown';
    return `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; padding:8px 10px; background:var(--bg-input); border-radius:var(--radius-sm);">
        <span style="font-size:0.8rem; color:var(--text-muted); min-width:20px;">${idx + 1}.</span>
        <span style="flex:1; font-size:0.88rem;">${stopName}</span>
        <input type="number" value="${entry.distanceFromOrigin}" step="0.1" min="0"
          style="width:70px; padding:4px 6px; border:1px solid var(--border-input); border-radius:4px; font-size:0.8rem; text-align:center;"
          data-stop-idx="${idx}" data-field="distance" placeholder="km" title="Distance from origin (km)">
        <input type="time" value="${entry.arrivalTime || ''}"
          style="width:90px; padding:4px 6px; border:1px solid var(--border-input); border-radius:4px; font-size:0.8rem; text-align:center;"
          data-stop-idx="${idx}" data-field="time" placeholder="HH:MM" title="Arrival time">
        <button class="btn-icon danger" data-remove-stop="${idx}" title="Remove" style="width:24px;height:24px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-field="distance"]').forEach(input => {
    input.addEventListener('change', (e) => {
      routeStopEntries[parseInt(e.target.dataset.stopIdx)].distanceFromOrigin = parseFloat(e.target.value) || 0;
    });
  });

  container.querySelectorAll('[data-field="time"]').forEach(input => {
    input.addEventListener('change', (e) => {
      routeStopEntries[parseInt(e.target.dataset.stopIdx)].arrivalTime = e.target.value || null;
    });
  });

  container.querySelectorAll('[data-remove-stop]').forEach(btn => {
    btn.addEventListener('click', () => {
      routeStopEntries.splice(parseInt(btn.dataset.removeStop), 1);
      renderRouteStopsList();
    });
  });
}

function addRouteStopEntry() {
  const usedIds = routeStopEntries.map(e => e.stopId);
  const available = allStops.filter(s => !usedIds.includes(s.id));

  if (!available.length) {
    showToast('All stops are already added to this route', 'warning');
    return;
  }

  const select = document.createElement('select');
  select.className = 'form-control';
  select.style.marginTop = '4px';
  select.innerHTML = `<option value="">Select a stop...</option>` +
    available.map(s => `<option value="${s.id}">${s.name} (${s.city})</option>`).join('');

  const container = document.getElementById('route-stops-list');
  container.appendChild(select);
  select.focus();

  select.addEventListener('change', () => {
    if (select.value) {
      routeStopEntries.push({ stopId: select.value, distanceFromOrigin: 0, arrivalTime: '' });
      renderRouteStopsList();
    } else {
      select.remove();
    }
  });

  select.addEventListener('blur', () => {
    setTimeout(() => {
      if (!select.value) select.remove();
    }, 200);
  });
}

export async function submitRouteForm() {
  const editId = document.getElementById('route-edit-id').value;
  const payload = {
    name: document.getElementById('route-name').value.trim(),
    city: document.getElementById('route-city').value.trim(),
    distanceKm: parseFloat(document.getElementById('route-distance').value) || null,
    stops: routeStopEntries.map(e => ({
      stopId: e.stopId,
      distanceFromOrigin: e.distanceFromOrigin,
      arrivalTime: e.arrivalTime || null,
    })),
  };

  if (!payload.name) {
    showToast('Route name is required', 'error');
    return;
  }

  try {
    if (editId) {
      await api.put(`/admin/routes/${editId}`, payload);
      showToast('Route updated successfully');
    } else {
      await api.post('/admin/routes', payload);
      showToast('Route created successfully');
    }
    closeRouteModal();
    loadRoutes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteRoute(routeId, name) {
  if (!confirm(`Are you sure you want to delete route "${name}"? Buses on this route will be unassigned.`)) return;
  try {
    await api.delete(`/admin/routes/${routeId}`);
    showToast('Route deleted successfully');
    loadRoutes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function initRouteListeners() {
  let searchTimeout;
  document.getElementById('route-search').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadRoutes(), 300);
  });

  document.getElementById('btn-new-route').addEventListener('click', openNewRouteModal);
  document.getElementById('btn-add-stop').addEventListener('click', addRouteStopEntry);
  document.getElementById('route-submit-btn').addEventListener('click', submitRouteForm);
}
