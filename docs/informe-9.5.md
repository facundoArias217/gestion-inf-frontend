# Informe de ejecución — Tarjeta 9.5 [Int] Presupuestos real

**Tarjeta:** 9.5 — Presupuestos real (integración frontend ↔ backend)
**Tipo:** [Int] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- `src/config/integration.js`: el Set de módulos integrados incorpora `'presupuestos'` (junto a auth, categorias, productos, clientes, proveedores, compras, ventas y armados). **Módulo 9 completo**: el segundo diferenciador queda de punta a punta contra la API real.
- Las ramas integradas de `presupuestos/services.js` (listar, crear, aceptar, rechazar, convertir — escritas en 9.1/9.2 contra el contrato final) pasan a ejecutarse contra `GET/POST /presupuestos`, `PATCH /:id/estado` y `POST /:id/convertir`.
- `mocks.js` se conserva intacto para demos offline (convención de la migración por módulos).

## Verificación

- `npm run lint` y `npm run build` OK.
- **E2E 8/8 OK** contra la API real con token de VENDEDOR, replicando las llamadas exactas del service: login → listar (8 sembrados) → crear con armado FINALIZADO + suelto (sin precios, RFN-10) → aceptar → **convertir → venta COMPLETADA con 8 líneas (7 del armado + 1 suelto) y `presupuestoId`** → la venta es visible en `GET /ventas` para el listado del FE → cleanup con la base restaurada.
- Semántica de la conversión verificada en la batería de la 9.4 (22/22): conversión única, recotización de vencidos, rollback ante stock insuficiente.

## Decisiones tomadas

1. El FE no envía precios en ningún flujo de presupuestos (RFN-10): la cotización se computa en el backend al crear y la conversión decide la fuente de precios según vigencia (RFN-21).
2. La advertencia de stock al cotizar sigue siendo informativa del FE (RFN-14); el bloqueo ocurre solo al convertir (409 con toast).

## Checklist manual pendiente

Con ambos servers levantados: crear un presupuesto con armado + suelto desde el navegador → aceptarlo → convertirlo → verificar el toast con el id de la venta, el presupuesto CONVERTIDO en el listado y la venta con sus líneas en /ventas.
