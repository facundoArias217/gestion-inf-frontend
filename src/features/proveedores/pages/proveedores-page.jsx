import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, MoreHorizontal, Pencil, Plus, RotateCcw, Truck } from 'lucide-react'
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
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePaginacion } from '@/hooks/use-paginacion'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCuit } from '@/lib/format'
import BajaProveedorDialog from '../components/baja-proveedor-dialog'
import ProveedorFormDialog from '../components/proveedor-form-dialog'
import { listarProveedores, reactivarProveedor } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'historico', label: 'Histórico' },
]

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useOrden('proveedores')
  const [formAbierto, setFormAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)
  const [proveedorBaja, setProveedorBaja] = useState(null)

  useDocumentTitle('Proveedores')

  const recargarProveedores = useCallback(() => {
    listarProveedores()
      .then((datos) => setProveedores(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los proveedores'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarProveedores()
      .then((datos) => {
        if (!cancelado) {
          setProveedores(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los proveedores')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  const filtrados = useMemo(() => {
    const porEstado = proveedores.filter((proveedor) => {
      if (filtro === 'activas') {
        return proveedor.activo
      }
      if (filtro === 'historico') {
        return !proveedor.activo
      }
      return true
    })

    const porBusqueda = filtrarPorBusqueda(porEstado, busqueda, [
      'razonSocial',
      'cuit',
      'email',
    ])

    return ordenarListado(porBusqueda, orden, { campoNombre: 'razonSocial' })
  }, [proveedores, filtro, busqueda, orden])

  const abrirAlta = () => {
    setProveedorEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (proveedor) => {
    setProveedorEditando(proveedor)
    setFormAbierto(true)
  }

  const reactivar = async (proveedor) => {
    try {
      await reactivarProveedor(proveedor.id)
      toast.success(`Proveedor «${proveedor.razonSocial}» reactivado`)
      recargarProveedores()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const { pagina, setPagina, totalPaginas, paginar } = usePaginacion(filtrados.length, `${filtro}-${busqueda}-${orden}`)
  const visibles = paginar(filtrados)

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Proveedores"
        descripcion="Empresas y personas que suministran productos a la tienda; son el origen de las compras."
        acciones={
          <Button onClick={abrirAlta}>
            <Plus className="size-4" />
            Nuevo proveedor
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
                {filtrados.length} de {proveedores.length} proveedores
              </p>
            </div>
            <Buscador
              valor={busqueda}
              onValorChange={setBusqueda}
              placeholder="Buscar proveedores…"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="nombre">Razón social</TableHeadOrdenable>
                <TableHead>CUIT/CUIL</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12 text-right">Acciones</TableHead>
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
                  <TableCell colSpan={7} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={Truck}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : proveedores.length === 0 ? (
                      <EmptyState
                        icono={Truck}
                        titulo="Todavía no hay proveedores"
                        descripcion="El primer proveedor habilita el registro de compras."
                        accion={{ icono: Plus, label: 'Crear el primero' }}
                        onAccion={abrirAlta}
                      />
                    ) : (
                      <EmptyState
                        icono={Truck}
                        titulo="No hay resultados"
                        descripcion="Ningún proveedor coincide con el filtro activo."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell className="font-medium">
                      {proveedor.razonSocial}
                    </TableCell>
                    <TableCell>{formatCuit(proveedor.cuit)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {proveedor.email}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {proveedor.telefono}
                    </TableCell>
                    <TableCell className="hidden max-w-xs text-muted-foreground lg:table-cell">
                      {proveedor.direccion}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={proveedor.activo ? 'ACTIVO' : 'INACTIVO'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones de ${proveedor.razonSocial}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => abrirEdicion(proveedor)}
                          >
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          {proveedor.activo ? (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setProveedorBaja(proveedor)}
                            >
                              <Archive className="size-4" />
                              Dar de baja
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => reactivar(proveedor)}
                            >
                              <RotateCcw className="size-4" />
                              Reactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onPaginaChange={setPagina} />
        </CardContent>
      </Card>

      <ProveedorFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        proveedor={proveedorEditando}
        onGuardado={recargarProveedores}
      />
      <BajaProveedorDialog
        open={proveedorBaja != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setProveedorBaja(null)
          }
        }}
        proveedor={proveedorBaja}
        onBajaConfirmada={recargarProveedores}
      />
    </div>
  )
}

export default ProveedoresPage
