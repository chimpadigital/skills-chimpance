# 09 · Mapa de pantallas y guion de prueba

> Para ubicarse rápido y para el **test obligatorio en Chrome real contra dev-finanzas** que cierra toda tarea
> (cap. 01 del skill `erp-chimpa-finanzas`). Verificado contra `client/src/App.tsx` el 29/9/2026.

## Rutas

| Ruta | Pantalla | Pestañas / bloques |
|---|---|---|
| `/crm/leads` | Lista de leads | Filtros, buscador, columna Score. **Sin selector de workspace** (pendiente A-11) |
| `/crm/leads/:id` | Ficha del lead | **Resumen** (hero con logo, datos, Consulta, Notas internas, necesidades, tags, empresa, referidor, propuestas, Recorrido en la web) · **Interacciones** · **Tareas** · **Historia**. `?tab=historia` abre directo |
| `/crm/opportunities` | Pipeline (kanban y lista) | Arrastrar entre etapas dispara WinDialog / LossReasonDialog |
| `/crm/opportunities/:id` | Detalle de la oportunidad | Empresa, monto, etapa, propuesta (una sola tarjeta: enviar y medir), tareas de preventa, Historial y notas, Crear proyecto |
| `/crm/personas` | Personas | Lista con estado calculado |
| `/crm/personas/:id` | Ficha de la persona | Journey unificado, Relación, Datos, Identidades |
| `/crm/personas/duplicados` | Duplicados | Unir (sin borrar) o descartar, con Deshacer. Admin y operador |
| `/crm/dashboard` | Tablero comercial | Hoy agrupa por mes de creación (pendiente D-04) |
| `/crm/config` | Config del CRM | Pipelines, etapas, fuentes, motivos de pérdida, catálogos. **Solo admin** |
| `/growth` | Workspaces | Lista; crear workspace solo admin |
| `/growth/:id` | Workspace | **Resumen · Campañas · Landings · Experimentos · Inversión\* · Envíos** (se llama **Consultas** en un workspace de cliente) **· Inteligencia\* · Instalación · Importar\*** — las marcadas con \* solo para quien puede ver plata (admin y contador; el operador no) |
| `/empresas/:id` | Ficha de empresa (cliente) | Pestaña **Referidos** con el valor de lo que refirió: `?tab=referidos` |
| `/correo` | Bandeja de Gmail del ERP | Atribución de mails. El colaborador no entra |
| `/perfil` | Mi perfil | **Plugin de Gmail** (generar la llave personal) y Google OAuth |
| `/growth-demo.html` | Demo del snippet | Sirve para probar formulario, eventos y un link personal sin tocar el sitio |

Rutas públicas del ingest (sin sesión): `/api/public/growth/:key/…` (`config`, `events`, `identify`, `leads`) y el snippet
`/growth.js`.

## Guion de prueba en Chrome (dev-finanzas, logueado como admin)

El navegador interno no tiene sesión: se prueba en **Chrome real** contra `https://dev-finanzas.chimpance.digital`. Recorrer
solo los tramos que toca el cambio, pero nunca reportar sin haber recorrido al menos uno.

**A · Cadena comercial completa** (la que más se rompe)
1. `/crm/leads` → **Nuevo lead** con empresa nueva → verificar que la empresa quedó en el CRM (chip "En el CRM"), no en
   Empresas.
2. Ficha del lead → QuickLog una interacción con **próxima acción** → verificar que apareció la tarea y que no nace vencida.
3. **Convertir** en oportunidad → intentar **Ganar sin monto** (tiene que frenar) → ganar con monto y chip "Pasarla a
   Empresas" → verificar que la empresa pasó a Empresas con su logo.
4. **Crear proyecto** desde la oportunidad → verificar `linkedProject` y que las tareas de preventa se arrastraron.
5. Volver al lead → pestaña **Historia**: tienen que estar el alta, la interacción, la oportunidad ganada y el proyecto.

**B · Cierre por el otro lado**
6. Desde el kanban, arrastrar una oportunidad a **Perdida** → motivo obligatorio → **Deshacer** dentro de los 6 s →
   verificar que volvió con su motivo y su nota.

**C · Medición**
7. Oportunidad → **Código para medirla** → pegarlo en la propuesta (o usar `/growth-demo.html`) → abrir con `?chp=` o
   `?chl=` → verificar en el lead **Recorrido en la web** (visitas, dispositivos, páginas) y el journey de la oportunidad.
8. Abrir la misma propuesta con `?vista=equipo` → **no** tiene que registrar nada.
9. `/growth/:id` → Resumen: que visitas, consultas y CPL cuadren con el período elegido (ojo con el corte del día).

**D · Personas**
10. `/crm/personas` → abrir una → Journey unificado. `/crm/personas/duplicados` → unir dos de prueba y deshacer.

**E · Permisos** (cuando el cambio toca rutas o roles)
11. Con un usuario `sales`: que vea lo propio y lo sin asignar, que Config y las descargas le den 404/403, y que Growth sea
    de solo lectura. En dev **no hay usuario vendedor cargado**: si no se crea uno, decirlo explícitamente en el reporte.

**F · Celular** (cuando cambia la UI)
12. Chrome a 390 px de ancho: que el hero del lead, el kanban y los diálogos de cierre se puedan usar.

## Qué mirar cuando algo no anda

| Síntoma | Primer lugar |
|---|---|
| El sitio no registra visitas | Consola del navegador en el sitio: `config` 200 y `events` 201. Si hay error de CORS, alguien volvió a `sendBeacon` (cap. 06) |
| El lead no se vincula al visitante | ¿El navegador ya estaba vinculado a otro lead? ¿Es un robot? ¿Se rotó `LEAD_LINK_SECRET`? |
| El link personal abre un dominio que no existe | Falta cargar landings en el workspace (A-08) |
| Un número no cuadra | Cap. 08, empezando por workspace, período en hora argentina, leads archivados y IVA |
| Una ruta nueva devuelve 401 | Hay que sumarla a la lista de `server/lib/apiAuth.ts` |
| El plugin de Gmail corta con 500 | La sesión falsa sin `touch()` (cap. 04) |
