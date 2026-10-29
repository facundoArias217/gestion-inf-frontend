# Informe de ejecución — Tarea B1 / 15.4 [FE] Configuración: pantalla SC016 (solo ADMIN)

**Tarea:** B1 del plan FRONT (Fase 2 / comi-rapi) — tarjeta 15.4 [FE] Configuración: pantalla SC016 (solo ADMIN)
**Tipo:** [FE] · **Fecha:** 29/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/configuracion`
**Contrato consumido:** 15.3 [BE] Parametría + `GET/PUT /configuracion` (commit `9d1558a`).

## Alcance ejecutado

- **Nuevo módulo `src/features/configuracion/`**:
  - `mocks.js`: valores default del contrato (tope 1.000.000; recargos 10/15/20 %; garantía 6 meses; vigencia 48 h; umbral 5; descuento transferencia 0 %).
  - `services.js`: `obtenerConfiguracion()` y `actualizarConfiguracion(datos)` con la indirección habitual (`isIntegrated('configuracion')`); contra la API usan `api.get/put('/configuracion')` y desenvuelven el envelope `{ message, data }`.
  - `components/configuracion-form.jsx`: formulario con los 8 parámetros agrupados en tres Cards (Cobros, Garantías y presupuestos, Stock), validación zod espejo del backend, botones Guardar/Descartar habilitados solo con cambios y toasts de éxito/error.
  - `pages/configuracion-page.jsx`: carga inicial, skeleton con `role="status"`, estado de error con «Reintentar», `useDocumentTitle('Configuración')`.
- **Wiring**:
  - `router.jsx`: ruta `/configuracion` envuelta en `RequireRole roles={['ADMIN']}`.
  - `dashboard-layout.jsx`: ítem «Configuración» en la sección General, icono `Settings`, roles `['ADMIN']`.
  - `config/integration.js`: `configuracion` agregado a `MODULOS_VALIDOS` y al Set `integrados` (el módulo ya está expuesto por el backend).
  - `AGENTS.md`: 13 módulos y rol de configuración en la lista de features/roles.

## Decisiones tomadas

1. **Pantalla de página propia, no Sheet ni modal.** No es un ABM de registro: es un formulario global de 8 parámetros; la página completa permite agrupar por dominio sin apretar el contenido ni agregar navegación.
2. **El PUT envía los 8 parámetros.** El backend acepta actualización parcial, pero el formulario siempre manda el estado completo para que `isDirty` y «Descartar» tengan una semántica simple y no queden mezclas parciales.
3. **Rangos zod espejo del validator del backend.** Porcentajes 0–100, garantía 1–120 meses, vigencia 1–8760 h, umbral 0–100000, tope 0 < x ≤ 9.999.999.999; así el usuario no descubre los límites con un 400.
4. **Baseline local después de guardar.** «Descartar» resetea contra el último estado guardado (`base`), no contra el valor inicial de la carga; de lo contrario, después de un guardado exitoso y una nueva edición, descartaría a valores viejos.
5. **Inputs numéricos con vacío → `NaN`.** Igual que en el form de producto, el vacío no se convierte en 0: zod muestra el mensaje «Ingresá…» en lugar de guardar un valor silencioso.
6. **Errores de carga con recuperación inline.** Un GET fallido muestra `EmptyState` con «Reintentar» (además del toast); no deja la pantalla en skeleton infinito.
7. **Mocks conservados.** Se mantiene la rama mock con los defaults del contrato para demos offline, aunque `configuracion` ya esté integrado.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (solo el warning preexistente de tamaño de chunk > 500 kB).
- Contrato 15.3 revisado contra `routes/configuracion.routes.js`, `validators/configuracion.validator.js`, `services/configuracion.service.js` y `serializers/configuracion.serializer.js`: nombres, tipos, envelope y límites coinciden.
- No hubo cambios de contrato ni de backend en esta tarjeta.

## Checklist manual pendiente

- ADMIN: el menú muestra «Configuración» y `/configuracion` carga los 8 valores actuales de la API.
- Editar tope, recargos y descuento con decimales → «Guardar cambios» se habilita; guardar muestra toast; recargar la página conserva los valores.
- Editar un campo y pulsar «Descartar cambios» → vuelve al último estado guardado (no al de la carga inicial).
- Vaciar un campo → mensaje zod; porcentaje > 100 → error; valor decimal en un entero → error; tope 0 → error.
- VENDEDOR: no ve el ítem en el menú; entrar directo a `/configuracion` redirige a `/ventas` con aviso de permisos.
- Con backend: `GET /configuracion` responde 200; `PUT` responde 200 con el estado final y persiste tras recargar; un `PUT` inválido responde 400 y la UI muestra el mensaje del backend.
