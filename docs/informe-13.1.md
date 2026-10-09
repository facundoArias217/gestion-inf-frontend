# Informe de ejecución — Tarjeta 13.1 [FE] Oleada visual

**Tarjeta:** 13.1 — Oleada visual: fechas locales, empty states, jerarquía, badges accesibles, dark mode, conteos
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/mejoras-visuales`

## Alcance ejecutado

Refactor de presentación transversal a las 11 pantallas del panel (cero cambios de lógica de negocio; los servicios, mocks y contratos quedaron intactos):

- **A1 — Fechas locales (`lib/format.js` + `date-fns`):** `formatFecha` (dd/MM/yyyy) y `formatVencimiento` relativo («vence mañana», «venció hace N días»). Aplicado en presupuestos (fecha, vencimiento con chip relativo), ventas, compras, pagos y dashboard. Las comparaciones de vigencia siguen sobre ISO.
- **A2 — Empty states reales:** componente `ui/empty.jsx` (canónico de shadcn) + wrapper `EmptyState` (icono + título + descripción + acción). Cada listado distingue **vacío real** («Todavía no hay presupuestos» + botón *Crear el primero*) de **filtro sin resultados** (*Limpiar filtro*).
- **A3 — Conteos:** «N de M» junto a los filtros de cada listado.
- **A4 — Jerarquía (Refactoring UI):** componente `PageHeader` (H1 fuera del Card + descripción + acciones) aplicado a las 11 páginas; los Cards quedaron solo con filtros+tabla. KPIs del dashboard con **accent border** usando `--chart-1..4` y `tabular-nums`.
- **A5 — Badges accesibles:** `StatusBadge` ahora muestra un **dot de color** junto al texto en los estados con semántica (success/destructive/warning/info) — color y forma, no solo color.
- **A6 — Números tabulares:** `font-variant-numeric: tabular-nums` global para tablas.
- **A7 — Dark mode:** bloque `.dark` en `index.css` (neutros invertidos, primario violeta un tono más claro, success/warning/info recalculados para contraste, charts ajustados) + `useTheme` (localStorage + preferencia del sistema) + toggle Sol/Luna en el menú del usuario.
- **A8 — Título de documento:** hook `useDocumentTitle` por página («Presupuestos · Gestión Informática»).

**Dependencia nueva:** `date-fns` (aprobada). Fuentes de diseño: docs de shadcn (Empty, theming) y tácticas de Refactoring UI (jerarquía, menos bordes, no confiar solo en el color).

## Decisiones tomadas

1. El toggle de tema vive en el menú del usuario (no en el header) para no ensuciar la barra en pantallas chicas; el default sigue a la preferencia del sistema y persiste en `localStorage` (`gestion-inf-tema`).
2. El empty state de listados con rol (productos/categorías para VENDEDOR) no ofrece acción de alta: el solo-lectura no puede crear (RN-USR-03).
3. El chip de vencido usa el texto relativo («venció hace 2 días») en lugar del plano «(vencido)»: la acción correcta queda más clara.

## Verificación

- `npm run lint` OK · `npm run build` OK (sin errores nuevos; el warning de tamaño de chunk es preexistente).
- Revisión de restos: 0 usos de `{x.fecha}` crudo en components/pages (grep).

## Checklist manual pendiente

Recorrer cada listado (con datos y con filtros vacíos), probar el toggle de dark mode en ambos roles y verificar las fechas locales en presupuestos (incluido el chip de vencido) y el contraste de los badges en dark.
