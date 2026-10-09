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
import { cancelarVenta } from '../services'

function CancelarVentaDialog({
  open,
  onOpenChange,
  venta,
  onCancelada,
}) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await cancelarVenta(venta.id)
      toast.success(`Venta #${venta.id} cancelada`)
      onOpenChange(false)
      onCancelada?.()
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
          <AlertDialogTitle>¿Cancelar la venta #{venta?.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            La venta pasa a CANCELADA y el stock vendido se reintegra
            transaccionalmente. Esta acción no se puede revertir.
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
            {procesando ? 'Cancelando…' : 'Cancelar venta'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CancelarVentaDialog
