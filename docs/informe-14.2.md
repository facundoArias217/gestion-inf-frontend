# Informe de ejecución — Tarjeta 14.2 [FE] Combobox buscable

**Tarjeta:** 14.2 — Combobox buscable: filtro de categorías de Productos y selects de formularios
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/combobox-buscable`

## Alcance ejecutado

- **Nueva dependencia `cmdk`** (componente Command de shadcn/ui) + **`ui/popover.jsx`** (Radix) + **`ui/command.jsx`** (el wrapper de cmdk con estilos del proyecto).
- **`ComboboxBuscable`** (`src/components/combobox-buscable.jsx`): botón que abre un popover con input de búsqueda, listado filtrado en vivo y **«No se encontraron resultados para tu búsqueda»** cuando no hay matcheos (via `Command.Empty`). Soporta items deshabilitados (stock 0), agrupación por categoría, selección con check, y cierre al seleccionar.
- **★ Filtro de categorías en Productos:** reemplaza el Select plano por el `ComboboxBuscable` — al hacer clic, escribís letras y las categorías se filtran en vivo; sin resultados muestra el empty state. La opción «Todas las categorías» es el primer item.
- **`ProductoCombobox`** (`src/components/producto-combobox.jsx`): items con nombre + marca + stock (badge rojo cuando es 0), deshabilitados sin stock, agrupados por categoría. Aplicado en:
  - **Venta registro** (por fila de detalle, agrupado por categoría)
  - **Presupuesto registro** (por fila de detalle, agrupado por categoría)
  - **Armado form** (por slot, filtrado por la categoría del slot — sin agrupación porque ya viene pre-filtrado)
- **`ClienteCombobox`** (`src/components/cliente-combobox.jsx`): items con apellido+nombre y email. Aplicado en:
  - **Venta registro** (select de cliente)
  - **Presupuesto registro** (select de cliente)
- **Select de venta en el pago:** el dialog de pago ahora usa `ComboboxBuscable` directo para buscar la venta por #id, cliente o total.
- **Carga de categorías** agregada a venta-registro y presupuesto-registro (para la agrupación del ProductoCombobox).

## Verificación

- `npm run lint` OK · `npm run build` OK.
- Los selects de estado (≤6 opciones fijas) quedaron como `Select` planos, según lo acordado.
- Los formularios usan `react-hook-form` igual que antes — el combobox es solo la UI de selección, el valor sigue viajando como string/number al form.

## Checklist manual pendiente

En Productos: clic en «Todas las categorías» → escribir letras → filtrado en vivo → sin resultados. En Nueva venta: cliente buscable por email; producto buscable por nombre/marca, agrupado por categoría, con stock 0 deshabilitado. En Armá tu PC: cada slot tiene su combobox filtrado por la categoría del slot.
