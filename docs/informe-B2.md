# Informe de ejecución — Tarea B2 / 15.6 [FE] Catálogo: forms de producto y categoría con specs e imagen

**Tarea:** B2 del plan FRONT (Fase 2 / comi-rapi) — tarjeta 15.6 [FE] Catálogo: forms de producto y categoría con specs e imagen
**Tipo:** [FE] · **Fecha:** 29/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/catalogo-specs`

## Alcance ejecutado

- **`producto-form-sheet.jsx`**:
  - Agrega los 4 campos fijos de compatibilidad del contrato 15.5: `socket` (texto, máx. 50), `tipoMemoria` (texto, máx. 20), `graficosIntegrados` e `incluyeCooler` (booleanos nullable).
  - Los booleanos se editan con un select de tres estados («Sin dato» → `null`, «Sí» → `true`, «No» → `false`) para no perder el nullable del contrato.
  - `reset` y payload incluyen los campos; los textos vacíos viajan como `null` y los booleanos tal cual.
  - `imagenUrl` y `especificaciones` ya venían de A4/A5 y se conservan sin cambios.
- **`categoria-form-dialog.jsx`**:
  - Agrega `clave` (opcional, máx. 50, normalizada a minúsculas, regex `^[a-z][a-z0-9_]*$`) y `obligatoria` (checkbox, por defecto `false`).
  - El payload envía `clave: null` cuando está vacía y `obligatoria` como booleano.
  - Un 409 de clave duplicada se muestra sobre el campo `clave` (si el mensaje menciona «clave»); el resto sigue cayendo en `nombre`.
  - El `DialogContent` ahora limita su altura y scrollea en pantallas chicas, porque el formulario pasó de 2 a 4 campos.
- **`categorias-page.jsx`**: la celda de nombre muestra la `clave` (monoespaciada, muted) y un badge «Obligatoria» cuando corresponde, sin agregar columnas nuevas ni romper el responsive.
- **Mocks**:
  - `productos/services.js`: `crearMock`/`actualizarMock` persisten `socket`, `tipoMemoria`, `graficosIntegrados` e `incluyeCooler`.
  - `categorias/services.js`: `crearMock`/`actualizarMock` persisten `clave`/`obligatoria` y validan unicidad de `clave` con el mismo mensaje de negocio que el backend (409).

## Decisiones tomadas

1. **Booleanos nullable con select de tres estados.** Un checkbox no puede representar «sin dato»; el select mantiene el contrato (`null` ≠ `false`) y evita inventar un valor por defecto.
2. **`clave` normalizada en el cliente.** Se aplica `trim` + `toLowerCase` y la regex del validator en zod, para que el usuario pueda escribir «Procesador» y guarde `procesador` sin sorpresas.
3. **Sin columna nueva para `clave`/`obligatoria`.** Se muestran dentro de la celda de nombre (slug debajo y badge al lado) para no sumar ancho en mobile ni tocar la paginación/orden existentes.
4. **Imagen por URL, sin multipart.** Se mantiene el alcance acordado para B2; `POST /productos/:id/imagen` (16.1) queda para una tarjeta posterior.
5. **Errores de clave mapeados por mensaje.** El backend responde 409 con un mensaje que menciona «clave»; si no, el error sigue mostrándose en `nombre` como antes.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- Mocks: alta/edición de producto conserva los 4 campos; alta/edición de categoría conserva `clave`/`obligatoria` y rechaza una clave repetida.
- Sin cambios en `integration.js`, `router.jsx`, guards ni en el contrato de los endpoints.

## Checklist manual pendiente

- Producto: alta con socket `AM5`, memoria `DDR5` y ambos booleanos en «Sin dato» → guarda y al reabrir la edición vuelven los mismos valores.
- Producto: cambiar `graficosIntegrados` a «No» y `incluyeCooler` a «Sí» → persiste `false`/`true` (no `null`); dejarlos en «Sin dato» → persiste `null`.
- Producto: socket/memoria vacíos → viajan como `null` y el formulario sigue validando.
- Categoría: crear con clave `Procesador` → se guarda `procesador`; reabrir edición muestra la clave normalizada.
- Categoría: clave con espacio, mayúscula inicial y guion bajo (`Memoria_RAM`) → se normaliza; clave que empieza con número o tiene guion medio → mensaje zod.
- Categoría: clave duplicada → error sobre el campo `clave`.
- Categoría: marcar «Obligatoria» → el listado muestra el badge; desmarcar → desaparece.
- Categoría: el formulario scrollea en viewport chico sin cortar el botón Guardar.
- Producto/categoría: editar y guardar contra la API real (módulos integrados) sin cambios de contrato.
