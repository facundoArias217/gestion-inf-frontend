import { zodResolver } from '@hookform/resolvers/zod'
import {
  CircuitBoard,
  Cpu,
  HardDrive,
  Keyboard,
  MemoryStick,
  Monitor,
  Mouse,
  Usb,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { login as loginRequest } from '../services'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

const CHIPS = [
  { icon: Cpu, label: 'CPU', className: 'left-[8%] top-[18%]', delay: '0s' },
  { icon: Monitor, label: 'Monitor', className: 'right-[10%] top-[24%]', delay: '1.5s' },
  { icon: MemoryStick, label: 'RAM', className: 'left-[12%] bottom-[20%]', delay: '0.75s' },
  { icon: HardDrive, label: 'SSD', className: 'right-[14%] bottom-[16%]', delay: '2.25s' },
  { icon: CircuitBoard, label: 'GPU', className: 'left-[24%] top-[10%]', delay: '0.5s' },
  { icon: Keyboard, label: 'Teclado', className: 'right-[25%] top-[8%]', delay: '1.25s' },
  { icon: Mouse, label: 'Mouse', className: 'left-[6%] bottom-[45%]', delay: '1.75s' },
  { icon: Usb, label: 'USB', className: 'right-[6%] bottom-[42%]', delay: '2.75s' },
]

function FondoChips() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {CHIPS.map((chip) => (
        <div
          key={chip.label}
          className={`absolute ${chip.className} flex animate-float items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm`}
          style={{ animationDelay: chip.delay }}
        >
          <chip.icon className="size-4" />
          {chip.label}
        </div>
      ))}
    </div>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      const { usuario, token } = await loginRequest(values)
      login(usuario, token)
      navigate(location.state?.from || '/', { replace: true })
    } catch (error) {
      form.setError('password', { message: error.message })
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-linear-to-br from-brand-from to-brand-to p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-96 animate-pulse rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 size-[28rem] animate-pulse rounded-full bg-indigo-400/20 blur-3xl [animation-delay:1s]" />
        <div className="absolute left-1/3 top-1/4 size-64 animate-pulse rounded-full bg-fuchsia-400/15 blur-3xl [animation-delay:2s]" />
      </div>
      <FondoChips />
      <Card className="relative w-full max-w-sm overflow-hidden pt-0 shadow-2xl">
        <div className="h-1.5 w-full bg-linear-to-r from-brand-from to-brand-to" />
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Gestión Informática
          </CardTitle>
          <CardDescription>Acceso para personal de la tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@tienda.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Credenciales de prueba: admin@tienda.com / admin123 ·
            vendedor@tienda.com / vendedor123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
