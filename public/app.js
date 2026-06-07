// ========================================================================
// Library System – App Logic
// ========================================================================
const API_BASE = window.location.origin;

// ── State ──────────────────────────────────────────────
let token       = localStorage.getItem('token') || null;
let currentUser = null;
let allBooks    = [];

// ── Helpers ────────────────────────────────────────────
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function parseJwt(t) {
  try {
    return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
  } catch { return null; }
}

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof body === 'object' ? (body.message || JSON.stringify(body)) : body;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return body;
}

let toastTimer;
function toast(msg, type = 'info') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Auth Gate ───────────────────────────────────────────
function showApp()   { $('#login-page').classList.add('hidden');    $('#app').classList.remove('hidden'); }
function showLogin() { $('#login-page').classList.remove('hidden'); $('#app').classList.add('hidden'); }

function applyRoleUI() {
  const isAdmin = currentUser?.role === 'ADMIN';
  const badge = $('#role-badge');
  badge.textContent = isAdmin ? 'ADMIN' : 'USER';
  badge.className   = `role-badge ${isAdmin ? 'admin' : 'user'}`;
  $('#nav-username').textContent = currentUser?.name || currentUser?.username || currentUser?.email || 'user';
  $$('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));
}

// ── Login ───────────────────────────────────────────────
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name     = $('#login-username').value.trim();
  const password = $('#login-password').value;
  const errEl    = $('#login-error');
  const btn      = $('#signin-btn');
  const label    = $('#signin-label');
  const spinner  = $('#signin-spinner');

  errEl.classList.add('hidden');
  btn.disabled = true;
  label.textContent = 'Signing in…';
  spinner.classList.remove('hidden');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });

    token = typeof data === 'string' ? data : (data.access_token || data.token);
    localStorage.setItem('token', token);

    const payload = parseJwt(token);
    currentUser = {
      userId: payload?.sub,
      role:   payload?.role || 'USER',
      name:   name,
    };

    try {
      const profile = await apiFetch(`/users/${payload.sub}/profile`);
      currentUser = { ...currentUser, ...profile };
    } catch { /* use token data */ }

    applyRoleUI();
    showApp();
    loadBooks();
    switchView('catalog');
  } catch (err) {
    errEl.textContent = err.message || 'Invalid credentials';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    label.textContent = 'Sign In';
    spinner.classList.add('hidden');
  }
});

// ── Page Switching (login ↔ register) ──────────────────
function showRegister() {
  $('#login-page').classList.add('hidden');
  $('#register-page').classList.remove('hidden');
  $('#register-error').classList.add('hidden');
  $('#register-success').classList.add('hidden');
  $('#register-form').reset();
}

function showLoginPage() {
  $('#register-page').classList.add('hidden');
  $('#login-page').classList.remove('hidden');
  $('#login-error').classList.add('hidden');
}

$('#go-register').addEventListener('click', showRegister);
$('#go-login').addEventListener('click', showLoginPage);

// ── Register ────────────────────────────────────────────
$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('#reg-username').value.trim();
  const email    = $('#reg-email').value.trim();
  const password = $('#reg-password').value;
  const errEl    = $('#register-error');
  const sucEl    = $('#register-success');
  const btn      = $('#register-btn');
  const label    = $('#register-label');
  const spinner  = $('#register-spinner');

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');
  btn.disabled = true;
  label.textContent = 'Creating account…';
  spinner.classList.remove('hidden');

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    sucEl.textContent = 'Account created! Redirecting to login…';
    sucEl.classList.remove('hidden');
    $('#register-form').reset();
    setTimeout(() => showLoginPage(), 1500);
  } catch (err) {
    errEl.textContent = err.message || 'Registration failed';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    label.textContent = 'Create Account';
    spinner.classList.add('hidden');
  }
});

// ── Logout ──────────────────────────────────────────────
$('#logout-btn').addEventListener('click', () => {
  token = null; currentUser = null; allBooks = [];
  localStorage.removeItem('token');
  showLogin();
  $('#login-form').reset();
  $('#login-error').classList.add('hidden');
});

