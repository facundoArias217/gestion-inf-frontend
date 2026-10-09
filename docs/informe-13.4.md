# Informe de ejecución — Tarjeta 13.4 [FE] Presupuesto imprimible

**Tarjeta:** 13.4 — Presupuesto imprimible (ruta A4 con @media print)
**Tipo:** [FE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-frontend · **Rama:** `fe/presupuesto-imprimible`

## Alcance ejecutado

El entregable físico del diferenciador: el vendedor puede entregarle al cliente la cotización impresa.

- **Ruta nueva** `/presupuestos/:id/imprimir` (ADMIN+VENDEDOR) con `PresupuestoImprimiblePage`: hoja de cotización tamaño A4 con:
  - **Header con gradiente de marca** + datos de la tienda (desde `src/config/tienda.js`, placeholders editables) + «Presupuesto #N», fecha de emisión y **«Válido hasta {fechaVencimiento}»** (formato local de la 13.1).
  - Bloque de cliente (nombre, email, teléfono), **sección del armado** con sus componentes desglosados (RN-ARM-05: no se duplican), tabla de productos sueltos, **total estimado** derivado y footer con «Atendido por {usuario logueado}», estado y la nota de validez/recotización (RN-PRE-03).
- **Impresión automática** (`window.print()` a los 400 ms de cargar) + botón Imprimir; navegación de vuelta al listado.
- **`print:hidden` en el shell** (sidebar y navbar del layout) + `print:p-0`/`print:bg-white` en el contenedor: al imprimir solo sale la hoja. Botones de la página también ocultos en print.
- **Entrada:** acción «Imprimir» en el dropdown de presupuestos, disponible en **cualquier estado** (una cotización CONVERTIDA puede reimprimirse como comprobante).
- **Sin dependencias nuevas**: CSS print de Tailwind + window.print (el «PDF» sale del diálogo de impresión del navegador).

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-02 | El vencimiento figura destacado en el header y en la nota de validez. |
| RN-PRE-03 | La nota advierte que vencido exige recotización. |
| RN-ARM-05 | El armado se lista con sus componentes como sección propia, sin copiarlos al detalle. |

## Verificación

- `npm run lint` y `npm run build` OK.
- La página resuelve el presupuesto por `:id` desde los servicios (integrados o mocks: funciona en ambos modos) y redirige con toast si no existe.

## Checklist manual pendiente

Imprimir un presupuesto con armado + sueltos desde el navegador (acción Imprimir del listado), verificar el diálogo de impresión con solo la hoja visible, y «Guardar como PDF».
