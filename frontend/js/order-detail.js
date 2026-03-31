if (!requireAuth()) { /* redirected */ }

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

async function loadOrder() {
  if (!orderId) { window.location.href = '/pages/orders.html'; return; }
  try {
    const res = await api.orders.findById(orderId);
    renderOrder(res.data);
  } catch {
    document.getElementById('content').innerHTML = `
      <div class="empty-state">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Pedido não encontrado</h2>
        <p class="text-muted mb-4">O pedido #${orderId} não existe.</p>
        <a href="/pages/orders.html" class="btn btn-secondary">Voltar</a>
      </div>`;
  } finally {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }
}

function renderOrder(order) {
  const content = document.getElementById('content');
  const statusColors = { Processando: '#f59e0b', Enviado: '#3b82f6', Entregue: '#22c55e' };

  const steps = [
    { label: 'Processando', done: true },
    { label: 'Enviado', done: order.status === 'Enviado' || order.status === 'Entregue' },
    { label: 'Entregue', done: order.status === 'Entregue' },
  ];
  const currentIdx = steps.findIndex(s => s.label === order.status);
  const stepIcons = ['&#128344;', '&#128666;', '&#10004;'];

  content.innerHTML = `
    <a href="/pages/orders.html" class="auth-back" style="margin-bottom:24px">&#8592; Meus Pedidos</a>
    <div class="card" style="overflow:hidden;margin-bottom:16px">
      <div style="height:6px;background:${statusColors[order.status]}"></div>
      <div style="padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <p class="text-xs text-muted">Número do Pedido</p>
            <h1 class="font-mono font-bold text-secondary" style="font-size:22px">#${order.id}</h1>
          </div>
          ${createStatusBadge(order.status)}
        </div>
        <p class="text-sm text-muted">Realizado em <span class="font-semibold" style="color:var(--color-text-secondary)">${formatDateLong(order.created_at)}</span></p>
      </div>
    </div>
    <div class="card" style="padding:24px;margin-bottom:16px">
      <h3 class="font-semibold mb-4" style="font-size:15px">Acompanhamento</h3>
      <div class="tracker">
        ${steps.map((step, idx) => {
          const isActive = idx === currentIdx;
          const iconClass = step.done ? (isActive ? `active-${step.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}` : 'done') : 'pending';
          return `
            <div class="tracker-step">
              <div class="tracker-icon ${iconClass}">${stepIcons[idx]}</div>
              <span class="tracker-label ${step.done ? 'done' : 'pending'}">${step.label}</span>
            </div>
            ${idx < steps.length - 1 ? `<div class="tracker-line ${steps[idx+1].done ? 'done' : 'pending'}"></div>` : ''}
          `;
        }).join('')}
      </div>
    </div>
    <div class="grid grid-2 mb-4" style="gap:12px">
      <div class="card p-4"><p class="text-xs text-muted mb-2">Cliente</p><p class="text-sm font-semibold">${order.customer_name}</p></div>
      <div class="card p-4"><p class="text-xs text-muted mb-2">Data do Pedido</p><p class="text-sm font-semibold">${formatDate(order.created_at)}</p></div>
      <div class="card p-4"><p class="text-xs text-muted mb-2">Endereço de Entrega</p><p class="text-sm font-semibold">${order.address}</p></div>
      <div class="card p-4"><p class="text-xs text-muted mb-2">Total de Itens</p><p class="text-sm font-semibold">${order.items.reduce((s,i)=>s+i.quantity,0)} itens</p></div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header"><h3 style="font-size:15px;font-weight:600">Itens do Pedido</h3></div>
      ${order.items.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-bottom:1px solid var(--color-border-light)">
          <div><p class="text-sm font-semibold">${item.part_name}</p><p class="text-xs text-muted">${item.quantity} × ${formatCurrency(item.unit_price)}</p></div>
          <p class="font-semibold" style="font-size:15px">${formatCurrency(item.unit_price * item.quantity)}</p>
        </div>
      `).join('')}
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:var(--color-bg-alt)">
        <span class="font-semibold">Total</span>
        <span class="font-bold text-secondary" style="font-size:18px">${formatCurrency(order.total)}</span>
      </div>
    </div>
  `;
}

loadOrder();
