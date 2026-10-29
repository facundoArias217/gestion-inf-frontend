import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

const ANCHOS = ['w-40', 'w-28', 'w-24', 'w-20', 'w-16', 'w-24', 'w-12']

function SkeletonTabla({ columnas = 6, ocultas = [], filas = 4 }) {
  return (
    <>
      {Array.from({ length: filas }).map((_, fila) => (
        <TableRow key={fila}>
          {Array.from({ length: columnas }).map((_, col) => (
            <TableCell
              key={col}
              className={ocultas.includes(col) ? 'hidden lg:table-cell' : undefined}
            >
              {fila === 0 && col === 0 && (
                <span className="sr-only" role="status">
                  Cargando datos…
                </span>
              )}
              <Skeleton className={`h-5 ${ANCHOS[col % ANCHOS.length]}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default SkeletonTabla
