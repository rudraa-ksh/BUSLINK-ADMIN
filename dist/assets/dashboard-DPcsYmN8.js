import"./styles-Pu9CBaP3.js";const L="https://buslink-back-end.onrender.com/api/v1";async function B(t,e={}){const n=localStorage.getItem("buslink_admin_access_token"),a={headers:{"Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{},...e.headers},...e};e.body&&typeof e.body=="object"&&(a.body=JSON.stringify(e.body));let s=await fetch(`${L}${t}`,a);if(s.status===401)if(await V()){const o=localStorage.getItem("buslink_admin_access_token");a.headers.Authorization=`Bearer ${o}`,s=await fetch(`${L}${t}`,a)}else throw localStorage.removeItem("buslink_admin_access_token"),localStorage.removeItem("buslink_admin_refresh_token"),localStorage.removeItem("buslink_admin_user"),window.location.href="/",new Error("Session expired");const i=await s.json();if(!s.ok)throw new Error(i.message||`Request failed (${s.status})`);return i}async function V(){const t=localStorage.getItem("buslink_admin_refresh_token");if(!t)return!1;try{const e=await fetch(`${L}/auth/refresh-token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:t})});if(!e.ok)return!1;const n=await e.json();return localStorage.setItem("buslink_admin_access_token",n.accessToken),localStorage.setItem("buslink_admin_refresh_token",n.refreshToken),!0}catch{return!1}}const c={get:t=>B(t,{method:"GET"}),post:(t,e)=>B(t,{method:"POST",body:e}),put:(t,e)=>B(t,{method:"PUT",body:e}),delete:t=>B(t,{method:"DELETE"})};function r(t,e="success"){const n=document.getElementById("toast-container"),a=document.createElement("div");a.className=`toast ${e}`,a.innerHTML=`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${e==="success"?'<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':e==="error"?'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>':'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}
    </svg>
    <span>${t}</span>
  `,n.appendChild(a),setTimeout(()=>a.remove(),3e3)}function w(t){return t?new Date(t).toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"}):"—"}function N(t){if(!t)return"expired";const e=new Date(t),n=new Date,a=720*60*60*1e3;return e<=n?"expired":e-n<=a?"warning":"valid"}function J(t){return t==null?"—":Math.round(t).toLocaleString()+"km"}let C=[],l={search:"",sort:"A-Z",status:"",type:"",insuranceStatus:"",pucStatus:""};async function g(){try{const t=new URLSearchParams;l.search&&t.set("search",l.search),l.sort&&t.set("sort",l.sort),l.status&&t.set("status",l.status),l.type&&t.set("type",l.type),l.insuranceStatus&&t.set("insuranceStatus",l.insuranceStatus),l.pucStatus&&t.set("pucStatus",l.pucStatus),C=await c.get(`/admin/buses?${t.toString()}`),K()}catch(t){r(t.message,"error")}}function K(){const t=document.getElementById("buses-tbody");if(!C.length){t.innerHTML=`
      <tr><td colspan="8">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
          <h3>No buses found</h3>
          <p>Add a new bus to get started</p>
        </div>
      </td></tr>`;return}t.innerHTML=C.map(e=>{const n=N(e.insuranceExpiry),a=N(e.pucExpiry),s=e.status==="active"?"status-active":e.status==="idle"?"status-idle":"status-maintenance",i=e.status==="active"?"Active":e.status==="idle"?"Idle":e.status==="maintenance"?"Maintenance":e.status;return`
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
            ${e.plateNumber}
          </div>
        </td>
        <td>${J(e.odometer)}</td>
        <td><span class="date-${n}">${w(e.insuranceExpiry)}</span></td>
        <td><span class="date-${a}">${w(e.pucExpiry)}</span></td>
        <td>${e.type||"—"}</td>
        <td><span class="status-badge ${s}">${i}</span></td>
        <td>${w(e.dateOfJoining)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-bus="${e.busId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-bus="${e.busId}" data-plate="${e.plateNumber}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`}).join(""),t.querySelectorAll("[data-edit-bus]").forEach(e=>{e.addEventListener("click",()=>W(e.dataset.editBus))}),t.querySelectorAll("[data-delete-bus]").forEach(e=>{e.addEventListener("click",()=>X(e.dataset.deleteBus,e.dataset.plate))})}function G(){document.getElementById("bus-modal-title").textContent="New Bus",document.getElementById("bus-submit-btn").textContent="Create Bus",document.getElementById("bus-edit-id").value="",document.getElementById("bus-form").reset(),document.getElementById("bus-capacity").value="40",document.getElementById("bus-odometer").value="0",document.getElementById("bus-status").value="idle",document.getElementById("bus-modal").classList.add("visible")}async function W(t){try{const e=await c.get(`/admin/buses/${t}`);document.getElementById("bus-modal-title").textContent="Edit Bus",document.getElementById("bus-submit-btn").textContent="Update Bus",document.getElementById("bus-edit-id").value=t,document.getElementById("bus-plate").value=e.plateNumber,document.getElementById("bus-type").value=e.type||"Non-AC",document.getElementById("bus-capacity").value=e.capacity,document.getElementById("bus-odometer").value=e.odometer,document.getElementById("bus-status").value=e.status||"idle",document.getElementById("bus-insurance").value=e.insuranceExpiry?e.insuranceExpiry.split("T")[0]:"",document.getElementById("bus-puc").value=e.pucExpiry?e.pucExpiry.split("T")[0]:"",document.getElementById("bus-modal").classList.add("visible")}catch(e){r(e.message,"error")}}function Z(){document.getElementById("bus-modal").classList.remove("visible")}async function Q(){const t=document.getElementById("bus-edit-id").value,e={plateNumber:document.getElementById("bus-plate").value.trim(),type:document.getElementById("bus-type").value,capacity:parseInt(document.getElementById("bus-capacity").value)||40,odometer:parseFloat(document.getElementById("bus-odometer").value)||0,status:document.getElementById("bus-status").value,insuranceExpiry:document.getElementById("bus-insurance").value||null,pucExpiry:document.getElementById("bus-puc").value||null};if(!e.plateNumber){r("Registration number is required","error");return}try{t?(await c.put(`/admin/buses/${t}`,e),r("Bus updated successfully")):(await c.post("/admin/buses",e),r("Bus created successfully")),Z(),g()}catch(n){r(n.message,"error")}}async function X(t,e){if(confirm(`Are you sure you want to delete bus ${e}? This action cannot be undone.`))try{await c.delete(`/admin/buses/${t}`),r("Bus deleted successfully"),g()}catch(n){r(n.message,"error")}}function Y(){const t=document.getElementById("bus-search");let e;t.addEventListener("input",n=>{clearTimeout(e),e=setTimeout(()=>{l.search=n.target.value.trim(),g()},300)}),document.getElementById("btn-new-bus").addEventListener("click",G),document.getElementById("bus-submit-btn").addEventListener("click",Q),document.querySelectorAll("#bus-filters .filter-chip").forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.filter,s=n.dataset.value;if(a==="sort")l.sort===s?(l.sort="",n.classList.remove("active")):(document.querySelectorAll('#bus-filters .filter-chip[data-filter="sort"]').forEach(i=>i.classList.remove("active")),l.sort=s,n.classList.add("active"));else if(a==="status"){const i=["active","idle","maintenance"],o=(i.indexOf(l.status)+1)%(i.length+1);l.status=o<i.length?i[o]:"",n.textContent=l.status?`Status: ${l.status}`:"Status ▾",n.classList.toggle("active",!!l.status)}else if(a==="type"){const i=["AC","Non-AC"],o=(i.indexOf(l.type)+1)%(i.length+1);l.type=o<i.length?i[o]:"",n.textContent=l.type?`Type: ${l.type}`:"Type ▾",n.classList.toggle("active",!!l.type)}else if(a==="insuranceStatus"){const i=["valid","expired"],o=(i.indexOf(l.insuranceStatus)+1)%(i.length+1);l.insuranceStatus=o<i.length?i[o]:"",n.textContent=l.insuranceStatus?`Insurance: ${l.insuranceStatus}`:"Insurance ▾",n.classList.toggle("active",!!l.insuranceStatus)}else if(a==="pucStatus"){const i=["valid","expired"],o=(i.indexOf(l.pucStatus)+1)%(i.length+1);l.pucStatus=o<i.length?i[o]:"",n.textContent=l.pucStatus?`PUC: ${l.pucStatus}`:"PUC ▾",n.classList.toggle("active",!!l.pucStatus)}g()})})}let T=[];async function h(){var t;try{const e=((t=document.getElementById("driver-search"))==null?void 0:t.value.trim())||"",n=e?`?search=${encodeURIComponent(e)}`:"";T=await c.get(`/admin/drivers${n}`),ee()}catch(e){r(e.message,"error")}}function ee(){const t=document.getElementById("drivers-tbody");if(!T.length){t.innerHTML=`
      <tr><td colspan="7">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>No drivers found</h3>
          <p>Add a new driver to get started</p>
        </div>
      </td></tr>`;return}t.innerHTML=T.map(e=>{var s;const n=e.status==="active"?"status-active":e.status==="suspended"?"status-maintenance":e.status==="deleted"?"status-inactive":"status-pending",a=e.status.charAt(0).toUpperCase()+e.status.slice(1);return`
      <tr>
        <td>
          <div class="cell-registration">
            <div class="bus-icon-cell" style="border-radius:50%">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <strong>${e.name}</strong>
          </div>
        </td>
        <td>${e.email}</td>
        <td><span class="status-badge ${n}">${a}</span></td>
        <td>${e.assignedBus?e.assignedBus.plateNumber:'<span class="unassigned-label">Unassigned</span>'}</td>
        <td>${((s=e.assignedBus)==null?void 0:s.routeName)||'<span class="unassigned-label">—</span>'}</td>
        <td>${w(e.createdAt)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-driver="${e.driverId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-driver="${e.driverId}" data-name="${e.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`}).join(""),t.querySelectorAll("[data-edit-driver]").forEach(e=>{e.addEventListener("click",()=>ne(e.dataset.editDriver))}),t.querySelectorAll("[data-delete-driver]").forEach(e=>{e.addEventListener("click",()=>re(e.dataset.deleteDriver,e.dataset.name))})}function te(){document.getElementById("driver-modal-title").textContent="New Driver",document.getElementById("driver-submit-btn").textContent="Create Driver",document.getElementById("driver-edit-id").value="",document.getElementById("driver-form").reset(),document.getElementById("driver-password-group").style.display="",document.getElementById("driver-password").required=!0,document.getElementById("driver-status-group").style.display="none",document.getElementById("driver-modal").classList.add("visible")}async function ne(t){try{const e=await c.get(`/admin/drivers/${t}`);document.getElementById("driver-modal-title").textContent="Edit Driver",document.getElementById("driver-submit-btn").textContent="Update Driver",document.getElementById("driver-edit-id").value=t,document.getElementById("driver-name").value=e.name,document.getElementById("driver-email").value=e.email,document.getElementById("driver-password").value="",document.getElementById("driver-password").required=!1,document.getElementById("driver-password-group").style.display="",document.getElementById("driver-status-group").style.display="",document.getElementById("driver-status").value=e.status,document.getElementById("driver-modal").classList.add("visible")}catch(e){r(e.message,"error")}}function se(){document.getElementById("driver-modal").classList.remove("visible")}async function ae(){const t=document.getElementById("driver-edit-id").value,e={name:document.getElementById("driver-name").value.trim(),email:document.getElementById("driver-email").value.trim()},n=document.getElementById("driver-password").value;if(n&&(e.password=n),t){const a=document.getElementById("driver-status").value;a&&(e.accountStatus=a)}if(!e.name||!e.email){r("Name and email are required","error");return}if(!t&&!n){r("Password is required for new drivers","error");return}try{t?(await c.put(`/admin/drivers/${t}`,e),r("Driver updated successfully")):(await c.post("/admin/drivers",e),r("Driver created successfully")),se(),h()}catch(a){r(a.message,"error")}}async function re(t,e){if(confirm(`Are you sure you want to deactivate driver ${e}?`))try{await c.delete(`/admin/drivers/${t}`),r("Driver deactivated successfully"),h()}catch(n){r(n.message,"error")}}function oe(){let t;document.getElementById("driver-search").addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>h(),300)}),document.getElementById("btn-new-driver").addEventListener("click",te),document.getElementById("driver-submit-btn").addEventListener("click",ae)}let b=[],A=[],S=null;async function I(){var t;try{const e=((t=document.getElementById("route-search"))==null?void 0:t.value.trim())||"",n=e?`?search=${encodeURIComponent(e)}`:"";b=await c.get(`/admin/routes${n}`),_()}catch(e){r(e.message,"error")}}async function R(){try{A=await c.get("/admin/stops")}catch(t){console.error("Failed to load stops:",t)}}function _(){const t=document.getElementById("routes-tbody");if(!b.length){t.innerHTML=`
      <tr><td colspan="7">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h3>No routes found</h3>
          <p>Create a new route to get started</p>
        </div>
      </td></tr>`;return}t.innerHTML=b.map(e=>{const n=S===e.routeId,a=n?"route-chevron expanded":"route-chevron";let s=`
      <tr class="route-row ${n?"route-row-expanded":""}" data-route-id="${e.routeId}">
        <td>
          <div class="route-name-cell">
            <span class="${a}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
            <strong>${e.name}</strong>
          </div>
        </td>
        <td>${e.city}</td>
        <td>${e.totalStops}</td>
        <td>${e.distanceKm?e.distanceKm+" km":"—"}</td>
        <td>${e.busCount}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-route="${e.routeId}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-route="${e.routeId}" data-name="${e.name.replace(/"/g,"&quot;")}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;return n&&e.stops&&e.stops.length>0?s+=`
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
              <button class="btn-primary btn-sm" data-save-times="${e.routeId}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Times
              </button>
            </div>
            <div class="timeline-list">
              ${e.stops.map((i,d)=>`
                <div class="timeline-stop">
                  <div class="timeline-marker">
                    <div class="timeline-dot ${d===0?"timeline-dot-first":""} ${d===e.stops.length-1?"timeline-dot-last":""}"></div>
                    ${d<e.stops.length-1?'<div class="timeline-line"></div>':""}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-stop-info">
                      <span class="timeline-seq">${i.sequence}</span>
                      <span class="timeline-stop-name">${i.name}</span>
                      <span class="timeline-distance">${i.distanceFromOrigin} km</span>
                    </div>
                    <div class="timeline-time-input">
                      <input type="time" class="form-control form-control-sm"
                        value="${i.arrivalTime||""}"
                        data-route-id="${e.routeId}"
                        data-stop-id="${i.stopId}"
                        data-stop-idx="${d}"
                        placeholder="HH:MM"
                        title="Scheduled arrival time">
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </td>
      </tr>`:n&&(!e.stops||e.stops.length===0)&&(s+=`
      <tr class="route-detail-row">
        <td colspan="7">
          <div class="route-stops-timeline">
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">No stops assigned to this route yet.</p>
          </div>
        </td>
      </tr>`),s}).join(""),t.querySelectorAll(".route-row").forEach(e=>{e.addEventListener("click",n=>{if(n.target.closest("[data-edit-route]")||n.target.closest("[data-delete-route]"))return;const a=e.dataset.routeId;S=S===a?null:a,_()})}),t.querySelectorAll("[data-edit-route]").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation(),le(e.dataset.editRoute)})}),t.querySelectorAll("[data-delete-route]").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation(),ue(e.dataset.deleteRoute,e.dataset.name)})}),t.querySelectorAll("[data-save-times]").forEach(e=>{e.addEventListener("click",n=>{n.stopPropagation(),ie(e.dataset.saveTimes)})})}async function ie(t){var i;const e=b.find(d=>d.routeId===t);if(!e)return;const a=document.getElementById("routes-tbody").querySelectorAll(`input[data-route-id="${t}"]`),s=e.stops.map((d,o)=>{const u=a[o];return{stopId:d.stopId,distanceFromOrigin:d.distanceFromOrigin,arrivalTime:(u==null?void 0:u.value)||null}});try{await c.put(`/admin/routes/${t}`,{stops:s}),r("Arrival times saved successfully");const d=((i=document.getElementById("route-search"))==null?void 0:i.value.trim())||"",o=d?`?search=${encodeURIComponent(d)}`:"";b=await c.get(`/admin/routes${o}`),_()}catch(d){r(d.message,"error")}}let p=[];function de(){document.getElementById("route-modal-title").textContent="New Route",document.getElementById("route-submit-btn").textContent="Create Route",document.getElementById("route-edit-id").value="",document.getElementById("route-form").reset(),document.getElementById("route-city").value="Raipur",p=[],x(),document.getElementById("route-modal").classList.add("visible")}async function le(t){try{const e=await c.get(`/admin/routes/${t}`);document.getElementById("route-modal-title").textContent="Edit Route",document.getElementById("route-submit-btn").textContent="Update Route",document.getElementById("route-edit-id").value=t,document.getElementById("route-name").value=e.name,document.getElementById("route-city").value=e.city,document.getElementById("route-distance").value=e.distanceKm||"",p=e.stops.map(n=>({stopId:n.stopId,distanceFromOrigin:n.distanceFromOrigin,arrivalTime:n.arrivalTime||""})),x(),document.getElementById("route-modal").classList.add("visible")}catch(e){r(e.message,"error")}}function q(){document.getElementById("route-modal").classList.remove("visible")}function x(){const t=document.getElementById("route-stops-list");if(!p.length){t.innerHTML='<p style="color: var(--text-muted); font-size: 0.85rem;">No stops added yet</p>';return}t.innerHTML=p.map((e,n)=>{const a=A.find(i=>i.id===e.stopId),s=a?a.name:"Unknown";return`
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; padding:8px 10px; background:var(--bg-input); border-radius:var(--radius-sm);">
        <span style="font-size:0.8rem; color:var(--text-muted); min-width:20px;">${n+1}.</span>
        <span style="flex:1; font-size:0.88rem;">${s}</span>
        <input type="number" value="${e.distanceFromOrigin}" step="0.1" min="0"
          style="width:70px; padding:4px 6px; border:1px solid var(--border-input); border-radius:4px; font-size:0.8rem; text-align:center;"
          data-stop-idx="${n}" data-field="distance" placeholder="km" title="Distance from origin (km)">
        <input type="time" value="${e.arrivalTime||""}"
          style="width:90px; padding:4px 6px; border:1px solid var(--border-input); border-radius:4px; font-size:0.8rem; text-align:center;"
          data-stop-idx="${n}" data-field="time" placeholder="HH:MM" title="Arrival time">
        <button class="btn-icon danger" data-remove-stop="${n}" title="Remove" style="width:24px;height:24px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`}).join(""),t.querySelectorAll('[data-field="distance"]').forEach(e=>{e.addEventListener("change",n=>{p[parseInt(n.target.dataset.stopIdx)].distanceFromOrigin=parseFloat(n.target.value)||0})}),t.querySelectorAll('[data-field="time"]').forEach(e=>{e.addEventListener("change",n=>{p[parseInt(n.target.dataset.stopIdx)].arrivalTime=n.target.value||null})}),t.querySelectorAll("[data-remove-stop]").forEach(e=>{e.addEventListener("click",()=>{p.splice(parseInt(e.dataset.removeStop),1),x()})})}function ce(){const t=p.map(s=>s.stopId),e=A.filter(s=>!t.includes(s.id));if(!e.length){r("All stops are already added to this route","warning");return}const n=document.createElement("select");n.className="form-control",n.style.marginTop="4px",n.innerHTML='<option value="">Select a stop...</option>'+e.map(s=>`<option value="${s.id}">${s.name} (${s.city})</option>`).join(""),document.getElementById("route-stops-list").appendChild(n),n.focus(),n.addEventListener("change",()=>{n.value?(p.push({stopId:n.value,distanceFromOrigin:0,arrivalTime:""}),x()):n.remove()}),n.addEventListener("blur",()=>{setTimeout(()=>{n.value||n.remove()},200)})}async function H(){const t=document.getElementById("route-edit-id").value,e={name:document.getElementById("route-name").value.trim(),city:document.getElementById("route-city").value.trim(),distanceKm:parseFloat(document.getElementById("route-distance").value)||null,stops:p.map(n=>({stopId:n.stopId,distanceFromOrigin:n.distanceFromOrigin,arrivalTime:n.arrivalTime||null}))};if(!e.name){r("Route name is required","error");return}try{t?(await c.put(`/admin/routes/${t}`,e),r("Route updated successfully")):(await c.post("/admin/routes",e),r("Route created successfully")),q(),I()}catch(n){r(n.message,"error")}}async function ue(t,e){if(confirm(`Are you sure you want to delete route "${e}"? Buses on this route will be unassigned.`))try{await c.delete(`/admin/routes/${t}`),r("Route deleted successfully"),I()}catch(n){r(n.message,"error")}}function P(){let t;document.getElementById("route-search").addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>I(),300)}),document.getElementById("btn-new-route").addEventListener("click",de),document.getElementById("btn-add-stop").addEventListener("click",ce),document.getElementById("route-submit-btn").addEventListener("click",H)}const O=Object.freeze(Object.defineProperty({__proto__:null,closeRouteModal:q,initRouteListeners:P,loadAllStops:R,loadRoutes:I,submitRouteForm:H},Symbol.toStringTag,{value:"Module"})),me="modulepreload",pe=function(t){return"/"+t},D={},F=function(e,n,a){let s=Promise.resolve();if(n&&n.length>0){let d=function(m){return Promise.all(m.map(y=>Promise.resolve(y).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=d(n.map(m=>{if(m=pe(m),m in D)return;D[m]=!0;const y=m.endsWith(".css"),f=y?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${f}`))return;const v=document.createElement("link");if(v.rel=y?"stylesheet":me,y||(v.as="script"),v.crossOrigin="",v.href=m,u&&v.setAttribute("nonce",u),document.head.appendChild(v),y)return new Promise((U,z)=>{v.addEventListener("load",U),v.addEventListener("error",()=>z(new Error(`Unable to preload CSS for ${m}`)))})}))}function i(d){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=d,window.dispatchEvent(o),!o.defaultPrevented)throw d}return s.then(d=>{for(const o of d||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};let E=[];async function $(){var t;try{E=await c.get("/admin/stops");const e=((t=document.getElementById("stop-search"))==null?void 0:t.value.trim().toLowerCase())||"";e&&(E=E.filter(n=>n.name.toLowerCase().includes(e)||n.city.toLowerCase().includes(e))),ve()}catch(e){r(e.message,"error")}}function ve(){const t=document.getElementById("stops-tbody");if(!E.length){t.innerHTML=`
      <tr><td colspan="5">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h3>No stops found</h3>
          <p>Create a new stop to get started</p>
        </div>
      </td></tr>`;return}t.innerHTML=E.map(e=>{const n=`${e.lat.toFixed(4)}, ${e.lng.toFixed(4)}`,a=e.amenities&&e.amenities.length>0?e.amenities.join(", "):'<span style="color:var(--text-muted)">None</span>';return`
      <tr>
        <td><strong>${e.name}</strong></td>
        <td>${e.city}</td>
        <td><a href="https://maps.google.com/?q=${e.lat},${e.lng}" target="_blank" style="color:var(--accent-blue); text-decoration:none;">${n}</a></td>
        <td>${a}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon" title="Edit" data-edit-stop="${e.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Delete" data-delete-stop="${e.id}" data-name="${e.name.replace(/"/g,"&quot;")}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`}).join(""),t.querySelectorAll("[data-edit-stop]").forEach(e=>{e.addEventListener("click",()=>ye(e.dataset.editStop))}),t.querySelectorAll("[data-delete-stop]").forEach(e=>{e.addEventListener("click",()=>Ee(e.dataset.deleteStop,e.dataset.name))})}function ge(){document.getElementById("stop-modal-title").textContent="New Stop",document.getElementById("stop-submit-btn").textContent="Create Stop",document.getElementById("stop-edit-id").value="",document.getElementById("stop-form").reset(),document.getElementById("stop-city").value="Raipur",document.getElementById("stop-modal").classList.add("visible")}async function ye(t){try{const e=await c.get(`/admin/stops/${t}`);document.getElementById("stop-modal-title").textContent="Edit Stop",document.getElementById("stop-submit-btn").textContent="Update Stop",document.getElementById("stop-edit-id").value=t,document.getElementById("stop-name").value=e.name,document.getElementById("stop-city").value=e.city,document.getElementById("stop-lat").value=e.lat,document.getElementById("stop-lng").value=e.lng,document.getElementById("stop-amenities").value=e.amenities?e.amenities.join(", "):"",document.getElementById("stop-modal").classList.add("visible")}catch(e){r(e.message,"error")}}function he(){document.getElementById("stop-modal").classList.remove("visible")}async function fe(){const t=document.getElementById("stop-edit-id").value,n=document.getElementById("stop-amenities").value.split(",").map(s=>s.trim()).filter(s=>s),a={name:document.getElementById("stop-name").value.trim(),city:document.getElementById("stop-city").value.trim(),lat:parseFloat(document.getElementById("stop-lat").value)||0,lng:parseFloat(document.getElementById("stop-lng").value)||0,amenities:n};if(!a.name){r("Stop name is required","error");return}if(!a.lat||!a.lng){r("Valid latitude and longitude are required","error");return}try{t?(await c.put(`/admin/stops/${t}`,a),r("Stop updated successfully")):(await c.post("/admin/stops",a),r("Stop created successfully")),he(),$(),F(()=>Promise.resolve().then(()=>O),void 0).then(s=>{s.loadAllStops&&s.loadAllStops()}).catch(()=>{})}catch(s){r(s.message,"error")}}async function Ee(t,e){if(confirm(`Are you sure you want to delete the stop "${e}"? This stop will be removed from any routes that use it.`))try{await c.delete(`/admin/stops/${t}`),r("Stop deleted successfully"),$(),F(()=>Promise.resolve().then(()=>O),void 0).then(n=>{n.loadAllStops&&n.loadAllStops()}).catch(()=>{})}catch(n){r(n.message,"error")}}function be(){var n,a;let t;const e=document.getElementById("stop-search");e&&e.addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>$(),300)}),(n=document.getElementById("btn-new-stop"))==null||n.addEventListener("click",ge),(a=document.getElementById("stop-submit-btn"))==null||a.addEventListener("click",fe)}let M=[];async function k(){try{M=await c.get("/admin/mappings"),j()}catch(t){r(t.message,"error")}}function j(){var a;const t=document.getElementById("mappings-content"),e=((a=document.getElementById("mapping-search"))==null?void 0:a.value.trim().toLowerCase())||"";let n=M;if(e&&(n=M.filter(s=>s.plateNumber.toLowerCase().includes(e)||(s.routeName||"").toLowerCase().includes(e)||(s.driverName||"").toLowerCase().includes(e))),!n.length){t.innerHTML=`
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <h3>No mappings found</h3>
        <p>Assign buses to routes and drivers to get started</p>
      </div>`;return}t.innerHTML=`<div class="mapping-grid">${n.map(s=>`
    <div class="mapping-card">
      <div class="mapping-card-header">
        <div class="mapping-card-title">
          <svg width="20" height="20" viewBox="0 0 24 18" fill="none" stroke="var(--accent-blue)" stroke-width="1.5">
            <rect x="1" y="1" width="22" height="12" rx="2"/>
            <circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/>
          </svg>
          ${s.plateNumber}
        </div>
      </div>
      <div class="mapping-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Route: <strong>${s.routeName||'<span class="unassigned-label">Not assigned</span>'}</strong></span>
      </div>
      <div class="mapping-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Driver: <strong>${s.driverName||'<span class="unassigned-label">Not assigned</span>'}</strong></span>
      </div>
      <div class="mapping-actions">
        ${s.routeId?`<button class="btn-danger btn-sm" data-unassign-route="${s.busId}" data-plate="${s.plateNumber}">Unassign Route</button>`:""}
        ${s.driverId?`<button class="btn-danger btn-sm" data-unassign-driver="${s.busId}" data-plate="${s.plateNumber}">Unassign Driver</button>`:""}
      </div>
    </div>`).join("")}</div>`,t.querySelectorAll("[data-unassign-route]").forEach(s=>{s.addEventListener("click",()=>xe(s.dataset.unassignRoute,s.dataset.plate))}),t.querySelectorAll("[data-unassign-driver]").forEach(s=>{s.addEventListener("click",()=>$e(s.dataset.unassignDriver,s.dataset.plate))})}async function Ie(){try{const[t,e,n]=await Promise.all([c.get("/admin/buses"),c.get("/admin/routes"),c.get("/admin/drivers")]),a=document.getElementById("mapping-bus");a.innerHTML='<option value="">Select a bus...</option>'+t.map(d=>`<option value="${d.busId}">${d.plateNumber}</option>`).join("");const s=document.getElementById("mapping-route");s.innerHTML='<option value="">— No route change —</option>'+e.map(d=>`<option value="${d.routeId}">${d.name}</option>`).join("");const i=document.getElementById("mapping-driver");i.innerHTML='<option value="">— No driver change —</option>'+n.filter(d=>d.status==="active").map(d=>`<option value="${d.driverId}">${d.name} (${d.email})</option>`).join(""),document.getElementById("mapping-modal").classList.add("visible")}catch(t){r(t.message,"error")}}function Be(){document.getElementById("mapping-modal").classList.remove("visible")}async function we(){const t=document.getElementById("mapping-bus").value,e=document.getElementById("mapping-route").value,n=document.getElementById("mapping-driver").value;if(!t){r("Please select a bus","error");return}if(!e){r("Please select a route","error");return}if(!n){r("Please select a driver","error");return}try{const a={busId:t};e&&(a.routeId=e),n&&(a.driverId=n),await c.post("/admin/mappings/assign-all",a),r("Assignment saved successfully"),Be(),k(),g(),h()}catch(a){r(a.message,"error")}}async function xe(t,e){if(confirm(`Unassign route from bus ${e}?`))try{await c.delete(`/admin/mappings/bus-route/${t}`),r("Route unassigned"),k(),g()}catch(n){r(n.message,"error")}}async function $e(t,e){if(confirm(`Unassign driver from bus ${e}?`))try{await c.delete(`/admin/mappings/bus-driver/${t}`),r("Driver unassigned"),k(),h()}catch(n){r(n.message,"error")}}function ke(){let t;document.getElementById("mapping-search").addEventListener("input",()=>{clearTimeout(t),t=setTimeout(()=>j(),300)}),document.getElementById("btn-new-mapping").addEventListener("click",Ie),document.getElementById("mapping-submit-btn").addEventListener("click",we)}document.addEventListener("DOMContentLoaded",()=>{const t=localStorage.getItem("buslink_admin_access_token"),e=localStorage.getItem("buslink_admin_user");if(!t||!e){window.location.href="/";return}let n;try{n=JSON.parse(e)}catch{window.location.href="/";return}if(n.role!=="admin"){localStorage.clear(),window.location.href="/";return}const a=document.getElementById("admin-name"),s=document.getElementById("admin-avatar");a&&(a.textContent=n.name||"Admin"),s&&(s.textContent=(n.name||"A").charAt(0).toUpperCase()),document.getElementById("btn-logout").addEventListener("click",async()=>{try{const o=localStorage.getItem("buslink_admin_refresh_token");await c.post("/auth/logout",{refreshToken:o})}catch{}localStorage.removeItem("buslink_admin_access_token"),localStorage.removeItem("buslink_admin_refresh_token"),localStorage.removeItem("buslink_admin_user"),window.location.href="/"});const i=document.querySelectorAll(".tab-btn"),d=document.querySelectorAll(".tab-panel");i.forEach(o=>{o.addEventListener("click",()=>{const u=o.dataset.tab;switch(i.forEach(m=>m.classList.remove("active")),d.forEach(m=>m.classList.remove("active")),o.classList.add("active"),document.getElementById(`panel-${u}`).classList.add("active"),u){case"buses":g();break;case"drivers":h();break;case"routes":I();break;case"stops":$();break;case"mappings":k();break}})}),Y(),oe(),P(),be(),ke(),document.querySelectorAll("[data-close]").forEach(o=>{o.addEventListener("click",()=>{const u=o.dataset.close;document.getElementById(u).classList.remove("visible")})}),document.querySelectorAll(".modal-overlay").forEach(o=>{o.addEventListener("click",u=>{u.target===o&&o.classList.remove("visible")})}),document.addEventListener("keydown",o=>{o.key==="Escape"&&document.querySelectorAll(".modal-overlay.visible").forEach(u=>{u.classList.remove("visible")})}),R(),g()});
