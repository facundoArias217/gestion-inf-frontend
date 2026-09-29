import { api } from '../../lib/api'
import { isIntegrated } from '../../config/integration'
import { USUARIOS_MOCK } from './mocks'

const LATENCIA_MOCK = 500

function loginMock({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuario = USUARIOS_MOCK.find(
        (u) =>
          u.email === email.trim().toLowerCase() &&
          u.password === password &&
          u.activo,
      )

      if (!usuario) {
        reject(new Error('Credenciales inválidas'))
        return
      }

      const usuarioSinPassword = { ...usuario }
      delete usuarioSinPassword.password
      resolve({
        token: `mock-token-${usuario.rol.toLowerCase()}-${usuario.id}`,
        usuario: usuarioSinPassword,
      })
    }, LATENCIA_MOCK)
  })
}

export async function login(credentials) {
  if (isIntegrated('auth')) {
    const respuesta = await api.post('/auth/login', credentials)
    return respuesta.data ?? respuesta
  }
  return loginMock(credentials)
}
