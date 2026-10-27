# Informe de ejecución — Tarjeta 15.1 [FE] Asistente de armado por pasos (pasada visual)

**Tarjeta:** 15.1 — Armados: asistente por pasos SC010 (pasada visual, sin cambios de contrato)
**Tipo:** [FE] · **Fecha:** 26/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/armados-wizard`

## Alcance ejecutado

Reemplazo del formulario de slots apilados por un **asistente por pasos** (SC010, FRD Módulo 8 HU 8.1). Pasada **visual**: no se modifica ningún contrato ni regla; el payload, los servicios, los mocks, `integration.js` y las rutas quedan intactos.

- **`pages/armado-form-page.jsx`** reescrito como orquestador: pasos fijos por nombre de categoría (Procesador → Motherboard → Memoria RAM → Almacenamiento → Fuente → Gabinete → Cooler → Placa de video) + **Otros** (opcional) + **Resumen**. Categoría inexistente → paso oculto (comportamiento anterior). Estado de selección plano `[{ productoId, cantidad }]` equivalente a los slots previos.
- **`components/armado-stepper.jsx`**: barra de progreso (obligatorios completos/total) + botones por paso con ícono, check en completos y punto rojo en obligatorios faltantes; navegación libre por click; «Paso X de Y».
- **`components/paso-categoria.jsx`**: grilla de `ProductoCard` de la categoría con búsqueda local (nombre/marca), badge Obligatoria/Opcional, contador de elegidos y sección «Elegidos en este paso» con cantidad, subtotal y quitar.
- **`components/paso-otros.jsx`**: select de categorías restantes (solo activas) + grilla de productos + sección «Agregados» agrupada por categoría.
- **`components/producto-card.jsx`**: card con imagen del producto si tiene `imagenUrl` (fallback a ícono por categoría si no existe o falla la carga — forward-compatible con D7), nombre, marca, precio, stock («Sin stock» en rojo, botón deshabilitado) y «Ver detalle».
- **`components/producto-detalle-dialog.jsx`**: detalle del producto (marca, categoría, precio, stock, descripción) con sección «Especificaciones» (socket, tipo de memoria, gráficos integrados, incluye cooler) que se renderiza solo si los campos existen — forward-compatible con D13, hoy no muestra specs.
- **`components/resumen-armado.jsx`**: panel lateral sticky (≥lg) con elegidos por paso, total, faltantes y advertencias; en mobile queda cubierto por el paso Resumen.
- **`components/paso-resumen.jsx`**: tabla completa por categoría con subtotales y total, faltantes/advertencias, datos del armado (nombre, cliente, descripción) y acciones **Guardar y finalizar** (con confirmación) y **Guardar borrador**.
- **Validación**: se mantiene la actual client-side (`compatibilidad.js` intacta): completitud por las 6 obligatorias, advertencias informativas, errores de cantidad/stock que bloquean guardar. «Siguiente» se bloquea solo si el paso actual tiene errores de cantidad/stock.

## Decisiones tomadas

1. **Pasada visual sin contrato**: el paso Resumen guarda con el mismo payload de siempre; «Guardar y finalizar» encadena `crearArmado`/`actualizarArmado` → `finalizarArmado` (endpoints existentes, sin cambios de backend). Si el guardado falla, no se navega; si falla solo la finalización, se navega al listado con el borrador persistado (evita duplicados en el reintento).
2. **Cooler como paso opcional** (categoría «Refrigeración»): la condición real «solo si el procesador no lo incluye» exige las specs de D11/D13 y llega con la pasada 2 (tarjeta 15.8); por ahora se muestra como paso opcional más.
3. **Placa de video de selección única** en su paso (RN-ARM-07 no la capta; decisión de UX del asistente).
4. **Ícono por categoría** (lucide: Cpu, CircuitBoard, MemoryStick, HardDrive, Zap, PcCase, Fan, Monitor, Package) con fallback desde `imagenUrl` ya implementado en card y detalle: al integrar D7 los productos con imagen la muestran sin tocar estos componentes.
5. **Otros restringe nuevas altas a categorías activas** (mejora respecto del select anterior que listaba inactivas); los extras existentes de categorías inactivas siguen viéndose y editándose en «Agregados».
6. **Edición arranca en el primer paso obligatorio incompleto**; si está completo, arranca en el Resumen.
7. Producto duplicado entre pasos sigue bloqueado (card deshabilitada con motivo «Elegido en otro paso»); seleccionar un max-1 (CPU/MB/Fuente/Gabinete/GPU) reemplaza la elección anterior; RAM/Almacenamiento/Cooler/Otros admiten varios productos con cantidad.
8. Las advertencias y la completitud siguen siendo las de `compatibilidad.js` (única fuente client-side vigente); su eliminación y el pasaje al endpoint de validación del backend corresponden a la pasada 2 (15.7/15.8).

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (warning preexistente de tamaño de chunk, sin errores).
- Sin cambios en `services.js`, `mocks.js`, `integration.js`, `router.jsx` ni guards: el asistente funciona igual contra API real y mocks.

## Checklist manual pendiente

- Nuevo armado: recorrer los pasos con Anterior/Siguiente y con el stepper; elegir CPU y verificar que el paso se marca completo y el progresos avanza (1/6).
- Ver detalle de un producto desde un paso; verificar el ícono por categoría (los seeds no tienen `imagenUrl`).
- Paso Otros: elegir una categoría, agregar un producto con cantidad, quitarlo.
- Guardar borrador incompleto (sin CPU) → debe guardar y quedar BORRADOR en el listado.
- Guardar y finalizar con las 6 obligatorias → confirmación → armado FINALIZADO; reintentar sin completar → botón deshabilitado con el motivo.
- Editar un BORRADOR: debe abrir en el primer paso incompleto; modificar cantidades y guardar cambios.
- Cantidad mayor al stock → error en el paso, «Siguiente» bloqueado y guardar bloqueado con toast.
- Responsive <1024px: panel lateral oculto; stepper scrolleable; stepper y resumen usables.
