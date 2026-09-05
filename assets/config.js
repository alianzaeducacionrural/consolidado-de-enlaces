/* ─────────────────────────────────────────────────────────────
   Backend opcional — Google Sheets vía Google Apps Script
   ─────────────────────────────────────────────────────────────
   Si `url` está vacío, la app funciona solo con data/tools.json
   y el almacenamiento del navegador (como hasta ahora).

   Para conectar la hoja "Consolidado de enlaces — Backend":
     1. Abre el editor de Apps Script (menú Extensiones > Apps Script
        en la hoja) y ejecuta la función inicializar() una vez.
        Acepta los permisos que pide.
     2. Ve a "Registros de ejecución" y copia el token que imprime.
     3. En el editor: Implementar > Nueva implementación >
        tipo "Aplicación web" > Ejecutar como: tú >
        Quién tiene acceso: "Cualquier usuario". Publica.
     4. Copia la URL que termina en /exec y pégala abajo, junto
        con el token. Sube este archivo al repositorio.
   ───────────────────────────────────────────────────────────── */
window.CDE_BACKEND = {
  url: "https://script.google.com/macros/s/AKfycbx4HkzVEmuf_sdIK9l0HqbYYqfhMDkb8MjKLJu3QHw5paa9jOt63AgqSkxnDIbeSzl-/exec",
  token: "610d45cb7ffa490c89ac43f56c07e926",
};

window.CDE_OPCIONES = {
  // Mostrar automáticamente los repos de GitHub que no estén en el catálogo,
  // como "Por clasificar". En false solo se ve lo que agregues a mano.
  descubrirGitHub: false,
};

// Clave para entrar al sitio. Se pide una vez por navegador.
// Cámbialas aquí cuando quieras rotarlas (súbelo al repositorio después).
window.CDE_ACCESO = {
  clave: "admin2026*",
  // Clave adicional para VER las claves guardadas de cada herramienta.
  // Se pide una vez por pestaña del navegador (se olvida al cerrarla).
  claveCredenciales: "alejo0514*",
};
