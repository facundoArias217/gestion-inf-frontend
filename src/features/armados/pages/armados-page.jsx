import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Cpu,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
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
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePaginacion } from '@/hooks/use-paginacion'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCurrency } from '@/lib/format'
import ArmadoDetalleDialog from '../components/armado-detalle-dialog'
import FinalizarArmadoDialog from '../components/finalizar-armado-dialog'
import { duplicarArmado, listarArmados } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'BORRADOR', label: 'Borradores' },
  { valor: 'FINALIZADO', label: 'Finalizados' },
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
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useOrden('armados', 'fecha-desc')
  const [armadoDetalle, setArmadoDetalle] = useState(null)
  const [armadoFinalizar, setArmadoFinalizar] = useState(null)

  useDocumentTitle('Armá tu PC')
  const { pagina, setPagina, totalPaginas, paginar } = usePaginacion(filtrados.length, `${filtro}-${busqueda}-${orden}`)

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

    const porBusqueda = filtrarPorBusqueda(porEstado, busqueda, [
      'nombre',
      'descripcion',
      (armado) =>
        armado.clienteId != null
          ? (() => {
              const cliente = clientesPorId.get(armado.clienteId)
              return cliente ? `${cliente.apellido} ${cliente.nombre}` : ''
            })()
          : '',
    ])

    return ordenarListado(porBusqueda, orden)
  }, [armados, filtro, busqueda, orden, clientesPorId])

  const duplicar = async (armado) => {
    try {
      const copia = await duplicarArmado(armado.id)
      toast.success(`Armado «${copia.nombre}» creado en BORRADOR`)
      navigate(`/armados/${copia.id}/editar`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const visibles = paginar(filtrados)

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Armá tu PC"
        descripcion="Configuraciones de PC a partir de componentes del catálogo. Solo un armado FINALIZADO puede asociarse a un presupuesto."
        acciones={
          <Button onClick={() => navigate('/armados/nuevo')}>
            <Plus className="size-4" />
            Nuevo armado
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
                {filtrados.length} de {armados.length} armados
              </p>
            </div>
            <Buscador
              valor={busqueda}
              onValorChange={setBusqueda}
              placeholder="Buscar armados…"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="nombre">Nombre</TableHeadOrdenable>
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
                  <TableCell colSpan={6} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={Cpu}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : armados.length === 0 ? (
                      <EmptyState
                        icono={Cpu}
                        titulo="Todavía no hay armados"
                        descripcion="Armá una PC con componentes del catálogo y finalizada queda lista para presupuestar."
                        accion={{ icono: Plus, label: 'Armar el primero' }}
                        onAccion={() => navigate('/armados/nuevo')}
                      />
                    ) : (
                      <EmptyState
                        icono={Cpu}
                        titulo="No hay resultados"
                        descripcion="Ningún armado coincide con el filtro de estado."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((armado) => (
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
                        {armado.estado === 'FINALIZADO' && (
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
                              <DropdownMenuItem onClick={() => duplicar(armado)}>
                                <Copy className="size-4" />
                                Duplicar
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
