# Informe de ejecución — Tarjeta 8.4 [Int] Armados

**Tarjeta:** 8.4 — Armados real (integración frontend ↔ backend)
**Tipo:** [Int] · **Fecha:** 10/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

Integración del módulo de armados contra la API real, cerrando el flujo de punta a punta del primer diferenciador del proyecto:

- `src/config/integration.js` → el Set de módulos integrados incorpora `'armados'` (junto a `auth`, `categorias`, `productos`, `clientes`, `proveedores`, `compras` y `ventas`).
- Las ramas integradas de `armados/services.js` (escritas en las tarjetas 8.1/8.2 contra el contrato final) pasan a ejecutarse: `GET /armados`, `POST /armados`, `PUT /armados/:id` y `PATCH /armados/:id/estado`.
- `mocks.js` se conserva intacto para demos offline (convención de la migración por módulos).
- Este es el primer commit que crea la carpeta `docs/` en el frontend.

## Verificación

- `npm run lint` y `npm run build` OK.
- Batería del backend re-verificada en la 8.3: **26/26 pruebas OK** (creación, edición, finalización con completitud bloqueante, RN-STK-01, roles, errores 400/404/409).
- Smoke check contra la API real con token de VENDEDOR: 6 armados con componentes embebidos, incluidos los 3 FINALIZADO congelados.
- **Flujo del diferenciador verificado end-to-end**: crear un armado desde el navegador → BORRADOR en la base de datos; editarlo (PUT con reemplazo transaccional de componentes); finalizar «Armado a medias» → 409 del backend con las faltantes exactas (`Motherboard, Memoria RAM, Almacenamiento, Fuente`); finalizar «Configuración pendiente de González» → el backend responde `Armado finalizado` aunque el motor de advertencias del frontend muestre la incompatibilidad socket (RN-ARM-02: advertir sin impedir).

## Decisiones tomadas

1. Las **advertencias de incompatibilidad** (motor de keywords sobre nombre/descripción: socket, tipo de RAM, GPU ausente, stock informativo) permanecen como lógica del frontend; el backend solo bloquea completitud y estado. Esto respeta RN-ARM-02 (informativa, no bloqueante) y evita duplicar reglas de presentación en la API.
2. El mock se conserva para que el módulo pueda demostrarse offline sin tocar código.

## Checklist manual pendiente

Con ambos servers levantados (`npm run dev` en cada repo):

1. Login con cualquier rol → «Armá tu PC» muestra los **6 armados reales** de la base de datos (3 FINALIZADO congelados sin acciones de edición).
2. Crear un armado completo → verificar en el listado que aparece en BORRADOR con el total correcto.
3. Editar un BORRADOR → agregar un componente → guardar → el detalle refleja el cambio (PUT con reemplazo).
4. Intentar finalizar «Armado a medias» → el botón se bloquea con las 4 faltantes; forzar por API devuelve 409.
5. Finalizar «Configuración pendiente de González» → la advertencia de socket (LGA1700 vs AM4) aparece en el diálogo **pero no impide finalizar**.
6. En el configurador, elegir B550 + Ryzen 5 7600 → advertencia de socket en vivo al instante (motor de compatibilidad).
