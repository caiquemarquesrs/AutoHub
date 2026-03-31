if (!requireAuth()) { /* redirected */ }

const SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 19.90;
const installmentOptions = [
  { value: 1, label: '1× sem juros' },
  { value: 2, label: '2× sem juros' },
  { value: 3, label: '3× sem juros' },
  { value: 6, label: '6× com juros (3,99%)' },
  { value: 10, label: '10× com juros (7,99%)' },
  { value: 12, label: '12× com juros (10,99%)' },
];
const rates = { 6: 1.0399, 10: 1.0799, 12: 1.1099 };
let paymentType = '';
let installments = 1;
let address = '';
let ordering = false;
let ordered = false;

function getSubtotal() {
  return getCart().reduce((s, i) => s + i.price * i.quantity, 0);
}

function getShipping() {
  return getSubtotal() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function getTotal() { return getSubtotal() + getShipping(); }

function renderCart() {
  const container = document.getElementById('cart-content');
  const cart = getCart();
  const user = getUser();
  if (!user) return;

  if (ordered) {
    container.innerHTML = `
      <div class="empty-state" style="min-height:60vh">
        <h2 style="font-size:22px;font-weight:700;margin-bottom:8px">Pedido realizado!</h2>
        <p class="text-muted" style="margin-bottom:24px">Seu pedido foi enviado para processamento. Acompanhe em Meus Pedidos.</p>
        <div style="display:flex;gap:12px">
          <a href="/" class="btn btn-primary">Continuar comprando</a>
          <a href="/pages/orders.html" class="btn btn-outline">Meus Pedidos</a>
        </div>
      </div>`;
    return;
  }

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) {
    container.innerHTML = `
      <a href="/" class="auth-back" style="margin-bottom:16px">&#8592; Continuar comprando</a>
      <h1 class="page-title">Carrinho</h1>
      <p class="page-subtitle mb-6">${itemCount} itens no carrinho</p>
      <div class="card empty-state">
        <div class="empty-state-icon" style="font-size:20px">-</div>
        <h3 class="empty-state-title">Carrinho vazio</h3>
        <p class="empty-state-text">Adicione peças do catálogo para continuar.</p>
        <a href="/" class="btn btn-primary">Ver Catálogo</a>
      </div>`;
    return;
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  container.innerHTML = `
    <a href="/" class="auth-back" style="margin-bottom:16px">&#8592; Continuar comprando</a>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h1 class="page-title">Carrinho</h1>
        <p class="page-subtitle">${itemCount} ${itemCount === 1 ? 'item' : 'itens'} no carrinho</p>
      </div>
      <button class="text-sm text-muted" style="display:flex;align-items:center;gap:6px" onclick="handleClearCart()">Limpar</button>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:300px">
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
          ${cart.map(item => `
            <div class="card" style="padding:16px;display:flex;align-items:center;gap:16px">
              <div style="width:64px;height:64px;border-radius:var(--radius-md);overflow:hidden;flex-shrink:0">
                <img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div style="flex:1;min-width:0">
                <p class="font-semibold text-sm truncate">${item.name}</p>
                <p class="text-xs text-muted">${item.category || ''}</p>
                <p class="text-primary font-semibold text-sm">${formatCurrency(item.price)}</p>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <button onclick="updateQty(${item.part_id}, ${item.quantity - 1})" style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--color-input-bg);display:flex;align-items:center;justify-content:center;font-size:16px">−</button>
                <span class="font-semibold text-sm" style="width:24px;text-align:center">${item.quantity}</span>
                <button onclick="updateQty(${item.part_id}, ${item.quantity + 1})" style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--color-input-bg);display:flex;align-items:center;justify-content:center;font-size:16px">+</button>
              </div>
              <div style="text-align:right">
                <p class="font-bold text-sm">${formatCurrency(item.price * item.quantity)}</p>
                <button class="text-xs text-muted" style="margin-top:4px" onclick="removeItem(${item.part_id})">Remover</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card" style="padding:20px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <h3 class="font-semibold" style="font-size:15px">Endereço de entrega</h3>
          </div>
          <input type="text" id="address-input" class="form-input" placeholder="Ex: Rua das Flores, 123 — São Paulo, SP" value="${address}" oninput="address=this.value">
          <p class="form-error" id="err-address" style="display:none"></p>
        </div>
        <div class="card" style="padding:20px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <h3 class="font-semibold" style="font-size:15px">Forma de pagamento</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <label class="payment-option ${paymentType==='pix'?'active':''}" onclick="setPayment('pix')">
              <input type="radio" name="payment" value="pix" ${paymentType==='pix'?'checked':''}>
              <div style="flex:1"><p class="text-sm font-semibold">Pix</p><p class="text-xs" style="color:#059669">Aprovação imediata</p></div>
            </label>
            <div class="payment-option ${paymentType==='credit'?'active':''}" onclick="setPayment('credit')">
              <input type="radio" name="payment" value="credit" ${paymentType==='credit'?'checked':''}>
              <div style="flex:1"><p class="text-sm font-semibold">Cartão de Crédito</p><p class="text-xs text-muted">Até 12× parcelado</p></div>
            </div>
            ${paymentType === 'credit' ? `
              <div style="padding:0 16px 16px;margin-top:-4px">
                <p class="text-xs font-semibold mb-2" style="color:var(--color-text-secondary)">Número de parcelas</p>
                <div class="installment-grid">
                  ${installmentOptions.map(opt => {
                    const hasInterest = opt.label.includes('com juros');
                    const multiplier = hasInterest ? (rates[opt.value] || 1) : 1;
                    const instValue = (total * multiplier) / opt.value;
                    return `<button class="installment-option ${installments===opt.value?'active':''}" onclick="setInstallments(${opt.value})">
                      <p class="text-xs font-bold ${installments===opt.value?'text-primary':''}">${opt.value}×</p>
                      <p class="text-xs font-semibold">${formatCurrency(instValue)}</p>
                      <p class="text-xs" style="margin-top:2px;color:${hasInterest?'#d97706':'#059669'}">${hasInterest?'c/ juros':'s/ juros'}</p>
                    </button>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}
            <label class="payment-option ${paymentType==='debit'?'active':''}" onclick="setPayment('debit')">
              <input type="radio" name="payment" value="debit" ${paymentType==='debit'?'checked':''}>
              <div style="flex:1"><p class="text-sm font-semibold">Cartão de Débito</p><p class="text-xs text-muted">Aprovação imediata</p></div>
            </label>
          </div>
          <p class="form-error" id="err-payment" style="display:none"></p>
        </div>
      </div>
      <div style="width:288px;flex-shrink:0">
        <div class="card" style="padding:24px;position:sticky;top:72px">
          <h3 class="font-semibold mb-4" style="font-size:15px">Resumo do Pedido</h3>
          ${cart.map(i => `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="text-sm text-muted truncate" style="flex:1;margin-right:8px">${i.name} ×${i.quantity}</span><span class="text-sm font-semibold">${formatCurrency(i.price*i.quantity)}</span></div>`).join('')}
          <div style="border-top:1px solid var(--color-border-light);padding-top:12px;margin-top:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="text-sm text-muted">Subtotal</span><span class="text-sm font-semibold">${formatCurrency(subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="text-sm text-muted">Frete</span><span class="text-sm font-semibold ${shipping===0?'text-success':''}">${shipping===0?'Grátis':formatCurrency(shipping)}</span></div>
          </div>
          <div style="border-top:1px solid var(--color-border-light);padding-top:12px;margin-top:12px;margin-bottom:20px">
            <div style="display:flex;justify-content:space-between"><span class="font-semibold">Total</span><span class="font-bold" style="font-size:18px">${formatCurrency(total)}</span></div>
          </div>
          <button id="checkout-btn" class="btn btn-primary btn-full" onclick="handleCheckout()" ${ordering?'disabled':''}>
            ${ordering ? '<span class="spinner"></span>' : 'Finalizar Pedido'}
          </button>
        </div>
      </div>
    </div>`;
}

function updateQty(partId, newQty) {
  let cart = getCart();
  if (newQty < 1) {
    cart = cart.filter(i => i.part_id !== partId);
  } else {
    cart = cart.map(i => i.part_id === partId ? { ...i, quantity: newQty } : i);
  }
  saveCart(cart);
  buildNavbar();
  renderCart();
}

function removeItem(partId) {
  saveCart(getCart().filter(i => i.part_id !== partId));
  buildNavbar();
  renderCart();
}

function handleClearCart() {
  clearCart();
  buildNavbar();
  showToast('Carrinho esvaziado', 'info');
  renderCart();
}

function setPayment(type) {
  paymentType = type;
  renderCart();
}

function setInstallments(val) {
  installments = val;
  renderCart();
}

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;
  let hasError = false;
  document.querySelectorAll('.form-error').forEach(e => e.style.display = 'none');
  address = document.getElementById('address-input')?.value || address;
  if (!paymentType) {
    const el = document.getElementById('err-payment');
    if (el) { el.textContent = 'Selecione uma forma de pagamento'; el.style.display = 'block'; }
    hasError = true;
  }
  if (!address.trim()) {
    const el = document.getElementById('err-address');
    if (el) { el.textContent = 'Informe o endereço de entrega'; el.style.display = 'block'; }
    hasError = true;
  }
  if (hasError) { showToast('Preencha todos os campos antes de finalizar.', 'error'); return; }

  ordering = true;
  renderCart();

  try {
    await api.orders.create({
      address: address,
      payment_method: paymentType,
      installments: paymentType === 'credit' ? installments : 1,
      items: cart.map(i => ({ part_id: i.part_id, quantity: i.quantity })),
    });
    clearCart();
    buildNavbar();
    ordered = true;
    ordering = false;
    showToast('Pedido finalizado com sucesso!');
    renderCart();
  } catch (err) {
    ordering = false;
    showToast(err.message || 'Erro ao finalizar pedido', 'error');
    renderCart();
  }
}

renderCart();
