import { useCallback, useEffect, useMemo, useState } from 'react'

import { me } from '../features/auth/services'
import { setToken } from '../lib/api'
import { AuthContext } from './auth-context'

const CLAVE_SESION = 'gestion-inf-session'

function leerSesion() {
  try {
    const cruda = localStorage.getItem(CLAVE_SESION)
    return cruda ? JSON.parse(cruda) : null
  } catch {
    return null
  }
}

function guardarSesion(sesion) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)
  const [bienvenida, setBienvenida] = useState(null)

  const login = useCallback((usuario, token) => {
    const nueva = { usuario, token }
    setSesion(nueva)
    guardarSesion(nueva)
    setToken(token)
    setBienvenida(usuario.nombre)
  }, [])

  const logout = useCallback(() => {
    setSesion(null)
    localStorage.removeItem(CLAVE_SESION)
    setToken(null)
  }, [])

  const limpiarBienvenida = useCallback(() => setBienvenida(null), [])

  useEffect(() => {
    if (!sesion?.token) {
      return
    }
    setToken(sesion.token)

    let cancelado = false
    me(sesion.token)
      .then((usuario) => {
        if (cancelado || !usuario) {
          return
        }
        const nueva = { usuario, token: sesion.token }
        setSesion(nueva)
        guardarSesion(nueva)
      })
      .catch(() => {
        if (cancelado) {
          return
        }
        setToken(null)
        setSesion(null)
        localStorage.removeItem(CLAVE_SESION)
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
