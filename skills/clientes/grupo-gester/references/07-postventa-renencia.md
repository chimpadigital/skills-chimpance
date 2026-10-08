# 07 · Postventa y Torre Renencia

Código: `demo/js/postventa.js` (módulo `PV`) y `demo/js/renencia-data.js`. Datos reales del cliente en `cliente/docs-propietarios/` (Drive de Alexis).

## Torre Renencia

- Caseros 881, barrio Alberdi, Córdoba. Entregada el **4/7/2026**, garantía de obra 12 meses. 70 unidades (PB con locales y departamentos A-F, niveles 1 a 8 con unidades A-H).
- `RENENCIA_UNIDADES`: id, piso, letra, tipología, superficie cubierta (de los planos conforme a obra), superficie total, **% de incidencia** y expensas estimadas (planilla "Torre Renencia - Incidencias"). "Incidencias" en la planilla = % de expensas, **no** reclamos.
- 9 unidades siguen en venta (2C, 2E, 4E, 6B, 6F, 7B, 7F, 8A, 8F): son parte del stock de ventas. Así se ve la conexión ventas ↔ postventa.

## Contactos del edificio

| Quién | Para qué |
|---|---|
| Grupo Gester | Entrega y garantía de obra |
| Administración Herrera Buteler | Expensas, mantenimiento, convivencia |
| Seguridad AYAX | Urgencias de seguridad, 24 h |
| Soluciones Tecnológicas Córdoba (STC) | Portero SmartPlus y llaveros |

Los teléfonos y mails están en `demo/js/store.js`. Son datos reales de terceros: no publicarlos sin OK.

## Reclamos: derivación automática

| Categoría | Ejemplos | Va a |
|---|---|---|
| `obra` · "Algo de mi departamento" | Humedad, fisuras, aberturas, sanitarios, electricidad, termotanque, cerradura | Grupo Gester |
| `edificio` · "Espacios comunes" | Ascensor, palier, SUM, cowork, limpieza, bicicletero | Administración |
| `accesos` · "Portero, llaveros y accesos" | Alta de usuario, app SmartPlus, portero | STC |

Estados: recibido → en revisión → visita programada → resuelto. El propietario elige ambiente, describe, sube fotos y una franja horaria; la conversación queda en el reclamo. Al resolver puede valorar.

## Portal del propietario

- **Mi departamento**: unidad, m², % de expensas, expensas estimadas, meses de garantía que quedan, reclamos abiertos.
- **Planos e instalaciones**: pestañas plano / cañerías del baño / cañerías de la cocina / aire acondicionado, más la ficha de materiales buscable (termotanque, mesada, muebles, pinturas, pisos, electricidad, sanitarios, puertas).
- **Documentos y manuales**: guía rápida, reglamento interno, ficha técnica, cerradura electrónica, portero SmartPlus, video del portero, termotanques.
- **Guías paso a paso**: cerradura (app TTLock, huellas) y portero (alta por WhatsApp a STC con el mensaje armado).

## Documentos reales (`cliente/docs-propietarios/`)

- `CONFORME OBRA DEPARTAMENTOS/`: 70 PDF de planos conforme a obra, uno por unidad, de 7 páginas (portada, baño, cocina, aire, ficha, aire, plano).
- Ficha técnica, instructivo de la cerradura, manual de uso de las unidades, manual de termotanques, manual del portero, **reglamento interno firmado**, planilla de incidencias y video del portero (52 MB).
- En la demo (`demo/assets/renencia/`) solo están los planos de 3°B y 5°F convertidos a imagen, 6 PDF y el video comprimido, por peso.
- `docs/datos-extraidos/`: metadatos de las 70 unidades (`_units_meta.json`), texto extraído de los PDF (`_docs_texto.txt`) y capturas de páginas del plano de 3°B.

## Fideicomiso Caseros 881 (`cliente/fideicomiso-caseros-881/`)

`Cronograma de Aportes Fideicomiso Caseros 881.xlsx`: cómo se financió Torre Renencia (Caseros 881) como fideicomiso al costo. Datos **reales y sensibles** (nombres de fiduciantes y montos).

- **Nuevo ICC-Cba**: índice del costo de la construcción de Córdoba (base 2012 = 100) desde 2013, con el que se actualizan los aportes.
- **Aportes Histórico / Aportes Actualizado / Nuevo esquema de Aportes**: por unidad (PH, piso, tipología, propietario) el total del aporte en pesos y los tramos mensuales (12/2023 a 05/2026), ajustados por ICC.
- **Cuenta Corriente** y **Gastos posesorios**: saldo de cada fiduciante y gastos de la toma de posesión.
- Una hoja por mes, de 12.2023 a 08.2026, con los aportes del período.

No entra en la propuesta enviada. Sirve para entender cómo opera Gester con los fideicomisos y como insumo si a futuro se ofrece un módulo de **cuenta corriente de fiduciantes / aportes indexados por ICC**.
