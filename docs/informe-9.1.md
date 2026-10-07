# Informe de ejecución — Tarjeta 9.1 [FE-mock] Presupuestos

**Tarjeta:** 9.1 — Presupuestos: creación, detalle y estados con vencimiento (frontend)
**Tipo:** [FE-mock] · **Fecha:** 10/10/2026 · **Repositorio:** gestion-inf-frontend

## Alcance ejecutado

Implementación del frontend del segundo diferenciador del proyecto, sobre datos mock alineados al contrato anticipado de la 9.3:

- **Listado** con Fecha, Cliente, Armado, Total derivado, Vence y Estado, con filtro por estado (Select: Todas/Pendientes/Vencidos/Aceptados/Rechazados/Convertidos) y orden por fecha persistente.
- **Página propia de creación** (`/presupuestos/nuevo`): cliente requerido, productos sueltos multi-item y/o un armado FINALIZADO.
- **Máquina de estados**: Aceptar (directo con toast) y Rechazar (con confirmación destructiva) sobre PENDIENTEs vigentes.
- **Dialog de detalle**: sección del armado con sus componentes y total + tabla de sueltos + total general.
- **Convención de reglas documentadas**: el skill `reglas-de-negocio/SKILL.md` del backend incorporó la sección «Reglas decididas en la implementación» con backfill de la sesión (RFN-01..16), y ambos AGENTS.md ahora exigen documentar cada regla en el momento de decidirla.

## Reglas de negocio cubiertas (algunas nuevas, documentadas en el skill)

| Regla | Implementación |
| --- | --- |
| RN-PRE-01 | El presupuesto pertenece a un cliente (requerido) y lo genera el vendedor logueado (`usuarioId` interno, fuera del DTO). |
| RN-PRE-02 + RFN-13 | **Vencimiento por vigencia**: selector con presets (default **48 h = +2 días**, 7/15/30 días o personalizada); `fechaVencimiento` se **calcula en vivo** y es el dato que viaja en el contrato. El default es parámetro de UX: la decisión «X días» del BRD sigue pendiente. |
| RFN-16 | **VENCIDO computado al render**: un presupuesto con `fechaVencimiento < hoy` y estado PENDIENTE/ACEPTADO se muestra VENCIDO (badge y filtro), sin persistirse. |
| RN-ARM-04 | El select de armado solo ofrece armados **FINALIZADO**. |
| RN-ARM-05 | Los componentes del armado **no se copian** al detalle: el presupuesto referencia `armadoId` y el total del armado se suma al de los sueltos. |
| RFN-15 | Un presupuesto puede llevar **armado y sueltos a la vez**; se exige al menos uno de los dos. |
| RFN-14 | El stock al cotizar es **informativo** (⚠ ámbar por fila, sin bloquear): la verificación dura ocurre al convertir en venta (RN-STK-03). |
| RFN-09 | Solo un PENDIENTE se acepta/rechaza (`Solo se puede aceptar o rechazar un presupuesto PENDIENTE`); CONVERTIDO no es un estado seteable (llega por la conversión, 9.2). |

## Decisiones tomadas

1. **Vigencia computada**: el vendedor elige una vigencia (48 h default) y la fecha de vencimiento se calcula; el dato persistido sigue siendo `fechaVencimiento`. La decisión «X días» del BRD queda pendiente como parámetro, no como regla fija.
2. **VENCIDO no se persiste**: es un estado derivado computado al render; evita un cron o job de vencimiento en el MVP.
3. **Armado + sueltos coexisten** en un presupuesto (al menos uno requerido), con el armado referenciado una sola vez.
4. **Stock informativo al cotizar**: alineado con RN-ARM-03 («puede verificarse al cotizar, debe verificarse al confirmar la venta»); el bloqueo ocurre recién en la conversión (9.2/9.4).

## Verificación

- Script node de validación sobre los mocks: VENCIDO computado (2 presupuestos vencidos detectados), totales derivados (sueltos + armado), estados y validaciones del mock.
- `npm run lint` y `npm run build` OK.
- Los 8 presupuestos mock cubren todos los estados y combinaciones: con armado, armado+sueltos, solo sueltos, vencidos, aceptado (listo para la conversión de la 9.2), rechazado y convertido.

## Checklist manual pendiente

- Crear un presupuesto con armado + un producto suelto → verificar el total sumado y el estado PENDIENTE.
- Aceptar y rechazar presupuestos PENDIENTEs (con y sin vencimiento); probar el bloqueo de acciones sobre vencidos.
- Probar la vigencia: elegir presets y ver la fecha de vencimiento calcularse en vivo; usar Personalizada.
- Cotizar un producto sin stock → advertencia ámbar informativa sin bloquear.
- Filtrar por cada estado y verificar el orden persistente.
