# Skills Chimpancé Digital

Skills de Claude Code mantenidos por el equipo de Chimpancé Digital.

Skills propios y versiones mejoradas de skills de la comunidad, enriquecidos con lecciones aprendidas en proyectos reales.

## Organización

Los skills están agrupados por rol o proyecto:

```
skills/
├── comercial/              ventas, propuestas y demos
├── marketing-contenido/    redes, branding y piezas
├── diseno-ux/              UX y design systems
├── desarrollo/             git, deploy, QA e integraciones
├── seguridad-performance/  seguridad, performance y SEO técnico
├── proyectos/
│   ├── erp-chimpa/         ERP + CRM Chimpa-Finanzas
│   └── quevibra/           QueVibra
└── clientes/               un skill por cliente
```

## Instalación

Clonar el repo una vez por máquina e instalar:

```bash
git clone https://github.com/chimpadigital/skills-chimpance.git ~/.agents/skills-chimpance
bash ~/.agents/skills-chimpance/instalar.sh
```

`instalar.sh` copia cada skill a `~/.claude/skills/`, que es donde Claude Code los busca (las subcarpetas por rol no se leen directo). Para instalar solo un grupo: `bash instalar.sh comercial` o `bash instalar.sh proyectos/quevibra`.

## Skills disponibles

| Carpeta | Skill | Cuándo usarlo |
|---------|-------|---------------|
| comercial | `ejecutivo-cuenta-chimpance` | Propuestas comerciales y cotizaciones |
| comercial | `presentaciones-venta-chimpance` | Presentaciones de venta |
| comercial | `demos-preventa` | Demos funcionales de pre-venta en Replit |
| marketing-contenido | `redaccion-contenido-chimpa` | Posts, carruseles y copys para LinkedIn e Instagram |
| marketing-contenido | `branding-creativo` | Branding y conceptos creativos |
| marketing-contenido | `avatar-grupo-whatsapp` | Avatares para grupos de WhatsApp |
| diseno-ux | `ux-chimpa` | UX "No me hagas pensar" para productos Chimpa |
| diseno-ux | `design-system-marca` | Design systems completos para marcas |
| desarrollo | `git-deploy` | Ramas, commits, Vercel, dominios en Cloudflare |
| desarrollo | `qa-chimpa` | QA y tests antes de dar algo por terminado |
| desarrollo | `arca-conexion` | Conectar sistemas con ARCA (ex AFIP) |
| seguridad-performance | `web-performance-optimization` | Performance, Core Web Vitals, LCP, CLS |
| seguridad-performance | `security-nextjs` | Seguridad en Next.js App Router |
| seguridad-performance | `security-review` | Checklist OWASP general |
| seguridad-performance | `security-best-practices` | Best practices por lenguaje/framework |
| seguridad-performance | `claude-seo` | Auditoría SEO técnica |
| proyectos/erp-chimpa | `erp-chimpa-finanzas` | Código, ambientes y lógica del ERP |
| proyectos/erp-chimpa | `erp-ui-chimpa` | Interfaz del ERP (DS "Selva señalizada") |
| proyectos/erp-chimpa | `crm-growth-chimpa` | CRM y Growth OS del ERP |
| proyectos/quevibra | `quevibra-business` | Negocio, voz y propuesta de valor |
| proyectos/quevibra | `quevibra-branding` | Vibra Design System y piezas |
| proyectos/quevibra | `quevibra-dev` | Código y flujo de pruebas de la PWA |
| clientes | `mt-agro` | MT AGRO y riego agrícola |
| clientes | `techagro` | Agro Tech |
| clientes | `grupo-gester` | Grupo Gester |

Los skills de `seguridad-performance` son versiones mejoradas de skills de la comunidad: cada uno tiene un `CHANGELOG.md` con las modificaciones respecto al original.

## Actualizar

```bash
cd ~/.agents/skills-chimpance && git pull && bash instalar.sh
```
