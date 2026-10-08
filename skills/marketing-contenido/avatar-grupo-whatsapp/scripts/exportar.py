#!/usr/bin/env python
"""Exporta un avatar de grupo de WhatsApp (HTML 1080x1080) a PNG con Edge headless.

Uso:  python exportar.py <ruta-al-html> <ruta-salida.png>

- Captura la pagina con Edge headless (perfil temporal, virtual-time-budget
  para que carguen las Google Fonts si el ISO del cliente las usa).
- Verifica que el PNG resultante sea exactamente 1080x1080.
- Sale con codigo != 0 si algo fallo (no hay PNG o dimensiones incorrectas).
"""
import subprocess, sys, tempfile, shutil, os

EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    html, png = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
    if not os.path.isfile(html):
        sys.exit(f"No existe el HTML: {html}")
    edge = next((p for p in EDGE_PATHS if os.path.isfile(p)), None)
    if not edge:
        sys.exit("No se encontro msedge.exe en las rutas conocidas")
    os.makedirs(os.path.dirname(png), exist_ok=True)
    if os.path.exists(png):
        os.remove(png)

    profile = tempfile.mkdtemp(prefix="edge-avatar-")
    try:
        subprocess.run([
            edge, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--force-device-scale-factor=1", f"--user-data-dir={profile}",
            "--virtual-time-budget=9000", "--window-size=1080,1080",
            f"--screenshot={png}", "file:///" + html.replace("\\", "/"),
        ], timeout=60)
    finally:
        shutil.rmtree(profile, ignore_errors=True)

    if not os.path.isfile(png):
        sys.exit("Edge no escribio el PNG (pagina rota o server caido)")
    from PIL import Image
    size = Image.open(png).size
    if size != (1080, 1080):
        sys.exit(f"El PNG salio {size}, no 1080x1080")
    print(f"OK {png} 1080x1080")


if __name__ == "__main__":
    main()
