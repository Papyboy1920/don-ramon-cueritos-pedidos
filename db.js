// ============================================================
// Don Ramón Pedidos — capa de base de datos
// Dos backends: Postgres (si existe DATABASE_URL) o SQLite
// local (node:sqlite, sin dependencias nativas) como respaldo.
// Toda la app usa esta API async; server.js no toca SQL directo.
// ============================================================

const path = require("path");
const { SEED_CATALOG, CATALOG_VERSION } = require("./seed");

let kind = null;   // "pg" | "sqlite"
let pool = null;   // pg Pool
let sdb = null;    // node:sqlite DatabaseSync

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    items TEXT NOT NULL,
    customer TEXT NOT NULL,
    payment TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'nuevo',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`;

const PG_SCHEMA = `
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    items TEXT NOT NULL,
    customer TEXT NOT NULL,
    payment TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`;

// ---------- Fusión de catálogo (nunca destructiva) ----------
// Fusiona la semilla con el catálogo vivo SIN borrar ni sobrescribir
// lo que el dueño editó en /tienda:
// - Conserva intactos los departamentos/categorías/ítems agregados por el dueño.
// - Agrega los departamentos/categorías/ítems nuevos que trae la semilla.
// - Rellena solo campos vacíos (desc, img) desde la semilla.
// - Jamás toca name, price, unit, active ni ningún valor que ya exista.
function mergeCatalog(live, seed) {
  const base =
    live && Array.isArray(live.departments)
      ? JSON.parse(JSON.stringify(live))
      : { departments: [] };
  if (!Array.isArray(base.departments)) base.departments = [];
  let added = 0;
  let filled = 0;
  const byId = (arr, id) => (arr || []).find((x) => x && x.id === id);
  for (const sDept of (seed && seed.departments) || []) {
    let d = byId(base.departments, sDept.id);
    if (!d) {
      base.departments.push(JSON.parse(JSON.stringify(sDept)));
      added++;
      continue;
    }
    d.categories = d.categories || [];
    for (const sCat of sDept.categories || []) {
      let c = byId(d.categories, sCat.id);
      if (!c) {
        d.categories.push(JSON.parse(JSON.stringify(sCat)));
        added++;
        continue;
      }
      c.items = c.items || [];
      for (const sItem of sCat.items || []) {
        const it = byId(c.items, sItem.id);
        if (!it) {
          c.items.push(JSON.parse(JSON.stringify(sItem)));
          added++;
        } else {
          for (const f of ["desc", "img"]) {
            if ((it[f] === undefined || it[f] === null || it[f] === "") && sItem[f]) {
              it[f] = sItem[f];
              filled++;
            }
          }
        }
      }
    }
  }
  return { catalog: base, added, filled };
}

// ---------- Correcciones puntuales de fotos (v1 → v2 → v3 → v4 → v5 → v6) ----------
// Solo se aplican si el valor actual es EXACTAMENTE el viejo de la semilla.
// Jamás tocan lo que el dueño haya cambiado en /tienda. Idempotentes.
// Cada item puede tener una cadena de pasos; se aplican en orden hasta estabilizar.
// v6 (26-sep-2026): Portal mandó 3 fotos detalle nuevas de los combos y pidió que
// cada producto muestre su foto correcta — los combos 1/4/5 dejan el genérico
// combo-cuerito.jpg por sus héroes, y los 3 cueritos solos reciben close-ups
// limpios sin texto del flyer (autorizado explícitamente por Portal).
const IMAGE_FIXES = {
  "combo-1": [["cross-gris.jpg", "cuerito-entero.jpg"], ["combo-cuerito.jpg", "combo1-hero.jpg"]],
  "combo-2": [["bandeja-1.jpg", "tray-real-1.jpg"], ["tray-real-1.jpg", "pernil-flyer.jpg"], ["pernil-flyer.jpg", "pernil-real.jpg"]],
  "combo-3": [["bandeja-2.jpg", "pollo-asado.jpg"], ["pollo-asado.jpg", "pollo-piezas.jpg"]],
  "combo-4": [["cross-cordonbleu.jpg", "tray-real-2.jpg"], ["combo-cuerito.jpg", "combo4-hero.jpg"]],
  "combo-5": [["cross-amarillo.jpg", "bandeja-1.jpg"], ["combo-cuerito.jpg", "combo5-hero.jpg"]],
  "cuerito-congri": [["cross-gris.jpg", "relleno-largo-1.jpg"], ["relleno-largo-1.jpg", "relleno-congri.jpg"], ["relleno-congri.jpg", "cuerito-moro.jpg"], ["cuerito-moro.jpg", "cuerito-moro-close.jpg"]],
  "cuerito-amarillo": [["cross-amarillo.jpg", "relleno-largo-2.jpg"], ["relleno-largo-2.jpg", "relleno-amarillo.jpg"], ["relleno-amarillo.jpg", "cuerito-amarillo.jpg"], ["cuerito-amarillo.jpg", "cuerito-amarillo-close.jpg"]],
  "cuerito-jamon-queso": [["cross-cordonbleu.jpg", "relleno-largo-3.jpg"], ["relleno-largo-3.jpg", "relleno-cordon.jpg"], ["relleno-cordon.jpg", "cuerito-jamon-queso.jpg"], ["cuerito-jamon-queso.jpg", "cuerito-jamonqueso-close.jpg"]],
  "bandeja-yuca": [["bandeja-yuca-mojo.jpg", "bandejita-yuca.jpg"]],
  "bandeja-congri": [["bandeja-congri.jpg", "bandejita-arroz-moro.jpg"]]
};
function applyImageFixes(catalog) {
  let fixed = 0, changed = true, pass = 0;
  while (changed && pass++ < 6) {
    changed = false;
    for (const d of (catalog && catalog.departments) || []) {
      for (const c of d.categories || []) {
        for (const it of c.items || []) {
          const steps = IMAGE_FIXES[it.id];
          if (!steps) continue;
          for (const key of ["image", "img"]) {
            for (const [oldV, newV] of steps) {
              if (it[key] === oldV) { it[key] = newV; fixed++; changed = true; }
            }
          }
        }
      }
    }
  }
  return fixed;
}

// ---------- Correcciones puntuales del menú real (v4 → v5) ----------
// El 26-sep-2026 Don Ramón confirmó su menú real vía WhatsApp (flyers
// oficiales): los precios "sugeridos" pasan a ser los precios reales
// del flyer, y los departamentos toman los nombres del flyer.
// mergeCatalog() jamás toca name/price/unit/tag/desc de ítems que ya
// existen, por eso estas correcciones van aquí, con la misma regla de
// IMAGE_FIXES: solo se aplican si el valor actual es EXACTAMENTE el
// viejo de la semilla. Jamás tocan lo que el dueño haya cambiado en
// /tienda. Idempotentes.
const DEPT_FIXES = {
  "combos": [["Combos para 10 Personas", "Combos para 10 personas"]],
  "cueritos": [["Cueritos Rellenos", "Solos"]],
  "bandejas": [["Bandejas", "Bandejitas"]]
};
const VALUE_FIXES = {
  "combo-1": {
    "desc": [["Cuerito relleno de arroz moro, bandejita de arroz moro, yuca con mojo.", "1 cuerito relleno de arroz moro + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo."]]
  },
  "combo-2": {
    "desc": [["Paleta de puerco, arroz moro, yuca con mojo.", "1 paleta de puerco + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo."]]
  },
  "combo-3": {
    "desc": [["Muslo y contramuslo, arroz moro, plátano maduro.", "10 piezas de pollo (muslo con contramuslo) + 1 bandejita de arroz moro + 1 bandejita de plátano maduro."]]
  },
  "combo-4": {
    "desc": [["Cuerito relleno de jamón y queso, arroz moro, yuca con mojo.", "1 cuerito de jamón y queso + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo."]]
  },
  "combo-5": {
    "desc": [["Cuerito relleno de arroz amarillo, arroz amarillo, plátano maduro.", "1 cuerito de arroz amarillo + 1 bandejita de arroz amarillo + 1 bandejita de plátano maduro."]]
  },
  "cuerito-congri": {
    "name": [["Cuerito Relleno de Congrí", "Cuerito Relleno de Arroz Moro"]],
    "price": [[100, 120]],
    "unit": [["entero", "solo"]],
    "tag": [["⭐ El rey de la casa", null]],
    "desc": [["Cuerito entero relleno de arroz congrí. Cuero crujiente, relleno generoso. Precio sugerido — confirmar con Don Ramón.", "Cuerito entero relleno de arroz moro. Cuero crujiente, relleno generoso."]]
  },
  "cuerito-amarillo": {
    "price": [[100, 140]],
    "unit": [["entero", "solo"]],
    "tag": [["Sugerido", null]],
    "desc": [["Cuerito entero relleno de arroz amarillo con petit pois. Precio sugerido — confirmar con Don Ramón.", "Cuerito entero relleno de arroz amarillo. Cuero crujiente, relleno generoso."]]
  },
  "cuerito-jamon-queso": {
    "price": [[120, 140]],
    "unit": [["entero", "solo"]],
    "tag": [["NUEVO", null]],
    "desc": [["Cuerito entero relleno de jamón y queso estilo cordon bleu. Precio sugerido — confirmar con Don Ramón.", "Cuerito entero relleno de jamón y queso. Cuero crujiente, relleno generoso."]]
  },
  "bandeja-yuca": {
    "name": [["Bandeja de Yuca con Mojo", "Bandejita de Yuca con Mojo"]],
    "price": [[35, 20]],
    "unit": [["bandeja", "bandejita"]],
    "tag": [["Sugerido", null]],
    "desc": [["Yuca hervida con mojo criollo y cebollita blanca. Precio sugerido — confirmar con Don Ramón.", "Yuca hervida con mojo criollo y cebollita."]]
  },
  "bandeja-congri": {
    "name": [["Bandeja de Congrí", "Bandejita de Arroz Moro"]],
    "price": [[30, 20]],
    "unit": [["bandeja", "bandejita"]],
    "tag": [["Sugerido", null]],
    "desc": [["Arroz congrí casero, como en casa. Precio sugerido — confirmar con Don Ramón.", "Arroz moro casero, como en casa."]]
  }
};
function applyValueFixes(catalog) {
  let fixed = 0;
  const same = (a, b) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b);
  for (const d of (catalog && catalog.departments) || []) {
    for (const [oldN, newN] of (DEPT_FIXES[d.id] || [])) {
      if (d.name === oldN) { d.name = newN; fixed++; }
    }
    for (const c of d.categories || []) {
      for (const it of c.items || []) {
        const fx = VALUE_FIXES[it.id];
        if (!fx) continue;
        for (const [field, steps] of Object.entries(fx)) {
          for (const [oldV, newV] of steps) {
            if (same(it[field], oldV)) { it[field] = newV; fixed++; }
          }
        }
      }
    }
  }
  return fixed;
}

async function init() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require("pg");
    const url = process.env.DATABASE_URL;
    // Render/Supabase/etc. exigen SSL; local no.
    const local = /localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      ssl: local ? false : { rejectUnauthorized: false }
    });
    await pool.query(PG_SCHEMA);
    kind = "pg";
    console.log("[don-ramon] DB: Postgres");
  } else {
    const { DatabaseSync } = require("node:sqlite");
    sdb = new DatabaseSync(path.join(__dirname, "don-ramon-cueritos.db"));
    sdb.exec(SQLITE_SCHEMA);
    kind = "sqlite";
    console.log("[don-ramon] DB: SQLite local (don-ramon-cueritos.db)");
  }

  // Semilla solo si no existe; al subir CATALOG_VERSION se FUSIONA (nunca se borra).
  if (!(await kvGet("catalog"))) {
    await kvSet("catalog", JSON.stringify(SEED_CATALOG));
    await kvSet("catalog_version", String(CATALOG_VERSION));
    console.log("[don-ramon] Catálogo semilla cargado.");
  } else {
    const v = await kvGet("catalog_version");
    if (v !== String(CATALOG_VERSION)) {
      let live = null;
      try { live = JSON.parse(await kvGet("catalog")); } catch { live = null; }
      const m = mergeCatalog(live, SEED_CATALOG);
      const fx = applyImageFixes(m.catalog);
      const vx = applyValueFixes(m.catalog);
      await kvSet("catalog", JSON.stringify(m.catalog));
      await kvSet("catalog_version", String(CATALOG_VERSION));
      console.log(`[don-ramon] Catálogo fusionado (v${v} → v${CATALOG_VERSION}): +${m.added} nuevos, ${m.filled} campos rellenados, ${fx} fotos corregidas, ${vx} valores del menú real aplicados. Lo del dueño intacto.`);
    }
  }
  if (!(await kvGet("order_seq"))) await kvSet("order_seq", "0");
  return kind;
}

function dbKind() { return kind; }

// ---------- kv ----------
async function kvGet(key) {
  if (kind === "pg") {
    const r = await pool.query("SELECT value FROM kv WHERE key = $1", [key]);
    return r.rows.length ? r.rows[0].value : null;
  }
  const row = sdb.prepare("SELECT value FROM kv WHERE key = ?").get(key);
  return row ? row.value : null;
}

async function kvSet(key, value) {
  if (kind === "pg") {
    await pool.query(
      "INSERT INTO kv (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value]
    );
    return;
  }
  sdb.prepare(
    "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

// ---------- catálogo ----------
async function getCatalog() {
  return JSON.parse(await kvGet("catalog"));
}
async function setCatalog(cat) {
  await kvSet("catalog", JSON.stringify(cat));
}

// ---------- pedidos ----------
function mapOrder(row) {
  return {
    id: row.id,
    number: row.number,
    type: row.type,
    items: JSON.parse(row.items),
    customer: JSON.parse(row.customer),
    payment: row.payment,
    notes: row.notes || "",
    status: row.status,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

// Número de pedido secuencial, atómico en ambos backends.
async function nextOrderNumber() {
  let seq;
  if (kind === "pg") {
    const r = await pool.query(
      `INSERT INTO kv (key, value) VALUES ('order_seq', '1')
       ON CONFLICT(key) DO UPDATE SET value = ((kv.value)::int + 1)::text
       RETURNING value`
    );
    seq = Number(r.rows[0].value);
  } else {
    seq = Number(await kvGet("order_seq")) + 1;
    await kvSet("order_seq", String(seq));
  }
  return "#" + String(seq).padStart(3, "0");
}

async function createOrder({ number, type, items, customer, payment, notes, status }) {
  const st = status || "nuevo";
  if (kind === "pg") {
    const r = await pool.query(
      `INSERT INTO orders (number, type, items, customer, payment, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [number, type, JSON.stringify(items), JSON.stringify(customer), payment, notes || null, st]
    );
    return mapOrder(r.rows[0]);
  }
  const info = sdb.prepare(
    "INSERT INTO orders (number, type, items, customer, payment, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(number, type, JSON.stringify(items), JSON.stringify(customer), payment, notes || null, st);
  const row = sdb.prepare("SELECT * FROM orders WHERE id = ?").get(info.lastInsertRowid);
  return mapOrder(row);
}

