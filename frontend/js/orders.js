if (!requireAuth()) { /* redirected */ }

async function loadOrders() {
  try {
    const res = await api.orders.findAll();
    renderOrders(res.data);
  } catch (err) {
    showToast(err.message || 'Erro ao carregar pedidos', 'error');
  } finally {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }
}

function renderOrders(orders) {
  const user = getUser();
  const content = document.getElementById('content');

  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'Entregue').length;
  const active = orders.filter(o => o.status !== 'Entregue').length;

  const statusIcons = { Processando: '&#128344;', Enviado: '&#128666;', Entregue: '&#10004;' };
  const statusColors = { Processando: '#f59e0b', Enviado: '#3b82f6', Entregue: '#22c55e' };

  content.innerHTML = `
    <div class="page-header">
      <p class="text-sm text-muted">Bem-vindo de volta,</p>
      <h1 class="page-title">${user.name}</h1>
      <p class="page-subtitle">Acompanhe todos os seus pedidos aqui.</p>
    </div>
    <div class="grid grid-3 mb-6">
      <div class="stat-card"><div class="stat-card-icon" style="background:var(--color-secondary-light);color:var(--color-secondary);font-size:18px">&#128722;</div><p class="stat-card-value">${total}</p><p class="stat-card-label">Total de Pedidos</p></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:#fffbeb;color:#f59e0b;font-size:18px">&#128344;</div><p class="stat-card-value">${active}</p><p class="stat-card-label">Em Andamento</p></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:#f0fdf4;color:#22c55e;font-size:18px">&#10004;</div><p class="stat-card-value">${delivered}</p><p class="stat-card-label">Entregues</p></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="font-size:17px;font-weight:600">Meus Pedidos</h2>
      <span class="text-xs text-muted">${total} pedidos</span>
    </div>
    ${orders.length === 0 ? `<div class="card empty-state"><div class="empty-state-icon" style="font-size:32px">&#128230;</div><h3 class="empty-state-title">Nenhum pedido ainda</h3><p class="empty-state-text">Seus pedidos aparecerão aqui.</p></div>` :
    orders.map(order => `
      <a href="/pages/order-detail.html?id=${order.id}" class="card" style="display:block;margin-bottom:12px;overflow:hidden;transition:all 0.2s">
        <div style="height:4px;background:${statusColors[order.status]}"></div>
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--color-input-bg);display:flex;align-items:center;justify-content:center;font-size:16px">${statusIcons[order.status]}</div>
              <div>
                <p class="font-mono font-semibold text-secondary" style="font-size:14px">#${order.id}</p>
                <p class="text-xs text-muted">${order.items.length} ${order.items.length===1?'item':'itens'}</p>
              </div>
            </div>
            ${createStatusBadge(order.status, 'sm')}
          </div>
          <div style="background:var(--color-bg-alt);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:16px">
            ${order.items.map(i => `<div style="display:flex;justify-content:space-between;padding:2px 0"><span class="text-sm truncate">${i.part_name}</span><span class="text-xs text-muted">x${i.quantity}</span></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="text-xs text-muted">&#128197; ${formatDate(order.created_at)}</span>
            <span class="font-bold" style="font-size:15px">${formatCurrency(order.total)}</span>
          </div>
        </div>
      </a>
    `).join('')}
  `;
}

loadOrders();
