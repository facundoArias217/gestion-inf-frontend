import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { CONFIGURACION_MOCK } from '../configuracion/mocks'
import { PAGOS_MOCK } from './mocks'
import { listarVentas, registrarCobroMock } from '../ventas/services'

const LATENCIA_MOCK = 400
const MEDIOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']
const CUOTAS_VALIDAS = [1, 3, 6, 9, 12]

let pagos = PAGOS_MOCK.map((pago) => ({ ...pago }))

function redondear(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100
}

function copiar(dato) {
  if (Array.isArray(dato)) {
    return dato.map((item) => ({ ...item }))
  }
  return dato ? { ...dato } : dato
}

function conLatencia(dato) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(copiar(dato)), LATENCIA_MOCK)
  })
}

function errorConLatencia(mensaje) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(mensaje)), LATENCIA_MOCK)
  })
}

async function listarMock({ ventaId } = {}) {
  const ventas = await listarVentas()
  const ventasPorId = new Map(ventas.map((venta) => [venta.id, venta]))
  const datos = pagos
    .filter((pago) => (ventaId ? pago.ventaId === ventaId : true))
    .map((pago) => ({
      ...pago,
      estado:
        ventasPorId.get(pago.ventaId)?.estado === 'CANCELADA'
          ? 'ANULADO'
          : pago.estado,
    }))
  return conLatencia(datos)
}

async function crearMock({ ventaId, medioPago, monto, cuotas, fecha }) {
  const ventas = await listarVentas()
  const venta = ventas.find((v) => v.id === ventaId)
  if (!venta) {
    return errorConLatencia('La venta indicada no existe')
  }
  if (venta.estado !== 'COMPLETADA') {
    return errorConLatencia('Solo se puede cobrar una venta COMPLETADA')
  }
  if (!MEDIOS.includes(medioPago)) {
    return errorConLatencia('El medio de pago no es válido')
  }

  const montoBase = redondear(monto)
  if (!(montoBase > 0)) {
    return errorConLatencia('El monto debe ser mayor a cero')
  }

  const total = redondear(
    venta.total ??
      venta.detalles.reduce(
        (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
        0,
      ),
  )
  const saldo = redondear(venta.saldo ?? total)
  if (saldo <= 0) {
    return errorConLatencia('La venta ya está cobrada')
  }
  if (montoBase > saldo) {
    return errorConLatencia(
      `El monto supera el saldo de la venta (saldo: ${saldo})`,
    )
  }

  if (medioPago === 'TARJETA') {
    if (!CUOTAS_VALIDAS.includes(cuotas)) {
      return errorConLatencia('"cuotas" debe ser 1, 3, 6, 9 o 12')
    }
  } else if (cuotas != null) {
    return errorConLatencia('"cuotas" solo aplica a TARJETA')
  }

  if (medioPago === 'EFECTIVO') {
    const efectivoAcumulado = redondear(
      pagos
        .filter(
          (pago) =>
            pago.ventaId === ventaId &&
            pago.estado === 'APROBADO' &&
            pago.medioPago === 'EFECTIVO',
        )
        .reduce((acum, pago) => acum + pago.monto, 0),
    )
    if (efectivoAcumulado + montoBase > Number(CONFIGURACION_MOCK.topeEfectivo)) {
      return errorConLatencia(
        `El monto supera el tope de efectivo por venta (tope: ${CONFIGURACION_MOCK.topeEfectivo})`,
      )
    }
  }

  const recargo =
    medioPago === 'TARJETA'
      ? Number(CONFIGURACION_MOCK[`recargoCuota${cuotas}`] ?? 0)
      : 0
  const descuentoAplicado =
    medioPago === 'TRANSFERENCIA'
      ? Number(CONFIGURACION_MOCK.descuentoTransferenciaPct ?? 0)
      : 0
  const montoFinal = redondear(
    montoBase * (1 + recargo / 100) * (1 - descuentoAplicado / 100),
  )

  const ahora = new Date().toISOString()
  const nuevo = {
    id: pagos.length ? Math.max(...pagos.map((p) => p.id)) + 1 : 1,
    ventaId,
    medioPago,
    cuotas: medioPago === 'TARJETA' ? cuotas : null,
    recargo,
    descuentoAplicado,
    monto: montoBase,
    montoFinal,
    estado: 'APROBADO',
    fecha: fecha ?? ahora.slice(0, 10),
    createdAt: ahora,
    updatedAt: ahora,
  }
  pagos.push(nuevo)
  registrarCobroMock(ventaId, montoBase)
  return conLatencia(nuevo)
}

export async function listarPagos({ ventaId } = {}) {
  if (isIntegrated('pagos')) {
    const query = ventaId ? `?ventaId=${ventaId}` : ''
    const respuesta = await api.get(`/pagos${query}`)
    return respuesta.data ?? respuesta
  }
  return listarMock({ ventaId })
}

export async function crearPago(datos) {
  if (isIntegrated('pagos')) {
    const respuesta = await api.post('/pagos', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}
