import { useRef } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MAX_GRUPOS = 10
const MAX_FILAS_POR_GRUPO = 30
const GRUPO_DEFAULT = 'General'

function parsearEspecificaciones(texto) {
  const grupos = []
  let ignoradas = 0
  let filas = 0
  let grupoActual = null

  const grupoPorNombre = (nombre) => {
    let grupo = grupos.find(
      (candidato) => candidato.grupo.toLowerCase() === nombre.toLowerCase(),
    )
    if (!grupo && grupos.length < MAX_GRUPOS) {
      grupo = { grupo: nombre, items: [] }
      grupos.push(grupo)
    }
    return grupo ?? null
  }

  for (const lineaCruda of texto.split(/\r?\n/)) {
    const linea = lineaCruda.trim()
    if (!linea) {
      continue
    }

    const encabezado = linea.match(/^\[(.+)\]$/)
    if (encabezado) {
      grupoActual = grupoPorNombre(encabezado[1].trim())
      if (!grupoActual) {
        ignoradas += 1
      }
      continue
    }

    const separada = linea.match(/^([^:=]+)[:=]\s*(.+)$/)
    if (separada) {
      const clave = separada[1].trim()
      const valor = separada[2].trim()
      if (!clave || !valor) {
        ignoradas += 1
        continue
      }
      if (!grupoActual) {
        grupoActual = grupoPorNombre(GRUPO_DEFAULT)
      }
      if (!grupoActual || grupoActual.items.length >= MAX_FILAS_POR_GRUPO) {
        ignoradas += 1
        continue
      }
      grupoActual.items.push({ clave, valor })
      filas += 1
      continue
    }

    ignoradas += 1
  }

  return { grupos, filas, ignoradas }
}

function GrupoEspecificaciones({ control, indice, onQuitar }) {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `especificaciones.${indice}.items`,
  })
  const erroresGrupo = form.formState.errors.especificaciones?.[indice]

  return (
    <div className="grid gap-2 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-1">
          <Input
            placeholder="Nombre del grupo (ej. Características generales)"
            {...form.register(`especificaciones.${indice}.grupo`)}
          />
          {erroresGrupo?.grupo?.message && (
            <p className="text-xs text-destructive">
              {erroresGrupo.grupo.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Quitar grupo"
          className="text-destructive hover:text-destructive"
          onClick={onQuitar}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-2">
        {fields.map((fila, indiceFila) => (
          <div
            key={fila.id}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
          >
            <div className="grid gap-1">
              <Input
                placeholder="Clave (ej. Núcleos)"
                {...form.register(
                  `especificaciones.${indice}.items.${indiceFila}.clave`,
                )}
              />
              {erroresGrupo?.items?.[indiceFila]?.clave?.message && (
                <p className="text-xs text-destructive">
                  {erroresGrupo.items[indiceFila].clave.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Input
                placeholder="Valor (ej. 6)"
                {...form.register(
                  `especificaciones.${indice}.items.${indiceFila}.valor`,
                )}
              />
              {erroresGrupo?.items?.[indiceFila]?.valor?.message && (
                <p className="text-xs text-destructive">
                  {erroresGrupo.items[indiceFila].valor.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar fila"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(indiceFila)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-1">
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ clave: '', valor: '' })}
            disabled={fields.length >= MAX_FILAS_POR_GRUPO}
          >
            <Plus className="size-4" />
            Agregar fila
          </Button>
        </div>
        {fields.length >= MAX_FILAS_POR_GRUPO && (
          <p className="text-xs text-muted-foreground">
            Máximo {MAX_FILAS_POR_GRUPO} filas por grupo.
          </p>
        )}
        {erroresGrupo?.items?.message && (
          <p className="text-xs text-destructive">
            {erroresGrupo.items.message}
          </p>
        )}
      </div>
    </div>
  )
}

function EditorEspecificaciones({ control }) {
  const form = useFormContext()
  const inputArchivoRef = useRef(null)
  const { fields: grupos, append, remove } = useFieldArray({
    control,
    name: 'especificaciones',
  })
  const errorGeneral = form.formState.errors.especificaciones?.message

  const importar = async (event) => {
    const archivo = event.target.files?.[0]
    event.target.value = ''
    if (!archivo) {
      return
    }

    const texto = await archivo.text()
    const { grupos: gruposParseadas, filas, ignoradas } =
      parsearEspecificaciones(texto)

    if (gruposParseadas.length === 0) {
      toast.error(
        'No se encontraron especificaciones reconocibles. Formato esperado: líneas «clave: valor», con grupos opcionales entre corchetes.',
      )
      return
    }

    form.setValue('especificaciones', gruposParseadas, {
      shouldValidate: true,
    })
    toast.success(
      `Se importaron ${gruposParseadas.length} grupo(s) con ${filas} fila(s)${
        ignoradas > 0 ? ` · ${ignoradas} línea(s) ignorada(s)` : ''
      }`,
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Especificaciones</p>
          <p className="text-xs text-muted-foreground">
            Ficha de exhibición por grupos; no interviene en la validación de
            armados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputArchivoRef.current?.click()}
          >
            <Upload className="size-4" />
            Importar .txt
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ grupo: '', items: [{ clave: '', valor: '' }] })
            }
            disabled={grupos.length >= MAX_GRUPOS}
          >
            <Plus className="size-4" />
            Agregar grupo
          </Button>
        </div>
      </div>
      <input
        ref={inputArchivoRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={importar}
      />

      {grupos.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Sin especificaciones. Cargá grupos a mano o importá un .txt con
          líneas «clave: valor» (encabezados de grupo entre corchetes).
        </p>
      ) : (
        <div className="grid gap-3">
          {grupos.map((grupo, indice) => (
            <GrupoEspecificaciones
              key={grupo.id}
              control={control}
              indice={indice}
              onQuitar={() => remove(indice)}
            />
          ))}
        </div>
      )}

      {grupos.length >= MAX_GRUPOS && (
        <p className="text-xs text-muted-foreground">
          Máximo {MAX_GRUPOS} grupos.
        </p>
      )}
      {errorGeneral && (
        <p className="text-sm text-destructive">{errorGeneral}</p>
      )}
    </div>
  )
}

export default EditorEspecificaciones
