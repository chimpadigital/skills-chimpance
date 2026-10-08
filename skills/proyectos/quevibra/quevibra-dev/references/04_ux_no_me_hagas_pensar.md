# 04 · UX de QueVibra: No me hagas pensar

Filosofía del proyecto pedida por Santiago (30/9/2026). Sale del libro de Steve Krug (*No me hagas pensar*); la síntesis completa del libro está en `~/.claude/skills/ux-chimpa/references/filosofia-krug.md`. Acá está bajada a QueVibra: quién la usa, qué no le puede hacer pensar, y las reglas que ya aprendimos a los golpes.

## Contenido
1. Las tres leyes
2. Quién usa QueVibra y en qué contexto
3. Las preguntas que nunca se tiene que hacer nadie
4. Las 14 reglas de QueVibra
5. Los 7 estados de toda pantalla
6. Los tests antes de entregar
7. Contar dudas, no clics
8. Cuando una decisión de negocio agrega fricción

---

## 1 · Las tres leyes

1. **No me hagas pensar.** Una pantalla tiene que ser *evidente*: qué es y qué hago acá, sin esfuerzo. Si no se puede, que *se explique sola* de un vistazo. Cada "¿esto se toca?", "¿se guardó?", "¿esto es gratis?", "¿en qué ciudad estoy viendo?" gasta paciencia, y la paciencia del que llega desde Instagram es muy poca.
2. **No importa cuántos toques, si cada uno es obvio.** Tres toques sin dudar valen más que uno que obliga a pensar.
3. **Sacá la mitad de las palabras, y después la mitad de lo que quedó.** Nada de bienvenidas ni instrucciones. Si hace falta explicar cómo se usa, el diseño falló.

La gente no lee: **escanea**, toca **la primera opción razonable** y **sale del paso** sin entender cómo funciona. Diseñamos para eso, no para el usuario ideal. Si alguien se equivocó, la pantalla lo dejó equivocarse.

## 2 · Quién usa QueVibra y en qué contexto

| Quién | Qué quiere (en sus palabras) | Contexto real | Lo que no le puede hacer pensar |
|---|---|---|---|
| **Usuario** — el "curioso cultural urbano", 25-50 (ver `quevibra-business` para segmentos) | "¿Qué hago hoy / este finde?", "¿qué hay de lo que me gusta?" | Celular, una mano, de noche o el viernes a la tarde, apurado, muchas veces **llegando desde un link de Instagram o WhatsApp** (navegador interno de IG, sin sesión, sin contexto) | Qué es esto, cuándo y dónde es, cuánto sale, cómo saco entrada, si se guardó |
| **Organizador** (bar, teatro, productora, tallerista) | "Quiero que mi evento lo vea gente" | Celular o compu, entre otras mil cosas; muchos viven en Instagram y no conocen QueVibra | Qué datos me piden y para qué, cómo va a quedar, si ya está publicado, si perdí lo que cargué |
| **Operación / admin** (Santiago y quien cargue eventos, haga QA de scrapers o redes) | "Cargar este flyer", "¿qué scraper está roto?", "armar el carrusel del lunes" | Compu, muchas veces seguidas, con apuro | Qué falló y qué hago, si una corrida anduvo de verdad, qué falta revisar |

Regla de prioridad: **el usuario en el celular manda**. El admin puede ser más denso, pero nunca mudo ni mentiroso.

## 3 · Las preguntas que nunca se tiene que hacer nadie

Si alguna de estas aparece en la cabeza de alguien, hay un problema de diseño:

- **¿Qué es esto?** (la home, una landing, una ficha que llegó por WhatsApp)
- **¿Cuándo, dónde, cuánto?** (toda card y toda ficha lo responden de un vistazo: fecha en lima, lugar y ciudad, chip Gratis o precio)
- **¿Cómo saco la entrada?** (el botón dice adónde te lleva: "Ver entradas" + que sale de QueVibra hacia la ticketera)
- **¿Se guardó?** (Me vibra / Agendar responden al instante y **no mienten** si el servidor falló)
- **¿En qué ciudad estoy mirando?** (la ciudad siempre visible y cambiable; "Todas las ciudades" explícito)
- **¿Por qué me piden registrarme?** (solo cuando hay una razón concreta: guardar, agendar; y después vuelvo a donde estaba con la acción hecha)
- **¿Dónde estoy y cómo vuelvo?** (prueba del baúl: si caigo en cualquier pantalla, sé qué es y adónde puedo ir)
- **¿Ya está publicado mi evento? ¿Cómo lo ven los demás?** (organizador)
- **¿El scraper anduvo o no?** (admin: verde solo si trajo eventos de verdad)

## 4 · Las 14 reglas de QueVibra

