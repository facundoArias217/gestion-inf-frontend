import { useState } from 'react'

const POR_PAGINA = 10

export function usePaginacion(total, clave) {
  const [estado, setEstado] = useState({ clave, pagina: 1 })

  if (estado.clave !== clave) {
    setEstado({ clave, pagina: 1 })
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const pagina = Math.min(Math.max(1, estado.pagina), totalPaginas)
  const inicio = (pagina - 1) * POR_PAGINA
  const fin = inicio + POR_PAGINA

  return {
    pagina,
    setPagina: (nueva) => setEstado({ clave, pagina: nueva }),
    totalPaginas,
    paginar: (listado) => listado.slice(inicio, fin),
  }
}
