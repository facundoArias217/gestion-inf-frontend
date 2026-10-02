import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { PRODUCTOS_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let productos = PRODUCTOS_MOCK.map((producto) => ({ ...producto }))

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
  return conLatencia(productos)
}

function crearMock(datos) {
  const ahora = new Date().toISOString()
  const nuevo = {
    id: productos.length ? Math.max(...productos.map((p) => p.id)) + 1 : 1,
    nombre: datos.nombre.trim(),
    marca: datos.marca.trim(),
    descripcion: datos.descripcion?.trim() ?? '',
    precio: datos.precio,
    stock: datos.stock,
    categoriaId: datos.categoriaId,
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  }
  productos.push(nuevo)
  return conLatencia(nuevo)
}

function actualizarMock(id, datos) {
  const producto = productos.find((p) => p.id === id)
  if (!producto) {
    return errorConLatencia('Producto no encontrado')
  }

  producto.nombre = datos.nombre.trim()
  producto.marca = datos.marca.trim()
  producto.descripcion = datos.descripcion?.trim() ?? ''
  producto.precio = datos.precio
  producto.stock = datos.stock
  producto.categoriaId = datos.categoriaId
  producto.updatedAt = new Date().toISOString()
  return conLatencia(producto)
}

function cambiarEstadoMock(id, activo) {
  const producto = productos.find((p) => p.id === id)
  if (!producto) {
    return errorConLatencia('Producto no encontrado')
  }

  producto.activo = activo
  producto.updatedAt = new Date().toISOString()
  return conLatencia(producto)
}

export async function listarProductos() {
  if (isIntegrated('productos')) {
    const respuesta = await api.get('/productos')
    return respuesta.data ?? respuesta
  }
  return listarMock()
}

export async function crearProducto(datos) {
  if (isIntegrated('productos')) {
    const respuesta = await api.post('/productos', datos)
    return respuesta.data ?? respuesta
  }
  return crearMock(datos)
}

export async function actualizarProducto(id, datos) {
  if (isIntegrated('productos')) {
    const respuesta = await api.put(`/productos/${id}`, datos)
    return respuesta.data ?? respuesta
  }
  return actualizarMock(id, datos)
}

export async function bajarProducto(id) {
  if (isIntegrated('productos')) {
    const respuesta = await api.patch(`/productos/${id}/estado`, {
      activo: false,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, false)
}

export async function reactivarProducto(id) {
  if (isIntegrated('productos')) {
    const respuesta = await api.patch(`/productos/${id}/estado`, {
      activo: true,
    })
    return respuesta.data ?? respuesta
  }
  return cambiarEstadoMock(id, true)
}
