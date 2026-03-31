if (!requireAdmin()) { /* redirected */ }

async function loadDashboard() {
  try {
    const res = await api.admin.dashboard();
    renderDashboard(res.data);
  } catch (err) {
    showToast(err.message || 'Erro ao carregar dashboard', 'error');
  } finally {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }
}

function renderDashboard(data) {
  const content = document.getElementById('content');
  const totalOrders = data.totalOrders;
  const now = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    { title: 'Total de Pedidos', value: totalOrders, bg: '#FEF2F3', color: '#E63946', icon: '' },
    { title: 'Processando', value: data.processingOrders, bg: '#fffbeb', color: '#f59e0b', icon: '' },
    { title: 'Enviados', value: data.shippedOrders, bg: '#eff6ff', color: '#3b82f6', icon: '' },
    { title: 'Entregues', value: data.deliveredOrders, bg: '#f0fdf4', color: '#22c55e', icon: '' },
  ];

  const bars = [
    { label: 'Processando', count: data.processingOrders, color: '#f59e0b' },
    { label: 'Enviado', count: data.shippedOrders, color: '#3b82f6' },
    { label: 'Entregue', count: data.deliveredOrders, color: '#22c55e' },
  ];

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Visão geral dos pedidos — ${now}</p>
    </div>
    <div class="grid grid-4 mb-6">
      ${stats.map(s => `
        <div class="stat-card">
          <p class="stat-card-label">${s.title}</p>
          <p class="stat-card-value">${s.value}</p>
        </div>
      `).join('')}
    </div>
    <div class="grid" style="grid-template-columns:1fr 2fr;gap:16px;margin-bottom:24px">
      <div class="revenue-card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="color:rgba(255,255,255,0.8);font-size:14px">Receita Total</span>
        </div>
        <p style="font-size:30px;font-weight:700;margin-bottom:4px">${formatCurrency(data.totalRevenue)}</p>
        <p style="color:rgba(255,255,255,0.6);font-size:12px">Valor acumulado de todos os pedidos</p>
      </div>
      <div class="card p-6">
        <h3 class="font-semibold mb-4" style="font-size:15px">Distribuição por Status</h3>
        ${bars.map(b => `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span class="text-sm font-semibold">${b.label}</span>
              <span class="text-sm">${b.count} <span class="text-muted">/ ${totalOrders}</span></span>
            </div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${totalOrders?((b.count/totalOrders)*100):0}%;background:${b.color}"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <h3 style="font-size:15px;font-weight:600">Pedidos Recentes</h3>
        <a href="/pages/admin/orders.html" class="text-sm font-semibold text-primary">Ver todos</a>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${data.recentOrders.map(o => `
              <tr>
                <td class="text-mono">#${o.id}</td>
                <td><span class="text-sm font-semibold">${o.customer_name}</span></td>
                <td><span class="text-sm text-muted">${formatDate(o.created_at)}</span></td>
                <td><span class="text-sm font-semibold">${formatCurrency(o.total)}</span></td>
                <td>${createStatusBadge(o.status, 'sm')}</td>
                <td class="text-right"><a href="/pages/admin/order-detail.html?id=${o.id}" class="text-xs font-semibold text-primary">Ver</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

loadDashboard();
