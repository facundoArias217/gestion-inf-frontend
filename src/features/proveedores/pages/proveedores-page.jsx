import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, MoreHorizontal, Pencil, Plus, RotateCcw } from 'lucide-react'
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
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { formatCuit } from '@/lib/format'
import BajaProveedorDialog from '../components/baja-proveedor-dialog'
import ProveedorFormDialog from '../components/proveedor-form-dialog'
import { listarProveedores, reactivarProveedor } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'historico', label: 'Histórico' },
]

const ORDENES_PROVEEDORES = [
  { valor: 'nombre-asc', label: 'Razón social A-Z' },
  { valor: 'nombre-desc', label: 'Razón social Z-A' },
  { valor: 'fecha-asc', label: 'Más antiguos primero' },
  { valor: 'fecha-desc', label: 'Más nuevos primero' },
]

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('proveedores')
  const [formAbierto, setFormAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)
  const [proveedorBaja, setProveedorBaja] = useState(null)

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

    return ordenarListado(porEstado, orden, { campoNombre: 'razonSocial' })
  }, [proveedores, filtro, orden])

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

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="grid gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Proveedores
            </CardTitle>
            <CardDescription>
              Empresas y personas que suministran productos a la tienda; son el
              origen de las compras.
            </CardDescription>
          </div>
          <Button onClick={abrirAlta}>
            <Plus className="size-4" />
            Nuevo proveedor
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
              opciones={ORDENES_PROVEEDORES}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razón social</TableHead>
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
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay proveedores para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((proveedor) => (
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
