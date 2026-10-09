import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  CATEGORIAS_OBLIGATORIAS_NOMBRES,
  obtenerAdvertencias,
} from '../compatibilidad'
import { listarCategorias } from '@/features/categorias/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { formatCurrency } from '@/lib/format'
import { actualizarArmado, crearArmado, listarArmados } from '../services'

const SIN_SELECCION = 'sin-seleccion'

function ArmadoFormPage() {
  const { id } = useParams()
  const esEdicion = id != null
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(esEdicion)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [clienteId, setClienteId] = useState(null)
  const [slots, setSlots] = useState([])
  const [extraCategoria, setExtraCategoria] = useState(SIN_SELECCION)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const [categoriasDatos, productosDatos, clientesDatos] =
          await Promise.all([
            listarCategorias(),
            listarProductos(),
            listarClientes(),
          ])

        if (cancelado) {
          return
        }

        setCategorias(categoriasDatos)
        setProductos(productosDatos)
        setClientes(clientesDatos)

        const obligatorias = CATEGORIAS_OBLIGATORIAS_NOMBRES.map(
          (nombreCategoria) =>
            categoriasDatos.find((c) => c.nombre === nombreCategoria)?.id,
        ).filter((categoriaId) => categoriaId != null)

        let slotsIniciales = obligatorias.map((categoriaId) => ({
          categoriaId,
          productoId: null,
          cantidad: null,
        }))

        if (esEdicion) {
          const armados = await listarArmados()
          const armado = armados.find((a) => a.id === Number(id))

          if (cancelado) {
            return
          }

          if (!armado) {
            toast.error('Armado no encontrado')
            navigate('/armados')
            return
          }

          if (armado.estado !== 'BORRADOR') {
            toast.error('Solo se puede editar un armado en BORRADOR')
            navigate('/armados')
            return
          }

          setNombre(armado.nombre)
          setDescripcion(armado.descripcion ?? '')
          setClienteId(armado.clienteId ?? null)

          const slotsDelArmado = armado.componentes.map((componente) => {
            const producto = productosDatos.find(
              (p) => p.id === componente.productoId,
            )
            return {
              categoriaId: producto.categoriaId,
              productoId: componente.productoId,
              cantidad: componente.cantidad,
            }
          })

          slotsIniciales = obligatorias.map((categoriaId) => {
            const slot = slotsDelArmado.find(
              (s) => s.categoriaId === categoriaId,
            )
            return slot ?? { categoriaId, productoId: null, cantidad: null }
          })

          const extras = slotsDelArmado.filter(
            (s) => !obligatorias.includes(s.categoriaId),
          )
          slotsIniciales = [...slotsIniciales, ...extras]
        }

        setSlots(slotsIniciales)
      } catch (error) {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los datos')
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [esEdicion, id, navigate])

  const categoriasPorId = useMemo(() => {
    const mapa = new Map()
    categorias.forEach((categoria) => mapa.set(categoria.id, categoria))
    return mapa
  }, [categorias])

  const productosPorId = useMemo(() => {
    const mapa = new Map()
    productos.forEach((producto) => mapa.set(producto.id, producto))
    return mapa
  }, [productos])

  const categoriasObligatoriasIds = useMemo(
    () =>
      CATEGORIAS_OBLIGATORIAS_NOMBRES.map(
        (nombreCategoria) =>
          categorias.find((c) => c.nombre === nombreCategoria)?.id,
      ).filter((categoriaId) => categoriaId != null),
    [categorias],
  )

  const categoriasDisponiblesExtras = useMemo(
    () =>
      categorias.filter(
        (categoria) => !categoriasObligatoriasIds.includes(categoria.id),
      ),
    [categorias, categoriasObligatoriasIds],
  )

  const esObligatorio = (categoriaId) =>
    categoriasObligatoriasIds.includes(categoriaId)

  const productosDelSlot = (slot) =>
    productos.filter(
      (producto) =>
        producto.activo &&
        producto.categoriaId === slot.categoriaId &&
        (producto.id === slot.productoId ||
          !slots.some((s) => s.productoId === producto.id)),
    )

  const errorDelSlot = (slot) => {
    if (slot.productoId == null) {
      return null
    }
    if (slot.cantidad == null || Number.isNaN(slot.cantidad)) {
      return 'Ingresá la cantidad'
    }
    if (slot.cantidad < 1) {
      return 'Mínimo 1'
    }
    const producto = productosPorId.get(slot.productoId)
    if (producto && slot.cantidad > producto.stock) {
      return `Stock insuficiente (disponible: ${producto.stock})`
    }
    return null
  }

  const slotsLlenos = slots.filter((slot) => slot.productoId != null)
  const hayErrores =
    slots.some((slot) => errorDelSlot(slot) !== null) ||
    slotsLlenos.some((slot) => slot.cantidad == null)

  const total = slotsLlenos.reduce((acum, slot) => {
    const producto = productosPorId.get(slot.productoId)
    const cantidad = slot.cantidad ?? 0
    return acum + (producto ? producto.precio * cantidad : 0)
  }, 0)

  const completitud = useMemo(
    () =>
      CATEGORIAS_OBLIGATORIAS_NOMBRES.map((nombreCategoria) => {
        const categoria = categorias.find(
          (c) => c.nombre === nombreCategoria,
        )
        const presente =
          categoria != null &&
          slots.some(
            (slot) =>
              slot.categoriaId === categoria.id && slot.productoId != null,
          )
        return { nombre: nombreCategoria, presente }
      }),
    [categorias, slots],
  )

  const advertencias = useMemo(() => {
    if (cargando || productos.length === 0 || categorias.length === 0) {
      return []
    }

    return obtenerAdvertencias(
      slots
        .filter((slot) => slot.productoId != null)
        .map((slot) => ({
          productoId: slot.productoId,
          cantidad: slot.cantidad,
        })),
      productos,
      categorias,
    )
  }, [cargando, slots, productos, categorias])

  const actualizarSlot = (indice, cambios) => {
    setSlots((previos) =>
      previos.map((slot, i) => (i === indice ? { ...slot, ...cambios } : slot)),
    )
  }

  const elegirProducto = (indice, productoId) => {
    const producto = productosPorId.get(Number(productoId))
    actualizarSlot(indice, {
      productoId: Number(productoId),
      cantidad: producto ? 1 : null,
    })
  }

  const quitarSlot = (indice) => {
    setSlots((previos) => previos.filter((_, i) => i !== indice))
  }

  const agregarExtra = () => {
    if (extraCategoria === SIN_SELECCION) {
      return
    }
    const categoriaId = Number(extraCategoria)
    setSlots((previos) => [
      ...previos,
      { categoriaId, productoId: null, cantidad: null },
    ])
    setExtraCategoria(SIN_SELECCION)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!nombre.trim()) {
      toast.error('El nombre del armado es obligatorio')
      return
    }

    if (slotsLlenos.length === 0) {
      toast.error('El armado debe tener al menos un componente')
      return
    }

    if (hayErrores) {
      toast.error('Hay slots con errores: revisá cantidades y stock')
      return
    }

    const datos = {
      nombre,
      descripcion,
      clienteId,
      componentes: slotsLlenos.map((slot) => ({
        productoId: slot.productoId,
        cantidad: slot.cantidad,
      })),
    }

    setEnviando(true)
    try {
      if (esEdicion) {
        await actualizarArmado(Number(id), datos)
        toast.success('Armado actualizado')
      } else {
        await crearArmado(datos)
        toast.success('Armado guardado en estado BORRADOR')
      }
      navigate('/armados')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <p className="text-sm text-muted-foreground">Cargando configurador…</p>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver al listado"
          onClick={() => navigate('/armados')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          {esEdicion ? 'Editar armado' : 'Nuevo armado'}
        </h1>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Configuración de la PC
            </CardTitle>
            <CardDescription>
              Elegí al menos un producto por categoría obligatoria. Los slots
              vacíos se pueden guardar: el armado queda en BORRADOR y la
              completitud se valida al finalizarlo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="nombre" className="text-sm font-medium">
                    Nombre del armado
                  </label>
                  <Input
                    id="nombre"
                    placeholder="PC Gamer de Lucas"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Cliente (opcional)
                  </label>
                  <Select
                    value={clienteId == null ? SIN_SELECCION : String(clienteId)}
                    onValueChange={(valor) =>
                      setClienteId(
                        valor === SIN_SELECCION ? null : Number(valor),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SIN_SELECCION}>Sin cliente</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={String(cliente.id)}>
                          {cliente.apellido}, {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción (opcional)
                </label>
                <Textarea
                  id="descripcion"
                  placeholder="Para qué va a usar la PC, notas del vendedor…"
                  rows={2}
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-medium">Componentes</p>

              {slots.map((slot, indice) => {
                const categoria = categoriasPorId.get(slot.categoriaId)
                const producto = slot.productoId
                  ? productosPorId.get(slot.productoId)
                  : null
                const error = errorDelSlot(slot)
                const subtotal =
                  producto && slot.cantidad
                    ? producto.precio * slot.cantidad
                    : 0

                return (
                  <div
                    key={`${slot.categoriaId}-${indice}`}
                    className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[10rem_1fr_5rem_8rem_7rem_auto] sm:items-center"
                  >
                    <p className="text-sm font-medium">
                      {categoria?.nombre ?? '—'}
                      {esObligatorio(slot.categoriaId) && (
                        <span className="text-destructive"> *</span>
                      )}
                    </p>
                    <Select
                      value={
                        slot.productoId == null
                          ? undefined
                          : String(slot.productoId)
                      }
                      onValueChange={(valor) => elegirProducto(indice, valor)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productosDelSlot(slot).map((productoOpcion) => (
                          <SelectItem
                            key={productoOpcion.id}
                            value={String(productoOpcion.id)}
                          >
                            {productoOpcion.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Cant."
                      disabled={slot.productoId == null}
                      value={
                        slot.cantidad == null || Number.isNaN(slot.cantidad)
                          ? ''
                          : slot.cantidad
                      }
                      onChange={(event) => {
                        const valor = event.target.value
                        actualizarSlot(indice, {
                          cantidad: valor === '' ? null : Number(valor),
                        })
                      }}
                    />
                    <p className="text-right text-sm text-muted-foreground">
                      {producto ? formatCurrency(producto.precio) : '—'}
                    </p>
                    <p className="text-right text-sm text-muted-foreground">
                      {formatCurrency(subtotal)}
                    </p>
                    {esObligatorio(slot.categoriaId) ? (
                      <span />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Quitar componente"
                        className="text-destructive hover:text-destructive"
                        onClick={() => quitarSlot(indice)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                    {error && (
                      <p className="text-sm text-destructive sm:col-span-6">
                        {error}
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="flex flex-wrap items-center gap-2">
                <Select value={extraCategoria} onValueChange={setExtraCategoria}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Categoría opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_SELECCION} disabled>
                      Categoría opcional
                    </SelectItem>
                    {categoriasDisponiblesExtras.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarExtra}
                  disabled={extraCategoria === SIN_SELECCION}
                >
                  <Plus className="size-4" />
                  Agregar componente opcional
                </Button>
                <p className="text-xs text-muted-foreground">
                  Placa de video no es obligatoria (gráficos integrados)
                </p>
              </div>
            </div>

              <div className="grid gap-2 rounded-lg border p-3">
                <p className="text-sm font-medium">Validación en vivo</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {completitud.map((item) => (
                    <p
                      key={item.nombre}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      {item.presente ? (
                        <CheckCircle2 className="size-4 text-green-600" />
                      ) : (
                        <XCircle className="size-4 text-destructive" />
                      )}
                      {item.nombre}
                    </p>
                  ))}
                </div>
                {advertencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin advertencias por ahora.
                  </p>
                ) : (
                  <ul className="grid gap-1">
                    {advertencias.map((advertencia) => (
                      <li
                        key={advertencia}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                        {advertencia}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  Las advertencias son informativas y no impiden guardar. La
                  completitud se exige al finalizar.
                </p>
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
                  onClick={() => navigate('/armados')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando || hayErrores}>
                  {enviando
                    ? 'Guardando…'
                    : esEdicion
                      ? 'Guardar cambios'
                      : 'Guardar armado'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default ArmadoFormPage
