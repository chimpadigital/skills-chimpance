#!/usr/bin/env bash
# Deja lista la base local de QueVibra: cluster propio (puerto 5434), usuario de
# prueba y la base PLANTILLA con el esquema de main + datos públicos de producción.
# Cada tarea después copia la plantilla a su propia base (nuevo-worktree.sh).
#
# Uso:  bash ~/.claude/skills/quevibra-dev/scripts/preparar-base-local.sh [--refrescar-datos]
#   --refrescar-datos  vuelve a bajar categorías/eventos de producción a la plantilla.
#
# Idempotente: si todo ya existe, solo verifica que el cluster esté prendido.
source "$(dirname "${BASH_SOURCE[0]}")/_comun.sh"

REFRESCAR=0
[ "${1:-}" = "--refrescar-datos" ] && REFRESCAR=1

# 1 · Cluster propio
if [ ! -d "$QV_PGDATA" ]; then
  qv_log "Creando el cluster PostgreSQL de QueVibra en $QV_PGHOME (puerto $QV_PGPORT)…"
  mkdir -p "$QV_PGHOME"
  "$QV_PGBIN/initdb" -D "$QV_PGDATA" -U postgres -A trust -E UTF8 --no-locale > "$QV_PGHOME/initdb.log" 2>&1
  printf "\n# QueVibra local (skill quevibra-dev)\nport = %s\nlisten_addresses = 'localhost'\n" "$QV_PGPORT" >> "$QV_PGDATA/postgresql.conf"
fi
qv_pg_up || { qv_fail "No pude prender el cluster. Mirá $QV_PGHOME/postgres.log"; exit 1; }
qv_ok "PostgreSQL de QueVibra prendido en localhost:$QV_PGPORT"

# 2 · Usuario de prueba (solo local; la clave es de mentira a propósito)
if [ "$(qv_psql_admin -c "SELECT 1 FROM pg_roles WHERE rolname='$QV_DB_USER'")" != "1" ]; then
  qv_psql_admin -c "CREATE ROLE $QV_DB_USER WITH LOGIN PASSWORD '$QV_DB_PASS' CREATEDB;"
fi
qv_ok "Usuario $QV_DB_USER listo"

# 3 · Plantilla con esquema de main + datos
NUEVA=0
if ! qv_db_exists "$QV_TEMPLATE_DB"; then
  qv_psql_admin -c "CREATE DATABASE $QV_TEMPLATE_DB OWNER $QV_DB_USER;"
  NUEVA=1
fi

if [ $NUEVA = 1 ] || [ $REFRESCAR = 1 ]; then
  qv_log "Poniendo al día el worktree de referencia (origin/main)…"
  qv_ref_worktree
  qv_log "Aplicando el esquema de main a la plantilla…"
  ( cd "$QV_REF_WT" && DATABASE_URL="$(qv_db_url "$QV_TEMPLATE_DB")" npx drizzle-kit push --force >/dev/null 2>&1 ) \
    || { qv_fail "drizzle-kit push falló sobre la plantilla"; exit 1; }
  qv_log "Copiando datos públicos de producción (categorías, tags, eventos)…"
  ( cd "$QV_REF_WT" && DATABASE_URL="$(qv_db_url "$QV_TEMPLATE_DB")" node "$QV_SKILL_DIR/seed-local-desde-prod.mjs" ) \
    || { qv_fail "La carga de datos falló"; exit 1; }
fi

N=$("$QV_PGBIN/psql" "$(qv_db_url "$QV_TEMPLATE_DB")" -Atc "SELECT count(*) FROM events" 2>/dev/null || echo "?")
qv_ok "Plantilla $QV_TEMPLATE_DB lista ($N eventos)"
