import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, MoreHorizontal, Plus, XCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarArmados } from '@/features/armados/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { formatCurrency } from '@/lib/format'
import PresupuestoDetalleDialog from '../components/presupuesto-detalle-dialog'
import RechazarPresupuestoDialog from '../components/rechazar-presupuesto-dialog'
import {
  aceptarPresupuesto,
  listarPresupuestos,
} from '../services'

const ESTADOS_FILTRO = [
  { valor: 'todas', label: 'Todos los estados' },
  { valor: 'PENDIENTE', label: 'Pendientes' },
  { valor: 'VENCIDO', label: 'Vencidos' },
  { valor: 'ACEPTADO', label: 'Aceptados' },
  { valor: 'RECHAZADO', label: 'Rechazados' },
  { valor: 'CONVERTIDO', label: 'Convertidos' },
]

const ORDENES_PRESUPUESTOS = [
  { valor: 'fecha-desc', label: 'Más recientes primero' },
  { valor: 'fecha-asc', label: 'Más antiguas primero' },
]

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function estaVencido(presupuesto) {
  return (
    (presupuesto.estado === 'PENDIENTE' ||
      presupuesto.estado === 'ACEPTADO') &&
    presupuesto.fechaVencimiento < hoyISO()
  )
}

function estadoVisible(presupuesto) {
  return estaVencido(presupuesto) ? 'VENCIDO' : presupuesto.estado
}

function totalDe(presupuesto, armadosPorId) {
  const totalSueltos = presupuesto.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
  const armado = presupuesto.armadoId
    ? armadosPorId.get(presupuesto.armadoId)
    : null
  const totalArmado = armado
    ? armado.componentes.reduce(
        (acum, componente) =>
          acum + componente.cantidad * componente.precioUnitario,
        0,
      )
    : 0
  return totalSueltos + totalArmado
}

function PresupuestosPage() {
  const navigate = useNavigate()
  const [presupuestos, setPresupuestos] = useState([])
  const [clientes, setClientes] = useState([])
  const [armados, setArmados] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('presupuestos', 'fecha-desc')
  const [presupuestoDetalle, setPresupuestoDetalle] = useState(null)
  const [presupuestoRechazar, setPresupuestoRechazar] = useState(null)

  const recargarPresupuestos = useCallback(() => {
    listarPresupuestos()
      .then((datos) => setPresupuestos(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los presupuestos'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarPresupuestos()
      .then((datos) => {
        if (!cancelado) {
          setPresupuestos(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los presupuestos')
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

    listarArmados()
      .then((datos) => {
        if (!cancelado) {
          setArmados(datos)
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

  const armadosPorId = useMemo(() => {
    const mapa = new Map()
    armados.forEach((armado) => mapa.set(armado.id, armado))
    return mapa
  }, [armados])

  const filtrados = useMemo(() => {
    const porEstado = presupuestos.filter((presupuesto) => {
      if (filtro === 'todas') {
        return true
      }
      if (filtro === 'VENCIDO') {
        return estaVencido(presupuesto)
      }
      return presupuesto.estado === filtro
    })

    return ordenarListado(porEstado, orden)
  }, [presupuestos, filtro, orden])

  const aceptar = async (presupuesto) => {
    try {
      await aceptarPresupuesto(presupuesto.id)
      toast.success(`Presupuesto #${presupuesto.id} aceptado`)
      recargarPresupuestos()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="grid gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Presupuestos
            </CardTitle>
            <CardDescription>
              Cotizaciones para clientes con vencimiento y estados. ACEPTADO y
              CONVERTIDO son momentos distintos; la conversión en venta exige
              reverificar stock.
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/presupuestos/nuevo')}>
            <Plus className="size-4" />
            Nuevo presupuesto
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger
                className="w-full sm:w-48"
                aria-label="Filtrar por estado"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_FILTRO.map((estadoFiltro) => (
                  <SelectItem
                    key={estadoFiltro.valor}
                    value={estadoFiltro.valor}
                  >
                    {estadoFiltro.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <OrdenSelect
              orden={orden}
              onOrdenChange={setOrden}
              opciones={ORDENES_PRESUPUESTOS}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Armado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay presupuestos para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((presupuesto) => {
                  const armado = presupuesto.armadoId
                    ? armados.find((a) => a.id === presupuesto.armadoId)
                    : null
                  const pendienteVigente =
                    presupuesto.estado === 'PENDIENTE' && !estaVencido(presupuesto)

                  return (
                    <TableRow key={presupuesto.id}>
                      <TableCell>{presupuesto.fecha}</TableCell>
                      <TableCell className="font-medium">
                        {clientesPorId.get(presupuesto.clienteId)
                          ? `${clientesPorId.get(presupuesto.clienteId).apellido}, ${
                              clientesPorId.get(presupuesto.clienteId).nombre
                            }`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {armado ? armado.nombre : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalDe(presupuesto, armadosPorId))}
                      </TableCell>
                      <TableCell>
                        {presupuesto.fechaVencimiento}
                        {estaVencido(presupuesto) && (
                          <span className="ml-1 text-destructive">(vencido)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={estadoVisible(presupuesto)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ver detalle del presupuesto ${presupuesto.id}`}
                            onClick={() => setPresupuestoDetalle(presupuesto)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {pendienteVigente && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Acciones del presupuesto ${presupuesto.id}`}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => aceptar(presupuesto)}
                                >
                                  <CheckCircle2 className="size-4" />
                                  Aceptar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setPresupuestoRechazar(presupuesto)
                                  }
                                >
                                  <XCircle className="size-4" />
                                  Rechazar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PresupuestoDetalleDialog
        open={presupuestoDetalle != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setPresupuestoDetalle(null)
          }
        }}
        presupuesto={presupuestoDetalle}
        clientes={clientes}
        armados={armados}
        productos={productos}
      />
      <RechazarPresupuestoDialog
        open={presupuestoRechazar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setPresupuestoRechazar(null)
          }
        }}
        presupuesto={presupuestoRechazar}
        onRechazado={recargarPresupuestos}
      />
    </div>
  )
}

export default PresupuestosPage
