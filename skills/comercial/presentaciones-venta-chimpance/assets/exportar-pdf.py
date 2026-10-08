#!/usr/bin/env python3
"""
Exporta un deck Chimpancé (.html) a PDF 16:9 limpio — 1 slide = 1 página, sin
páginas en blanco (evita el bug de paginación de Chromium capturando slide por slide).

Uso:
    python exportar-pdf.py <ruta-al-deck.html> [salida.pdf] [--png]

Requisitos: Microsoft Edge o Google Chrome (Windows trae Edge) + PyMuPDF (pip install pymupdf).
También sirve para generar las imágenes de preview de cada slide (--png).
"""
import sys, os, re, subprocess, tempfile, glob

def find_browser():
    cands = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for c in cands:
        if os.path.exists(c):
            return c
    raise SystemExit("No encontré Edge ni Chrome. Instalá uno o pasá el .exe a mano.")

def count_slides(html_path):
    txt = open(html_path, encoding="utf-8").read()
    # ignorar comentarios (instrucciones + archetypes opcionales traen <section class="slide"> de ejemplo)
    txt = re.sub(r"<!--.*?-->", "", txt, flags=re.S)
    return len(re.findall(r'<section[^>]*class="slide\b', txt))

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if not args:
        raise SystemExit(__doc__)
    deck = os.path.abspath(args[0])
    out = os.path.abspath(args[1]) if len(args) > 1 else os.path.splitext(deck)[0] + ".pdf"
    keep_png = "--png" in flags
    n = count_slides(deck)
    if n == 0:
        raise SystemExit("No detecté slides (<section class=\"slide\">) en el deck.")
    browser = find_browser()
    url = "file:///" + deck.replace("\\", "/")
    tmp = tempfile.mkdtemp(prefix="deck_")
    # perfil propio: sin esto, Edge headless falla silenciosamente si el perfil default está en uso
    profile = os.path.join(tmp, "profile")
    pngs = []
    print(f"Exportando {n} slides de {os.path.basename(deck)} ...")
    for k in range(1, n + 1):
        png = os.path.join(tmp, f"slide_{k:02d}.png")
        subprocess.run([
            browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--no-first-run", f"--user-data-dir={profile}",
            "--window-size=1280,720", "--force-device-scale-factor=2",
            "--default-background-color=00000000", "--virtual-time-budget=2500",
            f"--screenshot={png}", f"{url}?slide={k}&bare",
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(png):
            pngs.append(png)
            print(f"  slide {k}/{n} ok")
        else:
            print(f"  slide {k}/{n} FALLO (no se genero)")
    if not pngs:
        raise SystemExit("No se generó ninguna captura. ¿Anda Edge/Chrome?")
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise SystemExit("Falta PyMuPDF: pip install pymupdf")
    # Recomprimir cada placa a JPEG antes de embeber: las capturas 2x en PNG con grano
    # pesan ~10 MB c/u (PDF inenviable). JPEG q85 baja el deck a pocos MB sin perder nitidez visible.
    try:
        from PIL import Image
        jpgs = []
        for png in pngs:
            jpg = os.path.splitext(png)[0] + ".jpg"
            Image.open(png).convert("RGB").save(jpg, "JPEG", quality=85, optimize=True)
            jpgs.append(jpg)
        embed = jpgs
    except ImportError:
        embed = pngs  # sin Pillow, embebe PNG (pesado pero funciona)
    doc = fitz.open()
    rect = fitz.Rect(0, 0, 1280, 720)              # página 16:9 en puntos lógicos
    for img in embed:
        page = doc.new_page(width=1280, height=720)
        page.insert_image(rect, filename=img)
    doc.save(out, deflate=True, garbage=4)
    doc.close()
    mb = os.path.getsize(out) / 1e6
    print(f"\nPDF listo: {out}  ({len(embed)} páginas · {mb:.1f} MB)")
    if keep_png:
        dst = os.path.join(os.path.dirname(out), "slides_png")
        os.makedirs(dst, exist_ok=True)
        for png in pngs:
            os.replace(png, os.path.join(dst, os.path.basename(png)))
        print(f"PNGs en: {dst}")

if __name__ == "__main__":
    main()
