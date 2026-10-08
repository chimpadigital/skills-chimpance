# Auditoría de usabilidad — método Chimpa

El método que salió de la auditoría del CRM (10/09/2026, `Chimpa-Finanzas/docs/auditorias/crm-2026-09/`) y de la de ~50 formularios del ERP. Sirve para cualquier producto: ERP, sitio, landing, propuesta.

Una buena auditoría **no es una lista de opiniones**: es evidencia medida, gravedad clara y, para cada problema, qué lo resuelve. Base: Krug, cap. 8-9 (ver `filosofia-krug.md`). Las discusiones de gustos se resuelven mirando a gente usarlo, y se arregla primero lo más grave con el cambio más chico.

**En el modo 2, este formato manda sobre el formato de diseño del SKILL.md.** La auditoría ya es el paso liviano: se entrega directo y el desarrollo (spec o wireframe corregido) va después del OK.

## 1. Preparar

1. **Quién usa esto y para qué.** Elegí las **5-7 tareas reales más frecuentes o más caras**, dichas como las diría el usuario:
   - "anotar una llamada y agendar el seguimiento"
   - "cargar la factura de un proveedor"
   - "saber cuánto me sale y cómo pago"
   - "dejar mis datos para que me llamen"
2. **Dónde mirar.** Todas las versiones que existan:
   - **El producto real publicado:** el sitio en producción, dev-finanzas para el ERP, la propuesta enviada.
   - **El prototipo o la spec.**
   - **Las instrucciones que se le pasaron a quien lo construyó** (prompts de Replit, docs de integración). Suelen tener decisiones que el prototipo no muestra: anti-spam, cómo se mide la conversión, validaciones.
   - **El código si hay acceso,** para citar `archivo:línea`.

   Si solo pudiste ver una de estas versiones, decilo en Supuestos y marcá qué hay que verificar en la otra.
3. **Desde dónde.** Escritorio **y** celular; con teclado; con red lenta; con movimiento reducido activado.

## 2. Recorrer y medir

Para cada tarea:
- **Contá** clics, pantallas, ventanas, pestañas y campos. ("Anotar llamada + agendar = 13-15 clics, 2 ventanas, 3 pestañas".)
- **Contá, sobre todo, las dudas** (segunda ley de Krug). Una duda es cualquier momento en que hay que pensar qué tocar, qué quiere decir algo o si salió bien. Diez clics sin dudas son mejores que tres con dos dudas. En la tabla de recorridos va "N clics · D dudas".
- **Recorré los caminos no felices:** dejar vacío, pegar un formato raro, cerrar a mitad de camino, cortar la red, volver atrás, entrar sin permiso, entrar a algo archivado.
- **Anotá dónde dudarías** si fueras la persona más apurada del equipo.
- **Verificá que lo que dice la pantalla sea lo que pasó** (¿se guardó de verdad? ¿el total suma bien? ¿el mensaje "actualizado" es cierto?). Las mentiras de la interfaz son los hallazgos más graves y los que menos se ven a simple vista.
- **Capturá la evidencia:** captura de pantalla con Playwright (full-page), texto exacto y `archivo:línea`.

## 2 bis. Prueba con 3 personas (cuando hay algo para mostrar)

La auditoría experta encuentra mucho, pero mirar a gente usarlo encuentra lo que nadie del equipo ve. Guía corta para que Santiago la haga en una mañana:

1. **3 personas.** No hace falta el perfil exacto: los problemas graves los tropieza cualquiera. Para el ERP, alguien del equipo que no participó del diseño.
2. **3-5 tareas dichas como intención,** sin nombrar botones ni pantallas: "Anotá que llamaste a Diego y que hay que mandarle la propuesta el lunes". "Fijate cuánto te saldría el plan recomendado pagando en cuotas".
3. **Pedirle que piense en voz alta.** No ayudar ni explicar. Si pregunta, devolver: "¿Vos qué harías?".
4. **Anotar dónde dudó, dónde se equivocó, lo que dijo y si terminó.** Mejor si se graba la pantalla.
5. **Ese mismo día, en 30 minutos:** los 3 problemas más graves y el cambio más chico que los arregla. Retocar antes que rediseñar; sacar antes que agregar explicaciones.

El skill puede entregar el guion listo (tareas + qué observar + planilla para anotar).

## 3. Checklist de heurísticas

Pasá cada pantalla por las 12 leyes del SKILL.md. Preguntas concretas:

**Claridad**
- ¿Se entiende en 5 segundos qué es y qué hacer?
- ¿Hay una sola acción principal por vista?
- ¿Los botones dicen qué pasa?
- ¿Hay jerga interna o códigos a la vista?

