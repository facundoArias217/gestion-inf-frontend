import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  ClipboardList,
  Cpu,
  Fan,
  HardDrive,
  MemoryStick,
  Monitor,
  Package,
  PcCase,
  Zap,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import AlertaBorrador from '@/components/alerta-borrador'
import { useFormDraft } from '@/hooks/use-form-draft'
import ArmadoStepper from '../components/armado-stepper'
import PasoCategoria from '../components/paso-categoria'
import PasoOtros from '../components/paso-otros'
import PasoResumen from '../components/paso-resumen'
import ProductoDetalleDialog from '../components/producto-detalle-dialog'
import ResumenArmado from '../components/resumen-armado'
import { obtenerAdvertencias } from '../compatibilidad'
import { listarCategorias } from '@/features/categorias/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { actualizarArmado, crearArmado, finalizarArmado, listarArmados } from '../services'

const PASOS_BASE = [
  {
    titulo: 'Procesador',
    nombres: ['Procesador'],
    icono: Cpu,
    obligatorio: true,
    unico: true,
  },
  {
    titulo: 'Motherboard',
    nombres: ['Motherboard'],
    icono: CircuitBoard,
    obligatorio: true,
    unico: true,
  },
  {
    titulo: 'Memoria RAM',
    nombres: ['Memoria RAM'],
    icono: MemoryStick,
    obligatorio: true,
    unico: false,
  },
  {
    titulo: 'Almacenamiento',
    nombres: ['Almacenamiento'],
    icono: HardDrive,
    obligatorio: true,
    unico: false,
  },
  {
    titulo: 'Fuente',
    nombres: ['Fuente'],
    icono: Zap,
    obligatorio: true,
    unico: true,
  },
  {
    titulo: 'Gabinete',
    nombres: ['Gabinete'],
    icono: PcCase,
    obligatorio: true,
    unico: true,
  },
  {
    titulo: 'Cooler',
    nombres: ['Refrigeración'],
    icono: Fan,
    obligatorio: false,
    unico: false,
  },
  {
    titulo: 'Placa de video',
    nombres: ['Placa de video'],
    icono: Monitor,
    obligatorio: false,
    unico: true,
  },
]

const PASO_OTROS = { titulo: 'Otros', icono: Package, obligatorio: false, otro: true }
const PASO_RESUMEN = {
  titulo: 'Resumen',
  icono: ClipboardList,
  obligatorio: false,
  esResumen: true,
}

function errorDeSeleccion(seleccion, productosPorId) {
  const producto = productosPorId.get(seleccion.productoId)

  if (!producto) {
    return 'Producto no encontrado'
  }
  if (seleccion.cantidad == null || Number.isNaN(seleccion.cantidad)) {
    return 'Ingresá la cantidad'
  }
  if (seleccion.cantidad < 1) {
    return 'Mínimo 1'
  }
  if (seleccion.cantidad > producto.stock) {
    return `Stock insuficiente (disponible: ${producto.stock})`
  }
  return null
}

function itemResumen(seleccion, productosPorId) {
  const producto = productosPorId.get(seleccion.productoId)
  return {
    producto,
    cantidad: seleccion.cantidad,
    subtotal: (producto?.precio ?? 0) * (seleccion.cantidad ?? 0),
  }
}

