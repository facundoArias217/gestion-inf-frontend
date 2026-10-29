import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import Buscador from '@/components/buscador'
import TableHeadOrdenable from '@/components/table-head-ordenable'
import PageHeader from '@/components/page-header'
import Paginacion from '@/components/paginacion'
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
import SkeletonTabla from '@/components/skeleton-tabla'
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
import { usePaginacion } from '@/hooks/use-paginacion'
import { useOrden, ordenarListado } from '@/hooks/use-orden'
import { filtrarPorBusqueda } from '@/lib/busqueda'
import { formatCurrency, formatFecha } from '@/lib/format'
import PagoFormDialog from '../components/pago-form-dialog'
import { listarPagos } from '../services'

const ESTADOS_FILTRO = [
  { valor: 'todas', label: 'Todos los estados' },
  { valor: 'APROBADO', label: 'Aprobados' },
  { valor: 'ANULADO', label: 'Anulados' },
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
    const porEstado =
      filtro === 'todas'
        ? pagos
        : pagos.filter((pago) => pago.estado === filtro)

    const porBusqueda = filtrarPorBusqueda(porEstado, busqueda, [
      (pago) => {
        const venta = ventas.find((v) => v.id === pago.ventaId)
        const cliente = venta ? clientesPorId.get(venta.clienteId) : null
        return cliente ? `${cliente.apellido} ${cliente.nombre}` : ''
      },
      'medioPago',
      'estado',
      (pago) => (pago.cuotas ? `${pago.cuotas} cuotas` : ''),
      (pago) => `#${pago.ventaId}`,
    ])

    return ordenarListado(porBusqueda, orden)
  }, [pagos, filtro, busqueda, orden, ventas, clientesPorId])

  const recargar = () => {
    listarPagos()
      .then(setPagos)
      .catch((error) => toast.error(error.message))
    listarVentas()
      .then(setVentas)
      .catch(() => {})
  }

  const { pagina, setPagina, totalPaginas, paginar } = usePaginacion(filtrados.length, `${filtro}-${busqueda}-${orden}`)
  const visibles = paginar(filtrados)

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Pagos"
        descripcion="Cobros internos de ventas COMPLETADAS. Se admiten cobros parciales hasta cubrir el saldo; un cobro inválido no se registra y no existe RECHAZADO."
        acciones={
          <Button onClick={() => setRegistroAbierto(true)}>
            <Plus className="size-4" />
            Registrar cobro
          </Button>
        }
      />
      <Card>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger
                  className="w-full sm:w-48"
                  aria-label="Filtrar por estado"
                >
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_FILTRO.map((estadoFiltro) => (
                    <SelectItem
                      key={estadoFiltro.valor}
                      value={estadoFiltro.valor}
                    >
                      {estadoFiltro.label}
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
                <TableHead className="hidden lg:table-cell">Cliente</TableHead>
                <TableHead>Medio</TableHead>
                <TableHead className="text-right">Monto final</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <SkeletonTabla columnas={6} filas={3} ocultas={[2]} />
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
                        descripcion="Ningún pago coincide con el filtro de estado."
                        accion={{ label: 'Limpiar filtro', variant: 'outline' }}
                        onAccion={() => setFiltro('todas')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibles.map((pago) => {
                  const venta = ventas.find((v) => v.id === pago.ventaId)
                  const cliente = venta
                    ? clientesPorId.get(venta.clienteId)
                    : null
                  const montoFinal = pago.montoFinal ?? pago.monto
                  const tieneAjustes =
                    Number(pago.recargo) > 0 ||
                    Number(pago.descuentoAplicado) > 0 ||
                    montoFinal !== pago.monto

                  return (
                    <TableRow key={pago.id}>
                      <TableCell>{formatFecha(pago.fecha)}</TableCell>
                      <TableCell className="font-medium">
                        #{pago.ventaId}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {cliente
                          ? `${cliente.apellido}, ${cliente.nombre}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <p>{pago.medioPago}</p>
                        {pago.cuotas && (
                          <p className="text-xs text-muted-foreground">
                            {pago.cuotas} cuotas
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <p>{formatCurrency(montoFinal)}</p>
                        {tieneAjustes && (
                          <p className="text-xs text-muted-foreground">
                            Base {formatCurrency(pago.monto)}
                            {Number(pago.recargo) > 0 &&
                              ` · recargo ${pago.recargo}%`}
                            {Number(pago.descuentoAplicado) > 0 &&
                              ` · desc. ${pago.descuentoAplicado}%`}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={pago.estado} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onPaginaChange={setPagina} />
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
