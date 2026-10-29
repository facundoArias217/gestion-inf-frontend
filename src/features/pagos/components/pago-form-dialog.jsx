import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import ComboboxBuscable from '@/components/combobox-buscable'
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
  FormDescription,
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
import { obtenerConfiguracion } from '@/features/configuracion/services'
import { formatCurrency } from '@/lib/format'
import { crearPago } from '../services'

const MEDIOS = [
  { valor: 'EFECTIVO', label: 'Efectivo' },
  { valor: 'TRANSFERENCIA', label: 'Transferencia' },
  { valor: 'TARJETA', label: 'Tarjeta' },
]

const CUOTAS = [
  { valor: 1, label: '1 cuota' },
  { valor: 3, label: '3 cuotas' },
  { valor: 6, label: '6 cuotas' },
  { valor: 9, label: '9 cuotas' },
  { valor: 12, label: '12 cuotas' },
]

const CUOTAS_VALIDAS = CUOTAS.map((cuota) => cuota.valor)

const pagoSchema = z
  .object({
    ventaId: z
      .number({ invalid_type_error: 'Seleccioná una venta' })
      .int()
      .positive(),
    medioPago: z.string().min(1, 'Seleccioná el medio de pago'),
    monto: z
      .number({ invalid_type_error: 'Ingresá el monto' })
      .positive('Debe ser mayor a cero'),
    cuotas: z.number().int().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.medioPago === 'TARJETA' &&
      !CUOTAS_VALIDAS.includes(values.cuotas)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cuotas'],
        message: 'Seleccioná las cuotas',
      })
    }
  })

function redondear(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100
}

function totalDeVenta(venta) {
  if (typeof venta?.total === 'number') {
    return venta.total
  }
  return (venta?.detalles ?? []).reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
}

function saldoDeVenta(venta) {
  if (typeof venta?.saldo === 'number') {
    return venta.saldo
  }
  return totalDeVenta(venta)
}

function CampoMonto({ field }) {
  return (
    <Input
      type="number"
      step="0.01"
      min="0.01"
      {...field}
      value={Number.isNaN(field.value) ? '' : field.value}
      onChange={(event) => {
        const valor = event.target.value
        field.onChange(valor === '' ? NaN : Number(valor))
      }}
    />
  )
}

