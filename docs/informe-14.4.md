# Informe de ejecución — Tarjeta 14.4 [FE] Paginación

**Tarjeta:** 14.4 — Paginación client-side de 10 por página
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/paginacion`

## Alcance ejecutado

- **`usePaginacion`** (`src/hooks/use-paginacion.js`): hook que recibe el total de ítems y una **clave de reseteo** (`filtro-busqueda-orden` concatenado). Usa el patrón React de "ajustar estado durante render" (sin `useEffect`): cuando la clave cambia, la página vuelve a 1 automáticamente. El hook también **clampa** la página al rango válido si el total se reduce. Expone `paginar(listado)` que hace el slice.
- **`Paginacion`** (`src/components/paginacion.jsx`): números de página clickeables + anterior/siguiente con chevrons, disabled en los bordes, «Página X de Y» a la izquierda. Se oculta si hay una sola página (≤10 ítems).
- **Aplicado a los 10 listados**: el pipeline por página queda: filtros de estado → búsqueda → orden por columna → **paginación (slice de 10)** → tabla renderiza `visibles` en vez de la lista filtrada completa → `Paginacion` al pie de la tabla.

## Decisiones tomadas

1. **10 por página fijo** — con los seeds mínimos actuales (3-6 ítems por tabla) la paginación casi no aparece, lo que es correcto: solo se muestra cuando la lista crece. El `Productos` con 38 items es el primero en ejercitarla.
2. **Reset automático a página 1** cuando cambian filtros, búsqueda o orden — vía clave de dependencia (patrón React "adjust state during render"), sin `useEffect` ni riesgo de cascading renders.
3. **Sin configuración del usuario** (no elegir 10/25/50): sobrecarga para un panel interno.

## Verificación

- `npm run lint` OK · `npm run build` OK.
- Script de transformación con manejo de CRLF (`\r\n`): 10/10 páginas, 6 cambios cada una (imports, hook, visibles, map, Paginacion).
- Verificación manual del patrón en productos (filtrados), ventas (ordenadas) y pagos (filtrados): hook, visibles, map y Paginacion consistentes.

## Checklist manual pendiente

En Productos (38 productos, 4 páginas): navegar con los números y los chevrons; cambiar el filtro o buscar algo → debe volver a página 1; en los módulos con pocos datos (3-6), el control no debe aparecer.
