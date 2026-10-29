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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { actualizarCategoria, crearCategoria } from '../services'

const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  clave: z
    .string()
    .max(50, 'Máximo 50 caracteres')
    .transform((valor) => valor.trim().toLowerCase())
    .refine(
      (valor) => valor === '' || /^[a-z][a-z0-9_]*$/.test(valor),
      'Usá minúsculas, números y guion bajo; debe empezar con una letra',
    ),
  descripcion: z.string().max(200, 'Máximo 200 caracteres'),
  obligatoria: z.boolean(),
})

function CategoriaFormDialog({ open, onOpenChange, categoria, onGuardado }) {
  const esEdicion = categoria != null

  const form = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      clave: '',
      descripcion: '',
      obligatoria: false,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: categoria?.nombre ?? '',
        clave: categoria?.clave ?? '',
        descripcion: categoria?.descripcion ?? '',
        obligatoria: categoria?.obligatoria ?? false,
      })
    }
  }, [open, categoria, form])

  const onSubmit = async (values) => {
    const datos = {
      nombre: values.nombre.trim(),
      clave: values.clave || null,
      descripcion: values.descripcion.trim(),
      obligatoria: values.obligatoria,
    }

    try {
      const categoriaGuardada = esEdicion
        ? await actualizarCategoria(categoria.id, datos)
        : await crearCategoria(datos)

      toast.success(esEdicion ? 'Categoría actualizada' : 'Categoría creada')
      onOpenChange(false)
      onGuardado?.(categoriaGuardada)
    } catch (error) {
      const mensaje = error.message ?? 'No se pudo guardar la categoría'
      const campo = mensaje.toLowerCase().includes('clave') ? 'clave' : 'nombre'
      form.setError(campo, { message: mensaje })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
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
              name="clave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave</FormLabel>
                  <FormControl>
                    <Input placeholder="procesador" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Identificador estable para el armado (minúsculas, números y
                    guion bajo). Opcional, pero único.
                  </p>
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
            <FormField
              control={form.control}
              name="obligatoria"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(valor) =>
                          field.onChange(valor === true)
                        }
                      />
                    </FormControl>
                    <div className="grid gap-1">
                      <FormLabel>Obligatoria en armados</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        El armado exige al menos un componente de esta
                        categoría.
                      </p>
                    </div>
                  </div>
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
