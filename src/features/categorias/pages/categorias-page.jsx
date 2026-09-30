import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, MoreHorizontal, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'

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
import BajaCategoriaDialog from '../components/baja-categoria-dialog'
import CategoriaFormDialog from '../components/categoria-form-dialog'
import { listarCategorias } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'inactivas', label: 'Inactivas' },
]

function CategoriasPage() {
  const { isAdmin } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [formAbierto, setFormAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [categoriaBaja, setCategoriaBaja] = useState(null)

  const recargarCategorias = useCallback(() => {
    listarCategorias()
      .then((datos) => setCategorias(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar las categorías'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarCategorias()
      .then((datos) => {
        if (!cancelado) {
          setCategorias(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar las categorías')
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

  const filtradas = useMemo(() => {
    if (filtro === 'activas') {
      return categorias.filter((categoria) => categoria.activo)
    }
    if (filtro === 'inactivas') {
      return categorias.filter((categoria) => !categoria.activo)
    }
    return categorias
  }, [categorias, filtro])

  const abrirAlta = () => {
    setCategoriaEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (categoria) => {
    setCategoriaEditando(categoria)
    setFormAbierto(true)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Categorías
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Clasificación de los productos del catálogo.'
                : 'Consulta del catálogo en modo solo-lectura (RN-USR-03).'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={abrirAlta}>
              <Plus className="size-4" />
              Nueva categoría
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs value={filtro} onValueChange={setFiltro}>
            <TabsList>
              {FILTROS.map((filtroDef) => (
                <TabsTrigger key={filtroDef.valor} value={filtroDef.valor}>
                  {filtroDef.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && (
                  <TableHead className="w-12 text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={isAdmin ? 4 : 3}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtradas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay categorías para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtradas.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">
                      {categoria.nombre}
                    </TableCell>
                    <TableCell className="max-w-sm text-muted-foreground">
                      {categoria.descripcion || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={categoria.activo ? 'ACTIVO' : 'INACTIVO'}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones de ${categoria.nombre}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => abrirEdicion(categoria)}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            {categoria.activo && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCategoriaBaja(categoria)}
                              >
                                <Archive className="size-4" />
                                Dar de baja
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoriaFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        categoria={categoriaEditando}
        onGuardado={recargarCategorias}
      />
      <BajaCategoriaDialog
        open={categoriaBaja != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCategoriaBaja(null)
          }
        }}
        categoria={categoriaBaja}
        onBajaConfirmada={recargarCategorias}
      />
    </div>
  )
}

export default CategoriasPage
