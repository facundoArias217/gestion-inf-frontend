import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { CLIENTES_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let clientes = CLIENTES_MOCK.map((cliente) => ({ ...cliente }))

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

function yaExisteCuil(cuil, idExcluir = null) {
  return clientes.some(
    (cliente) =>
      cliente.id !== idExcluir && cliente.cuil === String(cuil).trim(),
  )
}

function listarMock() {
  return conLatencia(clientes)
}

function crearMock(datos) {
  if (yaExisteCuil(datos.cuil)) {
    return errorConLatencia('Ya existe un cliente con ese CUIT/CUIL')
  }

  const ahora = new Date().toISOString()
  const nuevo = {
    id: clientes.length ? Math.max(...clientes.map((c) => c.id)) + 1 : 1,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    cuil: String(datos.cuil).trim(),
    email: datos.email.trim(),
    telefono: datos.telefono.trim(),
    direccion: datos.direccion.trim(),
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  }
  clientes.push(nuevo)
  return conLatencia(nuevo)
}

function actualizarMock(id, datos) {
  const cliente = clientes.find((c) => c.id === id)
  if (!cliente) {
    return errorConLatencia('Cliente no encontrado')
  }
  if (yaExisteCuil(datos.cuil, id)) {
    return errorConLatencia('Ya existe un cliente con ese CUIT/CUIL')
  }

  cliente.nombre = datos.nombre.trim()
  cliente.apellido = datos.apellido.trim()
  cliente.cuil = String(datos.cuil).trim()
  cliente.email = datos.email.trim()
  cliente.telefono = datos.telefono.trim()
  cliente.direccion = datos.direccion.trim()
  cliente.updatedAt = new Date().toISOString()
  return conLatencia(cliente)
}

function cambiarEstadoMock(id, activo) {
  const cliente = clientes.find((c) => c.id === id)
  if (!cliente) {
    return errorConLatencia('Cliente no encontrado')
  }

  cliente.activo = activo
  cliente.updatedAt = new Date().toISOString()
  return conLatencia(cliente)
}

export async function listarClientes() {
  if (isIntegrated('clientes')) {
    const respuesta = await api.get('/clientes')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearCliente(datos) {
  if (isIntegrated('clientes')) {
    const respuesta = await api.post('/clientes', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarCliente(id, datos) {
  if (isIntegrated('clientes')) {
    const respuesta = await api.put(`/clientes/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}

export async function bajarCliente(id) {
  if (isIntegrated('clientes')) {
    const respuesta = await api.patch(`/clientes/${id}/estado`, {
      activo: false,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, false)
}

export async function reactivarCliente(id) {
  if (isIntegrated('clientes')) {
    const respuesta = await api.patch(`/clientes/${id}/estado`, {
      activo: true,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, true)
}
