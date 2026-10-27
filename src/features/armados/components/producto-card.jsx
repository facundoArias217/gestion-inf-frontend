import { useState } from 'react'
import { CheckCircle2, Eye, PackageX } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { formatCurrency } from '@/lib/format'

function ImagenProducto({ producto, icono: Icono, className }) {
  const [imagenFallida, setImagenFallida] = useState(false)
  const mostrarImagen = producto.imagenUrl && !imagenFallida

  if (mostrarImagen) {
    return (
      <img
        src={producto.imagenUrl}
        alt={producto.nombre}
        className={cn('object-cover', className)}
        onError={() => setImagenFallida(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-muted',
        className,
      )}
    >
      <Icono className="size-6 text-muted-foreground" />
    </div>
  )
}

function ProductoCard({
  producto,
  icono,
  seleccionado,
  deshabilitado,
  motivoDeshabilitado,
  onSeleccionar,
  onVerDetalle,
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition',
        seleccionado
          ? 'border-primary ring-1 ring-primary'
          : 'hover:border-primary/40 hover:shadow-sm',
        deshabilitado && 'opacity-60',
      )}
    >
      {seleccionado && (
        <CheckCircle2 className="absolute top-3 right-3 size-5 text-primary" />
      )}

      <div className="flex items-start gap-3">
        <ImagenProducto
          producto={producto}
          icono={icono}
          className="size-14 shrink-0 rounded-lg"
        />
        <div className="grid min-w-0 gap-1">
          <p className="truncate text-sm font-medium" title={producto.nombre}>
            {producto.nombre}
          </p>
          <p className="text-xs text-muted-foreground">{producto.marca}</p>
          <Badge
            variant={producto.stock > 0 ? 'secondary' : 'destructive'}
            className="w-fit"
          >
            {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
          </Badge>
        </div>
      </div>

      {producto.descripcion && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {producto.descripcion}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{formatCurrency(producto.precio)}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onVerDetalle}
        >
          <Eye className="size-4" />
          Ver detalle
        </Button>
      </div>

      <Button
        type="button"
        variant={seleccionado ? 'default' : 'outline'}
        className="w-full"
        disabled={deshabilitado}
        title={deshabilitado ? motivoDeshabilitado : undefined}
        onClick={onSeleccionar}
      >
        {deshabilitado ? (
          <>
            <PackageX className="size-4" />
            {motivoDeshabilitado}
          </>
        ) : seleccionado ? (
          'Elegido'
        ) : (
          'Elegir'
        )}
      </Button>
    </div>
  )
}

export default ProductoCard
