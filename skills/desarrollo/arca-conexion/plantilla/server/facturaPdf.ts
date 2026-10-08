/**
 * PDF imprimible de la factura electrónica autorizada por ARCA (Factura A/B y Nota de Crédito A/B).
 *
 * Sigue el diseño estándar de "Comprobantes en línea": banda ORIGINAL, cabecera partida con la letra
 * en el medio, período facturado, receptor, detalle, totales y pie con QR + CAE. Todo en negro y gris
 * porque se imprime. Una sola página: si el detalle no entra, achica la letra y en último caso corta
 * con "…" (las facturas reales tienen 1 a 3 líneas).
 *
 * Las fuentes estándar de PDF (Helvetica) solo codifican WinAnsi: cualquier texto que venga de la base
 * pasa por `sanitizePdfText`, que traduce comillas/guiones tipográficos y descarta lo que no se puede
 * dibujar, así un nombre con un carácter raro nunca rompe el comprobante.
 */
import { PDFDocument, PageSizes, StandardFonts, degrees, rgb, type Color, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";

export interface FacturaPdfData {
  kind: "invoice" | "credit_note";
  letter: "A" | "B";
  /** ARCA comprobante code: 1 Factura A, 6 Factura B, 3 NC A, 8 NC B. Shown as "COD. 001" etc. (como el PDF de ARCA). */
  cbteTipo: number;
  pointOfSale: number; // shown 5 digits: 00002
  number: number; // shown 8 digits: 00000001
  issueDate: string; // "YYYY-MM-DD"
  serviceFrom: string; // "YYYY-MM-DD"  (Período facturado desde)
  serviceTo: string; // "YYYY-MM-DD"
  paymentDueDate: string | null; // "YYYY-MM-DD" (Fecha de vto. para el pago)
  emisor: {
    razonSocial: string;
    cuit: string;
    domicilio: string | null;
    condicionIva: string;
    iibb: string | null;
    inicioActividades: string | null /* YYYY-MM-DD */;
  };
  receptor: { razonSocial: string; cuit: string; condicionIva: string; domicilio: string | null };
  condicionVenta: string; // e.g. "Cuenta corriente"
  /** One or more lines. unitPrice/subtotal are NET (without IVA) for A, and WITH IVA included for B. All ARS. */
  items: { description: string; quantity: number; unitPrice: number; subtotal: number }[];
  /** ARS amounts. total = net + iva. ivaRate in % (21, 10.5, 27 or 0). */
  amounts: { net: number; ivaRate: number; iva: number; total: number };
  /** Optional line under totals, e.g. "Equivale a USD 665,50 al dólar BNA vendedor de $ 1.530,00 del 16/09/2026." */
  foreignCurrencyNote?: string | null;
  /** Credit notes: the invoice it corrects, e.g. "Factura B 00002-00000001 del 16/09/2026". */
  associated?: string | null;
  cae: string;
  caeDueDate: string; // "YYYY-MM-DD"
  /** Full ARCA QR URL (already built by the caller). */
  qrUrl: string;
  /** true = ARCA homologación (testing): diagonal watermark "SIN VALIDEZ FISCAL" + a line "Comprobante de prueba (ambiente de homologación de ARCA)". */
  testMode: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatos argentinos
// ─────────────────────────────────────────────────────────────────────────────

/** Redondea a `decimals` sin el error de coma flotante de toFixed (1.005 → 1.01). */
function roundTo(n: number, decimals: number): number {
  if (!Number.isFinite(n)) return 0;
  const r = Number(`${Math.round(Number(`${n}e${decimals}`))}e-${decimals}`);
  return Number.isFinite(r) ? r : Math.round(n * 10 ** decimals) / 10 ** decimals;
}

/** "1.234.567,89" (sin signo pesos). */
function formatNumber(n: number, decimals = 2): string {
  const value = roundTo(Number(n), decimals);
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = decimals > 0 ? `${withDots},${fracPart}` : withDots;
  return negative && abs !== 0 ? `-${body}` : body;
}

/** "$ 1.234,56" (negative with leading "-"). Exported for tests. */
export function formatArs(n: number): string {
  const body = formatNumber(n, 2);
  return body.startsWith("-") ? `-$ ${body.slice(1)}` : `$ ${body}`;
}

/** "YYYY-MM-DD" (o ISO con hora) → "DD/MM/AAAA"; vacío → "—". */
function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s).trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s);
}

