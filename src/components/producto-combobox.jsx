import ComboboxBuscable from '@/components/combobox-buscable'
import { cn } from 'cn'

function ProductoCombobox({
  productos,
  valor,
  onValorChange,
  placeholder = 'Buscar producto…',
  textoTrigger = 'Seleccioná un producto',
  grupoDe,
  className,
}) {
  return (
    <ComboboxBuscable
      className={className}
      items={productos.map((producto) => ({
        valor: String(producto.id),
        label: producto.nombre,
        keywords: producto.marca ?? '',
        deshabilitado: producto.stock === 0,
        producto,
      }))}
      valor={valor}
      onValorChange={onValorChange}
      placeholder={placeholder}
      textoTrigger={textoTrigger}
      gruposDe={grupoDe ? (item) => grupoDe(item.producto) : undefined}
      renderItem={(item) => (
        <span className="flex w-full items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate">
            {item.producto.nombre}
            {item.producto.marca && (
              <span className="text-muted-foreground"> · {item.producto.marca}</span>
            )}
          </span>
          <span
            className={cn(
              'shrink-0 text-xs tabular-nums',
              item.producto.stock === 0
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {item.producto.stock === 0 ? 'Sin stock' : `×${item.producto.stock}`}
          </span>
        </span>
      )}
    />
  )
}

export default ProductoCombobox
