import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '@/components/empty-state'
import PageHeader from '@/components/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentTitle } from '@/hooks/use-document-title'
import ConfiguracionForm from '../components/configuracion-form'
import { obtenerConfiguracion } from '../services'

function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useDocumentTitle('Configuración')

  useEffect(() => {
    let cancelado = false

    obtenerConfiguracion()
      .then((datos) => {
        if (!cancelado) {
          setConfiguracion(datos)
        }
      })
      .catch((err) => {
        if (cancelado) return
        const mensaje = err.message ?? 'No se pudo cargar la configuración'
        setError(mensaje)
        toast.error(mensaje)
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [intento])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    setIntento((numero) => numero + 1)
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        titulo="Configuración"
        descripcion="Parámetros globales de cobros, garantías, presupuestos y stock. Los gestiona únicamente el Administrador."
      />

      {cargando ? (
        <div
          role="status"
          className="grid items-start gap-4 xl:grid-cols-2"
        >
          <span className="sr-only">Cargando configuración…</span>
          <Skeleton className="h-80" />
          <div className="grid gap-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-36" />
          </div>
        </div>
      ) : error || !configuracion ? (
        <EmptyState
          icono={AlertTriangle}
          titulo="No se pudo cargar la configuración"
          descripcion={error ?? 'Volvé a intentarlo en unos segundos.'}
          accion={{ label: 'Reintentar', variant: 'outline' }}
          onAccion={reintentar}
        />
      ) : (
        <ConfiguracionForm configuracion={configuracion} />
      )}
    </div>
  )
}

export default ConfiguracionPage
