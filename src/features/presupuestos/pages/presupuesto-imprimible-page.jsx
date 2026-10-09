import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { TIENDA } from '@/config/tienda'
import { listarArmados } from '@/features/armados/services'
import { listarClientes } from '@/features/clientes/services'
import { listarProductos } from '@/features/productos/services'
import { useAuth } from '@/hooks/use-auth'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency, formatFecha } from '@/lib/format'
import { listarPresupuestos } from '../services'

function PresupuestoImprimiblePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [presupuesto, setPresupuesto] = useState(null)
  const [clientes, setClientes] = useState([])
  const [armados, setArmados] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useDocumentTitle(`Presupuesto #${id}`)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const [presupuestos, clientesDatos, armadosDatos, productosDatos] =
          await Promise.all([
            listarPresupuestos(),
            listarClientes(),
            listarArmados(),
            listarProductos(),
          ])

        if (cancelado) {
          return
        }

        const encontrado = presupuestos.find(
          (presupuesto) => presupuesto.id === Number(id),
        )

        if (!encontrado) {
          toast.error('El presupuesto indicado no existe')
          navigate('/presupuestos')
          return
        }

        setPresupuesto(encontrado)
        setClientes(clientesDatos)
        setArmados(armadosDatos)
        setProductos(productosDatos)
        setCargando(false)
      } catch (error) {
        if (!cancelado) {
          toast.error(error.message ?? 'No se pudo cargar el presupuesto')
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [id, navigate])

  const cliente = useMemo(
    () => clientes.find((c) => c.id === presupuesto?.clienteId),
    [clientes, presupuesto],
  )

  const armado = useMemo(
    () => armados.find((a) => a.id === presupuesto?.armadoId),
    [armados, presupuesto],
  )

  const productosPorId = useMemo(() => {
    const mapa = new Map()
    productos.forEach((producto) => mapa.set(producto.id, producto))
    return mapa
  }, [productos])

  const totalSueltos = (presupuesto?.detalles ?? []).reduce(
    (acum, detalle) => acum + detalle.cantidad * detalle.precioUnitario,
    0,
  )

  const totalArmado = (armado?.componentes ?? []).reduce(
    (acum, componente) => acum + componente.cantidad * componente.precioUnitario,
    0,
  )

  useEffect(() => {
    if (!cargando && presupuesto) {
      const timer = setTimeout(() => window.print(), 400)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [cargando, presupuesto])

  if (cargando || !presupuesto) {
    return (
      <div className="grid h-48 place-items-center text-sm text-muted-foreground">
        Cargando presupuesto…
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver al listado"
          onClick={() => navigate('/presupuestos')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-3xl border-none shadow-none print:border-none print:shadow-none">
        <CardContent className="grid gap-6 p-0">
          <header className="flex items-start justify-between gap-4 rounded-lg bg-linear-to-br from-brand-from to-brand-to p-6 text-white print:rounded-none">
            <div className="grid gap-1">
              <p className="text-lg font-bold tracking-tight">{TIENDA.nombre}</p>
              <p className="text-xs opacity-90">{TIENDA.eslogan}</p>
              <p className="text-xs opacity-90">{TIENDA.direccion}</p>
              <p className="text-xs opacity-90">
                {TIENDA.telefono} · {TIENDA.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                Presupuesto
              </p>
              <p className="text-3xl font-bold">#{presupuesto.id}</p>
              <p className="text-xs opacity-90">
                Emitido el {formatFecha(presupuesto.fecha)}
              </p>
              <p className="text-xs font-medium">
                Válido hasta {formatFecha(presupuesto.fechaVencimiento)}
              </p>
            </div>
          </header>

          <section className="grid gap-1 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cliente
            </p>
            <p className="text-base font-semibold">
              {cliente ? `${cliente.apellido}, ${cliente.nombre}` : '—'}
            </p>
            {cliente && (
              <p className="text-muted-foreground">
                {cliente.email}
                {cliente.telefono ? ` · ${cliente.telefono}` : ''}
              </p>
            )}
          </section>

          {armado && (
            <section className="grid gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Armado
                </p>
                <p className="text-sm font-semibold">
                  {armado.nombre} — {formatCurrency(totalArmado)}
                </p>
              </div>
              <ul className="grid gap-1 text-sm">
                {armado.componentes.map((componente) => {
                  const producto = productosPorId.get(componente.productoId)
                  return (
                    <li
                      key={componente.id}
                      className="flex items-center justify-between gap-2 border-b border-dashed pb-1"
                    >
                      <span>
                        {producto?.nombre ?? `Producto ${componente.productoId}`}
                        {componente.cantidad > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            × {componente.cantidad}
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(componente.cantidad * componente.precioUnitario)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {presupuesto.detalles.length > 0 && (
            <section className="grid gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Productos
              </p>
              <ul className="grid gap-1 text-sm">
                {presupuesto.detalles.map((detalle) => {
                  const producto = productosPorId.get(detalle.productoId)
                  return (
                    <li
                      key={detalle.id}
                      className="flex items-center justify-between gap-2 border-b border-dashed pb-1"
                    >
                      <span>
                        {producto?.nombre ?? `Producto ${detalle.productoId}`}
                        {detalle.cantidad > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            × {detalle.cantidad}
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(detalle.cantidad * detalle.precioUnitario)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section className="grid gap-2 border-t pt-4 text-right">
            <p className="text-sm text-muted-foreground">
              Total estimado de la cotización
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatCurrency(totalSueltos + totalArmado)}
            </p>
          </section>

          <footer className="grid gap-1 border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Atendido por {usuario.nombre} {usuario.apellido}
              </span>
              <StatusBadge status={presupuesto.estado} />
            </div>
            <p>
              Los precios son válidos hasta el{' '}
              {formatFecha(presupuesto.fechaVencimiento)}; luego se requiere
              una recotización (RN-PRE-03). La disponibilidad de stock se
              verifica al confirmar la venta.
            </p>
          </footer>
        </CardContent>
      </Card>
    </div>
  )
}

export default PresupuestoImprimiblePage
