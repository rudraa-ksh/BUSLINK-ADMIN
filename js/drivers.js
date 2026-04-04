/**
 * BusLink Admin — Drivers Tab Module
 */
import { api, showToast, formatDate } from './api.js';

let driversData = [];

export async function loadDrivers() {
  try {
    const search = document.getElementById('driver-search')?.value.trim() || '';
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    driversData = await api.get(`/admin/drivers${params}`);
    renderDriversTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderDriversTable() {
  const tbody = document.getElementById('drivers-tbody');

  if (!driversData.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>No drivers found</h3>
          <p>Add a new driver to get started</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = driversData.map(d => {
    const statusClass = d.status === 'active' ? 'status-active'
      : d.status === 'suspended' ? 'status-maintenance'
      : d.status === 'deleted' ? 'status-inactive'
      : 'status-pending';
    const statusLabel = d.status.charAt(0).toUpperCase() + d.status.slice(1);

    return `
      <tr>
        <td>
          <div class="cell-registration">
            <div class="bus-icon-cell" style="border-radius:50%">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <strong>${d.name}</strong>
          </div>
        </td>
        <td>${d.email}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>${d.assignedBus ? d.assignedBus.plateNumber : '<span class="unassigned-label">Unassigned</span>'}</td>
        <td>${d.assignedBus?.routeName || '<span class="unassigned-label">—</span>'}</td>
        <td>${formatDate(d.createdAt)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-driver="${d.driverId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-driver="${d.driverId}" data-name="${d.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit-driver]').forEach(btn => {
    btn.addEventListener('click', () => openEditDriver(btn.dataset.editDriver));
  });
  tbody.querySelectorAll('[data-delete-driver]').forEach(btn => {
    btn.addEventListener('click', () => deleteDriver(btn.dataset.deleteDriver, btn.dataset.name));
  });
}

function openNewDriverModal() {
  document.getElementById('driver-modal-title').textContent = 'New Driver';
  document.getElementById('driver-submit-btn').textContent = 'Create Driver';
  document.getElementById('driver-edit-id').value = '';
  document.getElementById('driver-form').reset();
  document.getElementById('driver-password-group').style.display = '';
  document.getElementById('driver-password').required = true;
  document.getElementById('driver-status-group').style.display = 'none';
  document.getElementById('driver-modal').classList.add('visible');
}

async function openEditDriver(driverId) {
  try {
    const d = await api.get(`/admin/drivers/${driverId}`);
    document.getElementById('driver-modal-title').textContent = 'Edit Driver';
    document.getElementById('driver-submit-btn').textContent = 'Update Driver';
    document.getElementById('driver-edit-id').value = driverId;
    document.getElementById('driver-name').value = d.name;
    document.getElementById('driver-email').value = d.email;
    document.getElementById('driver-password').value = '';
    document.getElementById('driver-password').required = false;
    document.getElementById('driver-password-group').style.display = '';
    document.getElementById('driver-status-group').style.display = '';
    document.getElementById('driver-status').value = d.status;
    document.getElementById('driver-modal').classList.add('visible');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function closeDriverModal() {
  document.getElementById('driver-modal').classList.remove('visible');
}

export async function submitDriverForm() {
  const editId = document.getElementById('driver-edit-id').value;
  const payload = {
    name: document.getElementById('driver-name').value.trim(),
    email: document.getElementById('driver-email').value.trim(),
  };

  const password = document.getElementById('driver-password').value;
  if (password) payload.password = password;

  if (editId) {
    const status = document.getElementById('driver-status').value;
    if (status) payload.accountStatus = status;
  }

  if (!payload.name || !payload.email) {
    showToast('Name and email are required', 'error');
    return;
  }

  if (!editId && !password) {
    showToast('Password is required for new drivers', 'error');
    return;
  }

  try {
    if (editId) {
      await api.put(`/admin/drivers/${editId}`, payload);
      showToast('Driver updated successfully');
    } else {
      await api.post('/admin/drivers', payload);
      showToast('Driver created successfully');
    }
    closeDriverModal();
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteDriver(driverId, name) {
  if (!confirm(`Are you sure you want to deactivate driver ${name}?`)) return;
  try {
    await api.delete(`/admin/drivers/${driverId}`);
    showToast('Driver deactivated successfully');
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function initDriverListeners() {
  let searchTimeout;
  document.getElementById('driver-search').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadDrivers(), 300);
  });

  document.getElementById('btn-new-driver').addEventListener('click', openNewDriverModal);
  document.getElementById('driver-submit-btn').addEventListener('click', submitDriverForm);
}
