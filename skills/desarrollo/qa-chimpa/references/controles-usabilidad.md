# Controles automáticos de usabilidad

`ux-chimpa` define qué es usable; varias de sus reglas se pueden **medir** en cada corrida e2e, así no dependen de que alguien se acuerde de mirarlas. No reemplazan la auditoría con personas (lo que se entiende, lo que confunde): atrapan las regresiones mecánicas.

## Qué se mide y de qué regla sale

| Control | Umbral | Regla de `ux-chimpa` |
|---|---|---|
| Sin scroll horizontal | `scrollWidth <= clientWidth` en 390 px | Test del pulgar; celular primero |
| Tamaño táctil | Todo control visible en `main` ≥ 44 px de alto (y de ancho, salvo links dentro de un párrafo) | Test del pulgar |
| Texto de los campos | `input`, `select`, `textarea` con `font-size` ≥ 16 px (si no, iOS hace zoom al tocar) | Test del pulgar |
| Nombre accesible | Ningún botón ni link sin nombre (texto, `aria-label` o `title`) | Regla 6: nada mudo; regla 11: todo se usa con teclado |
| Imágenes con `alt` | Toda `img` de contenido con `alt` (las decorativas, `alt=""`) | Regla 11 |
| Consola limpia | Sin errores propios de la página (listar y justificar los esperables, p. ej. 401 del chequeo de sesión) | Regla 7: nunca mentir (una pantalla que "anda" con errores esconde fallas) |
| Sin emojis en la interfaz | Ningún emoji en títulos, botones ni mensajes | Reglas de tono |
| Título de la pestaña | Existe y nombra la pantalla | Test del baúl: sé dónde estoy |

Se corren en el proyecto **celular 390×844** (con `isMobile` y `hasTouch`) sobre cada pantalla que visita un flujo, y en escritorio los que aplican (nombre accesible, consola, título).

## Cómo reportarlos

- Con `expect.soft`: una violación de usabilidad marca el test pero no tapa el resultado funcional del flujo.
- Cada violación dice **pantalla, elemento (selector y texto), medida y regla**. Ejemplo: `/onboarding/paso-2 · link "Saltar este paso" · 36 px de alto (< 44) · test del pulgar`.
- Las violaciones que ya existían se listan una vez como deuda con gravedad (1 a 4, escala de `ux-chimpa`) en vez de silenciarse: si se silencian, dejan de verse las nuevas.

## Helper de Playwright

El helper validado del proyecto que lo tenga es la referencia. En Comunidad Emprendedora: `tests/e2e-real/support/usabilidad.ts` del front (rama `feat/e2e-flujos`): `revisarPantalla(page, nombre)` corre desborde, tamaño táctil, texto de 16 px, nombre accesible, `alt`, consola (con una lista `ERRORES_ESPERADOS` que justifica cada error conocido), enlaces internos rotos y **axe-core** (`@axe-core/playwright`, solo violaciones serious y critical de WCAG 2.1 A/AA, que incluyen contraste). `reporte-usabilidad.ts` junta todo en `usabilidad.md`. Para un proyecto nuevo, copiar esos dos archivos y ajustar el selector del contenido principal y los errores esperables.

Lo que enseñó la primera corrida (30/9, 172 violaciones en 29 pantallas):
- Casi todo sale de pocas causas: un `font-size` global de 14 px en los campos, links sueltos de 20 px de alto, casillas y botones de mostrar contraseña de 24–36 px. Arreglar la causa en el CSS global baja decenas de violaciones de una.
- **Contraste**: el botón primario de una marca puede no llegar a 4,5:1 (blanco sobre #249838 da 3,73). Es una decisión del design system, no se "arregla" en un componente: se informa con la medida.
- Los inputs transparentes encima de una etiqueta (casillas custom) tapan el clic: en el test se usa `check()` sobre el input.

Esqueleto de la medición (correr con `page.evaluate`):

```ts
const violaciones = await page.evaluate(() => {
  const out: string[] = [];
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth) out.push(`desborde horizontal: ${doc.scrollWidth} > ${doc.clientWidth}`);
  const visibles = (el: Element) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const nombre = (el: Element) =>
    (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim();
  for (const el of document.querySelectorAll("main a, main button, main input, main select, main textarea, main [role=button]")) {
    if (!visibles(el)) continue;
    const r = el.getBoundingClientRect();
    const enParrafo = el.tagName === "A" && el.closest("p");
    if (!enParrafo && r.height < 44) out.push(`táctil < 44 px: ${el.tagName.toLowerCase()} "${nombre(el).slice(0, 40)}" (${Math.round(r.height)} px)`);
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && parseFloat(getComputedStyle(el).fontSize) < 16)
      out.push(`campo con texto < 16 px: ${el.getAttribute("name") ?? el.id}`);
    if (/^(A|BUTTON)$/.test(el.tagName) && !nombre(el) && !el.querySelector("img[alt]:not([alt=''])"))
      out.push(`control sin nombre accesible: ${el.outerHTML.slice(0, 80)}`);
  }
  for (const img of document.querySelectorAll("main img")) if (!img.hasAttribute("alt")) out.push(`img sin alt: ${img.getAttribute("src")}`);
  return out;
});
for (const v of violaciones) expect.soft(v, `usabilidad en ${page.url()}`).toBe("");
```

Los inputs escondidos visualmente con una etiqueta que los cubre (checkbox, radio custom) se miden por su etiqueta, no por el input: ajustar el helper si da falsos positivos, y dejar escrito por qué.
