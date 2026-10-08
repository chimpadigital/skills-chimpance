# Producto interno — ERP / CRM Chimpa-Finanzas

Patrones de experiencia ya decididos para el ERP. Salen de la auditoría del CRM (10/09/2026) y de la auditoría de ~50 formularios (v1.5 del DS). La versión interactiva, con demos, está en `Chimpa-Finanzas/docs/design-system/styleguide.html` (secciones `#patrones`, `#pantallas`, `#carga`, `#mobile`, `#mobile-rapidas`, `#voz`). Para implementar, se encadena con el skill `erp-chimpa-finanzas`.

## Contenido
1. Para quién es
2. Los 9 patrones de interacción
3. Carga de datos: las 12 reglas
4. Errores que se entienden
5. Plata y números
6. Celular: "Hoy en el bolsillo"
7. Lo que ya salió mal (no repetir)

---

## 1. Para quién es

- **Quiénes:** ~12 personas del equipo, casi siempre en escritorio, sesiones largas, cambian de "sombrero" (rol) durante el día.
- **Qué necesitan:** saber qué hacer **hoy**, cargar rápido y no perder datos ni plata.
- **En el celular** el uso es otro: anotar al vuelo y resolver lo del día.
- **Principio:** calma para concentrarse, contraste para decidir. Lo normal no se marca (prioridad normal, estado activo y pesos van sin etiqueta); solo se señala lo que se sale de lo normal.
- **Tres cosas distintas, cada una con su señal:**
  - **Estado:** anillo que se llena.
  - **Categoría:** chip con ícono.
  - **Urgencia:** barras o fecha.
- **Todo estado se lee por forma y por color**, así funciona aunque la persona no distinga colores.

## 2. Los 9 patrones de interacción

**01 · Crear rápido, completar después**
- El alta pide lo mínimo para no perder el dato (3 o 4 campos, una columna).
- El resto va plegado en "Más datos".
- El botón dice adónde va ("Crear y abrir") y el detalle se abre solo.
- Antes de crear, se busca y se avisa si hay duplicado.
- *Hoy:* 10 campos en un modal y, al crear, volvés a la lista a buscar lo que cargaste.

**02 · Editar donde se lee**
- En los detalles no hay formulario con "Guardar" al fondo: cada dato se edita en su lugar y se guarda solo.
- Teclas: clic o Enter edita; Enter o salir del campo guarda; Esc cancela.
- El indicador está siempre visible: "Guardando… · Guardado · No se pudo guardar".
- Si falla, vuelve el valor anterior y el error dice por qué.
- Los cambios de varios campos a la vez sí van en un diálogo.

**03 · Una intención, un envío**
- Registrar un contacto = interacción + tarea del próximo paso + cambio de estado, en un solo envío.
- Ganar = etapa + monto final + empresa + proyecto.
- Es una sola transacción: se guarda todo o nada.

**04 · Deshacer antes que confirmar**

| Acción | Tratamiento |
|---|---|
| Marcar hecha · mover de etapa · archivar · quitar tag | Se hace y aparece "Deshacer" |
| Cancelar tarea · descartar feedback · marcar perdida | Diálogo de riesgo (qué pasa + cómo volver atrás) |
| Eliminar · cerrar período IVA · anular movimiento | Escribir para confirmar (ej.: "Escribí 08/2026") |
| Mandar algo al cliente (mail, WhatsApp, aviso) | Lo manda siempre una persona |

- Lo irreversible nunca usa el mismo botón que "crear".
- Hacen falta varios avisos a la vez: si uno pisa al anterior, se pierde el "Deshacer".

**05 · Decidir con datos**
- Si una decisión alimenta un reporte (ganar, perder, descalificar, cancelar), el dato se pide **en ese momento**, con chips de un toque.
- Motivo obligatorio al perder; monto y fecha al ganar.
- Nunca una etapa elegida en un desplegable + "Guardar".
- También vale al soltar una tarjeta en la columna Ganada o Perdida del kanban.

**06 · Encontrar rápido**
- La búsqueda espera 250 ms después de la última tecla, y los resultados anteriores quedan hasta que llegan los nuevos (nada parpadea).
- "Míos" por defecto.
- Filtros como chips con conteo ("Vencidos 2 · Sin próximo paso 4").
- Búsqueda, filtros y vista quedan en la URL (se pueden compartir) y se recuerdan por usuario.
- El orden se ve y se elige.

**07 · Todo lo abierto tiene un próximo paso**
- Fechas rápidas en días hábiles: "Próximo día hábil · En 3 días · En 1 semana". Por defecto: próximo día hábil a las 10:00.
- Nunca "ahora" por defecto, porque la tarea nace vencida.
- Filtro "Sin próximo paso" en todas las listas comerciales.

**08 · Mover sin arrastrar**
- Todo lo que se arrastra tiene un "Mover a…".
- Filas y tarjetas son links reales, con foco visible.
- Atajos: `/` buscar · `N` nuevo · `M` mover · `Ctrl+J` Chimpa IA.
- Los botones que son solo un ícono tienen etiqueta para el lector de pantalla.

**09 · Datos frescos**
- Los datos se refrescan al volver a la pestaña y cada 30-60 s.
- Las listas largas muestran "Actualizado hace 2 min".
- Si alguien cambió lo que estás editando, te enterás antes de pisarlo: "Rocío cambió esta oportunidad hace 1 min: etapa y monto · Ver cambios".

## 3. Carga de datos: las 12 reglas

1. **Un solo tipo de campo para todo el ERP:** label asociado; obligatorio con * y lo opcional escrito ("Nota, opcional"); ayuda y error debajo.
2. **Empezar por el dato que completa el resto:** CUIT en empresas (completa desde ARCA), factura o texto en obligaciones, lead en oportunidades.
3. **Buscar antes de crear:** todo selector de empresa, proyecto, lead o persona tiene búsqueda y la opción "Crear «…»".
4. **Lo mínimo visible, lo demás en "Más datos",** agrupado por tema (fiscal, contacto, domicilio).
5. **Una columna en el celular, máximo dos en escritorio,** salvo campos cortos que van juntos (ciudad y provincia).
6. **Formatos argentinos al tipear:** $ 1.234,56 · CUIT con guiones y dígito verificador · +54 9 · CBU · DD/MM · horas "1:30".
7. **Valores por defecto con criterio:**
   - fecha de hoy en **hora argentina** (no UTC)
   - responsable = vos
   - próximo día hábil a las 10:00
   - moneda y proyecto del contexto
   - el medio de pago, si hay uno solo
8. **El sistema hace las cuentas:** IVA, total, cuotas, saldo, recurrencias, cotización del día. Mostrar la cuota **antes** de crear la deuda.
9. **Nunca perder lo cargado:** borrador automático y "¿Descartar los cambios? Cambiaste 2 campos que todavía no se guardaron".
10. **El foco va al primer campo vacío** y nunca selecciona el texto que ya está (si no, la primera tecla lo borra).
11. **Enter avanza, Ctrl+Enter guarda.** El botón dice qué crea y muestra "Guardando…".
12. **"Completar con el Chimpa IA"** donde hay un texto o archivo de origen. Lo precargado se marca y lo confirma una persona.

**Campos que entienden al usuario:**
- **Monto:** acepta "1.234,56", "1234.56" y "1,2 M". *Pasó:* pegar "1234.56" guardaba 123.456.
- **Horas:** acepta "1:30", "30 min" o "media jornada", no solo decimales.
- **CBU:** detecta el banco por los primeros 3 dígitos.
- **Moneda antes que monto**, para que el símbolo no cambie después de escribir. En "neto o total" se elige y el resto se calcula.
- **La frase final dice qué se va a crear**, y el botón lo repite: "Crear por cobrar".

## 4. Errores que se entienden

**Cuándo y dónde:**
1. Al **salir** del campo; no mientras escribe ni solo al final.
2. **Al lado** del campo, diciendo qué hacer. Nunca solo en un aviso que desaparece.
3. Al enviar con errores: resumen arriba con links a cada campo y el cursor en el primero ("Faltan 2 datos para crear la deuda: el capital y la cantidad de cuotas").
4. Botón deshabilitado sin explicación: prohibido.

**Traductor único de errores del servidor** (nunca se muestra el error crudo):

