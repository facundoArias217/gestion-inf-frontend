import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import ClienteCombobox from '@/components/cliente-combobox'
import ProductoCombobox from '@/components/producto-combobox'
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
import { listarCategorias } from '@/features/categorias/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { formatCurrency } from '@/lib/format'
import { crearVenta } from '../services'

const detalleSchema = z.object({
  productoId: z
    .number({ invalid_type_error: 'Seleccioná un producto' })
    .int()
    .positive(),
  cantidad: z
    .number({ invalid_type_error: 'Ingresá la cantidad' })
    .int('La cantidad debe ser entera')
    .min(1, 'Mínimo 1'),
})

const ventaSchema = z.object({
  clienteId: z
    .number({ invalid_type_error: 'Seleccioná un cliente' })
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

function VentaRegistroPage() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])

  const form = useForm({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteId: NaN,
      fecha: hoy(),
      detalles: [{ productoId: NaN, cantidad: NaN }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'detalles',
  })

  const detalles = useWatch({ control: form.control, name: 'detalles' })

  useEffect(() => {
    let cancelado = false

    listarClientes()
      .then((datos) => {
        if (!cancelado) {
          setClientes(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los clientes')
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

    listarCategorias()
      .then((datos) => {
        if (!cancelado) {
          setCategorias(datos)
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [])

  const categoriasPorId = useMemo(() => {
    const mapa = new Map()
    categorias.forEach((categoria) => mapa.set(categoria.id, categoria))
    return mapa
  }, [categorias])

  const productosActivos = useMemo(
    () => productos.filter((producto) => producto.activo),
    [productos],
  )

  const productosPorId = useMemo(() => {
    const mapa = new Map()
    productos.forEach((producto) => mapa.set(producto.id, producto))
    return mapa
  }, [productos])

  const subtotalDe = (detalle) => {
    if (!Number.isFinite(detalle?.cantidad)) {
      return 0
    }
    const producto = productosPorId.get(detalle.productoId)
    return producto ? detalle.cantidad * producto.precio : 0
  }

  const total = (detalles ?? []).reduce(
    (acum, detalle) => acum + subtotalDe(detalle),
    0,
  )

  const stockInsuficiente = (detalle) => {
    const producto = productosPorId.get(detalle?.productoId)
    if (!producto || !Number.isFinite(detalle?.cantidad)) {
      return null
    }
    if (detalle.cantidad > producto.stock) {
      return producto.stock
    }
    return null
  }

  const onSubmit = async (values) => {
    let hayStockInsuficiente = false

    values.detalles?.forEach((detalle, i) => {
      const disponible = stockInsuficiente(detalle)
      if (disponible !== null) {
        hayStockInsuficiente = true
        form.setError(`detalles.${i}.cantidad`, {
          message: `Stock insuficiente (disponible: ${disponible})`,
        })
      }
    })

    if (hayStockInsuficiente) {
      return
    }

    const datos = {
      clienteId: values.clienteId,
      fecha: values.fecha,
      detalles: values.detalles.map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
      })),
    }

    try {
      await crearVenta(datos)
      toast.success('Venta registrada en estado COMPLETADA')
      navigate('/ventas')
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
          onClick={() => navigate('/ventas')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Nueva venta</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Datos de la venta
              </CardTitle>
              <CardDescription>
                La venta se registra COMPLETADA y descuenta stock en el mismo
                acto. Se verifica el stock disponible de cada
                producto antes de confirmar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <ClienteCombobox
                        className="w-full"
                        clientes={clientes}
                        valor={
                          Number.isNaN(field.value) ? '' : String(field.value)
                        }
                        onValorChange={(valor) => field.onChange(Number(valor))}
                      />
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
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Agregar ítem
                  </Button>
                </div>

                {fields.map((field, indice) => {
                  const elegido = detalles?.[indice]?.productoId
                  const disponibles = productosActivos.filter(
                    (producto) =>
                      producto.id === elegido ||
                      !(detalles ?? []).some(
                        (detalle) => detalle?.productoId === producto.id,
                      ),
                  )
                  const disponible = stockInsuficiente(detalles?.[indice])

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
                            <ProductoCombobox
                              className="w-full"
                              productos={disponibles}
                              grupoDe={(producto) =>
                                categoriasPorId.get(producto.categoriaId)
                                  ?.nombre
                              }
                              valor={
                                Number.isNaN(campo.value)
                                  ? ''
                                  : String(campo.value)
                              }
                              onValorChange={(valor) => {
                                campo.onChange(Number(valor))
                              }}
                            />
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
                      <div className="grid content-end">
                        <span className="text-sm font-medium sm:hidden">
                          Precio de lista
                        </span>
                        <p className="pb-2 text-sm text-muted-foreground">
                          {productosPorId.get(elegido)?.precio != null
                            ? formatCurrency(
                                productosPorId.get(elegido).precio,
                              )
                            : '—'}
                        </p>
                      </div>
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
                      {disponible !== null && (
                        <p className="text-sm text-destructive sm:col-span-5">
                          Stock insuficiente (disponible: {disponible})
                        </p>
                      )}
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
                    onClick={() => navigate('/ventas')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? 'Registrando…'
                      : 'Registrar venta'}
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

export default VentaRegistroPage
