/* npx json-server --watch db.json --port 3000 */



/* script.js */
'use strict';

/* ======================= API Base ======================= */
const API = 'http://localhost:3000';

/* ======================= Gratitude Card ======================= */
const PEOPLE = [
  { name: 'Amr Yasser',    img: './assets/images/Amr.jpg'    },
  { name: 'Habiba Tarek',  img: './assets/images/Habiba.jpg' },
  { name: 'Suzan Elbadry', img: './assets/images/Suzan.jpg'  }
];

function getNextIndex(){
  try {
    const key = 'gratitude_index';
    const curr = Number(localStorage.getItem(key) || '-1');
    const next = (curr + 1) % PEOPLE.length;
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return Math.floor(Math.random() * PEOPLE.length);
  }
}

function renderGratitude(){
  const i = getNextIndex();
  const p = PEOPLE[i];
  const img  = document.getElementById('gratitude-img');
  const name = document.getElementById('gratitude-name');
  if(!img || !name) return;
  img.src = p.img;
  img.alt = p.name;
  img.onerror = function(){ this.style.display='none'; };
  name.innerHTML = `<a href="https://example.com" target="_blank">${p.name}</a>`;
}

/* ======================= State & DOM ======================= */
let categories = [];
let products   = [];

const tabs = {
  products:  document.getElementById('tab-products'),
  categories:document.getElementById('tab-categories'),
};
const wraps = {
  product:   document.getElementById('products-form-wrap'),
  category:  document.getElementById('categories-form-wrap'),
};

const productForm      = document.getElementById('product-form');
const productId        = document.getElementById('product-id');
const productName      = document.getElementById('product-name');
const productPrice     = document.getElementById('product-price');
const productQty       = document.getElementById('product-qty');
const productCategory  = document.getElementById('product-category');
const productImage     = document.getElementById('product-image');
const productDesc      = document.getElementById('product-desc');
const productMsg       = document.getElementById('product-msg');
const productFormTitle = document.getElementById('product-form-title');

const categoryForm      = document.getElementById('category-form');
const categoryId        = document.getElementById('category-id');
const categoryName      = document.getElementById('category-name');
const categoryDesc      = document.getElementById('category-desc');
const categoryMsg       = document.getElementById('category-msg');
const categoryFormTitle = document.getElementById('category-form-title');

const filterCategory = document.getElementById('filter-category');
const searchInput    = document.getElementById('search');
const inventoryBody  = document.getElementById('inventory-body');

const countProducts   = document.getElementById('count-products');
const countCategories = document.getElementById('count-categories');

const statQty = document.getElementById('stat-total-qty');
const statVal = document.getElementById('stat-total-value');

/* ======================= Helpers ======================= */
const fmt = new Intl.NumberFormat('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function showMsg(el, text, type = 'success') {
  el.textContent = text;
  el.className   = `msg ${type}`;
  el.style.display = 'inline-block';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // DELETE من json-server بيرجع جسم فاضي؛ نحافظ على الاتساق:
  return res.status === 204 ? {} : res.json();
}

/* ======================= Load & Hydrate ======================= */
async function loadAll() {
  const [cats, prods] = await Promise.all([
    api('/categories').catch(()=>[]),
    api('/products').catch(()=>[])
  ]);
  categories = Array.isArray(cats)  ? cats  : [];
  products   = Array.isArray(prods) ? prods : [];
  hydrateUI();
}

function hydrateUI(){
  // Dropdowns
  productCategory.innerHTML =
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  filterCategory.innerHTML =
    `<option value="">All categories</option>` +
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Counters
  countProducts.textContent   = `${products.length} products`;
  countCategories.textContent = `${categories.length} categories`;

  renderTable();
  refreshCustomSelects(); // مهم: تحديث الـ custom select بعد البناء
}

