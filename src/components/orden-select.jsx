import { ArrowDownUp } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OPCIONES = [
  { valor: 'nombre-asc', label: 'Nombre A-Z' },
  { valor: 'nombre-desc', label: 'Nombre Z-A' },
  { valor: 'fecha-asc', label: 'Más antiguos primero' },
  { valor: 'fecha-desc', label: 'Más nuevos primero' },
]

function OrdenSelect({ orden, onOrdenChange, opciones = OPCIONES }) {
  return (
    <Select value={orden} onValueChange={onOrdenChange}>
      <SelectTrigger className="w-full sm:w-48" aria-label="Ordenar por">
        <ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((opcion) => (
          <SelectItem key={opcion.valor} value={opcion.valor}>
            {opcion.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default OrdenSelect
