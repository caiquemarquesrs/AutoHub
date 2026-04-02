/**
 * Utilitários globais de autenticação e componentes de UI compartilhados.
 */

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function createStatusBadge(status, size = 'md') {
  const slug = status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sizeClass = size === 'sm' ? 'status-badge-sm' : '';
  return `<span class="status-badge status-${slug} ${sizeClass}"><span class="status-badge-dot"></span>${status}</span>`;
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function buildNavbar() {
  const user = getUser();
  const pathname = window.location.pathname;
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let navItems = '';
  let actions = '';

  if (user && user.role === 'admin') {
    const links = [
      { href: '/pages/admin/dashboard.html', label: 'Dashboard', icon: 'layoutDashboard' },
      { href: '/pages/admin/orders.html', label: 'Pedidos', icon: 'package' },
      { href: '/pages/admin/parts-list.html', label: 'Peças', icon: 'wrench' },
    ];
    navItems = links.map(l => {
      const active = pathname.includes(l.href.split('/').pop().replace('.html', '')) ? 'active' : '';
      return `<a href="${l.href}" class="${active}"><span class="navbar-nav-icon">${icon(l.icon, 16)}</span>${l.label}</a>`;
    }).join('');
    actions = `
      <div class="navbar-admin-badge"><span class="navbar-admin-badge-icon">${icon('shieldCheck', 14)}</span>Admin</div>
      <div class="navbar-user-pill">
        <div class="navbar-user-avatar" style="background:var(--color-primary)">${user.name.charAt(0).toUpperCase()}</div>
        <span class="navbar-user-name">${user.name}</span>
      </div>
      <button type="button" class="navbar-logout" onclick="handleLogout()"><span class="navbar-logout-icon">${icon('logOut', 16)}</span><span class="navbar-logout-text">Sair</span></button>
    `;
  } else if (user && user.role === 'user') {
    const links = [
      { href: '/', label: 'Catálogo', exact: true, icon: 'layoutGrid' },
      { href: '/pages/orders.html', label: 'Meus Pedidos', exact: false, icon: 'package' },
    ];
    navItems = links.map(l => {
      const active = l.exact ? pathname === '/' || pathname === '/index.html' : pathname.includes(l.href.split('/').pop().replace('.html', ''));
      return `<a href="${l.href}" class="${active ? 'active' : ''}"><span class="navbar-nav-icon">${icon(l.icon, 16)}</span>${l.label}</a>`;
    }).join('');

    const cartCount = getCartCount();
    actions = `
      <a href="/pages/cart.html" class="navbar-cart" aria-label="Carrinho">
        ${icon('shoppingCart', 20)}
        ${cartCount > 0 ? `<span class="navbar-cart-badge">${cartCount > 9 ? '9+' : cartCount}</span>` : ''}
      </a>
      <div class="navbar-user-pill">
        <div class="navbar-user-avatar" style="background:var(--color-secondary)">${user.name.charAt(0).toUpperCase()}</div>
        <span class="navbar-user-name">${user.name}</span>
      </div>
      <button type="button" class="navbar-logout" onclick="handleLogout()"><span class="navbar-logout-icon">${icon('logOut', 16)}</span><span class="navbar-logout-text">Sair</span></button>
    `;
  } else {
    navItems = `<a href="/" class="${pathname === '/' || pathname === '/index.html' ? 'active' : ''}"><span class="navbar-nav-icon">${icon('layoutGrid', 16)}</span>Catálogo</a>`;
    actions = `
      <a href="/pages/login.html" class="btn-login-nav">Entrar</a>
      <a href="/pages/register.html" class="btn-register-nav">Criar conta</a>
    `;
  }

  const role = user?.role || 'guest';
  const mobileCart =
    user && user.role === 'user'
      ? `<a href="/pages/cart.html" class="navbar-mobile-cart">${icon('shoppingCart', 20)}<span>Carrinho</span>${getCartCount() > 0 ? `<span class="navbar-mobile-cart-badge">${getCartCount() > 9 ? '9+' : getCartCount()}</span>` : ''}</a>`
      : '';

  nav.innerHTML = `
    <div class="navbar-inner" data-user-role="${role}">
      <a href="${user?.role === 'admin' ? '/pages/admin/dashboard.html' : '/'}" class="navbar-logo">
        <div class="navbar-logo-icon">AH</div>
        <span class="navbar-logo-text">AutoHub</span>
      </a>
      <div class="navbar-divider"></div>
      <nav class="navbar-nav">${navItems}</nav>
      <div class="navbar-actions">${actions}</div>
      <button class="navbar-mobile-toggle" onclick="toggleMobileMenu()">Menu</button>
    </div>
    <div id="mobile-menu" class="navbar-mobile-menu hidden">
      ${navItems}
      ${mobileCart}
      ${user ? `<hr style="border:none;border-top:1px solid var(--color-border-light);margin:8px 0">
        <button type="button" class="navbar-mobile-logout" onclick="handleLogout()">${icon('logOut', 18)} Sair</button>` :
        `<a href="/pages/login.html" class="btn btn-outline btn-full mt-2">Entrar</a>
         <a href="/pages/register.html" class="btn btn-primary btn-full mt-2">Criar conta</a>`}
    </div>
  `;
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

function handleLogout() {
  removeToken();
  removeUser();
  clearCart();
  window.location.href = '/';
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('autohub_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('autohub_cart', JSON.stringify(cart));
}

function addToCart(part) {
  const cart = getCart();
  const existing = cart.find(i => i.part_id === part.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ part_id: part.id, name: part.name, price: part.price, image: part.image_url, category: part.category_name, quantity: 1 });
  }
  saveCart(cart);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function clearCart() {
  localStorage.removeItem('autohub_cart');
}

document.addEventListener('DOMContentLoaded', () => {
  buildNavbar();
});
