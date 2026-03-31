/**
 * Módulo centralizado de comunicação com a API.
 * Todas as chamadas fetch passam por aqui, incluindo o token JWT.
 */
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('autohub_token');
}

function setToken(token) {
  localStorage.setItem('autohub_token', token);
}

function removeToken() {
  localStorage.removeItem('autohub_token');
}

function getUser() {
  const raw = localStorage.getItem('autohub_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setUser(user) {
  localStorage.setItem('autohub_user', JSON.stringify(user));
}

function removeUser() {
  localStorage.removeItem('autohub_user');
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      removeUser();
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/pages/login.html';
      }
    }
    throw { status: response.status, message: data.message || 'Erro desconhecido', errors: data.errors };
  }

  return data;
}

const api = {
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  parts: {
    findAll: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.category) qs.set('category', params.category);
      const q = qs.toString();
      return request(`/parts${q ? '?' + q : ''}`);
    },
    findById: (id) => request(`/parts/${id}`),
  },
  categories: {
    findAll: () => request('/categories'),
  },
  orders: {
    findAll: () => request('/orders'),
    findById: (id) => request(`/orders/${id}`),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    orders: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.status) qs.set('status', params.status);
      const q = qs.toString();
      return request(`/admin/orders${q ? '?' + q : ''}`);
    },
    orderById: (id) => request(`/admin/orders/${id}`),
    updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    createPart: (formData) => request('/admin/parts', { method: 'POST', body: formData }),
    updatePart: (id, formData) => request(`/admin/parts/${id}`, { method: 'PUT', body: formData }),
    deletePart: (id) => request(`/admin/parts/${id}`, { method: 'DELETE' }),
  },
};
