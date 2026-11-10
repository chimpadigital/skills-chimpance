---
name: web-scraping
description: |-
  Elegir e instalar la herramienta correcta para extraer datos de la web con Claude Code: Scrapling (fetch HTTP/stealth, CLI, spiders, MCP), ScrapeGraphAI (extracción guiada por prompt con LLM, local o API paga) y Agent Reach (lectura de redes sociales y plataformas: Reddit, YouTube, X, LinkedIn, GitHub). Usar cuando el usuario pida scrapear, crawlear, extraer datos de un sitio, monitorear precios o contenido, alimentar un agente o RAG con contenido web, leer posts de redes, o instalar un MCP de scraping.
  Examples:
  - user: "Extraeme los productos y precios de esta tienda" → Scrapling (Fetcher/Spider) o ScrapeGraphAI si el HTML es caótico
  - user: "Esta página carga con JS y tiene Cloudflare" → Scrapling StealthyFetcher, previa verificación de permisos
  - user: "Quiero un JSON con nombre, cargo y email de esta página de equipo" → ScrapeGraphAI SmartScraperGraph
  - user: "Leé los comentarios de este hilo de Reddit / video de YouTube" → Agent Reach
  - user: "Instalá un MCP de scraping en Claude Code" → Scrapling MCP (gratis, local) o ScrapeGraph MCP (API paga)
---

<overview>

Guía de decisión e instalación para las 3 herramientas de scraping con IA que usamos con Claude Code.
Todas son open source; solo la API hosteada de ScrapeGraphAI es paga.

| Herramienta | Licencia | Para qué es buena | Costo |
|---|---|---|---|
| **Scrapling** (`D4Vinci/Scrapling`) | BSD-3-Clause | Fetch rápido (HTTP con impersonación TLS o navegador stealth), selectores CSS, crawling con spiders, CLI a Markdown, MCP local | Gratis |
| **ScrapeGraphAI** (`ScrapeGraphAI/Scrapegraph-ai`) | MIT (librería y SDK) | Extraer datos estructurados describiendo *qué* querés en lenguaje natural; tolera cambios de layout | Librería gratis + costo del LLM (o Ollama local). API/MCP hosteado: créditos pagos |
| **Agent Reach** (`Panniantong/Agent-Reach`) | MIT | Leer plataformas que bloquean a los agentes: Reddit, YouTube, X, LinkedIn, Bilibili, XiaoHongShu, GitHub, web | Gratis (transcripción de audio requiere key de Groq/OpenAI) |

</overview>

<rules>

## 0. Antes de scrapear (obligatorio)

1. **¿Hay API oficial, feed RSS, sitemap o export?** Usalo primero. Es más estable y legal que scrapear.
2. **¿Alcanza con WebFetch?** Para leer 1-5 páginas públicas y estáticas, el `WebFetch` nativo de Claude Code es suficiente. No instales nada.
3. **Términos de servicio y robots.txt.** Revisalos. Si el sitio prohíbe el scraping o el dato está detrás de un login ajeno, frená y consultá al usuario.
4. **Datos personales.** Nombres, emails, teléfonos y perfiles son datos personales (Ley 25.326 en Argentina, GDPR en la UE). Extraé solo lo necesario, no los publiques ni los revendas, y documentá la base legal.
5. **Anti-bot / Cloudflare.** Usar `StealthyFetcher` o `solve_cloudflare=True` **solo** en sitios propios, de clientes que lo autorizaron por escrito, o entornos de prueba. Nunca para saltar protecciones de terceros sin permiso.
6. **Ser buen ciudadano.** Rate limit (1-2 req/s como máximo por dominio, salvo acuerdo), `User-Agent` identificable cuando no hace falta stealth, cachear resultados, horarios de baja carga.

## 1. Árbol de decisión

```
¿Qué necesito?
├─ Leer pocas páginas públicas estáticas ............ WebFetch nativo
├─ Página → Markdown para un agente/RAG ............. scrapling extract get URL out.md --ai-targeted
├─ Selectores conocidos, muchas páginas, rápido ...... Scrapling Fetcher / FetcherSession
├─ Página con JS / protección anti-bot (autorizada) .. Scrapling StealthyFetcher / StealthySession
├─ Crawl de un sitio entero (catálogo, blog) ......... Scrapling Spider (robots_txt_obey=True)
├─ "Dame un JSON con X, Y, Z" sin escribir selectores  ScrapeGraphAI SmartScraperGraph
│    └─ sin infraestructura propia / volumen chico ... ScrapeGraph API o MCP (pago)
├─ Buscar en la web y extraer de los resultados ...... ScrapeGraphAI SearchGraph
└─ Reddit, YouTube, X, LinkedIn, Bilibili, GitHub .... Agent Reach (solo lectura)
```