function PagoFormDialog({
  open,
  onOpenChange,
  venta: ventaFija = null,
  ventas = [],
  clientes = [],
  onRegistrado,
  textoCancelar = 'Cancelar',
}) {
  const [configuracion, setConfiguracion] = useState(null)

  const form = useForm({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      ventaId: NaN,
      medioPago: undefined,
      monto: NaN,
      cuotas: undefined,
    },
  })

  const ventaId = useWatch({ control: form.control, name: 'ventaId' })
  const medioPago = useWatch({ control: form.control, name: 'medioPago' })
  const monto = useWatch({ control: form.control, name: 'monto' })
  const cuotas = useWatch({ control: form.control, name: 'cuotas' })

  useEffect(() => {
    if (!open) {
      return undefined
    }

    let cancelado = false
    obtenerConfiguracion()
      .then((datos) => {
        if (!cancelado) {
          setConfiguracion(datos)
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    form.reset({
      ventaId: ventaFija?.id ?? NaN,
      medioPago: undefined,
      monto: ventaFija ? saldoDeVenta(ventaFija) : NaN,
      cuotas: undefined,
    })
  }, [open, ventaFija, form])

  const nombreCliente = (venta) => {
    const cliente = clientes.find((c) => c.id === venta?.clienteId)
    return cliente ? `${cliente.apellido}, ${cliente.nombre}` : 'Cliente'
  }

  const ventasDisponibles = ventas.filter(
    (venta) => venta.estado === 'COMPLETADA' && saldoDeVenta(venta) > 0,
  )

  const ventaSeleccionada =
    ventaFija ??
    ventasDisponibles.find((venta) => venta.id === ventaId) ??
    null

  const montoNumerico = Number.isFinite(monto) ? monto : 0
  const saldoSeleccionado = ventaSeleccionada
    ? saldoDeVenta(ventaSeleccionada)
    : 0

  const recargo =
    configuracion && medioPago === 'TARJETA'
      ? Number(configuracion[`recargoCuota${cuotas}`] ?? 0)
      : 0
  const descuentoAplicado =
    configuracion && medioPago === 'TRANSFERENCIA'
      ? Number(configuracion.descuentoTransferenciaPct ?? 0)
      : 0
  const montoFinal = redondear(
    montoNumerico * (1 + recargo / 100) * (1 - descuentoAplicado / 100),
  )

  const alElegirVenta = (valor) => {
    const id = Number(valor)
    const venta = ventasDisponibles.find((v) => v.id === id)
    form.setValue('ventaId', id, { shouldValidate: true })
    form.setValue('monto', venta ? saldoDeVenta(venta) : NaN)
    form.setValue('cuotas', undefined)
    form.clearErrors('monto')
  }

  const alElegirMedio = (valor) => {
    form.setValue('medioPago', valor, { shouldValidate: true })
    if (valor !== 'TARJETA') {
      form.setValue('cuotas', undefined)
      form.clearErrors('cuotas')
    }
  }

  const onSubmit = async (values) => {
    const venta = ventaFija ?? ventasDisponibles.find((v) => v.id === values.ventaId)
    const saldo = venta ? saldoDeVenta(venta) : 0

    if (values.monto > saldo) {
      form.setError('monto', {
        message: `El monto supera el saldo (${formatCurrency(saldo)})`,
      })
      return
    }

    const datos = {
      ventaId: values.ventaId,
      medioPago: values.medioPago,
      monto: values.monto,
      ...(values.medioPago === 'TARJETA' ? { cuotas: values.cuotas } : {}),
    }

    try {
      const pago = await crearPago(datos)
      const ajustes = []
      if (Number(pago.recargo) > 0) {
        ajustes.push(`recargo ${pago.recargo}%`)
      }
      if (Number(pago.descuentoAplicado) > 0) {
        ajustes.push(`descuento ${pago.descuentoAplicado}%`)
      }
      const montoCobrado = pago.montoFinal ?? pago.monto
      toast.success(
        `Cobro de ${formatCurrency(montoCobrado)} registrado${
          ajustes.length ? ` (${ajustes.join(' · ')})` : ''
        }`,
      )
      onOpenChange(false)
      onRegistrado?.(pago)
    } catch (error) {
      const mensaje = error.message ?? 'No se pudo registrar el cobro'
      if (/saldo|tope|monto/i.test(mensaje)) {
        form.setError('monto', { message: mensaje })
      } else if (/cuotas/i.test(mensaje)) {
        form.setError('cuotas', { message: mensaje })
      } else {
        form.setError('root.server', { message: mensaje })
      }
      toast.error(mensaje)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
          <DialogDescription>
            {ventaFija
              ? `Cobro de la venta #${ventaFija.id}. Podés cobrar el total o una parte del saldo.`
              : 'Cobro interno de una venta COMPLETADA. Se admiten pagos parciales hasta cubrir el saldo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            {ventaFija ? (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">
                  {nombreCliente(ventaFija)} · Venta #{ventaFija.id}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                  <span>Total {formatCurrency(totalDeVenta(ventaFija))}</span>
                  <span>
                    Saldo {formatCurrency(saldoDeVenta(ventaFija))}
                  </span>
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="ventaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venta</FormLabel>
                    <ComboboxBuscable
                      className="w-full sm:w-[unset]"
                      items={ventasDisponibles.map((venta) => ({
                        valor: String(venta.id),
                        label: `#${venta.id} · ${nombreCliente(venta)} · saldo ${formatCurrency(
                          saldoDeVenta(venta),
                        )}`,
                        keywords: nombreCliente(venta),
                      }))}
                      valor={
                        Number.isNaN(field.value) ? '' : String(field.value)
                      }
                      onValorChange={alElegirVenta}
                      placeholder="Buscar venta…"
                      textoTrigger="Seleccioná una venta con saldo"
                      textoVacio="No hay ventas COMPLETADAS con saldo pendiente"
                    />
                    {ventasDisponibles.length === 0 && (
                      <FormDescription>
                        No hay ventas COMPLETADAS con saldo pendiente.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="medioPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medio de pago</FormLabel>
                    <Select
                      onValueChange={alElegirMedio}
                      value={field.value}
                    >
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
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto base</FormLabel>
                    <FormControl>
                      <CampoMonto field={field} />
                    </FormControl>
                    {ventaSeleccionada && (
                      <FormDescription>
                        Saldo disponible: {formatCurrency(saldoSeleccionado)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {medioPago === 'TARJETA' && (
              <FormField
                control={form.control}
                name="cuotas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuotas</FormLabel>
                    <Select
                      onValueChange={(valor) => field.onChange(Number(valor))}
                      value={
                        field.value != null ? String(field.value) : undefined
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná las cuotas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUOTAS.map((cuota) => (
                          <SelectItem
                            key={cuota.valor}
                            value={String(cuota.valor)}
                          >
                            {cuota.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      1 y 3 cuotas sin recargo; 6, 9 y 12 aplican el recargo
                      configurado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {configuracion && medioPago && montoNumerico > 0 && (
              <div className="grid gap-1 rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Monto base</span>
                  <span>{formatCurrency(montoNumerico)}</span>
                </div>
                {recargo > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Recargo ({recargo}%)
                    </span>
                    <span>
                      +{formatCurrency(redondear(montoNumerico * (recargo / 100)))}
                    </span>
                  </div>
                )}
                {descuentoAplicado > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Descuento ({descuentoAplicado}%)
                    </span>
                    <span>
                      -{formatCurrency(redondear(montoNumerico * (descuentoAplicado / 100)))}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 border-t pt-1 font-medium">
                  <span>Total a cobrar</span>
                  <span>{formatCurrency(montoFinal)}</span>
                </div>
              </div>
            )}

            {form.formState.errors.root?.server?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.server.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {textoCancelar}
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  (!ventaFija && ventasDisponibles.length === 0)
                }
              >
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
