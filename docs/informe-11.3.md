# Informe de ejecución — Tarjeta 11.3 [Int] Usuarios real

**Tarjeta:** 11.3 — Usuarios real (integración frontend ↔ backend)
**Tipo:** [Int] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

- `src/config/integration.js`: el Set incorpora `'usuarios'`. **Módulo 11 completo.**
- Las ramas integradas de `usuarios/services.js` (11.1) pasan a ejecutarse: `GET/POST /usuarios`, `PUT /:id`, `PATCH /:id/estado`.
- `mocks.js` conservado para demos offline.

## Verificación

- `npm run lint` y `npm run build` OK.
- **E2E 5/5 OK** contra la API real con token de ADMIN: login → listar (3 sembrados, uno inactivo para el Histórico) → crear usuario → baja lógica → cleanup con la base restaurada.
- Contrato validado en la batería de la 11.2 (18/18).

## Checklist manual pendiente

Crear, editar y desactivar un usuario desde el navegador; verificar «(vos)» en la propia fila y la opción de baja deshabilitada.
