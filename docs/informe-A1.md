# Informe de ejecución — Tarea A1 [FE] Borradores de formulario (useFormDraft)

**Tarea:** A1 del plan FRONT (Fase 2 / comi-rapi) — `useFormDraft(clave)` (borrador + sessionStorage + aviso) aplicado a las altas de los flujos multi-item
**Tipo:** [FE] · **Fecha:** 28/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/use-form-draft`

## Alcance ejecutado

Patrón de borrador de formulario: lo escrito en una alta se persiste en `sessionStorage` mientras se completa; si el usuario sale sin guardar (recarga, navegación por el menú o botón Volver), al volver a la pantalla aparece un **aviso inline** con «Recuperar borrador» / «Descartar». Sin cambios de contrato ni de servicios: funciona igual contra API real y mocks.

- **`src/hooks/use-form-draft.js`** (nuevo): `useFormDraft(clave, { estaVacio })` con `hayBorrador`, `guardar`, `recuperar` y `limpiar`. Claves `gestion-inf-borrador:<modulo>` en `sessionStorage` (vive por pestaña: sobrevive recarga y navegación, muere al cerrar la pestaña). Lectura/escritura protegidas ante almacenamiento no disponible. Helper exportado `revivirNumeros` (deep `null → NaN`) para restaurar los valores numéricos de los formularios de react-hook-form.
- **`src/components/alerta-borrador.jsx`** (nuevo): aviso inline ámbar con las dos acciones; se renderiza bajo el encabezado de la página, antes del formulario.
- **`venta-registro-page.jsx`**: borrador del bundle completo del form (`clienteId`, `fecha`, `detalles`), escrito en cada cambio (efecto sobre el JSON de `useWatch`) y restaurado con `form.reset(revivirNumeros(borrador))`.
- **`compra-registro-page.jsx`**: ídem, clave `compra` (incluye `precioUnitario` por ítem).
- **`presupuesto-registro-page.jsx`**: borrador de bundle extendido: valores del form + `vigencia` + `vencePersonalizado` + `armadoElegidoId` (todo lo que se perdería al salir).
- **`armado-form-page.jsx`**: borrador del estado del asistente (nombre, descripción, cliente, selecciones, paso actual y categoría de Otros); solo en alta (la edición nunca escribe borrador). Tras recuperar, el usuario vuelve al paso donde estaba.

## Decisiones tomadas

1. **sessionStorage, no localStorage** (definido en el plan): el borrador es de sesión; al cerrar la pestaña se pierde a propósito. El aviso cubre recargas, cierres accidentales de pestaña no, navegación y el botón Volver.
2. **Cancelar limpia el borrador**: el abandono explícito por el botón Cancelar borra el borrador antes de navegar; el aviso queda reservado a las salidas accidentales (recarga, menú lateral, Volver). Evita la confusión de «cancelé y me reaparece».
3. **Guardar éxito también limpia**: al registrar la operación el borrador se elimina (`limpiarBorrador()` antes de navegar); en el guardado del armado se limpia apenas se crea el borrador persistido, aunque falle la finalización (coherente con la decisión de la 15.1 de no duplicar en el reintento).
4. **Guarda solo si hay contenido**: cada formulario pasa su predicado `estaVacio` al hook; un formulario vacío no se persiste y si quedó un borrador previo se lo considera resuelto.
5. **Bandera de aviso pendiente en el hook**: al montar, el primer efecto escribe el formulario en blanco; sin la bandera, ese primer guardado vacío ejecutaría `removeItem` y **borraría el borrador antes de ofrecer recuperarlo**. `guardar` con valor vacío solo borra si el aviso ya fue resuelto (recuperado o descartado).
6. **Ediciones sin borrador**: el borrador aplica solo a altas; en edición el registro existe en el servidor y el wizard de armados ni siquiera escribe (efecto tempraneado por `esEdicion`), aunque el aviso de un borrador de alta anterior no se muestra en edición.
7. **NaN ↔ null**: los forms de RHF usan `NaN` para «sin elegir»; `JSON.stringify` lo serializa como `null`, y `revivirNumeros` lo restaura a `NaN` al recuperar, manteniendo el contrato de `CampoNumero` y los schemas de zod.
8. El aviso es inline (no toast): persiste hasta que el usuario decide, es accesible y no compite con los toasts de error/éxito.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- Sin cambios en `services.js`, `mocks.js`, `integration.js`, `router.jsx` ni guards.

## Checklist manual pendiente

- Venta: cargar cliente + 2 ítems → recargar (F5) → debe aparecer el aviso → «Recuperar borrador» → los campos y las cantidades vuelven.
- Venta: cargar datos → navegar por el menú a otro módulo → volver a Nueva venta → aviso → «Descartar» → formulario limpio y sin aviso.
- Venta: cargar datos → Cancelar → volver a Nueva venta → NO debe haber aviso (decisión 2).
- Venta: registrar una venta con datos cargados → al volver a «Nueva venta» no debe haber aviso.
- Compra: ídem, verificando precio de compra por ítem.
- Presupuesto: elegir vigencia Personalizada + armado + un ítem → recargar → recuperar → vigencia, fecha personalizada, armado e ítems restaurados.
- Armado: avanzar 3 pasos, elegir CPU y RAM, nombrar el armado → F5 → recuperar → vuelve al paso donde estaba con las selecciones; «Guardar y finalizar» limpia el borrador.
- Armado: edición de un BORRADOR existente → nunca aparece aviso ni escribe borrador.
- Con DevTools → Application → Session Storage: verificar las claves `gestion-inf-borrador:*` creciendo con los cambios y desapareciendo al guardar/cancelar.
