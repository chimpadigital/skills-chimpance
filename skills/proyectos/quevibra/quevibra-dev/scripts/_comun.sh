# Constantes y helpers compartidos por los scripts del skill quevibra-dev.
# Se "sourcea" desde los otros scripts: no se ejecuta solo.
# Pensado para Git Bash en Windows (la compu de Santiago).

set -euo pipefail

QV_BASE="/c/Users/santi/Downloads/Que Vibra Cluade Code"
QV_GITREPO="$QV_BASE/GitRepo"
QV_MAIN_CLONE="$QV_GITREPO/quevibra-main"          # clon principal: fuente de node_modules y del .env base
QV_REF_WT="${QV_REF_WT:-$QV_GITREPO/qv-referencia-main}"         # worktree SOLO LECTURA en origin/main (línea base de tests)
QV_LAUNCH="$QV_BASE/.claude/launch.json"           # previews del navegador interno
QV_PGBIN="/c/Program Files/PostgreSQL/18/bin"
QV_PGHOME="/c/Users/santi/.quevibra-db"            # cluster PostgreSQL propio de QueVibra (no es el del ERP)
QV_PGDATA="$QV_PGHOME/data"
QV_PGPORT=5434
QV_DB_USER=quevibra
QV_DB_PASS=quevibra
QV_TEMPLATE_DB=quevibra_plantilla                   # base con esquema + datos de prod; NUNCA se le conecta un servidor
QV_SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

qv_log()  { printf '\033[1;36m[quevibra-dev]\033[0m %s\n' "$*"; }
qv_ok()   { printf '\033[1;32m  ✔\033[0m %s\n' "$*"; }
qv_warn() { printf '\033[1;33m  ⚠\033[0m %s\n' "$*"; }
qv_fail() { printf '\033[1;31m  ✘\033[0m %s\n' "$*" >&2; }

qv_db_url() { echo "postgresql://$QV_DB_USER:$QV_DB_PASS@localhost:$QV_PGPORT/$1"; }
qv_psql_admin() { "$QV_PGBIN/psql" -h localhost -p "$QV_PGPORT" -U postgres -v ON_ERROR_STOP=1 -Atq "$@"; }

# Levanta el cluster si está apagado (después de reiniciar la compu queda apagado).
qv_pg_up() {
  if [ ! -d "$QV_PGDATA" ]; then return 1; fi
  if ! "$QV_PGBIN/pg_isready" -h localhost -p "$QV_PGPORT" -q; then
    "$QV_PGBIN/pg_ctl" -D "$QV_PGDATA" -l "$QV_PGHOME/postgres.log" -w start >/dev/null
  fi
  "$QV_PGBIN/pg_isready" -h localhost -p "$QV_PGPORT" -q
}

qv_db_exists() { [ "$(qv_psql_admin -c "SELECT 1 FROM pg_database WHERE datname='$1'")" = "1" ]; }

# Crea un junction de Windows (no necesita permisos de admin) para compartir node_modules.
qv_junction() {  # $1 = link, $2 = destino
  local link_w target_w
  link_w="$(cygpath -w "$1")"; target_w="$(cygpath -w "$2")"
  powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$link_w' -Target '$target_w' | Out-Null" >/dev/null
}

# Reemplaza (o agrega) KEY=valor en un archivo .env sin mostrar valores.
qv_env_set() {  # $1 archivo, $2 KEY, $3 valor
  local f="$1" k="$2" v="$3"
  if grep -qE "^$k=" "$f"; then
    local esc; esc="$(printf '%s' "$v" | sed -e 's/[\/&#]/\\&/g')"
    sed -i -E "s#^$k=.*#$k=$esc#" "$f"
  else
    printf '%s=%s\n' "$k" "$v" >> "$f"
  fi
}
qv_env_get() { grep -E "^$2=" "$1" | head -1 | cut -d= -f2- || true; }

# Asegura el worktree de referencia en origin/main (para comparar tests contra main).
qv_ref_worktree() {
  git -C "$QV_MAIN_CLONE" fetch origin --quiet
  if [ ! -d "$QV_REF_WT" ]; then
    git -C "$QV_MAIN_CLONE" worktree add --detach "$QV_REF_WT" origin/main >/dev/null 2>&1
    qv_junction "$QV_REF_WT/node_modules" "$QV_MAIN_CLONE/node_modules"
  else
    git -C "$QV_REF_WT" checkout --quiet --detach origin/main
  fi
}
