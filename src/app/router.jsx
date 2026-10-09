import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PlaceholderPage from '../components/placeholder-page'
import { useAuth } from '../hooks/use-auth'
import LoginPage from '../features/auth/pages/login-page'
import ArmadosPage from '../features/armados/pages/armados-page'
import ArmadoFormPage from '../features/armados/pages/armado-form-page'
import CategoriasPage from '../features/categorias/pages/categorias-page'
import ClientesPage from '../features/clientes/pages/clientes-page'
import ComprasPage from '../features/compras/pages/compras-page'
import CompraRegistroPage from '../features/compras/pages/compra-registro-page'
import PagosPage from '../features/pagos/pages/pagos-page'
import ProductosPage from '../features/productos/pages/productos-page'
import ProveedoresPage from '../features/proveedores/pages/proveedores-page'
import UsuariosPage from '../features/usuarios/pages/usuarios-page'
import PresupuestosPage from '../features/presupuestos/pages/presupuestos-page'
import PresupuestoRegistroPage from '../features/presupuestos/pages/presupuesto-registro-page'
import VentasPage from '../features/ventas/pages/ventas-page'
import VentaRegistroPage from '../features/ventas/pages/venta-registro-page'
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
          <Route
            path="ventas"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <VentasPage />
              </RequireRole>
            }
          />
          <Route
            path="ventas/nueva"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <VentaRegistroPage />
              </RequireRole>
            }
          />
          <Route
            path="presupuestos"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <PresupuestosPage />
              </RequireRole>
            }
          />
          <Route
            path="presupuestos/nuevo"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <PresupuestoRegistroPage />
              </RequireRole>
            }
          />
          <Route
            path="armados"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <ArmadosPage />
              </RequireRole>
            }
          />
          <Route
            path="armados/nuevo"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <ArmadoFormPage />
              </RequireRole>
            }
          />
          <Route
            path="armados/:id/editar"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <ArmadoFormPage />
              </RequireRole>
            }
          />
          <Route
            path="pagos"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <PagosPage />
              </RequireRole>
            }
          />
          <Route
            path="clientes"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <ClientesPage />
              </RequireRole>
            }
          />
          <Route
            path="productos"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <ProductosPage />
              </RequireRole>
            }
          />
          <Route
            path="categorias"
            element={
              <RequireRole roles={['ADMIN', 'VENDEDOR']}>
                <CategoriasPage />
              </RequireRole>
            }
          />
          <Route
            path="proveedores"
            element={
              <RequireRole roles={['ADMIN']}>
                <ProveedoresPage />
              </RequireRole>
            }
          />
          <Route
            path="compras"
            element={
              <RequireRole roles={['ADMIN']}>
                <ComprasPage />
              </RequireRole>
            }
          />
          <Route
            path="compras/nueva"
            element={
              <RequireRole roles={['ADMIN']}>
                <CompraRegistroPage />
              </RequireRole>
            }
          />
          <Route
            path="usuarios"
            element={
              <RequireRole roles={['ADMIN']}>
                <UsuariosPage />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
