# Skills Chimpancé Digital

Skills de Claude Code mantenidos por el equipo de Chimpancé Digital.

Versiones mejoradas de skills de la comunidad, enriquecidas con lecciones aprendidas en proyectos reales.

## Instalación

El repo es un plugin de Claude Code con su propio marketplace (`.claude-plugin/`). No hace falta clonarlo: Claude Code lo baja solo.

Agregar en `~/.claude/settings.json` (vale para todas las sesiones de esa compu, terminal y app de escritorio):

```json
{
  "extraKnownMarketplaces": {
    "chimpance": {
      "source": { "source": "github", "repo": "chimpadigital/skills-chimpance" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "chimpance-skills@chimpance": true }
}
```

Para seguir una rama que no es `main`, sumar `"ref": "<rama>"` dentro de `source`.

O desde una sesión: `/plugin marketplace add chimpadigital/skills-chimpance` y después `/plugin install chimpance-skills@chimpance`.

Las skills quedan con prefijo (`/chimpance-skills:web-scraping`, `/chimpance-skills:security-review`, etc.) y Claude las activa solo por la descripción.

> `skillsDirectories` **no existe** en Claude Code: no lo uses.

## Skills disponibles

| Skill | Cuándo usarlo |
|-------|---------------|
| `web-performance-optimization` | Auditoría de performance, Core Web Vitals, LCP, CLS |
| `security-nextjs` | Review de seguridad específico para Next.js App Router |
| `security-review` | Checklist OWASP general para cualquier stack |
| `security-best-practices` | Best practices por lenguaje/framework con reporte de vulnerabilidades |
| `claude-seo` | Auditoría SEO técnica completa |
| `web-scraping` | Elegir e instalar Scrapling, ScrapeGraphAI o Agent Reach para extraer datos web con Claude Code |

Cada skill tiene un `CHANGELOG.md` con las modificaciones respecto al original.

## Actualizar

Con `"autoUpdate": true` se actualiza solo al abrir una sesión. Para forzarlo: `/plugin marketplace update chimpance` y después `/reload-plugins`.
