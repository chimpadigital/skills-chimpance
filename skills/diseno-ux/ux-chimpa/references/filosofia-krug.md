# La filosofía: *No me hagas pensar* (Steve Krug), aplicada a Chimpa

Síntesis propia del libro, que Santiago eligió como filosofía del skill (edición en castellano, 12 capítulos). No es una transcripción: son las ideas, contadas en nuestras palabras y bajadas a los productos de Chimpancé. El libro habla de sitios web, pero las ideas valen igual para el ERP, las propuestas y cualquier pantalla.

## Contenido
1. ¡No me hagas pensar!
2. Cómo usamos realmente las pantallas
3. Diseño de rótulos
4. Clics mecánicos e inequívocos
5. Omitir palabras innecesarias
6. Carteles en la calle y migas de pan
7. La primera impresión
8. Las discusiones de gustos se resuelven probando
9. Pruebas de usabilidad baratas
10. La usabilidad como cortesía
11. Accesibilidad
12. Cuando el jefe pide algo que va contra el usuario

---

## 1. ¡No me hagas pensar!

**La idea.** Es la regla madre, la única que hay que recordar si se olvida todo lo demás. Cuando alguien mira una pantalla, tiene que entender **qué es y cómo se usa** sin gastar esfuerzo en pensarlo. Lo ideal es que sea **evidente**; si no se puede, que **se explique sola** con muy poco. Todo lo que obliga a detenerse (un nombre ingenioso en vez de uno claro, algo que no se sabe si se toca, un botón que no dice qué hace) suma carga mental y, sumado, cansa y ahuyenta.

**En Chimpa:**
- **Nombres obvios antes que ingeniosos.** "Por cobrar", no "Flujo entrante". "Hablemos", no "Iniciá tu viaje".
- Tiene que ser obvio qué se toca: un link parece link, un botón parece botón, una fila que abre un detalle se nota.
- **Prueba rápida:** si hay que explicarle a alguien del equipo cómo se usa una pantalla del ERP, la pantalla todavía hace pensar.

## 2. Cómo usamos realmente las pantallas

**La idea.** Imaginamos que la gente lee, entiende las opciones y elige la mejor. En la práctica pasan tres cosas:
- **Escanea:** busca palabras que coincidan con lo que tiene en la cabeza.
- **Se conforma:** toca la primera opción que parece razonable, porque equivocarse suele costar poco y adivinar es más rápido que pensar.
- **Sale del paso:** usa las cosas sin entender cómo funcionan, y si encontró una forma que anda, la repite aunque sea torpe.

**En Chimpa:**
- **Diseñá para el escaneo:** títulos que dicen lo que hay, palabras clave al principio, bloques cortos. En propuestas, el precio a la vista porque es lo que se escanea primero.
- Como tocan la primera opción razonable, **la opción correcta tiene que ser la más obvia**. La peligrosa (anular, eliminar) nunca es la primera ni la más destacada.
- Como salen del paso sin entender, **lo que no se entiende no se usa**. Si el equipo carga todo en "Notas" en vez de en los campos, el problema son los campos.
- **El error es barato solo si se puede deshacer.** De ahí "deshacer antes que confirmar".

## 3. Diseño de rótulos

**La idea.** Hay que diseñar como un cartel que se ve a 100 km/h: se tiene que captar al pasar. Para eso:
- **Usar convenciones.** La gente ya sabe cómo funcionan un carrito, un buscador o un menú; reinventarlos obliga a aprender. Solo vale innovar si lo nuevo se entiende igual de rápido o mejor.
- **Jerarquía clara.** Lo más importante se destaca más; lo relacionado se ve relacionado; lo que está dentro de algo se ve adentro.
- **Áreas bien definidas,** para que el ojo descarte rápido lo que no le importa.
- **Obvio lo que se toca.**
- **Menos ruido.** Todo gritando al mismo tiempo es igual a nada gritando. El ruido de fondo también cansa.