**Prevención**
- ¿Hay valores por defecto con criterio?
- ¿Formatos al tipear?
- ¿Buscar antes de crear?
- ¿Opciones cerradas donde hay categorías?
- ¿El sistema hace las cuentas?
- ¿Se puede crear un duplicado o una combinación imposible?

**Recuperación**
- ¿Se pierde lo cargado al cerrar o si falla la red?
- ¿Hay Deshacer en lo reversible?
- ¿Lo irreversible está protegido según su gravedad?
- ¿Lo irreversible se ve distinto de "crear"?

**Estado y verdad**
- ¿Están los 7 estados?
- ¿Se ve cuándo guarda?
- ¿Se refrescan los datos?
- ¿Algún mensaje miente?
- ¿Un error de red se disfraza de "no encontrado"?

**Carga de datos**
- ¿Errores al salir del campo, al lado y en voz humana?
- ¿Botones deshabilitados mudos?
- ¿Obligatorio y opcional marcados?
- ¿El foco selecciona el texto existente?
- ¿Fechas en hora argentina?

**Flujo**
- ¿Cuántos pasos para la intención principal?
- ¿Una intención está partida en varias pantallas?
- ¿Todo tiene próximo paso?
- ¿Hay callejones sin salida?

**Celular y acceso**
- Acción principal en la zona del pulgar.
- Todo lo que se toca mide 44 px o más.
- Inputs de 16 px.
- Nada que dependa del hover o solo de un gesto.
- Todo se puede hacer con teclado, con foco visible.
- Botones de ícono con etiqueta.
- Textos de 12 px o más.
- Contraste AA.
- El estado no se comunica solo con color.

**Conversión** (web / propuestas)
- ¿Hay fugas?
- ¿El precio o el CTA se ven sin scrollear de más?
- ¿Muchas opciones sin recomendación?
- ¿Cada monto dice qué es?
- ¿El formulario tiene los campos justos?

## 4. Gravedad (escala de Nielsen, en criollo)

| Nivel | Nombre | Criterio | Ejemplo real |
|---|---|---|---|
| **4** | Pierde datos, plata o miente | Resultado incorrecto, dato perdido o mensaje falso. **Se arregla antes que nada** | IVA de más al facturar; vaciar el email dice "actualizado" y no guarda; "Crear proyecto" inalcanzable |
| **3** | Bloquea o hace equivocar seguido | La tarea no sale, o sale mal con frecuencia | Tarea que nace vencida; datos que nunca se refrescan; motivo de pérdida que no aparece |
| **2** | Frena o confunde | Sale, pero con esfuerzo, dudas o pasos de más | 13-15 clics para anotar una llamada; selectores sin búsqueda |
| **1** | Detalle | Molesta, pero no cambia el resultado | Texto genérico, orden poco natural |

La **seguridad** (datos expuestos, permisos de más) va aparte y primero, aunque no sea usabilidad.

## 5. Formato del informe

Si piden una auditoría grande (un módulo entero, todo el sitio), primero se entrega lo liviano: tareas, notas y los 5 hallazgos más graves; el informe completo va con el OK.

Si piden revisar algo acotado (un formulario, una pantalla), va directo en este orden:
1. Supuestos.
2. Recorridos medidos (clics · dudas).
3. Los hallazgos de gravedad 4 y 3 desarrollados.
4. Los de gravedad 2 y 1 en una tabla compacta.
5. Textos.
6. Tests.
7. Hasta 3 preguntas.

Estructura del informe completo:

```
# Radiografía de [producto] — [fecha]
Resumen en 3 líneas + notas por área (ej.: captación 4/5 · núcleo 2/5 · UX 2/5)

## Recorridos medidos
| Tarea | Hoy | Con el rediseño |
| Anotar llamada + agendar | 13-15 clics · 4 dudas · 2 ventanas · 3 pestañas | 3 clics · 0 dudas · 1 envío |

## Hallazgos (de más grave a menos)
### [4] Título que nombra el problema desde el usuario
- Qué pasa: …
- Dónde: `archivo.tsx:123` + captura
- Qué lo resuelve: patrón o pieza del DS (ej.: WinDialog / "Deshacer antes que confirmar")

## Zonas monótonas → pieza que las resuelve
## Plan por fases (primero severidad 4, después lo que destraba más tareas)
```

**Reglas del informe:**
- Cada hallazgo nombra **qué ve y sufre la persona**, no el detalle técnico ("Vaciar el email no se guarda y dice que sí", no "`formX || undefined` en el PATCH").
- **Cada problema lleva su solución**, citando el patrón ya decidido si existe (`producto-interno.md`, `web-conversion.md`, `propuestas-interactivas.md`).
- **Contá, no adjetives:** "19 versiones del mismo campo", "0 avisos de cambios sin guardar", "131 botones principales en 476".
- **No reportes nada como arreglado sin haberlo visto funcionando** en el ambiente real.
