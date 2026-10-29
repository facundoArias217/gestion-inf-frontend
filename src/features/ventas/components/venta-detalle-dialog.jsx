import StatusBadge from '@/components/status-badge'
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
  if (typeof venta?.total === 'number') {
    return venta.total
  }
  return (venta?.detalles ?? []).reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
}

function saldoDe(venta) {
  return typeof venta?.saldo === 'number' ? venta.saldo : totalDe(venta)
}

function estadoCobroDe(venta) {
  if (venta?.estadoCobro) {
    return venta.estadoCobro
  }
  const total = totalDe(venta)
  const saldo = saldoDe(venta)
  if (saldo <= 0) {
    return 'COBRADA'
  }
  return saldo < total ? 'PARCIAL' : 'SIN_COBRAR'
}

function VentaDetalleDialog({ open, onOpenChange, venta, productos }) {
  const nombreDe = (productoId) =>
    productos.find((producto) => producto.id === productoId)?.nombre ?? '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Detalle de la venta #{venta?.id}
            {venta && <StatusBadge status={estadoCobroDe(venta)} />}
          </DialogTitle>
          <DialogDescription>
            {venta?.detalles?.length ?? 0} producto
            {venta?.detalles?.length === 1 ? '' : 's'} — total{' '}
            {formatCurrency(totalDe(venta))}
            {venta?.estado ? ` · venta ${venta.estado}` : ''}
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
                {formatCurrency(totalDe(venta))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="grid gap-1 rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Saldo pendiente</span>
            <span
              className={
                saldoDe(venta) > 0 ? 'font-medium' : 'text-muted-foreground'
              }
            >
              {formatCurrency(saldoDe(venta))}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VentaDetalleDialog
