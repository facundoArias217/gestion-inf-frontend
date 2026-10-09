import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { DASHBOARD_MOCK } from './mocks'

const LATENCIA_MOCK = 400

function obtenerMock() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(DASHBOARD_MOCK), LATENCIA_MOCK)
  })
}

export async function obtenerDashboard() {
  if (isIntegrated('dashboard')) {
    const respuesta = await api.get('/dashboard')
    return respuesta.data ?? respuesta
  }
  return obtenerMock()
}
