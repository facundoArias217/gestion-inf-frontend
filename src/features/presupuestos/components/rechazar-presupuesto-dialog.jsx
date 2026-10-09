import { useState } from 'react'
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
import { rechazarPresupuesto } from '../services'

function RechazarPresupuestoDialog({
  open,
  onOpenChange,
  presupuesto,
  onRechazado,
}) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await rechazarPresupuesto(presupuesto.id)
      toast.success(`Presupuesto #${presupuesto.id} rechazado`)
      onOpenChange(false)
      onRechazado?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Rechazar el presupuesto #{presupuesto?.id}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El presupuesto pasa a RECHAZADO: el cliente no aceptó la
            propuesta. Esta acción no se puede revertir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={procesando}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              confirmar()
            }}
            disabled={procesando}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {procesando ? 'Rechazando…' : 'Rechazar presupuesto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RechazarPresupuestoDialog
