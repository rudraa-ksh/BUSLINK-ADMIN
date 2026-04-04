/**
 * BusLink Admin — Buses Tab Module
 */
import { api, showToast, formatDate, getDateStatus, formatOdometer } from './api.js';

let busesData = [];
let busFilters = { search: '', sort: 'A-Z', status: '', type: '', insuranceStatus: '', pucStatus: '' };

export async function loadBuses() {
  try {
    const params = new URLSearchParams();
    if (busFilters.search) params.set('search', busFilters.search);
    if (busFilters.sort) params.set('sort', busFilters.sort);
    if (busFilters.status) params.set('status', busFilters.status);
    if (busFilters.type) params.set('type', busFilters.type);
    if (busFilters.insuranceStatus) params.set('insuranceStatus', busFilters.insuranceStatus);
    if (busFilters.pucStatus) params.set('pucStatus', busFilters.pucStatus);

    busesData = await api.get(`/admin/buses?${params.toString()}`);
    renderBusesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderBusesTable() {
  const tbody = document.getElementById('buses-tbody');

  if (!busesData.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
          <h3>No buses found</h3>
          <p>Add a new bus to get started</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = busesData.map(bus => {
    const insStatus = getDateStatus(bus.insuranceExpiry);
    const pucStatus = getDateStatus(bus.pucExpiry);
    const statusClass = bus.status === 'active' ? 'status-active'
      : bus.status === 'idle' ? 'status-idle'
      : 'status-maintenance';
    const statusLabel = bus.status === 'active' ? 'Active'
      : bus.status === 'idle' ? 'Idle'
      : bus.status === 'maintenance' ? 'Maintenance' : bus.status;

    return `
      <tr>
        <td>
          <div class="cell-registration">
            <div class="bus-icon-cell">
              <svg viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="1" width="22" height="12" rx="2"/>
                <rect x="4" y="3" width="4" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                <rect x="10" y="3" width="4" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                <rect x="16" y="3" width="4" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                <circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/>
              </svg>
            </div>
            ${bus.plateNumber}
          </div>
        </td>
        <td>${formatOdometer(bus.odometer)}</td>
        <td><span class="date-${insStatus}">${formatDate(bus.insuranceExpiry)}</span></td>
        <td><span class="date-${pucStatus}">${formatDate(bus.pucExpiry)}</span></td>
        <td>${bus.type || '—'}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>${formatDate(bus.dateOfJoining)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-bus="${bus.busId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-bus="${bus.busId}" data-plate="${bus.plateNumber}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Attach event listeners
  tbody.querySelectorAll('[data-edit-bus]').forEach(btn => {
    btn.addEventListener('click', () => openEditBus(btn.dataset.editBus));
  });
  tbody.querySelectorAll('[data-delete-bus]').forEach(btn => {
    btn.addEventListener('click', () => deleteBus(btn.dataset.deleteBus, btn.dataset.plate));
  });
}

// ─── Bus Modal ──────────────────────────────────────────
function openNewBusModal() {
  document.getElementById('bus-modal-title').textContent = 'New Bus';
  document.getElementById('bus-submit-btn').textContent = 'Create Bus';
  document.getElementById('bus-edit-id').value = '';
  document.getElementById('bus-form').reset();
  document.getElementById('bus-capacity').value = '40';
  document.getElementById('bus-odometer').value = '0';
  document.getElementById('bus-status').value = 'idle';
  document.getElementById('bus-modal').classList.add('visible');
}

async function openEditBus(busId) {
  try {
    const bus = await api.get(`/admin/buses/${busId}`);
    document.getElementById('bus-modal-title').textContent = 'Edit Bus';
    document.getElementById('bus-submit-btn').textContent = 'Update Bus';
    document.getElementById('bus-edit-id').value = busId;
    document.getElementById('bus-plate').value = bus.plateNumber;
    document.getElementById('bus-type').value = bus.type || 'Non-AC';
    document.getElementById('bus-capacity').value = bus.capacity;
    document.getElementById('bus-odometer').value = bus.odometer;
    document.getElementById('bus-status').value = bus.status || 'idle';
    document.getElementById('bus-insurance').value = bus.insuranceExpiry ? bus.insuranceExpiry.split('T')[0] : '';
    document.getElementById('bus-puc').value = bus.pucExpiry ? bus.pucExpiry.split('T')[0] : '';
    document.getElementById('bus-modal').classList.add('visible');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function closeBusModal() {
  document.getElementById('bus-modal').classList.remove('visible');
}

export async function submitBusForm() {
  const editId = document.getElementById('bus-edit-id').value;
  const payload = {
    plateNumber: document.getElementById('bus-plate').value.trim(),
    type: document.getElementById('bus-type').value,
    capacity: parseInt(document.getElementById('bus-capacity').value) || 40,
    odometer: parseFloat(document.getElementById('bus-odometer').value) || 0,
    status: document.getElementById('bus-status').value,
    insuranceExpiry: document.getElementById('bus-insurance').value || null,
    pucExpiry: document.getElementById('bus-puc').value || null,
  };

  if (!payload.plateNumber) {
    showToast('Registration number is required', 'error');
    return;
  }

  try {
    if (editId) {
      await api.put(`/admin/buses/${editId}`, payload);
      showToast('Bus updated successfully');
    } else {
      await api.post('/admin/buses', payload);
      showToast('Bus created successfully');
    }
    closeBusModal();
    loadBuses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBus(busId, plateNumber) {
  if (!confirm(`Are you sure you want to delete bus ${plateNumber}? This action cannot be undone.`)) return;
  try {
    await api.delete(`/admin/buses/${busId}`);
    showToast('Bus deleted successfully');
    loadBuses();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Bus Filters & Search ───────────────────────────────
export function initBusListeners() {
  const searchInput = document.getElementById('bus-search');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      busFilters.search = e.target.value.trim();
      loadBuses();
    }, 300);
  });

  document.getElementById('btn-new-bus').addEventListener('click', openNewBusModal);
  document.getElementById('bus-submit-btn').addEventListener('click', submitBusForm);

  document.querySelectorAll('#bus-filters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      const currentValue = chip.dataset.value;

      if (filter === 'sort') {
        if (busFilters.sort === currentValue) {
          busFilters.sort = '';
          chip.classList.remove('active');
        } else {
          document.querySelectorAll('#bus-filters .filter-chip[data-filter="sort"]').forEach(c => c.classList.remove('active'));
          busFilters.sort = currentValue;
          chip.classList.add('active');
        }
      } else if (filter === 'status') {
        const values = ['active', 'idle', 'maintenance'];
        const currentIdx = values.indexOf(busFilters.status);
        const nextIdx = (currentIdx + 1) % (values.length + 1);
        busFilters.status = nextIdx < values.length ? values[nextIdx] : '';
        chip.textContent = busFilters.status ? `Status: ${busFilters.status}` : 'Status ▾';
        chip.classList.toggle('active', !!busFilters.status);
      } else if (filter === 'type') {
        const values = ['AC', 'Non-AC'];
        const currentIdx = values.indexOf(busFilters.type);
        const nextIdx = (currentIdx + 1) % (values.length + 1);
        busFilters.type = nextIdx < values.length ? values[nextIdx] : '';
        chip.textContent = busFilters.type ? `Type: ${busFilters.type}` : 'Type ▾';
        chip.classList.toggle('active', !!busFilters.type);
      } else if (filter === 'insuranceStatus') {
        const values = ['valid', 'expired'];
        const currentIdx = values.indexOf(busFilters.insuranceStatus);
        const nextIdx = (currentIdx + 1) % (values.length + 1);
        busFilters.insuranceStatus = nextIdx < values.length ? values[nextIdx] : '';
        chip.textContent = busFilters.insuranceStatus ? `Insurance: ${busFilters.insuranceStatus}` : 'Insurance ▾';
        chip.classList.toggle('active', !!busFilters.insuranceStatus);
      } else if (filter === 'pucStatus') {
        const values = ['valid', 'expired'];
        const currentIdx = values.indexOf(busFilters.pucStatus);
        const nextIdx = (currentIdx + 1) % (values.length + 1);
        busFilters.pucStatus = nextIdx < values.length ? values[nextIdx] : '';
        chip.textContent = busFilters.pucStatus ? `PUC: ${busFilters.pucStatus}` : 'PUC ▾';
        chip.classList.toggle('active', !!busFilters.pucStatus);
      }

      loadBuses();
    });
  });
}