function renderTable(){
  const term   = (searchInput.value || '').trim().toLowerCase();
  const theCat = filterCategory.value; // FIX: كانت من غير const

  const list = products.filter(p => {
    const okCat  = !theCat || String(p.categoryId) === String(theCat);
    const okTerm = !term || [p.name, p.description].filter(Boolean).some(s => String(s).toLowerCase().includes(term));
    return okCat && okTerm;
  });

  const catById = {};
  for (const c of categories) catById[c.id] = c;

  inventoryBody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img class="img-thumb" src="${p.image || ''}" alt="${p.name}" onerror="this.src=''; this.style.display='none'" />
          <div>
            <div style="font-weight:700;">${p.name}</div>
            <div class="hint">${p.description || ''}</div>
          </div>
        </div>
      </td>
      <td><span class="pill">${(catById[p.categoryId] && catById[p.categoryId].name) || '—'}</span></td>
      <td>EGP ${fmt.format(Number(p.price || 0))}</td>
      <td>${Number(p.quantity || 0)}</td>
      <td>EGP ${fmt.format(Number(p.price || 0) * Number(p.quantity || 0))}</td>
      <td>
        <div class="inline">
          <button class="btn" onclick='editProduct(${p.id})'>Edit</button>
          <button class="btn danger" onclick='deleteProduct(${p.id})'>Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  const totalQty = list.reduce((s, p) => s + Number(p.quantity || 0), 0);
  const totalVal = list.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
  statQty.textContent = totalQty;
  statVal.textContent = fmt.format(totalVal);
}

/* ======================= Tabs ======================= */
tabs.products.addEventListener('click', () => {
  tabs.products.classList.add('active');
  tabs.categories.classList.remove('active');
  wraps.product.style.display  = '';
  wraps.category.style.display = 'none';
});
tabs.categories.addEventListener('click', () => {
  tabs.categories.classList.add('active');
  tabs.products.classList.remove('active');
  wraps.category.style.display = '';
  wraps.product.style.display  = 'none';
});

/* ======================= Filters ======================= */
searchInput.addEventListener('input', renderTable);
filterCategory.addEventListener('change', renderTable);

/* ======================= Product CRUD ======================= */
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name:        productName.value.trim(),
    description: productDesc.value.trim(),
    image:       productImage.value.trim(),
    price:       Number(productPrice.value),
    quantity:    Number(productQty.value),
    categoryId:  Number(productCategory.value)
  };
  try {
    if (!payload.name) throw new Error('Name is required');
    if (isNaN(payload.price)) throw new Error('Price must be a number');
    if (isNaN(payload.quantity)) throw new Error('Quantity must be a number');

    if (productId.value) {
      const id = Number(productId.value);
      const updated = await api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      products = products.map(p => p.id === id ? { ...p, ...updated } : p);
      showMsg(productMsg, 'Product updated', 'success');
    } else {
      const created = await api('/products', { method: 'POST', body: JSON.stringify(payload) });
      products.push(created);
      showMsg(productMsg, 'Product added', 'success');
    }
    resetProductForm();
    renderTable();
  } catch (err) {
    showMsg(productMsg, err.message || 'Failed', 'error');
  }
});

document.getElementById('product-reset').addEventListener('click', resetProductForm);

