let currentPage = 1;
const totalPages = 17;

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvEfoAlfrXcSukJICzx9icJU9VWMQI4gHnAjNIV9Y28KtBCWo89XJabccW9b2NljJZRiWJ4cP0aAJh/pub?output=csv';

const EMOJI_MAP = {
  'Entradas': '🍟',
  'Principales': '🍽️',
  'Pastas': '🍝',
  'Salsas': '🫕',
  'Guarniciones': '🥗',
  'Pizzas': '🍕',
  'Empanadas': '🥟',
  'Tartas': '🥧',
  'Hamburguesas': '🍔',
  'Sandwiches': '🥪',
  'Postres': '🍰',
  'Helados': '🍨',
  'Bebida Sin Alcohol': '🥤',
  'Alcohol': '🍾',
  'Vinos': '🍷',
  'Cervezas': '🍺',
  'Tragos': '🍹',
  'Menú Infantil': '👶',
  'Asado Libre': '🥩🥗🔥'
};

const CATEGORY_MAP = {
  'Entradas': 'page2',
  'Principales': 'page3',
  'Pastas': 'page4',
  'Salsas': 'page4',
  'Guarniciones': 'page5',
  'Empanadas': 'page6',
  'Pizzas': 'page7',
  'Tartas': 'page8',
  'Hamburguesas': 'page9',
  'Sándwiches': 'page10',
  'Menú Infantil': 'page11',
  'Infantil': 'page11',
  'Bebida Sin Alcohol': 'page12',
  'Alcohol': 'page12',
  'Vinos': 'page13',
  'Cervezas': 'page14',
  'Tragos': 'page15',
  'Postres': 'page16',
  'Helados': 'page16',
  'Asado Libre': 'page17'
};

// "_config" es un token reservado: no es una categoría de productos, es configuración del sitio
const CONFIG_CATEGORY = '_config';

let menuConfig = [];

function normalizeCategoryKey(name) {
  return name.trim().toLowerCase();
}

function getEmojiForCategory(categoryName) {
  return EMOJI_MAP[categoryName] || '🥪';
}

const GROUPED_CATEGORIES = ['Hamburguesas', 'Vinos'];

async function loadMenuFromSheets() {
  try {
    console.log('📥 Cargando menú desde Google Sheets...');

    // sin esto un fetch colgado deja el spinner tapando la pantalla para siempre
    const response = await fetch(CSV_URL, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const menuData = parseCSV(csvText);

    if (!menuData || Object.keys(menuData).length === 0) {
      throw new Error('El CSV no contiene productos válidos');
    }

    console.log('✅ Menú cargado:', menuData);
    return menuData;

  } catch (error) {
    console.error('❌ Error al cargar menú:', error);
    return null; // null, no un objeto vacío: el menú real nunca se sustituye por datos inventados
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const menuItems = [];

  menuConfig = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const columns = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        j++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === '\t' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim());

    const id = columns[0] || i;
    const categoria = columns[1];
    const nombre = columns[2];
    const descripcion = columns[3] || '';
    const precioRaw = columns[4];
    const precio = parseInt(precioRaw, 10);

    // Orden obligatorio: antes de la validación genérica y de organizeByCategory, o una
    // fila _config se convierte en un producto más de la carta.
    if (normalizeCategoryKey(categoria || '') === CONFIG_CATEGORY) {
      if (!nombre || isNaN(precio) || precio === 0) {
        console.warn(`⚠️ Fila ${i + 1} de configuración "${CONFIG_CATEGORY}" descartada: ` +
          'se necesita "nombre" (la etiqueta) y un "precio" numérico mayor que 0.', {
            nombre: nombre || '(vacío)',
            precio: precioRaw || '(vacío)',
            raw: columns
          });
      } else {
        menuConfig.push({ label: nombre, precio });
      }
      continue;
    }

    if (!nombre || !categoria || isNaN(precio) || precio === 0) {
      console.warn(`⚠️ Fila ${i + 1} ignorada:`, {
        nombre: nombre || '(vacío)',
        categoria: categoria || '(vacío)',
        precio: precio || '(vacío)',
        raw: columns
      });
      continue;
    }

    menuItems.push({
      id,
      categoria,
      nombre,
      descripcion,
      precio
    });
  }

  console.log(`✅ ${menuItems.length} items válidos cargados de ${lines.length - 1} filas`);
  return organizeByCategory(menuItems);
}

