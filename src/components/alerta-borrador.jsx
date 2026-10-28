import { FileClock } from 'lucide-react'

import { Button } from '@/components/ui/button'

function AlertaBorrador({ onRecuperar, onDescartar }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/60 dark:bg-amber-950/40"
    >
      <div className="flex items-start gap-3">
        <FileClock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />
        <div>
          <p className="text-sm font-medium">
            Hay un borrador sin terminar de esta pantalla
          </p>
          <p className="text-sm text-muted-foreground">
            Quedó guardado en este navegador. Podés recuperarlo y seguir donde
            estabas, o descartarlo.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDescartar}
        >
          Descartar
        </Button>
        <Button type="button" size="sm" onClick={onRecuperar}>
          Recuperar borrador
        </Button>
      </div>
    </div>
  )
}

export default AlertaBorrador
