# Skills Chimpancé Digital

Skills de Claude Code mantenidos por el equipo de Chimpancé Digital.

Versiones mejoradas de skills de la comunidad, enriquecidas con lecciones aprendidas en proyectos reales.

## Instalación

Clonar el repo una vez por máquina:

```bash
git clone https://github.com/chimpadigital/skills-chimpance.git ~/.agents/skills-chimpance
```

Luego agregar en `~/.claude/settings.json`:

```json
{
  "skillsDirectories": ["~/.agents/skills-chimpance/skills"]
}
```

O por proyecto (en `.claude/settings.json` del repo):

```json
{
  "skillsDirectories": [".agents/skills-chimpance/skills"]
}
```

## Skills disponibles

| Skill | Cuándo usarlo |
|-------|---------------|
| `web-performance-optimization` | Auditoría de performance, Core Web Vitals, LCP, CLS |
| `security-nextjs` | Review de seguridad específico para Next.js App Router |
| `security-review` | Checklist OWASP general para cualquier stack |
| `security-best-practices` | Best practices por lenguaje/framework con reporte de vulnerabilidades |
| `claude-seo` | Auditoría SEO técnica completa |

Cada skill tiene un `CHANGELOG.md` con las modificaciones respecto al original.

## Actualizar

```bash
cd ~/.agents/skills-chimpance && git pull
```
