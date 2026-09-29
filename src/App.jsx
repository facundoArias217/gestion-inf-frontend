import { toast } from "sonner"

import StatusBadge from "@/components/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const ESTADOS = [
  "PENDIENTE",
  "APROBADO",
  "COMPLETADA",
  "FINALIZADO",
  "ACEPTADO",
  "ACTIVO",
  "CANCELADA",
  "RECHAZADO",
  "VENCIDO",
  "CONVERTIDO",
  "BORRADOR",
  "INACTIVO",
]

const PRODUCTOS_MOCK = [
  {
    id: 1,
    nombre: "Mouse Logitech M185",
    categoria: "Periféricos",
    marca: "Logitech",
    precio: 12500,
    stock: 24,
    estado: "ACTIVO",
  },
  {
    id: 2,
    nombre: "Notebook Lenovo V15",
    categoria: "Notebooks",
    marca: "Lenovo",
    precio: 890000,
    stock: 3,
    estado: "ACTIVO",
  },
  {
    id: 3,
    nombre: "Monitor Samsung 24\"",
    categoria: "Monitores",
    marca: "Samsung",
    precio: 210000,
    stock: 0,
    estado: "INACTIVO",
  },
]

function App() {
  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Demo de estilos — tarjeta 0.1
          </h1>
          <p className="text-sm text-muted-foreground">
            Página temporal para verificar los tokens y componentes. Se reemplaza
            en la tarjeta 1.1.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Botones</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Nuevo producto</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Cancelar</Button>
            <Button variant="ghost">Filtrar</Button>
            <Button variant="destructive">Eliminar</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Estados (StatusBadge)
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {ESTADOS.map((estado) => (
              <StatusBadge key={estado} status={estado} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Tabla densa</h2>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRODUCTOS_MOCK.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="text-muted-foreground">
                      {producto.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {producto.nombre}
                    </TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell>{producto.marca}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {producto.precio.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {producto.stock}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={producto.estado} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Dar de baja
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Métricas (dashboard)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas del día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">8</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventas del mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">137</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bajo stock
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <p className="text-2xl font-semibold tabular-nums text-warning">
                  5
                </p>
                <Badge variant="warning">Reponer</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Presupuestos pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <p className="text-2xl font-semibold tabular-nums text-info">
                  12
                </p>
                <Badge variant="info">Por vencer</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        <Tabs defaultValue="form">
          <TabsList>
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="otros">Otros</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <div className="grid max-w-lg gap-4 rounded-lg border bg-card p-6">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" placeholder="Nombre del producto" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Periféricos</SelectItem>
                    <SelectItem value="2">Notebooks</SelectItem>
                    <SelectItem value="3">Monitores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas del presupuesto"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check-demo" />
                <Label htmlFor="check-demo">Incluir en el armado</Label>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="otros">
            <div className="flex max-w-lg flex-col gap-4 rounded-lg border bg-card p-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Abrir dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva categoría</DialogTitle>
                    <DialogDescription>
                      Ejemplo de dialog modal.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor="cat-nombre">Nombre</Label>
                    <Input id="cat-nombre" placeholder="Periféricos" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Abrir confirmación</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar compra?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Al confirmar se incrementará el stock de los productos del
                      detalle. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.success("Compra confirmada")}
                >
                  Toast éxito
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.error("Stock insuficiente")}
                >
                  Toast error
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.warning("Bajo stock")}
                >
                  Toast advertencia
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Login / Hero — visión e-commerce (mock)
          </h2>
          <div className="overflow-hidden rounded-xl bg-linear-to-br from-brand-from to-brand-to text-white">
            <nav className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-semibold tracking-tight">
                Gestión Informática
              </span>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>Productos</span>
                <span>Presupuestos</span>
                <span>Armados</span>
              </div>
            </nav>
            <div className="grid gap-8 px-6 pb-10 pt-4 md:grid-cols-2 md:items-center">
              <div className="flex flex-col gap-3">
                <p className="text-3xl font-semibold tracking-tight">
                  Tu tienda de informática, gestionada de punta a punta
                </p>
                <p className="text-sm text-white/80">
                  Catálogo, compras, ventas, presupuestos y armados de PC en un
                  solo sistema.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    Crear cuenta
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Ver catálogo
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Iniciar sesión</p>
                    <p className="text-xs text-muted-foreground">
                      Acceso para personal de la tienda
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hero-email">Email</Label>
                    <Input id="hero-email" placeholder="admin@tienda.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hero-pass">Contraseña</Label>
                    <Input
                      id="hero-pass"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button>Entrar</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Toaster />
    </div>
  )
}

export default App
