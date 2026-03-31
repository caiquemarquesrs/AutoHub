if (!requireAdmin()) { /* redirected */ }

let allParts = [];
let categories = [];
let activeCategory = 'Todos';
let searchQuery = '';
let deleteTarget = null;

async function loadParts() {
  try {
    const [partsRes, catsRes] = await Promise.all([api.parts.findAll(), api.categories.findAll()]);
    allParts = partsRes.data;
    categories = catsRes.data;
    document.getElementById('total-text').textContent = `${allParts.length} peças no catálogo`;
    renderCategoryFilters();
    renderParts();
  } catch (err) {
    showToast(err.message || 'Erro ao carregar peças', 'error');
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function renderCategoryFilters() {
  const allCats = ['Todos', ...categories.map(c => c.name)];
  document.getElementById('category-filters').innerHTML = `<span style="font-size:12px;color:var(--color-text-muted);padding:0 6px">🏷️</span>` + allCats.map(cat =>
    `<button class="filter-chip ${cat === activeCategory ? 'active' : ''}" onclick="setCategoryFilter('${cat}')">${cat}</button>`
  ).join('');
}

function setCategoryFilter(cat) { activeCategory = cat; renderCategoryFilters(); renderParts(); }

function renderParts() {
  const filtered = allParts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery);
    const matchCat = activeCategory === 'Todos' || p.category_name === activeCategory;
    return matchSearch && matchCat;
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

  document.getElementById('parts-body').innerHTML = filtered.map(p => `
    <tr>
      <td><div style="width:48px;height:48px;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--color-border-light)"><img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"></div></td>
      <td class="text-mono font-semibold text-secondary">#${p.id}</td>
      <td><p class="text-sm font-semibold">${p.name}</p><p class="text-xs text-muted truncate" style="max-width:240px">${p.description||''}</p></td>
      <td><span style="display:inline-flex;padding:2px 10px;border-radius:100px;font-size:12px;font-weight:600;background:var(--color-secondary-light);color:var(--color-secondary)">${p.category_name||''}</span></td>
      <td><span class="text-sm font-bold text-primary">${formatCurrency(p.price)}</span></td>
      <td class="text-right">
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <a href="/pages/admin/part-form.html?id=${p.id}" class="btn-danger-outline" style="color:var(--color-secondary);border-color:rgba(29,53,87,0.2)">Editar</a>
          <button class="btn-danger-outline" onclick="confirmDelete(${p.id}, '${p.name.replace(/'/g,"\\'")}')">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');

  countText.textContent = `Exibindo ${filtered.length} de ${allParts.length} peças`;
}

function confirmDelete(id, name) {
  deleteTarget = { id, name };
  document.getElementById('delete-modal').style.display = 'block';
  document.getElementById('delete-modal').innerHTML = `
    <div class="modal-overlay">
      <div class="modal-backdrop" onclick="closeModal()"></div>
      <div class="modal-content">
        <div class="modal-icon">!</div>
        <h3 class="modal-title">Excluir peça?</h3>
        <p class="modal-description">A peça "${name}" será removida permanentemente do catálogo. Essa ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="handleDelete()">Excluir peça</button>
        </div>
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById('delete-modal').style.display = 'none';
  deleteTarget = null;
}

async function handleDelete() {
  if (!deleteTarget) return;
  try {
    await api.admin.deletePart(deleteTarget.id);
    showToast(`"${deleteTarget.name}" removida com sucesso.`);
    closeModal();
    loadParts();
  } catch (err) {
    showToast(err.message || 'Erro ao excluir', 'error');
  }
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderParts();
});

loadParts();
