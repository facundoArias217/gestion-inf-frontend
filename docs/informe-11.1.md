# Informe de ejecución — Tarjeta 11.1 [FE-mock] Usuarios

**Tarjeta:** 11.1 — Usuarios: listado, alta, edición y baja lógica (frontend)
**Tipo:** [FE-mock] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- **`usuarios-page`** (reemplaza el placeholder del router, ADMIN only): tabs Todos/Activos/Histórico (patrón categorías), columnas Nombre (con marca «(vos)» para el usuario logueado), Email, Rol y Estado, orden persistente (`useOrden('usuarios')`).
- **Dialog de alta/edición** (`usuario-form-dialog.jsx`, ABM simple → modal según convención): nombre, apellido, email, clave (obligatoria en el alta, opcional en la edición — «dejala vacía para mantener la actual») y rol ADMIN/VENDEDOR.
- **Dialog de baja** con confirmación destructiva; la propia fila deshabilita «Dar de baja» si es el usuario logueado (el backend además lo bloquea con 409).
- **`services.js`** con ramas `isIntegrated('usuarios')` contra el contrato de la 11.2: `GET/POST /usuarios`, `PUT /:id`, `PATCH /:id/estado { activo }`. El mock espeja los mensajes del backend ('Ya existe un usuario con ese email', 'No podés desactivar tu propio usuario').
- **`mocks.js`**: los 3 usuarios espejo de los seeds (admin activo, vendedora activa, vendedora inactiva para el Histórico).

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RF-USR-01 | ABM completo de usuarios con roles; ruta ADMIN only (RequireRole). |
| RN-USR-01 | Solo ADMIN/VENDEDOR en el select. |
| RN-PRO-02 / RFN-01/02 | Baja lógica con pestaña Histórico y reactivación idempotente. |
| Guard de auto-baja (11.2) | Deshabilitada en la propia fila + bloqueo real del backend. |

## Verificación

- `npm run lint` y `npm run build` OK.
- Contrato validado en la batería de la 11.2 (18/18): unicidad case-insensitive, clave opcional en edición, login bloqueado tras desactivar, auto-baja 409.

## Checklist manual pendiente

Con ambos servers: crear un usuario, editar sin cambiar clave, desactivarlo, verlo en Histórico y reactivarlo; verificar que «Dar de baja» está deshabilitado sobre vos mismo.
