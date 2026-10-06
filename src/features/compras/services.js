import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { COMPRAS_MOCK } from './mocks'
import { listarProveedores } from '../proveedores/services'
import { listarProductos } from '../productos/services'

const LATENCIA_MOCK = 400

let compras = COMPRAS_MOCK.map((compra) => ({
  ...compra,
  detalles: compra.detalles.map((detalle) => ({ ...detalle })),
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
  return conLatencia(compras)
}

async function crearMock({ proveedorId, fecha, detalles }) {
  const proveedores = await listarProveedores()
  if (!proveedores.some((p) => p.id === proveedorId)) {
    return errorConLatencia('El proveedor indicado no existe')
  }

  const productos = await listarProductos()
  const ids = detalles.map((detalle) => detalle.productoId)
  if (ids.some((id) => !productos.some((p) => p.id === id))) {
    return errorConLatencia('Hay productos inexistentes en el detalle')
  }

  if (detalles.length === 0) {
    return errorConLatencia('La compra debe tener al menos un producto')
  }

  const ahora = new Date().toISOString()
  const nueva = {
    id: compras.length ? Math.max(...compras.map((c) => c.id)) + 1 : 1,
    proveedorId,
    fecha,
    estado: 'PENDIENTE',
    detalles: detalles.map((detalle, i) => ({
      id: i + 1,
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
    })),
    createdAt: ahora,
    updatedAt: ahora,
  }
  compras.push(nueva)
  return conLatencia(nueva)
}

function cambiarEstadoMock(id, estado) {
  const compra = compras.find((c) => c.id === id)
  if (!compra) {
    return errorConLatencia('Compra no encontrada')
  }
  if (compra.estado !== 'PENDIENTE') {
    return errorConLatencia(
      'Solo se puede confirmar o cancelar una compra PENDIENTE',
    )
  }

  compra.estado = estado
  compra.updatedAt = new Date().toISOString()
  return conLatencia(compra)
}

export async function listarCompras() {
  if (isIntegrated('compras')) {
    const respuesta = await api.get('/compras')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearCompra({ proveedorId, fecha, detalles }) {
  if (isIntegrated('compras')) {
    const respuesta = await api.post('/compras', { proveedorId, fecha, detalles })
    return respuesta.data ?? respuesta
  }
  return crearMock({ proveedorId, fecha, detalles })
}

export async function confirmarCompra(id) {
  if (isIntegrated('compras')) {
    const respuesta = await api.patch(`/compras/${id}/estado`, {
      estado: 'COMPLETADA',
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, 'COMPLETADA')
}

export async function cancelarCompra(id) {
  if (isIntegrated('compras')) {
    const respuesta = await api.patch(`/compras/${id}/estado`, {
      estado: 'CANCELADA',
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, 'CANCELADA')
}
