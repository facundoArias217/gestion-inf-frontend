import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { TableHead } from '@/components/ui/table'

function TableHeadOrdenable({
  orden,
  onOrdenChange,
  campo,
  children,
  className,
}) {
  const activo = orden.startsWith(`${campo}-`)
  const ascendente = orden === `${campo}-asc`

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() =>
          onOrdenChange(ascendente ? `${campo}-desc` : `${campo}-asc`)
        }
        className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
          activo ? 'text-foreground' : 'text-muted-foreground'
        }`}
        aria-label={`Ordenar por ${children}`}
      >
        {children}
        {activo ? (
          ascendente ? (
            <ArrowUp className="size-3.5 shrink-0" />
          ) : (
            <ArrowDown className="size-3.5 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

export default TableHeadOrdenable
