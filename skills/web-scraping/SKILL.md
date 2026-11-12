---
name: web-scraping
description: |-
  Elegir e instalar la herramienta correcta para extraer datos de la web con Claude Code: Scrapling (fetch HTTP/stealth, CLI, spiders, MCP), ScrapeGraphAI (extracción guiada por prompt con LLM, local o API paga) y Agent Reach (lectura de redes sociales y plataformas: Reddit, YouTube, X, LinkedIn, GitHub). Usar cuando el usuario pida scrapear, crawlear, extraer datos de un sitio, monitorear precios o contenido, alimentar un agente o RAG con contenido web, leer posts de redes, o instalar un MCP de scraping.
  Examples:
  - user: "Extraeme los productos y precios de esta tienda" → Scrapling (Fetcher/Spider) o ScrapeGraphAI si el HTML es caótico
  - user: "Esta página carga con JS y tiene Cloudflare" → Scrapling StealthyFetcher (dato público: se puede aunque sea un tercero)
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
3. **Términos de servicio y robots.txt.** Revisalos y anotá qué dicen. Que un tercero prohíba el scraping **no frena el trabajo** si el dato es público (regla de Chimpancé desde el 12/11/2026). Si el dato está detrás de un login ajeno, frená y consultá al usuario.
4. **Datos personales.** Nombres, emails, teléfonos y perfiles son datos personales (Ley 25.326 en Argentina, GDPR en la UE). Extraé solo lo necesario, no los publiques ni los revendas, y documentá la base legal.
5. **Anti-bot / Cloudflare.** `StealthyFetcher` y `solve_cloudflare=True` se usan también en sitios de terceros cuando el dato es público (carteleras, eventos, precios, catálogos), aunque el sitio no lo autorice. Límites: nada detrás de un login ajeno, datos personales al mínimo (punto 4), rate limit bajo (punto 6), y en proyectos de clientes avisar el riesgo (bloqueo de IP, reclamo del sitio). Ojo: el modo auto de Claude Code puede frenar estos comandos aunque la regla lo permita; en ese caso los corre el usuario en su terminal.
6. **Ser buen ciudadano.** Rate limit (1-2 req/s como máximo por dominio, salvo acuerdo), `User-Agent` identificable cuando no hace falta stealth, cachear resultados, horarios de baja carga.

## 1. Árbol de decisión

```
¿Qué necesito?
├─ Leer pocas páginas públicas estáticas ............ WebFetch nativo
├─ Página → Markdown para un agente/RAG ............. scrapling extract get URL out.md --ai-targeted
├─ Selectores conocidos, muchas páginas, rápido ...... Scrapling Fetcher / FetcherSession
├─ Página con JS / protección anti-bot (dato público)  Scrapling StealthyFetcher / StealthySession
├─ Crawl de un sitio entero (catálogo, blog) ......... Scrapling Spider (robots_txt_obey=True)
├─ "Dame un JSON con X, Y, Z" sin escribir selectores  ScrapeGraphAI SmartScraperGraph
│    └─ sin infraestructura propia / volumen chico ... ScrapeGraph API o MCP (pago)
├─ Buscar en la web y extraer de los resultados ...... ScrapeGraphAI SearchGraph
└─ Reddit, YouTube, X, LinkedIn, Bilibili, GitHub .... Agent Reach (solo lectura)
```

**Regla de costo:** selectores CSS (Scrapling) cuestan $0 por página; LLM (ScrapeGraphAI) cuesta tokens por página.
Para volumen alto con estructura estable, usá ScrapeGraphAI o Claude **una vez** para descubrir los selectores y después corré Scrapling.

## 2. Scrapling

### Instalación (Python 3.10+; recomendado 3.12)

Usá un entorno virtual dedicado (`~/.venvs/scraping`) con Python 3.12 creado con uv: `uv venv --python 3.12 ~/.venvs/scraping`. Con 3.14 no está probado. Scrapling y ScrapeGraphAI conviven sin conflictos en el mismo entorno (probado: scrapling 0.5.1 + scrapegraphai 2.3.1).

