import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import Buscador from '@/components/buscador'
import TableHeadOrdenable from '@/components/table-head-ordenable'
import PageHeader from '@/components/page-header'
import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarClientes } from '@/features/clientes/services'
import { listarVentas } from '@/features/ventas/services'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCurrency, formatFecha } from '@/lib/format'
import PagoFormDialog from '../components/pago-form-dialog'
import { listarPagos } from '../services'

const RESULTADOS_FILTRO = [
  { valor: 'todas', label: 'Todos los resultados' },
  { valor: 'APROBADO', label: 'Aprobados' },
  { valor: 'RECHAZADO', label: 'Rechazados' },
]

function PagosPage() {
  const [pagos, setPagos] = useState([])
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useOrden('pagos', 'fecha-desc')
  const [registroAbierto, setRegistroAbierto] = useState(false)

  useDocumentTitle('Pagos')

  useEffect(() => {
    let cancelado = false

    listarPagos()
      .then((datos) => {
        if (!cancelado) {
          setPagos(datos)
        }
      })
      .catch((error) => {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudieron cargar los pagos')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    listarVentas()
      .then((datos) => {
        if (!cancelado) {
          setVentas(datos)
        }
      })
      .catch(() => {})

    listarClientes()
      .then((datos) => {
        if (!cancelado) {
          setClientes(datos)
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [])

  const clientesPorId = useMemo(() => {
    const mapa = new Map()
    clientes.forEach((cliente) => mapa.set(cliente.id, cliente))
    return mapa
  }, [clientes])

  const filtrados = useMemo(() => {
    const porResultado =
      filtro === 'todas'
        ? pagos
        : pagos.filter((pago) => pago.resultado === filtro)

    const porBusqueda = filtrarPorBusqueda(porResultado, busqueda, [
      (pago) => {
        const venta = ventas.find((v) => v.id === pago.ventaId)
        const cliente = venta ? clientesPorId.get(venta.clienteId) : null
        return cliente ? `${cliente.apellido} ${cliente.nombre}` : ''
      },
      'medioPago',
      'resultado',
      (pago) => `#${pago.ventaId}`,
    ])

    return ordenarListado(porBusqueda, orden)
  }, [pagos, filtro, busqueda, orden, ventas, clientesPorId])

  const recargar = () => {
    listarPagos()
      .then(setPagos)
      .catch((error) => toast.error(error.message))
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Pagos"
        descripcion="Registro interno del cobro de las ventas (pago simulado). Un RECHAZADO permite reintentar; el pago nunca toca stock."
        acciones={
          <Button onClick={() => setRegistroAbierto(true)}>
            <Plus className="size-4" />
            Registrar cobro
          </Button>
        }
      />
      <Card>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger
                  className="w-full sm:w-48"
                  aria-label="Filtrar por resultado"
                >
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  {RESULTADOS_FILTRO.map((resultadoFiltro) => (
                    <SelectItem
                      key={resultadoFiltro.valor}
                      value={resultadoFiltro.valor}
                    >
                      {resultadoFiltro.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {filtrados.length} de {pagos.length} pagos
              </p>
            </div>
            <Buscador
              valor={busqueda}
              onValorChange={setBusqueda}
              placeholder="Buscar pagos…"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadOrdenable orden={orden} onOrdenChange={setOrden} campo="fecha">Fecha</TableHeadOrdenable>
                <TableHead>Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Medio</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    {busqueda ? (
                      <EmptyState
                        icono={CreditCard}
                        titulo="No se encontraron resultados para tu búsqueda"
                        descripcion="Probá con otro término o limpiá la búsqueda."
                        accion={{ label: 'Limpiar búsqueda', variant: 'outline' }}
                        onAccion={() => setBusqueda('')}
                      />
                    ) : pagos.length === 0 ? (
                      <EmptyState
                        icono={CreditCard}
                        titulo="Todavía no hay cobros registrados"
                        descripcion="El circuito comercial se cierra registrando el pago de cada venta."
                        accion={{ icono: Plus, label: 'Registrar el primero' }}
                        onAccion={() => setRegistroAbierto(true)}
                      />
                    ) : (
                      <EmptyState
                        icono={CreditCard}
                        titulo="No hay resultados"
                        descripcion="Ningún pago coincide con el filtro de resultado."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((pago) => {
                  const venta = ventas.find((v) => v.id === pago.ventaId)
                  const cliente = venta
                    ? clientesPorId.get(venta.clienteId)
                    : null

                  return (
                    <TableRow key={pago.id}>
                      <TableCell>{formatFecha(pago.fecha)}</TableCell>
                      <TableCell className="font-medium">
                        #{pago.ventaId}
                      </TableCell>
                      <TableCell>
                        {cliente
                          ? `${cliente.apellido}, ${cliente.nombre}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pago.medioPago}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(pago.monto)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={pago.resultado} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PagoFormDialog
        open={registroAbierto}
        onOpenChange={setRegistroAbierto}
        ventas={ventas}
        clientes={clientes}
        onRegistrado={recargar}
      />
    </div>
  )
}

export default PagosPage
