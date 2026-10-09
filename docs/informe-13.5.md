# Informe de ejecución — Tarjeta 13.5 [FE] Acciones de duplicado

**Tarjeta:** 13.5 — Acciones de duplicado en presupuestos y armados
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/duplicaciones-ui`

## Alcance ejecutado

- **`duplicarPresupuesto(id)`** en `presupuestos/services.js`: rama `isIntegrated` → `POST /presupuestos/:id/duplicar`; **mock espejo de RFN-22** (PENDIENTE, fecha de hoy, vence +48 h, precios re-cotizados desde el producto, mismo armado/cliente/cantidades, mensajes idénticos al backend).
- **Acción «Duplicar (recotizar)»** en el dropdown de presupuestos para **todos los estados** (es la salida natural de los vencidos, RN-PRE-03): toast con el id nuevo y la fecha de vencimiento + recarga.
- **`duplicarArmado(id)`** en `armados/services.js`: rama integrada → `POST /armados/:id/duplicar`; mock que reutiliza `crearMock` con «(copia)» y precios actuales.
- **Acción «Duplicar»** en el dropdown de armados **FINALIZADOs** (los BORRADOR ya tienen Editar/Finalizar): crea la copia en BORRADOR y **navega directo a `/armados/:id/editar`** para retocarla — el flujo «plantilla» completo en dos clics.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-03 | Duplicar un vencido produce una cotización nueva a precios actuales sin tocar el original. |
| RFN-22 | Semántica completa espejada en el mock (estados, precios, vencimiento 48 h). |
| RFN-09 | El original no cambia de estado al duplicarse; la copia nace PENDIENTE/BORRADOR. |
| RN-ARM-05 | La copia del armado conserva componentes sin duplicar detalles. |

## Verificación

- `npm run lint` y `npm run build` OK.
- Contratos validados en las baterías de la 13.2 (12/12) y 13.3 (9/9); los services llaman exactamente esos endpoints.
- Mocks verificados contra los mensajes y shapes del backend (mismos strings de error).

## Checklist manual pendiente

Duplicar un presupuesto vencido desde el navegador y ver el nuevo PENDIENTE con vencimiento a 48 h; duplicar un armado FINALIZADO y editar la copia en el formulario.
