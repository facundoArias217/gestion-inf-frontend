import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { normalizar } from '@/lib/busqueda'
import { cn } from 'cn'

function ComboboxBuscable({
  items,
  valor,
  onValorChange,
  placeholder = 'Buscar…',
  textoTrigger = 'Seleccioná…',
  textoVacio = 'No se encontraron resultados para tu búsqueda',
  labelDe,
  gruposDe,
  renderItem,
  className,
}) {
  const [abierto, setAbierto] = useState(false)

  const seleccionado = items.find((item) => item.valor === valor)

  const grupos = useMemo(() => {
    const porGrupo = new Map()
    for (const item of items) {
      const titulo = gruposDe ? gruposDe(item) ?? '' : ''
      if (!porGrupo.has(titulo)) {
        porGrupo.set(titulo, [])
      }
      porGrupo.get(titulo).push(item)
    }
    return [...porGrupo.entries()]
  }, [items, gruposDe])

  const etiquetaDe = (item) => (labelDe ? labelDe(item) : item.label)

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={abierto}
          className={cn('w-full justify-between font-normal sm:w-48', className)}
        >
          <span className="truncate">
            {seleccionado ? etiquetaDe(seleccionado) : textoTrigger}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{textoVacio}</CommandEmpty>
            {grupos.map(([titulo, itemsDelGrupo]) => (
              <CommandGroup
                key={titulo || 'sin-grupo'}
                heading={titulo || undefined}
              >
                {itemsDelGrupo.map((item) => (
                  <CommandItem
                    key={item.valor}
                    value={normalizar(`${etiquetaDe(item)} ${item.keywords ?? ''}`)}
                    disabled={item.deshabilitado}
                    onSelect={() => {
                      onValorChange(item.valor === valor ? valor : item.valor)
                      setAbierto(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        valor === item.valor ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {renderItem ? renderItem(item) : etiquetaDe(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ComboboxBuscable
