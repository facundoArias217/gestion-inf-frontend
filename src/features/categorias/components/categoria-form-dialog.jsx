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
import { Textarea } from '@/components/ui/textarea'
import { actualizarCategoria, crearCategoria } from '../services'

const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  descripcion: z.string().max(200, 'Máximo 200 caracteres'),
})

function CategoriaFormDialog({ open, onOpenChange, categoria, onGuardado }) {
  const esEdicion = categoria != null

  const form = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nombre: '', descripcion: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: categoria?.nombre ?? '',
        descripcion: categoria?.descripcion ?? '',
      })
    }
  }, [open, categoria, form])

  const onSubmit = async (values) => {
    const datos = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
    }

    try {
      const categoriaGuardada = esEdicion
        ? await actualizarCategoria(categoria.id, datos)
        : await crearCategoria(datos)

      toast.success(esEdicion ? 'Categoría actualizada' : 'Categoría creada')
      onOpenChange(false)
      onGuardado?.(categoriaGuardada)
    } catch (error) {
      form.setError('nombre', { message: error.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modificá los datos de la categoría.'
              : 'Las categorías clasifican los productos del catálogo.'}
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
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Procesador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción de la categoría"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default CategoriaFormDialog
