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
import { bajarCliente } from '../services'

function BajaClienteDialog({ open, onOpenChange, cliente, onBajaConfirmada }) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await bajarCliente(cliente.id)
      toast.success(
        `Cliente «${cliente.apellido}, ${cliente.nombre}» dado de baja`,
      )
      onOpenChange(false)
      onBajaConfirmada?.()
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
          <AlertDialogTitle>¿Dar de baja el cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            «{cliente?.apellido}, {cliente?.nombre}» quedará inactivo. Es una
            baja lógica: el registro se conserva para preservar la trazabilidad
            de sus presupuestos y ventas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              confirmar()
            }}
            disabled={procesando}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {procesando ? 'Dando de baja…' : 'Dar de baja'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default BajaClienteDialog
