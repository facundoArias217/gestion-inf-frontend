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
import { listarArmados } from '@/features/armados/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { formatCurrency } from '@/lib/format'
import { crearPresupuesto } from '../services'

const VIGENCIA_DEFAULT = '48'

const VIGENCIAS = [
  { valor: '48', label: '48 horas (2 días)', dias: 2 },
  { valor: '168', label: '7 días', dias: 7 },
  { valor: '360', label: '15 días', dias: 15 },
  { valor: '720', label: '30 días', dias: 30 },
  { valor: 'personalizada', label: 'Personalizada', dias: null },
]

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

const presupuestoSchema = z.object({
  clienteId: z
    .number({ invalid_type_error: 'Seleccioná un cliente' })
    .int()
    .positive(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  detalles: z.array(detalleSchema),
})

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function fechaMasDias(fecha, dias) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia + dias))
    .toISOString()
    .slice(0, 10)
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

function PresupuestoRegistroPage() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [armados, setArmados] = useState([])
  const [vigencia, setVigencia] = useState(VIGENCIA_DEFAULT)
  const [vencePersonalizado, setVencePersonalizado] = useState(hoy())
  const [armadoElegidoId, setArmadoElegidoId] = useState(null)

  const form = useForm({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: {
      clienteId: NaN,
      fecha: hoy(),
      detalles: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'detalles',
  })

  const detalles = useWatch({ control: form.control, name: 'detalles' })
  const fechaForm = useWatch({ control: form.control, name: 'fecha' })

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const [clientesDatos, productosDatos, armadosDatos] =
          await Promise.all([
            listarClientes(),
            listarProductos(),
            listarArmados(),
          ])

        if (cancelado) {
          return
        }

        setClientes(clientesDatos)
        setProductos(productosDatos)
        setArmados(armadosDatos.filter((a) => a.estado === 'FINALIZADO'))
      } catch (error) {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los datos')
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [])

  const productosPorId = useMemo(() => {
    const mapa = new Map()
    productos.forEach((producto) => mapa.set(producto.id, producto))
    return mapa
  }, [productos])

  const armadosPorId = useMemo(() => {
    const mapa = new Map()
    armados.forEach((armado) => mapa.set(armado.id, armado))
    return mapa
  }, [armados])

  const armadoElegido = armadoElegidoId != null
    ? armadosPorId.get(armadoElegidoId)
    : null

  const totalArmado = armadoElegido
    ? armadoElegido.componentes.reduce(
        (acum, componente) => acum + componente.cantidad * componente.precioUnitario,
        0,
      )
    : 0

  const subtotalDe = (detalle) => {
    if (!Number.isFinite(detalle?.cantidad)) {
      return 0
    }
    const producto = productosPorId.get(detalle.productoId)
    return producto ? detalle.cantidad * producto.precio : 0
  }

  const totalSueltos = (detalles ?? []).reduce(
    (acum, detalle) => acum + subtotalDe(detalle),
    0,
  )

  const total = totalSueltos + totalArmado

  const fechaVencimiento =
    vigencia === 'personalizada'
      ? vencePersonalizado
      : fechaMasDias(fechaForm || hoy(), VIGENCIAS.find((v) => v.valor === vigencia).dias)

  const onSubmit = async (values) => {
    if (!fechaVencimiento) {
      toast.error('Elegí la vigencia o la fecha de vencimiento')
      return
    }

    if (fields.length === 0 && armadoElegidoId == null) {
      toast.error(
        'El presupuesto debe tener al menos un producto o un armado FINALIZADO',
      )
      return
    }

    if (
      fields.length > 0 &&
      (detalles ?? []).some((detalle) => Number.isNaN(detalle?.productoId))
    ) {
      toast.error('Hay filas sin producto: elegí uno o quitá la fila')
      return
    }

    const datos = {
      clienteId: values.clienteId,
      fecha: values.fecha,
      fechaVencimiento,
      armadoId: armadoElegidoId,
      detalles: (detalles ?? []).map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
      })),
    }

    try {
      await crearPresupuesto(datos)
      toast.success('Presupuesto creado en estado PENDIENTE')
      navigate('/presupuestos')
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
          onClick={() => navigate('/presupuestos')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Nuevo presupuesto
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Datos del presupuesto
              </CardTitle>
              <CardDescription>
                Un presupuesto pertenece a un cliente y se genera con productos
                sueltos y/o un armado FINALIZADO. Nace
                PENDIENTE con vencimiento.
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
                            <SelectValue placeholder="Seleccioná un cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem
                              key={cliente.id}
                              value={String(cliente.id)}
                            >
                              {cliente.apellido}, {cliente.nombre}
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

              <div className="grid gap-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Vigencia</label>
                    <Select value={vigencia} onValueChange={setVigencia}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIGENCIAS.map((vigenciaDef) => (
                          <SelectItem
                            key={vigenciaDef.valor}
                            value={vigenciaDef.valor}
                          >
                            {vigenciaDef.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {vigencia === 'personalizada' ? (
                    <div className="grid gap-2">
                      <label
                        htmlFor="vence"
                        className="text-sm font-medium"
                      >
                        Vence
                      </label>
                      <Input
                        id="vence"
                        type="date"
                        value={vencePersonalizado}
                        onChange={(event) =>
                          setVencePersonalizado(event.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <p className="text-sm font-medium">Vence</p>
                      <p className="text-sm text-muted-foreground">
                        {fechaVencimiento}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  La fecha de vencimiento se calcula con la vigencia elegida;
                  el default de 48 h es un parámetro de la pantalla, la regla
                  «X días» sigue pendiente en el BRD.
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Armado de PC (opcional)
                </label>
                <Select
                  value={
                    armadoElegidoId == null
                      ? 'sin-armado'
                      : String(armadoElegidoId)
                  }
                  onValueChange={(valor) =>
                    setArmadoElegidoId(
                      valor === 'sin-armado' ? null : Number(valor),
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Solo armados FINALIZADO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-armado">Sin armado</SelectItem>
                    {armados.map((armado) => (
                      <SelectItem
                        key={armado.id}
                        value={String(armado.id)}
                      >
                        {armado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {armadoElegido && (
                  <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {armadoElegido.nombre} — {armadoElegido.componentes.length}{' '}
                      componentes
                    </p>
                    <p>
                      Los componentes viven en el armado y no se copian al
                      detalle. Total del armado:{' '}
                      {formatCurrency(totalArmado)}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm">
                    Productos sueltos (opcional)
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ productoId: NaN, cantidad: NaN })
                    }
                  >
                    <Plus className="size-4" />
                    Agregar ítem
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin productos sueltos: solo se cotiza el armado.
                  </p>
                )}

                {fields.map((field, indice) => {
                  const elegido = detalles?.[indice]?.productoId
                  const producto = productosPorId.get(elegido)
                  const stockBajo =
                    producto &&
                    Number.isFinite(detalles?.[indice]?.cantidad) &&
                    detalles[indice].cantidad > producto.stock

                  return (
                    <div
                      key={field.id}
                      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`detalles.${indice}.productoId`}
                        render={({ field: campo }) => (
                          <FormItem>
                            <FormLabel className="sm:hidden">Producto</FormLabel>
                            <Select
                              onValueChange={(valor) => campo.onChange(Number(valor))}
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
                                {productos
                                  .filter(
                                    (productoOpcion) =>
                                      productoOpcion.id === elegido ||
                                      !(detalles ?? []).some(
                                        (detalle) =>
                                          detalle?.productoId ===
                                          productoOpcion.id,
                                      ),
                                  )
                                  .map((productoOpcion) => (
                                    <SelectItem
                                      key={productoOpcion.id}
                                      value={String(productoOpcion.id)}
                                    >
                                      {productoOpcion.nombre}
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
                      {stockBajo && (
                        <p className="text-sm text-amber-600 sm:col-span-4">
                          ⚠ Stock insuficiente de {producto.nombre}{' '}
                          (disponible: {producto.stock}) — informativo: la
                          disponibilidad se re-verifica al confirmar la venta.
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
                    onClick={() => navigate('/presupuestos')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? 'Creando…'
                      : 'Crear presupuesto'}
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

export default PresupuestoRegistroPage