function organizeByCategory(items) {
  const categories = {};

  items.forEach(item => {
    if (!categories[item.categoria]) {
      categories[item.categoria] = [];
    }
    categories[item.categoria].push(item);
  });

  return categories;
}

function formatPrice(price) {
  return `$${price.toLocaleString('es-AR')}`;
}

function detectItemType(nombre, descripcion) {
  let busqueda = (nombre + ' ' + descripcion).toLowerCase();
  
  if (busqueda.includes('x1')) return 'Simple';
  if (busqueda.includes('x2')) return 'Doble';
  if (busqueda.includes('tinto')) return 'Tinto';
  if (busqueda.includes('blanco')) return 'Blanco';

  
  return 'Otros';
}

function groupItemsByType(items) {
  const groups = {};

  items.forEach(item => {
    const type = detectItemType(item.nombre, item.descripcion);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
  });

  return groups;
}

function renderBebidaSpecial(items) {
  const bebidas = {};

  items.forEach(item => {
    const nombre = item.nombre;

    if (!bebidas[nombre]) {
      bebidas[nombre] = [];
    }

    bebidas[nombre].push({
      tamaño: item.descripcion || 'Única',
      precio: item.precio
    });
  });

  let html = '<ul class="menu-items bebida-items">';

  Object.keys(bebidas).forEach(nombreBebida => {
    const tamaños = bebidas[nombreBebida];

    html += '<li class="bebida-item">';
    html += '<div class="item-content">';
    html += `<div class="item-name">${nombreBebida}</div>`;
    html += '<div class="bebida-sizes">';

    tamaños.forEach(t => {
      html += `<span class="bebida-size">${t.tamaño}: ${formatPrice(t.precio)}</span>`;
    });

    html += '</div></div></li>';
  });

  html += '</ul>';
  return html;
}

