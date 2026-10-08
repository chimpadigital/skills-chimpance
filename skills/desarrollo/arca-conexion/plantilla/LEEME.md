# Plantilla ARCA (copia de Chimpa-Finanzas, rama main, 18/9/2026)

Esta carpeta no se ejecuta sola: es para copiar a otro proyecto. Los archivos de `server/` salvo `invoiceArca.ts` son independientes y solo necesitan `node-forge` (más `pdf-lib` y `qrcode` para `facturaPdf.ts`).
`invoiceArca.ts` usa la base y `@shared/fiscal` del ERP: sirve como guía de las validaciones.
Los tests importan con rutas del ERP: hay que ajustarlas. Qué adaptar en cada archivo: cap. 02 del skill.
