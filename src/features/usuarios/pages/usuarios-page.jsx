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
import { useAuth } from '@/hooks/use-auth'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import BajaUsuarioDialog from '../components/baja-usuario-dialog'
import UsuarioFormDialog from '../components/usuario-form-dialog'
import { cambiarEstadoUsuario, listarUsuarios } from '../services'

const FILTROS = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'activos', label: 'Activos' },
  { valor: 'historico', label: 'Histórico' },
]

function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [formAbierto, setFormAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [usuarioBaja, setUsuarioBaja] = useState(null)
  const [orden, setOrden] = useOrden('usuarios')

  const recargarUsuarios = useCallback(() => {
    listarUsuarios()
      .then((datos) => setUsuarios(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los usuarios'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarUsuarios()
      .then((datos) => {
        if (!cancelado) {
          setUsuarios(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los usuarios')
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
    const filtradosPorEstado = (() => {
      if (filtro === 'activos') {
        return usuarios.filter((usuario) => usuario.activo)
      }
      if (filtro === 'historico') {
        return usuarios.filter((usuario) => !usuario.activo)
      }
      return usuarios
    })()

    return ordenarListado(filtradosPorEstado, orden)
  }, [usuarios, filtro, orden])

  const abrirAlta = () => {
    setUsuarioEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (usuario) => {
    setUsuarioEditando(usuario)
    setFormAbierto(true)
  }

  const reactivar = async (usuario) => {
    try {
      await cambiarEstadoUsuario(usuario.id, true)
      toast.success(`Usuario ${usuario.apellido}, ${usuario.nombre} reactivado`)
      recargarUsuarios()
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
              Usuarios
            </CardTitle>
            <CardDescription>
              Usuarios internos con roles Administrador y Vendedor (RF-USR-01).
              Las bajas son lógicas: el Histórico permite reactivar.
            </CardDescription>
          </div>
          <Button onClick={abrirAlta}>
            <Plus className="size-4" />
            Nuevo usuario
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
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay usuarios para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((usuario) => {
                  const esPropio = usuario.id === usuarioActual?.id

                  return (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        {usuario.apellido}, {usuario.nombre}
                        {esPropio && (
                          <span className="ml-1 text-muted-foreground">
                            (vos)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.email}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={usuario.rol} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones de ${usuario.apellido}, ${usuario.nombre}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => abrirEdicion(usuario)}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            {usuario.activo ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                disabled={esPropio}
                                onClick={() => setUsuarioBaja(usuario)}
                              >
                                <Archive className="size-4" />
                                Dar de baja
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivar(usuario)}
                              >
                                <RotateCcw className="size-4" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UsuarioFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        usuario={usuarioEditando}
        onGuardado={recargarUsuarios}
      />
      <BajaUsuarioDialog
        open={usuarioBaja != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setUsuarioBaja(null)
          }
        }}
        usuario={usuarioBaja}
        onBajaConfirmada={recargarUsuarios}
      />
    </div>
  )
}

export default UsuariosPage
