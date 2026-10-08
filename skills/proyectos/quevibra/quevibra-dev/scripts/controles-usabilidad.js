// Controles automáticos de usabilidad para QueVibra (los mismos de qa-chimpa, adaptados).
// Uso: leé este archivo y pegá su contenido en mcp__Claude_Browser__javascript_tool sobre la pantalla
// a revisar, con el viewport ya en 390x844 (y después 360x640). Devuelve un informe; no cambia nada.
// Esperá ~2 s después de navegar: el splash (Preloader) tapa la pantalla el primer segundo.
(() => {
  const out = [];
  const doc = document.documentElement;
  const root = document.querySelector("main") || document.body;
  if (doc.scrollWidth > doc.clientWidth + 1) out.push(`desborde horizontal: ${doc.scrollWidth}px > ${doc.clientWidth}px (test del pulgar)`);
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };
  const nombre = (el) => (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim().replace(/\s+/g, " ");
  const controles = new Set([
    ...root.querySelectorAll("a, button, input, select, textarea, [role=button]"),
    ...document.querySelectorAll("nav a, nav button"), // barra inferior y header
  ]);
  for (const el of controles) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const enParrafo = el.tagName === "A" && el.closest("p, li");
    if (!enParrafo && el.type !== "hidden" && (r.height < 44 || (el.tagName === "BUTTON" && r.width < 44)))
      out.push(`táctil < 44px: ${el.tagName.toLowerCase()} "${nombre(el).slice(0, 40)}" (${Math.round(r.width)}×${Math.round(r.height)})`);
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !["checkbox", "radio", "hidden", "range"].includes(el.type) && parseFloat(getComputedStyle(el).fontSize) < 16)
      out.push(`campo con texto < 16px (iOS hace zoom): ${el.getAttribute("name") || el.id || el.placeholder}`);
    if (/^(A|BUTTON)$/.test(el.tagName) && !nombre(el) && !el.querySelector("img[alt]:not([alt=''])"))
      out.push(`control sin nombre accesible: ${el.outerHTML.slice(0, 90)}`);
  }
  for (const img of root.querySelectorAll("img")) if (!img.hasAttribute("alt")) out.push(`img sin alt: ${(img.getAttribute("src") || "").slice(0, 80)}`);
  const texto = (document.title + " " + root.innerText);
  for (const p of [/\bplataforma\b/i, /\becosistema\b/i, /\bexperiencias?\b/i, /\bQUEHAY\b/i])
    if (p.test(texto)) out.push(`voz: aparece ${p} en la pantalla (ver quevibra-business)`);
  const roto = root.innerText.match(/\{"|\[object Object\]|\bundefined\b|\bNaN\b|Invalid Date|%3C/);
  if (roto) out.push(`texto roto en pantalla: "${roto[0]}" (JSON crudo, undefined, NaN, Invalid Date o HTML codificado)`);
  // Acciones fijas (barra inferior, CTA sticky): en celular la acción principal tiene que estar al alcance del pulgar.
  const esFijo = (el) => { for (let n = el, i = 0; n && i < 8; n = n.parentElement, i++) { const p = getComputedStyle(n).position; if (p === "fixed" || p === "sticky") return true; } return false; };
  const fijos = [...document.querySelectorAll("button, a")].filter((el) => visible(el) && esFijo(el)).map((el) => nombre(el).slice(0, 30)).filter(Boolean);
  return {
    url: location.pathname + location.search,
    viewport: `${innerWidth}×${innerHeight}`,
    titulo: document.title,
    accionesFijas: fijos,
    violaciones: out.length ? out : ["ninguna"],
  };
})();
