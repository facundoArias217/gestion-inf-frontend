# Informe de ejecución — Tarjeta 14.1 [FE] Búsqueda en listados

**Tarjeta:** 14.1 — Búsqueda en listados: buscador expansivo con filtrado en vivo
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/busqueda-listados`

## Alcance ejecutado

- **`lib/busqueda.js`** (helper puro): `normalizar()` (minúsculas, sin tildes vía NFD, trim) + `filtrarPorBusqueda(listado, texto, campos)` con campos por **string o función** (para campos resueltos como el cliente de una venta).
- **`Buscador`** (`src/components/buscador.jsx`) con las dos variantes acordadas:
  - **`expansivo` (default):** botón redondo con lupa → se expande (transición de ancho) a un input con «Buscar <módulo>…» y autofocus; X limpia; Escape o blur cierran (con texto activo el botón colapsado muestra un **dot indicador**); el texto sobrevive al colaplo y reaparece al reabrir.
  - **`input` (clásica):** input rectangular siempre visible con lupa y X, por si se prefiere volver con una prop.
- **Aplicado a los 10 listados** con filtrado en vivo de la tabla y el conteo «N de M» actualizándose; campos de búsqueda por módulo:
  - productos (nombre, marca) · categorías (nombre, descripción) · clientes (nombre, apellido, email, CUIT) · proveedores (razón social, CUIT, email) · ventas (cliente, estado, #id) · compras (proveedor, estado, #id) · armados (nombre, descripción, cliente) · presupuestos (cliente, estado, #id) · pagos (cliente de la venta, medio, resultado, #venta) · usuarios (nombre, apellido, email, rol).
- **Empty state de búsqueda:** «**No se encontraron resultados para tu búsqueda**» con acción «Limpiar búsqueda» — se muestra cuando hay texto activo y la tabla queda vacía (antes que los empty states de vacío real y de filtro, que se conservan).

## Decisiones tomadas

1. **Variante B (expansiva) como default** en los 10 listados, según lo acordado; la clásica vive en el mismo componente (`variante="input"`).
2. **Filtrar la tabla** (no dropdown de sugerencias): los "resultados disponibles" son la propia tabla con su conteo; un dropdown duplicaría la lista.
3. La búsqueda es **client-side** sobre los datos ya cargados (los listados traen todo); insensible a tildes y mayúsculas.
4. El buscador vive en el lado derecho de la fila de filtros, donde hoy está `OrdenSelect` (que se elimina en la 14.3, dejando el lugar perfecto).

## Verificación

- Script de la lógica pura (`lib/busqueda.js`): normalización con tildes, trim, null/undefined, filtrado por string y por función, sin texto → todo, sin matcheo → vacío. **OK**.
- `npm run lint` OK · `npm run build` OK.
- Los 10 listados integrados al pipeline existente: estado → **búsqueda** → orden → tabla + conteo.

## Checklist manual pendiente

Abrir la lupa en cada listado, escribir con tildes (p. ej. «básica» en Armados tiene que traer «PC Oficina Básica»), ver el conteo moverse, el dot al colapsar con texto y el empty state «No se encontraron resultados…» con «Limpiar búsqueda».