function estaVacioArmado(borrador) {
  return !borrador?.nombre?.trim() && (borrador?.selecciones ?? []).length === 0
}

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
  const [selecciones, setSelecciones] = useState([])
  const [pasoActual, setPasoActual] = useState(0)
  const [categoriaOtrosId, setCategoriaOtrosId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const { hayBorrador, guardar: guardarBorrador, recuperar: recuperarBorrador, limpiar: limpiarBorrador } =
    useFormDraft('armado', { estaVacio: estaVacioArmado })

  useEffect(() => {
    if (cargando || esEdicion) {
      return
    }
    guardarBorrador({
      nombre,
      descripcion,
      clienteId,
      selecciones,
      pasoActual,
      categoriaOtrosId,
    })
  }, [
    cargando,
    esEdicion,
    nombre,
    descripcion,
    clienteId,
    selecciones,
    pasoActual,
    categoriaOtrosId,
    guardarBorrador,
  ])

  const recuperarDraft = () => {
    const borrador = recuperarBorrador()
    if (!borrador) {
      return
    }
    setNombre(borrador.nombre ?? '')
    setDescripcion(borrador.descripcion ?? '')
    setClienteId(borrador.clienteId ?? null)
    setSelecciones(borrador.selecciones ?? [])
    setPasoActual(borrador.pasoActual ?? 0)
    setCategoriaOtrosId(borrador.categoriaOtrosId ?? null)
  }

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

        let seleccionesIniciales = []

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
          seleccionesIniciales = armado.componentes.map((componente) => ({
            productoId: componente.productoId,
            cantidad: componente.cantidad,
          }))

          const categoriaDe = (productoId) =>
            productosDatos.find((p) => p.id === productoId)?.categoriaId
          const existentes = PASOS_BASE.map((definicion) => ({
            definicion,
            categoria: categoriasDatos.find((c) =>
              definicion.nombres.includes(c.nombre),
            ),
          })).filter((paso) => paso.categoria != null)
          const primerIncompleto = existentes.findIndex(
            ({ definicion, categoria }) =>
              definicion.obligatorio &&
              !seleccionesIniciales.some(
                (seleccion) =>
                  categoriaDe(seleccion.productoId) === categoria.id,
              ),
          )
          setPasoActual(
            primerIncompleto === -1
              ? existentes.length + 1
              : primerIncompleto,
          )
        }

        setSelecciones(seleccionesIniciales)
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

  const productosPorId = useMemo(
    () => new Map(productos.map((producto) => [producto.id, producto])),
    [productos],
  )
  const categoriasPorId = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias],
  )

  const pasosFijos = useMemo(
    () =>
      PASOS_BASE.map((definicion) => ({
        ...definicion,
        categoria: categorias.find((c) =>
          definicion.nombres.includes(c.nombre),
        ),
      })).filter((paso) => paso.categoria != null),
    [categorias],
  )

  const pasos = useMemo(
    () => [...pasosFijos, PASO_OTROS, PASO_RESUMEN],
    [pasosFijos],
  )

  const categoriasSeleccionadas = useMemo(
    () =>
      new Set(
        selecciones
          .map((seleccion) => productosPorId.get(seleccion.productoId)?.categoriaId)
          .filter((categoriaId) => categoriaId != null),
      ),
    [selecciones, productosPorId],
  )

  const extras = useMemo(
    () =>
      selecciones.filter((seleccion) => {
        const categoriaId = productosPorId.get(seleccion.productoId)?.categoriaId
        return !pasosFijos.some((paso) => paso.categoria.id === categoriaId)
      }),
    [selecciones, productosPorId, pasosFijos],
  )

  const faltantes = useMemo(
    () =>
      pasosFijos
        .filter(
          (paso) =>
            paso.obligatorio && !categoriasSeleccionadas.has(paso.categoria.id),
        )
        .map((paso) => paso.titulo),
    [pasosFijos, categoriasSeleccionadas],
  )

  const advertencias = useMemo(() => {
    if (cargando || productos.length === 0 || categorias.length === 0) {
      return []
    }
    return obtenerAdvertencias(selecciones, productos, categorias)
  }, [cargando, selecciones, productos, categorias])

  const errores = useMemo(
    () =>
      selecciones
        .map((seleccion) => errorDeSeleccion(seleccion, productosPorId))
        .filter((error) => error != null),
    [selecciones, productosPorId],
  )
  const hayErrores = errores.length > 0

  const total = useMemo(
    () =>
      selecciones.reduce((acum, seleccion) => {
        const producto = productosPorId.get(seleccion.productoId)
        return acum + (producto?.precio ?? 0) * (seleccion.cantidad ?? 0)
      }, 0),
    [selecciones, productosPorId],
  )

  const grupos = useMemo(
    () => [
      ...pasosFijos.map((paso) => ({
        titulo: paso.titulo,
        icono: paso.icono,
        items: selecciones
          .filter(
            (seleccion) =>
              productosPorId.get(seleccion.productoId)?.categoriaId ===
              paso.categoria.id,
          )
          .map((seleccion) => itemResumen(seleccion, productosPorId)),
      })),
      {
        titulo: 'Otros',
        icono: Package,
        items: extras.map((seleccion) => itemResumen(seleccion, productosPorId)),
      },
    ],
    [pasosFijos, selecciones, productosPorId, extras],
  )

  const pasosStepper = pasos.map((paso) => ({
    ...paso,
    completo: paso.otro
      ? extras.length > 0
      : categoriasSeleccionadas.has(paso.categoria?.id),
  }))

  const iconoDeCategoria = (categoriaId) =>
    pasosFijos.find((paso) => paso.categoria.id === categoriaId)?.icono ??
    Package

  const seleccionesDelPaso = (paso) =>
    selecciones
      .filter(
        (seleccion) =>
          productosPorId.get(seleccion.productoId)?.categoriaId ===
          paso.categoria.id,
      )
      .map((seleccion) => ({
        producto: productosPorId.get(seleccion.productoId),
        cantidad: seleccion.cantidad,
        error: errorDeSeleccion(seleccion, productosPorId),
      }))

  const itemsDelPaso = (paso) => {
    const categoriaId = paso.otro ? categoriaOtrosId : paso.categoria?.id

    if (categoriaId == null) {
      return []
    }

    const idsDelPaso = new Set(
      selecciones
        .filter(
          (seleccion) =>
            productosPorId.get(seleccion.productoId)?.categoriaId ===
            categoriaId,
        )
        .map((seleccion) => seleccion.productoId),
    )

    return productos
      .filter((producto) => producto.activo && producto.categoriaId === categoriaId)
      .map((producto) => {
        const enEstePaso = idsDelPaso.has(producto.id)
        const enOtroPaso =
          !enEstePaso && selecciones.some((s) => s.productoId === producto.id)
        const sinStock = !enEstePaso && producto.stock === 0

        return {
          producto,
          seleccionado: enEstePaso,
          deshabilitado: enOtroPaso || sinStock,
          motivo: enOtroPaso
            ? 'Elegido en otro paso'
            : sinStock
              ? 'Sin stock'
              : undefined,
        }
      })
  }

  const categoriasDisponiblesOtros = useMemo(
    () =>
      categorias.filter(
        (categoria) =>
          categoria.activo &&
          !pasosFijos.some((paso) => paso.categoria.id === categoria.id),
      ),
    [categorias, pasosFijos],
  )

  const gruposExtras = useMemo(() => {
    const mapa = new Map()

    extras.forEach((seleccion) => {
      const producto = productosPorId.get(seleccion.productoId)
      const categoria = categoriasPorId.get(producto?.categoriaId)

      if (!categoria) {
        return
      }

      if (!mapa.has(categoria.id)) {
        mapa.set(categoria.id, { categoria, selecciones: [] })
      }
      mapa
        .get(categoria.id)
        .selecciones.push({
          producto,
          cantidad: seleccion.cantidad,
          error: errorDeSeleccion(seleccion, productosPorId),
        })
    })

    return [...mapa.values()]
  }, [extras, productosPorId, categoriasPorId])

  const paso = pasos[pasoActual]
  const erroresDelPasoActual = paso?.esResumen
    ? 0
    : paso?.otro
      ? gruposExtras.reduce(
          (acum, grupo) =>
            acum + grupo.selecciones.filter((s) => s.error != null).length,
          0,
        )
      : seleccionesDelPaso(paso).filter((s) => s.error != null).length

  const puedeFinalizar =
    selecciones.length > 0 && faltantes.length === 0 && !hayErrores

  const elegirProducto = (pasoDelProducto, producto) => {
    const yaElegido = selecciones.some((s) => s.productoId === producto.id)

    if (yaElegido) {
      setSelecciones((previas) =>
        previas.filter((seleccion) => seleccion.productoId !== producto.id),
      )
      return
    }

    const categoriaId = pasoDelProducto.otro
      ? categoriaOtrosId
      : pasoDelProducto.categoria.id

    setSelecciones((previas) => [
      ...previas.filter(
        (seleccion) =>
          productosPorId.get(seleccion.productoId)?.categoriaId !== categoriaId ||
          !pasoDelProducto.unico,
      ),
      { productoId: producto.id, cantidad: 1 },
    ])
  }

  const cambiarCantidad = (productoId, cantidad) => {
    setSelecciones((previas) =>
      previas.map((seleccion) =>
        seleccion.productoId === productoId ? { ...seleccion, cantidad } : seleccion,
      ),
    )
  }

  const quitarSeleccion = (productoId) => {
    setSelecciones((previas) =>
      previas.filter((seleccion) => seleccion.productoId !== productoId),
    )
  }

  const verDetalle = (producto) => {
    setDetalle({ producto, icono: iconoDeCategoria(producto.categoriaId) })
  }

  const validarFormulario = () => {
    if (!nombre.trim()) {
      toast.error('El nombre del armado es obligatorio')
      return false
    }
    if (selecciones.length === 0) {
      toast.error('El armado debe tener al menos un componente')
      return false
    }
    if (hayErrores) {
      toast.error('Hay componentes con errores: revisá cantidades y stock')
      return false
    }
    return true
  }

  const datosArmado = () => ({
    nombre,
    descripcion,
    clienteId,
    componentes: selecciones,
  })

  const guardar = async () => {
    if (!validarFormulario()) {
      return
    }

    setEnviando(true)
    try {
      if (esEdicion) {
        await actualizarArmado(Number(id), datosArmado())
        toast.success('Armado actualizado')
      } else {
        await crearArmado(datosArmado())
        toast.success('Armado guardado en estado BORRADOR')
        limpiarBorrador()
      }
      navigate('/armados')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEnviando(false)
    }
  }

  const guardarYFinalizar = async () => {
    if (!validarFormulario()) {
      return
    }

    setEnviando(true)
    try {
      let armadoId

      if (esEdicion) {
        await actualizarArmado(Number(id), datosArmado())
        armadoId = Number(id)
      } else {
        const nuevo = await crearArmado(datosArmado())
        armadoId = nuevo.id
        limpiarBorrador()
      }

      try {
        await finalizarArmado(armadoId)
        toast.success(`Armado «${nombre.trim()}» finalizado`)
      } catch (error) {
        toast.error(error.message)
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
          {esEdicion ? 'Editar armado' : 'Armá tu PC paso a paso'}
        </h1>
      </div>

      {!esEdicion && hayBorrador && (
        <AlertaBorrador
          onRecuperar={recuperarDraft}
          onDescartar={limpiarBorrador}
        />
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-6">
          <ArmadoStepper
            pasos={pasosStepper}
            actual={pasoActual}
            onSeleccion={setPasoActual}
          />

          {paso.esResumen ? (
            <PasoResumen
              esEdicion={esEdicion}
              grupos={grupos}
              total={total}
              faltantes={faltantes}
              advertencias={advertencias}
              hayErrores={hayErrores}
              nombre={nombre}
              onNombreChange={setNombre}
              clienteId={clienteId}
              onClienteIdChange={setClienteId}
              clientes={clientes}
              descripcion={descripcion}
              onDescripcionChange={setDescripcion}
              puedeFinalizar={puedeFinalizar}
              enviando={enviando}
              onGuardar={guardar}
              onGuardarYFinalizar={guardarYFinalizar}
              onCancelar={() => {
                if (!esEdicion) {
                  limpiarBorrador()
                }
                navigate('/armados')
              }}
            />
          ) : paso.otro ? (
            <PasoOtros
              categoriasDisponibles={categoriasDisponiblesOtros}
              categoriaElegidaId={categoriaOtrosId}
              onCategoriaElegida={setCategoriaOtrosId}
              items={itemsDelPaso(paso)}
              gruposExtras={gruposExtras}
              onSeleccionar={(producto) => elegirProducto(paso, producto)}
              onCambiarCantidad={cambiarCantidad}
              onQuitar={quitarSeleccion}
              onVerDetalle={verDetalle}
            />
          ) : (
            <PasoCategoria
              paso={paso}
              items={itemsDelPaso(paso)}
              selecciones={seleccionesDelPaso(paso)}
              onSeleccionar={(producto) => elegirProducto(paso, producto)}
              onCambiarCantidad={cambiarCantidad}
              onQuitar={quitarSeleccion}
              onVerDetalle={verDetalle}
            />
          )}

          {!paso.esResumen && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setPasoActual((previo) => Math.max(previo - 1, 0))}
                disabled={pasoActual === 0}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                onClick={() =>
                  setPasoActual((previo) =>
                    Math.min(previo + 1, pasos.length - 1),
                  )
                }
                disabled={erroresDelPasoActual > 0}
                title={
                  erroresDelPasoActual > 0
                    ? 'Corregí las cantidades o el stock de este paso para continuar'
                    : undefined
                }
              >
                {pasoActual === pasos.length - 2
                  ? 'Ir al resumen'
                  : 'Siguiente'}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <ResumenArmado
            grupos={grupos}
            total={total}
            faltantes={faltantes}
            advertencias={advertencias}
          />
        </div>
      </div>

      <ProductoDetalleDialog
        producto={detalle?.producto}
        categoria={
          detalle ? categoriasPorId.get(detalle.producto.categoriaId) : null
        }
        icono={detalle?.icono ?? Package}
        open={detalle != null}
        onOpenChange={(open) => {
          if (!open) {
            setDetalle(null)
          }
        }}
      />
    </div>
  )
}

export default ArmadoFormPage
