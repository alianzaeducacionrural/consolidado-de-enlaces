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
  url: "",
  token: "",

  // Guardar también las contraseñas en la hoja (pestaña "Credenciales").
  // Déjalo en false salvo que el acceso a la hoja esté bien restringido:
  // con la app web "para cualquier usuario", quien tenga la URL las vería.
  sincronizarClaves: false,
};
