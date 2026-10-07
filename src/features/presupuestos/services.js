import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { PRESUPUESTOS_MOCK } from './mocks'
import { listarClientes } from '../clientes/services'
import { listarProductos } from '../productos/services'
import { listarArmados } from '../armados/services'

const LATENCIA_MOCK = 400

let presupuestos = PRESUPUESTOS_MOCK.map((presupuesto) => ({
  ...presupuesto,
  detalles: presupuesto.detalles.map((detalle) => ({ ...detalle })),
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
  return conLatencia(presupuestos)
}

async function crearMock({ clienteId, fecha, fechaVencimiento, armadoId, detalles }) {
  const clientes = await listarClientes()
  if (!clientes.some((c) => c.id === clienteId)) {
    return errorConLatencia('El cliente indicado no existe')
  }

  if (armadoId != null) {
    const armados = await listarArmados()
    const armado = armados.find((a) => a.id === armadoId)
    if (!armado) {
      return errorConLatencia('El armado indicado no existe')
    }
    if (armado.estado !== 'FINALIZADO') {
      return errorConLatencia(
        'Solo un armado FINALIZADO puede asociarse a un presupuesto',
      )
    }
  }

  if (detalles.length === 0 && armadoId == null) {
    return errorConLatencia(
      'El presupuesto debe tener al menos un producto o un armado',
    )
  }

  if (detalles.length > 0) {
    const productos = await listarProductos()
    for (const detalle of detalles) {
      const producto = productos.find((p) => p.id === detalle.productoId)
      if (!producto) {
        return errorConLatencia(
          `El producto ${detalle.productoId} del detalle no existe`,
        )
      }
    }
  }

  const ahora = new Date().toISOString()
  const nuevo = {
    id: presupuestos.length
      ? Math.max(...presupuestos.map((p) => p.id)) + 1
      : 1,
    clienteId,
    armadoId: armadoId ?? null,
    fecha,
    fechaVencimiento,
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
  presupuestos.push(nuevo)
  return conLatencia(nuevo)
}

function cambiarEstadoMock(id, estado) {
  const presupuesto = presupuestos.find((p) => p.id === id)
  if (!presupuesto) {
    return errorConLatencia('Presupuesto no encontrado')
  }
  if (presupuesto.estado !== 'PENDIENTE') {
    return errorConLatencia(
      'Solo se puede aceptar o rechazar un presupuesto PENDIENTE',
    )
  }

  presupuesto.estado = estado
  presupuesto.updatedAt = new Date().toISOString()
  return conLatencia(presupuesto)
}

export async function listarPresupuestos() {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.get('/presupuestos')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearPresupuesto(datos) {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.post('/presupuestos', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function aceptarPresupuesto(id) {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.patch(`/presupuestos/${id}/estado`, {
      estado: 'ACEPTADO',
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, 'ACEPTADO')
}

export async function rechazarPresupuesto(id) {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.patch(`/presupuestos/${id}/estado`, {
      estado: 'RECHAZADO',
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, 'RECHAZADO')
}
