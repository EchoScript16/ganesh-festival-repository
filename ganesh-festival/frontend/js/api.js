// js/api.js - Shared API utilities, auth helpers, and UI functions

const API_BASE = 'http://localhost:5000/api';

// ── Token Helpers ─────────────────────────────────────────────────
const Auth = {
    getToken:  ()        => localStorage.getItem('gf_token'),
    getUser:   ()        => JSON.parse(localStorage.getItem('gf_user') || 'null'),
    setSession:(token, user) => {
        localStorage.setItem('gf_token', token);
        localStorage.setItem('gf_user', JSON.stringify(user));
    },
    clear:     ()        => {
        localStorage.removeItem('gf_token');
        localStorage.removeItem('gf_user');
    },
    isLoggedIn: ()       => !!localStorage.getItem('gf_token'),
    isAdmin:    ()       => Auth.getUser()?.role === 'admin',
    isVolunteer:()       => ['admin','volunteer'].includes(Auth.getUser()?.role),
};

// ── API Fetch Wrapper ─────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const token = Auth.getToken();

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

        return data;

    } catch (err) {
        throw err;
    }
}

// ── Navbar Setup ──────────────────────────────────────────────────
function setupNavbar() {
    const user = Auth.getUser();
    const navGuest    = document.getElementById('nav-guest');
    const navUserInfo = document.getElementById('nav-user-info');
    const navUsername = document.getElementById('nav-username');
    const navRole     = document.getElementById('nav-role');
    const btnLogout   = document.getElementById('btn-logout');
    const navToggle   = document.querySelector('.nav-toggle');
    const navLinks    = document.querySelector('.nav-links');

    if (user && Auth.isLoggedIn()) {
        if (navGuest)    navGuest.style.display    = 'none';
        if (navUserInfo) navUserInfo.style.display  = 'flex';
        if (navUsername) navUsername.textContent    = user.name;
        if (navRole)     navRole.textContent        = user.role;
    } else {
        if (navGuest)    navGuest.style.display    = 'flex';
        if (navUserInfo) navUserInfo.style.display  = 'none';
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Auth.clear();
            window.location.href = '/';
        });
    }

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    }

    // Highlight active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.href === window.location.href) link.classList.add('active');
    });
}

// ── UI Helpers ────────────────────────────────────────────────────
function showAlert(containerId, message, type = 'success') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}"><span>${type === 'success' ? '✅' : '❌'}</span> ${message}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 4000);
}

function showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>';
}

function showEmpty(containerId, message = 'No data found.') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div class="empty-state"><div class="empty-icon">🪔</div><p>${message}</p></div>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function getBadgeHTML(text, type) {
    const cls = type || text.toLowerCase().replace(/\s+/g, '_');
    return `<span class="badge badge-${cls}">${text}</span>`;
}

// Redirect to login if not authenticated
function requireAuth(redirectBack = true) {
    if (!Auth.isLoggedIn()) {
        window.location.href = redirectBack
            ? `/pages/login.html?redirect=${encodeURIComponent(window.location.pathname)}`
            : '/pages/login.html';
        return false;
    }
    return true;
}

// Require admin role
function requireAdmin() {
    if (!requireAuth()) return false;
    if (!Auth.isAdmin()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/';
        return false;
    }
    return true;
}

// Modal helpers
function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}
function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});
