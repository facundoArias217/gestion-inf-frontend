import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PlaceholderPage from '../components/placeholder-page'
import { useAuth } from '../hooks/use-auth'
import LoginPage from '../features/auth/pages/login-page'
import CategoriasPage from '../features/categorias/pages/categorias-page'
import { ProtectedRoute, RequireRole } from './guards'
import DashboardLayout from '../layouts/dashboard-layout'

function InicioRedirect() {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/dashboard' : '/ventas'} replace />
}

function PlaceholderAdmin({ titulo }) {
  return (
    <RequireRole roles={['ADMIN']}>
      <PlaceholderPage titulo={titulo} />
    </RequireRole>
  )
}

function PlaceholderAmbos({ titulo }) {
  return (
    <RequireRole roles={['ADMIN', 'VENDEDOR']}>
      <PlaceholderPage titulo={titulo} />
    </RequireRole>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioRedirect />} />
          <Route path="dashboard" element={<PlaceholderAdmin titulo="Dashboard" />} />
          <Route path="ventas" element={<PlaceholderAmbos titulo="Ventas" />} />
          <Route
            path="presupuestos"
            element={<PlaceholderAmbos titulo="Presupuestos" />}
          />
          <Route path="armados" element={<PlaceholderAmbos titulo="Armá tu PC" />} />
          <Route path="pagos" element={<PlaceholderAmbos titulo="Pagos" />} />
          <Route path="clientes" element={<PlaceholderAmbos titulo="Clientes" />} />
          <Route path="productos" element={<PlaceholderAmbos titulo="Productos" />} />
          <Route
            path="categorias"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <CategoriasPage />
              </RequireRole>
            }
          />
          <Route path="proveedores" element={<PlaceholderAdmin titulo="Proveedores" />} />
          <Route path="compras" element={<PlaceholderAdmin titulo="Compras" />} />
          <Route path="usuarios" element={<PlaceholderAdmin titulo="Usuarios" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
