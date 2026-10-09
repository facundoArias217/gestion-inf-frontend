# Informe de ejecución — Tarjeta 10.1 [FE-mock] Pagos

**Tarjeta:** 10.1 — Pagos: registro del cobro simulado (frontend)
**Tipo:** [FE-mock] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- **`pagos-page`** (reemplaza el placeholder del router): listado con Fecha, Venta (#id), Cliente, Medio, Monto y Resultado (StatusBadge), filtro por resultado y orden persistente (`useOrden('pagos')`).
- **Dialog de registro** (`pago-form-dialog.jsx`, ABM simple → modal según la convención de la 2.1): select de ventas **COMPLETADA** (muestra #id · cliente · total derivado de la venta), medio (EFECTIVO/TRANSFERENCIA/TARJETA), monto (se precarga con el total derivado de la venta elegida, editable), resultado (APROBADO/RECHAZADO, default APROBADO) y fecha (default hoy). Zod + react-hook-form según convención.
- **`services.js`** con ramas `isIntegrated('pagos')` contra el contrato de la 10.2: `GET /pagos` · `POST /pagos { ventaId, medioPago, monto, resultado, fecha }`. El mock espeja los mensajes del backend ('La venta indicada no existe', 'Solo se puede cobrar una venta COMPLETADA') y valida contra las ventas reales (módulo ya integrado).
- **`mocks.js`**: 4 pagos espejo de los seeds del backend, incluyendo el par RECHAZADO → reintento APROBADO de la venta 2 (1—N, RFN-17).
- Router: `/pagos` con la página real (roles ADMIN+VENDEDOR); `PlaceholderAmbos` eliminado por quedar sin uso.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RF-PAG-01 | Registro del cobro con medio, monto y resultado. |
| RF-PAG-02 | El resultado del cobro queda registrado y visible (badge + filtro). |
| RN-PAG-01/02 | La UI describe la separación Venta↔Pago; el registro no ofrece mutar la venta. |
| RN-PAG-03 | La descripción del dialog lo explicita; ningún flujo de pagos toca stock. |
| RFN-17 | El listado muestra el RECHAZADO y su reintento APROBADO sobre la misma venta sin bloquear nada. |
| RFN-18 | Medios y resultados definitivos en los selects; contratos estrictos. |

## Verificación

- `npm run lint` y `npm run build` OK.
- Mock alineado 1:1 con el contrato del backend (mismos shapes y mensajes de error).
- Contrato validado en la batería de la 10.2 (16/16).

## Checklist manual pendiente

Registrar un cobro desde el navegador sobre una venta COMPLETADA, ver el monto precargarse con el total, registrarlo y verlo en el listado; probar un RECHAZADO y un reintento.
