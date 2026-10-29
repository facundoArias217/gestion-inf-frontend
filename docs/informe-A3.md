# Informe de ejecución — Tarea A3 [FE] ABMs medianos en drawer lateral (Sheet)

**Tarea:** A3 del plan FRONT (Fase 2 / comi-rapi) — regla de ABM: drawer lateral (Sheet) para formularios medianos, modal solo para cortos y confirmaciones, página propia para flujos multi-item
**Tipo:** [FE] · **Fecha:** 28/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/abm-sheet`

## Alcance ejecutado

- **`src/components/ui/sheet.jsx`** (nuevo, base del registro oficial de shadcn/ui): `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`. Se extendió `SheetContent` con la variante `ancho` (`sm | md | lg | xl`, por defecto `sm`).
- **Productos:** `producto-form-dialog.jsx` → `producto-form-sheet.jsx` (`SheetContent ancho="xl"`, el editor de especificaciones necesita ancho); página rewireada a `ProductoFormSheet`.
- **Clientes:** `cliente-form-dialog.jsx` → `cliente-form-sheet.jsx` (`ancho="lg"`); página rewireada a `ClienteFormSheet`.
- **Proveedores:** `proveedor-form-dialog.jsx` → `proveedor-form-sheet.jsx` (`ancho="lg"`); página rewireada a `ProveedorFormSheet`.
- Sin cambios de contrato, `services.js`, `mocks.js`, `integration.js`, router ni guards. Los formularios conservan props (`open`, `onOpenChange`, entidad, `onGuardado`) y validaciones zod.

## Decisiones tomadas

1. **Medianos → drawer, cortos → modal.** Productos, clientes y proveedores pasan a Sheet lateral por la cantidad de campos y el editor de specs; categorías y usuarios (formularios cortos) y todas las confirmaciones/bajas siguen en `Dialog`/`AlertDialog`. Compras, ventas, presupuestos y armados ya usan página propia.
2. **Variante `ancho` en `ui/sheet.jsx`.** `cn` del proyecto es `cn@0.4` (no es `tailwind-merge`): dos utilidades de ancho contradictorias conviven y gana el orden del CSS, no la última clase. En vez de pelear con `className`, se agregó la variante con anchos cerrados (`sm/md/lg/xl`), siguiendo el patrón permitido de extender variantes (como `StatusBadge`).
3. **Footer dentro del formulario, no `SheetFooter`.** El contenido del Sheet scrollea (`overflow-y-auto`); los botones quedan al final del form (con `border-t`) para que acompañen el scroll y no floten tapando campos. `SheetHeader` lleva `border-b`.
4. **Anchos:** `xl` (máx. 2xl) para producto por el editor de especificaciones; `lg` (máx. lg) para cliente y proveedor.
5. **Cierre:** botón X estándar del registro (mismo criterio visual que `ui/dialog.jsx`); sin `SheetFooter` ni `SheetClose` adicionales.
6. **Nombres:** componentes y archivos renombrados a `*FormSheet` para que el nombre refleje el patrón (el import de cada página cambia en el mismo commit).

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- `git grep` sin referencias a `*form-dialog`, `ProductoFormDialog`, `ClienteFormDialog` ni `ProveedorFormDialog`; los únicos `AlertDialogFooter` restantes son los de las bajas lógicas.
- `AGENTS.md` actualizado: la regla de ABMs ya no dice que todos van en modal.

## Checklist manual pendiente

- Productos: «Nuevo producto» → abre drawer por la derecha con ancho amplio, scroll interno y editor de especificaciones usable; guardar cierra y refresca el listado.
- Productos: editar un producto existente → drawer con datos precargados; Cancelar cierra sin guardar.
- Clientes y proveedores: alta y edición → drawer `lg`; Cancelar/Guardar responden igual que antes.
- Categorías y usuarios: siguen abriendo en modal centrado.
- Bajas/confirmaciones: siguen en `AlertDialog` con su estado `procesando`.
- Responsive: en viewport chico el drawer ocupa `w-full` y el contenido scrollea sin cortar el botón Guardar.
