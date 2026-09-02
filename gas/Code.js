/**
 * Consolidado de enlaces — Backend (Google Apps Script)
 * Hoja adjunta: "Consolidado de enlaces — Backend".
 *
 * Expone una Web App (doGet / doPost) que lee y escribe el catálogo de
 * herramientas. Todo empieza VACÍO: las pestañas se crean solo con encabezados.
 *
 * Publicar:  clasp push  →  clasp create-deployment
 * Inicializar y ver el token:  ejecuta inicializar() desde el editor.
 */

var TABLAS = {
  herramientas: {
    tab: 'Herramientas',
    cols: ['id', 'nombre', 'descripcion', 'categoria', 'estado', 'destacado', 'tags', 'repo', 'enlaces'],
  },
  categorias: {
    tab: 'Categorias',
    cols: ['categoria'],
  },
  credenciales: {
    tab: 'Credenciales',
    cols: ['id', 'cuentas'],
  },
};

function ss_() {
  return SpreadsheetApp.getActive();
}

function ensureSheets_() {
  var ss = ss_();
  Object.keys(TABLAS).forEach(function (k) {
    var cfg = TABLAS[k];
    var sh = ss.getSheetByName(cfg.tab);
    if (!sh) sh = ss.insertSheet(cfg.tab);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, cfg.cols.length).setValues([cfg.cols]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
  // borra la pestaña por defecto vacía si sobra
  ['Sheet1', 'Hoja 1', 'Hoja1'].forEach(function (n) {
    var d = ss.getSheetByName(n);
    if (d && ss.getSheets().length > 1 && d.getLastRow() === 0) ss.deleteSheet(d);
  });
}

function token_() {
  return PropertiesService.getScriptProperties().getProperty('API_TOKEN') || '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function leer_(key) {
  var cfg = TABLAS[key];
  var sh = ss_().getSheetByName(cfg.tab);
  if (!sh || sh.getLastRow() < 2) return [];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, cfg.cols.length).getValues();
  return rows
    .filter(function (r) { return String(r[0]).trim() !== ''; })
    .map(function (r) {
      var o = {};
      cfg.cols.forEach(function (c, i) { o[c] = r[i]; });
      return o;
    });
}

function escribir_(key, records) {
  var cfg = TABLAS[key];
  var sh = ss_().getSheetByName(cfg.tab);
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, cfg.cols.length).clearContent();
  }
  if (records && records.length) {
    var values = records.map(function (rec) {
      return cfg.cols.map(function (c) { return rec[c] == null ? '' : rec[c]; });
    });
    sh.getRange(2, 1, values.length, cfg.cols.length).setValues(values);
  }
}

/* ---------- serialización ---------- */
function serH_(h) {
  return {
    id: h.id,
    nombre: h.nombre || '',
    descripcion: h.descripcion || '',
    categoria: h.categoria || '',
    estado: h.estado || 'activo',
    destacado: h.destacado ? 'sí' : '',
    tags: (h.tags || []).join(', '),
    repo: h.repo || '',
    enlaces: JSON.stringify(h.enlaces || []),
  };
}
function desH_(r) {
  var enlaces = [];
  try { enlaces = JSON.parse(r.enlaces || '[]'); } catch (e) {}
  return {
    id: String(r.id),
    nombre: String(r.nombre || ''),
    descripcion: String(r.descripcion || ''),
    categoria: String(r.categoria || ''),
    estado: String(r.estado || 'activo'),
    destacado: /^(s[ií]|true|1|x)$/i.test(String(r.destacado).trim()),
    tags: String(r.tags || '').split(',').map(function (s) { return s.trim(); }).filter(String),
    repo: String(r.repo || ''),
    enlaces: Array.isArray(enlaces) ? enlaces : [],
  };
}
function serC_(c) {
  return { id: c.id, cuentas: JSON.stringify(c.cuentas || []) };
}
function desC_(r) {
  var cuentas = [];
  try { cuentas = JSON.parse(r.cuentas || '[]'); } catch (e) {}
  return { id: String(r.id), cuentas: Array.isArray(cuentas) ? cuentas : [] };
}

/* ---------- endpoints ---------- */
function doGet(e) {
  ensureSheets_();
  var p = (e && e.parameter) || {};
  var t = token_();
  if (t && p.token !== t) return json_({ ok: false, error: 'token' });
  return json_({
    ok: true,
    herramientas: leer_('herramientas').map(desH_),
    categorias: leer_('categorias').map(function (r) { return String(r.categoria).trim(); }).filter(String),
    credenciales: leer_('credenciales').map(desC_),
    actualizado: new Date().toISOString(),
  });
}

function doPost(e) {
  ensureSheets_();
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {
    return json_({ ok: false, error: 'json' });
  }
  var t = token_();
  if (t && body.token !== t) return json_({ ok: false, error: 'token' });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (body.accion) {
      case 'guardarHerramientas':
        escribir_('herramientas', (body.herramientas || []).map(serH_));
        break;
      case 'guardarCategorias':
        escribir_('categorias', (body.categorias || []).map(function (c) { return { categoria: c }; }));
        break;
      case 'guardarCredenciales':
        escribir_('credenciales', (body.credenciales || []).map(serC_));
        break;
      case 'reset':
        escribir_('herramientas', []);
        escribir_('categorias', []);
        escribir_('credenciales', []);
        break;
      default:
        return json_({ ok: false, error: 'accion' });
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- ejecutar una vez desde el editor ---------- */
function inicializar() {
  ensureSheets_();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('API_TOKEN')) {
    props.setProperty('API_TOKEN', Utilities.getUuid().replace(/-/g, ''));
  }
  Logger.log('Hoja lista. Token de la API: ' + props.getProperty('API_TOKEN'));
}
