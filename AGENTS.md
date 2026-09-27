# AGENTS.md — gestion-inf-frontend

## Contexto

Frontend del sistema de gestión interna para una tienda de productos informáticos (catálogo, compras, ventas, presupuestos y armados de PC). Panel interno para usuarios con roles **Administrador/Vendedor**; no hay e-commerce ni autogestión del cliente. Fuente de verdad de alcance, pantallas y reglas: `docs/brd.md` del repo backend (si otro doc contradice, gana el BRD).

## Stack

- **React 19 + Vite** (ES modules), JavaScript/JSX, ESLint.
- Dev: `npm run dev`. Build/verificación: `npm run build` y `npm run lint`. Pendiente instalar: `react-router-dom`.

## Estructura

```
src/
├── app/             (router.jsx: rutas + guards por rol; providers.jsx: Auth + contexto global)
├── assets/          (imágenes/íconos)
├── components/      (UI compartida: tabla, modal, botones, formularios)
├── context/         (auth-context.jsx: sesión, usuario y rol ADMIN/VENDEDOR)
├── hooks/           (use-auth.js)
├── layouts/         (dashboard-layout.jsx: shell del panel con menú por rol)
├── lib/             (api.js: cliente HTTP; format.js: fechas y moneda)
└── features/        (12 módulos = pantallas del BRD)
    ├── auth/        (Login — RF-AUT-01)
    ├── dashboard/   (RF-DSH-01, admin)
    ├── productos/   (RF-PRO-01/02/03, admin)
    ├── categorias/  (RF-PRO-02, admin)
    ├── clientes/    (RF-CLI-01, vendedor)
    ├── proveedores/ (RF-PROV-01, admin)
    ├── compras/     (RF-COM-01/02/03, admin)
    ├── ventas/      (RF-VTA-01/02/03, vendedor)
    ├── presupuestos/(RF-PRE-01/02/03, vendedor)
    ├── armados/     (RF-ARM-01/02, vendedor)
    ├── pagos/       (RF-PAG-01/02, vendedor)
    └── usuarios/    (RF-USR-01, admin)
```

Cada feature contiene: `pages/` (listado, detalle/edición), `components/` (componentes propios del módulo) y `services.js` (llamadas a la API del módulo).

## Convenciones de código

- Componentes como funciones con hooks; un componente por archivo, export default.
- Estado local con `useState`; sesión y rol en `auth-context.jsx` (consumir con el hook `useAuth`).
- Llamadas HTTP solo desde los `services.js` de cada feature, siempre a través del cliente de `src/lib/api.js`; nunca usar `fetch` directo en componentes.
- Formateo de fechas/moneda con `src/lib/format.js`.
- Sin comentarios innecesarios; nombres de módulos en español (producto, presupuesto), técnico en inglés (pages, services, hooks).

## Reglas para trabajar acá

- Estructura **por features**: al agregar pantallas o funcionalidades, crear dentro de `src/features/<modulo>/`, no carpetas de tipo archivo globales.
- Roles según el BRD: dashboard, productos, categorías, proveedores, compras y usuarios → Administrador; clientes, presupuestos, armados, ventas y pagos → Vendedor (el admin puede todo). Los guards por rol se resuelven en `src/app/router.jsx` con `useAuth`.
- No commitear secretos; las variables de entorno se leen con `import.meta.env` (referencia: `VITE_API_URL`).
- Antes de entregar: correr `npm run lint` y `npm run build`.
- Trabajar sobre la rama `estructura-carpetas` (o la vigente).