async function listOrders() {
  if (kind === "pg") {
    const r = await pool.query("SELECT * FROM orders ORDER BY id DESC LIMIT 200");
    return r.rows.map(mapOrder);
  }
  return sdb.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 200").all().map(mapOrder);
}

async function getOrder(id) {
  if (kind === "pg") {
    const r = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    return r.rows.length ? mapOrder(r.rows[0]) : null;
  }
  const row = sdb.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? mapOrder(row) : null;
}

async function updateOrderStatus(id, status) {
  if (kind === "pg") {
    const r = await pool.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    return r.rows.length ? mapOrder(r.rows[0]) : null;
  }
  const row = sdb.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!row) return null;
  sdb.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return mapOrder(sdb.prepare("SELECT * FROM orders WHERE id = ?").get(id));
}

// Solo para limpieza de pruebas (no se expone en la API).
async function deleteOrder(id) {
  if (kind === "pg") {
    await pool.query("DELETE FROM orders WHERE id = $1", [id]);
  } else {
    sdb.prepare("DELETE FROM orders WHERE id = ?").run(id);
  }
}

// Limpieza total del historial desde /tienda (boton "Limpiar historial").
async function deleteAllOrders() {
  if (kind === "pg") {
    await pool.query("DELETE FROM orders");
    await pool.query("UPDATE kv SET value = '0' WHERE key = 'order_seq'");
  } else {
    sdb.prepare("DELETE FROM orders").run();
    sdb.prepare("UPDATE kv SET value = '0' WHERE key = 'order_seq'").run();
  }
}

module.exports = {
  init,
  dbKind,
  kvGet,
  kvSet,
  getCatalog,
  setCatalog,
  nextOrderNumber,
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders
};