function renderEmpanadaSpecial(items) {
  let variedades = '';
  let precios = [];

  items.forEach(item => {
    const nombreLower = item.nombre.toLowerCase();

    if (nombreLower.includes('variedad') || nombreLower.includes('sabor')) {
      variedades = item.descripcion || item.nombre;
    } else {
      precios.push({
        tipo: item.nombre,
        precio: item.precio
      });
    }
  });

  const listaVariedades = variedades
    .split(/[,;•]/)
    .map(v => v.trim())
    .filter(v => v.length > 0);

  let html = '<div class="empanada-special">';

  if (listaVariedades.length > 0) {
    html += '<div class="empanada-section">';
    html += '<h3 class="empanada-subtitle">🥟 Variedades:</h3>';
    html += '<ul class="empanada-list">';
    listaVariedades.forEach(variedad => {
      html += `<li>${variedad}</li>`;
    });
    html += '</ul></div>';
  }

  if (precios.length > 0) {
    html += '<div class="empanada-section">';
    html += '<h3 class="empanada-subtitle">💰 Precios:</h3>';
    html += '<div class="empanada-prices">';
    precios.forEach(p => {
      html += `
        <div class="empanada-price-item">
          <span class="empanada-price-label">${p.tipo}</span>
          <span class="empanada-price-value">${formatPrice(p.precio)}</span>
        </div>
      `;
    });
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

function renderGroupedItems(groupedByType) {
  let html = '';

  const typeOrder = ['Simple', 'Doble', 'Triple', 'Tinto', 'Blanco', 'Rosado', 'Espumante', 'Otros'];

  const sortedTypes = Object.keys(groupedByType).sort((a, b) => {
    const indexA = typeOrder.indexOf(a);
    const indexB = typeOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  sortedTypes.forEach(type => {
    const items = groupedByType[type];

    html += `<div class="menu-subtype">`;
    html += `<h3 class="subtype-title">${type}</h3>`;
    html += `<ul class="menu-items">`;

    items.forEach(item => {
      let descReal = item.nombre;
      const typeInName = detectItemType(item.nombre, '');
      if (typeInName !== 'Otros') {
        descReal = item.nombre.replace(new RegExp(typeInName, 'i'), '').trim();
      }

      html += `<li>`;
      html += `<div class="item-content">`;
      html += `<div class="item-name">${descReal}</div>`;
      if (item.descripcion && item.descripcion.toLowerCase() !== type.toLowerCase()) {
        html += `<div class="item-description">(${item.descripcion})</div>`;
      }
      html += `</div>`;
      html += `<span class="item-price">${formatPrice(item.precio)}</span>`;
      html += `</li>`;
    });

    html += `</ul>`;
    html += `</div>`;
  });

  return html;
}

function createCategoryElement(categoryName, items) {
  if (!items || items.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'menu-category empty';
    emptyDiv.innerHTML = `
      <h2>${categoryName}</h2>
      <p style="color: #999; font-style: italic; padding: 1rem;">📭 No hay productos disponibles</p>
    `;
    return emptyDiv;
  }

  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'menu-category';

  const categoryTitle = document.createElement('h2');
  categoryTitle.textContent = categoryName;
  categoryDiv.appendChild(categoryTitle);

  const lowerName = categoryName.toLowerCase();

  if (lowerName.includes('empanada')) {
    categoryDiv.insertAdjacentHTML('beforeend', renderEmpanadaSpecial(items));
    return categoryDiv;
  }

  if (
    lowerName.includes('bebida') ||
    lowerName.includes('cerveza') ||
    lowerName.includes('trago')
  ) {
    categoryDiv.insertAdjacentHTML('beforeend', renderBebidaSpecial(items));
    return categoryDiv;
  }

  if (GROUPED_CATEGORIES.some(cat => lowerName.includes(cat.toLowerCase()))) {
    const groupedByType = groupItemsByType(items);
    categoryDiv.insertAdjacentHTML('beforeend', renderGroupedItems(groupedByType));
    return categoryDiv;
  }

  const itemsList = document.createElement('ul');
  itemsList.className = 'menu-items';

  items.forEach(item => {
    const li = document.createElement('li');

    const leftContent = document.createElement('div');
    leftContent.className = 'item-content';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.textContent = item.nombre;
    leftContent.appendChild(nameDiv);

    if (item.descripcion) {
      const descDiv = document.createElement('div');
      descDiv.className = 'item-description';
      descDiv.textContent = `(${item.descripcion})`;
      leftContent.appendChild(descDiv);
    }

    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = formatPrice(item.precio);

    li.appendChild(leftContent);
    li.appendChild(priceSpan);
    itemsList.appendChild(li);
  });

  categoryDiv.appendChild(itemsList);
  return categoryDiv;
}

// Tiene que re-renderizarse en cada refresco: updateMenuPages vacía las páginas cada
// 2 minutos, así que HTML estático dentro de una página no sobrevive ni un tick.
function renderConfigNote() {
  if (!menuConfig.length) return;

  // page1 queda afuera: ahí el footer flotante está visible y la nota lo pisaría
  for (let i = 2; i <= totalPages; i++) {
    const page = document.getElementById(`page${i}`);
    if (!page) continue;

    const note = document.createElement('div');
    note.className = 'delivery-note';

    // sin sort: el orden es el de las filas de la hoja
    menuConfig.forEach(cfg => {
      const line = document.createElement('p');
      line.className = 'delivery-note-line';
      line.textContent = `${cfg.label} ${formatPrice(cfg.precio)}`;
      note.appendChild(line);
    });

    page.appendChild(note);
  }
}

async function updateMenuPages() {
  console.log('🔄 Actualizando páginas del menú...');

  const menuData = await loadMenuFromSheets();

  if (!menuData || typeof menuData !== 'object' || Object.keys(menuData).length === 0) {
    console.error('❌ No hay datos para renderizar');

    // con un menú ya cargado se conserva; el error visible solo va en el primer arranque,
    // cuando la página activa todavía está vacía.
    const activePage = document.getElementById(`page${currentPage}`);
    if (!activePage || activePage.children.length === 0) {
      renderMenuError('No se pudo cargar el menú. Revisá la conexión o la hoja de Google Sheets.');
    }
    return;
  }

  for (let i = 2; i <= totalPages; i++) {
    const page = document.getElementById(`page${i}`);
    if (page) page.innerHTML = '';
  }

  const groupedPages = {};

  Object.entries(menuData).forEach(([categoryName, items]) => {
    const normalized = normalizeCategoryKey(categoryName);

    let pageId = null;
    for (const [key, id] of Object.entries(CATEGORY_MAP)) {
      if (key.toLowerCase() === normalized) {
        pageId = id;
        break;
      }
    }

    if (!pageId) {
      console.warn(`⚠️ Categoría "${categoryName}" sin página asignada`);
      return;
    }

    if (!groupedPages[pageId]) {
      groupedPages[pageId] = [];
    }

    groupedPages[pageId].push({ name: categoryName, items });
  });

  Object.entries(groupedPages).forEach(([pageId, groups]) => {
    const page = document.getElementById(pageId);
    if (!page) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'menu-section-wrapper';

    const mainTitle = document.createElement('h1');
    mainTitle.className = 'menu-title';

    const categoriesText = groups
      .map(g => g.name)
      .join(' / ');

    const emoji = getEmojiForCategory(groups[0].name);
    mainTitle.textContent = `${emoji}  ${categoriesText}`;
    wrapper.appendChild(mainTitle);

    groups.forEach(group => {
      if (!group.items || group.items.length === 0) {
        console.warn(`⚠️ ${group.name} no tiene items`);
        return;
      }

      console.log(`✅ Renderizando ${group.name} en ${pageId}`);
      wrapper.appendChild(createCategoryElement(group.name, group.items));
    });

    page.appendChild(wrapper);
  });

  // después del clear y del render: antes la nota se borraría o quedaría antes del contenido
  renderConfigNote();

  console.log('✅ Menú actualizado correctamente');
}

function renderMenuError(message) {
  const page = document.getElementById(`page${currentPage}`);
  if (!page) return;
  page.innerHTML = `
    <div class="menu-error">
      <div class="menu-error-icon">⚠️</div>
      <p>${message}</p>
      <p class="menu-error-hint">La carta se actualiza automáticamente cada 2 minutos.</p>
    </div>
  `;
}

function toggleNavigationUI() {
  const bottomNav = document.querySelector('.bottom-navigation');
  const pageIndicator = document.getElementById('pageIndicator');
  const footer = document.querySelector('.footer-min');
  
  if (currentPage === 1) {
    if (bottomNav) bottomNav.style.display = 'none';
    if (pageIndicator) pageIndicator.style.display = 'none';
    if (footer) footer.style.display = 'flex';
  } else {
    if (bottomNav) bottomNav.style.display = 'flex';
    if (pageIndicator) pageIndicator.style.display = 'flex';
    if (footer) footer.style.display = 'none';
  }
}


function createPageIndicators() {
  const indicator = document.getElementById('pageIndicator');
  for (let i = 1; i <= totalPages; i++) {
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 1 ? ' active' : '');
    indicator.appendChild(dot); // sin listener a propósito: es indicación visual, no navegación
  }
}


document.getElementById('nextPage').addEventListener('click', () => changePage(1));
document.getElementById('prevPage').addEventListener('click', () => changePage(-1));


function changePage(direction) {
  const oldPage = document.getElementById(`page${currentPage}`);
  oldPage.classList.add('exiting');

  setTimeout(() => {
    oldPage.classList.remove('active', 'exiting');
  }, 300);

  currentPage += direction;
  if (currentPage > totalPages) currentPage = 1;
  if (currentPage < 1) currentPage = totalPages;

  const newPage = document.getElementById(`page${currentPage}`);
  newPage.classList.add('active');
  updateIndicator();

  toggleNavigationUI();
}

function goToPage(pageNum) {
  if (pageNum === currentPage) return;

  const oldPage = document.getElementById(`page${currentPage}`);
  oldPage.classList.remove('active');

  currentPage = pageNum;

  const newPage = document.getElementById(`page${currentPage}`);
  newPage.classList.add('active');
  updateIndicator();
}

function updateIndicator() {
  const dots = document.querySelectorAll('.page-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage - 1);
  });

  toggleNavigationUI(); 
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando Dreams Resto Bar...');

  const spinner = document.getElementById('loadingSpinner');
  createPageIndicators();

  toggleNavigationUI();

  await updateMenuPages();

  spinner?.classList.add('hidden');

  setInterval(() => {
    console.log('🔄 Actualización automática...');
    updateMenuPages();
  }, 2 * 60 * 1000);

  console.log('✅ Sistema iniciado correctamente');
});