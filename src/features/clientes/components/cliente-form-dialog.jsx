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
import { validarCuit } from '@/lib/cuit'
import { actualizarCliente, crearCliente } from '../services'
import CuitInput from './cuit-input'

const clienteSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  apellido: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  cuil: z
    .string()
    .min(1, 'El CUIT/CUIL es obligatorio')
    .refine(validarCuit, 'El CUIT/CUIL es inválido'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email inválido')
    .max(100, 'Máximo 100 caracteres'),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .max(20, 'Máximo 20 caracteres'),
  direccion: z
    .string()
    .min(1, 'La dirección es obligatoria')
    .max(100, 'Máximo 100 caracteres'),
})

function ClienteFormDialog({ open, onOpenChange, cliente, onGuardado }) {
  const esEdicion = cliente != null

  const form = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      cuil: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: cliente?.nombre ?? '',
        apellido: cliente?.apellido ?? '',
        cuil: cliente?.cuil ?? '',
        email: cliente?.email ?? '',
        telefono: cliente?.telefono ?? '',
        direccion: cliente?.direccion ?? '',
      })
    }
  }, [open, cliente, form])

  const onSubmit = async (values) => {
    const datos = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      cuil: values.cuil.trim(),
      email: values.email.trim(),
      telefono: values.telefono.trim(),
      direccion: values.direccion.trim(),
    }

    try {
      const clienteGuardado = esEdicion
        ? await actualizarCliente(cliente.id, datos)
        : await crearCliente(datos)

      toast.success(esEdicion ? 'Cliente actualizado' : 'Cliente creado')
      onOpenChange(false)
      onGuardado?.(clienteGuardado)
    } catch (error) {
      form.setError('cuil', { message: error.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modificá los datos del cliente.'
              : 'Los clientes se asocian a presupuestos y ventas.'}
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
              name="cuil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CUIT/CUIL</FormLabel>
                  <FormControl>
                    <CuitInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="cliente@email.com"
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
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="11 5555-2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle 123, Ciudad" {...field} />
                    </FormControl>
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

export default ClienteFormDialog
