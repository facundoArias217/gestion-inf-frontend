# Informe de ejecución — Tarea B4 / 15.10 [FE] Cobros: diálogo compartido, venta directa y estado de cobro

**Tarea:** B4 del plan FRONT (Fase 2 / comi-rapi) — tarjeta 15.10 [FE] Cobros: diálogo compartido, venta directa y estado de cobro (D3/D9)
**Tipo:** [FE] · **Fecha:** 29/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/cobros`
**Contrato consumido:** 15.9 [BE] Cobros completos + descuento por transferencia (commit local `cc093d1`).

## Alcance ejecutado

- **Diálogo de cobro compartido** (`features/pagos/components/pago-form-dialog.jsx`):
  - Props nuevas: `venta` opcional (bloquea la venta y muestra cliente/total/saldo), `textoCancelar`, defaults para `ventas`/`clientes`.
  - Formulario con `medioPago`, `monto` base y `cuotas` solo para TARJETA (1/3/6/9/12); se eliminaron `resultado` y `fecha`.
  - Vista previa de `montoFinal` con el recargo de cuotas o el descuento por transferencia leídos de `GET /configuracion`; si la config no carga, el backend sigue calculando al confirmar.
  - Validación zod espejo: cuotas obligatorias solo en TARJETA, monto > 0 y monto ≤ saldo antes de llamar a la API; errores de saldo/tope/cuotas se muestran en el campo correspondiente.
  - Al registrar, toast con `montoFinal` y los porcentajes snapshoteados de recargo/descuento.
- **Página Pagos** (`features/pagos/pages/pagos-page.jsx`):
  - Filtro por `estado` (APROBADO/ANULADO) y búsqueda por cliente, medio, cuotas y estado.
  - Columnas nuevas: medio con cuotas, monto final con detalle de base/recargo/descuento y estado del cobro.
  - Alta de cobro desde el diálogo compartido; recarga pagos y ventas al registrar para actualizar saldos.
  - Columna Cliente oculta debajo de `lg` y skeleton con la misma forma.
- **Página Ventas y detalle**:
  - `total`, `saldo` y `estadoCobro` visibles en el listado (badge Cobro y saldo bajo el total) y en el detalle.
  - Acción «Cobrar saldo» en el menú de ventas COMPLETADAS con saldo pendiente; abre el mismo diálogo con la venta fija.
  - El registro de venta directa abre el diálogo al crear la venta; «Cobrar después»/cerrar navega al listado.
  - La cancelación aclara que los cobros APROBADOS pasan a ANULADO.
- **StatusBadge**: variantes para `SIN_COBRAR` (warning), `PARCIAL` (info), `COBRADA` (success) y `ANULADO` (secondary).
- **Servicios y mocks**:
  - `pagos`: contrato 15.9 completo (sin `resultado`, con `cuotas`, `recargo`, `descuentoAplicado`, `montoFinal`, `estado`, `fecha` opcional); `GET /pagos?ventaId=` soportado.
  - `ventas`: mocks con `total`/`saldo`/`estadoCobro`; helpers `registrarVentaMock` y `registrarCobroMock` exportados para que el mock de pagos actualice el saldo sin ciclos de importación.
  - El mock de pagos valida venta COMPLETADA, saldo, cuotas, tope de efectivo acumulado y descuento/recargo; anula visualmente los cobros de ventas CANCELADAS.
  - La cancelación mock deja `saldo = total` y `estadoCobro = SIN_COBRAR`, igual que el backend.

## Decisiones tomadas

1. **Un único diálogo, dos modos.** En Pagos se elige una venta COMPLETADA con saldo; en Ventas/Presupuesto se pasa la venta fija. Evita duplicar formularios y mantiene una sola semántica de cobro (D3).
2. **La venta se cobra después de crearse, no dentro del alta.** El alta sigue siendo transaccional (stock + COMPLETADA) y al volver se abre el cobro; «Cobrar después» deja la venta con `SIN_COBRAR` para cobrarla desde Ventas.
3. **No hay resultado del cobro.** Se quitó APROBADO/RECHAZADO de la UI: un cobro inválido no se crea (mensaje de error) y el único estado posible es APROBADO/ANULADO.
4. **La vista previa no reemplaza al backend.** Se calcula con la config vigente para mostrar el importe esperado, pero el `montoFinal` mostrado en el toast y en el listado es el que devuelve la API.
5. **El saldo es la validación principal del formulario.** Se limita el monto al saldo en cliente y se mapean los 409 de saldo/tope al campo Monto; los 400 de cuotas al campo Cuotas.
6. **Cambio de medio limpia las cuotas.** Al pasar de TARJETA a otro medio se descarta `cuotas` para no enviar un campo prohibido por el contrato.
7. **Mocks con las mismas reglas.** Se replica el tope de efectivo acumulado, el recargo por cuotas y el descuento por transferencia; los cobros de una venta cancelada se muestran ANULADO sin borrar el registro.
8. **Estado de cobro defensivo en el front.** Si un DTO viejo no trae `estadoCobro`, se deriva de `total`/`saldo`; los mocks ya lo traen explícito.

## Verificación

- `npm run lint` OK (sin warnings).
- `npm run build` OK (solo el warning preexistente de tamaño de chunk > 500 kB).
- Contrato 15.9 revisado contra `pago.validator.js`, `pago.serializer.js`, `pago.service.js` y `venta.serializer.js`: campos, fórmulas de `montoFinal`, estados, tope de efectivo y códigos 400/409 coinciden.
- `PagoFormDialog` es el único formulario de cobro del front; no quedan referencias a `resultado` ni a `RECHAZADO` en la UI.

## Checklist manual pendiente

- Vendedor: crear una venta directa → se abre «Registrar cobro» → cobrar el total en efectivo → la venta queda COBRADA y el saldo en 0.
- Vendedor: crear una venta → «Cobrar después» → desde Ventas «Cobrar saldo» → cobro parcial → estado PARCIAL y saldo restante visible.
- Vendedor: segundo cobro por el saldo restante → COBRADA; intentar cobrar de nuevo → no aparece la acción y la API responde «ya está cobrada».
- Tarjeta: 1 y 3 cuotas sin recargo; 6/9/12 con el recargo de Configuración; cambiar a efectivo/transferencia limpia las cuotas.
- Transferencia con `descuentoTransferenciaPct > 0` → la vista previa y el pago muestran base, descuento y monto final.
- Efectivo que supera el tope acumulado de la venta → mensaje en Monto y no se crea el cobro.
- Monto mayor al saldo → error en Monto, sin llamada a la API.
- Cancelar una venta cobrada → stock reintegrado, cobros ANULADO en Pagos, venta CANCELADA con estado de cobro SIN_COBRAR.
- Pagos: filtros APROBADO/ANULADO, búsqueda por cliente/medio/cuotas y columnas responsive; «Registrar cobro» sin ventas con saldo muestra el estado vacío del selector.
- Detalle de venta: total, saldo pendiente y badge de cobro coinciden con el listado.
