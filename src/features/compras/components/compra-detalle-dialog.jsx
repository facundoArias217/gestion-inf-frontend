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

function totalDe(compra) {
  return compra.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
}

function CompraDetalleDialog({ open, onOpenChange, compra, productos }) {
  const nombreDe = (productoId) =>
    productos.find((producto) => producto.id === productoId)?.nombre ?? '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de la compra #{compra?.id}</DialogTitle>
          <DialogDescription>
            {compra?.detalles?.length ?? 0} producto
            {compra?.detalles?.length === 1 ? '' : 's'} — total {formatCurrency(
              compra ? totalDe(compra) : 0,
            )}
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compra?.detalles?.map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="font-medium">
                  {nombreDe(detalle.productoId)}
                </TableCell>
                <TableCell className="text-right">{detalle.cantidad}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(detalle.precioUnitario)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(detalle.cantidad * detalle.precioUnitario)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(compra ? totalDe(compra) : 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default CompraDetalleDialog
