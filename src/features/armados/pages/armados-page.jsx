import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
} from 'lucide-react'
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
import { listarCategorias } from '@/features/categorias/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { formatCurrency } from '@/lib/format'
import ArmadoDetalleDialog from '../components/armado-detalle-dialog'
import FinalizarArmadoDialog from '../components/finalizar-armado-dialog'
import { listarArmados } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'BORRADOR', label: 'Borradores' },
  { valor: 'FINALIZADO', label: 'Finalizados' },
]

const ORDENES_ARMADOS = [
  { valor: 'fecha-desc', label: 'Más recientes primero' },
  { valor: 'fecha-asc', label: 'Más antiguos primero' },
]

const totalDe = (armado) =>
  armado.componentes.reduce(
    (acum, componente) =>
      acum + componente.cantidad * componente.precioUnitario,
    0,
  )

function ArmadosPage() {
  const navigate = useNavigate()
  const [armados, setArmados] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('armados', 'fecha-desc')
  const [armadoDetalle, setArmadoDetalle] = useState(null)
  const [armadoFinalizar, setArmadoFinalizar] = useState(null)

  const recargarArmados = useCallback(() => {
    listarArmados()
      .then((datos) => setArmados(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los armados'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarArmados()
      .then((datos) => {
        if (!cancelado) {
          setArmados(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los armados')
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

  const clientesPorId = useMemo(() => {
    const mapa = new Map()
    clientes.forEach((cliente) => mapa.set(cliente.id, cliente))
    return mapa
  }, [clientes])

  const filtrados = useMemo(() => {
    const porEstado = armados.filter((armado) => {
      if (filtro === 'todas') {
        return true
      }
      return armado.estado === filtro
    })

    return ordenarListado(porEstado, orden)
  }, [armados, filtro, orden])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="grid gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Armá tu PC
            </CardTitle>
            <CardDescription>
              Configuraciones de PC a partir de componentes del catálogo. Solo
              un armado FINALIZADO puede asociarse a un presupuesto.
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/armados/nuevo')}>
            <Plus className="size-4" />
            Nuevo armado
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
              opciones={ORDENES_ARMADOS}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Componentes</TableHead>
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
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay armados para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((armado) => (
                  <TableRow key={armado.id}>
                    <TableCell className="font-medium">
                      {armado.nombre}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {armado.clienteId != null
                        ? (() => {
                            const cliente =
                              clientesPorId.get(armado.clienteId)
                            return cliente
                              ? `${cliente.apellido}, ${cliente.nombre}`
                              : '—'
                          })()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {armado.componentes.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalDe(armado))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={armado.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ver detalle de ${armado.nombre}`}
                          onClick={() => setArmadoDetalle(armado)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {armado.estado === 'BORRADOR' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones de ${armado.nombre}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/armados/${armado.id}/editar`)
                                }
                              >
                                <Pencil className="size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setArmadoFinalizar(armado)}
                              >
                                <CheckCircle2 className="size-4" />
                                Finalizar
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

      <ArmadoDetalleDialog
        open={armadoDetalle != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setArmadoDetalle(null)
          }
        }}
        armado={armadoDetalle}
        productos={productos}
        categorias={categorias}
      />
      <FinalizarArmadoDialog
        open={armadoFinalizar != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setArmadoFinalizar(null)
          }
        }}
        armado={armadoFinalizar}
        productos={productos}
        categorias={categorias}
        onFinalizado={recargarArmados}
      />
    </div>
  )
}

export default ArmadosPage