**En Chimpa:**
- **Una sola acción principal destacada por vista** (el ERP llegó a tener 131 botones principales en 476).
- **Convenciones antes que originalidad** en lo que se usa: buscador arriba, acciones de la fila a la derecha, "Deshacer" en el aviso, la X para cerrar. La originalidad va en la marca, no en cómo se usa.
- **Lo normal no se marca,** para que lo que se marca se vea.

## 4. Clics mecánicos e inequívocos

**La idea.** Discutir cuántos clics hacen falta para llegar a algo es discutir lo equivocado. Lo que cansa **no es la cantidad de clics, sino lo difícil de cada elección**: cuánto hay que pensar y qué tan seguro se está de haber elegido bien. Varias elecciones mecánicas y sin ambigüedad equivalen a una sola que obliga a pensar. Cada paso tiene que dejar "rastro" de que se va bien.

**En Chimpa:**
- **En auditorías se cuentan clics y, sobre todo, dudas.**
- **Un clic "mecánico"** tiene una sola respuesta obvia: "¿Por cobrar o por pagar?" lo es. "¿Qué tipo de movimiento contable es?" no lo es.
- **Si una elección no se puede volver mecánica,** el sistema la resuelve (sugiere, precarga, decide por defecto) o la da con ayuda en el lugar.
- **Excepción:** lo que se hace muchas veces por día sí tiene que ser corto (atajos, acciones rápidas, "Míos" por defecto). Cuando algo se repite, cada clic cuesta más.

## 5. Omitir palabras innecesarias

**La idea.** Sacar la mitad de las palabras, y después la mitad de lo que quedó. Menos texto hace que se vea más lo que importa, baja el ruido y acorta las pantallas. Hay dos cosas que casi siempre sobran:
- **La charla de bienvenida:** texto amable que no dice nada ("Bienvenido a nuestra plataforma, donde…").
- **Las instrucciones:** nadie las lee. La meta es que no hagan falta; si hacen falta, que sean mínimas y estén justo donde se necesitan.

**En Chimpa:**
- Nada de "Bienvenido al módulo de…" ni párrafos que explican cómo usar un formulario.
- **La ayuda va en una línea, debajo del campo que la necesita.**
- **Propuestas:** 1-2 pantallas de apertura como máximo, cada bloque = 1 visual + 1-2 líneas. Lo visual reemplaza al párrafo.
- **Sitio:** titular corto + una línea. Si una sección necesita tres párrafos para entenderse, está mal pensada.

## 6. Carteles en la calle y migas de pan

**La idea.** En una pantalla no hay sentido de ubicación física: no se sabe cuánto hay ni dónde se está. La navegación es lo que da ese mapa. Tiene que decir **dónde estoy, qué hay y cómo vuelvo**, y dar confianza en quien lo hizo. Sus piezas:
- identidad del sitio siempre visible
- acceso a lo principal
- buscador
- nombre claro de cada página, que coincide con lo que se tocó para llegar
- un "usted está aquí"
- migas de pan en estructuras profundas

**La prueba del baúl:** si te dejan en cualquier página, como después de un viaje en el baúl de un auto, tenés que poder responder de un vistazo:
- ¿qué sitio es?
- ¿qué página es?
- ¿cuáles son las secciones principales?
- ¿qué puedo hacer acá?
- ¿dónde estoy dentro del conjunto?
- ¿cómo busco?

**En Chimpa:**
- **ERP:** el título de la página dice lo mismo que el ítem del menú que se tocó, el menú marca dónde estoy, y los detalles tienen migas de pan ("Clientes › Agrosur › Proyecto Riego").
- **Sitio orgánico:** header con menú, migas y enlaces internos.
- **Landings de Ads: la excepción deliberada.** Se saca la navegación para que el único camino sea el formulario. Es una decisión consciente de conversión, no un olvido.
- **Links de WhatsApp:** en un detalle abierto desde un link, alguien que no estuvo en la conversación tiene que entender qué es y de quién.

