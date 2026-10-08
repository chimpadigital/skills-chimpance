# UX writing — los textos de la interfaz

Un texto de interfaz no se lee: se escanea en medio segundo mientras la persona hace otra cosa. Su trabajo es **decir qué pasa y qué hacer**, en las palabras de quien lo usa.

## Contenido
1. Principios
2. Fórmulas por tipo de mensaje
3. Trato y registro por canal
4. Palabras: prohibidas → preferidas
5. De técnico a criollo
6. Formatos argentinos
7. Cómo entregar textos

---

## 1. Principios

1. **El botón dice lo que pasa; el aviso dice qué hacer.** Verbo + objeto: "Crear por cobrar", "Marcar ganada", "Registrar llamada". Nunca "Aceptar", "OK", "Enviar" o "Guardar" a secas cuando se puede ser específico.
2. **El título nombra el hecho.** Nunca "Éxito", "Info", "Atención", "Error" u "Operación realizada" como título.
3. **Primero lo importante.** "Cobro registrado · $ 1.200.000 → Caja Galicia ARS", no "Se ha procedido a registrar exitosamente el cobro…".
4. **Sin culpa.** El error no acusa ("Ingresaste mal el CUIT"): orienta ("Faltan dígitos: el CUIT tiene 11").
5. **Honesto.** Si algo no se guardó, decirlo. Si no sabemos, decirlo. Si es irreversible, decirlo antes.
6. **Concreto:** cifras, nombres y fechas reales en vez de genéricos ("Lo archivó Rocío el 02/09" y no "Este elemento fue archivado").
7. **Corto, sin ser críptico.** Si hace falta explicar, una línea de ayuda debajo, no un párrafo.
8. **Sin jerga del sistema ni nuestra.** Nada de códigos, nombres de campos de la base ni vocabulario interno.
9. **Sacá la mitad de las palabras, y después la mitad de lo que quedó** (Krug, cap. 5). Siempre sobran dos cosas:
   - **La charla de bienvenida:** "Bienvenido al módulo de…", "En esta sección podrás…".
   - **Las instrucciones:** si una pantalla necesita instructivo, el problema es la pantalla. La ayuda mínima va en una línea, pegada al campo que la necesita.
10. **Nombres obvios antes que ingeniosos.** Lo ingenioso obliga a pensar ("Iniciá tu viaje", "Flujo entrante"); lo obvio se escanea ("Hablemos", "Por cobrar"). La chispa de marca va en titulares de marketing, nunca en navegación, botones ni mensajes del sistema.
11. **Sin emojis en ninguna interfaz** (ERP, sitio, landings, propuestas, decks). Solo en redes.

## 2. Fórmulas por tipo de mensaje

| Tipo | Fórmula | Mal | Bien |
|---|---|---|---|
| **Botón principal** | Verbo + objeto (lo que se crea o pasa) | Guardar | Crear por cobrar |
| **Aviso de éxito** | Hecho + dato clave + Deshacer | Éxito · Operación realizada | Tarea marcada como hecha · Deshacer |
| **Advertencia** | Qué va a pasar + consecuencia (no bloquea) | Atención | Guardada sin vencimiento: no va a aparecer en Hoy hasta que tenga fecha. |
| **Error** | Qué no se pudo + por qué + qué hacer | Error al guardar | No se pudo registrar el cobro: la caja "Galicia USD" está inactiva. Elegí otra. |
| **Error de campo** | Qué falta o qué está mal + cómo arreglarlo (y para qué, si ayuda) | Campo requerido | Si vino por un referido, contanos quién: así sabemos a quién agradecerle. |
| **Error de conexión** | Qué pasó + lo cargado está a salvo + reintentar | Failed to fetch | No hay conexión. Lo que cargaste sigue acá; probá de nuevo. |
| **Vacío la primera vez** | Por qué está vacío + cómo se llena + acción | No hay datos | Todavía no hay leads. Cuando entren por el formulario del sitio aparecen solos. · Nuevo lead |
| **Sin resultados** | Qué se buscó y dónde + salida | Sin resultados | Nada con "zzz" en Mis leads. · Limpiar filtros · Buscar en todos |
| **Sin permiso** | De quién es + a quién pedirle | Acceso denegado | Esta sección es de administración. La configuración la maneja Santiago. |
| **Confirmación de riesgo** | Pregunta con la acción + qué pasa + cómo volver | ¿Estás seguro? · Confirmar | ¿Cancelar esta tarea? Sale del tablero. Se puede reabrir desde "Ver canceladas". · Volver · Cancelar tarea |
| **Confirmación irreversible** | Acción + "No se puede deshacer" + consecuencias + escribir para confirmar | ¿Estás seguro? | Cerrar el período IVA 08/2026. No se puede deshacer. Escribí 08/2026 para confirmar. |
| **Cargando** | Gerundio + objeto (o forma del contenido) | Cargando… | Creando tarea… |
| **Guardado automático** | Estado visible y quieto | — | Guardando… · Guardado · hace 2 min · No se pudo guardar · Reintentar |
| **IA trabajando** | Quién + qué hace + que no bloquea | Procesando | El Chimpa IA está leyendo el comentario. El cliente ya lo recibió; esto no bloquea nada. |
| **IA con duda** | Pregunta concreta con opciones | No entendí | ¿Te referís al texto del encabezado o a la foto de fondo? |
| **Botón deshabilitado** | No lo deshabilites: al tocarlo dice qué falta | (gris mudo) | Faltan 2 datos: el capital y la cantidad de cuotas. |
| **Gracias / enviado** | Qué pasa ahora + cuándo + próximo paso | ¡Gracias! | Un humano del equipo te escribe en menos de 24 hs. Mientras, mirá cómo lo resolvimos para Aapresid. |

