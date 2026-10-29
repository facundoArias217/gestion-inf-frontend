import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { CONFIGURACION_MOCK } from './mocks'

const LATENCIA_MOCK = 400

let configuracion = { ...CONFIGURACION_MOCK }

function conLatencia(dato) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...dato }), LATENCIA_MOCK)
  })
}

export async function obtenerConfiguracion() {
  if (isIntegrated('configuracion')) {
    const respuesta = await api.get('/configuracion')
    return respuesta.data ?? respuesta
  }
  return conLatencia(configuracion)
}

export async function actualizarConfiguracion(datos) {
  if (isIntegrated('configuracion')) {
    const respuesta = await api.put('/configuracion', datos)
    return respuesta.data ?? respuesta
  }

  configuracion = { ...configuracion, ...datos }
  return conLatencia(configuracion)
}
