import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { listarProveedores } from '@/features/proveedores/services'
import { listarProductos } from '@/features/productos/services'
import { formatCurrency } from '@/lib/format'
import { crearCompra } from '../services'

const detalleSchema = z.object({
  productoId: z
    .number({ invalid_type_error: 'Seleccioná un producto' })
    .int()
    .positive(),
  cantidad: z
    .number({ invalid_type_error: 'Ingresá la cantidad' })
    .int('La cantidad debe ser entera')
    .min(1, 'Mínimo 1'),
  precioUnitario: z
    .number({ invalid_type_error: 'Ingresá el precio' })
    .positive('Debe ser mayor a cero'),
})

const compraSchema = z.object({
  proveedorId: z
    .number({ invalid_type_error: 'Seleccioná un proveedor' })
    .int()
    .positive(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  detalles: z.array(detalleSchema).min(1, 'Agregá al menos un producto'),
})

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

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

function CompraRegistroPage() {
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])

  const form = useForm({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      proveedorId: NaN,
      fecha: hoy(),
      detalles: [{ productoId: NaN, cantidad: NaN, precioUnitario: NaN }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'detalles',
  })

  const detalles = useWatch({ control: form.control, name: 'detalles' })

  useEffect(() => {
    let cancelado = false

    listarProveedores()
      .then((datos) => {
        if (!cancelado) {
          setProveedores(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los proveedores')
        }
      })

    listarProductos()
      .then((datos) => {
        if (!cancelado) {
          setProductos(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los productos')
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  const productosPorId = useMemo(() => {
    const mapa = new Map()
    productos.forEach((producto) => mapa.set(producto.id, producto))
    return mapa
  }, [productos])

  const subtotalDe = (detalle) =>
    Number.isFinite(detalle?.cantidad) && Number.isFinite(detalle?.precioUnitario)
      ? detalle.cantidad * detalle.precioUnitario
      : 0

  const total = (detalles ?? []).reduce(
    (acum, detalle) => acum + subtotalDe(detalle),
    0,
  )

  const onSubmit = async (values) => {
    const datos = {
      proveedorId: values.proveedorId,
      fecha: values.fecha,
      detalles: values.detalles.map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      })),
    }

    try {
      await crearCompra(datos)
      toast.success('Compra registrada en estado PENDIENTE')
      navigate('/compras')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver al listado"
          onClick={() => navigate('/compras')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Nueva compra</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Datos de la compra
              </CardTitle>
              <CardDescription>
                La compra se registra PENDIENTE y no modifica el stock hasta
                confirmarse.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="proveedorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select
                        onValueChange={(valor) => field.onChange(Number(valor))}
                        value={
                          Number.isNaN(field.value)
                            ? undefined
                            : String(field.value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccioná un proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {proveedores.map((proveedor) => (
                            <SelectItem
                              key={proveedor.id}
                              value={String(proveedor.id)}
                            >
                              {proveedor.razonSocial}
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
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm">Productos</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        productoId: NaN,
                        cantidad: NaN,
                        precioUnitario: NaN,
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Agregar ítem
                  </Button>
                </div>

                {fields.map((field, indice) => {
                  const elegido = detalles?.[indice]?.productoId
                  const disponibles = productos.filter(
                    (producto) =>
                      producto.id === elegido ||
                      !(detalles ?? []).some(
                        (detalle) => detalle?.productoId === producto.id,
                      ),
                  )

                  return (
                    <div
                      key={field.id}
                      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_5rem_8rem_7rem_auto] sm:items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`detalles.${indice}.productoId`}
                        render={({ field: campo }) => (
                          <FormItem>
                            <FormLabel className="sm:hidden">Producto</FormLabel>
                            <Select
                              onValueChange={(valor) => {
                                campo.onChange(Number(valor))
                                const producto =
                                  productosPorId.get(Number(valor))
                                if (producto) {
                                  form.setValue(
                                    `detalles.${indice}.precioUnitario`,
                                    producto.precio,
                                  )
                                }
                              }}
                              value={
                                Number.isNaN(campo.value)
                                  ? undefined
                                  : String(campo.value)
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccioná un producto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {disponibles.map((producto) => (
                                  <SelectItem
                                    key={producto.id}
                                    value={String(producto.id)}
                                  >
                                    {producto.nombre}
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
                        name={`detalles.${indice}.cantidad`}
                        render={({ field: campo }) => (
                          <FormItem>
                            <FormLabel className="sm:hidden">Cantidad</FormLabel>
                            <FormControl>
                              <CampoNumero
                                field={campo}
                                min="1"
                                step="1"
                                placeholder="Cant."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`detalles.${indice}.precioUnitario`}
                        render={({ field: campo }) => (
                          <FormItem>
                            <FormLabel className="sm:hidden">
                              Precio de compra
                            </FormLabel>
                            <FormControl>
                              <CampoNumero
                                field={campo}
                                min="0"
                                step="1"
                                placeholder="Precio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="hidden pb-2 text-right text-sm text-muted-foreground sm:block">
                        {formatCurrency(subtotalDe(detalles?.[indice]))}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Quitar ítem"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(indice)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )
                })}

                {form.formState.errors.detalles?.message && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.detalles.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold">
                  Total:{' '}
                  <span className="text-base">{formatCurrency(total)}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/compras')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? 'Registrando…'
                      : 'Registrar compra'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default CompraRegistroPage