## 3. Trato y registro por canal

| Canal | Trato | Registro |
|---|---|---|
| ERP / CRM | vos | Directo, sin letra chica; sin emojis |
| El Chimpa IA | vos | Directo, propone y no decide, honesto con las dudas, rioplatense; sin emojis y sin "soy una IA" |
| Sitio y landings | vos | **Formal y en positivo**; sin imperativos bruscos ("Empezá por donde más te aprieta"); soluciones antes que servicios |
| Nosotros / manifiesto | vos | Acá entra la chispa y la manada, en registro cálido |
| Propuestas, decks, mails a empresas | ustedes | **Evitar "su/sus"**: reformular con "que ya tienen", "de ustedes" o el nombre propio. "Propuesta", no "Su propuesta" |
| WhatsApp uno a uno | vos | Sin relleno ni cierre de cortesía; link en línea aparte |
| Mensajes a clientes actuales | según el vínculo | "Acá estamos", nunca tono de campaña de venta |

Decisor rural, mayor o poco tecnológico: frases más cortas, saludo personal ("Hola Mariano"), beneficios en vez de términos técnicos. Ver `perfiles.md`.

## 4. Palabras: prohibidas → preferidas

| No | Sí | Por qué |
|---|---|---|
| ticket (en todo lo público) | — (reformular) | Decisión de marca: no se nombra lo que no somos |
| "X, no Y" como recurso ("Criterio, no obediencia") | afirmación en positivo | El sitio va en positivo |
| packs | servicios / soluciones | Nomenclatura Chimpa |
| Éxito / Info / Atención / Operación realizada | el hecho concreto | El título nombra lo que pasó |
| ¿Estás seguro? | la pregunta con la acción ("¿Cancelar esta tarea?") | Dice qué se confirma |
| Aceptar / OK / Enviar / Guardar | verbo + objeto | Dice qué pasa |
| Error 500. Intente nuevamente | "Algo falló de nuestro lado y no se guardó. Ya quedó registrado." | Honesto y sin código |
| Usted / tú / vosotros | vos (o ustedes a empresas) | Voseo argentino |
| La IA / el bot / el agente / Agente de Captura | El Chimpa IA | Tiene nombre |
| Tu tramo, fee, backoffice, stack | lenguaje del cliente | Jerga interna |
| Cargando… (suelto) | la forma del contenido / "Creando tarea…" | Nada mudo |
| Click aquí / Ver más | "Ver los 3 cobros vencidos" | Nombra el destino |

## 5. De técnico a criollo

| Técnico | Para quien decide |
|---|---|
| backoffice / CMS | panel para cargar noticias (o productos, o lo que corresponda) |
| SEO técnico | que Google los encuentre primero |
| stack escalable | se pueden sumar cosas en el futuro sin rehacer |
| Next.js / Laravel | tecnología actualizada |
| integración vía API | se conecta con [el sistema que ya usan] |
| responsive | se ve bien en el celular |
| hosting / dominio | dónde vive la web / la dirección de la web |
| CRM | donde quedan anotados todos los contactos y su seguimiento |
| pauta / inversión publicitaria | lo que se le paga a Google (va aparte de nuestro trabajo) |

## 6. Formatos argentinos

- **Plata:** `$ 1.234.567,89` · `USD 8.900` · `+$ 1,2 M` en tarjetas de números. Siempre "+ IVA" en precios comerciales, con el tipo de dólar.
- **Fechas:** relativas cuando ayudan ("hace 5 días", "Hoy 18:00", "Mañana", "vie 19/09"); DD/MM o DD/MM/AAAA. Nunca `2026-09-05`.
- **Hora:** 24 h, hora argentina.
- **Teléfono:** `+54 9 351 650-3470`.
- **CUIT:** `30-70814382-7`.
- **Horas trabajadas:** `1:30 h` o `2,5 h`.
- **Porcentajes:** `21 %`.

## 7. Cómo entregar textos

Tabla con una fila por momento. Incluí siempre los estados no felices, no solo el botón:

| Pantalla / momento | Hoy dice | Propuesta | Por qué |
|---|---|---|---|
| Alta de lead · botón | Guardar | Crear y abrir | Dice qué pasa y adónde va |
| Alta de lead · error de red | Error | No hay conexión. Lo que cargaste sigue acá; probá de nuevo. | Honesto y sin pérdida |

Cuando revises textos existentes de productos públicos, hacé un barrido de "su/sus", "ticket", "packs" y los contrastes "X, no Y".
