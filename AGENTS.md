# 🧠 AGENTS.md

## 🍽️ Sistema de Carta Digital Interactiva - *Dreams Resto Bar*

---

### 🏷️ Descripción General

Este proyecto es un **sistema de carta digital interactiva** desarrollado por **Agustín Ramírez**, diseñado para locales gastronómicos como *Dreams Resto Bar* que buscan ofrecer una experiencia moderna, visualmente atractiva y editable sin conocimientos técnicos.

El sistema **no requiere backend complejo**: funciona totalmente en el navegador y obtiene la información del menú desde **una hoja de Google Sheets**, lo que permite que el personal no técnico pueda **actualizar precios y productos fácilmente**.

---

### ⚙️ Componentes Principales

El sistema está estructurado en tres archivos base principales:

1. **`index.html`**
   - Define la estructura general de la carta digital.
   - Contiene las secciones del menú organizadas por categorías (Entradas, Principales, Pastas, Pizzas, etc.).
   - Utiliza `div` o `section` con identificadores (`#page1`, `#page2`, etc.) para simular páginas dentro de un mismo documento.

2. **`styles.css`**
   - Controla la presentación visual completa.
   - Define tipografía, colores, fondos, márgenes, paddings y efectos responsivos.
   - Replica el diseño de la carta física, incluyendo textura, separadores decorativos y jerarquía visual clara.

3. **`scripts.js`**
   - Maneja la **lógica dinámica** del sistema:
     - Conexión con Google Sheets o archivo local JSON/CSV.
     - Lectura y agrupación de los productos por categoría.
     - Renderizado automático de cada producto dentro de su categoría.
     - Navegación fluida entre páginas sin recargar el sitio.

4- **`csv publico de mi sheet`**
https://docs.google.com/spreadsheets/d/e/2PACX-1vSvEfoAlfrXcSukJICzx9icJU9VWMQI4gHnAjNIV9Y28KtBCWo89XJabccW9b2NljJZRiWJ4cP0aAJh/pub?output=csv

---

### 🧩 Estructura del Proyecto

```bash
/carta-dreams/
 ├── index.html
 ├── styles.css
 ├── scripts.js
 ├── /img/
 │    ├── logo.png
 │    ├── fondo-textura.jpg
 │    ├── decorador-superior.png
 │    ├── decorador-inferior.png
 │    └── ...
 └── /fonts/ (opcional)
 ```

🧠 Funcionamiento Interno
El sistema obtiene los datos desde una fuente externa (Google Sheets).

Los datos se estructuran con el formato:

js
{
  id: 1,
  categoria: "Entradas",
  nombre: "Bastones De Pollo",
  descripcion: "",
  precios: { unico: 5000 }
}
En el caso de productos con tamaños:

js
{
  id: 83,
  categoria: "Bebida Sin Alcohol",
  nombre: "Coca-Cola",
  descripcion: "",
  precios: { chica: 2500, grande: 4500 }
}
La función principal de scripts.js procesa los datos y los agrupa por categoría, usando un mapeo de páginas como:

js
Copy code
const categoryToPage = {
  "Entradas": "page2",
  "Principales": "page3",
  ...
};
Los productos se renderizan dinámicamente en la sección correspondiente, siguiendo un formato plano similar al diseño físico:

css
Copy code
Nombre del producto              Precio
La navegación entre páginas es interna, sin recargar el sitio.

🎨 Estilo Visual
El diseño está inspirado en la carta física original de Dreams Resto Bar.
Sus principales características visuales son:

Fondo con textura o degradado oscuro.

Tipografía elegante y legible (ej. Playfair Display, Merriweather).

Detalles dorados o beige para títulos, separadores y precios.

Estructura centrada, simétrica y clara.

Diseño responsive, optimizado para dispositivos móviles y tablets.

🧭 Modalidad de Trabajo para los Agentes
Cualquier agente que asista en este proyecto debe respetar la siguiente modalidad:

Mantener la estructura actual del sistema.
No utilizar frameworks externos (React, Vue, Angular) salvo solicitud explícita.
Trabajar siempre con HTML, CSS y JavaScript puro.

Respetar la integración con Google Sheets.

Usar el mismo formato de datos (id, categoria, nombre, descripcion, precio).

Los cambios deben ser no destructivos.

Facilitar la edición simple.

El usuario final debe poder editar precios y descripciones desde Google Sheets o un archivo CSV/JSON plano.

No se deben requerir conocimientos técnicos.

Mantener la coherencia visual.

Replicar el diseño físico del menú (basado en imágenes JPG de referencia).

No alterar tipografía, márgenes ni disposición general sin justificación funcional.

Código modular y comentado.

Separar claramente la lógica en funciones reutilizables.

Comentar cada sección para facilitar futuras modificaciones.

Verificación local antes de publicar.

Probar en entorno local (Live Server o navegador).

Validar comportamiento en mobile y desktop.

🎯 Objetivo General
Ofrecer una carta digital moderna, elegante y totalmente editable, que refleje la identidad de Dreams Resto Bar y pueda ser utilizada por cualquier restaurante o bar sin necesidad de conocimientos técnicos.

