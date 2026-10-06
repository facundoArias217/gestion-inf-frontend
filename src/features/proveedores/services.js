import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { PROVEEDORES_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let proveedores = PROVEEDORES_MOCK.map((proveedor) => ({ ...proveedor }))

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

function yaExisteCuit(cuit, idExcluir = null) {
  return proveedores.some(
    (proveedor) =>
      proveedor.id !== idExcluir && proveedor.cuit === String(cuit).trim(),
  )
}

function listarMock() {
  return conLatencia(proveedores)
}

function crearMock(datos) {
  if (yaExisteCuit(datos.cuit)) {
    return errorConLatencia('Ya existe un proveedor con ese CUIT/CUIL')
  }

  const ahora = new Date().toISOString()
  const nuevo = {
    id: proveedores.length
      ? Math.max(...proveedores.map((p) => p.id)) + 1
      : 1,
    razonSocial: datos.razonSocial.trim(),
    cuit: String(datos.cuit).trim(),
    email: datos.email.trim(),
    telefono: datos.telefono.trim(),
    direccion: datos.direccion.trim(),
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  }
  proveedores.push(nuevo)
  return conLatencia(nuevo)
}

function actualizarMock(id, datos) {
  const proveedor = proveedores.find((p) => p.id === id)
  if (!proveedor) {
    return errorConLatencia('Proveedor no encontrado')
  }
  if (yaExisteCuit(datos.cuit, id)) {
    return errorConLatencia('Ya existe un proveedor con ese CUIT/CUIL')
  }

  proveedor.razonSocial = datos.razonSocial.trim()
  proveedor.cuit = String(datos.cuit).trim()
  proveedor.email = datos.email.trim()
  proveedor.telefono = datos.telefono.trim()
  proveedor.direccion = datos.direccion.trim()
  proveedor.updatedAt = new Date().toISOString()
  return conLatencia(proveedor)
}

function cambiarEstadoMock(id, activo) {
  const proveedor = proveedores.find((p) => p.id === id)
  if (!proveedor) {
    return errorConLatencia('Proveedor no encontrado')
  }

  proveedor.activo = activo
  proveedor.updatedAt = new Date().toISOString()
  return conLatencia(proveedor)
}

export async function listarProveedores() {
  if (isIntegrated('proveedores')) {
    const respuesta = await api.get('/proveedores')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearProveedor(datos) {
  if (isIntegrated('proveedores')) {
    const respuesta = await api.post('/proveedores', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarProveedor(id, datos) {
  if (isIntegrated('proveedores')) {
    const respuesta = await api.put(`/proveedores/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}

export async function bajarProveedor(id) {
  if (isIntegrated('proveedores')) {
    const respuesta = await api.patch(`/proveedores/${id}/estado`, {
      activo: false,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, false)
}

export async function reactivarProveedor(id) {
  if (isIntegrated('proveedores')) {
    const respuesta = await api.patch(`/proveedores/${id}/estado`, {
      activo: true,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, true)
}
