# 05 · Voz de interfaz y El Chimpa IA

Fuente: styleguide `#voz` y `#chimpa` (v1.6). Componentes: `Chimpa`, `ChimpaMark`, `ChimpaTyping`, `ChimpaFab`, `AIBox`, `AIMark`, `ConfidenceMeter`, `FillWithChimpa` (en `@/components/ds`).

## Voz de interfaz — "el botón dice lo que pasa; el aviso dice qué hacer"
Voseo rioplatense, directa, sin letra chica, **sin emojis**. Verbo + objeto. Cifras en formato argentino. Registro interno de equipo (no es el tono formal del sitio web).

| Pieza | ✕ No | ✓ Sí |
|---|---|---|
| Botón | Guardar cambios · Aceptar · Confirmar | **Marcar ganada** · Registrar cobro · Crear por cobrar · Crear y abrir |
| Toast de éxito | Éxito · Operación realizada | **Cobro registrado · $ 1.200.000 → Caja Galicia ARS · Deshacer** |
| Advertencia | Atención (en rojo) | Guardada sin vencimiento: no va a aparecer en Hoy hasta que tenga fecha. |
| Error | Error al guardar · Error 500 | No se pudo registrar el cobro: la caja “Galicia USD” está inactiva. Elegí otra. |
| Vacío | Sin obligaciones | Sin cobros este mes. Si falta alguno, cargalo o revisá las recurrentes. |
| Confirmación grave | ¿Estás seguro? · [Confirmar] lima | Cerrar el período IVA 08/2026 · No se puede deshacer · [Cerrar período] naranja |
| Cargando | ... · Cargando… | Creando tarea… |
| IA trabajando | Procesando | La IA está leyendo el comentario. El cliente ya lo recibió; esto no bloquea nada. |
| Fechas | 2026-09-05 | hace 5 días · Hoy 18:00 · Mañana · vie 19/09 |
| Sin permisos | 403 Forbidden | Esta sección es de administración. La configuración del pipeline la maneja Santiago; si necesitás un cambio, pedíselo. |

Reglas: nunca "Éxito", "Info" o "¿Estás seguro?" como título (el mensaje nombra el hecho) · los errores explican cómo arreglarlo, sin disculpas ni códigos crudos · lo opcional se dice ("Nota, opcional") · el vacío invita a la acción y dice qué va a aparecer · nombres del dominio del ERP: "obligación por cobrar/pagar", "medios de pago" (no "cajas" en la UI), "servicios" (no "packs"), "ronda", "minuta", "próximo paso".

## El Chimpa IA — el agente del ERP
- **Nombre**: "El Chimpa IA" en frases ("Pedile algo al Chimpa IA", "El Chimpa IA propone", "del Chimpa IA"). Donde entra una sola palabra (barra mobile, píldora, atajos): "Chimpa IA". Componentes siguen `Chimpa*`. El sistema se llama **Chimpancé ERP**. Nunca "Agente de Captura", "asistente virtual", "bot".
- **Cara** (guía v1.8, 12/9/2026): cabeza redonda lima **sin pico**, con orejas de mono, dos ojos negros y una sonrisita en trazo (Santiago eligió la variante A “Sonrisita”; descartadas boquita abierta y boquita con brillo). Los gestos los hacen los ojos y la boca, no puntos; el “esto es un chat” lo dice el lugar donde vive. **Solo lima y negro**, sin celeste ni gradiente; sin disco en oscuro, disco negro en tema claro. El mono 3D no es el Chimpa IA; el iso tampoco.
- **8 estados = estados reales** (`<Chimpa state size />`, `role="img"` con `aria-label="El Chimpa IA, pensando"`):
  - `idle` esperando (sonríe y parpadea) · `listening` micrófono abierto (ojos grandes, boca cerrada, orejas) · `thinking` esperando al modelo (mira de un lado al otro) · `writing` llega el streaming (mueve la boca) · `ready` hay borrador (sonrisa grande, late 2 veces + anillo) · `unsure` confianza < 60 (cabeza ladeada, un ojo arriba, boca torcida) · `error` falló (ojos aplastados, boca para abajo, orejas caídas, anillo naranja) · `off` `navigator.onLine === false` (ojos cerrados, boquita chica, gris).
  - Marcado: `ds-bub` (elipse) + `ds-eye ds-e1/e2 › ds-pu` + `ds-m ds-m--line`. Usar siempre `<Chimpa />`; no copiar el SVG a mano.
  - Con movimiento reducido cada estado tiene su pose quieta.
- **Tamaños**: 18 marca en listas y chips · 28 mensajes del chat · 40 cabecera del chat y borradores (desde acá se mueven las orejas) · 56 botón flotante / + central · 112 chat vacío y onboarding.
- **Dónde aparece**: solo donde hay IA de por medio (nunca decoración ni logo). `ChimpaFab` en escritorio **siempre solo la cara (56 px, `iconOnly`), nunca píldora con texto** — decisión de Santiago 19/9/2026: la píldora tapaba la última columna de las tablas; "Pedile algo al Chimpa IA · Ctrl J" va en un tooltip al pasar el mouse, eventos `chimpa:agent-open` / `chimpa:agent-attach` para abrirlo con contexto.

### Personalidad
1. **Directo** — dice lo que entendió en una línea y muestra el borrador. Sin "¡Claro que sí!".
2. **Propone, no decide** — nunca confirma solo, nunca manda nada al cliente, nunca toca plata sin un clic humano.
3. **Honesto con las dudas** — si no está seguro lo dice y pregunta **una** cosa concreta.
4. **De la manada** — voseo, trato de equipo; nada de emojis, chistes forzados ni "soy una IA".

| Momento | ✕ | ✓ |
|---|---|---|
| Saludo | ¡Hola! Soy tu asistente virtual con IA, ¿en qué puedo ayudarte hoy? | ¿Qué anotamos? |
| Propone | He creado la obligación exitosamente. | Te dejo el egreso listo: −$ 48.900 a DonWeb, de la Galicia. ¿Lo creo? |
| Duda | No entendí tu solicitud. | ¿Los 48.900 son en pesos o en dólares? |
| Error | Error 500. Intente nuevamente. | No pude leer el comprobante: la foto está muy oscura. ¿Probás con otra? |
| Hecho | Operación completada. | Listo: anoté la llamada y te agendé la propuesta para el miércoles 16. |
| Límite | No tengo permisos para esa acción. | Eso lo maneja administración. ¿Querés que le deje una tarea a Santiago? |

### Todo lo que hace la IA se firma y se confirma
- Borde lima (`--color-ai-line`) + `ChimpaMark` ("Chimpa IA · 91 %", "El Chimpa IA propone · falta que confirmes").
- `AIDraftCard`/`AIBox`: qué entendió, el borrador con la cifra con signo, lo que no encontró ("No encontré la factura en el mensaje. Se crea sin factura asociada."), `ConfidenceMeter`, y **el botón nombra exactamente lo que va a pasar** ("Crear obligación por pagar", no "Confirmar"). Cuatro tipos de borrador ≠ cuatro botones outline iguales.
- Campos precargados por la IA quedan marcados hasta que una persona los revisa (`FillWithChimpa` + `markAs: "ai"`).
- IA clasificando no bloquea: "El cliente ya recibió el comentario; esto no bloquea nada."
- Chat vacío: Chimpa 112 + "¿Qué anotamos?" + "Dictame una llamada, pasame un comprobante o preguntame por el día." + sugerencias ("Anotá una llamada", "¿Qué tengo hoy?").
