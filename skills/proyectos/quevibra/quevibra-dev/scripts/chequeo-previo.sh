#!/usr/bin/env bash
# Chequeo automático ANTES de subir cualquier cambio de QueVibra.
# Corre desde la raíz del worktree de la tarea (nunca desde main):
#
#   bash ~/.claude/skills/quevibra-dev/scripts/chequeo-previo.sh [--sin-build]
#
# Qué hace (≈5 min; conviene correrlo en segundo plano):
#   1. Lista qué archivos cambiaste y avisa si tocaste algo que requiere OK de Santiago.
#   2. Tipos (tsc): main está en 0 errores → tiene que seguir en 0.
#   3. Tests (vitest, suite completa) con TZ=UTC, la zona horaria del servidor de producción
#      (la compu está en hora argentina y eso esconde errores de horario). En main ya hay
#      fallas viejas conocidas, así que se comparan contra origin/main y solo cuentan las NUEVAS.
#   4. Build de producción (lo mismo que corre Replit al publicar).
# Sale con código 0 solo si todo está en verde. Deja los logs en $TEMP/qv-chequeo/<rama>/.
source "$(dirname "${BASH_SOURCE[0]}")/_comun.sh"
set +e

SIN_BUILD=0; [ "${1:-}" = "--sin-build" ] && SIN_BUILD=1
WT="$(git rev-parse --show-toplevel 2>/dev/null)" || { qv_fail "No estoy dentro de un repo git"; exit 1; }
cd "$WT"
RAMA="$(git branch --show-current)"
[ -f shared/schema.ts ] || { qv_fail "Esto no parece el repo de QueVibra"; exit 1; }
[ "$RAMA" = "main" ] && { qv_fail "Estás en main. Trabajá en un worktree con rama propia (nuevo-worktree.sh)."; exit 1; }
[ "$WT" = "$(cd "$QV_MAIN_CLONE" && pwd)" ] && qv_warn "Estás en el clon principal quevibra-main: otra sesión puede estar usándolo. Preferí un worktree propio."

OUT="$TEMP/qv-chequeo/${RAMA//\//_}"; rm -rf "$OUT"; mkdir -p "$OUT"
DBURL="$(qv_env_get .env DATABASE_URL)"
[ -n "$DBURL" ] || qv_warn "No hay DATABASE_URL en .env: los tests de integración van a fallar."
qv_pg_up >/dev/null 2>&1 || qv_warn "La base local está apagada y no pude prenderla."
git fetch origin --quiet 2>/dev/null
BASE="$(git merge-base HEAD origin/main)"

# ── 1 · Qué cambió ────────────────────────────────────────────────────────────
qv_log "1/4 Archivos cambiados respecto de main"
{ git diff --name-only "$BASE"...HEAD; git diff --name-only; git diff --name-only --cached; git ls-files --others --exclude-standard; } \
  | sort -u > "$OUT/cambios.txt"
sed 's/^/     /' "$OUT/cambios.txt"
[ -s "$OUT/cambios.txt" ] || qv_warn "No hay cambios respecto de main."
if grep -qE '^shared/' "$OUT/cambios.txt"; then qv_warn "Tocaste shared/ → necesita OK EXPLÍCITO de Santiago antes de subir (y Replit corre db:push al publicar)."; fi
if grep -qx 'client/src/lib/analytics.ts' "$OUT/cambios.txt"; then qv_warn "Tocaste client/src/lib/analytics.ts → prohibido sin OK explícito de Santiago."; fi
if grep -qE '^(server/index\.ts|server/services/eventSyncService\.ts|drizzle\.config\.ts|server/storage\.ts)$' "$OUT/cambios.txt"; then
  qv_warn "Tocaste archivos 'registro' que casi todas las ramas tocan: mergeá rápido para evitar conflictos."
fi
if grep -qE '^package(-lock)?\.json$' "$OUT/cambios.txt"; then qv_warn "Cambiaron dependencias: el node_modules es compartido (junction). Ver referencia 02 › Dependencias."; fi

# ── 2 y 3 · Tipos y tests en paralelo ─────────────────────────────────────────
qv_log "2/4 Tipos (tsc) y 3/4 tests (vitest) en paralelo…"
( npx tsc --noEmit -p . > "$OUT/tsc.txt" 2>&1; echo $? > "$OUT/tsc.exit" ) &
PID_TSC=$!
TZ=UTC DATABASE_URL="$DBURL" npx vitest run --reporter=json --outputFile="$OUT/vitest.json" > "$OUT/vitest.log" 2>&1
wait $PID_TSC

TSC_ERR=$(grep -c "error TS" "$OUT/tsc.txt")
if [ "$TSC_ERR" = "0" ]; then qv_ok "Tipos: 0 errores"; TSC_OK=1
else qv_fail "Tipos: $TSC_ERR errores (main tiene 0). Ver $OUT/tsc.txt"; grep "error TS" "$OUT/tsc.txt" | head -15 | sed 's/^/     /'; TSC_OK=0; fi

# Lista de tests que fallan: "archivo › nombre completo"
fallas() {  # $1 json de vitest, $2 raíz para relativizar
  node -e '
    const fs=require("fs"),path=require("path"); const [f,root]=process.argv.slice(1);
    let j; try { j=JSON.parse(fs.readFileSync(f,"utf8")); } catch { process.exit(3); }
    const out=[];
    for (const r of j.testResults||[]) {
      const rel=path.relative(root,r.name).split(path.sep).join("/");
      const fails=(r.assertionResults||[]).filter(a=>a.status==="failed");
      if (!(r.assertionResults||[]).length && r.status==="failed") out.push(rel+" › (el archivo no carga: "+(r.message||"").split("\n")[0].slice(0,120)+")");
      for (const a of fails) out.push(rel+" › "+a.fullName);
    }
    console.log(out.join("\n"));
    console.error("TOTALES "+(j.numPassedTests||0)+" "+(j.numFailedTests||0));
  ' "$1" "$(cygpath -w "$2")"
}

TEST_OK=0
if fallas "$OUT/vitest.json" "$WT" > "$OUT/fallas-rama.txt" 2> "$OUT/totales.txt"; then
  read -r _ PASAN FALLAN < "$OUT/totales.txt"
  if [ ! -s "$OUT/fallas-rama.txt" ]; then
    qv_ok "Tests: $PASAN pasan, 0 fallan"; TEST_OK=1
  else
    qv_log "     $FALLAN fallan en la rama; comparo esos archivos contra origin/main…"
    qv_ref_worktree
    # (el separador " › " es multibyte: cut no sirve, se usa sed)
    ARCHIVOS=$(sed 's/ › .*//' "$OUT/fallas-rama.txt" | sort -u | while read -r a; do [ -f "$QV_REF_WT/$a" ] && echo "$a"; done)
    : > "$OUT/fallas-main.txt"
    if [ -n "$ARCHIVOS" ]; then
      ( cd "$QV_REF_WT" && TZ=UTC DATABASE_URL="$DBURL" npx vitest run $ARCHIVOS --reporter=json --outputFile="$OUT/vitest-main.json" > "$OUT/vitest-main.log" 2>&1 )
      fallas "$OUT/vitest-main.json" "$QV_REF_WT" > "$OUT/fallas-main.txt" 2>/dev/null
    fi
    if [ -s "$OUT/fallas-main.txt" ]; then
      grep -vxF -f "$OUT/fallas-main.txt" "$OUT/fallas-rama.txt" > "$OUT/fallas-nuevas.txt"
      VIEJAS=$(grep -cxF -f "$OUT/fallas-main.txt" "$OUT/fallas-rama.txt")
    else
      cp "$OUT/fallas-rama.txt" "$OUT/fallas-nuevas.txt"; VIEJAS=0
    fi
    # Las que parecen nuevas se reintentan EN LAS MISMAS CONDICIONES en la rama y en main (solo esos archivos).
    # Es nueva solo si sigue fallando en la rama y en main pasa. Si falla en los dos, o pasa al reintentar,
    # es inestable (hay tests que en Windows fallan al azar, p. ej. allaccessIngestRoute "oversized body" → ECONNRESET).
    INESTABLES=0
    if [ -s "$OUT/fallas-nuevas.txt" ]; then
      REINTENTO=$(sed 's/ › .*//' "$OUT/fallas-nuevas.txt" | sort -u)
      TZ=UTC DATABASE_URL="$DBURL" npx vitest run $REINTENTO --reporter=json --outputFile="$OUT/vitest-reintento.json" > "$OUT/vitest-reintento.log" 2>&1
      fallas "$OUT/vitest-reintento.json" "$WT" > "$OUT/fallas-reintento.txt" 2>/dev/null
      EN_MAIN=$(echo "$REINTENTO" | while read -r a; do [ -f "$QV_REF_WT/$a" ] && echo "$a"; done)
      : > "$OUT/fallas-reintento-main.txt"
      if [ -n "$EN_MAIN" ]; then
        ( cd "$QV_REF_WT" && TZ=UTC DATABASE_URL="$DBURL" npx vitest run $EN_MAIN --reporter=json --outputFile="$OUT/vitest-reintento-main.json" > "$OUT/vitest-reintento-main.log" 2>&1 )
        fallas "$OUT/vitest-reintento-main.json" "$QV_REF_WT" > "$OUT/fallas-reintento-main.txt" 2>/dev/null
      fi
      # nueva = estaba como nueva ∧ falló de nuevo en la rama ∧ no falló en main al reintentar
      grep -xF -f "$OUT/fallas-reintento.txt" "$OUT/fallas-nuevas.txt" > "$OUT/tmp1.txt" || true
      if [ -s "$OUT/fallas-reintento-main.txt" ]; then grep -vxF -f "$OUT/fallas-reintento-main.txt" "$OUT/tmp1.txt" > "$OUT/fallas-nuevas-2.txt" || true; else cp "$OUT/tmp1.txt" "$OUT/fallas-nuevas-2.txt"; fi
      if [ -s "$OUT/fallas-nuevas-2.txt" ]; then grep -vxF -f "$OUT/fallas-nuevas-2.txt" "$OUT/fallas-nuevas.txt" > "$OUT/fallas-inestables.txt" || true; else cp "$OUT/fallas-nuevas.txt" "$OUT/fallas-inestables.txt"; fi
      INESTABLES=$(grep -c . "$OUT/fallas-inestables.txt" || true)
      mv "$OUT/fallas-nuevas-2.txt" "$OUT/fallas-nuevas.txt"; rm -f "$OUT/tmp1.txt"
    fi
    if [ ! -s "$OUT/fallas-nuevas.txt" ]; then
      qv_ok "Tests: $PASAN pasan · $VIEJAS fallas que YA estaban en main (no son tuyas) · $INESTABLES inestables (al reintentar pasaron, o fallan igual en main) · 0 nuevas"; TEST_OK=1
      [ "$INESTABLES" -gt 0 ] && sed 's/^/     inestable: /' "$OUT/fallas-inestables.txt"
    else
      qv_fail "Tests: $(wc -l < "$OUT/fallas-nuevas.txt") fallas NUEVAS (no están en main):"
      sed 's/^/     /' "$OUT/fallas-nuevas.txt" | head -20
    fi
  fi
else
  qv_fail "Vitest no generó resultados. Ver $OUT/vitest.log"; tail -20 "$OUT/vitest.log" | sed 's/^/     /'
fi

# ── 4 · Build de producción ───────────────────────────────────────────────────
BUILD_OK=1
if [ $SIN_BUILD = 0 ]; then
  qv_log "4/4 Build de producción…"
  if npm run build > "$OUT/build.txt" 2>&1; then qv_ok "Build OK"; else qv_fail "Build falló. Ver $OUT/build.txt"; tail -15 "$OUT/build.txt" | sed 's/^/     /'; BUILD_OK=0; fi
else
  qv_warn "Build salteado (--sin-build). Correlo antes de subir."
fi

echo
if [ $TSC_OK = 1 ] && [ $TEST_OK = 1 ] && [ $BUILD_OK = 1 ] && [ $SIN_BUILD = 0 ]; then
  qv_log "✅ CHEQUEO AUTOMÁTICO EN VERDE — falta la prueba en el navegador (referencia 03) antes de subir."
  exit 0
else
  qv_log "⛔ NO SUBIR TODAVÍA — arreglá lo marcado arriba. Logs: $OUT"
  exit 1
fi