```bash
pip install "scrapling[fetchers]"   # fetchers HTTP + navegador
scrapling install                   # descarga el Chromium de Playwright (--force para reinstalar)
python -m patchright install chromium   # OBLIGATORIO para StealthyFetcher / `extract fetch`

# Extras opcionales
pip install "scrapling[shell]"      # shell interactivo + comando `scrapling extract`
pip install "scrapling[ai]"         # servidor MCP
pip install "scrapling[all]"        # todo
```

> ⚠️ `scrapling install` **no** baja el Chromium de patchright, que es el que usa el modo sigiloso (versiones distintas: en 0.5.1, playwright usa `chromium-1254` y patchright `chromium-1248`). Sin el paso de patchright, `StealthyFetcher` falla con `Executable doesn't exist at ...\chromium-XXXX\...\chrome.exe`.

Docker: `docker pull pyd4vinci/scrapling`

### Windows

- **uv:** `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (no `curl | sh`). Queda en `~/.local/bin`; si la terminal no lo encuentra: `uv tool update-shell` y abrir otra.
- Los ejecutables del entorno están en `Scripts\` (no `bin/`): `~\.venvs\scraping\Scripts\scrapling.exe`. Para buscar una ruta: `where`, no `which`.
- **Trampa de la app de escritorio de Claude (paquete MSIX):** lo que una sesión de la app escribe en `%APPDATA%` o `%LOCALAPPDATA%` se redirige a `AppData\Local\Packages\Claude_...\LocalCache\` y la terminal normal no lo ve (uv no puede ni armar el Python). Instalá todo fuera de `AppData` y usá esas mismas variables al correr:

```bash
export UV_PYTHON_INSTALL_DIR="$HOME/.local/share/uv/python"
export UV_TOOL_DIR="$HOME/.local/share/uv/tools"   UV_TOOL_BIN_DIR="$HOME/.local/bin"
export UV_CACHE_DIR="$HOME/.cache/uv"
export PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"   # navegadores de Scrapling y ScrapeGraphAI
```

Para la terminal del usuario, que lo fije una vez con `setx PLAYWRIGHT_BROWSERS_PATH "%USERPROFILE%\.cache\ms-playwright"`.
- **Claves:** el usuario las carga con `setx NOMBRE "valor"` en su terminal. Desde la app se leen sin reiniciarla con `powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('NOMBRE','User')"` (nunca imprimir el valor).

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

### Relocalización adaptativa — que el scraper no traiga 0 cuando el sitio cambia

Scrapling guarda la "huella" de un elemento (etiqueta, texto, atributos, padres y hermanos) y, si el sitio cambia el diseño y el selector deja de encontrar, lo vuelve a ubicar por similitud. Doc: https://scrapling.readthedocs.io/en/latest/parsing/adaptive.html

```python
from scrapling.parser import Selector
# con fetchers: Fetcher.configure(adaptive=True)  (opcional adaptive_domain="sitio.com")

STORAGE = {"storage_args": {"storage_file": "/ruta/propia/adaptive.db", "url": "ticketera.com"}}

# 1) primera corrida: el selector anda y se guarda la huella
page = Selector(html_viejo, adaptive=True, url="ticketera.com", **STORAGE)
precio = page.css("#precio", auto_save=True)

# 2) el sitio cambió id, clase y estructura: el selector viejo devuelve []
page2 = Selector(html_nuevo, adaptive=True, url="ticketera.com", **STORAGE)
precio = page2.css("#precio") or page2.css("#precio", adaptive=True)   # lo relocaliza
```

- Probado con 0.5.1: el precio pasó de `<span id="precio">` a `<span class="price-tag">` dentro de otro bloque y `adaptive=True` lo encontró.
- Sin `url` usa el dominio `default` y se pisan los datos de distintos sitios.
- Por defecto la base SQLite queda **dentro del paquete instalado** (`scrapling/elements_storage.db`): pasá `storage_args` con una ruta propia para que no se pierda al reinstalar.
- Solo se guarda la huella del primer elemento del resultado.

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
pip install "scrapling[ai]" && scrapling install && python -m patchright install chromium
which scrapling-mcp                       # Windows: where scrapling-mcp  → ...\Scripts\scrapling-mcp.exe
# --scope user: sin esto queda atado a la carpeta donde se corrió el comando
claude mcp add --scope user ScraplingServer -- "/ruta/absoluta/a/.venv/bin/scrapling-mcp"

