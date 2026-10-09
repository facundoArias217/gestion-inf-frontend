# gestion-inf-frontend

Frontend del **sistema de gestión para una tienda de productos informáticos**: panel interno con roles **Administrador/Vendedor** para catálogo, compras, ventas, presupuestos con vencimiento, armado de PCs y pagos simulados. Sin e-commerce: el cliente no usa el sistema. Proyecto académico universitario.

## Stack

- **React 19 + Vite** (ES modules)
- **Tailwind CSS 4 + shadcn/ui** con identidad de marca violeta y **modo claro/oscuro**
- **react-hook-form + zod** para formularios
- **React Router 7** con guards por rol

## Levantamiento

Requiere el [backend](https://github.com/facundoArias217/gestion-inf-backend) corriendo en `http://localhost:3001` (ver su README para levantar la base y los seeds).

```bash
npm install
npm run dev        # Vite en http://localhost:5174
```

Usuarios de prueba:

| Email | Clave | Rol |
| --- | --- | --- |
| `admin@tienda.com` | `admin123` | Administrador |
| `vendedor@tienda.com` | `vendedor123` | Vendedor |

La URL de la API se puede sobrescribir con `VITE_API_URL` (default `http://localhost:3001`).

## Módulos

Las 12 pantallas del panel, organizadas por feature en `src/features/`:

| Módulo | Qué hace | Roles |
| --- | --- | --- |
| Dashboard | Métricas operativas: bajo stock, ventas hoy/mes, presupuestos pendientes, compras recientes | Administrador |
| Productos y Categorías | ABM con baja lógica e histórico | Admin gestiona; Vendedor consulta |
| Clientes / Proveedores | ABM con CUIT/CUIL validado, baja lógica e histórico | Vendedor / Administrador |
| Compras | Registro multi-item, confirmación que incrementa stock y cancelación | Administrador |
| Ventas | Registro directo con descuento de stock y cancelación que lo reintegra | Ambos |
| Armá tu PC | Configurador con completitud por categorías obligatorias y advertencias informativas; duplicables como plantilla | Ambos |
| Presupuestos | Cotizaciones con vencimiento y estados; conversión en venta con re-verificación de stock; duplicables con recotización; **imprimibles** | Ambos |
| Pagos | Cobro simulado de ventas COMPLETADAS (medio, monto y resultado) | Ambos |
| Usuarios | ABM con roles, clave y baja lógica (sin auto-baja) | Administrador |

## Migración mock → API

Cada `features/<modulo>/services.js` resuelve en runtime con `isIntegrated('<modulo>')` (`src/config/integration.js`): si el módulo está en el Set llama a la API; si no, responde con los datos de `mocks.js`. **Los 12 módulos están integrados a la API real**; los mocks se conservan como dataset offline para demos sin backend (espejo de los seeds).

## Scripts

```bash
npm run dev       # desarrollo con HMR
npm run build     # build de producción
npm run lint      # ESLint
```

## Convenciones

- Estructura **por features** (`pages/`, `components/`, `services.js`); las llamadas HTTP viven solo en los services vía `src/lib/api.js`.
- Los roles y guards se resuelven en `src/app/guards.jsx`; el menú se filtra por rol en el layout.
- Formularios con `react-hook-form` + `zod`; fechas y moneda formateadas con `src/lib/format.js`.
- Detalles de alcance, reglas de negocio y convenciones de trabajo: ver el `AGENTS.md` y la documentación del repo backend (`docs/brd.md`, `docs/tarjetas.md`).
