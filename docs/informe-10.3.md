# Informe de ejecución — Tarjeta 10.3 [Int] Pagos real

**Tarjeta:** 10.3 — Pagos real (integración frontend ↔ backend)
**Tipo:** [Int] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- `src/config/integration.js`: el Set incorpora `'pagos'`. **Módulo 10 completo**: el circuito de cobro simulado queda contra la API real.
- Las ramas integradas de `pagos/services.js` (10.1) pasan a ejecutarse: `GET /pagos` y `POST /pagos`.
- `mocks.js` conservado para demos offline.

## Verificación

- `npm run lint` y `npm run build` OK.
- **E2E 5/5 OK** contra la API real con token de VENDEDOR replicando las llamadas del service: login → listar (4 sembrados) → registrar cobro sobre la venta COMPLETADA 4 con el total precargado (870000) → el cobro es visible en el listado → cleanup con la base restaurada.
- Contrato validado en la batería de la 10.2 (16/16), incluida la verificación de stock intacto (RN-PAG-03).

## Checklist manual pendiente

Con ambos servers levantados: registrar un cobro desde el navegador, verificar el monto precargado con el total de la venta y el badge del resultado en el listado.
