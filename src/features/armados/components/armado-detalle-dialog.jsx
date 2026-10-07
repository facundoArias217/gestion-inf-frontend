import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'

function totalDe(armado) {
  return armado.componentes.reduce(
    (acum, componente) => acum + componente.cantidad * componente.precioUnitario,
    0,
  )
}

function ArmadoDetalleDialog({ open, onOpenChange, armado, productos, categorias }) {
  const productoDe = (productoId) =>
    productos.find((producto) => producto.id === productoId)

  const categoriaDe = (productoId) => {
    const producto = productoDe(productoId)
    return (
      categorias.find((categoria) => categoria.id === producto?.categoriaId)
        ?.nombre ?? '—'
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{armado?.nombre}</DialogTitle>
          <DialogDescription>
            {armado?.descripcion || 'Sin descripción'} —{' '}
            {armado?.componentes?.length ?? 0} componente
            {armado?.componentes?.length === 1 ? '' : 's'} — total{' '}
            {formatCurrency(armado ? totalDe(armado) : 0)}
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {armado?.componentes?.map((componente) => (
              <TableRow key={componente.id}>
                <TableCell className="text-muted-foreground">
                  {categoriaDe(componente.productoId)}
                </TableCell>
                <TableCell className="font-medium">
                  {productoDe(componente.productoId)?.nombre ??
                    `Producto ${componente.productoId}`}
                </TableCell>
                <TableCell className="text-right">
                  {componente.cantidad}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(componente.precioUnitario)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    componente.cantidad * componente.precioUnitario,
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(armado ? totalDe(armado) : 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default ArmadoDetalleDialog
