import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ban, CheckCircle2, Eye, MoreHorizontal, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import OrdenSelect from '@/components/orden-select'
import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { listarProveedores } from '@/features/proveedores/services'
import { listarProductos } from '@/features/productos/services'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { formatCurrency } from '@/lib/format'
import CancelarCompraDialog from '../components/cancelar-compra-dialog'
import CompraDetalleDialog from '../components/compra-detalle-dialog'
import ConfirmarCompraDialog from '../components/confirmar-compra-dialog'
import { listarCompras } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'PENDIENTE', label: 'Pendientes' },
  { valor: 'COMPLETADA', label: 'Completadas' },
  { valor: 'CANCELADA', label: 'Canceladas' },
]

const ORDENES_COMPRAS = [
  { valor: 'fecha-desc', label: 'Más recientes primero' },
  { valor: 'fecha-asc', label: 'Más antiguos primero' },
]

const totalDe = (compra) =>
  compra.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )

function ComprasPage() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('compras', 'fecha-desc')
  const [compraDetalle, setCompraDetalle] = useState(null)
  const [compraConfirmar, setCompraConfirmar] = useState(null)
  const [compraCancelar, setCompraCancelar] = useState(null)

  const recargarCompras = useCallback(() => {
    listarCompras()
      .then((datos) => setCompras(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar las compras'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarCompras()
      .then((datos) => {
        if (!cancelado) {
          setCompras(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar las compras')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    listarProveedores()
      .then((datos) => {
        if (!cancelado) {
          setProveedores(datos)
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

  const proveedoresPorId = useMemo(() => {
    const mapa = new Map()
    proveedores.forEach((proveedor) => mapa.set(proveedor.id, proveedor))
    return mapa
  }, [proveedores])

  const ordenadas = useMemo(() => {
    const porEstado = compras.filter((compra) => {
      if (filtro === 'todas') {
        return true
      }
      return compra.estado === filtro
    })

    return ordenarListado(porEstado, orden)
  }, [compras, filtro, orden])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="grid gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Compras
            </CardTitle>
            <CardDescription>
              Reposición de stock a proveedores. La compra se registra
              PENDIENTE y el stock aumenta al confirmarse.
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/compras/nueva')}>
            <Plus className="size-4" />
            Nueva compra
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={filtro} onValueChange={setFiltro}>
              <TabsList>
                {FILTROS.map((filtroDef) => (
                  <TabsTrigger key={filtroDef.valor} value={filtroDef.valor}>
                    {filtroDef.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <OrdenSelect
              orden={orden}
              onOrdenChange={setOrden}
              opciones={ORDENES_COMPRAS}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
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
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay compras registradas.
                  </TableCell>
                </TableRow>
              ) : (
                ordenadas.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{compra.fecha}</TableCell>
                    <TableCell className="font-medium">
                      {proveedoresPorId.get(compra.proveedorId)?.razonSocial ??
                        '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {compra.detalles.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalDe(compra))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={compra.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ver detalle de la compra ${compra.id}`}
                          onClick={() => setCompraDetalle(compra)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {compra.estado === 'PENDIENTE' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones de la compra ${compra.id}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setCompraConfirmar(compra)}
                              >
                                <CheckCircle2 className="size-4" />
                                Confirmar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCompraCancelar(compra)}
                              >
                                <Ban className="size-4" />
                                Cancelar
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

      <CompraDetalleDialog
        open={compraDetalle != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCompraDetalle(null)
          }
        }}
        compra={compraDetalle}
        productos={productos}
      />
      <ConfirmarCompraDialog
        open={compraConfirmar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCompraConfirmar(null)
          }
        }}
        compra={compraConfirmar}
        onConfirmada={recargarCompras}
      />
      <CancelarCompraDialog
        open={compraCancelar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCompraCancelar(null)
          }
        }}
        compra={compraCancelar}
        onCancelada={recargarCompras}
      />
    </div>
  )
}

export default ComprasPage
