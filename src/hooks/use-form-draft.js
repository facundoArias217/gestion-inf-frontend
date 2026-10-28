import { useCallback, useRef, useState } from 'react'

const PREFIJO = 'gestion-inf-borrador-'

function leer(claveCompleta) {
  try {
    const guardado = sessionStorage.getItem(claveCompleta)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export function revivirNumeros(valor) {
  if (Array.isArray(valor)) {
    return valor.map(revivirNumeros)
  }
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, dato]) => [
        clave,
        revivirNumeros(dato),
      ]),
    )
  }
  return valor === null ? NaN : valor
}

export function useFormDraft(clave, { estaVacio } = {}) {
  const claveCompleta = PREFIJO + clave

  const [hayBorrador, setHayBorrador] = useState(() => {
    try {
      return sessionStorage.getItem(claveCompleta) != null
    } catch {
      return false
    }
  })

  const avisoPendienteRef = useRef(hayBorrador)

  const guardar = useCallback(
    (valor) => {
      try {
        if (!valor || (estaVacio ? estaVacio(valor) : false)) {
          if (!avisoPendienteRef.current) {
            sessionStorage.removeItem(claveCompleta)
          }
          return
        }
        sessionStorage.setItem(claveCompleta, JSON.stringify(valor))
      } catch {
        /* almacenamiento no disponible */
      }
    },
    [claveCompleta, estaVacio],
  )

  const recuperar = useCallback(() => {
    avisoPendienteRef.current = false
    setHayBorrador(false)
    return leer(claveCompleta)
  }, [claveCompleta])

  const limpiar = useCallback(() => {
    avisoPendienteRef.current = false
    try {
      sessionStorage.removeItem(claveCompleta)
    } catch {
      /* almacenamiento no disponible */
    }
    setHayBorrador(false)
  }, [claveCompleta])

  return { hayBorrador, guardar, recuperar, limpiar }
}
