# Informe de ejecución — Tarjeta 12.1 [FE-mock] Dashboard

**Tarjeta:** 12.1 — Dashboard: métricas operativas (frontend)
**Tipo:** [FE-mock] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- **`dashboard-page`** (reemplaza el placeholder del router, ADMIN only): 4 tarjetas KPI (Productos de bajo stock, Ventas de hoy, Ventas del mes, Presupuestos pendientes) con iconos de lucide + 2 mini-listas (Bajo stock top 5 con stock en rojo cuando es 0; Compras recientes con razón social del proveedor resuelta desde el módulo proveedores y StatusBadge de estado).
- **`services.js`** con rama `isIntegrated('dashboard')` → `GET /dashboard`. **`mocks.js`** con datos coherentes con los seeds del backend.
- Limpieza: con las 12 pantallas reales, `PlaceholderPage`/`PlaceholderAdmin` quedaron sin uso y se eliminaron.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RF-DSH-01 | Las 4 métricas del CE-DSH-01 visibles; montos derivados formateados con `formatCurrency`. |
| RN-USR-02 | Ruta ADMIN only (RequireRole); el menú ya la mostraba solo para ADMIN. |

## Decisiones tomadas

1. **Sin librería de charts** (no hay ninguna instalada): cards + listas con la identidad visual existente; los tokens `--chart-1..5` quedan para una evolución.
2. El proveedor de cada compra reciente se resuelve en el FE desde el módulo proveedores (ya integrado), evitando engordar el contrato del dashboard.

## Verificación

- `npm run lint` y `npm run build` OK.
- Valores del mock alineados con los seeds (mismas magnitudes que la batería de la 12.2: bajoStock 11, ventasMes 6 / $2.202.000, presus 4).

## Checklist manual pendiente

Loguearse como admin y recorrer el dashboard: 4 KPIs, la lista de bajo stock y las compras recientes con nombre del proveedor.
