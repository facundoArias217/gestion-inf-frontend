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
import { cambiarEstadoUsuario } from '../services'

function BajaUsuarioDialog({ open, onOpenChange, usuario, onBajaConfirmada }) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await cambiarEstadoUsuario(usuario.id, false)
      toast.success(`Usuario ${usuario.apellido}, ${usuario.nombre} desactivado`)
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
          <AlertDialogTitle>
            ¿Desactivar a {usuario?.nombre} {usuario?.apellido}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El usuario pasa al Histórico: su login queda bloqueado y puede
            reactivarse después (baja lógica, RFN-01/02). No podés desactivar
            tu propio usuario.
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
            {procesando ? 'Desactivando…' : 'Desactivar usuario'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default BajaUsuarioDialog
