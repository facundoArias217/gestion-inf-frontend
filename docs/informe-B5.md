# Informe de ejecución — Tarea B5 / 15.11 [FE] Presupuestos: «Aceptar y cobrar»

**Tarea:** B5 del plan FRONT (Fase 2 / comi-rapi) — tarjeta 15.11 [FE] Presupuestos: «Aceptar y cobrar» (D8)
**Tipo:** [FE] · **Fecha:** 29/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/aceptar-y-cobrar`
**Contrato consumido:** 15.9 [BE] Cobros completos + descuento por transferencia (commit `cc093d1`), a través del diálogo compartido de la tarea B4/15.10.

## Alcance ejecutado

- **Acción «Aceptar y cobrar»** en presupuestos PENDIENTES vigentes:
  - Ejecuta `PATCH /presupuestos/:id/estado` con ACEPTADO y luego `POST /presupuestos/:id/convertir` en un solo flujo.
  - Al obtener la venta, abre el diálogo compartido de cobro con la venta fija y la opción «Cobrar después».
  - Recarga el listado para reflejar el estado CONVERTIDO; la venta queda COMPLETADA y `SIN_COBRAR` si el usuario decide cobrar después.
  - `procesandoId` deshabilita las acciones de esa fila mientras corre el flujo para evitar dobles disparos.
- **Conversión normal también cierra el circuito:** `ConvertirPresupuestoDialog` acepta `onVentaCreada`; tras confirmar la conversión, además del toast, el listado abre el mismo diálogo de cobro. Así toda venta derivada de presupuesto se cobra con el diálogo único (D3).
- **Manejo de fallos parciales:** si la aceptación funciona y la conversión falla (por ejemplo, stock), se refresca el listado para mostrar el presupuesto ACEPTADO y el usuario puede reintentar con «Convertir en venta».
- **Mocks de conversión:** `convertirMock` usa `registrarVentaMock` de ventas, por lo que la venta mock recibe id secuencial, `total`, `saldo` y `estadoCobro`, queda en el store de ventas y puede cobrarse desde el diálogo o desde la página Pagos en modo offline.

## Decisiones tomadas

1. **Aceptar y cobrar no salta la conversión.** Se ejecutan las dos operaciones existentes en orden (aceptar → convertir); no se agregó un endpoint combinado ni se modificó el contrato del backend.
2. **El cobro es opcional al final del flujo.** El diálogo permite «Cobrar después»; la venta ya está creada y disponible en Ventas, donde se puede cobrar con el mismo diálogo.
3. **También se ofrece cobro tras «Convertir en venta».** La tarjeta pide «Aceptar y cobrar», pero D3 exige que toda venta derivada de presupuesto se cobre con el mismo diálogo; abrirlo también en la conversión normal evita dos experiencias distintas.
4. **Si falla la conversión no se pierde la aceptación.** El presupuesto queda ACEPTADO y visible; no se revierte automáticamente porque la aceptación es una acción válida y el reintento de conversión es explícito.
5. **Sin venta creada no se abre el cobro.** El diálogo solo recibe la venta que devuelve la conversión; no se inventa un saldo ni se permite cobrar el presupuesto directamente.
6. **Mock de conversión reutiliza el alta de ventas.** Evita duplicar totales y mantiene consistencia entre Presupuestos, Ventas y Pagos en modo demo.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (solo el warning preexistente de tamaño de chunk > 500 kB).
- Flujo revisado contra el contrato 15.9: `POST /pagos` se dispara recién con la venta convertida; la conversión devuelve `{ venta, presupuesto }` y el diálogo consume `venta.id`, `total`, `saldo` y `estadoCobro`.
- No quedan llamadas de cobro duplicadas ni formularios alternativos: Presupuestos, Ventas y Pagos usan `PagoFormDialog`.

## Checklist manual pendiente

- Vendedor: presupuesto PENDIENTE vigente → «Aceptar y cobrar» → se acepta, se convierte y se abre el diálogo con el total como saldo.
- Cobrar el total en efectivo → toast con el monto, venta COBRADA y presupuesto CONVERTIDO.
- «Cobrar después» → la venta queda COMPLETADA/SIN_COBRAR, aparece en Ventas con la acción «Cobrar saldo» y el presupuesto sigue CONVERTIDO.
- Presupuesto ACEPTADO → «Convertir en venta» → confirmar → también se abre el diálogo de cobro de la venta creada.
- Conversión con stock insuficiente → error visible; el presupuesto queda ACEPTADO y puede reintentarse.
- Presupuesto vencido o RECHAZADO/CONVERTIDO → no muestra «Aceptar y cobrar».
- Doble clic en «Aceptar y cobrar» → la acción queda deshabilitada mientras procesa y no se duplica la venta.
- Con backend: verificar que cancelar la venta derivada anula sus cobros y que el estado de cobro se refleja igual que en una venta directa.
