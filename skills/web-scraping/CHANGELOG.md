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

## Pendiente de verificar

- Feature de relocalización adaptativa de elementos de Scrapling (`adaptive`/`auto_save`): no documentada acá porque no se pudo confirmar la API exacta.
- Ruta donde `agent-reach setup` instala su skill para Claude Code.
- Endpoint remoto vigente del MCP de ScrapeGraph y precios de créditos.
- Origen: video "3 plugins de scraping con IA para Claude Code" (Migue Baena IA, TikTok).
