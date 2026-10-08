# 06 · Repo limpio para entregarle al cliente

## El problema

Cuando un proyecto se construye con Replit (o con cualquier herramienta que deje su marca), el código queda lleno de rastros: archivos de configuración, plugins, banners, comentarios generados, variables de entorno propias. Si el cliente audita el código —y el área técnica de un cliente grande puede hacerlo— eso se ve.

Y hay algo peor que los archivos: **el historial**. Git guarda todos los commits desde el primero. Cualquiera puede retroceder al inicio y ver exactamente con qué se armó y cómo fue evolucionando.

## La decisión que se tomó

Se sigue trabajando en los repos actuales, con todo el historial, sin cambiar nada del día a día. **Al cerrar una etapa** (el mes 1, una fase, una entrega formal), se arma un **repo nuevo y limpio, exclusivo para el cliente**:

- código sin rastros de la herramienta con que se construyó,
- **historial nuevo**, que arranca en un primer commit,
- privado, con el cliente como colaborador.

Esto se hace **cuando Santiago lo pide**, no automáticamente.

## Procedimiento

### 1. Partir de lo que está listo
Bajar la rama que corresponda (la de desarrollo al día, o `main`) a una carpeta aparte. No se trabaja sobre el repo original.

### 2. Limpiar los rastros
Archivos y carpetas que se borran (Replit):

```
.replit
replit.nix
replit.md
.config/
.upm/
.breakpoints
```

Y dentro del código hay que buscar y sacar:
- dependencias `@replit/...` en `package.json` (por ejemplo `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-runtime-error-modal`) y su uso en `vite.config.ts`;
- el script del **banner de desarrollo de Replit** en el `index.html`;
- variables de entorno `REPLIT_*` / `REPL_*` y cualquier referencia a `*.replit.dev` o `*.repl.co`;
- comentarios y textos generados que nombren la herramienta;
- el `README` viejo, que casi siempre la menciona.

### 3. Verificar que no quedó nada

```bash
grep -ri "replit" . --exclude-dir=node_modules --exclude-dir=.git
grep -ri "repl.co\|replit.dev" . --exclude-dir=node_modules --exclude-dir=.git
```

Las dos búsquedas tienen que volver **vacías**. Si aparece algo, se saca y se vuelve a correr.

### 4. Confirmar que sigue andando
Instalar, compilar y levantarlo. Sacar plugins de build sin probar es la forma más rápida de entregarle al cliente un proyecto que no arranca.

### 5. Repo nuevo, historial nuevo

```bash
rm -rf .git
git init
git add .                     # acá sí, porque la carpeta ya está revisada y sin secretos
git commit -m "Versión inicial — <proyecto>"
gh repo create <cliente>-<proyecto> --private --source=. --remote=origin --push
```

> El `rm -rf .git` es lo que corta el historial viejo. Por eso se hace en una **copia**, nunca en el repo donde se trabaja.

### 6. Antes de entregar, revisar a mano
- Ningún `.env`, clave, token ni certificado (`git ls-files | grep -iE "env|key|pem|secret"`).
- `README` escrito para el cliente: qué es, cómo se corre, cómo se despliega.
- El repo, **privado**, y el cliente agregado como colaborador.

## Qué decirle al cliente

Que se le entrega el repositorio del proyecto con el código de la etapa cerrada. No hace falta explicar con qué herramientas se construyó: el entregable es el código funcionando y documentado.
