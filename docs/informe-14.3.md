# Informe de ejecución — Tarjeta 14.3 [FE] Orden por columna

**Tarjeta:** 14.3 — Orden por columna clickeable (reemplaza OrdenSelect)
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/sort-columnas`

## Alcance ejecutado

- **`TableHeadOrdenable`** (`src/components/table-head-ordenable.jsx`): botón dentro del `TableHead` con indicador de dirección (▲ activo ascendente, ▼ activo descendente, ↕ inactivo opacidad baja). Un clic alterna asc→desc, otro clic vuelve a asc.
- **Aplicado a los 10 listados** con las columnas ordenables:
  - productos (Nombre, Precio, Stock) · categorías (Nombre) · clientes (Apellido y nombre) · proveedores (Razón social) · ventas (Fecha) · compras (Fecha) · armados (Nombre) · presupuestos (Fecha) · pagos (Fecha) · usuarios (Nombre).
- **`OrdenSelect` eliminado del proyecto** (archivo y todos sus usos). Los `ORDENES_*` const también se eliminaron.
- **`useOrden` intacto**: la persistencia en localStorage por módulo funciona igual (las keys `nombre-asc`, `fecha-desc` etc. ya existían); solo cambió la UI de selección.
- **AGENTS.md actualizado**: la convención de listados ahora menciona `TableHeadOrdenable` + `Buscador` en vez de `OrdenSelect`.

## Verificación

- `npm run lint` OK · `npm run build` OK (0 warnings nuevos).
- Script de transformación ejecutado sobre los 10 listados con verificación de reemplazos.
- El orden persiste igual que antes (localStorage por módulo, sobrevive recarga y logout).

## Checklist manual pendiente

En Productos: clic en «Nombre» → ordena A-Z; clic de nuevo → Z-A; clic en «Stock» → menos stock primero. En Ventas: clic en «Fecha» → más recientes primero. Verificar que el indicador ▲/▼ se muestra y que F5 no lo pierde.
