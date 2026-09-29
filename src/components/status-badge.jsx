import { Badge } from "@/components/ui/badge"

const STATUS_VARIANTS = {
  PENDIENTE: "info",
  APROBADO: "success",
  COMPLETADA: "success",
  FINALIZADO: "success",
  ACEPTADO: "success",
  ACTIVO: "success",
  CANCELADA: "destructive",
  RECHAZADO: "destructive",
  VENCIDO: "warning",
  CONVERTIDO: "primary",
  BORRADOR: "secondary",
  INACTIVO: "secondary",
}

function StatusBadge({ status, className }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"} className={className}>
      {status}
    </Badge>
  )
}

export default StatusBadge
