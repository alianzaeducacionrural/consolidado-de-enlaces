# Backend — Google Sheets + Apps Script

Hoja: **Consolidado de enlaces — Backend**
(carpeta *Dashboard enlaces* en Drive)
`https://docs.google.com/spreadsheets/d/1rFCR82JNjUu0yicoqfzOzsZ5g42xPk61VSgbgUEBIno/edit`

Script (adjunto a la hoja):
`https://script.google.com/d/1TfGi5AVD6mxPmmPup30jwvrgJTZdyB8jLaqZ2sdTw0NPr8vNYiGRtw0R/edit`

La hoja **empieza vacía**. `ensureSheets_()` crea, solo con encabezados, las
pestañas:

| Pestaña | Columnas |
|---|---|
| `Herramientas` | id, nombre, descripcion, categoria, estado, destacado, tags, repo, enlaces |
| `Categorias` | categoria |
| `Credenciales` | id, cuentas |

`enlaces` y `cuentas` se guardan como texto JSON.

## Activar (una sola vez, desde el navegador)

1. Abre la hoja → menú **Extensiones ▸ Apps Script**.
2. Ejecuta la función **`inicializar`**. Acepta los permisos.
   En **Registros de ejecución** aparece el **token** de la API — cópialo.
3. **Implementar ▸ Nueva implementación** ▸ tipo **Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier usuario**
   - Implementar. Copia la **URL** que termina en `/exec`.
4. En el repo, edita **`assets/config.js`** con esa URL y el token, y haz commit.

## API

`GET  /exec?token=…`  → `{ ok, herramientas[], categorias[], credenciales[], actualizado }`

`POST /exec`  (cuerpo JSON, `Content-Type: text/plain`)
`{ token, accion, … }` con `accion` =
`guardarHerramientas` | `guardarCategorias` | `guardarCredenciales` | `reset`

## Editar el código

```
cd gas
clasp push
clasp create-deployment          # o: clasp redeploy <deploymentId>
```
(requiere `clasp login` con la cuenta dueña de la hoja).
