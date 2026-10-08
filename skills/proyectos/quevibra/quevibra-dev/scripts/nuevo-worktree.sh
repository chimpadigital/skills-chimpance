#!/usr/bin/env bash
# Crea el lugar de trabajo aislado para UNA tarea de QueVibra:
#   - worktree git en GitRepo/qv-<tema>, con rama nueva desde origin/main (o la rama existente)
#   - node_modules compartido (junction) con quevibra-main
#   - base propia qv_<tema> copiada de la plantilla (esquema + datos de prod) + esquema de la rama
#   - .env propio (base, puerto, login local sin Google)
#   - entrada "qv-<tema>" en .claude/launch.json para preview_start
#
# Uso:  bash ~/.claude/skills/quevibra-dev/scripts/nuevo-worktree.sh <tema> [rama]
#   <tema>  minúsculas/números/guiones, ej: ficha-compartir-whatsapp
#   [rama]  por defecto feature/<tema>. Si la rama ya existe (local o en origin), se reutiliza.
#
# Después: preview_start {name: "qv-<tema>"}  → http://localhost:<puerto>
source "$(dirname "${BASH_SOURCE[0]}")/_comun.sh"

TEMA="${1:-}"
[[ "$TEMA" =~ ^[a-z0-9][a-z0-9-]{1,40}$ ]] || { qv_fail "Tema inválido: usá minúsculas, números y guiones (ej: agenda-vacia)"; exit 1; }
RAMA="${2:-feature/$TEMA}"
WT="$QV_GITREPO/qv-$TEMA"
DB="qv_${TEMA//-/_}"
NAME="qv-$TEMA"

qv_pg_up || { qv_fail "La base local no está creada. Corré primero preparar-base-local.sh"; exit 1; }
qv_db_exists "$QV_TEMPLATE_DB" || { qv_fail "Falta la plantilla. Corré primero preparar-base-local.sh"; exit 1; }

# 1 · Worktree + rama
git -C "$QV_MAIN_CLONE" fetch origin --quiet
if [ -d "$WT" ]; then
  qv_warn "El worktree $WT ya existe: lo reutilizo."
else
  if git -C "$QV_MAIN_CLONE" show-ref --verify --quiet "refs/heads/$RAMA"; then
    git -C "$QV_MAIN_CLONE" worktree add "$WT" "$RAMA" >/dev/null 2>&1
  elif git -C "$QV_MAIN_CLONE" show-ref --verify --quiet "refs/remotes/origin/$RAMA"; then
    git -C "$QV_MAIN_CLONE" worktree add --track -b "$RAMA" "$WT" "origin/$RAMA" >/dev/null 2>&1
  else
    git -C "$QV_MAIN_CLONE" worktree add --no-track -b "$RAMA" "$WT" origin/main >/dev/null 2>&1
  fi
  qv_ok "Worktree $WT en la rama $RAMA"
fi
[ -e "$WT/node_modules" ] || qv_junction "$WT/node_modules" "$QV_MAIN_CLONE/node_modules"

# 2 · Puerto libre (5011-5099) que no use otra entrada de launch.json ni otro proceso
PUERTO="$(node -e '
const fs=require("fs"); const [launch,name]=process.argv.slice(1);
let used=new Set(); let mine=null;
try { const j=JSON.parse(fs.readFileSync(launch,"utf8")); for (const c of j.configurations||[]) { if (c.name===name) mine=c.port; else used.add(c.port); } } catch {}
if (mine) { console.log(mine); process.exit(0); }
for (let p=5011;p<5100;p++) if(!used.has(p)) { console.log(p); break; }
' "$(cygpath -w "$QV_LAUNCH")" "$NAME")"
while netstat -ano 2>/dev/null | grep -qE "[:.]$PUERTO\s.*LISTEN" && ! grep -q "\"$NAME\"" "$QV_LAUNCH"; do PUERTO=$((PUERTO+1)); done

