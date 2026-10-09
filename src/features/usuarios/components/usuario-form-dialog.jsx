import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { actualizarUsuario, crearUsuario } from '../services'

const ROLES = [
  { valor: 'ADMIN', label: 'Administrador' },
  { valor: 'VENDEDOR', label: 'Vendedor' },
]

const usuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(100),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().optional(),
  rol: z.string().min(1, 'Seleccioná el rol'),
})

const usuarioEdicionSchema = usuarioSchema.superRefine((values, ctx) => {
  if (!values.rol) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rol'], message: 'Seleccioná el rol' })
  }
})

function UsuarioFormDialog({ open, onOpenChange, usuario, onGuardado }) {
  const esEdicion = usuario != null

  const form = useForm({
    resolver: zodResolver(usuarioEdicionSchema),
    defaultValues: { nombre: '', apellido: '', email: '', password: '', rol: undefined },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: usuario?.nombre ?? '',
        apellido: usuario?.apellido ?? '',
        email: usuario?.email ?? '',
        password: '',
        rol: usuario?.rol,
      })
    }
  }, [open, usuario, form])

  const onSubmit = async (values) => {
    const datos = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      email: values.email.trim(),
      rol: values.rol,
    }

    if (!esEdicion) {
      if (!values.password || values.password.length < 8) {
        form.setError('password', {
          message: 'La clave es obligatoria en el alta (mínimo 8)',
        })
        return
      }
      datos.password = values.password
    } else if (values.password) {
      if (values.password.length < 8) {
        form.setError('password', { message: 'Mínimo 8 caracteres' })
        return
      }
      datos.password = values.password
    }

    try {
      if (esEdicion) {
        await actualizarUsuario(usuario.id, datos)
        toast.success('Usuario actualizado')
      } else {
        await crearUsuario(datos)
        toast.success('Usuario registrado')
      }
      onOpenChange(false)
      onGuardado?.()
    } catch (error) {
      form.setError('email', { message: error.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Dejá la clave vacía para mantener la actual.'
              : 'Usuarios internos con rol Administrador o Vendedor (RN-USR-01).'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="María" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Gómez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@tienda.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {esEdicion ? 'Clave (opcional)' : 'Clave'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná el rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map((rol) => (
                          <SelectItem key={rol.valor} value={rol.valor}>
                            {rol.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UsuarioFormDialog
