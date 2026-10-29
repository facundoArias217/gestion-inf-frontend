# Informe de ejecución — Tarea A6 [FE] Patrones transversales de UI

**Tarea:** A6 del plan FRONT (Fase 2 / comi-rapi) — skeletons con forma real, foco al cambiar de ruta, toast con acción y confirmaciones con estado de carga
**Tipo:** [FE] · **Fecha:** 29/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/patrones-ui`

## Alcance ejecutado

- **`src/components/skeleton-tabla.jsx`** (nuevo): reemplaza el skeleton genérico de una sola celda por filas con una celda por columna, con anchos variados para que la carga se parezca a la tabla real.
  - Props: `columnas` (cantidad), `filas` (por defecto 4) y `ocultas` (índices que llevan `hidden lg:table-cell`, igual que los encabezados).
  - `role="status"` con texto `sr-only` («Cargando datos…») una sola vez por tabla, para lectores de pantalla.
- **10 listados** (productos, categorías, clientes, proveedores, usuarios, compras, ventas, presupuestos, armados y pagos): se reemplazó el bloque `[1..n].map(...)` por `SkeletonTabla`, respetando:
  - columnas ocultas en mobile (productos: Marca/Categoría; clientes y proveedores: Teléfono/Dirección; categorías: Descripción);
  - variantes por rol en productos (7 columnas admin / 6 vendedor) y categorías (4 admin / 3 vendedor);
  - cantidad de filas (5 en productos, 3 en pagos y usuarios, 4 en el resto).
- **Dashboard:** el skeleton de métricas ahora tiene `role="status"` y texto `sr-only` («Cargando métricas…»).
- **Foco al cambiar de ruta:** `src/layouts/dashboard-layout.jsx` agrega `ref` y `tabIndex={-1}` al `<main>` y hace foco en cada cambio de `pathname`, salvo el primer render (para no robar el foco en la carga inicial).
- **Toast con acción:** en las 5 bajas lógicas (productos, categorías, clientes, proveedores y usuarios) el toast de éxito incluye «Deshacer», que reactiva el registro (`reactivarProducto`/`reactivarCategoria`/`reactivarCliente`/`reactivarProveedor` o `cambiarEstadoUsuario(id, true)`) y refresca el listado. Si la reactivación falla, se muestra un toast de error.
- **Confirmaciones con estado de carga:** se revisaron los 5 diálogos de baja; ya contaban con `procesando`, que deshabilita Cancelar/Confirmar y cambia el texto de la acción mientras se ejecuta la petición.

## Decisiones tomadas

1. **Skeleton compartido basado en tabla.** Se centraliza en `SkeletonTabla` en vez de repetir el bloque en cada página; la forma se controla con `columnas`/`filas` para no inventar una abstracción de layout distinta a la tabla real.
2. **Columnas ocultas por índice.** `ocultas` replica las clases `hidden lg:table-cell` de los `TableHead` para que el skeleton no desalinee en mobile. Se prefirió a pasar objetos por columna para mantener la llamada corta.
3. **Foco en `<main>`, no en el título.** El layout es el punto común a todas las rutas; el foco se mueve al contenido sin anillo visible (`focus:outline-none`) y solo desde la segunda ruta, para no interferir con la carga inicial ni con el toast de bienvenida.
4. **«Deshacer» solo en bajas lógicas.** Es la acción de reversión real que ya existía en los servicios; no se agregan toasts con acciones decorativas en otros flujos.
5. **Sin cambios de contrato ni de servicios.** Los `services.js`, `mocks.js`, `integration.js`, router y guards quedan intactos.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- `git grep` sin restos del skeleton de una celda (`<Skeleton className="h-6 w-full" />`).
- Revisión de imports y uso de `SkeletonTabla` en los 10 listados; `Skeleton` solo queda en el dashboard.

## Checklist manual pendiente

- Navegar entre módulos: el foco pasa al `<main>` y el siguiente Tab entra al contenido de la pantalla; no aparece anillo visible.
- Listados: al entrar o recargar se ve una fila con una celda por columna (no una barra única); en mobile desaparecen las mismas columnas que los encabezados.
- Productos y categorías como vendedor: el skeleton muestra la cantidad de columnas de solo lectura.
- Baja de producto, categoría, cliente, proveedor y usuario: el toast muestra «Deshacer»; al clickear, el registro vuelve a activo y reaparece en el listado.
- Si la reactivación falla (por ejemplo, sin conexión), se muestra el toast de error y el registro sigue dado de baja.
- Confirmaciones de baja: mientras se procesa, Cancelar y Confirmar quedan deshabilitados y el texto cambia («Dando de baja…»/«Desactivando…»).
