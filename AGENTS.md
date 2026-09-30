# AGENTS.md — gestion-inf-frontend

## Contexto

Frontend del sistema de gestión interna para una tienda de productos informáticos (catálogo, compras, ventas, presupuestos y armados de PC). Panel interno para usuarios con roles **Administrador/Vendedor**; no hay e-commerce ni autogestión del cliente. Fuente de verdad de alcance, pantallas y reglas: `docs/brd.md` del repo backend (si otro doc contradice, gana el BRD).

## Stack

- **React 19 + Vite** (ES modules), JavaScript/JSX, ESLint.
- **Tailwind CSS + shadcn/ui** para estilos y componentes base. Identidad de marca: violeta 600 (`--primary`/`--ring`), gradiente de marca (`--brand-from`/`--brand-to`) y tokens `--chart-1..5` en `src/index.css`.
- Dev: `npm run dev`. Build/verificación: `npm run build` y `npm run lint`.

## Estructura

```
src/
├── app/             (router.jsx: rutas + guards.jsx: ProtectedRoute/RequireRole por rol; providers.jsx: Auth + contexto global)
├── assets/          (imágenes/íconos)
├── config/          (integration.js: set de módulos integrados a la API real)
├── components/      (UI compartida: tabla, modal, botones, formularios)
├── context/         (auth-context.js: AuthContext; auth-context.jsx: AuthProvider con sesión, usuario y rol ADMIN/VENDEDOR)
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
- Formularios con `react-hook-form` + `zod` (componente `form` de shadcn/ui); los tokens de estilos viven en `src/index.css` y los componentes de shadcn en `src/components/ui/` (no editar salvo para extender variantes, ej. `StatusBadge`).
- **UI de ABMs (decisión de la tarjeta 2.1, no re-decidir por módulo):** los ABMs simples de catálogo (categorías, clientes, proveedores, productos, usuarios) se resuelven en **modal Dialog**; las operaciones con detalle multi-item o flujos complejos (compras, ventas, presupuestos, armados) usan **página propia**.
- Llamadas HTTP solo desde los `services.js` de cada feature, siempre a través del cliente de `src/lib/api.js`; nunca usar `fetch` directo en componentes.
- Formateo de fechas/moneda con `src/lib/format.js`.
- Sin comentarios innecesarios; nombres de módulos en español (producto, presupuesto), técnico en inglés (pages, services, hooks).

## Migración mock → API (por módulo)

- Cada `features/<modulo>/services.js` decide en runtime con `isIntegrated('<modulo>')` (desde `src/config/integration.js`): si el módulo está integrado llama a la API, si no responde con los datos mock de `features/<modulo>/mocks.js`.
- `isIntegrated` valida el nombre contra la lista de módulos válidos y lanza un error si es desconocido, para que un typo no deje el módulo en mock silenciosamente.
- El Set de módulos integrados arranca **vacío**: ningún módulo va contra la API real hasta que el backend la exponga. `auth` quedó integrado en su tarjeta 1.3 (login y `/me` con JWT real); el resto se agrega en el commit de su tarjeta de Integración.
- Integrar un módulo = agregarlo al Set de `integration.js` (una línea, en el commit de su tarjeta de Integración). Los `mocks.js` **se conservan** después de integrar: sirven para demos offline; no se eliminan al integrar.
- Al completar la migración de los 12 módulos, evaluar eliminar la indirección (`integration.js` y ramas mock) en un commit final.
- Los mocks respetan el contrato de API (shapes y status codes): ver la skill `reglas-de-negocio` del repo backend y el contrato de la colección Postman.

## Reglas para trabajar acá

- Estructura **por features**: al agregar pantallas o funcionalidades, crear dentro de `src/features/<modulo>/`, no carpetas de tipo archivo globales.
- Roles según el BRD: dashboard, proveedores, compras y usuarios → Administrador; clientes, presupuestos, armados (Armá tu PC), ventas y pagos → Vendedor; productos y categorías → ambos roles (el Vendedor en solo-lectura para armar ventas, el Administrador gestiona). Los guards por rol se resuelven en `src/app/guards.jsx` con `useAuth`.
- No commitear secretos; las variables de entorno se leen con `import.meta.env` (referencia: `VITE_API_URL`).
- Antes de entregar: correr `npm run lint` y `npm run build`.
- Ramas feature (`fe/<modulo>`) con merge directo a `dev`, y luego `dev` a `main` (sin PRs). Base actual del prototipo: `prototipo-front`.
