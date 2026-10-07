import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { ARMADOS_MOCK } from './mocks'
import { listarClientes } from '../clientes/services'
import { listarProductos } from '../productos/services'

const LATENCIA_MOCK = 400

let armados = ARMADOS_MOCK.map((armado) => ({
  ...armado,
  componentes: armado.componentes.map((componente) => ({ ...componente })),
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
  return conLatencia(armados)
}

async function validarComponentes(componentes) {
  if (componentes.length === 0) {
    return 'El armado debe tener al menos un componente'
  }

  const productos = await listarProductos()
  const ids = componentes.map((componente) => componente.productoId)

  const duplicados = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicados.length > 0) {
    return 'No se puede repetir el mismo producto en dos slots'
  }

  for (const componente of componentes) {
    const producto = productos.find((p) => p.id === componente.productoId)
    if (!producto) {
      return `El producto ${componente.productoId} no existe`
    }
    if (componente.cantidad > producto.stock) {
      return `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock})`
    }
  }

  return null
}

async function validarCliente(clienteId) {
  if (clienteId == null) {
    return null
  }

  const clientes = await listarClientes()
  if (!clientes.some((c) => c.id === clienteId)) {
    return 'El cliente indicado no existe'
  }

  return null
}

function encabezadoDe({ nombre, descripcion, clienteId }) {
  return {
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() ?? '',
    clienteId: clienteId ?? null,
  }
}

async function crearMock(datos) {
  if (!datos.nombre || datos.nombre.trim() === '') {
    return errorConLatencia('El nombre del armado es obligatorio')
  }

  const errorCliente = await validarCliente(datos.clienteId)
  if (errorCliente) {
    return errorConLatencia(errorCliente)
  }

  const errorComponentes = await validarComponentes(datos.componentes)
  if (errorComponentes) {
    return errorConLatencia(errorComponentes)
  }

  const productos = await listarProductos()
  const ahora = new Date().toISOString()
  const nuevo = {
    id: armados.length ? Math.max(...armados.map((a) => a.id)) + 1 : 1,
    ...encabezadoDe(datos),
    estado: 'BORRADOR',
    componentes: datos.componentes.map((componente, i) => {
      const producto = productos.find((p) => p.id === componente.productoId)
      return {
        id: i + 1,
        productoId: componente.productoId,
        cantidad: componente.cantidad,
        precioUnitario: producto.precio,
      }
    }),
    createdAt: ahora,
    updatedAt: ahora,
  }
  armados.push(nuevo)
  return conLatencia(nuevo)
}

async function actualizarMock(id, datos) {
  const armado = armados.find((a) => a.id === id)
  if (!armado) {
    return errorConLatencia('Armado no encontrado')
  }
  if (armado.estado !== 'BORRADOR') {
    return errorConLatencia('Solo se puede editar un armado en BORRADOR')
  }

  if (!datos.nombre || datos.nombre.trim() === '') {
    return errorConLatencia('El nombre del armado es obligatorio')
  }

  const errorCliente = await validarCliente(datos.clienteId)
  if (errorCliente) {
    return errorConLatencia(errorCliente)
  }

  const errorComponentes = await validarComponentes(datos.componentes)
  if (errorComponentes) {
    return errorConLatencia(errorComponentes)
  }

  const productos = await listarProductos()
  armado.nombre = datos.nombre.trim()
  armado.descripcion = datos.descripcion?.trim() ?? ''
  armado.clienteId = datos.clienteId ?? null
  armado.componentes = datos.componentes.map((componente, i) => {
    const producto = productos.find((p) => p.id === componente.productoId)
    return {
      id: i + 1,
      productoId: componente.productoId,
      cantidad: componente.cantidad,
      precioUnitario: producto.precio,
    }
  })
  armado.updatedAt = new Date().toISOString()
  return conLatencia(armado)
}

export async function listarArmados() {
  if (isIntegrated('armados')) {
    const respuesta = await api.get('/armados')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearArmado(datos) {
  if (isIntegrated('armados')) {
    const respuesta = await api.post('/armados', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarArmado(id, datos) {
  if (isIntegrated('armados')) {
    const respuesta = await api.put(`/armados/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}
