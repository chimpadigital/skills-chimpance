#!/usr/bin/env node
// Llena la base LOCAL de QueVibra con datos públicos de producción (solo lectura
// contra quevibra.com.ar): categorías, tags, audiencias y los eventos activos.
//
// Uso (desde la raíz de un checkout/worktree de QueVibra con su .env):
//   node ~/.claude/skills/quevibra-dev/scripts/seed-local-desde-prod.mjs [--limit 6000] [--dry]
//
// Seguro: se niega a escribir si DATABASE_URL no apunta a localhost/127.0.0.1.
// Es idempotente: se puede correr las veces que haga falta (upsert por id).

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const req = createRequire(path.join(repoRoot, "package.json"));
if (!fs.existsSync(path.join(repoRoot, "shared", "schema.ts"))) {
  console.error("[seed] Correlo desde la raíz del repo de QueVibra (no encuentro shared/schema.ts).");
  process.exit(1);
}
req("dotenv").config({ path: path.join(repoRoot, ".env") });
const pg = req("pg");

const args = process.argv.slice(2);
const limit = Number(args[args.indexOf("--limit") + 1]) || 6000;
const dry = args.includes("--dry");
const PROD = process.env.QV_SEED_SOURCE || "https://quevibra.com.ar";

const dbUrl = process.env.DATABASE_URL || "";
let host = "";
try { host = new URL(dbUrl).hostname; } catch { /* vacío */ }
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
  console.error(`[seed] ABORTADO: DATABASE_URL apunta a "${host || "(vacío)"}". Este script solo escribe en una base local.`);
  process.exit(2);
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  try { return JSON.parse(text); } catch { throw new Error(`${url} → no devolvió JSON`); }
}

const catalogPath = path.join(repoRoot, "catalog.export.json");
const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, "utf8")) : { categories: [], tags: [], audiences: [] };

console.log(`[seed] Bajando datos públicos de ${PROD} …`);
const prodCategories = await getJson(`${PROD}/api/categories`);
const events = await getJson(`${PROD}/api/events?limit=${limit}`);
if (!Array.isArray(events)) throw new Error("/api/events no devolvió una lista");

// Categorías: las de prod mandan; el catálogo local completa las que falten.
const catMap = new Map();
for (const c of catalog.categories || []) catMap.set(c.id, c);
for (const c of prodCategories) catMap.set(c.id, c);
for (const e of events) if (e.category?.id && !catMap.has(e.category.id)) catMap.set(e.category.id, e.category);

const tagMap = new Map();
for (const t of catalog.tags || []) tagMap.set(t.id, t);
for (const e of events) for (const t of e.eventTags || []) if (t?.id) tagMap.set(t.id, t);

console.log(`[seed] ${catMap.size} categorías · ${tagMap.size} tags · ${(catalog.audiences || []).length} audiencias · ${events.length} eventos`);
if (dry) { console.log("[seed] --dry: no escribo nada."); process.exit(0); }

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();
try {
  await client.query("BEGIN");
  for (const c of catMap.values()) {
    await client.query(
      `INSERT INTO categories (id, name, icon, description, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description,
         is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order`,
      [c.id, c.name, c.icon || "calendar", c.description ?? null, c.isActive ?? true, c.sortOrder ?? 0],
    );
  }
  for (const t of tagMap.values()) {
    const cat = t.categoryId && catMap.has(t.categoryId) ? t.categoryId : null;
    await client.query(
      `INSERT INTO tags (id, name, description, category_id, is_active, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, category_id=EXCLUDED.category_id,
         is_active=EXCLUDED.is_active, is_featured=EXCLUDED.is_featured, sort_order=EXCLUDED.sort_order`,
      [t.id, t.name, t.description ?? null, cat, t.isActive ?? true, t.isFeatured ?? false, t.sortOrder ?? 0],
    );
  }
  for (const a of catalog.audiences || []) {
    await client.query(
      `INSERT INTO audiences (id, name, description, is_active, sort_order) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order`,
      [a.id, a.name, a.description ?? null, a.isActive ?? true, a.sortOrder ?? 0],
    );
  }

  let n = 0;
  for (const e of events) {
    const cat = e.categoryId && catMap.has(e.categoryId) ? e.categoryId : null;
    await client.query(
      `INSERT INTO events (id, title, description, image, carousel_image_kind, category_id, source_category, tags, price, price_type,
         date, end_date, start_time, time_of_day, location, address, latitude, longitude, organizer_id, organizer_name,
         organizer_instagram, external_url, is_featured, is_active, status, event_type, audience, external_clicks, source,
         remote_id, city, last_synced_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NULL,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
       ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, image=EXCLUDED.image,
         category_id=EXCLUDED.category_id, price=EXCLUDED.price, price_type=EXCLUDED.price_type, date=EXCLUDED.date,
         end_date=EXCLUDED.end_date, start_time=EXCLUDED.start_time, time_of_day=EXCLUDED.time_of_day, location=EXCLUDED.location,
         address=EXCLUDED.address, is_featured=EXCLUDED.is_featured, is_active=EXCLUDED.is_active, status=EXCLUDED.status,
         city=EXCLUDED.city, last_synced_at=EXCLUDED.last_synced_at`,
      [
        e.id, e.title, e.description ?? null, e.image || "", e.carouselImageKind ? JSON.stringify(e.carouselImageKind) : null,
        cat, e.sourceCategory ?? null, e.tags ?? null, e.price ?? null, e.priceType || "PAID",
        e.date, e.endDate ?? null, e.startTime ?? null, e.timeOfDay || "Noche", e.location || e.city || "Sin lugar",
        e.address ?? null, e.latitude ?? null, e.longitude ?? null, e.organizerName ?? null,
        e.organizerInstagram ?? null, e.externalUrl ?? null, e.isFeatured ?? false, e.isActive ?? true, e.status || "published",
        e.eventType ?? null, e.audience ?? null, e.externalClicks ?? 0, e.source ?? null,
        e.remoteId ?? null, e.city ?? null, e.lastSyncedAt ?? null, e.createdAt ?? new Date().toISOString(),
      ],
    );
    for (const t of e.eventTags || []) {
      if (!t?.id || !tagMap.has(t.id)) continue;
      await client.query(`INSERT INTO event_tags (event_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [e.id, t.id]);
    }
    n++;
  }
  await client.query("COMMIT");
  const byCity = await client.query(`SELECT coalesce(city,'(sin ciudad)') c, count(*)::int n FROM events GROUP BY 1 ORDER BY 2 DESC LIMIT 8`);
  console.log(`[seed] OK: ${n} eventos cargados. Top ciudades:`, byCity.rows.map((r) => `${r.c} ${r.n}`).join(" · "));
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[seed] ERROR, no se guardó nada:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
