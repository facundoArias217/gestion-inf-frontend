import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, MoreHorizontal, Pencil, Plus, RotateCcw, Tags } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import Buscador from '@/components/buscador'
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
import { useAuth } from '@/hooks/use-auth'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import BajaCategoriaDialog from '../components/baja-categoria-dialog'
import CategoriaFormDialog from '../components/categoria-form-dialog'
import { listarCategorias, reactivarCategoria } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'historico', label: 'Histórico' },
]

function CategoriasPage() {
  const { isAdmin } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [formAbierto, setFormAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [categoriaBaja, setCategoriaBaja] = useState(null)
  const [orden, setOrden] = useOrden('categorias')

  useDocumentTitle('Categorías')

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
    const filtradasPorEstado = (() => {
      if (filtro === 'activas') {
        return categorias.filter((categoria) => categoria.activo)
      }
      if (filtro === 'historico') {
        return categorias.filter((categoria) => !categoria.activo)
      }
      return categorias
    })()

    const porBusqueda = filtrarPorBusqueda(filtradasPorEstado, busqueda, [
      'nombre',
      'descripcion',
    ])

    return ordenarListado(porBusqueda, orden)
  }, [categorias, filtro, busqueda, orden])

  const abrirAlta = () => {
    setCategoriaEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (categoria) => {
    setCategoriaEditando(categoria)
    setFormAbierto(true)
  }

  const reactivar = async (categoria) => {
    try {
      await reactivarCategoria(categoria.id)
      toast.success(`Categoría «${categoria.nombre}» reactivada`)
      recargarCategorias()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Categorías"
        descripcion={
          isAdmin
            ? 'Clasificación de los productos del catálogo.'
            : 'Consulta del catálogo en modo solo-lectura.'
        }
        acciones={
          isAdmin && (
            <Button onClick={abrirAlta}>
              <Plus className="size-4" />
              Nueva categoría
            </Button>
          )
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
                {filtradas.length} de {categorias.length} categorías
              </p>
            </div>
            <OrdenSelect orden={orden} onOrdenChange={setOrden} />
            <Buscador
              valor={busqueda}
              onValorChange={setBusqueda}
              placeholder="Buscar categorías…"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden lg:table-cell">Descripción</TableHead>
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
                  <TableCell colSpan={isAdmin ? 4 : 3} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={Tags}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : categorias.length === 0 ? (
                      <EmptyState
                        icono={Tags}
                        titulo="Todavía no hay categorías"
                        descripcion="La primera categoría que crees habilita el alta de productos."
                        accion={
                          isAdmin && {
                            icono: Plus,
                            label: 'Crear la primera categoría',
                          }
                        }
                        onAccion={abrirAlta}
                      />
                    ) : (
                      <EmptyState
                        icono={Tags}
                        titulo="No hay resultados"
                        descripcion="Ninguna categoría coincide con el filtro activo."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtradas.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">
                      {categoria.nombre}
                    </TableCell>
                    <TableCell className="hidden max-w-sm text-muted-foreground lg:table-cell">
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
                            {categoria.activo ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCategoriaBaja(categoria)}
                              >
                                <Archive className="size-4" />
                                Dar de baja
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivar(categoria)}
                              >
                                <RotateCcw className="size-4" />
                                Reactivar
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
