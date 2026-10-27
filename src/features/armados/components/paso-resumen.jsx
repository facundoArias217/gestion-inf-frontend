import { useState } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/format'

const SIN_CLIENTE = 'sin-cliente'

function PasoResumen({
  esEdicion,
  grupos,
  total,
  faltantes,
  advertencias,
  hayErrores,
  nombre,
  onNombreChange,
  clienteId,
  onClienteIdChange,
  clientes,
  descripcion,
  onDescripcionChange,
  puedeFinalizar,
  enviando,
  onGuardar,
  onGuardarYFinalizar,
  onCancelar,
}) {
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-4">
        <div className="grid gap-1.5">
          <p className="text-base font-semibold">Resumen de la configuración</p>
          <p className="text-sm text-muted-foreground">
            Revisá los componentes elegidos y completá los datos del armado
            antes de guardarlo.
          </p>
        </div>

        <div className="grid gap-2">
          {faltantes.length > 0 && (
            <div className="grid gap-1.5 rounded-lg border border-destructive/30 p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <XCircle className="size-4" />
                Categorías obligatorias faltantes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {faltantes.map((faltante) => (
                  <Badge key={faltante} variant="destructive">
                    {faltante}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Podés guardar el borrador igual; la completitud se exige al
                finalizar.
              </p>
            </div>
          )}
          {faltantes.length === 0 && (
            <p className="flex items-center gap-1.5 rounded-lg border p-3 text-sm text-green-600">
              <CheckCircle2 className="size-4" />
              Todas las categorías obligatorias están cubiertas.
            </p>
          )}
          {advertencias.length > 0 && (
            <div className="grid gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <AlertTriangle className="size-4" />
                Advertencias de compatibilidad
              </p>
              <ul className="grid gap-1">
                {advertencias.map((advertencia) => (
                  <li key={advertencia} className="text-sm text-muted-foreground">
                    {advertencia}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Las advertencias son informativas y no impiden guardar ni
                finalizar.
              </p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.flatMap((grupo) =>
                grupo.items.map((item, indice) => (
                  <TableRow key={item.producto.id}>
                    {indice === 0 && (
                      <TableCell
                        rowSpan={grupo.items.length}
                        className="align-top font-medium whitespace-nowrap"
                      >
                        <span className="flex items-center gap-1.5">
                          <grupo.icono className="size-4 text-muted-foreground" />
                          {grupo.titulo}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="min-w-0">
                      <p className="truncate" title={item.producto.nombre}>
                        {item.producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.producto.marca}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.cantidad ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.producto.precio)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                )),
              )}
              {grupos.every((grupo) => grupo.items.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Todavía no elegiste componentes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <Card className="self-start">
        <CardHeader>
          <CardTitle className="text-base">Datos del armado</CardTitle>
          <CardDescription>
            {esEdicion
              ? 'Los cambios se guardan sobre el borrador existente.'
              : 'El armado se guarda en estado BORRADOR.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="nombre-armado" className="text-sm font-medium">
              Nombre del armado <span className="text-destructive">*</span>
            </label>
            <Input
              id="nombre-armado"
              placeholder="PC Gamer de Lucas"
              value={nombre}
              onChange={(event) => onNombreChange(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cliente-armado" className="text-sm font-medium">
              Cliente (opcional)
            </label>
            <Select
              value={clienteId == null ? SIN_CLIENTE : String(clienteId)}
              onValueChange={(valor) =>
                onClienteIdChange(valor === SIN_CLIENTE ? null : Number(valor))
              }
            >
              <SelectTrigger id="cliente-armado" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_CLIENTE}>Sin cliente</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={String(cliente.id)}>
                    {cliente.apellido}, {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="descripcion-armado" className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <Textarea
              id="descripcion-armado"
              placeholder="Para qué va a usar la PC, notas del vendedor…"
              rows={3}
              value={descripcion}
              onChange={(event) => onDescripcionChange(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Button
              onClick={() => setConfirmarFinalizar(true)}
              disabled={enviando || !puedeFinalizar}
              title={
                puedeFinalizar
                  ? undefined
                  : 'Completá las categorías obligatorias y corregí los errores para finalizar'
              }
            >
              Guardar y finalizar
            </Button>
            <Button
              variant="outline"
              onClick={onGuardar}
              disabled={enviando || hayErrores}
              title={
                hayErrores
                  ? 'Hay cantidades inválidas o stock insuficiente'
                  : undefined
              }
            >
              {enviando ? 'Guardando…' : 'Guardar borrador'}
            </Button>
            <Button variant="ghost" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmarFinalizar}
        onOpenChange={setConfirmarFinalizar}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar y finalizar el armado?</AlertDialogTitle>
            <AlertDialogDescription>
              {esEdicion
                ? 'Se guardan los cambios y el armado pasa a FINALIZADO.'
                : 'El armado se guarda directamente en FINALIZADO.'}{' '}
              Queda congelado (no se puede editar) y puede asociarse a un
              presupuesto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviando}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                setConfirmarFinalizar(false)
                onGuardarYFinalizar()
              }}
              disabled={enviando}
            >
              {enviando ? 'Procesando…' : 'Guardar y finalizar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PasoResumen