# 3 · Base propia (copia de la plantilla) + esquema de esta rama
if ! qv_db_exists "$DB"; then
  qv_psql_admin -c "CREATE DATABASE $DB TEMPLATE $QV_TEMPLATE_DB OWNER $QV_DB_USER;" \
    || { qv_fail "No pude copiar la plantilla (¿hay algo conectado a $QV_TEMPLATE_DB?)"; exit 1; }
  qv_ok "Base $DB creada (copia de la plantilla)"
else
  qv_warn "La base $DB ya existe: la reutilizo."
fi
( cd "$WT" && DATABASE_URL="$(qv_db_url "$DB")" npx drizzle-kit push --force >/dev/null 2>&1 ) \
  && qv_ok "Esquema de la rama aplicado a $DB" \
  || qv_warn "drizzle-kit push falló sobre $DB (revisá el esquema de la rama)"

# 4 · .env propio (sin mostrar secretos)
if [ ! -f "$WT/.env" ]; then
  if [ -f "$QV_MAIN_CLONE/.env" ]; then cp "$QV_MAIN_CLONE/.env" "$WT/.env"; else cp "$WT/.env.example" "$WT/.env"; fi
  sed -i '1s/^\xEF\xBB\xBF//' "$WT/.env"
fi
qv_env_set "$WT/.env" DATABASE_URL "$(qv_db_url "$DB")"
qv_env_set "$WT/.env" PORT "$PUERTO"
qv_env_set "$WT/.env" PUBLIC_BASE_URL "http://localhost:$PUERTO"
qv_env_set "$WT/.env" CRON_ENABLED "false"
# Producción (Replit) corre en UTC. Con la hora argentina de la compu, los errores de horario
# (fechas armadas con new Date(año, mes, día, hora…)) no se ven en local. Ver 06 › Fechas.
qv_env_set "$WT/.env" TZ "UTC"
qv_env_set "$WT/.env" AUTH_MODE "simple"
qv_env_set "$WT/.env" VITE_AUTH_MODE "simple"
# Sin GOOGLE_CLIENT_ID el servidor no arma las sesiones y nadie puede loguearse en local.
# Con valores de mentira se arman las sesiones; el login se hace con /api/dev/login (ver referencia 02).
[ -n "$(qv_env_get "$WT/.env" GOOGLE_CLIENT_ID)" ] || qv_env_set "$WT/.env" GOOGLE_CLIENT_ID "local-sin-google.apps.googleusercontent.com"
[ -n "$(qv_env_get "$WT/.env" GOOGLE_CLIENT_SECRET)" ] || qv_env_set "$WT/.env" GOOGLE_CLIENT_SECRET "local-sin-google"
qv_env_set "$WT/.env" GOOGLE_CALLBACK_URL "http://localhost:$PUERTO/auth/google/callback"
qv_ok ".env local listo (puerto $PUERTO)"

# 5 · Entrada en launch.json
node -e '
const fs=require("fs"); const [launch,name,port,wtRel]=process.argv.slice(1);
let j={version:"0.0.1",configurations:[]};
try { j=JSON.parse(fs.readFileSync(launch,"utf8")); } catch {}
j.configurations=(j.configurations||[]).filter(c=>c.name!==name);
j.configurations.push({name, runtimeExecutable:"npm", runtimeArgs:["--prefix",wtRel,"run","dev"], port:Number(port)});
fs.writeFileSync(launch, JSON.stringify(j,null,2)+"\n");
' "$(cygpath -w "$QV_LAUNCH")" "$NAME" "$PUERTO" "GitRepo/qv-$TEMA"
qv_ok "Preview \"$NAME\" agregado a launch.json"

echo
qv_log "Listo. Trabajá SOLO dentro de: $WT"
echo "   rama:    $RAMA"
echo "   base:    $DB  (copia de la plantilla, se puede romper sin miedo)"
echo "   preview: preview_start {name: \"$NAME\"}  →  http://localhost:$PUERTO"