**Regla de costo:** selectores CSS (Scrapling) cuestan $0 por página; LLM (ScrapeGraphAI) cuesta tokens por página.
Para volumen alto con estructura estable, usá ScrapeGraphAI o Claude **una vez** para descubrir los selectores y después corré Scrapling.

## 2. Scrapling

### Instalación (Python 3.10+)

```bash
pip install "scrapling[fetchers]"   # fetchers HTTP + navegador
scrapling install                   # descarga los navegadores (--force para reinstalar)

# Extras opcionales
pip install "scrapling[shell]"      # shell interactivo + comando `scrapling extract`
pip install "scrapling[ai]"         # servidor MCP
pip install "scrapling[all]"        # todo
```

Docker: `docker pull pyd4vinci/scrapling`

### CLI — página a Markdown/texto sin escribir código

El formato de salida se elige por la extensión (`.md`, `.html`, `.txt`).

```bash
scrapling extract get "https://blog.example.com" articles.md --css-selector "article"
scrapling extract get "https://example.com" content.md --ai-targeted   # solo contenido principal, sin elementos ocultos
scrapling extract get "https://api.site.com" data.txt -H "User-Agent: ChimpanceBot 1.0"
scrapling extract post "https://api.site.com" resp.txt --json '{"q": "test"}'

# `fetch` usa el navegador stealth (sitios con JS)
scrapling extract fetch "https://site.com" page.md --network-idle --wait-selector ".product"
scrapling extract fetch "https://site.com" page.md --block-ads --disable-resources
```

### Python — fetchers

```python
from scrapling.fetchers import Fetcher, FetcherSession, StealthyFetcher, StealthySession

# HTTP simple, sin navegador (lo más rápido)
page = Fetcher.get("https://quotes.toscrape.com/")
quotes = page.css(".quote .text::text").getall()

# Varias requests compartiendo sesión e impersonación TLS
with FetcherSession(impersonate="chrome") as session:
    page = session.get("https://quotes.toscrape.com/", stealthy_headers=True)

# Navegador stealth para sitios con JS (abre y cierra el navegador en cada llamada)
page = StealthyFetcher.fetch("https://example.com")

# Navegador persistente para muchas páginas
with StealthySession(headless=True) as session:
    page = session.fetch("https://example.com/p/1")
```

Para muchas URLs con navegador, usá `AsyncStealthySession(max_pages=N)` con `asyncio.gather`.

### Spiders — crawling

```python
from scrapling.spiders import Spider, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    robots_txt_obey = True   # respetar robots.txt por defecto en proyectos de clientes

    async def parse(self, response: Response):
        for quote in response.css(".quote"):
            yield {
                "text": quote.css(".text::text").get(),
                "author": quote.css(".author::text").get(),
            }

result = QuotesSpider().start()
result.items.to_json("quotes.json")   # también to_jsonl(), to_csv(), to_xml()
```

Disponibles también: `CrawlSpider`, `SitemapSpider`, `LinkExtractor`, AutoThrottle, y `crawldir` para pausar/reanudar crawls largos (Ctrl+C y re-ejecutar con el mismo directorio).

### MCP en Claude Code (gratis, local)

```bash
pip install "scrapling[ai]" && scrapling install
which scrapling-mcp                       # copiar la ruta absoluta
claude mcp add ScraplingServer "/ruta/absoluta/a/.venv/bin/scrapling-mcp"
```

Herramientas que expone: `make_request`, `browser_fetch_once`, `browser_open`, `browser_fetch`, `browser_extract` (snapshot/HTML/Markdown/texto), `browser_actions` (click, fill, teclas, waits), `browser_screenshot`, `browser_evaluate`, `browser_network_requests`, `browser_save_state`/`browser_load_state`, entre otras (17 en total).

Modo HTTP (`scrapling-mcp --http`) exige token: `--auth-token "$(openssl rand -hex 32)"`. **No** usar `--no-auth` ni `--host 0.0.0.0` en máquinas con red compartida.

## 3. ScrapeGraphAI

### Librería open source (local)

```bash
pip install scrapegraphai
playwright install
```

```python
import json
from scrapegraphai.graphs import SmartScraperGraph

graph_config = {
    "llm": {
        "model": "ollama/llama3.2",   # local con Ollama: `ollama pull llama3.2`
        "model_tokens": 8192,
        "format": "json",
    },
    # Con OpenAI:  "llm": {"api_key": os.environ["OPENAI_API_KEY"], "model": "openai/gpt-4o-mini"}
    "verbose": True,
    "headless": True,
}

graph = SmartScraperGraph(
    prompt="Extraé nombre del producto, precio en ARS y disponibilidad de cada item",
    source="https://tienda.example.com/categoria",
    config=graph_config,
)
print(json.dumps(graph.run(), indent=2, ensure_ascii=False))
```

