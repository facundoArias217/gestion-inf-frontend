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
import { convertirPresupuesto } from '../services'

function esVencido(presupuesto) {
  const hoy = new Date().toISOString().slice(0, 10)
  return presupuesto.fechaVencimiento < hoy
}

function ConvertirPresupuestoDialog({
  open,
  onOpenChange,
  presupuesto,
  onConvertido,
}) {
  const [procesando, setProcesando] = useState(false)

  const vencido = presupuesto ? esVencido(presupuesto) : false

  const confirmar = async () => {
    setProcesando(true)
    try {
      const { venta } = await convertirPresupuesto(presupuesto.id)
      toast.success(
        `Venta #${venta.id} creada a partir del presupuesto #${presupuesto.id}`,
      )
      onOpenChange(false)
      onConvertido?.()
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
            ¿Convertir el presupuesto #{presupuesto?.id} en venta?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {vencido ? (
              <>
                El presupuesto está <strong>vencido</strong>: se convertirá con
                los precios de lista <strong>actuales</strong> (recotización) y
                el stock se reverifica al confirmar. El presupuesto conserva
                sus precios históricos.
              </>
            ) : (
              <>
                Se crea una venta COMPLETADA con los precios históricos de la
                cotización y los componentes del armado como líneas. El stock
                se reverifica antes de confirmar y la conversión es única.
              </>
            )}
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
            {procesando ? 'Convirtiendo…' : 'Convertir en venta'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConvertirPresupuestoDialog
