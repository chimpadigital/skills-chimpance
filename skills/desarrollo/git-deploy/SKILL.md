---
name: git-deploy
description: Flujo estándar de Chimpancé Digital para trabajar con Git y publicar en internet, en cualquier proyecto y con cualquier equipo. Cubre las tres ramas (main = producción, la rama de desarrollo compartida, y una rama por funcionalidad), cómo subir cambios prolijos sin pisarse con otra persona, cómo resolver conflictos, repos privados en GitHub, deploy automático en Vercel (incluido el index.html y el deploy bloqueado por cuenta), conectar un dominio con Cloudflare apagando la nube naranja, y cómo armar un repo limpio para entregarle a un cliente sin rastros de Replit. Usar SIEMPRE que Santiago diga "subí esto a git", "subilo al repo", "hacé un commit", "creá una rama", "mergealo", "traé los cambios", "se pisó", "hay conflicto", "pasalo a producción", "deployá", "subilo a Vercel", "actualizá el HTML que está online", "creá el dominio X.manada.me", "conectá el dominio", "no se ve el sitio", "repo limpio para el cliente", "sacá los rastros de Replit", o cuando haya que publicar/actualizar cualquier HTML, demo, landing o app. Nace de la reunión con Santiago Prados del 26/9/2026.
---

# Git y deploy — el flujo estándar de Chimpancé

Este skill existe porque el 26/9/2026 Santiago Castro y Santiago Prados (CTO) acordaron **estandarizar el flujo de Git** para que dos personas (y Claude) puedan trabajar sobre el mismo proyecto sin pisarse, y para poder publicar y actualizar cosas en internet sin depender de Replit. Aplica a **todos los proyectos**, no solo a los de Chimpa.

**Santiago no programa.** Los comandos los ejecuta Claude. Lo que Santiago hace a mano es: clics en GitHub, Vercel y Cloudflare, y decir "esto va" o "esto no va". Todo lo que se le pida se le explica en criollo y con el nombre exacto de la pantalla y el botón.

## En 30 segundos

- **Tres niveles de rama**, siempre: `main` = lo que ve el cliente (producción) · una **rama de desarrollo compartida** = lo que ya está estable pero todavía no salió · una **rama por funcionalidad** = donde se trabaja y donde se rompen las cosas sin molestar a nadie.
- **A `main` no se sube nunca por las buenas.** Sube solo con un OK explícito de Santiago para ese pase concreto.
- **Git no pisa trabajo ajeno.** Si dos tocan lo mismo, avisa *antes* de subir y hay que juntar los dos cambios a mano. Nunca se pierde nada.
- **Antes de empezar a trabajar, siempre actualizar.** Es la única disciplina que realmente evita líos.
- **Los repos son privados. Siempre.** Más todavía si hay algo de un cliente.
- **Publicar = GitHub + Vercel.** Se sube al repo y Vercel redeploya solo en menos de 5 minutos. Replit no tiene forma de hacer esto desde afuera; por eso se migró.
- **Dominio = Cloudflare con la nube naranja APAGADA.** Con el proxy prendido, Vercel no puede emitir el certificado y el dominio queda colgado.

## El camino corto

| Lo que se pide | Qué hacer | Capítulo |
|---|---|---|
| "Poneme a trabajar en X" | Actualizar y abrir una rama de esa funcionalidad | [01](01_ramas.md) |
| "Subí lo que hiciste" | Commit prolijo → rama de la funcionalidad → merge a desarrollo | [02](02_subir_cambios.md) |
| "Traé lo que hizo Prados" / "se pisó algo" | Actualizar y, si hay conflicto, resolverlo juntando los dos cambios | [02](02_subir_cambios.md) |
| "Creá un repo para esto" | Repo **privado** en GitHub, con `.gitignore` y sin secretos | [03](03_repos_github.md) |
| "Subilo a internet" / "actualizá el HTML" | Repo → importar en Vercel → queda enlazado para siempre | [04](04_vercel.md) |
| "Creá el dominio algo.manada.me" | Vercel Domains → copiar CNAME y TXT → Cloudflare → **nube gris** | [05](05_dominio_cloudflare.md) |
| "Pasalo a producción" | Preguntar y esperar el OK; recién ahí merge a `main` | [01](01_ramas.md) |
| "Armá el repo limpio para el cliente" | Repo nuevo, historial nuevo, cero rastros de Replit | [06](06_repo_limpio_cliente.md) |

## Las 8 reglas que no se negocian

1. **Nunca subir a `main` sin OK explícito y puntual de Santiago.** "Subilo" quiere decir a la rama de desarrollo, salvo que diga "a producción".
2. **Antes de tocar una línea, actualizar** (`git fetch` + `git pull`). Si hay otra persona trabajando, esto no es opcional.
3. **Una rama por cosa.** Funcionalidad, módulo, flujo, o incluso "cambiar tres textos". Si se rompe, se rompe ahí adentro.
4. **Lo que se sube a la rama de desarrollo, está listo.** Esa rama tiene que poder mostrarse en cualquier momento.
5. **Nunca `git add -A`.** Se agregan archivos por nombre. Ningún `.env`, clave, certificado ni credencial entra al repo (van a `Chimpa2026/_secretos-fuera-del-repo/`).
6. **Repos privados.** Sin excepción.
7. **Si dos trabajan en paralelo, primero se reparte por módulo**, no por ganas: preguntar si lo que va a tocar cada uno se cruza. Dos personas en el mismo archivo = conflicto asegurado.
8. **Cuando el otro encuentra una falla, se arregla en la misma rama.** No se mandan archivos sueltos por Slack ni se abre una rama nueva para el arreglo.

## Antes de arrancar en un proyecto nuevo para Claude

No asumir nombres. Mirar el repo y confirmar:

```bash
git branch -r
git log --oneline -10 --all
```

- ¿Cuál es la rama de producción? (casi siempre `main`, a veces `master`)
- ¿Cuál es la rama de desarrollo compartida? El nombre lo pone el proyecto: puede ser `dev`, `develop`, `staging`, o una rama con el nombre de la agencia que creó el CTO. **Se usa la que ya existe; no se inventa una nueva.**
- ¿Hay ramas de funcionalidad abiertas de otra persona? Si hay, se avisa antes de tocar esos archivos.

Si el proyecto no tiene rama de desarrollo, se propone crearla y se espera el OK.

## Proyectos con reglas propias

Este skill es el piso. Algunos proyectos tienen un flujo más estricto que **manda sobre este**:

- **ERP Chimpa-Finanzas** → skill `erp-chimpa-finanzas`. Ahí todo va primero a `dev` (dev-finanzas.chimpance.digital), se prueba, y solo lo aprobado sube a `main`. Los cambios de base de datos van con migración versionada, nunca SQL a mano.
- **Demos de pre-venta** → skill `demos-preventa`.

Si el proyecto tiene skill propio, se invoca ese además de este.

## Capítulos

- [01 · Ramas: cómo se organiza el trabajo](01_ramas.md)
- [02 · Subir cambios, traer los del otro y resolver conflictos](02_subir_cambios.md)
- [03 · Repos en GitHub](03_repos_github.md)
- [04 · Publicar en Vercel](04_vercel.md)
- [05 · Conectar un dominio con Cloudflare](05_dominio_cloudflare.md)
- [06 · Repo limpio para entregarle al cliente](06_repo_limpio_cliente.md)
