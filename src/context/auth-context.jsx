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
  const [bienvenida, setBienvenida] = useState(null)

  const login = useCallback((usuario, token) => {
    const nueva = { usuario, token }
    setSesion(nueva)
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva))
    setBienvenida(usuario.nombre)
  }, [])

  const limpiarBienvenida = useCallback(() => setBienvenida(null), [])

  const logout = useCallback(() => {
    setSesion(null)
    localStorage.removeItem(CLAVE_SESION)
  }, [])

  const value = useMemo(() => {
    const rol = sesion?.usuario?.rol ?? null
    return {
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      bienvenida,
      login,
      logout,
      limpiarBienvenida,
      isAdmin: rol === 'ADMIN',
      isVendedor: rol === 'VENDEDOR',
    }
  }, [sesion, bienvenida, login, logout, limpiarBienvenida])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
