import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Ban,
  CreditCard,
  Eye,
  MoreHorizontal,
  Plus,
  ShoppingCart,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import Buscador from '@/components/buscador'
import TableHeadOrdenable from '@/components/table-head-ordenable'
import PageHeader from '@/components/page-header'
import Paginacion from '@/components/paginacion'
import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SkeletonTabla from '@/components/skeleton-tabla'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePaginacion } from '@/hooks/use-paginacion'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCurrency, formatFecha } from '@/lib/format'
import PagoFormDialog from '@/features/pagos/components/pago-form-dialog'
import CancelarVentaDialog from '../components/cancelar-venta-dialog'
import VentaDetalleDialog from '../components/venta-detalle-dialog'
import { listarVentas } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'COMPLETADA', label: 'Completadas' },
  { valor: 'CANCELADA', label: 'Canceladas' },
]

const totalDe = (venta) =>
  typeof venta.total === 'number'
    ? venta.total
    : venta.detalles.reduce(
        (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
        0,
      )

const saldoDe = (venta) =>
  typeof venta.saldo === 'number' ? venta.saldo : totalDe(venta)

const estadoCobroDe = (venta) => {
  if (venta.estadoCobro) {
    return venta.estadoCobro
  }
  const total = totalDe(venta)
  const saldo = saldoDe(venta)
  if (saldo <= 0) {
    return 'COBRADA'
  }
  return saldo < total ? 'PARCIAL' : 'SIN_COBRAR'
}

function VentasPage() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useOrden('ventas', 'fecha-desc')
  const [ventaDetalle, setVentaDetalle] = useState(null)
  const [ventaCancelar, setVentaCancelar] = useState(null)
  const [ventaCobrar, setVentaCobrar] = useState(null)

  useDocumentTitle('Ventas')

  const recargarVentas = useCallback(() => {
    listarVentas()
      .then((datos) => setVentas(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar las ventas'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarVentas()
      .then((datos) => {
        if (!cancelado) {
          setVentas(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar las ventas')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    listarClientes()
      .then((datos) => {
        if (!cancelado) {
          setClientes(datos)
        }
      })
      .catch(() => {})

    listarProductos()
      .then((datos) => {
        if (!cancelado) {
          setProductos(datos)
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [])

  const clientesPorId = useMemo(() => {
    const mapa = new Map()
    clientes.forEach((cliente) => mapa.set(cliente.id, cliente))
    return mapa
  }, [clientes])

  const ordenadas = useMemo(() => {
    const porEstado = ventas.filter((venta) => {
      if (filtro === 'todas') {
        return true
      }
      return venta.estado === filtro
    })

    const porBusqueda = filtrarPorBusqueda(porEstado, busqueda, [
      (venta) => {
        const cliente = clientesPorId.get(venta.clienteId)
        return cliente ? `${cliente.apellido} ${cliente.nombre}` : ''
      },
      'estado',
      (venta) => estadoCobroDe(venta),
      (venta) => `#${venta.id}`,
    ])

    return ordenarListado(porBusqueda, orden)
  }, [ventas, filtro, busqueda, orden, clientesPorId])

  const { pagina, setPagina, totalPaginas, paginar } = usePaginacion(ordenadas.length, `${filtro}-${busqueda}-${orden}`)
  const visibles = paginar(ordenadas)

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Ventas"
        descripcion="Ventas directas de productos. La venta nace COMPLETADA, descuenta stock y se cobra total o parcialmente hasta cubrir el saldo."
        acciones={
          <Button onClick={() => navigate('/ventas/nueva')}>
            <Plus className="size-4" />
            Nueva venta
          </Button>
        }
      />
      <Card>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={filtro} onValueChange={setFiltro}>
                <TabsList>
                  {FILTROS.map((filtroDef) => (
                    <TabsTrigger key={filtroDef.valor} value={filtroDef.valor}>
                      {filtroDef.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {ordenadas.length} de {ventas.length} ventas
              </p>
            </div>
            <Buscador
              valor={busqueda}
              onValorChange={setBusqueda}
              placeholder="Buscar ventas…"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="fecha">Fecha</TableHeadOrdenable>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Ítems</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cobro</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <SkeletonTabla columnas={7} ocultas={[2]} />
              ) : ordenadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={ShoppingCart}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : ventas.length === 0 ? (
                      <EmptyState
                        icono={ShoppingCart}
                        titulo="Todavía no hay ventas"
                        descripcion="La primera venta descuenta stock en el mismo acto."
                        accion={{ icono: Plus, label: 'Registrar la primera' }}
                        onAccion={() => navigate('/ventas/nueva')}
                      />
                    ) : (
                      <EmptyState
                        icono={ShoppingCart}
                        titulo="No hay resultados"
                        descripcion="Ninguna venta coincide con el filtro de estado."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell>{formatFecha(venta.fecha)}</TableCell>
                    <TableCell className="font-medium">
                      {clientesPorId.get(venta.clienteId)
                        ? `${clientesPorId.get(venta.clienteId).apellido}, ${
                            clientesPorId.get(venta.clienteId).nombre
                          }`
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden text-right lg:table-cell">
                      {venta.detalles.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <p>{formatCurrency(totalDe(venta))}</p>
                      {saldoDe(venta) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Saldo {formatCurrency(saldoDe(venta))}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={venta.estado} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={estadoCobroDe(venta)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ver detalle de la venta ${venta.id}`}
                          onClick={() => setVentaDetalle(venta)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {venta.estado === 'COMPLETADA' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones de la venta ${venta.id}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {estadoCobroDe(venta) !== 'COBRADA' && (
                                <DropdownMenuItem
                                  onClick={() => setVentaCobrar(venta)}
                                >
                                  <CreditCard className="size-4" />
                                  Cobrar saldo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setVentaCancelar(venta)}
                              >
                                <Ban className="size-4" />
                                Cancelar venta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onPaginaChange={setPagina} />
        </CardContent>
      </Card>

      <VentaDetalleDialog
        open={ventaDetalle != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setVentaDetalle(null)
          }
        }}
        venta={ventaDetalle}
        productos={productos}
      />
      <PagoFormDialog
        open={ventaCobrar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setVentaCobrar(null)
          }
        }}
        venta={ventaCobrar}
        clientes={clientes}
        onRegistrado={recargarVentas}
      />
      <CancelarVentaDialog
        open={ventaCancelar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setVentaCancelar(null)
          }
        }}
        venta={ventaCancelar}
        onCancelada={recargarVentas}
      />
    </div>
  )
}

export default VentasPage
