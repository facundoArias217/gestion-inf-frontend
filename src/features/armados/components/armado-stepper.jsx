import { CheckCircle2, CircleDot, ClipboardList } from 'lucide-react'

import { cn } from 'cn'

function ArmadoStepper({ pasos, actual, onSeleccion }) {
  const obligatorios = pasos.filter((paso) => paso.obligatorio)
  const completados = obligatorios.filter((paso) => paso.completo).length
  const progreso =
    obligatorios.length > 0
      ? Math.round((completados / obligatorios.length) * 100)
      : 100

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Paso {actual + 1} de {pasos.length}
        </p>
        <p className="text-sm text-muted-foreground">
          Obligatorios: {completados}/{obligatorios.length}
        </p>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progreso}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {pasos.map((paso, indice) => {
          const esActual = indice === actual
          const Icono = paso.esResumen ? ClipboardList : paso.icono

          return (
            <button
              key={paso.titulo}
              type="button"
              onClick={() => onSeleccion(indice)}
              className={cn(
                'flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition md:flex-1',
                esActual && 'border-primary text-primary',
                !esActual && 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <span className="relative">
                <Icono className="size-5" />
                {paso.completo && (
                  <CheckCircle2 className="absolute -top-1.5 -right-2 size-3.5 text-green-600" />
                )}
                {paso.obligatorio && !paso.completo && (
                  <CircleDot className="absolute -top-1.5 -right-2 size-3.5 text-destructive" />
                )}
              </span>
              <span className="whitespace-nowrap">
                {paso.titulo}
                {paso.obligatorio && (
                  <span className="text-destructive"> *</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ArmadoStepper
