import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import CuitInput from '@/components/cuit-input'
import TelefonoInput from '@/components/telefono-input'
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
import { PREFIJOS_TODOS, validarCuit } from '@/lib/cuit'
import { actualizarProveedor, crearProveedor } from '../services'

const proveedorSchema = z.object({
  razonSocial: z
    .string()
    .min(1, 'La razón social es obligatoria')
    .max(100, 'Máximo 100 caracteres'),
  cuit: z
    .string()
    .min(1, 'El CUIT/CUIL es obligatorio')
    .refine((valor) => validarCuit(valor, PREFIJOS_TODOS), {
      message: 'El CUIT/CUIL es inválido',
    }),
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

function ProveedorFormDialog({ open, onOpenChange, proveedor, onGuardado }) {
  const esEdicion = proveedor != null

  const form = useForm({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      razonSocial: '',
      cuit: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        razonSocial: proveedor?.razonSocial ?? '',
        cuit: proveedor?.cuit ?? '',
        email: proveedor?.email ?? '',
        telefono: proveedor?.telefono ?? '',
        direccion: proveedor?.direccion ?? '',
      })
    }
  }, [open, proveedor, form])

  const onSubmit = async (values) => {
    const datos = {
      razonSocial: values.razonSocial.trim(),
      cuit: values.cuit.trim(),
      email: values.email.trim(),
      telefono: values.telefono.trim(),
      direccion: values.direccion.trim(),
    }

    try {
      const proveedorGuardado = esEdicion
        ? await actualizarProveedor(proveedor.id, datos)
        : await crearProveedor(datos)

      toast.success(esEdicion ? 'Proveedor actualizado' : 'Proveedor creado')
      onOpenChange(false)
      onGuardado?.(proveedorGuardado)
    } catch (error) {
      form.setError('cuit', { message: error.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modificá los datos del proveedor.'
              : 'Los proveedores son el origen de las compras de la tienda.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="razonSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social</FormLabel>
                  <FormControl>
                    <Input placeholder="MayoristaTech SRL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cuit"
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
                      placeholder="ventas@proveedor.com"
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
                      <TelefonoInput
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

export default ProveedorFormDialog
