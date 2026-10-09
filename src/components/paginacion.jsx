import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

function Paginacion({ pagina, totalPaginas, onPaginaChange }) {
  if (totalPaginas <= 1) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-between gap-2 pt-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={pagina === 1}
          onClick={() => onPaginaChange(pagina - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: totalPaginas }, (_, i) => (
          <Button
            key={i}
            variant={i + 1 === pagina ? 'default' : 'outline'}
            size="icon"
            className="size-8 text-xs tabular-nums"
            onClick={() => onPaginaChange(i + 1)}
            aria-label={`Página ${i + 1}`}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={pagina === totalPaginas}
          onClick={() => onPaginaChange(pagina + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default Paginacion
