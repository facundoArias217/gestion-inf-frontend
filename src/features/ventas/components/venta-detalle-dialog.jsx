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

function totalDe(venta) {
  return venta.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
}

function VentaDetalleDialog({ open, onOpenChange, venta, productos }) {
  const nombreDe = (productoId) =>
    productos.find((producto) => producto.id === productoId)?.nombre ?? '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de la venta #{venta?.id}</DialogTitle>
          <DialogDescription>
            {venta?.detalles?.length ?? 0} producto
            {venta?.detalles?.length === 1 ? '' : 's'} — total{' '}
            {formatCurrency(venta ? totalDe(venta) : 0)}
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
            {venta?.detalles?.map((detalle) => (
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
                {formatCurrency(venta ? totalDe(venta) : 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default VentaDetalleDialog
