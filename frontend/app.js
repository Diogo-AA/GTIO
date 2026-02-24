'use strict';

const API_BASE = 'http://localhost:8080';

const state = {
  token: localStorage.getItem('ot_token') || null,
  user: JSON.parse(localStorage.getItem('ot_user') || 'null'),
  currentGala: null,
};

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}/${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const e = await res.json(); msg = e.title || e.message || msg; } catch { }
    throw new Error(msg);
  }
  if (res.status === 201 || res.status === 204) return null;
  return res.json();
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3800);
}

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === page);
  });
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('ot_token', token);
  localStorage.setItem('ot_user', JSON.stringify(user));
  renderNav();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('ot_token');
  localStorage.removeItem('ot_user');
}

window.logout = function () {
  clearSession();
  renderNav();
  navigate('login');
  showToast('Sesion cerrada correctamente', 'info');
};

async function handleLogin(username, password) {
  try {
    const data = await apiFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const token = data.accessToken;
    const claims = parseJwt(token);
    const userId = claims?.sub ? parseInt(claims.sub, 10) : null;
    const userName = claims?.name || username;

    setSession(token, { id: userId, username: userName });
    renderNav();
    navigate('galas');
    loadGalas();
    showToast(`Bienvenido, ${state.user.username}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(username, password) {
  try {
    await apiFetch('auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    showToast('Cuenta creada. Ahora inicia sesion.', 'success');
    switchLoginTab('login');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.demoLogin = function () {
  setSession('demo-token', { id: 1, username: 'UsuarioDemo' });
  navigate('galas');
  loadGalas();
  showToast('Modo demo activado', 'info');
};

function renderNav() {
  const navActions = document.getElementById('nav-actions');
  const navLinks = document.getElementById('nav-links');

  if (state.user) {
    const initials = state.user.username.slice(0, 2).toUpperCase();
    navActions.innerHTML = `
      <div class="user-chip">
        <div class="av">${initials}</div>
        <span>${state.user.username}</span>
      </div>
      <span class="estado-chip">Estado: Conectado</span>
      <button class="btn btn-ghost btn-sm" onclick="logout()">Salir</button>
    `;
    navLinks.style.display = 'flex';
  } else {
    navActions.innerHTML = `
      <span class="estado-chip offline">Estado: Desconectado</span>
      <button class="btn btn-primary btn-sm" onclick="navigate('login')">Iniciar Sesion</button>
    `;
    navLinks.style.display = 'none';
  }
}

function switchLoginTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
}
window.switchLoginTab = switchLoginTab;

async function loadGalas() {
  const container = document.getElementById('galas-list');
  container.innerHTML = loadingHTML('Cargando galas...');
  try {
    const data = await apiFetch('galas');
    const galas = data.galas ?? data;
    if (!galas.length) {
      container.innerHTML = emptyStateHTML('Sin galas', 'Todavia no hay galas disponibles.');
      return;
    }
    container.innerHTML = '';
    galas.forEach(g => container.appendChild(buildGalaCard(g)));
    const rows = container.querySelectorAll('.gala-row:last-child');
    rows.forEach(r => r.style.borderBottom = 'none');
  } catch (err) {
    container.innerHTML = errorStateHTML(err.message);
    showToast('No se pudieron cargar las galas', 'error');
  }
}

function buildGalaCard(gala) {
  const card = document.createElement('div');
  card.className = 'card gala-card';
  card.setAttribute('onclick', `openGala(${gala.id})`);
  const fecha = gala.fecha ? new Date(gala.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  const totalVotos = (gala.candidatos || []).reduce((s, c) => s + (c.numVotos || 0), 0);
  card.innerHTML = `
    <div class="gala-name">${gala.nombre}</div>
    <div class="gala-meta">
      <span>${fecha}</span>
      <span class="badge badge-dim">${(gala.candidatos || []).length} candidatos</span>
    </div>
    <div class="gala-footer">
      <span class="badge badge-violet">${totalVotos} votos</span>
      <span style="color:var(--text-muted);font-size:.82rem">Ver detalle</span>
    </div>
  `;
  return card;
}

window.openGala = async function (id) {
  navigate('votar');
  await loadGalaDetalle(id);
};

async function loadGalaDetalle(id) {
  const container = document.getElementById('votar-content');
  container.innerHTML = loadingHTML('Cargando gala...');
  try {
    const gala = await apiFetch(`galas/${id}`);
    state.currentGala = gala;
    renderGalaDetalle(gala);
  } catch (err) {
    container.innerHTML = errorStateHTML(err.message);
    showToast('No se pudo cargar la gala', 'error');
  }
}

function renderGalaDetalle(gala) {
  const container = document.getElementById('votar-content');
  const fecha = gala.fecha
    ? new Date(gala.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const totalVotos = (gala.candidatos || []).reduce((s, c) => s + (c.numVotos || 0), 0);

  container.innerHTML = `
    <div class="flex-between" style="margin-bottom:.75rem;">
      <div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('galas');loadGalas()" style="margin-bottom:.5rem;">Galas</button>
        <div class="section-title" style="margin-bottom:.15rem;">${gala.nombre}</div>
        <div style="font-size:.8rem;color:#6b7280;">${fecha} - ${(gala.candidatos || []).length} candidatos - ${totalVotos} votos totales</div>
      </div>
    </div>

    <div class="box" style="padding:.5rem 1rem;margin-bottom:1rem;">
      <div id="candidatos-list"></div>
    </div>

    <hr class="divider" />
    <div class="section-title" style="font-size:.95rem;">Resultados</div>
    <div class="box" id="resultados-bars" style="margin-top:.5rem;"></div>
  `;

  renderCandidatos(gala.candidatos || [], totalVotos);
  renderResultados(gala.candidatos || [], totalVotos);
}

function renderCandidatos(candidatos, totalVotos) {
  const list = document.getElementById('candidatos-list');
  if (!list) return;
  list.innerHTML = '';
  candidatos.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'candidato-row';
    row.id = `candidato-row-${c.id}`;
    const pct = totalVotos > 0 ? Math.round((c.numVotos / totalVotos) * 100) : 0;
    row.innerHTML = `
      <div class="candidato-foto">Foto</div>
      <div class="candidato-nombre">${c.nombre}</div>
      <div style="flex:1; min-width:80px;">
        <div class="candidato-votos-label">${c.numVotos} votos - ${pct}%</div>
        <div class="progress-bg"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-votar-${c.id}" onclick="submitVotoDirecto(${c.id})">Votar</button>
    `;
    if (idx === candidatos.length - 1) row.style.borderBottom = 'none';
    list.appendChild(row);
  });
}

function renderResultados(candidatos, totalVotos) {
  const container = document.getElementById('resultados-bars');
  if (!container) return;
  if (!candidatos.length) { container.innerHTML = '<p class="empty-state">Sin candidatos</p>'; return; }

  const sorted = [...candidatos].sort((a, b) => b.numVotos - a.numVotos);
  container.innerHTML = sorted.map(c => {
    const pct = totalVotos > 0 ? Math.round((c.numVotos / totalVotos) * 100) : 0;
    return `
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem;">
        <div style="width:130px;font-size:.85rem;font-weight:600;flex-shrink:0;">${c.nombre}</div>
        <div style="flex:1;">
          <div class="progress-bg" style="max-width:100%;">
            <div class="progress-fill" style="width:${pct}%;"></div>
          </div>
        </div>
        <div style="width:80px;font-size:.8rem;color:#6b7280;text-align:right;">${c.numVotos} (${pct}%)</div>
      </div>
    `;
  }).join('');
}

window.submitVotoDirecto = async function (candidatoId) {
  if (!state.user) { navigate('login'); return; }
  if (!state.currentGala) return;

  const btn = document.getElementById(`btn-votar-${candidatoId}`);
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  try {
    await apiFetch('votos', {
      method: 'POST',
      body: JSON.stringify({
        idUsuario: state.user.id,
        idCandidato: candidatoId,
        idGala: state.currentGala.id,
      }),
    });
    showToast('Voto registrado', 'success');
    await loadGalaDetalle(state.currentGala.id);
  } catch (err) {
    showToast(err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Votar'; }
  }
};

async function loadUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:1.5rem;">${loadingHTML('Cargando usuarios...')}</td></tr>`;
  try {
    const data = await apiFetch('usuarios');
    const lista = data.usuarios ?? data;
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;color:#6b7280;">Sin usuarios</td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map(u => `
      <tr>
        <td><strong>${u.id}</strong></td>
        <td>${u.username}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="openUsuario(${u.id})">Ver historial</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:#dc2626;padding:1rem;">${err.message}</td></tr>`;
    showToast('No se pudieron cargar los usuarios', 'error');
  }
}

window.openUsuario = function (id) {
  document.getElementById('modal-usuario').classList.add('open');
  loadUsuarioDetalle(id);
};

window.closeUsuarioModal = function () {
  document.getElementById('modal-usuario').classList.remove('open');
};

async function loadUsuarioDetalle(id) {
  const content = document.getElementById('modal-usuario-content');
  content.innerHTML = loadingHTML('Cargando detalle...');
  try {
    const u = await apiFetch(`usuarios/${id}`);
    const votos = u.votos || [];
    content.innerHTML = `
      <h3 style="margin-bottom:.25rem;">${u.username}</h3>
      <p style="color:#6b7280;font-size:.85rem;margin-bottom:1rem;">ID: ${u.id} - ${votos.length} votos emitidos</p>
      ${votos.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Gala</th><th>Candidato</th><th>Fecha</th></tr></thead>
            <tbody>
              ${votos.map(v => `
                <tr>
                  <td>${v.gala?.nombre || v.gala?.id || ''}</td>
                  <td>${v.candidato?.nombre || v.candidato?.id || ''}</td>
                  <td>${v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p style="color:#6b7280">Este usuario aun no ha votado.</p>'}
    `;
  } catch (err) {
    content.innerHTML = `<p style="color:#dc2626">${err.message}</p>`;
  }
}

async function loadMiPerfil() {
  if (!state.user) return;
  const content = document.getElementById('perfil-content');
  content.innerHTML = loadingHTML('Cargando tu perfil...');
  try {
    const u = await apiFetch(`usuarios/${state.user.id}`);
    const votos = u.votos || [];
    document.getElementById('perfil-username').textContent = u.username;
    document.getElementById('perfil-votos-count').textContent = votos.length;
    content.innerHTML = votos.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Gala</th><th>Candidato</th><th>Fecha del voto</th></tr></thead>
          <tbody>
            ${votos.map(v => `
              <tr>
                <td>${v.gala?.nombre || ''}</td>
                <td>${v.candidato?.nombre || ''}</td>
                <td>${v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '<div class="empty-state"><h3>Sin votos todavia</h3><p>Aun no has votado en ninguna gala.</p></div>';
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function loadingHTML(msg) {
  return `<div class="loading-state"><div class="spinner"></div><p>${msg || 'Cargando...'}</p></div>`;
}

function emptyStateHTML(title, msg) {
  return `<div class="empty-state"><h3>${title}</h3><p>${msg}</p></div>`;
}

function errorStateHTML(msg) {
  return `<div class="empty-state"><h3>Error</h3><p style="color:var(--danger)">${msg}</p></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();

  if (state.user && state.token) {
    navigate('galas');
    loadGalas();
  } else {
    navigate('login');
  }

  document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    await handleLogin(username, password);
  });

  document.getElementById('form-register').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    if (password !== document.getElementById('reg-password2').value) {
      showToast('Las contrasenas no coinciden', 'error');
      return;
    }
    await handleRegister(username, password);
  });

  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.dataset.nav;
      navigate(page);
      if (page === 'galas') loadGalas();
      if (page === 'usuarios') loadUsuarios();
      if (page === 'perfil') loadMiPerfil();
    });
  });
});

window.navigate = navigate;
window.loadGalas = loadGalas;
window.loadUsuarios = loadUsuarios;
window.loadMiPerfil = loadMiPerfil;
window.switchLoginTab = switchLoginTab;
