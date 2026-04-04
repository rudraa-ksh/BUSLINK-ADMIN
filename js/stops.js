/**
 * BusLink Admin — Stops Tab Module
 */
import { api, showToast } from './api.js';

let stopsData = [];

export async function loadStops() {
  try {
    // Re-using the same listStops endpoint used for routes
    stopsData = await api.get('/admin/stops');
    
    // Filter stops based on search input
    const search = document.getElementById('stop-search')?.value.trim().toLowerCase() || '';
    if (search) {
      stopsData = stopsData.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.city.toLowerCase().includes(search)
      );
    }
    
    renderStopsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderStopsTable() {
  const tbody = document.getElementById('stops-tbody');

  if (!stopsData.length) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h3>No stops found</h3>
          <p>Create a new stop to get started</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = stopsData.map(s => {
    const coords = `${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`;
    const amenities = (s.amenities && s.amenities.length > 0) ? s.amenities.join(', ') : '<span style="color:var(--text-muted)">None</span>';

    return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.city}</td>
        <td><a href="https://maps.google.com/?q=${s.lat},${s.lng}" target="_blank" style="color:var(--accent-blue); text-decoration:none;">${coords}</a></td>
        <td>${amenities}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-stop="${s.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-stop="${s.id}" data-name="${s.name.replace(/"/g, '&quot;')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit-stop]').forEach(btn => {
    btn.addEventListener('click', () => openEditStop(btn.dataset.editStop));
  });
  tbody.querySelectorAll('[data-delete-stop]').forEach(btn => {
    btn.addEventListener('click', () => deleteStop(btn.dataset.deleteStop, btn.dataset.name));
  });
}

// ─── Stop Modal ─────────────────────────────────────────

function openNewStopModal() {
  document.getElementById('stop-modal-title').textContent = 'New Stop';
  document.getElementById('stop-submit-btn').textContent = 'Create Stop';
  document.getElementById('stop-edit-id').value = '';
  document.getElementById('stop-form').reset();
  document.getElementById('stop-city').value = 'Raipur';
  document.getElementById('stop-modal').classList.add('visible');
}

async function openEditStop(stopId) {
  try {
    const s = await api.get(`/admin/stops/${stopId}`);
    document.getElementById('stop-modal-title').textContent = 'Edit Stop';
    document.getElementById('stop-submit-btn').textContent = 'Update Stop';
    document.getElementById('stop-edit-id').value = stopId;
    document.getElementById('stop-name').value = s.name;
    document.getElementById('stop-city').value = s.city;
    document.getElementById('stop-lat').value = s.lat;
    document.getElementById('stop-lng').value = s.lng;
    document.getElementById('stop-amenities').value = s.amenities ? s.amenities.join(', ') : '';
    
    document.getElementById('stop-modal').classList.add('visible');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function closeStopModal() {
  document.getElementById('stop-modal').classList.remove('visible');
}

export async function submitStopForm() {
  const editId = document.getElementById('stop-edit-id').value;
  
  const amenitiesInput = document.getElementById('stop-amenities').value;
  const amenities = amenitiesInput.split(',').map(a => a.trim()).filter(a => a);
  
  const payload = {
    name: document.getElementById('stop-name').value.trim(),
    city: document.getElementById('stop-city').value.trim(),
    lat: parseFloat(document.getElementById('stop-lat').value) || 0,
    lng: parseFloat(document.getElementById('stop-lng').value) || 0,
    amenities: amenities
  };

  if (!payload.name) {
    showToast('Stop name is required', 'error');
    return;
  }
  
  if (!payload.lat || !payload.lng) {
    showToast('Valid latitude and longitude are required', 'error');
    return;
  }

  try {
    if (editId) {
      await api.put(`/admin/stops/${editId}`, payload);
      showToast('Stop updated successfully');
    } else {
      await api.post('/admin/stops', payload);
      showToast('Stop created successfully');
    }
    closeStopModal();
    loadStops();
    // Also trigger update of global stops list in routes if applicable
    import('./routes.js').then(module => {
      if (module.loadAllStops) module.loadAllStops();
    }).catch(() => {});
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStop(stopId, name) {
  if (!confirm(`Are you sure you want to delete the stop "${name}"? This stop will be removed from any routes that use it.`)) return;
  try {
    await api.delete(`/admin/stops/${stopId}`);
    showToast('Stop deleted successfully');
    loadStops();
    // Update global stops list
    import('./routes.js').then(module => {
      if (module.loadAllStops) module.loadAllStops();
    }).catch(() => {});
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function initStopListeners() {
  let searchTimeout;
  const searchInput = document.getElementById('stop-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadStops(), 300);
    });
  }

  document.getElementById('btn-new-stop')?.addEventListener('click', openNewStopModal);
  document.getElementById('stop-submit-btn')?.addEventListener('click', submitStopForm);
}
