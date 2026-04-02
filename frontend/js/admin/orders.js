if (!requireAdmin()) { /* redirected */ }

let allOrders = [];
let statusFilter = 'Todos';
let searchQuery = '';

async function loadOrders() {
  try {
    const res = await api.admin.orders();
    allOrders = res.data;
    document.getElementById('total-text').textContent = `${allOrders.length} pedidos no total`;
    renderStatusFilters();
    renderOrders();
  } catch (err) {
    showToast(err.message || 'Erro ao carregar pedidos', 'error');
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function renderStatusFilters() {
  const filters = ['Todos', 'Processando', 'Enviado', 'Entregue'];
  const colors = { Todos: 'var(--color-secondary)', Processando: '#f59e0b', Enviado: '#3b82f6', Entregue: '#22c55e' };
  document.getElementById('status-filters').innerHTML = `<span class="filter-tag-lead">${icon('tag', 16)}</span>` + filters.map(f =>
    `<button class="filter-chip ${f === statusFilter ? 'active' : ''}" style="${f === statusFilter ? 'background:'+colors[f]+';color:#fff' : ''}" onclick="setStatusFilter('${f}')">${f}</button>`
  ).join('');
}

function setStatusFilter(f) { statusFilter = f; renderStatusFilters(); renderOrders(); }

function renderOrders() {
  const filtered = allOrders.filter(o => {
    const matchSearch = String(o.id).includes(searchQuery) || (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const tableCard = document.getElementById('table-card');
  const emptyState = document.getElementById('empty-state');
  const countText = document.getElementById('count-text');

  if (filtered.length === 0) {
    tableCard.style.display = 'none';
    emptyState.style.display = 'flex';
    countText.textContent = '';
    return;
  }

  emptyState.style.display = 'none';
  tableCard.style.display = 'block';

  document.getElementById('orders-body').innerHTML = filtered.map(o => `
    <tr>
      <td class="text-mono">#${o.id}</td>
      <td><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:var(--color-input-bg);display:flex;align-items:center;justify-content:center"><span class="text-xs font-bold text-muted">${(o.customer_name||'?').charAt(0)}</span></div><span class="text-sm font-semibold">${o.customer_name}</span></div></td>
      <td><span class="text-sm text-muted">${o.items.length} ${o.items.length===1?'item':'itens'}</span></td>
      <td><span class="text-sm font-semibold">${formatCurrency(o.total)}</span></td>
      <td><span class="text-sm text-muted">${formatDate(o.created_at)}</span></td>
      <td>${createStatusBadge(o.status, 'sm')}</td>
      <td class="text-right"><a href="/pages/admin/order-detail.html?id=${o.id}" class="btn-danger-outline">Ver detalhes</a></td>
    </tr>
  `).join('');

  countText.textContent = `Exibindo ${filtered.length} de ${allOrders.length} pedidos`;
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderOrders();
});

loadOrders();
