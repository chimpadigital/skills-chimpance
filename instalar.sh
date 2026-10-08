#!/usr/bin/env bash
# Copia cada skill del repo (cualquier carpeta con SKILL.md, en el nivel que esté)
# a ~/.claude/skills/<nombre>, que es donde Claude Code los busca.
# Uso: bash instalar.sh            -> instala/actualiza todos
#      bash instalar.sh comercial  -> solo los de una carpeta (rol o proyecto)
set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
BASE="$REPO/skills/${1:-}"
mkdir -p "$DEST"
# Solo el SKILL.md de nivel superior de cada skill (algunos traen sub-skills adentro).
find "$BASE" -name SKILL.md -not -path '*/skills/*/skills/*' | sort | while read -r f; do
  dir="$(dirname "$f")"; name="$(basename "$dir")"
  rm -rf "${DEST:?}/$name"
  cp -r "$dir" "$DEST/$name"
  echo "✔ $name"
done