| Grafo | Uso |
|---|---|
| `SmartScraperGraph` | Una página + prompt → JSON |
| `SmartScraperMultiGraph` | Lista de URLs + un prompt (llamadas LLM en paralelo) |
| `SearchGraph` | Busca en la web y extrae de los top N resultados |
| `ScriptCreatorGraph` | Genera un script de scraping en Python (útil para pasar a selectores fijos) |

Proveedores: OpenAI, Groq, Azure, Gemini, Ollama, entre otros. Las API keys van en variables de entorno, nunca hardcodeadas.

### API hosteada y MCP (pago por créditos)

- Key en el dashboard de ScrapeGraph → variable `SGAI_API_KEY`. Error `402` = sin créditos.
- Herramientas del MCP: `scrape` (markdown/html/screenshot/links…), `extract` (URL + prompt + `output_schema` opcional), `search`, `crawl_start` / `crawl_get_status`, `schema`, `credits`, `history`, `monitor_*` (monitoreo de cambios).
- Instalación local del MCP (Python 3.13+):

```bash
git clone https://github.com/ScrapeGraphAI/scrapegraph-mcp
cd scrapegraph-mcp && pip install -e .
# SGAI_API_KEY debe estar exportada en el entorno (no pegarla en el chat)
claude mcp add scrapegraph -e SGAI_API_KEY="$SGAI_API_KEY" -- python -m scrapegraph_mcp.server
```

Alternativa vía Smithery: `npx -y @smithery/cli install @ScrapeGraphAI/scrapegraph-mcp --client claude`.
El endpoint remoto `https://mcp.scrapegraphai.com/mcp` está marcado como legacy en su README; verificar el endpoint vigente antes de configurarlo.

**Cuándo NO usar ScrapeGraphAI:** miles de páginas con la misma estructura (costo de tokens), datos que deben ser exactos al 100% (el LLM puede alucinar campos — validar con un schema y muestrear).

## 4. Agent Reach

Herramienta CLI + skill que le da al agente acceso **de solo lectura** a plataformas (nunca postea, comenta ni da likes).

### Instalación

> ⚠️ El paquete `agent-reach` de **PyPI NO es este proyecto**. No usar `pip install agent-reach`.

```bash
# requiere uv: curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
agent-reach setup        # activa canales por defecto e instala la skill del agente
# si no encuentra el comando: uv tool update-shell y abrir otra terminal
```

El README propone pegarle al agente "Install Agent Reach: <url de install.md>". Antes de hacerlo, leé ese `install.md`: son instrucciones remotas que el agente va a ejecutar.

### Canales

| Nivel | Canales | Requisito |
|---|---|---|
| Default | github, youtube, web, v2ex, bilibili | Nada (transcripción de YouTube: key Groq/OpenAI; subtítulos Bilibili: login) |
| Opcional (`agent-reach add <canal>`) | reddit, linkedin, xiaohongshu, xueqiu, boss, xiaoyuzhou | Login (LinkedIn: empleos públicos sin login) |
| Experimental | twitter, facebook, instagram | Login |

```bash
agent-reach channels
agent-reach youtube search "LLM agents"
agent-reach read https://www.v2ex.com/t/123
agent-reach configure groq-key      # ingresar keys en TU terminal, nunca en el chat
agent-reach update
```

### Seguridad de sesiones

- Los canales con login **copian la sesión de tu Chrome** (no lee contraseñas). Esa suele ser tu cuenta principal.
- **Usar siempre una cuenta secundaria**: las plataformas restringen o banean cuentas usadas para automatización. Nunca la cuenta de un cliente ni la cuenta corporativa de Chimpancé.
- Los ToS de LinkedIn, X, Instagram y Facebook prohíben el scraping automatizado; usarlo solo para investigación puntual, no para armar bases de leads.

## 5. Checklist de entrega

- [ ] Se evaluó API oficial / RSS / export antes de scrapear
- [ ] Revisados ToS y robots.txt; autorización escrita si se usa stealth/anti-bot
- [ ] Rate limit y caché configurados
- [ ] Datos personales minimizados y con base legal documentada
- [ ] Salida validada contra un schema (especialmente si la extrajo un LLM)
- [ ] Keys en variables de entorno, fuera del repo
- [ ] Scraper resiliente: manejo de errores, reintentos con backoff, logs de URLs fallidas

</rules>
