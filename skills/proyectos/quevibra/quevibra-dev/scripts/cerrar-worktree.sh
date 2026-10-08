#!/usr/bin/env bash
# Cierra una tarea de QueVibra cuando el PR ya está mergeado y publicado:
# borra el worktree, la base qv_<tema>, la entrada del launch.json y la rama local.
# La rama en GitHub queda (la borra GitHub al mergear, si está configurado).
#
# Uso:  bash ~/.claude/skills/quevibra-dev/scripts/cerrar-worktree.sh <tema> [--forzar]
#   --forzar  cierra aunque haya cambios sin commitear o commits sin subir (se PIERDEN).
# Antes: preview_stop del preview "qv-<tema>" si está corriendo.
source "$(dirname "${BASH_SOURCE[0]}")/_comun.sh"

TEMA="${1:-}"
[[ "$TEMA" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]] || { qv_fail "Uso: cerrar-worktree.sh <tema> [--forzar]"; exit 1; }
FORZAR=0; [ "${2:-}" = "--forzar" ] && FORZAR=1
WT="$QV_GITREPO/qv-$TEMA"; DB="qv_${TEMA//-/_}"; NAME="qv-$TEMA"

if [ -d "$WT" ]; then
  RAMA="$(git -C "$WT" branch --show-current)"
  SUCIO="$(git -C "$WT" status --porcelain)"
  SIN_SUBIR=""
  if [ -n "$RAMA" ] && git -C "$WT" rev-parse --verify --quiet "origin/$RAMA" >/dev/null; then
    SIN_SUBIR="$(git -C "$WT" log --oneline "origin/$RAMA..HEAD")"
  elif [ -n "$RAMA" ]; then
    SIN_SUBIR="$(git -C "$WT" log --oneline "origin/main..HEAD")"
  fi
  if [ $FORZAR = 0 ] && { [ -n "$SUCIO" ] || [ -n "$SIN_SUBIR" ]; }; then
    qv_fail "El worktree tiene trabajo sin guardar o sin subir. No borro nada."
    [ -n "$SUCIO" ] && echo "$SUCIO" | sed 's/^/     /'
    [ -n "$SIN_SUBIR" ] && echo "$SIN_SUBIR" | sed 's/^/     sin subir: /'
    echo "     Si de verdad no sirve: cerrar-worktree.sh $TEMA --forzar"
    exit 1
  fi
  # El junction se saca primero para que nada toque el node_modules compartido.
  # Seguro: si node_modules es un junction, se borra SOLO el enlace; si no se puede, no se sigue
  # (git worktree remove podría meterse adentro del enlace y vaciar el node_modules compartido).
  if [ -e "$WT/node_modules" ] || [ -L "$WT/node_modules" ]; then
    TIPO="$(powershell.exe -NoProfile -Command "(Get-Item -Force '$(cygpath -w "$WT/node_modules")').LinkType" 2>/dev/null | tr -d '\r')"
    if [ "$TIPO" = "Junction" ] || [ "$TIPO" = "SymbolicLink" ]; then
      powershell.exe -NoProfile -Command "(Get-Item -Force '$(cygpath -w "$WT/node_modules")').Delete()" >/dev/null 2>&1
    fi
    if [ -e "$WT/node_modules" ] && [ "$TIPO" = "Junction" ]; then
      qv_fail "No pude sacar el enlace node_modules de $WT. Paro para no tocar el node_modules compartido."; exit 1
    fi
  fi
  git -C "$QV_MAIN_CLONE" worktree remove --force "$WT" && qv_ok "Worktree $WT borrado"
  if [ -n "$RAMA" ] && [ "$RAMA" != "main" ]; then
    git -C "$QV_MAIN_CLONE" branch -D "$RAMA" >/dev/null 2>&1 && qv_ok "Rama local $RAMA borrada (la de GitHub queda)"
  fi
else
  qv_warn "No existe $WT"
fi

if qv_pg_up && qv_db_exists "$DB"; then
  qv_psql_admin -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB' AND pid<>pg_backend_pid();" >/dev/null
  qv_psql_admin -c "DROP DATABASE $DB;" && qv_ok "Base $DB borrada"
fi

node -e '
const fs=require("fs"); const [launch,name]=process.argv.slice(1);
try { const j=JSON.parse(fs.readFileSync(launch,"utf8")); const n=(j.configurations||[]).length;
  j.configurations=(j.configurations||[]).filter(c=>c.name!==name);
  if (j.configurations.length!==n) { fs.writeFileSync(launch, JSON.stringify(j,null,2)+"\n"); console.log("ok"); } } catch {}
' "$(cygpath -w "$QV_LAUNCH")" "$NAME" | grep -q ok && qv_ok "Preview \"$NAME\" sacado de launch.json"
git -C "$QV_MAIN_CLONE" worktree prune
qv_log "Tarea $TEMA cerrada."
