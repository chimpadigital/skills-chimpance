# Changelog — web-scraping

Skill propia de Chimpancé Digital (no deriva de un skill de la comunidad). Integra la documentación oficial de tres herramientas:

- Scrapling — https://github.com/D4Vinci/Scrapling (BSD-3-Clause)
- ScrapeGraphAI — https://github.com/ScrapeGraphAI/Scrapegraph-ai y https://github.com/ScrapeGraphAI/scrapegraph-mcp (MIT)
- Agent Reach — https://github.com/Panniantong/Agent-Reach (MIT)

## Versión inicial

- Árbol de decisión: WebFetch nativo vs Scrapling vs ScrapeGraphAI vs Agent Reach, con regla de costo (selectores vs tokens de LLM).
- Comandos de instalación, CLI, fetchers, spiders y MCP de Scrapling tomados del README y de `docs/` del repo.
- Ejemplo de ScrapeGraphAI con Ollama local y OpenAI; tools del MCP hosteado (nombres v3).
- Instalación de Agent Reach con `uv` (aviso: el paquete homónimo de PyPI no es el proyecto), niveles de canales y uso de cuenta secundaria.
- Sección legal/ética: ToS, robots.txt, Ley 25.326 / GDPR, anti-bot solo con autorización escrita.

## 12/11/2026 — Probado de verdad en Windows 11 (Scrapling 0.5.1, ScrapeGraphAI 2.3.1, Agent Reach 1.6.1)

- Regla nueva: se scrapean datos públicos de terceros aunque el sitio no lo autorice, también con StealthyFetcher / Cloudflare (límites: login ajeno, datos personales, rate limit).
- Scrapling: `scrapling install` no baja el Chromium de patchright; se suma `python -m patchright install chromium` (sin eso falla el modo sigiloso).
- Scrapling: sección de relocalización adaptativa (`adaptive` / `auto_save` / `storage_args`) con ejemplo probado.
- MCP de Scrapling: `--scope user`, separador `--`, ruta `Scripts\scrapling-mcp.exe` en Windows y `-e PLAYWRIGHT_BROWSERS_PATH`.
- Windows: instalador de uv por PowerShell, `Scripts\` en vez de `bin/`, y la trampa de la app MSIX que esconde lo instalado en `AppData` (variables `UV_*` y `PLAYWRIGHT_BROWSERS_PATH`).
- Recomendado Python 3.12 con uv; Scrapling y ScrapeGraphAI conviven en el mismo entorno.
- ScrapeGraphAI: `gpt-4o-mini` como modelo por defecto (10/10 en la prueba); `playwright install chromium`.
- Agent Reach: `AGENT_REACH_LANG=en`, qué deja `setup` (skill en `~/.agents/skills`, enlace en `~/.claude/skills` que no hay que subir a claude-config) y cómo funciona de verdad el login (extensión OpenCLI o ventana).
- El repo pasa a ser un plugin de Claude Code (`chimpance-skills@chimpance`); `skillsDirectories` no existe.

## Pendiente de verificar

- Endpoint remoto vigente del MCP de ScrapeGraph y precios de créditos.
- Origen: video "3 plugins de scraping con IA para Claude Code" (Migue Baena IA, TikTok).
