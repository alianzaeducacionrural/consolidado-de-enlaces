# Consolidado de enlaces

Página estática para encontrar rápido **todas las herramientas** de la Alianza
Educación Rural (cuenta de GitHub
[`alianzaeducacionrural`](https://github.com/alianzaeducacionrural)) y abrir el
formulario o el panel de administración de cada una, sin perderse entre repos.

- Cada herramienta puede tener **varios enlaces** (formulario público, panel de
  administración, reportes…), cada uno con su etiqueta y color.
- Un espacio para **anotar usuarios y contraseñas** de cada herramienta, que se
  guardan **solo en tu navegador** (`localStorage`) — nunca se suben a GitHub.
- Búsqueda, filtros por categoría, modo claro/oscuro.
- Sin servidor: se publica en **GitHub Pages**.

## Cómo verla

- **En línea**: https://alianzaeducacionrural.github.io/consolidado-de-enlaces/
- **En local**: abre `index.html` con un servidor estático, p. ej.
  `python -m http.server` y entra a `http://localhost:8000`.
  (Abrirlo con doble clic como `file://` no carga `data/tools.json`.)

## Editar la lista de herramientas

Dos opciones:

1. **Desde la página**: botón **✎ Catálogo** → edita nombre, descripción,
   categoría, emoji y enlaces → **Descargar tools.json** → reemplaza
   `data/tools.json` en el repo y haz `git commit` + `git push`.
2. **A mano**: edita `data/tools.json`. Cada herramienta:

```json
{
  "id": "encuestaucampo",
  "nombre": "Percepciones Estudiantiles — U. en el Campo",
  "descripcion": "Para qué sirve…",
  "categoria": "Encuestas",
  "emoji": "📊",
  "estado": "activo",
  "destacado": false,
  "tags": ["encuesta"],
  "repo": "https://github.com/alianzaeducacionrural/encuestaucampo",
  "enlaces": [
    { "etiqueta": "Formulario", "url": "https://…", "tipo": "formulario" },
    { "etiqueta": "Panel admin", "url": "https://…/admin", "tipo": "admin" }
  ]
}
```

`tipo` puede ser: `publico`, `formulario`, `panel`, `admin`, `otro`.
El orden de las categorías está en `categorias` (arriba del mismo archivo).

> La página también consulta la API de GitHub al cargar y muestra los repos
> nuevos que todavía no estén en `tools.json`, marcados como *"Por clasificar"*.

## Usuarios y contraseñas

- Se guardan en el navegador (`localStorage`), **por dispositivo**. No se
  sincronizan y no se suben a ningún lado.
- Botón **🔑 Claves** (arriba) → **Exportar** genera un archivo para pasarlo a
  otro equipo; ahí usas **Importar**. Ese archivo tiene las contraseñas en texto
  plano: guárdalo con cuidado y bórralo cuando termines. Está en `.gitignore`.
- ⚠️ Cualquiera que use ese navegador puede ver las claves. Úsalo en tu equipo
  personal.

## Publicar en GitHub Pages

Settings → Pages → **Source: Deploy from a branch** → rama `main`, carpeta `/`
(root). Listo, sin build.

## Estructura

```
index.html          la página
assets/styles.css    estilos
assets/app.js        lógica (render, búsqueda, claves, editor)
data/tools.json      catálogo de herramientas y enlaces
```
