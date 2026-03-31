const urlParams = new URLSearchParams(window.location.search);
const partId = urlParams.get('id');

async function loadPart() {
  if (!partId) { window.location.href = '/'; return; }
  try {
    const res = await api.parts.findById(partId);
    const part = res.data;
    document.title = `AutoHub - ${part.name}`;
    renderPart(part);
  } catch {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    document.getElementById('content').innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">Peça não encontrada</p>
        <a href="/" class="btn btn-primary mt-4">Voltar ao catálogo</a>
      </div>`;
  }
}

function getInstallments(price) {
  return [
    { months: 1, value: price, interest: false },
    { months: 3, value: price / 3, interest: false },
    { months: 6, value: (price * 1.0399) / 6, interest: true },
    { months: 10, value: (price * 1.0799) / 10, interest: true },
    { months: 12, value: (price * 1.1099) / 12, interest: true },
  ];
}

function renderPart(part) {
  document.getElementById('loading').style.display = 'none';
  const content = document.getElementById('content');
  content.style.display = 'block';
  const installments = getInstallments(part.price);
  const specs = part.specifications || [];
  const cars = part.compatible_cars || [];

  content.innerHTML = `
    <a href="/" class="auth-back" style="margin-bottom:24px">&#8592; Voltar ao catálogo</a>
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px">
      <div style="border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:1;position:relative">
        <img src="${part.image_url}" alt="${part.name}" style="width:100%;height:100%;object-fit:cover">
        <span class="product-card-category" style="top:16px;left:16px;font-size:12px;padding:4px 12px">${part.category_name || ''}</span>
      </div>
      <div style="display:flex;flex-direction:column">
        <p class="font-mono text-xs text-muted" style="letter-spacing:0.1em;margin-bottom:4px">#${part.id}</p>
        <h1 class="page-title" style="margin-bottom:12px">${part.name}</h1>
        <p style="color:#6C6C70;font-size:15px;line-height:1.6;margin-bottom:20px">${part.description || ''}</p>
        <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:24px">
          <span style="font-size:32px;font-weight:700;color:var(--color-primary);line-height:1">${formatCurrency(part.price)}</span>
          <span class="text-sm text-muted" style="margin-bottom:4px">ou em até 12× com juros</span>
        </div>
        <div class="card" style="padding:16px;margin-bottom:24px">
          <p class="font-semibold text-sm mb-3">&#128179; Opções de parcelamento</p>
          ${installments.map(i => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span class="text-sm">${i.months}× de <strong>${formatCurrency(i.value)}</strong></span>
              <span class="text-xs font-semibold" style="padding:2px 8px;border-radius:100px;${i.interest ? 'background:#fffbeb;color:#b45309;border:1px solid #fde68a' : 'background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0'}">${i.interest ? 'com juros' : 'sem juros'}</span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <span class="text-xs" style="color:#6C6C70">&#128666; Frete grátis acima de R$ 300</span>
          <span class="text-xs" style="color:#6C6C70">&#128737; Garantia inclusa</span>
        </div>
        <div style="display:flex;gap:12px;margin-top:auto">
          <button class="btn btn-outline-primary" style="flex:1" onclick="handleAdd()">&#128722; Adicionar ao carrinho</button>
          <button class="btn btn-primary" style="flex:1" onclick="handleBuyNow()">Comprar agora</button>
        </div>
      </div>
    </div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px">
      <div class="card">
        <div class="card-header"><h2 style="font-size:15px;font-weight:600">&#8505; Especificações técnicas</h2></div>
        ${specs.map(s => `<div style="display:flex;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--color-border-light)"><span class="text-sm text-muted">${s.label}</span><span class="text-sm font-semibold">${s.value}</span></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-header"><h2 style="font-size:15px;font-weight:600">&#128663; Carros compatíveis</h2></div>
        <div style="padding:16px 24px">
          ${cars.map(c => `<div style="display:flex;align-items:flex-start;gap:10px;padding:4px 0"><span style="color:#22c55e">&#10003;</span><span class="text-sm">${c}</span></div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

let currentPart = null;
async function loadAndStore() {
  if (!partId) return;
  try {
    const res = await api.parts.findById(partId);
    currentPart = res.data;
  } catch {}
}

function handleAdd() {
  if (!isLoggedIn()) { window.location.href = '/pages/login.html'; return; }
  if (!currentPart) return;
  addToCart(currentPart);
  showToast(`${currentPart.name} adicionado ao carrinho!`);
  buildNavbar();
}

function handleBuyNow() {
  if (!isLoggedIn()) { window.location.href = '/pages/login.html'; return; }
  if (!currentPart) return;
  addToCart(currentPart);
  window.location.href = '/pages/cart.html';
}

async function init() {
  await loadPart();
  await loadAndStore();
}
init();
