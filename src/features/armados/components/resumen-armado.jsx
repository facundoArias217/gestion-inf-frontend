import { AlertTriangle, CheckCircle2, PackageOpen } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

function ResumenArmado({ grupos, total, faltantes, advertencias }) {
  const cantidadComponentes = grupos.reduce(
    (acum, grupo) => acum + grupo.items.length,
    0,
  )

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-base">Tu configuración</CardTitle>
        <CardDescription>
          {cantidadComponentes === 0
            ? 'Todavía no elegiste componentes.'
            : `${cantidadComponentes} componente${cantidadComponentes > 1 ? 's' : ''} seleccionado${cantidadComponentes > 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {cantidadComponentes > 0 && (
          <div className="grid gap-3">
            {grupos.map((grupo) =>
              grupo.items.length === 0 ? null : (
                <div key={grupo.titulo} className="grid gap-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    <grupo.icono className="size-3.5" />
                    {grupo.titulo}
                  </p>
                  {grupo.items.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <p
                        className="min-w-0 truncate"
                        title={item.producto.nombre}
                      >
                        {item.producto.nombre}
                        <span className="text-muted-foreground">
                          {' '}
                          ×{item.cantidad ?? 0}
                        </span>
                      </p>
                      <p className="shrink-0 text-muted-foreground">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        )}

        {faltantes.length > 0 ? (
          <div className="grid gap-1.5 rounded-lg border border-destructive/30 p-2.5">
            <p className="text-xs font-medium text-destructive">
              Categorías obligatorias pendientes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {faltantes.map((nombre) => (
                <Badge key={nombre} variant="destructive">
                  {nombre}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="size-4" />
            Completitud obligatoria cubierta
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-base font-semibold">{formatCurrency(total)}</p>
        </div>

        <div className="grid gap-1.5">
          {advertencias.length > 0 && (
            <div className="grid gap-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <AlertTriangle className="size-3.5" />
                {advertencias.length} advertencia{advertencias.length > 1 ? 's' : ''}
              </p>
              <ul className="grid max-h-36 gap-1 overflow-y-auto pr-1">
                {advertencias.map((advertencia) => (
                  <li key={advertencia} className="text-xs text-muted-foreground">
                    {advertencia}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cantidadComponentes === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PackageOpen className="size-3.5" />
              Elegí componentes paso a paso.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Las advertencias son informativas; la completitud se exige al
            finalizar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResumenArmado
