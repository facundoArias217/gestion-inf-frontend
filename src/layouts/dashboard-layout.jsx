import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Cpu,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
  Users,
  X,
} from 'lucide-react'

import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '../hooks/use-auth'

const MENU = [
  {
    titulo: 'General',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    ],
  },
  {
    titulo: 'Ventas',
    items: [
      { label: 'Ventas', to: '/ventas', icon: ShoppingCart, roles: ['VENDEDOR', 'ADMIN'] },
      { label: 'Presupuestos', to: '/presupuestos', icon: FileText, roles: ['VENDEDOR', 'ADMIN'] },
      { label: 'Armá tu PC', to: '/armados', icon: Cpu, roles: ['VENDEDOR', 'ADMIN'] },
      { label: 'Pagos', to: '/pagos', icon: CreditCard, roles: ['VENDEDOR', 'ADMIN'] },
    ],
  },
  {
    titulo: 'Compras',
    items: [
      { label: 'Compras', to: '/compras', icon: PackagePlus, roles: ['ADMIN'] },
      { label: 'Proveedores', to: '/proveedores', icon: Truck, roles: ['ADMIN'] },
    ],
  },
  {
    titulo: 'Catálogo',
    items: [
      { label: 'Productos', to: '/productos', icon: Package, roles: ['ADMIN', 'VENDEDOR'] },
      { label: 'Categorías', to: '/categorias', icon: Tags, roles: ['ADMIN', 'VENDEDOR'] },
    ],
  },
  {
    titulo: 'Personas',
    items: [
      { label: 'Clientes', to: '/clientes', icon: Users, roles: ['ADMIN', 'VENDEDOR'] },
      { label: 'Usuarios', to: '/usuarios', icon: UserCog, roles: ['ADMIN'] },
    ],
  },
]

function Sidebar({ abierto, onCerrar }) {
  const { usuario } = useAuth()

  const grupos = MENU.map((grupo) => ({
    ...grupo,
    items: grupo.items.filter((item) => item.roles.includes(usuario.rol)),
  })).filter((grupo) => grupo.items.length > 0)

  return (
    <aside
      className={`${
        abierto ? 'flex' : 'hidden'
      } fixed inset-y-0 left-0 z-40 w-60 flex-col border-r bg-card md:static md:flex`}
    >
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-from to-brand-to text-sm font-bold text-white">
          GI
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Gestión Informática
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto md:hidden"
          onClick={onCerrar}
        >
          <X />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {grupos.map((grupo) => (
          <div key={grupo.titulo} className="mb-4">
            <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {grupo.titulo}
            </p>
            <div className="grid gap-0.5">
              {grupo.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCerrar}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function Navbar({ onAbrirMenu }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const iniciales = `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()

  const cerrarSesion = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-end gap-2 border-b bg-card px-4 py-2.5">
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={onAbrirMenu}
      >
        <Menu />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {iniciales}
            </span>
            <span className="text-sm font-medium">
              {usuario.nombre} {usuario.apellido}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">
              {usuario.nombre} {usuario.apellido}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {usuario.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="py-1">
            <StatusBadge status={usuario.rol} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={cerrarSesion}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

function DashboardLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="flex min-h-svh bg-muted/40">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
