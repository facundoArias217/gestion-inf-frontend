import { Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

function EmptyState({
  icono: Icono = Inbox,
  titulo,
  descripcion,
  accion,
  onAccion,
}) {
  return (
    <Empty className="gap-4 py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icono className="size-6 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        {descripcion && <EmptyDescription>{descripcion}</EmptyDescription>}
      </EmptyHeader>
      {accion && onAccion && (
        <EmptyContent>
          <Button variant={accion.variant ?? 'default'} onClick={onAccion}>
            {accion.icono && <accion.icono className="size-4" />}
            {accion.label}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

export default EmptyState
