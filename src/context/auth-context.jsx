import { useCallback, useMemo, useState } from 'react'

import { AuthContext } from './auth-context.js'

const CLAVE_SESION = 'gestion-inf-session'

function leerSesion() {
  try {
    const cruda = localStorage.getItem(CLAVE_SESION)
    return cruda ? JSON.parse(cruda) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)

  const login = useCallback((usuario, token) => {
    const nueva = { usuario, token }
    setSesion(nueva)
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva))
  }, [])

  const logout = useCallback(() => {
    setSesion(null)
    localStorage.removeItem(CLAVE_SESION)
  }, [])

  const value = useMemo(() => {
    const rol = sesion?.usuario?.rol ?? null
    return {
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      login,
      logout,
      isAdmin: rol === 'ADMIN',
      isVendedor: rol === 'VENDEDOR',
    }
  }, [sesion, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