| Llega | Se muestra |
|---|---|
| `projectId: Expected number, received null` | Elegí un proyecto para poder facturarla. |
| `VALIDATION_REFERRAL_REQUIRED` | Si vino por un referido, contanos quién. |
| `contactEmail: Invalid email` | Revisá el email: le falta el dominio (ej.: @empresa.com). |
| `duplicate key … unique constraint` | Ya hay una empresa con ese CUIT: Agrosur S.A. · Abrirla |
| `Failed to fetch` | No hay conexión. Lo que cargaste sigue acá; probá de nuevo. |
| `500` | Algo falló de nuestro lado y no se guardó. Ya quedó registrado. |

## 5. Plata y números

- **Signo en todo lo que es flujo:** + lo que entra, − lo que sale, 0 sin signo. Los montos de referencia (presupuesto, precio) van sin signo.
- Un atraso **no es** un número negativo.
- **Lo anulado se ve tachado y no suma.** El total del pie aclara qué no suma: "(la pagada y la anulada no suman)".
- Cifras alineadas a la derecha y con dígitos del mismo ancho.
- Cotización visible cuando hay otra moneda ("USD al BNA venta $ 1.535").
- **Datos de contexto en las tarjetas de números:** "vs agosto 18 %" o "3 clientes · el más viejo, 5 días", no la cifra sola.

## 6. Celular: "Hoy en el bolsillo"

En el celular nadie "navega" el ERP: anota algo al vuelo y resuelve lo del día.

**Zona del pulgar**
- Crear, marcar hecha, cobrar y navegar viven en el tercio de abajo; arriba solo se lee.
- Botones de 52 px, 44 px mínimo en todo lo que se toca.
- Filas de 56 px e inputs de 16 px (sin zoom automático).
- Los detalles se abren como hoja desde abajo, con las acciones fijas.

**Reglas de las acciones rápidas**
1. **Las mismas 6 acciones, en el mismo lugar** (el + central de la barra de abajo): 2 de IA arriba, 4 de carga manual. La memoria muscular vale más que la personalización.
2. **Todo gesto tiene su botón visible:** deslizar = "Hecha / Mañana"; mantener apretado = ⋯.
3. **La IA propone, la persona confirma:** preguntar responde en el acto; cargar deja un borrador con "Confirmar" al alcance del pulgar.
4. **Deslizar solo para lo reversible** (hecha, mañana, leído), siempre con Deshacer. Cancelar, anular o pagar nunca van en un gesto.
5. **El contexto viaja:** si abrís al Chimpa IA desde un lead, ya sabe de quién hablás.
6. **Vibración corta** al pasar el límite del deslizamiento y al empezar a grabar.
7. **Dictado por voz** con "Mantené apretado para hablar"; nada se guarda hasta confirmar.
8. **Compartir desde WhatsApp o la galería** (Compartir → Chimpancé ERP) deja un borrador listo.

**Notificaciones:**
- Máximo 2 acciones.
- La que mueve plata abre el formulario completo y **nunca confirma desde la notificación**.

**Sin conexión:** llamadas, tareas y notas quedan en cola. **La plata no:** cobros y pagos esperan a tener conexión para no duplicarse.

## 7. Lo que ya salió mal (no repetir)

- La etapa ganada/perdida estaba en un desplegable; el motivo de pérdida aparecía **después** de guardar y no era obligatorio.
- Arrastrar a Ganado/Perdido no pedía monto ni motivo y no se podía deshacer.
- La "próxima acción" se guardaba pero no creaba tarea ni aparecía en Hoy: **un campo que no hace nada es una mentira**.
- La tarea del CRM nacía vencida (fecha "ahora") y sin título.
- Un error de red se mostraba como "Lead no encontrado".
- Los datos no se refrescaban nunca: nadie veía lo que había cargado el otro.
- Acciones que solo aparecían al pasar el mouse (no existen en el celular).
- Un aviso pisaba al anterior (límite de 1): se perdía el "Deshacer".
- La advertencia salía en rojo de error, así que se confundía advertir con fallar.
- El buscador del encabezado no buscaba.
- El alta de deuda pedía 16 campos sin mostrar ninguna cuenta, y 3 no se guardaban.
- "Emitir factura" tomaba como neto un monto que se había cargado con IVA: se facturaba IVA de más.
- El lápiz de editar aparecía en facturas que el servidor no deja editar: **no ofrezcas lo que no se puede hacer**.
- La fecha "de hoy" se calculaba en UTC: después de las 21 h proponía mañana.
