import { Package, Search, Trash2 } from 'lucide-react'

import EmptyState from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import ProductoCard from './producto-card'

const SIN_CATEGORIA = 'sin-categoria'

function PasoOtros({
  categoriasDisponibles,
  categoriaElegidaId,
  onCategoriaElegida,
  items,
  gruposExtras,
  onSeleccionar,
  onCambiarCantidad,
  onQuitar,
  onVerDetalle,
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Package className="size-5 text-primary" />
        <p className="text-base font-semibold">Otros componentes</p>
        <Badge variant="secondary">Opcional</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Sumá periféricos o cualquier otro producto de las categorías restantes.
      </p>

      <Select
        value={categoriaElegidaId == null ? SIN_CATEGORIA : String(categoriaElegidaId)}
        onValueChange={(valor) =>
          onCategoriaElegida(valor === SIN_CATEGORIA ? null : Number(valor))
        }
      >
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder="Elegí una categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SIN_CATEGORIA}>Sin categoría</SelectItem>
          {categoriasDisponibles.map((categoria) => (
            <SelectItem key={categoria.id} value={String(categoria.id)}>
              {categoria.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {categoriaElegidaId == null ? (
        <EmptyState
          icono={Search}
          titulo="Elegí una categoría para ver sus productos"
          descripcion="Los componentes que agregues acá se suman al armado como opcionales."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icono={Package}
          titulo="Sin productos en esta categoría"
          descripcion="Se pueden cargar productos desde el catálogo (Productos)."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ProductoCard
              key={item.producto.id}
              producto={item.producto}
              icono={Package}
              seleccionado={item.seleccionado}
              deshabilitado={item.deshabilitado}
              motivoDeshabilitado={item.motivo}
              onSeleccionar={() => onSeleccionar(item.producto)}
              onVerDetalle={() => onVerDetalle(item.producto)}
            />
          ))}
        </div>
      )}

      {gruposExtras.length > 0 && (
        <div className="grid gap-3 rounded-xl border bg-muted/40 p-3">
          <p className="text-sm font-medium">Agregados</p>
          {gruposExtras.map((grupo) => (
            <div key={grupo.categoria.id} className="grid gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {grupo.categoria.nombre}
              </p>
              {grupo.selecciones.map((seleccion) => (
                <div
                  key={seleccion.producto.id}
                  className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      title={seleccion.producto.nombre}
                    >
                      {seleccion.producto.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seleccion.producto.marca} ·{' '}
                      {formatCurrency(seleccion.producto.precio)}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Cant."
                    value={
                      seleccion.cantidad == null ||
                      Number.isNaN(seleccion.cantidad)
                        ? ''
                        : seleccion.cantidad
                    }
                    onChange={(event) =>
                      onCambiarCantidad(
                        seleccion.producto.id,
                        event.target.value === '' ? null : Number(event.target.value),
                      )
                    }
                  />
                  <p className="text-right text-sm text-muted-foreground">
                    {formatCurrency(
                      (seleccion.producto.precio ?? 0) * (seleccion.cantidad ?? 0),
                    )}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${seleccion.producto.nombre}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => onQuitar(seleccion.producto.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  {seleccion.error && (
                    <p className="text-sm text-destructive sm:col-span-4">
                      {seleccion.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PasoOtros
