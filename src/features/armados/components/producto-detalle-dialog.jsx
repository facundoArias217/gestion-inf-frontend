import { useState } from 'react'
import { Fan, MemoryStick, Plug, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from 'cn'
import { formatCurrency } from '@/lib/format'

function ImagenDetalle({ producto, icono: Icono }) {
  const [imagenFallida, setImagenFallida] = useState(false)
  const mostrarImagen = producto?.imagenUrl && !imagenFallida

  if (mostrarImagen) {
    return (
      <img
        src={producto.imagenUrl}
        alt={producto.nombre}
        className="size-20 rounded-xl object-cover"
        onError={() => setImagenFallida(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex size-20 items-center justify-center rounded-xl bg-muted',
      )}
    >
      <Icono className="size-9 text-muted-foreground" />
    </div>
  )
}

function specsVisibles(producto) {
  const specs = []

  if (producto.socket != null) {
    specs.push({ icono: Plug, etiqueta: 'Socket', valor: producto.socket })
  }
  if (producto.tipoMemoria != null) {
    specs.push({
      icono: MemoryStick,
      etiqueta: 'Tipo de memoria',
      valor: producto.tipoMemoria,
    })
  }
  if (producto.graficosIntegrados != null) {
    specs.push({
      icono: Video,
      etiqueta: 'Gráficos integrados',
      valor: producto.graficosIntegrados ? 'Sí' : 'No',
    })
  }
  if (producto.incluyeCooler != null) {
    specs.push({
      icono: Fan,
      etiqueta: 'Incluye cooler',
      valor: producto.incluyeCooler ? 'Sí' : 'No',
    })
  }

  return specs
}

function ProductoDetalleDialog({ producto, categoria, icono, open, onOpenChange }) {
  const specs = producto ? specsVisibles(producto) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <ImagenDetalle producto={producto} icono={icono} />
            <div className="grid min-w-0 gap-1">
              <DialogTitle>{producto?.nombre}</DialogTitle>
              <DialogDescription>
                {producto?.marca}
                {categoria ? ` · ${categoria.nombre}` : ''}
              </DialogDescription>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge>{producto && formatCurrency(producto.precio)}</Badge>
                <Badge variant={producto?.stock > 0 ? 'secondary' : 'destructive'}>
                  {producto && producto.stock > 0
                    ? `Stock: ${producto.stock}`
                    : 'Sin stock'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          {producto?.descripcion && (
            <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
          )}

          {specs.length > 0 && (
            <div className="grid gap-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Especificaciones</p>
              <ul className="grid gap-1.5">
                {specs.map((spec) => (
                  <li
                    key={spec.etiqueta}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <spec.icono className="size-4" />
                    {spec.etiqueta}: {spec.valor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductoDetalleDialog
