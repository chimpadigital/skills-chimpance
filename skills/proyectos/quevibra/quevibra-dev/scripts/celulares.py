# Pruebas en celulares de verdad (motores reales): iPhone = WebKit (Safari), Android = Chromium (Chrome).
# Recorre la ficha del evento (/evento/:slug) en 7 celulares, mide lo que se rompe en mobile y arma un
# informe HTML con capturas por celular. Solo LEE: como anónimo, no guarda likes ni agenda nada.
#
# Uso (Git Bash):
#   python ~/.claude/skills/quevibra-dev/scripts/celulares.py                       # contra producción
#   python ~/.claude/skills/quevibra-dev/scripts/celulares.py --base http://localhost:5011   # contra un worktree
#   python ... --rutas /evento/slug-a /evento/slug-b    # rutas puntuales en vez de la muestra automática
#   python ... --out <carpeta>                          # dónde deja informe.html, resultados.json y capturas
#
# Sin --rutas elige solo una muestra de casos difíciles de la API pública: título larguísimo, sin foto,
# gratis, sin link de entradas, de varios días, con muchas funciones y uno "normal".
import argparse, json, os, re, sys, time, html, urllib.request, unicodedata
from datetime import datetime
from playwright.sync_api import sync_playwright

# (nombre, motor, perfil de Playwright o None, ancho, alto) — perfiles = tamaño, densidad, touch y user-agent reales.
CELULARES = [
    ("iPhone SE", "webkit", "iPhone SE", None, None),                 # 375×667: el iPhone más chico en uso
    ("iPhone 13 mini", "webkit", "iPhone 13 Mini", None, None),       # 375×812 con muesca
    ("iPhone 15 Pro", "webkit", "iPhone 15 Pro", None, None),         # 393×852, el más común hoy
    ("iPhone 15 Pro Max", "webkit", "iPhone 15 Pro Max", None, None), # 430×932: el más grande
    ("Android chico 360", "chromium", "Galaxy S5", None, None),       # 360×640: donde se cortan las cosas
    ("Galaxy A55", "chromium", "Galaxy A55", None, None),             # gama media, el Android más vendido
    ("Pixel 7", "chromium", "Pixel 7", None, None),
]

MEDIR_JS = r"""
() => {
  const out = [];
  const vw = innerWidth, vh = innerHeight;
  const doc = document.documentElement;
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05; };
  const esFijo = (el) => { for (let n = el, i = 0; n && i < 10; n = n.parentElement, i++) { const p = getComputedStyle(n).position; if (p === 'fixed') return n; } return null; };
  const nombre = (el) => (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const sinModal = (el) => !el.closest('[role=dialog]');

  // 1. Nada se sale de la pantalla para los costados
  if (doc.scrollWidth > vw + 1) out.push({g: 'alta', t: `la página se mueve para los costados: mide ${doc.scrollWidth}px y la pantalla ${vw}px`});
  const salidos = [];
  for (const el of document.querySelectorAll('main *, [data-testid=page-event-detail] *')) {
    if (!visible(el) || esFijo(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 2 && r.width < vw * 3) {
      let anc = el.parentElement, cortado = false;
      for (; anc; anc = anc.parentElement) { const ox = getComputedStyle(anc).overflowX; if (ox === 'hidden' || ox === 'auto' || ox === 'scroll' || ox === 'clip') { cortado = true; break; } }
      if (!cortado && el.children.length === 0) salidos.push(`${el.tagName.toLowerCase()} "${nombre(el)}" llega a ${Math.round(r.right)}px`);
    }
  }
  if (salidos.length) out.push({g: 'alta', t: `contenido cortado por el borde derecho: ${salidos.slice(0, 3).join(' · ')}${salidos.length > 3 ? ` (+${salidos.length - 3})` : ''}`});

  // 2. Botones del tamaño del dedo (44px) — en la ficha, no en el texto corrido
  const chicos = [];
  for (const el of document.querySelectorAll('a, button, [role=button], input, select')) {
    if (!visible(el) || !sinModal(el)) continue;
    const r = el.getBoundingClientRect();
    if (el.tagName === 'A' && el.closest('p, li') && !el.closest('nav')) continue;
    if (r.height < 44 || (el.tagName === 'BUTTON' && r.width < 44)) chicos.push(`"${nombre(el) || el.getAttribute('data-testid') || el.tagName}" ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  if (chicos.length) out.push({g: 'media', t: `botones/links más chicos que un dedo (44px): ${chicos.slice(0, 6).join(' · ')}${chicos.length > 6 ? ` (+${chicos.length - 6})` : ''}`});

  // 3. Texto legible: nada importante por debajo de 12px
  const chiquito = new Set();
  for (const el of document.querySelectorAll('[data-testid=page-event-detail] *')) {
    if (!visible(el) || el.children.length) continue;
    const tx = (el.innerText || '').trim(); if (tx.length < 3) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12) chiquito.add(`"${tx.slice(0, 30)}" ${fs}px`);
  }
  if (chiquito.size) out.push({g: 'baja', t: `texto muy chico para leer (<12px): ${[...chiquito].slice(0, 4).join(' · ')}`});

  // 4. Barra fija de abajo (Ver entradas / Agendar / Me vibra / Compartir)
  const barra = document.querySelector('[data-testid=sticky-cta-bar]');
  const info = {barra: null};
  if (!barra || !visible(barra)) out.push({g: 'alta', t: 'no aparece la barra fija de acciones abajo'});
  else {
    const rb = barra.getBoundingClientRect();
    info.barra = {top: Math.round(rb.top), alto: Math.round(rb.height), botones: [...barra.querySelectorAll('a, button')].filter(visible).map(nombre)};
    if (rb.bottom > vh + 1 || rb.top < vh * 0.6) out.push({g: 'alta', t: `la barra de acciones no queda pegada abajo (arriba en ${Math.round(rb.top)}px, pantalla ${vh}px)`});
    // botones de la barra cortados por el borde (visto en iPhone SE el 3/10/2026: "Compartir" a medias)
    const cortados = [...barra.querySelectorAll('button, a')].filter(visible).filter(b => { const r = b.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1; })
      .map(b => `"${nombre(b) || b.getAttribute('data-testid')}" (${Math.round(b.getBoundingClientRect().right - vw)}px afuera)`);
    if (cortados.length) out.push({g: 'alta', t: `en la barra de abajo hay botones cortados por el borde de la pantalla: ${[...new Set(cortados)].join(' · ')}`});
    // ¿la barra tapa contenido al final de la página? (se mide con la página scrolleada al fondo)
    const fin = window.scrollY + vh >= doc.scrollHeight - 2;
    if (fin) {
      let maxBottom = 0, quien = '';
      for (const el of document.querySelectorAll('[data-testid=page-event-detail] *')) {
        if (!visible(el) || esFijo(el) || el.children.length) continue;
        if (!(el.innerText || '').trim() && !/^(IMG|BUTTON|A)$/.test(el.tagName)) continue;
        const r = el.getBoundingClientRect(); if (r.bottom > maxBottom) { maxBottom = r.bottom; quien = nombre(el) || el.tagName; }
      }
      info.ultimoContenido = Math.round(maxBottom);
      if (maxBottom > rb.top + 2) out.push({g: 'alta', t: `la barra de abajo tapa el final de la página ("${quien}" termina en ${Math.round(maxBottom)}px y la barra empieza en ${Math.round(rb.top)}px)`});
    }
  }

  // 5. Fotos que cargan (la principal sobre todo)
  const hero = document.querySelector('[data-testid=img-event-hero]');
  info.foto = hero ? {cargo: hero.complete && hero.naturalWidth > 0, ancho: hero.naturalWidth, src: (hero.currentSrc || hero.src).slice(0, 120)} : null;
  if (hero && !(hero.complete && hero.naturalWidth > 0)) out.push({g: 'alta', t: 'la foto principal del evento no cargó'});
  if (hero && hero.naturalWidth > 0 && hero.naturalWidth < 400) out.push({g: 'media', t: `la foto principal es chica (${hero.naturalWidth}px de ancho): se ve pixelada`});
  const rotas = [...document.querySelectorAll('img')].filter(i => visible(i) && i.complete && i.naturalWidth === 0 && i.loading !== 'lazy');
  if (rotas.length) out.push({g: 'media', t: `${rotas.length} imagen(es) rota(s): ${rotas.slice(0, 2).map(i => (i.currentSrc || i.src).slice(0, 70)).join(' · ')}`});

  // 6. Lo esencial está y no hay texto roto
  const titulo = document.querySelector('[data-testid=text-event-title]');
  info.titulo = titulo ? titulo.innerText.trim().slice(0, 90) : null;
  if (!titulo) out.push({g: 'alta', t: 'no aparece el título del evento'});
  else {
    const r = titulo.getBoundingClientRect(); info.tituloLineas = Math.round(r.height / parseFloat(getComputedStyle(titulo).lineHeight || 30));
    // "No me hagas pensar": llegando desde Instagram, la primera pantalla tiene que decir QUÉ es (título) sin deslizar.
    // Se mide solo arriba de todo (scrollY 0), contra el espacio que deja libre la barra fija de abajo.
    if (window.scrollY < 5) {
      const limite = barra && visible(barra) ? barra.getBoundingClientRect().top : vh;
      info.tituloArriba = Math.round(r.top + scrollY);
      if (r.top + scrollY >= limite) out.push({g: 'alta', t: `en la primera pantalla no se ve el título: solo la foto (el título empieza en ${Math.round(r.top + scrollY)}px y lo visible termina en ${Math.round(limite)}px)`});
      else if (r.bottom + scrollY > limite) out.push({g: 'media', t: `en la primera pantalla el título queda cortado por la barra de abajo`});
    }
  }
  const root = document.querySelector('[data-testid=page-event-detail]') || document.body;
  const roto = root.innerText.match(/\{"|\[object Object\]|\bundefined\b|\bnull\b|\bNaN\b|Invalid Date|&amp;|&quot;|%3C|Mayores de Todo/);
  if (roto) out.push({g: 'alta', t: `texto roto en pantalla: "${roto[0]}"`});
  for (const p of [/\bplataforma\b/i, /\becosistema\b/i, /\bexperiencias?\b/i]) if (p.test(root.innerText)) out.push({g: 'baja', t: `voz de marca: aparece ${p}`});

  info.altoPagina = doc.scrollHeight;
  return {hallazgos: out, info};
}
"""


def sacar_muestra(base):
    """Elige eventos reales que ponen a prueba la ficha: los casos donde se suele romper."""
    # Cloudflare responde 403 al user-agent de Python: va uno de navegador
    req = urllib.request.Request(f"{base}/api/events?limit=6000", headers={"User-Agent": "Mozilla/5.0 (QueVibra pruebas celulares)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        ev = json.load(r)
    ev = [e for e in ev if e.get("isActive", True) and e.get("status", "published") == "published"]
    def slug(e):
        t = unicodedata.normalize("NFD", e["title"].lower())
        t = re.sub(r"[̀-ͯ]", "", t)
        t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:80]
        return f"/evento/{t}-{e['id']}"
    elegidos, vistos = [], set()
    def tomar(nombre, cand):
        for e in cand:
            if e["id"] not in vistos:
                vistos.add(e["id"]); elegidos.append((nombre, slug(e), e["title"])); return
    con_foto = [e for e in ev if e.get("image")]
    tomar("Normal (con foto y entradas)", [e for e in con_foto if e.get("externalUrl") and 25 < len(e["title"]) < 50 and e.get("description")])
    tomar("Título larguísimo", sorted(ev, key=lambda e: -len(e["title"])))
    tomar("Sin foto", [e for e in ev if not e.get("image")])
    tomar("Gratis", [e for e in con_foto if e.get("priceType") == "free" or str(e.get("price") or "").lower() in ("0", "gratis", "gratuito")])
    tomar("Sin link de entradas", [e for e in con_foto if not e.get("externalUrl")])
    tomar("Varios días", [e for e in con_foto if e.get("endDate") and e["endDate"][:10] != (e.get("date") or "")[:10]])
    tomar("Muchas funciones", sorted([e for e in ev if (e.get("occurrenceCount") or 0) > 1], key=lambda e: -(e.get("occurrenceCount") or 0)))
    tomar("Descripción larguísima", sorted(con_foto, key=lambda e: -len(e.get("description") or "")))
    return elegidos


def probar(base, rutas, out_dir):
    os.makedirs(os.path.join(out_dir, "capturas"), exist_ok=True)
    local = "localhost" in base or "127.0.0.1" in base
    resultados = []
    with sync_playwright() as p:
        motores = {}
        for nombre_cel, motor, perfil, w, h in CELULARES:
            if motor not in motores:
                motores[motor] = getattr(p, motor).launch()
            disp = dict(p.devices[perfil])
            disp.pop("default_browser_type", None)
            ctx = motores[motor].new_context(**disp, locale="es-AR", timezone_id="America/Argentina/Cordoba", service_workers="block")
            if local:  # la cookie de sesión es Secure: el server solo la da si cree que viene por https (ver 06_trampas)
                ctx.route(f"{base}/**", lambda route, request: route.continue_(headers={**request.headers, "x-forwarded-proto": "https"}))
            for caso, ruta, titulo in rutas:
                page = ctx.new_page()
                errores, fallas = [], []
                page.on("console", lambda m: errores.append(m.text[:160]) if m.type == "error" else None)
                page.on("pageerror", lambda e: errores.append(f"JS: {str(e)[:160]}"))
                page.on("response", lambda r: fallas.append(f"{r.status} {r.url[:110]}") if r.status >= 400 and base in r.url else None)
                fid = re.sub(r"[^a-z0-9]+", "-", f"{nombre_cel}-{caso}".lower()).strip("-")
                fila = {"celular": nombre_cel, "motor": "Safari (WebKit)" if motor == "webkit" else "Chrome (Chromium)",
                        "caso": caso, "ruta": ruta, "titulo": titulo, "hallazgos": [], "info": {}, "capturas": {}}
                t0 = time.time()
                try:
                    page.goto(base + ruta, wait_until="domcontentloaded", timeout=45000)
                    page.wait_for_selector("[data-testid=text-event-title], [data-testid=text-event-not-found]", timeout=30000)
                    page.wait_for_timeout(2500)  # splash + fotos
                    fila["segundos"] = round(time.time() - t0, 1)
                    if fila["segundos"] > 6:
                        fila["hallazgos"].append({"g": "media", "t": f"tardó {fila['segundos']} s en mostrar el evento"})
                    if page.query_selector("[data-testid=text-event-not-found]"):
                        fila["hallazgos"].append({"g": "alta", "t": "dice 'evento no encontrado'"})
                    page.screenshot(path=os.path.join(out_dir, "capturas", f"{fid}-arriba.png"))
                    fila["capturas"]["arriba"] = f"capturas/{fid}-arriba.png"
                    arriba = page.evaluate(MEDIR_JS)
                    # al fondo: ¿la barra fija tapa el final?
                    page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
                    page.wait_for_timeout(900)
                    page.screenshot(path=os.path.join(out_dir, "capturas", f"{fid}-abajo.png"))
                    fila["capturas"]["abajo"] = f"capturas/{fid}-abajo.png"
                    abajo = page.evaluate(MEDIR_JS)
                    vistos = set()
                    for hz in arriba["hallazgos"] + abajo["hallazgos"]:
                        if hz["t"] not in vistos:
                            vistos.add(hz["t"]); fila["hallazgos"].append(hz)
                    fila["info"] = {**arriba["info"], "ultimoContenido": abajo["info"].get("ultimoContenido")}
                    # toque real con el dedo: "Me vibra" sin cuenta tiene que pedir registro (no guarda nada)
                    page.evaluate("window.scrollTo(0, 0)")
                    btn = page.query_selector("[data-testid=button-sticky-vibra]")
                    if btn and btn.is_visible():
                        btn.tap()
                        page.wait_for_timeout(1200)
                        dlg = page.query_selector("[role=dialog]")
                        if not dlg or not dlg.is_visible():
                            fila["hallazgos"].append({"g": "alta", "t": "al tocar 'Me vibra' sin cuenta no pasa nada (no aparece el pedido de registro)"})
                        else:
                            page.screenshot(path=os.path.join(out_dir, "capturas", f"{fid}-mevibra.png"))
                            fila["capturas"]["mevibra"] = f"capturas/{fid}-mevibra.png"
                            rd = dlg.bounding_box()
                            vp = page.viewport_size
                            if rd and (rd["x"] < -1 or rd["x"] + rd["width"] > vp["width"] + 1 or rd["y"] + rd["height"] > vp["height"] + 1):
                                fila["hallazgos"].append({"g": "alta", "t": "el pedido de registro se sale de la pantalla"})
                            # cerrar como una persona: en celular es un panel que sube desde abajo (sin X);
                            # se cierra tocando lo oscuro de arriba. Escape no sirve (no hay teclado) y la
                            # animación de cierre dura ~0,5 s: mirar antes da un falso "congelado".
                            page.touchscreen.tap(vp["width"] // 2, 40)
                            page.wait_for_timeout(1500)
                            # que no quede la pantalla congelada (pasó en 2026-06 con el modal): se prueba tocando de nuevo
                            try:
                                page.tap("[data-testid=button-sticky-vibra]", timeout=4000)
                                page.wait_for_timeout(1000)
                                if not page.query_selector("[role=dialog]"):
                                    fila["hallazgos"].append({"g": "alta", "t": "después de cerrar el pedido de registro, 'Me vibra' ya no responde"})
                            except Exception:
                                fila["hallazgos"].append({"g": "alta", "t": "después de cerrar el pedido de registro la pantalla queda congelada (no se puede tocar nada)"})
                except Exception as e:
                    fila["hallazgos"].append({"g": "alta", "t": f"no se pudo cargar/recorrer: {str(e)[:200]}"})
                # avisos de Google (Analytics, Ads, reCAPTCHA en iframes) y de la CSP en modo "solo reporte": esperables
                ruido = ("googletagmanager", "google-analytics", "analytics.google", "doubleclick", "content security policy",
                         "report only", "report-only", "favicon", "www.google.com", "adtrafficquality.google", "googlesyndication")
                errores = [x for x in errores if not any(r in x.lower() for r in ruido)]
                if errores:
                    fila["hallazgos"].append({"g": "media", "t": f"errores en la consola: {' | '.join(sorted(set(errores))[:3])}"})
                if fallas:
                    fila["hallazgos"].append({"g": "media", "t": f"pedidos que fallaron: {' | '.join(sorted(set(fallas))[:3])}"})
                resultados.append(fila)
                print(f"  {nombre_cel:20} · {caso:28} · {len(fila['hallazgos'])} hallazgo(s)", flush=True)
                page.close()
            ctx.close()
        for b in motores.values():
            b.close()
    return resultados


def informe(resultados, base, out_dir):
    orden = {"alta": 0, "media": 1, "baja": 2}
    # agrupar hallazgos iguales entre celulares
    agrup = {}
    for f in resultados:
        for hz in f["hallazgos"]:
            clave = (hz["g"], re.sub(r"\d+(\.\d+)?px|\d+(\.\d+)? s\b", "#", hz["t"]))
            agrup.setdefault(clave, {"g": hz["g"], "t": hz["t"], "donde": []})["donde"].append(f"{f['celular']} · {f['caso']}")
    lista = sorted(agrup.values(), key=lambda a: (orden[a["g"]], -len(a["donde"])))
    color = {"alta": "#ff6b6b", "media": "#ffb84d", "baja": "#9aa4b2"}
    filas_h = "".join(
        f"<li><b style='color:{color[a['g']]}'>{a['g'].upper()}</b> {html.escape(a['t'])}"
        f"<div class='donde'>{len(a['donde'])} vez/veces: {html.escape(', '.join(a['donde'][:6]))}{' …' if len(a['donde']) > 6 else ''}</div></li>"
        for a in lista) or "<li>Sin hallazgos 🎉</li>"
    casos = []
    for caso in dict.fromkeys(f["caso"] for f in resultados):
        fs = [f for f in resultados if f["caso"] == caso]
        celdas = "".join(
            f"<figure><figcaption><b>{html.escape(f['celular'])}</b><br><small>{f['motor']}</small>"
            f"<br><span class='n {'ok' if not f['hallazgos'] else ''}'>{len(f['hallazgos'])} hallazgo(s)</span></figcaption>"
            + "".join(f"<a href='{f['capturas'][k]}' target='_blank'><img loading='lazy' src='{f['capturas'][k]}' alt='{k}'></a>" for k in ("arriba", "abajo", "mevibra") if k in f["capturas"])
            + "</figure>" for f in fs)
        casos.append(f"<section><h2>{html.escape(caso)}</h2><p class='sub'>{html.escape(fs[0]['titulo'] or '')} — "
                     f"<a href='{base}{fs[0]['ruta']}' target='_blank'>abrir</a></p><div class='grid'>{celdas}</div></section>")
    total = sum(len(f["hallazgos"]) for f in resultados)
    altas = sum(1 for a in lista if a["g"] == "alta")
    doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ficha en celulares</title><style>
body{{background:#292929;color:#f8f5ec;font-family:system-ui,sans-serif;margin:0;padding:16px}}h1{{color:#d5e489}}a{{color:#d5e489}}
.res{{background:#1f1f1f;border-radius:12px;padding:12px 16px}}li{{margin:8px 0}}.donde{{color:#9aa4b2;font-size:13px}}
.grid{{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}}figure{{margin:0;flex:0 0 auto}}figure img{{height:360px;border-radius:10px;margin-right:4px;border:1px solid #444}}
figcaption{{font-size:13px;margin-bottom:4px}}.n{{color:#ffb84d}}.n.ok{{color:#d5e489}}.sub{{color:#9aa4b2;margin-top:-8px}}
</style></head><body><h1>Ficha del evento en {len(set(f['celular'] for f in resultados))} celulares</h1>
<p>{html.escape(base)} · {datetime.now():%d/%m/%Y %H:%M} · {len(resultados)} recorridos · {total} hallazgos ({altas} tipos graves)</p>
<div class="res"><h2>Qué encontré (agrupado)</h2><ul>{filas_h}</ul></div>{''.join(casos)}</body></html>"""
    with open(os.path.join(out_dir, "informe.html"), "w", encoding="utf-8") as fh:
        fh.write(doc)
    with open(os.path.join(out_dir, "resultados.json"), "w", encoding="utf-8") as fh:
        json.dump({"base": base, "resultados": resultados, "agrupado": lista}, fh, ensure_ascii=False, indent=1)
    return lista


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://quevibra.com.ar")
    ap.add_argument("--rutas", nargs="*")
    ap.add_argument("--out", default=os.path.join(os.getcwd(), "celulares-informe"))
    a = ap.parse_args()
    base = a.base.rstrip("/")
    rutas = [("Ruta " + str(i + 1), r, "") for i, r in enumerate(a.rutas)] if a.rutas else sacar_muestra(base)
    print(f"Probando {len(rutas)} evento(s) × {len(CELULARES)} celulares contra {base}")
    for c, r, t in rutas:
        print(f"  · {c}: {t[:70]}")
    res = informe(probar(base, rutas, a.out), base, a.out)
    print(f"\nInforme: {os.path.join(a.out, 'informe.html')}")
    for h in res:
        print(f"[{h['g']}] {h['t']}  ({len(h['donde'])}×)")
