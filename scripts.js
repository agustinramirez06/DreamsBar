// ===== CONFIGURACIÓN =====
let currentPage = 1;
const totalPages = 16;

// 🔧 URL DEL CSV
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvEfoAlfrXcSukJICzx9icJU9VWMQI4gHnAjNIV9Y28KtBCWo89XJabccW9b2NljJZRiWJ4cP0aAJh/pub?output=csv';

// 🔧 MAPEO DE CATEGORÍAS A PÁGINAS (CENTRALIZADO)
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
  'Sandwiches': 'page10',
  'Postres': 'page11',
  'Helados': 'page11',
  'Bebida Sin Alcohol': 'page12',
  'Alcohol': 'page12',
  'Vinos': 'page13',
  'Cervezas': 'page14',
  'Tragos': 'page15',
  'Menú Infantil': 'page16',
  'Infantil': 'page16'
};

// ===== CARGAR DATOS DESDE GOOGLE SHEETS =====
async function loadMenuFromSheets() {
  try {
    console.log('📥 Cargando menú desde Google Sheets...');

    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const menuData = parseCSV(csvText);

    console.log('✅ Menú cargado:', menuData);
    return menuData;

  } catch (error) {
    console.error('❌ Error al cargar menú:', error);
    return getExampleData();
  }
}

// ===== CONVERTIR CSV A JAVASCRIPT (PARSER ROBUSTO) =====
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const menuItems = [];

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

    // ✅ VALIDACIÓN MEJORADA
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

// ===== ORGANIZAR POR CATEGORÍA =====
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

// ===== FORMATEAR PRECIO =====
function formatPrice(price) {
  return `$${price.toLocaleString('es-AR')}`;
}

// ===== DISEÑO ESPECIAL PARA BEBIDAS =====
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

// ===== DISEÑO ESPECIAL PARA EMPANADAS =====
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

// ===== CREAR ELEMENTO DE CATEGORÍA (SIN TÍTULO GLOBAL) =====
function createCategoryElement(categoryName, items) {
  // ✅ VALIDAR ITEMS VACÍOS
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

  // ✅ DETECTAR TIPO DE RENDERIZADO
  const lowerName = categoryName.toLowerCase();

  if (lowerName.includes('empanada')) {
    categoryDiv.insertAdjacentHTML('beforeend', renderEmpanadaSpecial(items));
    return categoryDiv;
  }

  if (
    lowerName.includes('bebida') ||
    lowerName.includes('vino') ||
    lowerName.includes('cerveza') ||
    lowerName.includes('trago')
  ) {
    categoryDiv.insertAdjacentHTML('beforeend', renderBebidaSpecial(items));
    return categoryDiv;
  }

  // ===== DISEÑO NORMAL =====
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

// ===== ACTUALIZAR MENÚ (UN SOLO TÍTULO POR PÁGINA, AGRUPA SECCIONES) =====
async function updateMenuPages() {
  console.log('🔄 Actualizando páginas del menú...');

  const menuData = await loadMenuFromSheets();

  // ✅ VALIDAR DATOS
  if (!menuData || typeof menuData !== 'object' || Object.keys(menuData).length === 0) {
    console.error('❌ No hay datos para renderizar');
    return;
  }

  // ✅ LIMPIAR TODAS LAS PÁGINAS PRIMERO
  for (let i = 2; i <= totalPages; i++) {
    const page = document.getElementById(`page${i}`);
    if (page) page.innerHTML = '';
  }

  // ===== AGRUPAR CATEGORÍAS POR PÁGINA =====
  const groupedPages = {};

  Object.entries(menuData).forEach(([categoryName, items]) => {
    const normalized = categoryName.trim().toLowerCase();

    // ✅ BÚSQUEDA MEJORADA: sin depender de mayúsculas
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

  // ===== RENDERIZAR PÁGINAS CON UN SOLO TÍTULO =====
  Object.entries(groupedPages).forEach(([pageId, groups]) => {
    const page = document.getElementById(pageId);
    if (!page) return;

    // ✅ CREAR WRAPPER CON UN ÚNICO TÍTULO POR PÁGINA
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-section-wrapper';

    const mainTitle = document.createElement('h1');
    mainTitle.className = 'menu-title';

    // ✅ CONSTRUCCIÓN DINÁMMICA DEL TÍTULO
    const categoriesText = groups
      .map(g => g.name)
      .join(' / ');

    mainTitle.textContent = `MENÚ — ${categoriesText}`;
    wrapper.appendChild(mainTitle);

    // ===== AGREGAR CADA CATEGORÍA COMO SUBCATEGORÍA =====
    groups.forEach(group => {
      // ✅ VALIDAR ANTES DE RENDERIZAR
      if (!group.items || group.items.length === 0) {
        console.warn(`⚠️ ${group.name} no tiene items`);
        return;
      }

      console.log(`✅ Renderizando ${group.name} en ${pageId}`);
      wrapper.appendChild(createCategoryElement(group.name, group.items));
    });

    page.appendChild(wrapper);
  });

  console.log('✅ Menú actualizado correctamente');
}

// ===== DATOS DE EJEMPLO (FALLBACK) =====
function getExampleData() {
  return {
    'Entradas': [
      { id: 1, categoria: 'Entradas', nombre: 'Bastones de Pollo', precio: 5000, descripcion: '' },
      { id: 2, categoria: 'Entradas', nombre: 'Nuggets', precio: 5000, descripcion: '' }
    ]
  };
}

// ===== NAVEGACIÓN =====
function createPageIndicators() {
  const indicator = document.getElementById('pageIndicator');
  for (let i = 1; i <= totalPages; i++) {
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 1 ? ' active' : '');
    dot.addEventListener('click', () => goToPage(i));
    indicator.appendChild(dot);
  }
}

document.getElementById('nextPage').addEventListener('click', () => changePage(1));
document.getElementById('prevPage').addEventListener('click', () => changePage(-1));

let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.pages').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.querySelector('.pages').addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) changePage(1);
  if (touchEndX > touchStartX + 50) changePage(-1);
}

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
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando Dreams Resto Bar...');

  const spinner = document.getElementById('loadingSpinner');
  createPageIndicators();

  await updateMenuPages();

  spinner?.classList.add('hidden');

  setInterval(() => {
    console.log('🔄 Actualización automática...');
    updateMenuPages();
  }, 2 * 60 * 1000);

  console.log('✅ Sistema iniciado correctamente');
});