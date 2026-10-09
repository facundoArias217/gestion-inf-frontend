import { useCallback, useEffect, useState } from 'react'

const CLAVE_TEMA = 'gestion-inf-tema'

function temaInicial() {
  const guardado = localStorage.getItem(CLAVE_TEMA)
  if (guardado === 'oscuro' || guardado === 'claro') {
    return guardado
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'oscuro'
    : 'claro'
}

export function useTheme() {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    localStorage.setItem(CLAVE_TEMA, tema)
  }, [tema])

  const alternar = useCallback(() => {
    setTema((actual) => (actual === 'oscuro' ? 'claro' : 'oscuro'))
  }, [])

  return { tema, alternar }
}
