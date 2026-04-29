# Changelog — claude-seo

Basado en el plugin original `claude-seo` v1.9.0 (agricidaniel).

Solo se incluyen los archivos modificados. Para los demas sub-skills instalar claude-seo desde el plugin original.

## Mejoras aplicadas

### seo-technical — Warning Next.js + Tailwind v4
- Agregada seccion "Framework-specific: Next.js + Tailwind v4" al final del skill.
- Tailwind v4 oxide escanea todo el proyecto, incluyendo dumps HTML del audit. Si quedan en el repo, rompen el build de Vercel con "Cannot find module './&'".
- Incluye accion obligatoria: verificar .gitignore antes de commit, y comando para remover si ya fueron commiteados.
- Origen: proyecto PROME, build fallo 4 veces en Vercel hasta identificar la causa.