// ── Tab Navigation ──────────────────────────────────────
function switchView(name) {
  $$('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== `view-${name}`));
  if (name === 'users') loadUsers();
}
$$('.nav-tab').forEach(tab => tab.addEventListener('click', () => switchView(tab.dataset.view)));

// ── Books – Load ────────────────────────────────────────
async function loadBooks() {
  try {
    allBooks = await apiFetch('/books');
    renderBooks(allBooks);
  } catch {
    $('#book-grid').innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Failed to load catalog.</div>`;
  }
}

// ── Books – Render ──────────────────────────────────────
function getBookState(b) {
  if ((b.availableCopies ?? b.totalCopies) <= 0) return 'out-of-stock';
  if (b.userBorrowing) return 'borrowed';
  return 'available';
}

function renderBooks(books) {
  const isAdmin    = currentUser?.role === 'ADMIN';
  const isLoggedIn = !!token;

  if (!books.length) {
    $('#book-grid').innerHTML = `<div class="empty-state"><i class="fa-solid fa-book-open"></i>No books found.</div>`;
    return;
  }

  const statusLabel = { available: 'Available', borrowed: 'Borrowed', 'out-of-stock': 'Out of Stock' };

  $('#book-grid').innerHTML = books.map(b => {
    const state = getBookState(b);

    // Button logic: borrowed → show Return, available → show Borrow, out-of-stock → show disabled Borrow
    let actionBtn = '';
    if (isLoggedIn) {
      if (state === 'borrowed') {
        actionBtn = `<button class="btn-return" data-id="${b.id}">Return</button>`;
      } else {
        actionBtn = `<button class="btn-borrow" data-id="${b.id}" ${state === 'out-of-stock' ? 'disabled' : ''}>Borrow</button>`;
      }
    }

    return `
      <div class="book-card ${state}">
        <div class="book-title-text">${escHtml(b.title)}</div>
        <div class="book-author-text">by ${escHtml(b.author)}</div>
        <div class="book-status ${state}">
          <span class="status-dot"></span>${statusLabel[state]}
        </div>
        <div class="book-actions">
          ${actionBtn}
          ${isAdmin ? `
            <button class="btn-edit-book" data-id="${b.id}">Edit</button>
            <button class="btn-delete-book" data-id="${b.id}">Delete</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  attachBookListeners();
}

function attachBookListeners() {
  $$('.btn-borrow').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await apiFetch(`/books/${btn.dataset.id}/borrow`, { method: 'POST' });
      toast('Book borrowed!', 'success');
      loadBooks();
    } catch (err) { toast(err.message, 'error'); }
  }));

  $$('.btn-return').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await apiFetch(`/books/${btn.dataset.id}/return`, { method: 'POST' });
      toast('Book returned!', 'success');
      loadBooks();
    } catch (err) { toast(err.message, 'error'); }
  }));

  $$('.btn-edit-book').forEach(btn => btn.addEventListener('click', () => {
    const book = allBooks.find(b => b.id === +btn.dataset.id);
    if (!book) return;
    $('#edit-book-id').value = book.id;
    $('#edit-title').value   = book.title;
    $('#edit-author').value  = book.author;
    $('#edit-copies').value  = book.totalCopies;
    $('#edit-modal').classList.remove('hidden');
  }));

  $$('.btn-delete-book').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this book?')) return;
    try {
      await apiFetch(`/books/${btn.dataset.id}`, { method: 'DELETE' });
      toast('Book deleted', 'success');
      loadBooks();
    } catch (err) { toast(err.message, 'error'); }
  }));
}

// ── Add Book ────────────────────────────────────────────
$('#add-book-btn').addEventListener('click', async () => {
  const title       = $('#add-title').value.trim();
  const author      = $('#add-author').value.trim();
  const totalCopies = parseInt($('#add-copies').value, 10) || 1;
  if (!title || !author) return toast('Title and author required', 'error');
  try {
    await apiFetch('/books', { method: 'POST', body: JSON.stringify({ title, author, totalCopies }) });
    $('#add-title').value = '';
    $('#add-author').value = '';
    $('#add-copies').value = 1;
    toast('Book added!', 'success');
    loadBooks();
  } catch (err) { toast(err.message, 'error'); }
});

// ── Edit Modal ──────────────────────────────────────────
$('#edit-cancel').addEventListener('click', () => $('#edit-modal').classList.add('hidden'));
$('#edit-modal').addEventListener('click', (e) => {
  if (e.target === $('#edit-modal')) $('#edit-modal').classList.add('hidden');
});
$('#edit-save').addEventListener('click', async () => {
  const id          = $('#edit-book-id').value;
  const title       = $('#edit-title').value.trim();
  const author      = $('#edit-author').value.trim();
  const totalCopies = parseInt($('#edit-copies').value, 10);
  try {
    await apiFetch(`/books/${id}`, { method: 'PATCH', body: JSON.stringify({ title, author, totalCopies }) });
    $('#edit-modal').classList.add('hidden');
    toast('Book updated!', 'success');
    loadBooks();
  } catch (err) { toast(err.message, 'error'); }
});

// ── Search ──────────────────────────────────────────────
function handleSearch() {
  const t = $('#search-title').value.trim().toLowerCase();
  const a = $('#search-author').value.trim().toLowerCase();
  const hasQuery = t || a;
  $('#clear-search').classList.toggle('hidden', !hasQuery);
  if (!hasQuery) { renderBooks(allBooks); return; }
  renderBooks(allBooks.filter(b =>
    (!t || b.title.toLowerCase().includes(t)) &&
    (!a || b.author.toLowerCase().includes(a))
  ));
}
$('#search-title').addEventListener('input', handleSearch);
$('#search-author').addEventListener('input', handleSearch);
$('#clear-search').addEventListener('click', () => {
  $('#search-title').value = '';
  $('#search-author').value = '';
  handleSearch();
});

// ── Users (admin) ───────────────────────────────────────
async function loadUsers() {
  try {
    const users = await apiFetch('/users');
    const tbody = $('#users-tbody');
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted);text-align:center;padding:20px">No users found.</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escHtml(u.name || u.username || u.email)}</td>
        <td><span class="role-pill ${u.role?.toLowerCase()}">${u.role}</span></td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
        <td>${u.role !== 'ADMIN' ? `<button class="btn-remove-user" data-id="${u.id}">Remove</button>` : '—'}</td>
      </tr>
    `).join('');

    $$('.btn-remove-user').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Remove this user?')) return;
      try {
        await apiFetch(`/users/${btn.dataset.id}`, { method: 'DELETE' });
        toast('User removed', 'success');
        loadUsers();
      } catch (err) { toast(err.message, 'error'); }
    }));
  } catch {
    $('#users-tbody').innerHTML = `<tr><td colspan="5" style="color:var(--text-muted)">Failed to load users.</td></tr>`;
  }
}

$('#add-user-btn').addEventListener('click', async () => {
  const name     = $('#new-username').value.trim();
  const password = $('#new-password').value;
  const role     = $('#new-role').value;
  if (!name || !password) return toast('Name and password required', 'error');
  try {
    await apiFetch('/users', { method: 'POST', body: JSON.stringify({ name, password, role }) });
    $('#new-username').value = '';
    $('#new-password').value = '';
    toast('User added!', 'success');
    loadUsers();
  } catch (err) { toast(err.message, 'error'); }
});

// ── Init ────────────────────────────────────────────────
(async function init() {
  if (!token) { showLogin(); return; }

  const payload = parseJwt(token);
  if (!payload) { showLogin(); return; }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    localStorage.removeItem('token'); showLogin(); return;
  }

  currentUser = {
    userId: payload.sub,
    role:   payload.role || 'USER',
    name:   payload.name || payload.username || payload.email || 'user',
  };

  try {
    const profile = await apiFetch(`/users/${payload.sub}/profile`);
    currentUser = { ...currentUser, ...profile };
  } catch { /* use token payload */ }

  applyRoleUI();
  showApp();
  loadBooks();
})();