## 7. La primera impresión

**La idea.** La página principal tiene que responder de inmediato:
- qué es esto
- qué puedo hacer acá
- qué ofrecen
- por qué acá y no en otro lado
- por dónde empiezo

Todos quieren un pedazo de la home y tiende a llenarse. El error clásico es darla por obvia porque los que la hacemos ya sabemos qué somos: una frase clara que diga qué somos (el eslogan) vale más que muchas bonitas. Los peligros son sobrecargarla, no decir qué es, o esconder lo principal entre lo que otros quieren promocionar.

**En Chimpa:**
- **Hero con el resultado + un CTA** (la home del prototipo).
- **Pantalla Hoy del ERP:** la "home" del equipo, con una sola lista de prioridades de hasta 7 ítems.
- **Resumen de la propuesta:** precio + forma de pago + 4 beneficios.
- **Test de 5 segundos en toda pantalla de entrada.**

## 8. Las discusiones de gustos se resuelven probando

**La idea.** Los equipos discuten sobre qué le gusta a "los usuarios", pero cada uno proyecta sus propios gustos y costumbres (el desarrollador, el diseñador, el comercial, el jefe). **No existe el usuario promedio:** cada persona reacciona distinto, y la mayoría de las preguntas del tipo "¿los menús desplegables son buenos?" no tienen respuesta universal; dependen de cómo lo haga ese diseño, en ese contexto, con esas personas. La forma de cortar estas discusiones es **probar con usuarios reales**.

**En Chimpa:**
- **Cuando Santiago y el equipo tienen opiniones distintas sobre una pantalla,** no se decide por jerarquía ni por gusto: se prueba con 2 o 3 personas y se mira.
- **En el skill, las preguntas a Santiago son sobre negocio y contexto** ("¿el mensaje es obligatorio para ustedes?"), no sobre gusto ("¿te gusta más así?").

## 9. Pruebas de usabilidad baratas

**La idea.** Probar no requiere laboratorio ni presupuesto:
- **Con 3 personas por ronda alcanza** para encontrar los problemas más graves, y no hace falta que sean del perfil exacto, porque los grandes problemas los tropieza cualquiera.
- **Mejor pocas rondas chicas y frecuentes** que una grande al final. Probar antes de construir, y también la competencia o lo que ya existe.
- **La mecánica:** se le pide a la persona que haga tareas reales y que piense en voz alta, se mira sin ayudar y se anota dónde duda.
- **Después, el equipo decide qué arreglar:** primero lo más grave, y **retocar antes que rediseñar**. La tentación es sumar cosas (instrucciones, avisos); casi siempre conviene **sacar**.

**En Chimpa:**
- Toda pantalla nueva del ERP o del sitio se prueba con **3 personas del equipo o conocidas** antes de pasarla a producción. En el ERP, la etapa "🟠 falta que pruebe Santiago" es un buen momento para sumar a otras dos personas.
- **Guion:** 3-5 tareas dichas como intención ("anotá que llamaste a Diego y que hay que mandarle la propuesta el lunes"), sin decirle dónde tocar.
- **Qué se mide:** dónde dudó, dónde se equivocó, qué dijo en voz alta, si terminó.
- **Qué se arregla:** lo más grave, con el cambio más chico posible. Si la solución es "agregar una explicación", buscar primero cómo hacer que no haga falta.
- **Formato del registro:** en `auditoria.md`.

## 10. La usabilidad como cortesía

**La idea.** Cada persona llega con un **depósito de buena voluntad** hacia el sitio. Es distinto en cada uno y según el momento (con apuro o después de una mala experiencia es más chico). Cada fricción lo vacía; si se vacía, se va, o se queda con mala imagen de la marca. Un solo error grave puede vaciarlo de golpe.

