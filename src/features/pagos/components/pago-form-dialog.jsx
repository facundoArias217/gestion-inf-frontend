import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { crearPago } from '../services'

const MEDIOS = [
  { valor: 'EFECTIVO', label: 'Efectivo' },
  { valor: 'TRANSFERENCIA', label: 'Transferencia' },
  { valor: 'TARJETA', label: 'Tarjeta' },
]

const RESULTADOS = [
  { valor: 'APROBADO', label: 'Aprobado' },
  { valor: 'RECHAZADO', label: 'Rechazado' },
]

const pagoSchema = z.object({
  ventaId: z
    .number({ invalid_type_error: 'Seleccioná una venta' })
    .int()
    .positive(),
  medioPago: z.string().min(1, 'Seleccioná el medio de pago'),
  monto: z
    .number({ invalid_type_error: 'Ingresá el monto' })
    .positive('Debe ser mayor a cero'),
  resultado: z.string().min(1, 'Seleccioná el resultado'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
})

function totalDeVenta(venta) {
  return (venta?.detalles ?? []).reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
}

function CampoMonto({ field }) {
  return (
    <Input
      type="number"
      step="1"
      min="0"
      {...field}
      value={Number.isNaN(field.value) ? '' : field.value}
      onChange={(event) => {
        const valor = event.target.value
        field.onChange(valor === '' ? NaN : Number(valor))
      }}
    />
  )
}

function PagoFormDialog({ open, onOpenChange, ventas, clientes, onRegistrado }) {
  const form = useForm({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      ventaId: NaN,
      medioPago: undefined,
      monto: NaN,
      resultado: 'APROBADO',
      fecha: new Date().toISOString().slice(0, 10),
    },
  })

  const ventasCompletadas = ventas.filter((venta) => venta.estado === 'COMPLETADA')

  useEffect(() => {
    if (open) {
      form.reset({
        ventaId: NaN,
        medioPago: undefined,
        monto: NaN,
        resultado: 'APROBADO',
        fecha: new Date().toISOString().slice(0, 10),
      })
    }
  }, [open, form])

  const alElegirVenta = (valor) => {
    const venta = ventas.find((v) => v.id === Number(valor))
    form.setValue('ventaId', Number(valor))
    if (venta) {
      form.setValue('monto', totalDeVenta(venta))
    }
  }

  const onSubmit = async (values) => {
    const datos = {
      ventaId: values.ventaId,
      medioPago: values.medioPago,
      monto: values.monto,
      resultado: values.resultado,
      fecha: values.fecha,
    }

    try {
      const pago = await crearPago(datos)
      toast.success(
        `Cobro de ${formatCurrency(pago.monto)} registrado (${pago.resultado})`,
      )
      onOpenChange(false)
      onRegistrado?.()
    } catch (error) {
      form.setError('ventaId', { message: error.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
          <DialogDescription>
            Pago simulado: registra medio, monto y resultado del cobro de una
            venta COMPLETADA. El pago no modifica stock (RN-PAG-03).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="ventaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venta</FormLabel>
                  <Select
                    onValueChange={alElegirVenta}
                    value={
                      Number.isNaN(field.value) ? undefined : String(field.value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná una venta COMPLETADA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ventasCompletadas.map((venta) => {
                        const cliente = clientes.find(
                          (c) => c.id === venta.clienteId,
                        )
                        return (
                          <SelectItem key={venta.id} value={String(venta.id)}>
                            #{venta.id} ·{' '}
                            {cliente
                              ? `${cliente.apellido}, ${cliente.nombre}`
                              : 'Cliente'}{' '}
                            · {formatCurrency(totalDeVenta(venta))}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medioPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medio de pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná el medio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEDIOS.map((medio) => (
                        <SelectItem key={medio.valor} value={medio.valor}>
                          {medio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <CampoMonto field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resultado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Resultado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RESULTADOS.map((resultado) => (
                          <SelectItem
                            key={resultado.valor}
                            value={resultado.valor}
                          >
                            {resultado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Registrando…' : 'Registrar cobro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PagoFormDialog
