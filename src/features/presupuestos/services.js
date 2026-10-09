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

  const productos = await listarProductos()
  const precios = {}
  for (const detalle of detalles) {
    const producto = productos.find((p) => p.id === detalle.productoId)
    if (!producto) {
      return errorConLatencia(
        `El producto ${detalle.productoId} del detalle no existe`,
      )
    }
    precios[detalle.productoId] = producto.precio
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
      precioUnitario: precios[detalle.productoId],
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

async function convertirMock(id) {
  const presupuesto = presupuestos.find((p) => p.id === id)
  if (!presupuesto) {
    return errorConLatencia('Presupuesto no encontrado')
  }
  if (presupuesto.estado !== 'ACEPTADO') {
    return errorConLatencia('Solo se puede convertir un presupuesto ACEPTADO')
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const vigente = presupuesto.fechaVencimiento >= hoy

  const lineas = presupuesto.detalles.map((detalle) => ({
    productoId: detalle.productoId,
    cantidad: detalle.cantidad,
    precioUnitario: vigente ? detalle.precioUnitario : null,
  }))

  if (presupuesto.armadoId != null) {
    const armados = await listarArmados()
    const armado = armados.find((a) => a.id === presupuesto.armadoId)
    if (armado) {
      for (const componente of armado.componentes) {
        lineas.push({
          productoId: componente.productoId,
          cantidad: componente.cantidad,
          precioUnitario: vigente ? componente.precioUnitario : null,
        })
      }
    }
  }

  if (!vigente) {
    const productos = await listarProductos()
    for (const linea of lineas) {
      const producto = productos.find((p) => p.id === linea.productoId)
      linea.precioUnitario = producto ? producto.precio : linea.precioUnitario
    }
  }

  const ahora = new Date().toISOString()
  const venta = {
    id: Math.floor(Math.random() * 900) + 100,
    clienteId: presupuesto.clienteId,
    presupuestoId: presupuesto.id,
    fecha: hoy,
    estado: 'COMPLETADA',
    detalles: lineas.map((linea, i) => ({
      id: i + 1,
      productoId: linea.productoId,
      cantidad: linea.cantidad,
      precioUnitario: linea.precioUnitario,
    })),
    createdAt: ahora,
    updatedAt: ahora,
  }

  presupuesto.estado = 'CONVERTIDO'
  presupuesto.updatedAt = ahora

  return conLatencia({ venta, presupuesto })
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

async function duplicarMock(id) {
  const presupuesto = presupuestos.find((p) => p.id === id)
  if (!presupuesto) {
    return errorConLatencia('Presupuesto no encontrado')
  }
  if (presupuesto.detalles.length === 0 && presupuesto.armadoId == null) {
    return errorConLatencia(
      'El presupuesto no tiene productos ni armado para duplicar',
    )
  }

  const productos = await listarProductos()
  const precios = {}
  for (const detalle of presupuesto.detalles) {
    const producto = productos.find((p) => p.id === detalle.productoId)
    precios[detalle.productoId] = producto ? producto.precio : detalle.precioUnitario
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const vence = new Date(Date.now() + 2 * 86400000)
    .toISOString()
    .slice(0, 10)
  const ahora = new Date().toISOString()

  const nuevo = {
    id: presupuestos.length
      ? Math.max(...presupuestos.map((p) => p.id)) + 1
      : 1,
    clienteId: presupuesto.clienteId,
    armadoId: presupuesto.armadoId,
    fecha: hoy,
    fechaVencimiento: vence,
    estado: 'PENDIENTE',
    detalles: presupuesto.detalles.map((detalle, i) => ({
      id: i + 1,
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioUnitario: precios[detalle.productoId],
    })),
    createdAt: ahora,
    updatedAt: ahora,
  }
  presupuestos.push(nuevo)
  return conLatencia(nuevo)
}

export async function convertirPresupuesto(id) {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.post(`/presupuestos/${id}/convertir`)
    return respuesta.data ?? respuesta
  }
  return convertirMock(id)
}

export async function duplicarPresupuesto(id) {
  if (isIntegrated('presupuestos')) {
    const respuesta = await api.post(`/presupuestos/${id}/duplicar`)
    return respuesta.data ?? respuesta
  }
  return duplicarMock(id)
}
