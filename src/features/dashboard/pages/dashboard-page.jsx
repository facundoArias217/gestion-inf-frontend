import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'

import PageHeader from '@/components/page-header'
import StatusBadge from '@/components/status-badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarProveedores } from '@/features/proveedores/services'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency, formatFecha } from '@/lib/format'
import { obtenerDashboard } from '../services'

function DashboardPage() {
  const [metricas, setMetricas] = useState(null)
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)

  useDocumentTitle('Dashboard')

  useEffect(() => {
    let cancelado = false

    obtenerDashboard()
      .then((datos) => {
        if (!cancelado) {
          setMetricas(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudo cargar el dashboard')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    listarProveedores()
      .then((datos) => {
        if (!cancelado) {
          setProveedores(datos)
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [])

  if (cargando || !metricas) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  const proveedoresPorId = new Map(
    proveedores.map((proveedor) => [proveedor.id, proveedor]),
  )

  const tarjetas = [
    {
      titulo: 'Productos de bajo stock',
      detalle: `${metricas.productosBajoStock.total} activos con stock ≤ 5`,
      icono: AlertTriangle,
      principal: String(metricas.productosBajoStock.total),
      acento: 'var(--chart-4)',
    },
    {
      titulo: 'Ventas de hoy',
      detalle: `${metricas.ventasHoy.cantidad} completadas`,
      icono: ShoppingCart,
      principal: formatCurrency(metricas.ventasHoy.montoTotal),
      acento: 'var(--chart-2)',
    },
    {
      titulo: 'Ventas del mes',
      detalle: `${metricas.ventasMes.cantidad} completadas`,
      icono: CalendarDays,
      principal: formatCurrency(metricas.ventasMes.montoTotal),
      acento: 'var(--chart-1)',
    },
    {
      titulo: 'Presupuestos pendientes',
      detalle: 'Esperando confirmación',
      icono: FileText,
      principal: String(metricas.presupuestosPendientes.cantidad),
      acento: 'var(--chart-3)',
    },
  ]

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Dashboard"
        descripcion="Indicadores operativos del negocio en un vistazo."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <Card
            key={tarjeta.titulo}
            className="border-t-2"
            style={{ borderTopColor: tarjeta.acento }}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tarjeta.titulo}
              </CardTitle>
              <tarjeta.icono className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {tarjeta.principal}
              </p>
              <p className="text-xs text-muted-foreground">{tarjeta.detalle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Bajo stock (top 5)
            </CardTitle>
            <CardDescription>
              Productos activos que necesitan reposición.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricas.productosBajoStock.items.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">
                      {producto.nombre}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        producto.stock === 0 ? 'text-destructive' : ''
                      }`}
                    >
                      {producto.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Compras recientes
            </CardTitle>
            <CardDescription>Últimas 5 compras registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compra</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricas.comprasRecientes.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell className="font-medium">#{compra.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {proveedoresPorId.get(compra.proveedorId)?.razonSocial ??
                        `Proveedor #${compra.proveedorId}`}
                    </TableCell>
                    <TableCell>{formatFecha(compra.fecha)}</TableCell>
                    <TableCell>
                      <StatusBadge status={compra.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
