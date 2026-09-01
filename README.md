# Consolidado de enlaces

Dashboard único para encontrar rápido **todas las herramientas** del equipo
(cuenta de GitHub [`alianzaeducacionrural`](https://github.com/alianzaeducacionrural))
y sus despliegues, sin perderse entre repos.

- **Híbrido**: trae los repos automáticamente desde la API de GitHub y tú los
  enriqueces (enlaces, descripción, categoría, ícono) desde un panel o un archivo.
- **Varios enlaces por herramienta**: formulario público, panel de administración,
  reportes, etc. — cada uno con su etiqueta y tipo.
- **Nada se pierde**: un repo que no clasifiques igual aparece, marcado como
  _"Por clasificar"_.
- **Usuarios y contraseñas por herramienta**: se editan desde el panel y se
  guardan fuera del repositorio (`data/accounts.local.json` o variable
  `ACCOUNTS_JSON`). Solo se ven tras iniciar sesión.
- Búsqueda, filtros por categoría, modo claro/oscuro, diseño responsive.

---

## 1. Correr en local

```bash
npm install
cp .env.example .env.local     # edita los valores (SITE_PASSWORD ya trae uno de ejemplo)
npm run dev                    # http://localhost:3000
```

## 2. Editar herramientas desde el panel

1. Define `SITE_PASSWORD` en `.env.local` (viene con `cafe2026` de ejemplo — cámbialo).
2. Entra a **http://localhost:3000/panel** e inicia sesión.
3. Elige una herramienta y edita nombre, descripción, categoría, emoji, estado,
   etiquetas, **enlaces** (con tipo: público / formulario / panel / administración)
   y **usuarios/contraseñas**.
4. **Guardar cambios**:
   - En local escribe directamente `data/overrides.json` y
     `data/accounts.local.json`.
   - En Vercel el disco es de solo lectura: usa los botones **↓ overrides.json** y
     **↓ accounts.local.json**, sube el primero al repo (commit) y el segundo a la
     variable de entorno `ACCOUNTS_JSON`.

## 3. Editar herramientas a mano (sin panel)

Edita **`data/overrides.json`**. La clave de cada entrada es el nombre exacto del
repo en GitHub:

```json
"seguimiento-egresados": {
  "nombre": "Seguimiento a Egresados",
  "descripcion": "Para qué sirve la herramienta…",
  "categoria": "Seguimiento",
  "emoji": "🧭",
  "estado": "activo",
  "destacado": true,
  "enlaces": [
    { "etiqueta": "Formulario", "url": "https://…", "tipo": "formulario" },
    { "etiqueta": "Panel admin", "url": "https://…/admin", "tipo": "admin" }
  ]
}
```

El orden de las categorías está en `meta.ordenCategorias` del mismo archivo.

> Si en cada repo de GitHub defines el campo **"Website"**, el dashboard toma esa
> URL automáticamente aunque no esté en `overrides.json`.

## 4. Usuarios / contraseñas

- Se guardan como **texto plano** en `data/accounts.local.json` (está en
  `.gitignore`, no se sube) o en la variable `ACCOUNTS_JSON`.
- ⚠️ **No subas `accounts.local.json` a un repositorio público.** Si el repo de
  este dashboard es público, usa solo la variable `ACCOUNTS_JSON` en Vercel.
- Formato: ver `data/accounts.example.json`.

## 5. Variables de entorno

| Variable        | Obligatoria | Para qué sirve |
|-----------------|-------------|----------------|
| `GITHUB_OWNER`  | sí          | Usuario/organización de GitHub a listar |
| `GITHUB_TOKEN`  | no          | Sube el límite de la API y permite ver repos privados |
| `SITE_PASSWORD` | sí para el panel | Protege el dashboard y habilita `/panel` |
| `ACCOUNTS_JSON` | no          | Usuarios/contraseñas por herramienta (JSON) |
| `OVERRIDES_JSON`| no          | Enriquecimiento por variable en vez de `data/overrides.json` |

## 6. Desplegar en Vercel

1. Sube este proyecto a un repo de GitHub.
2. En Vercel: **Add New → Project** → importa el repo (framework Next.js, detección automática).
3. Agrega las variables de entorno de la tabla anterior.
4. Deploy. La lista de repos se refresca sola cada hora.

## Estructura

```
app/                dashboard, /login, /panel y rutas API
components/          Dashboard, ToolModal, LoginForm, PanelEditor
lib/                github.ts · store.ts (leer/escribir) · tools.ts (merge) · auth/session
data/overrides.json enlaces, descripciones y categorías (en el repo)
data/accounts.local.json  usuarios/contraseñas (FUERA de Git)
proxy.ts            protección por contraseña (Next 16)
```
