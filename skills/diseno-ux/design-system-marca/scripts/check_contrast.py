#!/usr/bin/env python3
"""Verifica contraste WCAG de los pares declarados en _contrast_pairs de tokens.json.

Uso:
    python check_contrast.py tokens.json

El JSON debe tener un bloque "_contrast_pairs":
    "_contrast_pairs": [
        {"fg": "semantic.light.color-text-primary", "bg": "semantic.light.color-bg-page", "level": "AA-normal"}
    ]

Niveles: AA-normal (4.5:1), AA-large (3:1), AA-ui (3:1), AAA-normal (7:1).
Las rutas se resuelven dentro del JSON; los valores pueden ser hex directos o
referencias "{primitive.color.x.500}" (se resuelven recursivamente).

Salida: un renglón por par con ratio y PASS/FAIL. Exit code 1 si algún par falla.
"""
import json
import re
import sys

LEVELS = {"AA-normal": 4.5, "AA-large": 3.0, "AA-ui": 3.0, "AAA-normal": 7.0, "AAA-large": 4.5}


def get_path(data, path):
    node = data
    for part in path.split("."):
        if not isinstance(node, dict) or part not in node:
            raise KeyError(f"Ruta no encontrada: {path} (falla en '{part}')")
        node = node[part]
    return node


def resolve_value(data, node, depth=0):
    if depth > 10:
        raise ValueError("Referencia circular en tokens")
    if isinstance(node, dict):
        node = node.get("$value", node)
    if isinstance(node, dict):
        raise ValueError(f"Nodo sin $value resoluble: {node}")
    value = str(node).strip()
    match = re.fullmatch(r"\{([^}]+)\}", value)
    if match:
        return resolve_value(data, get_path(data, match.group(1)), depth + 1)
    return value


def hex_to_rgb(value):
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    if len(value) == 8:  # ignora canal alfa
        value = value[:6]
    if len(value) != 6 or not re.fullmatch(r"[0-9a-fA-F]{6}", value):
        raise ValueError(f"Color no válido: #{value}")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def relative_luminance(rgb):
    def channel(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg_hex, bg_hex):
    l1 = relative_luminance(hex_to_rgb(fg_hex))
    l2 = relative_luminance(hex_to_rgb(bg_hex))
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)

    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)

    pairs = data.get("_contrast_pairs")
    if not pairs:
        print("ERROR: el JSON no tiene bloque '_contrast_pairs'. Agregalo (ver references/tokens.md).")
        sys.exit(2)

    failures = 0
    print(f"{'RESULTADO':<9} {'RATIO':>6}  {'MÍNIMO':>6}  PAR")
    for pair in pairs:
        level = pair.get("level", "AA-normal")
        minimum = LEVELS.get(level)
        label = f"{pair['fg']} sobre {pair['bg']} [{level}]"
        try:
            if minimum is None:
                raise ValueError(f"Nivel desconocido: {level} (usar {', '.join(LEVELS)})")
            fg = resolve_value(data, get_path(data, pair["fg"]))
            bg = resolve_value(data, get_path(data, pair["bg"]))
            ratio = contrast_ratio(fg, bg)
            ok = ratio >= minimum
            status = "PASS" if ok else "FAIL"
            print(f"{status:<9} {ratio:>6.2f}  {minimum:>6.2f}  {label}  ({fg} / {bg})")
            if not ok:
                failures += 1
        except (KeyError, ValueError) as exc:
            print(f"{'ERROR':<9} {'-':>6}  {'-':>6}  {label}  → {exc}")
            failures += 1

    total = len(pairs)
    print(f"\n{total - failures}/{total} pares OK.")
    if failures:
        print("Ajustá los tokens que fallan (mover al paso más oscuro/claro de la rampa suele alcanzar) y volvé a correr.")
        sys.exit(1)


if __name__ == "__main__":
    main()
