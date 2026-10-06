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
import { confirmarCompra } from '../services'

function ConfirmarCompraDialog({
  open,
  onOpenChange,
  compra,
  onConfirmada,
}) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await confirmarCompra(compra.id)
      toast.success(`Compra #${compra.id} confirmada`)
      onOpenChange(false)
      onConfirmada?.()
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
          <AlertDialogTitle>¿Confirmar la compra #{compra?.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            La compra pasa a COMPLETADA y el stock de cada producto aumentará
            según las cantidades del detalle (RN-COM-02). Esta acción no se
            puede revertir.
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
          >
            {procesando ? 'Confirmando…' : 'Confirmar compra'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmarCompraDialog
