import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { actualizarConfiguracion } from '../services'

function porcentaje(mensaje) {
  return z
    .number({ invalid_type_error: mensaje })
    .min(0, 'No puede ser negativo')
    .max(100, 'No puede superar 100')
}

function entero(mensaje, minimo, mensajeMinimo, maximo, mensajeMaximo) {
  return z
    .number({ invalid_type_error: mensaje })
    .int('Debe ser un número entero')
    .min(minimo, mensajeMinimo)
    .max(maximo, mensajeMaximo)
}

const configuracionSchema = z.object({
  topeEfectivo: z
    .number({ invalid_type_error: 'Ingresá el tope de efectivo' })
    .positive('El tope debe ser mayor a cero')
    .max(9999999999, 'El tope es demasiado alto'),
  recargoCuota6: porcentaje('Ingresá el recargo de 6 cuotas'),
  recargoCuota9: porcentaje('Ingresá el recargo de 9 cuotas'),
  recargoCuota12: porcentaje('Ingresá el recargo de 12 cuotas'),
  descuentoTransferenciaPct: porcentaje(
    'Ingresá el descuento por transferencia',
  ),
  tiempoGarantiaMeses: entero(
    'Ingresá el tiempo de garantía',
    1,
    'Mínimo 1 mes',
    120,
    'Máximo 120 meses',
  ),
  vigenciaPresupuestoHoras: entero(
    'Ingresá la vigencia de presupuestos',
    1,
    'Mínimo 1 hora',
    8760,
    'Máximo 8760 horas (un año)',
  ),
  umbralBajoStock: entero(
    'Ingresá el umbral de bajo stock',
    0,
    'No puede ser negativo',
    100000,
    'Máximo 100000 unidades',
  ),
})

function CampoNumero({ field, ...props }) {
  return (
    <Input
      type="number"
      {...field}
      value={Number.isNaN(field.value) ? '' : field.value}
      onChange={(event) => {
        const valor = event.target.value
        field.onChange(valor === '' ? NaN : Number(valor))
      }}
      {...props}
    />
  )
}

function CampoNumeroConfig({
  control,
  name,
  etiqueta,
  descripcion,
  min,
  max,
  step,
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{etiqueta}</FormLabel>
          <FormControl>
            <CampoNumero field={field} min={min} max={max} step={step} />
          </FormControl>
          {descripcion && <FormDescription>{descripcion}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ConfiguracionForm({ configuracion }) {
  const [base, setBase] = useState(configuracion)

  const form = useForm({
    resolver: zodResolver(configuracionSchema),
    defaultValues: configuracion,
  })

  const onSubmit = async (values) => {
    try {
      const guardada = await actualizarConfiguracion(values)
      const final = guardada ?? values
      setBase(final)
      form.reset(final)
      toast.success('Configuración guardada')
    } catch (error) {
      toast.error(error.message ?? 'No se pudo guardar la configuración')
    }
  }

  const sinCambios = !form.formState.isDirty || form.formState.isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
        noValidate
      >
        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Los cambios se aplican a las operaciones que se registren a partir
          de ahora.
        </p>

        <div className="grid items-start gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cobros</CardTitle>
              <CardDescription>
                Tope de efectivo, recargos por cuotas y descuento por
                transferencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <CampoNumeroConfig
                control={form.control}
                name="topeEfectivo"
                etiqueta="Tope de efectivo ($)"
                descripcion="Máximo acumulado en efectivo por venta."
                min={0}
                step="0.01"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoNumeroConfig
                  control={form.control}
                  name="recargoCuota6"
                  etiqueta="Recargo 6 cuotas (%)"
                  min={0}
                  max={100}
                  step="0.01"
                />
                <CampoNumeroConfig
                  control={form.control}
                  name="recargoCuota9"
                  etiqueta="Recargo 9 cuotas (%)"
                  min={0}
                  max={100}
                  step="0.01"
                />
                <CampoNumeroConfig
                  control={form.control}
                  name="recargoCuota12"
                  etiqueta="Recargo 12 cuotas (%)"
                  min={0}
                  max={100}
                  step="0.01"
                />
              </div>
              <CampoNumeroConfig
                control={form.control}
                name="descuentoTransferenciaPct"
                etiqueta="Descuento por transferencia (%)"
                descripcion="Se aplica sobre el monto base al cobrar por transferencia."
                min={0}
                max={100}
                step="0.01"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Garantías y presupuestos</CardTitle>
                <CardDescription>
                  Vigencia por defecto y tiempo de garantía de las ventas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <CampoNumeroConfig
                  control={form.control}
                  name="tiempoGarantiaMeses"
                  etiqueta="Tiempo de garantía (meses)"
                  descripcion="Se suma a la fecha de venta de cada línea."
                  min={1}
                  step="1"
                />
                <CampoNumeroConfig
                  control={form.control}
                  name="vigenciaPresupuestoHoras"
                  etiqueta="Vigencia de presupuestos (horas)"
                  descripcion="Plazo por defecto de los presupuestos nuevos."
                  min={1}
                  step="1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock</CardTitle>
                <CardDescription>
                  Umbral para marcar productos con bajo stock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampoNumeroConfig
                  control={form.control}
                  name="umbralBajoStock"
                  etiqueta="Umbral de bajo stock (unidades)"
                  descripcion="Los productos con stock igual o menor se cuentan en el dashboard."
                  min={0}
                  step="1"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={sinCambios}
            onClick={() => form.reset(base)}
          >
            Descartar cambios
          </Button>
          <Button type="submit" disabled={sinCambios}>
            {form.formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ConfiguracionForm
