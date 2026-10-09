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
import StatusBadge from '@/components/status-badge'
import { formatCurrency, formatFecha } from '@/lib/format'

function totalDe(presupuesto, armado) {
  const totalSueltos = presupuesto.detalles.reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )
  const totalArmado = armado
    ? armado.componentes.reduce(
        (acum, componente) =>
          acum + componente.cantidad * componente.precioUnitario,
        0,
      )
    : 0
  return totalSueltos + totalArmado
}

function PresupuestoDetalleDialog({
  open,
  onOpenChange,
  presupuesto,
  clientes,
  armados,
  productos,
}) {
  const cliente = clientes.find((c) => c.id === presupuesto?.clienteId)
  const armado = armados.find((a) => a.id === presupuesto?.armadoId)

  const totalArmado = armado
    ? armado.componentes.reduce(
        (acum, componente) =>
          acum + componente.cantidad * componente.precioUnitario,
        0,
      )
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Presupuesto #{presupuesto?.id}
            <StatusBadge status={presupuesto?.estado} />
          </DialogTitle>
          <DialogDescription>
            {cliente ? `${cliente.apellido}, ${cliente.nombre}` : '—'} · desde{' '}
            {formatFecha(presupuesto?.fecha)} hasta{' '}
            {formatFecha(presupuesto?.fechaVencimiento)}
          </DialogDescription>
        </DialogHeader>

        {armado && (
          <div className="rounded-lg border p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Armado: {armado.nombre} —{' '}
              {armado.componentes.length} componentes
            </p>
            <p>
              Los componentes viven en el armado y no se copian al detalle.
              Total del armado: {formatCurrency(totalArmado)}
            </p>
          </div>
        )}

        {presupuesto?.detalles?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio cotizado</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presupuesto.detalles.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell className="font-medium">
                    {productos.find((p) => p.id === detalle.productoId)
                      ?.nombre ?? `Producto ${detalle.productoId}`}
                  </TableCell>
                  <TableCell className="text-right">
                    {detalle.cantidad}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(detalle.precioUnitario)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      detalle.cantidad * detalle.precioUnitario,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          !armado && (
            <p className="text-sm text-muted-foreground">
              Sin productos en el detalle.
            </p>
          )
        )}

        <p className="text-right text-sm font-semibold">
          Total: {formatCurrency(presupuesto ? totalDe(presupuesto, armado) : 0)}
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default PresupuestoDetalleDialog
