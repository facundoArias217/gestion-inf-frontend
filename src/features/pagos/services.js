import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { PAGOS_MOCK } from './mocks'
import { listarVentas } from '../ventas/services'

const LATENCIA_MOCK = 400

let pagos = PAGOS_MOCK.map((pago) => ({ ...pago }))

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

async function listarMock() {
  return conLatencia(pagos)
}

async function crearMock({ ventaId, medioPago, monto, resultado, fecha }) {
  const ventas = await listarVentas()
  const venta = ventas.find((v) => v.id === ventaId)
  if (!venta) {
    return errorConLatencia('La venta indicada no existe')
  }
  if (venta.estado !== 'COMPLETADA') {
    return errorConLatencia('Solo se puede cobrar una venta COMPLETADA')
  }

  const ahora = new Date().toISOString()
  const nuevo = {
    id: pagos.length ? Math.max(...pagos.map((p) => p.id)) + 1 : 1,
    ventaId,
    medioPago,
    monto,
    resultado,
    fecha,
    createdAt: ahora,
    updatedAt: ahora,
  }
  pagos.push(nuevo)
  return conLatencia(nuevo)
}

export async function listarPagos() {
  if (isIntegrated('pagos')) {
    const respuesta = await api.get('/pagos')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearPago(datos) {
  if (isIntegrated('pagos')) {
    const respuesta = await api.post('/pagos', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}
