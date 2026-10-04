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
import BajaClienteDialog from '../components/baja-cliente-dialog'
import ClienteFormDialog from '../components/cliente-form-dialog'
import { listarClientes, reactivarCliente } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'historico', label: 'Histórico' },
]

function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useOrden('clientes')
  const [formAbierto, setFormAbierto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [clienteBaja, setClienteBaja] = useState(null)

  const recargarClientes = useCallback(() => {
    listarClientes()
      .then((datos) => setClientes(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los clientes'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarClientes()
      .then((datos) => {
        if (!cancelado) {
          setClientes(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los clientes')
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
    const porEstado = clientes.filter((cliente) => {
      if (filtro === 'activas') {
        return cliente.activo
      }
      if (filtro === 'historico') {
        return !cliente.activo
      }
      return true
    })

    return ordenarListado(porEstado, orden, { campoNombre: 'apellido' })
  }, [clientes, filtro, orden])

  const abrirAlta = () => {
    setClienteEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (cliente) => {
    setClienteEditando(cliente)
    setFormAbierto(true)
  }

  const reactivar = async (cliente) => {
    try {
      await reactivarCliente(cliente.id)
      toast.success(
        `Cliente «${cliente.apellido}, ${cliente.nombre}» reactivado`,
      )
      recargarClientes()
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
              Clientes
            </CardTitle>
            <CardDescription>
              Personas que solicitan presupuestos y realizan compras; se
              asocian a presupuestos y ventas.
            </CardDescription>
          </div>
          <Button onClick={abrirAlta}>
            <Plus className="size-4" />
            Nuevo cliente
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
            <OrdenSelect orden={orden} onOrdenChange={setOrden} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apellido y nombre</TableHead>
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
                    No hay clientes para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.apellido}, {cliente.nombre}
                    </TableCell>
                    <TableCell>{formatCuit(cliente.cuil)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cliente.email}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {cliente.telefono}
                    </TableCell>
                    <TableCell className="hidden max-w-xs text-muted-foreground lg:table-cell">
                      {cliente.direccion}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones de ${cliente.apellido}, ${cliente.nombre}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => abrirEdicion(cliente)}
                          >
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          {cliente.activo ? (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setClienteBaja(cliente)}
                            >
                              <Archive className="size-4" />
                              Dar de baja
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => reactivar(cliente)}
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

      <ClienteFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        cliente={clienteEditando}
        onGuardado={recargarClientes}
      />
      <BajaClienteDialog
        open={clienteBaja != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setClienteBaja(null)
          }
        }}
        cliente={clienteBaja}
        onBajaConfirmada={recargarClientes}
      />
    </div>
  )
}

export default ClientesPage
