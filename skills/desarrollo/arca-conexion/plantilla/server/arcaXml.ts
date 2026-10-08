/**
 * Lectura mínima de las respuestas SOAP de ARCA. Son XML planos, sin atributos que importen ni
 * namespaces en los campos de datos, así que alcanza con buscar etiquetas: no vale la pena sumar
 * un parser XML entero al servidor.
 */

export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Contenido de cada aparición de <tag>…</tag> (con o sin prefijo de namespace). */
export function xmlBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<(?:[\\w-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

/** Texto de la primera aparición de <tag>, o null. */
export function xmlText(xml: string, tag: string): string | null {
  const [first] = xmlBlocks(xml, tag);
  return first === undefined ? null : decodeEntities(first.trim());
}

export function xmlTexts(xml: string, tag: string): string[] {
  return xmlBlocks(xml, tag).map((b) => decodeEntities(b.trim()));
}
