import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function Buscador({
  valor,
  onValorChange,
  placeholder = 'Buscar…',
  variante = 'expansivo',
}) {
  const [abierto, setAbierto] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (abierto) {
      inputRef.current?.focus()
    }
  }, [abierto])

  const limpiar = () => {
    onValorChange('')
    inputRef.current?.focus()
  }

  if (variante === 'input') {
    return (
      <div className="relative w-full sm:w-56">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={valor}
          onChange={(event) => onValorChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onValorChange('')
            }
          }}
          placeholder={placeholder}
          className="pr-8 pl-8"
          aria-label={placeholder}
        />
        {valor && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2 rounded-full"
            onClick={limpiar}
            aria-label="Limpiar búsqueda"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full justify-end sm:w-auto">
      {abierto ? (
        <div
          className="flex h-9 w-full items-center gap-2 rounded-full border border-input bg-background pr-1.5 pl-3 transition-all sm:w-64"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setAbierto(false)
            }
          }}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={valor}
            onChange={(event) => onValorChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setAbierto(false)
              }
            }}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full"
            onClick={() => {
              if (valor) {
                limpiar()
              } else {
                setAbierto(false)
              }
            }}
            aria-label={valor ? 'Limpiar búsqueda' : 'Cerrar búsqueda'}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-9 shrink-0 rounded-full"
          onClick={() => setAbierto(true)}
          aria-label="Abrir búsqueda"
        >
          <Search className="size-4" />
          {valor && (
            <span
              className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </Button>
      )}
    </div>
  )
}

export default Buscador
