import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'

import EmptyState from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/format'
import ProductoCard from './producto-card'

function PasoCategoria({
  paso,
  items,
  selecciones,
  onSeleccionar,
  onCambiarCantidad,
  onQuitar,
  onVerDetalle,
}) {
  const [busqueda, setBusqueda] = useState('')

  const termino = busqueda.trim().toLowerCase()
  const filtrados = termino
    ? items.filter(
        (item) =>
          item.producto.nombre.toLowerCase().includes(termino) ||
          item.producto.marca.toLowerCase().includes(termino),
      )
    : items

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <paso.icono className="size-5 text-primary" />
        <p className="text-base font-semibold">{paso.titulo}</p>
        <Badge variant={paso.obligatorio ? 'destructive' : 'secondary'}>
          {paso.obligatorio ? 'Obligatoria' : 'Opcional'}
        </Badge>
        {selecciones.length > 0 && (
          <Badge variant="success">
            {selecciones.length} elegido{selecciones.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder={`Buscar en ${paso.titulo.toLowerCase()}…`}
          className="pl-8"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icono={paso.icono}
          titulo="Sin productos en esta categoría"
          descripcion="Se pueden cargar productos desde el catálogo (Productos)."
        />
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay coincidencias con la búsqueda.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((item) => (
            <ProductoCard
              key={item.producto.id}
              producto={item.producto}
              icono={paso.icono}
              seleccionado={item.seleccionado}
              deshabilitado={item.deshabilitado}
              motivoDeshabilitado={item.motivo}
              onSeleccionar={() => onSeleccionar(item.producto)}
              onVerDetalle={() => onVerDetalle(item.producto)}
            />
          ))}
        </div>
      )}

      {selecciones.length > 0 && (
        <div className="grid gap-2 rounded-xl border bg-muted/40 p-3">
          <p className="text-sm font-medium">Elegidos en este paso</p>
          {selecciones.map((seleccion) => (
            <div
              key={seleccion.producto.id}
              className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={seleccion.producto.nombre}>
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
                  seleccion.cantidad == null || Number.isNaN(seleccion.cantidad)
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
      )}
    </div>
  )
}

export default PasoCategoria
