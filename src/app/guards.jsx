import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '../hooks/use-auth'

export function ProtectedRoute({ children }) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

function Redirigir({ destino, mensaje }) {
  const navigate = useNavigate()

  useEffect(() => {
    toast.dismiss()
    if (mensaje) {
      toast.warning(mensaje)
    }
    navigate(destino, { replace: true })
  }, [destino, mensaje, navigate])

  return null
}

export function RequireRole({ roles, children }) {
  const { usuario, isAdmin } = useAuth()

  if (!roles.includes(usuario.rol)) {
    return (
      <Redirigir
        destino={isAdmin ? '/dashboard' : '/ventas'}
        mensaje="No tenés permisos para acceder a esta sección"
      />
    )
  }

  return children
}
