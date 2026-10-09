import { useEffect } from 'react'

export function useDocumentTitle(titulo) {
  useEffect(() => {
    const anterior = document.title
    document.title = `${titulo} · Gestión Informática`
    return () => {
      document.title = anterior
    }
  }, [titulo])
}
