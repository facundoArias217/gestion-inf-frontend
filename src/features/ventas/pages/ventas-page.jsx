import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ban, Eye, MoreHorizontal, Plus, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import OrdenSelect from '@/components/orden-select'
import PageHeader from '@/components/page-header'
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
import { Skeleton } from '@/components/ui/skeleton'
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
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { formatCurrency, formatFecha } from '@/lib/format'
import CancelarVentaDialog from '../components/cancelar-venta-dialog'
import VentaDetalleDialog from '../components/venta-detalle-dialog'
import { listarVentas } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'COMPLETADA', label: 'Completadas' },
  { valor: 'CANCELADA', label: 'Canceladas' },
]

const ORDENES_VENTAS = [
  { valor: 'fecha-desc', label: 'Más recientes primero' },
  { valor: 'fecha-asc', label: 'Más antiguas primero' },
]

const totalDe = (venta) =>
  venta.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )

function VentasPage() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('ventas', 'fecha-desc')
  const [ventaDetalle, setVentaDetalle] = useState(null)
  const [ventaCancelar, setVentaCancelar] = useState(null)

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

    return ordenarListado(porEstado, orden)
  }, [ventas, filtro, orden])

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Ventas"
        descripcion="Ventas directas de productos. La venta nace COMPLETADA y descuenta stock; cancelarla lo reintegra."
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
            <OrdenSelect
              orden={orden}
              onOrdenChange={setOrden}
              opciones={ORDENES_VENTAS}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Ítems</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : ordenadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    {ventas.length === 0 ? (
                      <EmptyState
                        icono={ShoppingCart}
                        titulo="Todavía no hay ventas"
                        descripcion="La primera venta descuenta stock en el mismo acto (RN-VTA-01)."
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
                ordenadas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell>{formatFecha(venta.fecha)}</TableCell>
                    <TableCell className="font-medium">
                      {clientesPorId.get(venta.clienteId)
                        ? `${clientesPorId.get(venta.clienteId).apellido}, ${
                            clientesPorId.get(venta.clienteId).nombre
                          }`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {venta.detalles.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalDe(venta))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={venta.estado} />
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