/** 21 → "21%", 10.5 → "10,5%". */
function formatRate(rate: number): string {
  const r = roundTo(Number(rate) || 0, 2);
  const txt = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
  return `${txt}%`;
}

function pad(n: number, len: number): string {
  const v = Math.max(0, Math.trunc(Number(n)) || 0);
  return String(v).padStart(len, "0");
}

function digitsOnly(s: string | null | undefined): string {
  return String(s ?? "").replace(/\D/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Texto seguro para WinAnsi (fuentes estándar de PDF)
// ─────────────────────────────────────────────────────────────────────────────

/** Code points que se traducen a un equivalente ASCII (comillas, guiones, viñetas y espacios raros). */
const REPLACEMENTS = new Map<number, string>([
  ...[0x2018, 0x2019, 0x201a, 0x201b, 0x2032, 0x00b4].map((cp) => [cp, "'"] as [number, string]),
  ...[0x201c, 0x201d, 0x201e, 0x201f, 0x2033].map((cp) => [cp, '"'] as [number, string]),
  ...[0x2010, 0x2011, 0x2012, 0x2013, 0x2015, 0x2212, 0x00ad, 0x2022].map((cp) => [cp, "-"] as [number, string]),
  ...[0x00a0, 0x2002, 0x2003, 0x2007, 0x2009, 0x202f, 0x09, 0x0a, 0x0d].map((cp) => [cp, " "] as [number, string]),
]);

/** Raya (U+2014) y puntos suspensivos (U+2026) están en WinAnsi y los usa el propio PDF (vacíos y cortes). */
const EXTRA_ALLOWED = new Set<number>([0x2014, 0x2026]);

function isAllowedChar(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa1 && cp <= 0xff && cp !== 0xad) || EXTRA_ALLOWED.has(cp);
}

function sanitizePdfText(input: unknown): string {
  if (input === null || input === undefined) return "";
  const s = String(input).normalize("NFC");
  let out = "";
  for (const ch of s) {
    const rep = REPLACEMENTS.get(ch.codePointAt(0) ?? 0);
    if (rep !== undefined) {
      out += rep;
    } else if (isAllowedChar(ch)) {
      out += ch;
    } else {
      // "ş" → "s", "ﬁ" → "fi"; lo que no tenga equivalente se descarta.
      for (const b of ch.normalize("NFKD").replace(/\p{M}+/gu, "")) if (isAllowedChar(b)) out += b;
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitivas de dibujo (coordenadas desde ARRIBA de la página)
// ─────────────────────────────────────────────────────────────────────────────

const MARGIN = 28;
const STROKE = 0.8;
const BLACK = rgb(0, 0, 0);
const DARK_GRAY = rgb(0.25, 0.25, 0.25);
const HEADER_FILL = rgb(0.87, 0.87, 0.87);
const ROW_LINE = rgb(0.78, 0.78, 0.78);
const WATERMARK = rgb(0.86, 0.36, 0.46);

type Align = "left" | "right" | "center";

interface Ctx {
  page: PDFPage;
  ph: number;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

/**
 * Ancho SIN kerning. `PDFFont.widthOfTextAtSize` suma los pares de kerning, pero `drawText` no los
 * aplica al dibujar: con esa medida la etiqueta en negrita queda más ancha de lo calculado y el valor
 * se le pega ("CUIT:3071…"). Sumando carácter por carácter la medida coincide con lo dibujado.
 */
const charWidthCache = new WeakMap<PDFFont, Map<string, number>>();
function textWidth(font: PDFFont, text: string, size: number): number {
  let cache = charWidthCache.get(font);
  if (!cache) {
    cache = new Map();
    charWidthCache.set(font, cache);
  }
  let units = 0;
  for (const ch of text) {
    let w = cache.get(ch);
    if (w === undefined) {
      w = font.widthOfTextAtSize(ch, 1);
      cache.set(ch, w);
    }
    units += w;
  }
  return units * size;
}

function fitSize(font: PDFFont, text: string, size: number, maxWidth: number, minSize: number): number {
  let s = size;
  while (s > minSize && textWidth(font, text, s) > maxWidth) s = Math.max(minSize, s - 0.25);
  return s;
}

function truncateToWidth(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (textWidth(font, text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && textWidth(font, `${t}…`, size) > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Word-wrap por ancho real de la fuente. Respeta saltos de línea y parte palabras que no entran solas. */
function wrapText(font: PDFFont, text: string, size: number, maxWidth: number, firstLineWidth = maxWidth): string[] {
  const lines: string[] = [];
  const limit = () => (lines.length === 0 ? firstLineWidth : maxWidth);
  const paragraphs = String(text ?? "").split(/\r?\n/);
  for (const para of paragraphs) {
    const words = sanitizePdfText(para).split(" ").filter((w) => w.length > 0);
    if (words.length === 0) continue;
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (textWidth(font, candidate, size) <= limit()) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      let rest = word;
      while (rest.length > 1 && textWidth(font, rest, size) > limit()) {
        let cut = 1;
        while (cut < rest.length - 1 && textWidth(font, rest.slice(0, cut + 1), size) <= limit()) cut++;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      current = rest;
    }
    if (current) lines.push(current);
  }
  return lines;
}

interface TextOpts {
  size: number;
  font?: PDFFont;
  color?: Color;
  align?: Align;
  /** Si no entra, achica hasta minSize y después corta con "…". */
  maxWidth?: number;
  minSize?: number;
}

/** Dibuja una línea con la base en `baseline` (medida desde arriba). Devuelve el ancho dibujado. */
function drawText(ctx: Ctx, raw: string, x: number, baseline: number, o: TextOpts): number {
  const font = o.font ?? ctx.font;
  let text = sanitizePdfText(raw);
  if (!text) return 0;
  let size = o.size;
  if (o.maxWidth !== undefined) {
    size = fitSize(font, text, size, o.maxWidth, o.minSize ?? size);
    text = truncateToWidth(font, text, size, o.maxWidth);
  }
  const w = textWidth(font, text, size);
  const left = o.align === "right" ? x - w : o.align === "center" ? x - w / 2 : x;
  ctx.page.drawText(text, { x: left, y: ctx.ph - baseline, size, font, color: o.color ?? BLACK });
  return w;
}

interface Seg {
  text: string;
  bold?: boolean;
}

/** Varios tramos en una línea (etiqueta en negrita + valor). Achica todo junto si no entra. */
function drawSegments(
  ctx: Ctx,
  segs: Seg[],
  x: number,
  baseline: number,
  size: number,
  o: { maxWidth?: number; minSize?: number; align?: Align } = {},
): number {
  const clean = segs.map((s) => ({ text: sanitizePdfText(s.text), font: s.bold ? ctx.bold : ctx.font }));
  const widthAt = (sz: number) => clean.reduce((acc, s) => acc + textWidth(s.font, s.text, sz), 0);
  let sz = size;
  if (o.maxWidth !== undefined) {
    const min = o.minSize ?? 6;
    while (sz > min && widthAt(sz) > o.maxWidth) sz = Math.max(min, sz - 0.25);
  }
  const total = widthAt(sz);
  let cx = o.align === "right" ? x - total : o.align === "center" ? x - total / 2 : x;
  for (const s of clean) {
    if (s.text) ctx.page.drawText(s.text, { x: cx, y: ctx.ph - baseline, size: sz, font: s.font, color: BLACK });
    cx += textWidth(s.font, s.text, sz);
  }
  return total;
}

/**
 * "Etiqueta: valor" con la etiqueta en negrita y el valor que sigue en la misma línea y, si no entra,
 * continúa debajo alineado a `x`. Devuelve la altura usada.
 */
function drawLabelValue(
  ctx: Ctx,
  label: string,
  value: string | null | undefined,
  x: number,
  top: number,
  maxWidth: number,
  size: number,
  lineHeight: number,
): number {
  const labelText = `${sanitizePdfText(label)} `;
  const labelW = textWidth(ctx.bold, labelText, size);
  const firstW = maxWidth - labelW;
  const labelOwnLine = firstW < Math.min(60, maxWidth * 0.35);
  const lines = labelOwnLine
    ? wrapText(ctx.font, value ?? "", size, maxWidth)
    : wrapText(ctx.font, value ?? "", size, maxWidth, firstW);

  drawText(ctx, label, x, top + size, { size, font: ctx.bold, maxWidth, minSize: size * 0.7 });
  let row = labelOwnLine ? 1 : 0;
  lines.forEach((line, i) => {
    const lx = !labelOwnLine && i === 0 ? x + labelW : x;
    drawText(ctx, line, lx, top + size + row * lineHeight, { size });
    row++;
  });
  return Math.max(1, row) * lineHeight;
}

function drawBox(ctx: Ctx, x: number, top: number, w: number, h: number, fill?: Color, border = true): void {
  const opts: Parameters<PDFPage["drawRectangle"]>[0] = { x, y: ctx.ph - top - h, width: w, height: h };
  if (fill) opts.color = fill;
  if (border) {
    opts.borderColor = BLACK;
    opts.borderWidth = STROKE;
  }
  ctx.page.drawRectangle(opts);
}

function hLine(ctx: Ctx, x1: number, x2: number, top: number, color: Color = BLACK, thickness = STROKE): void {
  ctx.page.drawLine({ start: { x: x1, y: ctx.ph - top }, end: { x: x2, y: ctx.ph - top }, thickness, color });
}

function vLine(ctx: Ctx, x: number, top1: number, top2: number, color: Color = BLACK, thickness = STROKE): void {
  ctx.page.drawLine({ start: { x, y: ctx.ph - top1 }, end: { x, y: ctx.ph - top2 }, thickness, color });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de ítems
// ─────────────────────────────────────────────────────────────────────────────

interface Col {
  title: string;
  width: number;
  align: Align;
}

const COLS_A: Col[] = [
  { title: "Código", width: 36, align: "left" },
  { title: "Producto / Servicio", width: 150, align: "left" },
  { title: "Cantidad", width: 42, align: "right" },
  { title: "U. Medida", width: 44, align: "center" },
  { title: "Precio Unit.", width: 62, align: "right" },
  { title: "% Bonif", width: 34, align: "right" },
  { title: "Subtotal", width: 62, align: "right" },
  { title: "Alícuota IVA", width: 43, align: "right" },
  { title: "Subtotal c/IVA", width: 66, align: "right" },
];

const COLS_B: Col[] = [
  { title: "Código", width: 36, align: "left" },
  { title: "Producto / Servicio", width: 185, align: "left" },
  { title: "Cantidad", width: 44, align: "right" },
  { title: "U. Medida", width: 46, align: "center" },
  { title: "Precio Unit.", width: 72, align: "right" },
  { title: "% Bonif", width: 38, align: "right" },
  { title: "Imp. Bonif.", width: 46, align: "right" },
  { title: "Subtotal", width: 72, align: "right" },
];

const DESC_COL = 1;
const CELL_PAD = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Comprobante
// ─────────────────────────────────────────────────────────────────────────────

export async function buildFacturaPdf(data: FacturaPdfData): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const [pw, ph] = PageSizes.A4;
  const page = pdf.addPage([pw, ph]);
  const ctx: Ctx = {
    page,
    ph,
    font: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
  };

  const isA = data.letter === "A";
  const isCredit = data.kind === "credit_note";
  const pos = pad(data.pointOfSale, 5);
  const nro = pad(data.number, 8);
  const letter = sanitizePdfText(data.letter) || "-";

  pdf.setTitle(`${isCredit ? "Nota de crédito" : "Factura"} ${letter} ${pos}-${nro}`);
  pdf.setAuthor("Chimpancé ERP");
  pdf.setCreator("Chimpancé ERP");
  pdf.setProducer("Chimpancé ERP");
  pdf.setSubject(`CAE ${sanitizePdfText(data.cae)}`);
  pdf.setLanguage("es-AR");

  const X0 = MARGIN;
  const X1 = pw - MARGIN;
  const W = X1 - X0;
  const MID = pw / 2;
  const GAP = 4;
  let y = MARGIN;

  // 1. Banda ORIGINAL ─────────────────────────────────────────────────────────
  drawBox(ctx, X0, y, W, 20);
  drawText(ctx, "ORIGINAL", MID, y + 14, { size: 11, font: ctx.bold, align: "center" });
  y += 20;

  if (data.testMode) {
    drawText(ctx, "Comprobante de prueba (ambiente de homologación de ARCA)", MID, y + 12, {
      size: 8.5,
      font: ctx.bold,
      align: "center",
    });
    y += 16;
  }
  y += GAP;

  // 2. Cabecera ───────────────────────────────────────────────────────────────
  const headerTop = y;
  const LETTER_W = 48;
  const LETTER_H = 46;
  const letterX = MID - LETTER_W / 2;
  const HS = 8.5; // tamaño de las líneas de la cabecera
  const HLH = 11.5;

  // Mitad izquierda: emisor
  const leftX = X0 + 10;
  const leftW = letterX - 10 - leftX;
  let ly = headerTop + 10;
  {
    const name = sanitizePdfText(data.emisor.razonSocial);
    let nameSize = fitSize(ctx.bold, name, 15, leftW, 10);
    let nameLines = [name];
    if (textWidth(ctx.bold, name, nameSize) > leftW) {
      nameSize = 10;
      nameLines = wrapText(ctx.bold, name, nameSize, leftW).slice(0, 3);
    }
    for (const line of nameLines) {
      drawText(ctx, line, leftX + leftW / 2, ly + nameSize, { size: nameSize, font: ctx.bold, align: "center", maxWidth: leftW });
      ly += nameSize * 1.2;
    }
  }
  ly += 12;
  ly += drawLabelValue(ctx, "Razón Social:", data.emisor.razonSocial, leftX, ly, leftW, HS, HLH) + 2;
  ly += drawLabelValue(ctx, "Domicilio Comercial:", data.emisor.domicilio ?? "—", leftX, ly, leftW, HS, HLH) + 2;
  ly += drawLabelValue(ctx, "Condición frente al IVA:", data.emisor.condicionIva, leftX, ly, leftW, HS, HLH);

  // Mitad derecha: tipo y número de comprobante
  const rightX = letterX + LETTER_W + 12;
  const rightW = X1 - 10 - rightX;
  let ry = headerTop + 8;
  drawText(ctx, isCredit ? "NOTA DE CRÉDITO" : "FACTURA", rightX, ry + 18, {
    size: 18,
    font: ctx.bold,
    maxWidth: rightW,
    minSize: 12,
  });
  ry += 28;
  drawSegments(
    ctx,
    [
      { text: "Punto de Venta: ", bold: true },
      { text: pos, bold: true },
      { text: "      Comp. Nro: ", bold: true },
      { text: nro, bold: true },
    ],
    rightX,
    ry + 9,
    9,
    { maxWidth: rightW },
  );
  ry += 14;
  ry += drawLabelValue(ctx, "Fecha de Emisión:", formatDate(data.issueDate), rightX, ry, rightW, 9, 13);
  ry += 6;
  ry += drawLabelValue(ctx, "CUIT:", digitsOnly(data.emisor.cuit), rightX, ry, rightW, HS, HLH) + 1;
  ry += drawLabelValue(ctx, "Ingresos Brutos:", data.emisor.iibb || "—", rightX, ry, rightW, HS, HLH) + 1;
  ry += drawLabelValue(
    ctx,
    "Fecha de Inicio de Actividades:",
    data.emisor.inicioActividades ? formatDate(data.emisor.inicioActividades) : "—",
    rightX,
    ry,
    rightW,
    HS,
    HLH,
  );

  const headerBottom = Math.max(ly, ry, headerTop + LETTER_H + 20) + 8;
  drawBox(ctx, X0, headerTop, W, headerBottom - headerTop);
  vLine(ctx, MID, headerTop + LETTER_H, headerBottom);
  drawBox(ctx, letterX, headerTop, LETTER_W, LETTER_H, rgb(1, 1, 1));
  drawText(ctx, letter, MID, headerTop + 30, { size: 28, font: ctx.bold, align: "center" });
  drawText(ctx, `COD. ${pad(data.cbteTipo, 3)}`, MID, headerTop + 41, { size: 7, font: ctx.bold, align: "center" });
  y = headerBottom + GAP;

  // 3. Período facturado ──────────────────────────────────────────────────────
  {
    const h = 20;
    const segs: Seg[] = [
      { text: "Período Facturado Desde: ", bold: true },
      { text: formatDate(data.serviceFrom) },
      { text: "        Hasta: ", bold: true },
      { text: formatDate(data.serviceTo) },
    ];
    if (data.paymentDueDate) {
      segs.push({ text: "        Fecha de Vto. para el pago: ", bold: true }, { text: formatDate(data.paymentDueDate) });
    }
    drawBox(ctx, X0, y, W, h);
    drawSegments(ctx, segs, X0 + 10, y + 13.5, HS, { maxWidth: W - 20 });
    y += h + GAP;
  }

  // 4. Receptor ───────────────────────────────────────────────────────────────
  {
    const top = y;
    const inner = 7;
    const colLX = X0 + 10;
    const colLW = 215;
    const colRX = colLX + colLW + 12;
    const colRW = X1 - 10 - colRX;
    type Field = { label: string; value: string };
    const left: Field[] = [
      { label: "CUIT:", value: digitsOnly(data.receptor.cuit) || "—" },
      { label: "Condición frente al IVA:", value: data.receptor.condicionIva },
      { label: "Condición de venta:", value: data.condicionVenta },
    ];
    const right: Field[] = [{ label: "Apellido y Nombre / Razón Social:", value: data.receptor.razonSocial }];
    if (data.receptor.domicilio) right.push({ label: "Domicilio:", value: data.receptor.domicilio });
    if (data.associated) right.push({ label: "Comprobante asociado:", value: data.associated });

    let cy = top + inner;
    const rows = Math.max(left.length, right.length);
    for (let i = 0; i < rows; i++) {
      const hl = left[i] ? drawLabelValue(ctx, left[i].label, left[i].value, colLX, cy, colLW, HS, HLH) : 0;
      const hr = right[i] ? drawLabelValue(ctx, right[i].label, right[i].value, colRX, cy, colRW, HS, HLH) : 0;
      cy += Math.max(hl, hr) + 2;
    }
    const bottom = cy + inner - 2;
    drawBox(ctx, X0, top, W, bottom - top);
    y = bottom + GAP + 2;
  }

  // 6/7. Zona inferior: se calcula antes para saber cuánto alto le queda al detalle ─────────
  const pageBottom = ph - MARGIN;
  const QR_SIZE = 90;
  const qrTop = pageBottom - 14 - QR_SIZE;
  const regionBottom = qrTop - 8;

  const TOTALS_W = 250;
  const totalsX = X1 - TOTALS_W;
  const valueRight = X1 - 8;
  const labelRight = valueRight - 84;

  type TotalRow = { label: string; value: number; strong?: boolean };
  let totalRows: TotalRow[];
  if (isA) {
    const ivaRates = [27, 21, 10.5, 5, 2.5, 0];
    const rate = Number(data.amounts.ivaRate) || 0;
    if (!ivaRates.some((r) => Math.abs(r - rate) < 0.001)) {
      ivaRates.push(rate);
      ivaRates.sort((a, b) => b - a);
    }
    totalRows = [
      { label: "Importe Neto Gravado: $", value: data.amounts.net },
      ...ivaRates.map((r) => ({
        label: `IVA ${formatRate(r)}: $`,
        value: Math.abs(r - rate) < 0.001 ? data.amounts.iva : 0,
      })),
      { label: "Importe Otros Tributos: $", value: 0 },
      { label: "Importe Total: $", value: data.amounts.total, strong: true },
    ];
  } else {
    totalRows = [
      { label: "Subtotal: $", value: data.amounts.total },
      { label: "Importe Otros Tributos: $", value: 0 },
      { label: "Importe Total: $", value: data.amounts.total, strong: true },
    ];
  }
  const TOTAL_ROW_H = isA ? 13 : 14.5;
  const totalsH = 8 + totalRows.length * TOTAL_ROW_H + 5;
  const TRANSP_H = 46;
  const regionH = totalsH + (isA ? 0 : GAP + TRANSP_H);
  const regionTop = regionBottom - regionH;
  const itemsBottom = regionTop - 6;

  // 5. Detalle ────────────────────────────────────────────────────────────────
  {
    const baseCols = isA ? COLS_A : COLS_B;
    const scale = W / baseCols.reduce((a, c) => a + c.width, 0);
    const cols = baseCols.map((c) => ({ ...c, width: c.width * scale }));
    const colX: number[] = [];
    cols.reduce((acc, c, i) => ((colX[i] = acc), acc + c.width), X0);

    const tableTop = y;
    // Encabezado gris
    const HEAD_SIZE = 7.5;
    const headLines = cols.map((c) => wrapText(ctx.bold, c.title, HEAD_SIZE, c.width - 6));
    const headH = Math.max(...headLines.map((l) => l.length)) * 9 + 8;
    drawBox(ctx, X0, tableTop, W, headH, HEADER_FILL);
    cols.forEach((c, i) => {
      if (i > 0) vLine(ctx, colX[i], tableTop, tableTop + headH);
      const lines = headLines[i];
      const blockTop = tableTop + (headH - lines.length * 9) / 2;
      lines.forEach((line, li) => {
        drawText(ctx, line, colX[i] + c.width / 2, blockTop + 7 + li * 9, { size: HEAD_SIZE, font: ctx.bold, align: "center" });
      });
    });

    const rateLabel = formatRate(data.amounts.ivaRate);
    const rowCells = (it: FacturaPdfData["items"][number]): string[] => {
      const qty = formatNumber(it.quantity, 2);
      const unit = formatNumber(it.unitPrice, 2);
      const sub = formatNumber(it.subtotal, 2);
      if (isA) {
        const conIva = formatNumber(roundTo(Number(it.subtotal) * (1 + (Number(data.amounts.ivaRate) || 0) / 100), 2), 2);
        return ["", it.description, qty, "unidades", unit, "0,00", sub, rateLabel, conIva];
      }
      return ["", it.description, qty, "unidades", unit, "0,00", "0,00", sub];
    };

    const rowsTop = tableTop + headH;
    const available = itemsBottom - rowsTop - 4;
    const descWidth = cols[DESC_COL].width - CELL_PAD * 2;
    const measure = (size: number) => {
      const lh = size * 1.25;
      const rows = data.items.map((it) => {
        const lines = wrapText(ctx.font, it.description, size, descWidth);
        return { lines, h: Math.max(1, lines.length) * lh + 6 };
      });
      return { lh, rows, total: rows.reduce((a, r) => a + r.h, 0) };
    };
    let size = 8;
    let layout = measure(size);
    for (const s of [8, 7.5, 7, 6.5, 6]) {
      size = s;
      layout = measure(s);
      if (layout.total <= available) break;
    }

    let rowTop = rowsTop;
    for (let r = 0; r < data.items.length; r++) {
      const row = layout.rows[r];
      let lines = row.lines;
      let h = row.h;
      let lastRow = false;
      if (rowTop + h > itemsBottom - 2) {
        // No entra entero: lo que quepa, con "…" en la última línea, y cortamos acá.
        const fit = Math.floor((itemsBottom - 2 - rowTop - 6) / layout.lh);
        if (fit < 1) break;
        lines = lines.slice(0, fit);
        lines[fit - 1] = truncateToWidth(ctx.font, `${lines[fit - 1] ?? ""} …`, size, descWidth);
        h = fit * layout.lh + 6;
        lastRow = true;
      }
      const cells = rowCells(data.items[r]);
      const baseline = rowTop + 3 + size;
      cols.forEach((c, i) => {
        if (i === DESC_COL) {
          lines.forEach((line, li) => drawText(ctx, line, colX[i] + CELL_PAD, baseline + li * layout.lh, { size }));
          return;
        }
        const text = cells[i];
        if (!text) return;
        const x = c.align === "right" ? colX[i] + c.width - CELL_PAD : c.align === "center" ? colX[i] + c.width / 2 : colX[i] + CELL_PAD;
        drawText(ctx, text, x, baseline, { size, align: c.align, maxWidth: c.width - CELL_PAD * 2, minSize: 5 });
      });
      rowTop += h;
      hLine(ctx, X0 + 2, X1 - 2, rowTop, ROW_LINE, 0.5);
      if (lastRow) break;
    }

    // Marco del detalle hasta la zona de totales
    drawBox(ctx, X0, tableTop, W, itemsBottom - tableTop);
  }

  // 6. Totales ────────────────────────────────────────────────────────────────
  {
    drawBox(ctx, totalsX, regionTop, TOTALS_W, totalsH);
    let ty = regionTop + 8;
    totalRows.forEach((row) => {
      const sz = row.strong ? 10 : 8.5;
      if (row.strong) hLine(ctx, totalsX + 8, X1 - 8, ty - 1, ROW_LINE, 0.5);
      const baseline = ty + (row.strong ? 11 : 9.5);
      drawText(ctx, row.label, labelRight, baseline, { size: sz, font: ctx.bold, align: "right" });
      drawText(ctx, formatNumber(row.value, 2), valueRight, baseline, {
        size: sz,
        font: ctx.bold,
        align: "right",
        maxWidth: 80,
        minSize: 6,
      });
      ty += TOTAL_ROW_H;
    });

    if (!isA) {
      const tTop = regionTop + totalsH + GAP;
      drawBox(ctx, totalsX, tTop, TOTALS_W, TRANSP_H);
      drawText(ctx, "Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)", totalsX + 8, tTop + 12, {
        size: 7.5,
        font: ctx.bold,
        maxWidth: TOTALS_W - 16,
        minSize: 6,
      });
      drawText(ctx, "IVA Contenido: $", labelRight, tTop + 26, { size: 8, align: "right" });
      drawText(ctx, formatNumber(data.amounts.iva, 2), valueRight, tTop + 26, { size: 8, align: "right", maxWidth: 80, minSize: 6 });
      drawText(ctx, "Otros Impuestos Nacionales Indirectos: $", labelRight, tTop + 38, { size: 8, align: "right" });
      drawText(ctx, "0,00", valueRight, tTop + 38, { size: 8, align: "right" });
    }

    if (data.foreignCurrencyNote) {
      const noteW = totalsX - 14 - X0;
      const NOTE_SIZE = 8;
      const NOTE_LH = 10;
      const maxLines = Math.max(1, Math.floor((regionBottom - regionTop - 4) / NOTE_LH));
      let lines = wrapText(ctx.italic, data.foreignCurrencyNote, NOTE_SIZE, noteW);
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[maxLines - 1] = truncateToWidth(ctx.italic, `${lines[maxLines - 1]} …`, NOTE_SIZE, noteW);
      }
      lines.forEach((line, i) => {
        drawText(ctx, line, X0 + 2, regionTop + 10 + i * NOTE_LH, { size: NOTE_SIZE, font: ctx.italic, color: DARK_GRAY });
      });
    }
  }

  // 7. Pie: QR + CAE ─────────────────────────────────────────────────────────
  {
    if (data.qrUrl) {
      const png = await QRCode.toBuffer(data.qrUrl, { type: "png", errorCorrectionLevel: "M", margin: 0, width: 300 });
      const img = await pdf.embedPng(png);
      page.drawImage(img, { x: X0, y: ph - qrTop - QR_SIZE, width: QR_SIZE, height: QR_SIZE });
    }
    const textX = X0 + QR_SIZE + 14;
    drawText(ctx, "Comprobante Autorizado", textX, qrTop + 30, { size: 11, font: ctx.boldItalic });
    const legend = wrapText(
      ctx.italic,
      "Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación",
      6.5,
      190,
    );
    legend.forEach((line, i) => drawText(ctx, line, textX, qrTop + 44 + i * 8.5, { size: 6.5, font: ctx.italic }));

    drawSegments(ctx, [{ text: "CAE N°: ", bold: true }, { text: data.cae }], X1, qrTop + 30, 10, {
      align: "right",
      maxWidth: 200,
    });
    drawSegments(ctx, [{ text: "Fecha de Vto. de CAE: ", bold: true }, { text: formatDate(data.caeDueDate) }], X1, qrTop + 45, 10, {
      align: "right",
      maxWidth: 200,
    });
    drawText(ctx, "Pág. 1/1", MID, pageBottom - 2, { size: 8, font: ctx.bold, align: "center" });
  }

  // 8. Marca de agua de homologación (encima, casi transparente) ──────────────
  if (data.testMode) {
    const text = "SIN VALIDEZ FISCAL";
    const angle = Math.atan2(ph, pw);
    const diag = Math.hypot(pw, ph);
    const size = Math.min(90, (diag * 0.72) / textWidth(ctx.bold, text, 1));
    const w = textWidth(ctx.bold, text, size);
    const capH = size * 0.72;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // centro de la página en coordenadas PDF (origen abajo a la izquierda)
    const x = pw / 2 - (w / 2) * cos + (capH / 2) * sin;
    const yPdf = ph / 2 - (w / 2) * sin - (capH / 2) * cos;
    page.drawText(text, {
      x,
      y: yPdf,
      size,
      font: ctx.bold,
      color: WATERMARK,
      opacity: 0.16,
      rotate: degrees((angle * 180) / Math.PI),
    });
  }

  return Buffer.from(await pdf.save());
}
