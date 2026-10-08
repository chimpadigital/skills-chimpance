# 04 · Motor de financiación

Código: `demo/js/engine.js`. Replica **al dólar** las fórmulas del Excel "Financiacion Grupo Gester" (Drive `1Br8scA3IMFmvmnMX4hU4pCzXzpS9NtjjaQCUxUh8LPU`). Es la pieza de negocio más delicada: si se porta al sistema real, se porta tal cual y con tests.

## Reglas de cada proyecto

| Campo | Qué es | Ejemplo Caseros |
|---|---|---|
| `metodo` | `lista` = anticipo % sobre precio de lista · `total` = anticipo sale del total financiado (cocheras) | `lista` |
| `tasaAnual` | Tasa anual; se pasa a mensual efectiva `(1+tasa)^(1/12) - 1` | 0,18 |
| `anticipoDef` / `anticipoMin` | Anticipo sugerido / mínimo (%) | 40 / 30 |
| `cuotasDef` / `cuotasMax` | Cuotas sugeridas / máximas | 24 / 36 |
| `comision` | Comisión sobre el total, se cobra con la entrega inicial | 0,03 |
| `redCuota` / `redContado` | Redondeo de cuota / de precio de contado (múltiplo) | 10 / 100 |
| `carga` | `base` = Gester carga precio sin comisión · `final` = carga precio con comisión y el motor se la descuenta | `final` |
| `validez` | Días de vigencia de una cotización | 15 |

## Las cuentas

1. **Precio ingresado** = `base` con los ajustes aplicados en orden (`pct`: ×(1+v/100); `monto`: +v).
2. **Precio de lista** = precio ingresado, o `ingresado / (1 + comision)` si el proyecto carga precio final.
3. **Contado** = `redondeo(lista × (1 + comision), redContado)`.
4. **Financiado** (con descuento opcional sobre la lista):
   - `i` = tasa mensual efectiva, `n` = cuotas, `p` = anticipo %.
   - Cuota = `redondeo(PMT(i, n, lista × (1-p)), redCuota)`; saldo = cuota × n.
   - Método `lista`: anticipo = lista × p; subtotal = anticipo + saldo.
   - Método `total`: subtotal = saldo / (1-p); anticipo = subtotal × p.
   - Comisión = subtotal × comision; total = subtotal + comisión.
   - **Entrega inicial = anticipo + comisión.** Recargo = total − contado.
5. Con 0 cuotas, todo es contado.

## Límites por usuario

- Gester: sin límites (anticipo desde 0, hasta 60 cuotas, descuento hasta 15%).
- Inmobiliaria: anticipo ≥ `anticipoMin`, cuotas ≤ `cuotasMax`, descuento ≤ `permisos.descuentoMax`, salvo que tenga `salirLimites`.
- Anticipo máximo: 90%.

## Valores de control (datos semilla de la demo)

Tienen que dar exactamente esto. Sirven de test unitario al portar el motor.

| Unidad | Plan | Lista | Contado | Anticipo | Cuota | Total | Entrega inicial |
|---|---|---|---|---|---|---|---|
| `stock:AU-4E` (Aurum 4°E, −3%) | 50% + 18 | 176.540 | 181.800 | 88.270 | 5.650 | 195.669 | 93.969 |
| `caseros:3B` (precio final) | 40% + 24 | 112.136 | 115.500 | 44.854 | 3.320 | 128.270 | 48.590 |
| `privato:C9` (método total, +20%) | 40% + 24 | 16.800 | 17.300 | 7.200 | 450 | 18.540 | 7.740 |
| `stock:RE-6B` (+USD 5.000) | contado | 127.000 | 130.800 | — | — | 130.800 | 130.800 |

(Montos en USD redondeados al entero.) Se verifican con `node tools/test-motor.js`: correrlo antes de subir cualquier cambio al motor o a los datos semilla.

## Lo que se encontró en el Excel

- Dos métodos de financiación (hoja Gester = sobre lista; hoja Cocheras = sobre total financiado).
- Ajustes escritos dentro de las fórmulas (`=182000*0.97`, `=(117400+5000)/1.03`): en la demo son `ajustes` con motivo, fecha y usuario.
- La cotización de ejemplo "Juan Pérez" tenía la cuota mal: el financiado quedaba USD 100.000 más barato que el contado.
- No había estado de unidad ni plazo máximo.

## La cotización

- Numeración `GG-2026-0001`, correlativa.
- Guarda **una copia congelada** de: precio de lista, reglas del proyecto (`reglas`), opciones (`opts`) y resultado (`res`). Así se respeta el precio aunque la lista cambie después.
- Estados: `emitida` → vigente/vencida (por fecha) · `reserva_pedida` · `reservada` · `anulada`. Cada cambio queda como evento.
