# Informe de ejecución — Tarjeta 9.2 [FE-mock] Conversión de presupuesto en venta

**Tarjeta:** 9.2 — Presupuestos: conversión en venta (frontend)
**Tipo:** [FE-mock] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- **`convertirPresupuesto(id)`** en `services.js` con rama `isIntegrated('presupuestos')` → `POST /presupuestos/:id/convertir` (contrato de la 9.4). El mock espeja la semántica del backend: solo ACEPTADO (mismo mensaje de error), líneas de sueltos + componentes del armado, precios históricos si está vigente y **recotización a precio de lista actual si está vencido** (RN-PRE-03), presupuesto → CONVERTIDO. En modo mock la venta derivada no se persiste en el store de ventas (limitación documentada; con la 9.5 la conversión va al backend real y la venta es real).
- **Acción "Convertir en venta"** en el dropdown de presupuestos ACEPTADOs (vigentes y vencidos) + **dialog de confirmación** (`convertir-presupuesto-dialog.jsx`): explica las reglas según vigencia (vencido: avisa la recotización a precios actuales), toast con el id de la venta creada y recarga del listado.
- **Fixes de la 9.1 incluidos:** el subtotal de sueltos del registro se computa desde `productosPorId` (antes leía `detalle.precioUnitario`, un campo que el form nunca tenía → total siempre 0) y `crearMock` persiste el precio computado desde el producto (antes `undefined`).

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-03 | El dialog advierte la recotización al precio actual antes de convertir un vencido. |
| RN-PRE-04 | Conversión única: el ACEPTADO pasa a CONVERTIDO; reintentar cae en el 409 del backend (espejado en el mock). |
| RN-PRE-05 | Vigente: los precios de la venta son los históricos de la cotización. |
| RN-ARM-05 | Los componentes del armado se agregan como líneas de la venta, sin duplicarse en el detalle del presupuesto. |
| RN-STK-03 | La re-verificación de stock ocurre en el backend al convertir (el FE solo informa; el 409 de stock se muestra en el toast). |

## Verificación

- `npm run lint` y `npm run build` OK.
- Semántica del mock alineada 1:1 con la batería de la 9.4 (mismos mensajes y mismos estados).
- Los 8 presupuestos mock cubren el flujo: el ACEPTADO vigente (id 2) queda listo para convertir; los vencidos (4 y 5) ejercitan la rama de recotización.

## Checklist manual pendiente

Con la 9.5 integrada (o contra mocks): aceptar un presupuesto con armado, convertirlo, ver el toast con el id de la venta y el presupuesto CONVERTIDO en el listado; probar convertir un vencido y leer el aviso de recotización.