# Windows, con los navegadores fuera de AppData (ver "Windows" arriba):
claude mcp add -e 'PLAYWRIGHT_BROWSERS_PATH=C:\Users\<usuario>\.cache\ms-playwright' --scope user ScraplingServer -- 'C:\Users\<usuario>\.venvs\scraping\Scripts\scrapling-mcp.exe'
claude mcp list                           # tiene que decir ✔ Connected
```

En la app de escritorio el comando `claude` no está en el PATH: el ejecutable de Claude Code está en `%LOCALAPPDATA%\Claude-Data\<id>\claude-code\<versión>\<hash>\claude.exe`.

Herramientas que expone: `make_request`, `browser_fetch_once`, `browser_open`, `browser_fetch`, `browser_extract` (snapshot/HTML/Markdown/texto), `browser_actions` (click, fill, teclas, waits), `browser_screenshot`, `browser_evaluate`, `browser_network_requests`, `browser_save_state`/`browser_load_state`, entre otras (17 en total).

Modo HTTP (`scrapling-mcp --http`) exige token: `--auth-token "$(openssl rand -hex 32)"`. **No** usar `--no-auth` ni `--host 0.0.0.0` en máquinas con red compartida.

## 3. ScrapeGraphAI

### Librería open source (local)

```bash
pip install scrapegraphai
playwright install chromium   # alcanza con chromium; si ya está el de Scrapling, no baja nada
```

Modelo recomendado: **OpenAI `gpt-4o-mini`** (probado: 10/10 citas con autor en quotes.toscrape.com, costo menor a un centavo). `ollama/llama3.2` (3B) es gratis y local pero suele fallar al devolver JSON prolijo, pesa ~2 GB y no corre en el servidor.

```python
import json, os
from scrapegraphai.graphs import SmartScraperGraph

graph_config = {
    "llm": {"api_key": os.environ["OPENAI_API_KEY"], "model": "openai/gpt-4o-mini"},
    # Local con Ollama (`ollama pull llama3.2`):
    # "llm": {"model": "ollama/llama3.2", "model_tokens": 8192, "format": "json"},
    "verbose": False,
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
# requiere uv (Windows: ver "Windows" en la sección de Scrapling, incluida la trampa de AppData → UV_TOOL_DIR)
uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
AGENT_REACH_LANG=en agent-reach setup   # sin AGENT_REACH_LANG=en la skill y el reporte salen en chino
# si no encuentra el comando: uv tool update-shell y abrir otra terminal
```

Qué deja `setup` (probado con 1.6.1):
- Config, sesiones y reporte en `~/.agent-reach/`.
- La skill real en `~/.agents/skills/agent-reach/SKILL.md` (Codex la lee de ahí).
- Un **enlace simbólico** en `~/.claude/skills/agent-reach` (y en `~/.gemini/skills` si existe). En Chimpancé `~/.claude` es el repo claude-config: **no subir ese enlace** (apunta a una ruta local y se rompe en otras compus); agregarlo a `.git/info/exclude`.
- Las respuestas son JSON (`ok`, `items`, `error`). No registra ningún MCP.

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

- Los canales con login usan un navegador aparte. La primera vez, **si tu Chrome tiene conectada la extensión OpenCLI**, copia las cookies de ese sitio solo (no el perfil, no las contraseñas). Si no está la extensión, `agent-reach login <canal>` abre una ventana para que el usuario entre a mano. Esa suele ser tu cuenta principal.
- **Usar siempre una cuenta secundaria**: las plataformas restringen o banean cuentas usadas para automatización. Nunca la cuenta de un cliente ni la cuenta corporativa de Chimpancé.
- Los ToS de LinkedIn, X, Instagram y Facebook prohíben el scraping automatizado; usarlo solo para investigación puntual, no para armar bases de leads.

## 5. Checklist de entrega

- [ ] Se evaluó API oficial / RSS / export antes de scrapear
- [ ] Revisados ToS y robots.txt (anotado qué dicen); el dato es público y no está detrás de un login ajeno
- [ ] Rate limit y caché configurados
- [ ] Datos personales minimizados y con base legal documentada
- [ ] Salida validada contra un schema (especialmente si la extrajo un LLM)
- [ ] Keys en variables de entorno, fuera del repo
- [ ] Scraper resiliente: manejo de errores, reintentos con backoff, logs de URLs fallidas

</rules>
