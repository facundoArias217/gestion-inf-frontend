import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { CATEGORIAS_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let categorias = CATEGORIAS_MOCK.map((categoria) => ({ ...categoria }))

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

function yaExisteNombre(nombre, idExcluir = null) {
  const normalizado = nombre.trim().toLowerCase()
  return categorias.some(
    (categoria) =>
      categoria.id !== idExcluir &&
      categoria.nombre.trim().toLowerCase() === normalizado,
  )
}

function listarMock() {
  return conLatencia(categorias)
}

function crearMock(datos) {
  if (yaExisteNombre(datos.nombre)) {
    return errorConLatencia('Ya existe una categoría con ese nombre')
  }

  const ahora = new Date().toISOString()
  const nueva = {
    id: categorias.length ? Math.max(...categorias.map((c) => c.id)) + 1 : 1,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion?.trim() ?? '',
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  }
  categorias.push(nueva)
  return conLatencia(nueva)
}

function actualizarMock(id, datos) {
  const categoria = categorias.find((c) => c.id === id)
  if (!categoria) {
    return errorConLatencia('Categoría no encontrada')
  }
  if (yaExisteNombre(datos.nombre, id)) {
    return errorConLatencia('Ya existe una categoría con ese nombre')
  }

  categoria.nombre = datos.nombre.trim()
  categoria.descripcion = datos.descripcion?.trim() ?? ''
  categoria.updatedAt = new Date().toISOString()
  return conLatencia(categoria)
}

function bajaMock(id) {
  const categoria = categorias.find((c) => c.id === id)
  if (!categoria) {
    return errorConLatencia('Categoría no encontrada')
  }
  if (!categoria.activo) {
    return errorConLatencia('La categoría ya está dada de baja')
  }

  categoria.activo = false
  categoria.updatedAt = new Date().toISOString()
  return conLatencia(categoria)
}

export async function listarCategorias() {
  if (isIntegrated('categorias')) {
    const respuesta = await api.get('/categorias')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearCategoria(datos) {
  if (isIntegrated('categorias')) {
    const respuesta = await api.post('/categorias', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarCategoria(id, datos) {
  if (isIntegrated('categorias')) {
    const respuesta = await api.put(`/categorias/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}

export async function bajarCategoria(id) {
  if (isIntegrated('categorias')) {
    await api.delete(`/categorias/${id}`)
    return null
  }
  return bajaMock(id)
}
