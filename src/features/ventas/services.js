import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { VENTAS_MOCK } from './mocks'
import { listarClientes } from '../clientes/services'
import { listarProductos } from '../productos/services'

const LATENCIA_MOCK = 400

let ventas = VENTAS_MOCK.map((venta) => ({
  ...venta,
  detalles: venta.detalles.map((detalle) => ({ ...detalle })),
}))

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
  return conLatencia(ventas)
}

async function crearMock({ clienteId, fecha, detalles }) {
  const clientes = await listarClientes()
  if (!clientes.some((c) => c.id === clienteId)) {
    return errorConLatencia('El cliente indicado no existe')
  }

  const productos = await listarProductos()
  for (const detalle of detalles) {
    const producto = productos.find((p) => p.id === detalle.productoId)
    if (!producto) {
      return errorConLatencia(
        `El producto ${detalle.productoId} del detalle no existe`,
      )
    }
    if (detalle.cantidad > producto.stock) {
      return errorConLatencia(
        `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock})`,
      )
    }
  }

  const ahora = new Date().toISOString()
  const nueva = {
    id: ventas.length ? Math.max(...ventas.map((v) => v.id)) + 1 : 1,
    clienteId,
    fecha,
    estado: 'COMPLETADA',
    detalles: detalles.map((detalle, i) => ({
      id: i + 1,
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
    })),
    createdAt: ahora,
    updatedAt: ahora,
  }
  ventas.push(nueva)
  return conLatencia(nueva)
}

function cancelarMock(id) {
  const venta = ventas.find((v) => v.id === id)
  if (!venta) {
    return errorConLatencia('Venta no encontrada')
  }
  if (venta.estado !== 'COMPLETADA') {
    return errorConLatencia('Solo se puede cancelar una venta COMPLETADA')
  }

  venta.estado = 'CANCELADA'
  venta.updatedAt = new Date().toISOString()
  return conLatencia(venta)
}

export async function listarVentas() {
  if (isIntegrated('ventas')) {
    const respuesta = await api.get('/ventas')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearVenta({ clienteId, fecha, detalles }) {
  if (isIntegrated('ventas')) {
    const respuesta = await api.post('/ventas', { clienteId, fecha, detalles })
    return respuesta.data ?? respuesta
  }
  return crearMock({ clienteId, fecha, detalles })
}

export async function cancelarVenta(id) {
  if (isIntegrated('ventas')) {
    const respuesta = await api.patch(`/ventas/${id}/estado`, {
      estado: 'CANCELADA',
    })
    return respuesta.data ?? respuesta
  }
  return cancelarMock(id)
}
