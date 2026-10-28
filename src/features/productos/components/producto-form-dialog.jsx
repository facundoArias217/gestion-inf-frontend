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
import { Textarea } from '@/components/ui/textarea'
import EditorEspecificaciones from '../components/especificaciones-editor'
import { actualizarProducto, crearProducto } from '../services'

const productoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  marca: z
    .string()
    .min(1, 'La marca es obligatoria')
    .max(50, 'Máximo 50 caracteres'),
  categoriaId: z
    .number({ invalid_type_error: 'Seleccioná una categoría' })
    .int()
    .positive(),
  descripcion: z.string().max(200, 'Máximo 200 caracteres'),
  precio: z
    .number({ invalid_type_error: 'Ingresá el precio' })
    .positive('El precio debe ser mayor a cero'),
  stock: z
    .number({ invalid_type_error: 'Ingresá el stock' })
    .int('El stock debe ser entero')
    .min(0, 'El stock no puede ser negativo'),
  imagenUrl: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .refine(
      (valor) => valor === '' || /^(https?:\/\/\S+|\/\S+)$/.test(valor.trim()),
      'Usá una URL absoluta (https://…) o una ruta relativa (/uploads/…)',
    ),
  especificaciones: z
    .array(
      z.object({
        grupo: z
          .string()
          .min(1, 'El grupo es obligatorio')
          .max(100, 'Máximo 100 caracteres'),
        items: z
          .array(
            z.object({
              clave: z
                .string()
                .min(1, 'La clave es obligatoria')
                .max(100, 'Máximo 100 caracteres'),
              valor: z
                .string()
                .min(1, 'El valor es obligatorio')
                .max(200, 'Máximo 200 caracteres'),
            }),
          )
          .min(1, 'El grupo debe tener al menos una fila')
          .max(30, 'Máximo 30 filas por grupo'),
      }),
    )
    .max(10, 'Máximo 10 grupos'),
})

function CampoNumero({ field, ...props }) {
  return (
    <Input
      type="number"
      {...field}
      value={Number.isNaN(field.value) ? '' : field.value}
      onChange={(event) => {
        const valor = event.target.value
        field.onChange(valor === '' ? NaN : Number(valor))
      }}
      {...props}
    />
  )
}

function ProductoFormDialog({
  open,
  onOpenChange,
  producto,
  categorias,
  onGuardado,
}) {
  const esEdicion = producto != null

  const form = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      marca: '',
      categoriaId: NaN,
      descripcion: '',
      precio: NaN,
      stock: NaN,
      imagenUrl: '',
      especificaciones: [],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: producto?.nombre ?? '',
        marca: producto?.marca ?? '',
        categoriaId: producto?.categoriaId ?? NaN,
        descripcion: producto?.descripcion ?? '',
        precio: producto?.precio ?? NaN,
        stock: producto?.stock ?? NaN,
        imagenUrl: producto?.imagenUrl ?? '',
        especificaciones: producto?.especificaciones ?? [],
      })
    }
  }, [open, producto, form])

  const onSubmit = async (values) => {
    const datos = {
      nombre: values.nombre.trim(),
      marca: values.marca.trim(),
      descripcion: values.descripcion.trim(),
      precio: values.precio,
      stock: values.stock,
      categoriaId: values.categoriaId,
      imagenUrl: values.imagenUrl.trim() || null,
      especificaciones:
        values.especificaciones.length > 0
          ? values.especificaciones.map((grupo) => ({
              grupo: grupo.grupo.trim(),
              items: grupo.items.map((fila) => ({
                clave: fila.clave.trim(),
                valor: fila.valor.trim(),
              })),
            }))
          : null,
    }

    try {
      const productoGuardado = esEdicion
        ? await actualizarProducto(producto.id, datos)
        : await crearProducto(datos)

      toast.success(esEdicion ? 'Producto actualizado' : 'Producto creado')
      onOpenChange(false)
      onGuardado?.(productoGuardado)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modificá los datos del producto.'
              : 'Los productos sueltos y los componentes de armados viven en el mismo catálogo.'}
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
                    <Input placeholder="Ryzen 5 7600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="AMD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={(valor) => field.onChange(Number(valor))}
                      value={
                        Number.isNaN(field.value)
                          ? undefined
                          : String(field.value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem
                            key={categoria.id}
                            value={String(categoria.id)}
                          >
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción del producto"
                      rows={2}
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
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio ($)</FormLabel>
                    <FormControl>
                      <CampoNumero field={field} min="0" step="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <CampoNumero field={field} min="0" step="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imagenUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen (URL)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://… o /uploads/productos/…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Se muestra en las cards y el detalle; sin imagen se usa un
                    ícono por categoría. La subida de archivos llega con la
                    16.1.
                  </p>
                </FormItem>
              )}
            />
            <EditorEspecificaciones control={form.control} />
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

export default ProductoFormDialog