window.editProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  productId.value       = p.id;
  productName.value     = p.name || '';
  productPrice.value    = p.price ?? '';
  productQty.value      = p.quantity ?? '';
  productCategory.value = p.categoryId ?? '';
  productImage.value    = p.image || '';
  productDesc.value     = p.description || '';
  productFormTitle.textContent = 'Edit Product';
  tabs.products.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = async (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete product: ${p.name}?`)) return;
  try {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error();
    products = products.filter(x => x.id !== id);
    renderTable();
  } catch {
    alert('Failed to delete');
  }
};

function resetProductForm() {
  productId.value = '';
  productForm.reset();
  productFormTitle.textContent = 'Add Product';
}

/* ======================= Category CRUD ======================= */
categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: categoryName.value.trim(),
    description: categoryDesc.value.trim()
  };
  try {
    if (!payload.name) throw new Error('Name is required');

    if (categoryId.value) {
      const id = Number(categoryId.value);
      const updated = await api(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      categories = categories.map(c => c.id === id ? { ...c, ...updated } : c);
      showMsg(categoryMsg, 'Category updated', 'success');
    } else {
      const created = await api('/categories', { method: 'POST', body: JSON.stringify(payload) });
      categories.push(created);
      showMsg(categoryMsg, 'Category added', 'success');
    }
    hydrateUI();       // يعيد بناء القايم
    resetCategoryForm();
  } catch (err) {
    showMsg(categoryMsg, err.message || 'Failed', 'error');
  }
});

document.getElementById('category-reset').addEventListener('click', resetCategoryForm);

window.editCategory = (id) => {
  const c = categories.find(x => x.id === id);
  if (!c) return;
  categoryId.value   = c.id;
  categoryName.value = c.name || '';
  categoryDesc.value = c.description || '';
  categoryFormTitle.textContent = 'Edit Category';
  tabs.categories.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCategory = async (id) => {
  const c = categories.find(x => x.id === id);
  if (!c) return;
  if (!confirm(`Delete category: ${c.name}? (Products linked to this category will keep the old categoryId)`)) return;
  try {
    const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error();
    categories = categories.filter(x => x.id !== id);
    hydrateUI();
  } catch {
    alert('Failed to delete');
  }
};

function resetCategoryForm() {
  categoryId.value = '';
  categoryForm.reset();
  categoryFormTitle.textContent = 'Add Category';
}

/* ======================= Custom Select (clean & safe) ======================= */
const nselectMap = new Map();

function refreshCustomSelects(){
  ensureNSelect(productCategory);
  ensureNSelect(filterCategory);
}

function ensureNSelect(nativeSelect, {rtl = false} = {}){
  if (!nativeSelect) return;
  const id = nativeSelect.id || Math.random().toString(36).slice(2);
  nativeSelect.id = id;

  if (nselectMap.has(id)) {
    nselectMap.get(id).rebuild();
    return nselectMap.get(id);
  }
  const ctl = enhanceSelect(nativeSelect, {rtl});
  nselectMap.set(id, ctl);
  return ctl;
}

function enhanceSelect(nativeSelect, {rtl = false} = {}){
  // أخفي الـ select بصريًا (مع بقاءه داخل الفورم)
  nativeSelect.classList.add('select--visually-hidden');

  const wrap = document.createElement('div');
  wrap.className = 'nselect' + (rtl ? ' is-rtl' : '');
  wrap.setAttribute('data-for', nativeSelect.id);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nselect__btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');

  const label = document.createElement('span');
  label.className = 'nselect__label';
  label.textContent = (nativeSelect.options[nativeSelect.selectedIndex] && nativeSelect.options[nativeSelect.selectedIndex].text) || '—';

  const arrow = document.createElement('span');
  arrow.className = 'nselect__arrow';

  btn.appendChild(label);
  btn.appendChild(arrow);

  const menu = document.createElement('div');
  menu.className = 'nselect__menu';
  menu.setAttribute('role', 'listbox');

  function buildOptions(){
    menu.innerHTML = '';
    for (let i = 0; i < nativeSelect.options.length; i++){
      const opt = nativeSelect.options[i];
      const item = document.createElement('div');
      item.className = 'nselect__opt';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', opt.value);
      item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
      item.textContent = opt.text;
      item.addEventListener('click', () => choose(i));
      menu.appendChild(item);
    }
  }

  function open(){
    wrap.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    const sel = menu.querySelector('[aria-selected="true"]');
    if (sel) sel.scrollIntoView({block: 'nearest'});
    document.addEventListener('click', onOutside);
    document.addEventListener('keydown', onKey);
  }
  function close(){
    wrap.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutside);
    document.removeEventListener('keydown', onKey);
  }
  function toggle(){ wrap.classList.contains('open') ? close() : open(); }
  function onOutside(e){ if (!wrap.contains(e.target)) close(); }

  function choose(index){
    nativeSelect.selectedIndex = index;
    label.textContent = nativeSelect.options[index].text;
    const opts = menu.querySelectorAll('.nselect__opt');
    for (let i = 0; i < opts.length; i++){
      opts[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
    }
    nativeSelect.dispatchEvent(new Event('change', {bubbles:true}));
    close();
  }

  function onKey(e){
    const max = nativeSelect.options.length - 1;
    if (e.key === 'Escape') return close();
    if (e.key === 'Enter')  return close();
    let i = nativeSelect.selectedIndex;
    if (e.key === 'ArrowDown') { e.preventDefault(); i = Math.min(max, i + 1); choose(i); open(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); i = Math.max(0,   i - 1); choose(i); open(); }
  }

  btn.addEventListener('click', toggle);

  // إدراج بالـ DOM
  nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
  wrap.appendChild(nativeSelect);
  wrap.appendChild(btn);
  wrap.appendChild(menu);

  // لو حصل تغيير قيمة برّا (من الكود)
  nativeSelect.addEventListener('change', () => {
    const idx = nativeSelect.selectedIndex;
    if (idx >= 0) label.textContent = nativeSelect.options[idx].text;
    const opts = menu.querySelectorAll('.nselect__opt');
    for (let i = 0; i < opts.length; i++){
      opts[i].setAttribute('aria-selected', i === idx ? 'true' : 'false');
    }
  });

  buildOptions();

  return {
    rebuild: buildOptions,
    destroy: () => { /* ممكن نفك الربط لو حبيت لاحقًا */ }
  };
}

/* ======================= Boot ======================= */
renderGratitude();
loadAll().catch(err => {
  console.error(err);
  alert('Could not load API. Make sure JSON Server is running on http://localhost:3000');
});