**Lo que lo vacía:**
- **Esconder lo que la persona quiere:** el teléfono, el precio, los costos, el plazo.
- **Castigarla por no hacer las cosas a nuestra manera:** exigir el formato exacto de un número, rechazar espacios o guiones.
- **Pedir información que no necesitamos.**
- **Falsa amabilidad que se nota** ("su llamada es muy importante para nosotros" después de 20 minutos de espera).
- **Obstáculos en el camino:** intros, pantallas de marketing antes de lo que se busca.
- **Verse improvisado o descuidado.**

**Lo que lo llena:**
- **Saber qué es lo principal que la gente viene a hacer y hacerlo obvio y simple.**
- **Decir de frente lo que quiere saber,** aunque no sea lo ideal: costos, plazos, qué no incluye. La franqueza suma más de lo que resta.
- **Ahorrarle pasos.**
- **Poner esfuerzo en que las cosas estén bien hechas.**
- **Anticipar las preguntas y responderlas.**
- **Pequeñas comodidades,** como una buena versión para imprimir.
- **Que sea fácil recuperarse de un error.**
- **Ante la duda, pedir disculpas** cuando algo no se puede hacer.

**En Chimpa:**
- **Precio + IVA + tipo de dólar siempre visibles** en propuestas. Nunca esconder el WhatsApp.
- **Los campos aceptan el dato como la persona lo escribe** (CUIT con o sin guiones, montos con punto o coma, teléfono con o sin 15).
- **Formularios con lo mínimo:** cada campo obligatorio justifica para qué se usa.
- **"Qué NO incluye"** siempre visible en propuestas.
- **FAQ que responde objeciones reales** antes del formulario.
- **PDF que sale completo.**
- **Errores que dicen "lo que cargaste sigue acá"** y que piden disculpas cuando la falla es nuestra ("Algo falló de nuestro lado y no se guardó").

## 11. Accesibilidad

**La idea.** Hacer las cosas accesibles es lo correcto, y además la mayoría de lo que ayuda a una persona con discapacidad **ayuda a todos**. Lo primero es arreglar los problemas de usabilidad que confunden a cualquiera, porque a quien usa un lector de pantalla lo confunden el doble. Después, lo básico:
- textos alternativos en imágenes
- estructura con títulos reales
- etiquetas asociadas a los campos
- todo usable con teclado
- saltar a lo principal
- no depender de cómo se ve para entender qué es

**En Chimpa:**
- **Estado por forma + color,** nunca solo color.
- **Etiquetas en los botones que son solo ícono.**
- **Foco visible y todo usable con teclado:** "Mover a…" como alternativa a arrastrar.
- **Label asociado en cada campo** y contraste AA.
- **Con movimiento reducido activado, todo queda quieto.**
- **Tamaños táctiles de 44 px o más.**
- **Primero se arregla lo que confunde a todos** (7 estados, errores claros); después los detalles técnicos.

## 12. Cuando el jefe pide algo que va contra el usuario

**La idea.** Hay pedidos que empujan contra la usabilidad: pedir datos de más, meter promociones en el camino, poner lo que "queremos mostrar" delante de lo que la gente vino a buscar. No se ganan diciendo "eso es mala usabilidad": se ganan **mostrando** (una prueba con usuarios, un dato, un antes/después) y ofreciendo una alternativa que cuide el objetivo de negocio sin castigar al usuario. A veces una fricción es una decisión comercial válida: está bien si se toma **sabiendo lo que cuesta**, no por descuido.

**En Chimpa:**
- **Cuando una decisión de negocio le suma fricción al usuario** (más campos para calificar el lead, una opción extra para vender más), decí qué cuesta, en términos medibles si se puede: "cada campo obligatorio de más baja la conversión". Proponé la versión que logra lo mismo con menos fricción, por ejemplo pedir el dato después, en la llamada, o deducirlo.
- **Si Santiago decide igual, se respeta y se deja anotado el porqué.**
