import { useState } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  categoriasFaltantes,
  obtenerAdvertencias,
} from '../compatibilidad'
import { finalizarArmado } from '../services'

function FinalizarArmadoDialog({
  open,
  onOpenChange,
  armado,
  productos,
  categorias,
  onFinalizado,
}) {
  const [procesando, setProcesando] = useState(false)

  const faltantes = armado
    ? categoriasFaltantes(armado.componentes, productos, categorias)
    : []
  const advertencias = armado
    ? obtenerAdvertencias(armado.componentes, productos, categorias)
    : []

  const confirmar = async () => {
    setProcesando(true)
    try {
      await finalizarArmado(armado.id)
      toast.success(`Armado «${armado.nombre}» finalizado`)
      onOpenChange(false)
      onFinalizado?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Finalizar «{armado?.nombre}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Al finalizar, el armado queda congelado y puede asociarse a un
            presupuesto.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <p className="text-sm font-medium">Completitud</p>
            {armado?.componentes && (
              <ul className="grid gap-1">
                {faltantes.length === 0 ? (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Todas las categorías obligatorias están cubiertas
                  </li>
                ) : (
                  faltantes.map((nombre) => (
                    <li
                      key={nombre}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <XCircle className="size-4 text-destructive" />
                      Falta: {nombre}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="grid gap-1.5">
            <p className="text-sm font-medium">Advertencias</p>
            {advertencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin advertencias de compatibilidad.
              </p>
            ) : (
              <ul className="grid gap-1">
                {advertencias.map((advertencia) => (
                  <li
                    key={advertencia}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    {advertencia}
                  </li>
                ))}
              </ul>
            )}
            {advertencias.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Las advertencias son informativas y no impiden la
                finalización.
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={procesando}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              confirmar()
            }}
            disabled={procesando || faltantes.length > 0}
          >
            {procesando
              ? 'Finalizando…'
              : faltantes.length > 0
                ? 'Completa las categorías faltantes'
                : 'Finalizar armado'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default FinalizarArmadoDialog
