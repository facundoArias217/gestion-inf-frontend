import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { USUARIOS_FE_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let usuarios = USUARIOS_FE_MOCK.map((usuario) => ({ ...usuario }))

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

function listarMock() {
  return conLatencia(usuarios)
}

function crearMock({ nombre, apellido, email, rol }) {
  const normalizado = email.trim().toLowerCase()
  if (usuarios.some((u) => u.email === normalizado)) {
    return errorConLatencia('Ya existe un usuario con ese email')
  }

  const ahora = new Date().toISOString()
  const nuevo = {
    id: Math.max(...usuarios.map((u) => u.id)) + 1,
    nombre,
    apellido,
    email: normalizado,
    rol,
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  }
  usuarios.push(nuevo)
  return conLatencia(nuevo)
}

function actualizarMock(id, { nombre, apellido, email, rol }) {
  const usuario = usuarios.find((u) => u.id === id)
  if (!usuario) {
    return errorConLatencia('Usuario no encontrado')
  }
  const normalizado = email.trim().toLowerCase()
  if (usuarios.some((u) => u.email === normalizado && u.id !== id)) {
    return errorConLatencia('Ya existe un usuario con ese email')
  }

  Object.assign(usuario, {
    nombre,
    apellido,
    email: normalizado,
    rol,
    updatedAt: new Date().toISOString(),
  })
  return conLatencia(usuario)
}

function cambiarEstadoMock(id, { activo }) {
  const usuario = usuarios.find((u) => u.id === id)
  if (!usuario) {
    return errorConLatencia('Usuario no encontrado')
  }
  if (id === 1 && activo === false) {
    return errorConLatencia('No podés desactivar tu propio usuario')
  }

  usuario.activo = activo
  usuario.updatedAt = new Date().toISOString()
  return conLatencia(usuario)
}

export async function listarUsuarios() {
  if (isIntegrated('usuarios')) {
    const respuesta = await api.get('/usuarios')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearUsuario(datos) {
  if (isIntegrated('usuarios')) {
    const respuesta = await api.post('/usuarios', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarUsuario(id, datos) {
  if (isIntegrated('usuarios')) {
    const respuesta = await api.put(`/usuarios/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}

export async function cambiarEstadoUsuario(id, activo) {
  if (isIntegrated('usuarios')) {
    const respuesta = await api.patch(`/usuarios/${id}/estado`, { activo })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, { activo })
}