Cada una dice de qué idea de Krug sale y, cuando la hay, la lección que ya pagamos.

1. **Qué, cuándo, dónde y cuánto, de un vistazo.** Toda card y toda ficha, sin abrir nada. Las 3 anclas de la EventCard del DS (fecha, sello de categoría, precio) no son decoración: son las respuestas. *(Diseño para el escaneo.)*
2. **La acción principal siempre a mano en el celular.** En la ficha de evento, "Ver entradas / Agendar / Me vibra" en barra fija abajo; el botón principal en el tercio inferior, ≥ 44 px. *Pasó:* `/evento/:slug` tenía los botones bajo el pliegue y es justo la puerta de los links compartidos (tráfico frío) — se arregló con la barra fija (A2, jun-2026). *Sigue pendiente:* el "Volver" de la ficha mide 20 px de alto en celular (medido el 30/9/2026).
3. **Nada se corta: si no entra, se scrollea.** Nunca `overflow-hidden` sobre contenido que puede ser más alto que la pantalla. *Pasó:* el botón "Empezar" de `/unirme` y el contenido de `/descubri` se cortaban en celulares de ≤ 667 px de alto (A1, M3). Probá siempre en 360×640.
4. **Tamaños para el dedo.** Todo lo tocable ≥ 44×44 px; campos de texto ≥ 16 px (si no, iOS hace zoom). *Pasó:* "Atrás/Siguiente" del onboarding a 40 px, íconos del header a 36 px.
5. **Pedir el registro por intención, nunca por tiempo, y devolver a la persona adonde estaba.** El modal aparece cuando la persona quiere guardar o agendar (o al ver un segundo evento), no a los 30 segundos. Después del login, la acción pendiente se completa sola (`useReturnTo` / `decidePostLoginNavigation`). *Pasó:* el modal por tiempo interrumpía; "Me vibra" anónimo congelaba la app por doble capa (Task #235).
6. **Nunca mentir.** Nunca "Guardado" si no se guardó; la interfaz optimista vuelve atrás y lo dice ("No se guardó, probá de nuevo") si el servidor falla. Nunca un número que no es. En el admin, nunca "OK" con 0 eventos. *Pasó:* "Me vibra" y "Agendar" daban 500 en producción y la pantalla decía que sí (y además se medían eventos falsos, jun-2026); Eden estuvo meses "OK" trayendo 0 (sep-2026).
7. **Nada es un callejón sin salida.** Vacío, sin resultados, error, 404, "gracias": todos tienen un próximo paso ("Ver el finde", "Ver todas las ciudades", "Reintentar", "Volver a Explorar"). Si no hay nada hoy en Salta, se ofrece lo más cercano en el tiempo o en el mapa, nunca una pantalla en blanco. *Ojo:* `EventSection` desaparece cuando está vacía (bien para una fila de la home, mal si deja la página vacía).
8. **La ciudad nunca se adivina mal.** Si no sabemos la ciudad, se dice "tu ciudad" o se pregunta; nunca se pone Córdoba por defecto en algo que ve el usuario (placas, cards, emails). *Pasó:* el generador ponía "Córdoba" en placas de otras ciudades; el sync guarda `city ?? "Córdoba"` (ver `06`).
9. **Descubrir, no vender.** QueVibra no es ticketera: el botón de entradas dice adónde lleva y abre la ticketera; el tono es "descubrí / te vibra", nunca "comprá ya". *(Franqueza: decí de frente lo que la persona quiere saber.)*
10. **Los botones dicen lo que pasa.** "Agendar", "Me vibra", "Ver entradas", "Publicar evento", "Ejecutar ahora" — no "Aceptar", "Enviar", "OK". Ningún botón deshabilitado sin decir qué falta. *(Nada mudo.)*
11. **Nunca perder lo que la persona cargó.** Formularios del organizador y del admin: si falla la red o se equivoca un campo, lo cargado sigue ahí; el error va al lado del campo y dice qué hacer. Los campos aceptan el dato como lo escribe la gente ("21 hs", "$ 1.500", "@usuario" o "usuario"). *(No me castigues por no hacerlo a tu manera.)*
12. **El sistema hace el trabajo.** Si la IA puede leer el flyer, la persona no tipea; si el lugar ya existe, se autocompleta; si la categoría se puede inferir, se propone. **La IA propone y la persona confirma**; lo precargado se distingue de lo cargado a mano.
13. **Convenciones, no inventos.** Corazón = guardar, lupa = buscar, X = cerrar, flecha atrás arriba a la izquierda, barra inferior con el centro destacado. La originalidad va en la marca (pixel, color, Silkscreen), no en cómo se usa. Todo gesto (deslizar un carrusel) tiene también un botón visible.
14. **Sacá palabras.** Sin "Bienvenido a…", sin párrafos de instrucciones. Una línea de ayuda debajo del campo que la necesita, si hace falta. Voz QueVibra: voseo, frases cortas, sentence case, sin "plataforma / ecosistema / experiencias" (ver `quevibra-business`).

## 5 · Los 7 estados de toda pantalla

Una pantalla no tiene un estado: tiene siete. Diseñalos y probalos todos (cómo provocarlos en `03` › Nivel 3).

| Estado | Qué tiene que ver la persona | En QueVibra |
|---|---|---|
| 1. Cargando | La forma de lo que viene (skeleton), nunca blanco ni "Cargando…" suelto | `EventCardSkeleton`, `home-v2/Skeletons`. Ojo: el Router devuelve `null` mientras carga la sesión y `Suspense` usa `fallback={null}` |
| 2. Vacío la primera vez | Por qué está vacío + la acción para llenarlo | Copys cerrados en el DS: "Aún no agendaste eventos" → "Empezá explorando", etc. |
| 3. Sin resultados | Qué filtro lo dejó vacío + "Limpiar filtros / Ver todas las ciudades" | Explore: "No encontramos lo que buscás" |
| 4. Error | Qué pasó, que lo cargado está a salvo, Reintentar | DS: "Algo se rompió de nuestro lado · Reintentar"; sin conexión: "Revisá tu internet" |
| 5. Sin permiso | De quién es y qué hacer ("Iniciá sesión") | Rutas de organizador y admin |
| 6. No existe / ya pasó | Qué pasó y adónde ir | 404 de evento: "Esta página ya no está… seguro hay algo para vos" + accesos |
| 7. Guardando / desactualizado | Que se está guardando, y después que se guardó (o que no) | Me vibra, Agendar, formularios, "Ejecutar ahora" del admin |

El DS v0.3 (`docs/vibra-ds/vibra-ds-v0.3-consolidado.md` §4.6-4.7) define un **EmptyState y un ErrorState únicos con copys cerrados, toasts de 5 variantes (con "Deshacer/Reintentar") y un indicador de sin conexión**. Hoy no existen como componentes (cada página hace el suyo y los toasts tienen 2 variantes). Si una tarea toca uno de esos estados, usá los copys del DS; si toca varios, proponé a Santiago crear el componente común.

## 6 · Los tests antes de entregar

Una línea por test, en el reporte o el PR:

1. **5 segundos**: alguien que nunca vio QueVibra mira la pantalla 5 s — ¿sabe qué es y qué puede hacer?
2. **Vengo de Instagram**: abro el link de un evento en el navegador de IG, sin sesión — ¿entiendo qué es, cuándo, dónde, cuánto, y cómo saco entrada sin registrarme?
3. **El apurado que no lee**: leyendo solo títulos y botones, ¿llego?
4. **El baúl**: si caigo en cualquier pantalla, ¿sé dónde estoy y adónde puedo ir?
5. **Pulgar**: celular en una mano, 360×640 — ¿la acción principal está al alcance y mide ≥ 44 px? ¿nada se corta? (`scripts/controles-usabilidad.js`)
6. **Dedo gordo**: si toco lo que no era, ¿vuelvo sin perder nada?
7. **Mala conexión / falla del servidor**: ¿qué veo? ¿la pantalla dice la verdad?
8. **Volver mañana**: si cierro y vuelvo, ¿encuentro lo que guardé y sé qué sigue?

## 7 · Contar dudas, no clics

En el pinponeo con Santiago y en el PR, contá: "hoy son N toques con D dudas → con el cambio, M toques con 0 dudas". Una duda es cualquier momento en que la persona tiene que pensar qué tocar o qué significa algo. Es la forma de mostrar el valor de un cambio de UX en criollo.

Cuando haya algo para mostrar a usuarios reales (onboarding, carga de evento del organizador), recomendá **probarlo con 3 personas**: tareas dichas como intención ("encontrá algo para hacer este sábado a la noche"), sin ayudar, anotando dónde dudan. Las discusiones de gusto se cortan mirando a gente usarlo, no opinando.

## 8 · Cuando una decisión de negocio agrega fricción

A veces el negocio pide algo que cuesta usabilidad (pedir más datos al registrarse, un paso más para el organizador, un aviso en el medio del flujo). No se discute con "eso es mala UX": se dice **qué cuesta** ("cada campo obligatorio más en el registro baja la conversión; hoy medimos X") y se propone la versión que logra lo mismo con menos fricción (pedirlo después, deducirlo, hacerlo opcional). Si Santiago decide igual, se respeta y se deja anotado el porqué en el PR.
