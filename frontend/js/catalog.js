let allParts = [];
let categories = [];
let activeCategory = 'Todos';
let searchQuery = '';
let addedIds = new Set();

async function loadCatalog() {
  try {
    const [partsRes, catsRes] = await Promise.all([api.parts.findAll(), api.categories.findAll()]);
    allParts = partsRes.data;
    categories = catsRes.data;
    renderCategoryFilters();
    renderProducts();
  } catch (err) {
    console.error(err);
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  const allCats = ['Todos', ...categories.map(c => c.name)];
  container.innerHTML = allCats.map(cat =>
    `<button class="filter-chip ${cat === activeCategory ? 'active' : ''}" onclick="setCategory('${cat}')">${cat}</button>`
  ).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategoryFilters();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  const countText = document.getElementById('count-text');

  let filtered = allParts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'Todos' || p.category_name === activeCategory;
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    countText.textContent = '';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';
  const user = getUser();
  const cart = getCart();

  grid.innerHTML = filtered.map(part => {
    const cartItem = cart.find(i => i.part_id === part.id);
    const qty = cartItem ? cartItem.quantity : 0;
    const justAdded = addedIds.has(part.id);
    return `
      <div class="product-card" onclick="window.location.href='/pages/part-detail.html?id=${part.id}'">
        <div class="product-card-img">
          <img src="${part.image_url}" alt="${part.name}" loading="lazy">
          <span class="product-card-category">${part.category_name || ''}</span>
          ${user && qty > 0 ? `<span class="product-card-qty">${qty}</span>` : ''}
        </div>
        <div class="product-card-info">
          <p class="product-card-name">${part.name}</p>
          <p class="product-card-desc">${part.description || ''}</p>
          <p class="product-card-price">${formatCurrency(part.price)}</p>
          <button class="product-card-btn ${justAdded ? 'added' : ''}" onclick="event.stopPropagation(); handleAddToCart(${part.id})">
            ${justAdded ? '&#10003; Adicionado' : '&#128722; Adicionar'}
          </button>
        </div>
      </div>`;
  }).join('');

  countText.textContent = `${filtered.length} ${filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}`;
}

function handleAddToCart(partId) {
  const user = getUser();
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }
  const part = allParts.find(p => p.id === partId);
  if (!part) return;
  addToCart(part);
  addedIds.add(partId);
  showToast(`${part.name} adicionado ao carrinho!`);
  renderProducts();
  buildNavbar();
  setTimeout(() => { addedIds.delete(partId); renderProducts(); }, 1500);
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

loadCatalog();
