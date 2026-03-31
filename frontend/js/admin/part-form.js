if (!requireAdmin()) { /* redirected */ }

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');
let editPart = null;
let specs = [{ label: '', value: '' }];
let imagePreview = null;
let selectedImageFile = null;
const categoryOptions = ['Motor', 'Freios', 'Suspensão', 'Elétrica', 'Rodas', 'Manutenção'];

async function init() {
  if (editId) {
    document.getElementById('loading').style.display = 'flex';
    try {
      const res = await api.parts.findById(editId);
      editPart = res.data;
      specs = editPart.specifications && editPart.specifications.length > 0 ? editPart.specifications : [{ label: '', value: '' }];
      imagePreview = editPart.image_url;
      document.title = 'AutoHub';
    } catch {
      showToast('Peça não encontrada', 'error');
      window.location.href = '/pages/admin/parts-list.html';
      return;
    } finally {
      document.getElementById('loading').style.display = 'none';
    }
  }
  renderForm();
}

function renderForm() {
  const content = document.getElementById('content');
  const isEdit = !!editPart;

  content.innerHTML = `
    <a href="/pages/admin/parts-list.html" class="auth-back" style="margin-bottom:16px">&#8592; Lista de Peças</a>
    <h1 class="page-title">${isEdit ? 'Editar Peça' : 'Nova Peça'}</h1>
    <p class="page-subtitle mb-6">${isEdit ? 'Atualize as informações da peça no catálogo.' : 'Preencha os dados para adicionar uma peça ao catálogo.'}</p>
    <div class="card">
      <form id="part-form" class="p-6">
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-bottom:24px">
          <div>
            <label class="form-label mb-2">Imagem da Peça</label>
            <div id="image-upload" style="width:100%;aspect-ratio:1;border-radius:var(--radius-lg);border:2px dashed var(--color-border);background:var(--color-bg-alt);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative" onclick="document.getElementById('file-input').click()">
              ${imagePreview ? `<img src="${imagePreview}" style="width:100%;height:100%;object-fit:cover">` : `
                <div style="font-size:20px;color:var(--color-text-placeholder);margin-bottom:12px">Imagem</div>
                <p class="text-sm text-muted">Clique para upload</p>
                <p class="text-xs" style="color:var(--color-text-placeholder)">PNG, JPG até 10MB</p>
              `}
            </div>
            <input type="file" id="file-input" accept="image/*" style="display:none" onchange="handleImageChange(this)">
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Nome da Peça <span class="required">*</span></label>
              <input type="text" id="part-name" class="form-input" placeholder="Ex: Disco de Freio Ventilado" value="${isEdit ? editPart.name : ''}">
              <p class="form-error" id="err-name" style="display:none"></p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Preço (R$) <span class="required">*</span></label>
                <input type="text" id="part-price" class="form-input" placeholder="0,00" value="${isEdit ? String(editPart.price) : ''}">
                <p class="form-error" id="err-price" style="display:none"></p>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Categoria</label>
                <select id="part-category" class="form-select">
                  <option value="">Selecione...</option>
                  ${categoryOptions.map(c => `<option value="${c}" ${isEdit && editPart.category_name===c?'selected':''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Descrição</label>
              <textarea id="part-description" class="form-textarea" rows="2" placeholder="Breve descrição da peça...">${isEdit ? editPart.description || '' : ''}</textarea>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <label class="form-label" style="margin-bottom:0">Especificações técnicas</label>
              <button type="button" class="text-xs font-semibold text-primary" onclick="addSpec()">+ Adicionar</button>
            </div>
            <div id="specs-container"></div>
          </div>
          <div>
            <label class="form-label">Carros compatíveis <span class="text-xs text-muted">(um por linha)</span></label>
            <textarea id="part-cars" class="form-textarea" rows="6" placeholder="Volkswagen Gol (2008–2022)&#10;Fiat Palio (2004–2017)">${isEdit ? (editPart.compatible_cars||[]).join('\n') : ''}</textarea>
          </div>
        </div>
        <div style="display:flex;gap:12px;padding-top:12px;border-top:1px solid var(--color-border-light)">
          <button type="submit" class="btn btn-primary" style="flex:1">${isEdit ? 'Salvar alterações' : 'Cadastrar peça'}</button>
          <a href="/pages/admin/parts-list.html" class="btn btn-outline">Cancelar</a>
        </div>
      </form>
    </div>
  `;

  renderSpecs();
  document.getElementById('part-form').addEventListener('submit', handleSubmit);
}

function renderSpecs() {
  const container = document.getElementById('specs-container');
  if (!container) return;
  container.innerHTML = specs.map((s, i) => `
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <input type="text" class="form-input" placeholder="Ex: Diâmetro" value="${s.label}" onchange="specs[${i}].label=this.value" style="flex:1">
      <input type="text" class="form-input" placeholder="Ex: 280 mm" value="${s.value}" onchange="specs[${i}].value=this.value" style="flex:1">
      <button type="button" style="padding:8px;color:var(--color-text-placeholder)" onclick="removeSpec(${i})">Remover</button>
    </div>
  `).join('');
}

function addSpec() { specs.push({ label: '', value: '' }); renderSpecs(); }
function removeSpec(idx) { specs.splice(idx, 1); if (specs.length === 0) specs.push({ label: '', value: '' }); renderSpecs(); }

function handleImageChange(input) {
  const file = input.files[0];
  if (!file) return;
  selectedImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview = e.target.result;
    renderForm();
  };
  reader.readAsDataURL(file);
}

async function handleSubmit(e) {
  e.preventDefault();
  document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

  const name = document.getElementById('part-name').value.trim();
  const priceStr = document.getElementById('part-price').value.replace(',', '.');
  const price = parseFloat(priceStr);
  const category = document.getElementById('part-category').value;
  const description = document.getElementById('part-description').value.trim();
  const carsText = document.getElementById('part-cars').value;
  const cleanSpecs = specs.filter(s => s.label.trim() && s.value.trim());
  const cleanCars = carsText.split('\n').map(c => c.trim()).filter(Boolean);

  let hasError = false;
  if (!name) { document.getElementById('err-name').textContent = 'Informe o nome da peça'; document.getElementById('err-name').style.display = 'block'; hasError = true; }
  if (isNaN(price) || price <= 0) { document.getElementById('err-price').textContent = 'Informe um preço válido'; document.getElementById('err-price').style.display = 'block'; hasError = true; }
  if (hasError) return;

  const categories = (await api.categories.findAll()).data;
  const cat = categories.find(c => c.name === category);

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  if (cat) formData.append('category_id', cat.id);
  formData.append('description', description);
  formData.append('specifications', JSON.stringify(cleanSpecs));
  formData.append('compatible_cars', JSON.stringify(cleanCars));

  if (selectedImageFile) {
    formData.append('image', selectedImageFile);
  } else if (editPart && editPart.image_url) {
    formData.append('image_url', editPart.image_url);
  }

  try {
    if (editId) {
      await api.admin.updatePart(editId, formData);
      showToast('Peça atualizada com sucesso!');
    } else {
      await api.admin.createPart(formData);
      showToast('Peça cadastrada com sucesso!');
    }
    setTimeout(() => { window.location.href = '/pages/admin/parts-list.html'; }, 500);
  } catch (err) {
    showToast(err.message || 'Erro ao salvar', 'error');
  }
}

init();
