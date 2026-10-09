import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, MoreHorizontal, Package, Pencil, Plus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import Buscador from '@/components/buscador'
import ComboboxBuscable from '@/components/combobox-buscable'
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
import { useAuth } from '@/hooks/use-auth'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { usePaginacion } from '@/hooks/use-paginacion'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCurrency } from '@/lib/format'
import BajaProductoDialog from '../components/baja-producto-dialog'
import ProductoFormDialog from '../components/producto-form-dialog'
import { listarProductos, reactivarProducto } from '../services'

const FILTROS = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'activas', label: 'Activas' },
  { valor: 'historico', label: 'Histórico' },
]

function ProductosPage() {
  const { isAdmin } = useAuth()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useOrden('productos')
  const [formAbierto, setFormAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [productoBaja, setProductoBaja] = useState(null)

  useDocumentTitle('Productos')
  const { pagina, setPagina, totalPaginas, paginar } = usePaginacion(filtrados.length, `${filtro}-${busqueda}-${orden}`)

  const recargarProductos = useCallback(() => {
    listarProductos()
      .then((datos) => setProductos(datos))
      .catch((error) =>
        toast.error(error.message ?? 'No se pudieron cargar los productos'),
      )
  }, [])

  useEffect(() => {
    let cancelado = false

    listarProductos()
      .then((datos) => {
        if (!cancelado) {
          setProductos(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los productos')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

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

    return () => {
      cancelado = true
    }
  }, [])

  const categoriasPorId = useMemo(() => {
    const mapa = new Map()
    categorias.forEach((categoria) => mapa.set(categoria.id, categoria))
    return mapa
  }, [categorias])

  const filtrados = useMemo(() => {
    const porEstado = productos.filter((producto) => {
      if (filtro === 'activas') {
        return producto.activo
      }
      if (filtro === 'historico') {
        return !producto.activo
      }
      return true
    })

    const porCategoria =
      categoriaFiltro === 'todas'
        ? porEstado
        : porEstado.filter(
            (producto) => String(producto.categoriaId) === categoriaFiltro,
          )

    const porBusqueda = filtrarPorBusqueda(porCategoria, busqueda, [
      'nombre',
      'marca',
    ])

    return ordenarListado(porBusqueda, orden)
  }, [productos, filtro, categoriaFiltro, busqueda, orden])

  const abrirAlta = () => {
    setProductoEditando(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (producto) => {
    setProductoEditando(producto)
    setFormAbierto(true)
  }

  const reactivar = async (producto) => {
    try {
      await reactivarProducto(producto.id)
      toast.success(`Producto «${producto.nombre}» reactivado`)
      recargarProductos()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const visibles = paginar(filtrados)

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Productos"
        descripcion={
          isAdmin
            ? 'Catálogo centralizado de la tienda: productos sueltos y componentes para armados.'
            : 'Consulta del catálogo en modo solo-lectura.'
        }
        acciones={
          isAdmin && (
            <Button onClick={abrirAlta}>
              <Plus className="size-4" />
              Nuevo producto
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
                {filtrados.length} de {productos.length} productos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ComboboxBuscable
                className="sm:w-44"
                items={[
                  { valor: 'todas', label: 'Todas las categorías' },
                  ...categorias.map((categoria) => ({
                    valor: String(categoria.id),
                    label: categoria.nombre,
                  })),
                ]}
                valor={categoriaFiltro}
                onValorChange={setCategoriaFiltro}
                placeholder="Buscar categoría…"
                textoTrigger="Todas las categorías"
              />
              <Buscador
                valor={busqueda}
                onValorChange={setBusqueda}
                placeholder="Buscar productos…"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="nombre">Nombre</TableHeadOrdenable>
                <TableHead className="hidden lg:table-cell">Marca</TableHead>
                <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="precio">Precio</TableHeadOrdenable>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="stock">Stock</TableHeadOrdenable>
                <TableHead>Estado</TableHead>
                {isAdmin && (
                  <TableHead className="w-12 text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={isAdmin ? 7 : 6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={Package}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : productos.length === 0 ? (
                      <EmptyState
                        icono={Package}
                        titulo="Todavía no hay productos"
                        descripcion="El catálogo es el punto de partida de compras, ventas y armados."
                        accion={
                          isAdmin && {
                            icono: Plus,
                            label: 'Crear el primer producto',
                          }
                        }
                        onAccion={abrirAlta}
                      />
                    ) : (
                      <EmptyState
                        icono={Package}
                        titulo="No hay resultados"
                        descripcion="Ningún producto coincide con los filtros activos."
                        accion={{
                          label: 'Limpiar filtros',
                          variant: 'outline',
                        }}
                        onAccion={() => {
                          setFiltro('todas')
                          setCategoriaFiltro('todas')
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">
                      {producto.nombre}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {producto.marca}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {categoriasPorId.get(producto.categoriaId)?.nombre ??
                        '—'}
                    </TableCell>
                    <TableCell>{formatCurrency(producto.precio)}</TableCell>
                    <TableCell
                      className={
                        producto.stock === 0
                          ? 'font-medium text-destructive'
                          : undefined
                      }
                    >
                      {producto.stock === 0 ? 'Sin stock' : producto.stock}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={producto.activo ? 'ACTIVO' : 'INACTIVO'}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones de ${producto.nombre}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => abrirEdicion(producto)}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            {producto.activo ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setProductoBaja(producto)}
                              >
                                <Archive className="size-4" />
                                Dar de baja
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivar(producto)}
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
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onPaginaChange={setPagina} />
        </CardContent>
      </Card>

      <ProductoFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        producto={productoEditando}
        categorias={categorias}
        onGuardado={recargarProductos}
      />
      <BajaProductoDialog
        open={productoBaja != null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setProductoBaja(null)
          }
        }}
        producto={productoBaja}
        onBajaConfirmada={recargarProductos}
      />
    </div>
  )
}

export default ProductosPage
