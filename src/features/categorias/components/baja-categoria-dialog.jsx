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
import { bajarCategoria } from '../services'

function BajaCategoriaDialog({ open, onOpenChange, categoria, onBajaConfirmada }) {
  const [procesando, setProcesando] = useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      await bajarCategoria(categoria.id)
      toast.success(`Categoría «${categoria.nombre}» dada de baja`)
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
          <AlertDialogTitle>¿Dar de baja la categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            «{categoria?.nombre}» quedará inactiva. Es una baja lógica: el
            registro se conserva para preservar la trazabilidad del catálogo.
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

export default BajaCategoriaDialog
