# 🍸 Dreams Resto Bar — Carta Digital Interactiva v.1

Una **carta digital moderna y dinámica** para bares y restaurantes.  
Permite mostrar el menú en una pantalla, tablet o televisor y mantenerlo **siempre actualizado** de forma simple desde una hoja de **Google Sheets**, sin necesidad de tocar el código. 💻📱

---

## ✨ Descripción General

**Dreams Resto Bar — Carta Digital** es un sistema pensado para que cualquier miembro del personal pueda mantener actualizada la carta del local con facilidad.  
A través de una hoja de cálculo en la nube (Google Sheets), los productos, precios y descripciones se actualizan **automáticamente** en la web.

Esto permite tener una carta **viva, moderna y sin complicaciones técnicas**, ideal para entornos reales de trabajo gastronómico.

---

## 🍽️ Funcionalidades Principales

- 🧾 **Visualización por categorías:** organiza los productos en secciones (Entradas, Principales, Pizzas, Pastas, Bebidas, Postres, etc.).
- 🔄 **Actualización automática:** los datos se cargan desde un archivo CSV vinculado a Google Sheets.
- 📱 **Diseño responsivo:** se adapta perfectamente a pantallas táctiles, tablets o televisores.
- ⚡ **Rendimiento fluido:** navegación rápida entre páginas sin recargar el sitio.
- 🧠 **Sin backend:** toda la lógica corre en el navegador, sin servidores ni configuraciones adicionales.
- 🧰 **Fácil personalización:** colores, tipografías y disposición visual se pueden ajustar desde los archivos base (`index.html`, `styles.css`, `scripts.js`).

---

## 🛠️ Cómo Funciona

1. **Publica tu hoja de Google Sheets como CSV.**  
   _(Archivo → Publicar en la web → Formato CSV)_

2. **Vincula la URL pública** en `scripts.js`.  
   El sistema leerá automáticamente las filas con los siguientes campos:
id | categoria | nombre | descripcion | precio_chico | precio_grande

yaml
Copy code

3. **Carga la página (`index.html`)** en cualquier navegador.  
En segundos tendrás tu carta actualizada y lista para mostrar.

---

## 🧠 Filosofía del Proyecto

El objetivo de **la carta digital** es brindar una herramienta **simple, intuitiva y funcional** para los restaurantes que buscan digitalizar su carta sin depender de desarrolladores.  
Está pensada para que el personal pueda realizar cambios por sí mismo y mantener siempre actualizada la información que el cliente ve.

---

## 👨‍💻 Autor

**Agustín Ramírez**  
📧 [agustin06ramirez@gmail.com](mailto:agustin06ramirez@gmail.com)  
💬 Estudiante analista de sistemas  

---