if (!requireAdmin()) { /* redirected */ }

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');
let currentOrder = null;

async function loadOrder() {
  if (!orderId) { window.location.href = '/pages/admin/orders.html'; return; }
  try {
    const res = await api.admin.orderById(orderId);
    currentOrder = res.data;
    renderOrder();
  } catch {
    document.getElementById('content').innerHTML = `
      <div class="empty-state">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Pedido não encontrado</h2>
        <p class="text-muted mb-4">O pedido #${orderId} não existe no sistema.</p>
        <a href="/pages/admin/orders.html" class="btn btn-primary">Voltar para Pedidos</a>
      </div>`;
  } finally {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }
}

function renderOrder() {
  if (!currentOrder) return;
  const order = currentOrder;
  const content = document.getElementById('content');
  const statusSteps = [
    { status: 'Processando', icon: '&#128344;', label: 'Processar' },
    { status: 'Enviado', icon: '&#128666;', label: 'Enviar' },
    { status: 'Entregue', icon: '&#10004;', label: 'Entregar' },
  ];
  const currentIdx = statusSteps.findIndex(s => s.status === order.status);
  const statusBtnColors = { Enviado: 'background:#3b82f6;color:#fff', Entregue: 'background:#22c55e;color:#fff' };
  const activeColors = { Processando: 'background:#fffbeb;color:#b45309;border:2px solid #fde68a', Enviado: 'background:#eff6ff;color:#1d4ed8;border:2px solid #bfdbfe', Entregue: 'background:#f0fdf4;color:#15803d;border:2px solid #bbf7d0' };

  content.innerHTML = `
    <a href="/pages/admin/orders.html" class="auth-back" style="margin-bottom:24px">&#8592; Pedidos</a>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:24px">
      <div>
        <h1 class="page-title">Detalhes do Pedido</h1>
        <p class="page-subtitle">Informações completas de <span class="font-mono font-semibold text-secondary">#${order.id}</span></p>
      </div>
      ${createStatusBadge(order.status)}
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
      <div>
        <div class="card p-6 mb-4">
          <h3 class="font-semibold mb-4" style="font-size:15px">Informações do Pedido</h3>
          <div class="grid grid-2" style="gap:16px">
            <div style="padding:16px;background:var(--color-bg-alt);border-radius:var(--radius-md)"><p class="text-xs text-muted mb-2">Order ID</p><p class="text-sm font-semibold font-mono">#${order.id}</p></div>
            <div style="padding:16px;background:var(--color-bg-alt);border-radius:var(--radius-md)"><p class="text-xs text-muted mb-2">Cliente</p><p class="text-sm font-semibold">${order.customer_name}</p></div>
            <div style="padding:16px;background:var(--color-bg-alt);border-radius:var(--radius-md)"><p class="text-xs text-muted mb-2">Data do Pedido</p><p class="text-sm font-semibold">${formatDateLong(order.created_at)}</p></div>
            <div style="padding:16px;background:var(--color-bg-alt);border-radius:var(--radius-md)"><p class="text-xs text-muted mb-2">Endereço de Entrega</p><p class="text-sm font-semibold">${order.address}</p></div>
          </div>
        </div>
        <div class="card" style="overflow:hidden">
          <div class="card-header"><h3 style="font-size:15px;font-weight:600">Itens do Pedido</h3><span class="text-xs text-muted">${order.items.length} ${order.items.length===1?'produto':'produtos'}</span></div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th class="text-right">Total</th></tr></thead>
              <tbody>
                ${order.items.map(i => `<tr><td class="text-sm font-semibold">${i.part_name}</td><td class="text-sm text-muted">${i.quantity}</td><td class="text-sm text-muted">${formatCurrency(i.unit_price)}</td><td class="text-sm font-semibold text-right">${formatCurrency(i.unit_price*i.quantity)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:linear-gradient(135deg,var(--color-secondary),#2a4a72);color:#fff">
            <span style="color:rgba(255,255,255,0.7);font-size:14px">Total do Pedido</span>
            <span style="font-size:20px;font-weight:700">${formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="card" style="overflow:hidden;margin-bottom:16px">
          <div style="padding:16px 24px;border-bottom:1px solid var(--color-border-light)">
            <h3 class="font-semibold" style="font-size:15px">Gerenciar Status</h3>
            <p class="text-xs text-muted">Avance o status do pedido</p>
          </div>
          <div style="padding:16px;display:flex;flex-direction:column;gap:8px">
            ${statusSteps.map((step, idx) => {
              const isActive = order.status === step.status;
              const isPast = currentIdx > idx;
              const isNext = currentIdx === idx - 1;
              let style = 'background:var(--color-bg-alt);color:var(--color-text-placeholder);cursor:not-allowed';
              let disabled = 'disabled';
              if (isActive) { style = activeColors[step.status]; disabled = 'disabled'; }
              else if (isNext) { style = statusBtnColors[step.status] || ''; disabled = ''; }
              else if (isPast) { style = 'background:var(--color-bg-alt);color:var(--color-text-placeholder);cursor:not-allowed'; disabled = 'disabled'; }
              const label = isActive ? `${step.status} (atual)` : isPast ? `${step.status} ✓` : `Marcar como ${step.status}`;
              return `<button ${disabled} onclick="advanceStatus('${step.status}')" style="width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--radius-md);font-size:14px;font-weight:600;transition:all 0.2s;${style}">${step.icon} <span style="flex:1;text-align:left">${label}</span>${isNext?'&#8250;':''}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="card p-5">
          <h4 class="text-sm font-semibold mb-4">Timeline</h4>
          ${statusSteps.map((step, idx) => {
            const isDone = currentIdx >= idx;
            const colors = { Processando: { bg: '#fffbeb', c: '#f59e0b' }, Enviado: { bg: '#eff6ff', c: '#3b82f6' }, Entregue: { bg: '#f0fdf4', c: '#22c55e' } };
            const col = isDone ? colors[step.status] : { bg: 'var(--color-input-bg)', c: 'var(--color-text-placeholder)' };
            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="width:28px;height:28px;border-radius:50%;background:${col.bg};color:${col.c};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${step.icon}</div>
              <div style="flex:1"><p class="text-sm font-semibold" style="color:${isDone?'var(--color-text)':'var(--color-text-placeholder)'}">${step.status}</p>${isDone?`<p class="text-xs text-muted">${formatDate(order.created_at)}</p>`:''}</div>
              ${isDone && order.status === step.status ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--color-primary)"></span>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

async function advanceStatus(newStatus) {
  try {
    const res = await api.admin.updateOrderStatus(orderId, newStatus);
    currentOrder = res.data;
    showToast(`Pedido marcado como ${newStatus}`);
    renderOrder();
  } catch (err) {
    showToast(err.message || 'Erro ao atualizar status', 'error');
  }
}

loadOrder();
