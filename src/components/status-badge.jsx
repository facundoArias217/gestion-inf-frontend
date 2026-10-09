import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

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
  const variante = STATUS_VARIANTS[status] ?? "secondary"
  const conDot = variante === "info" || variante === "success" || variante === "destructive" || variante === "warning"

  return (
    <Badge
      variant={variante}
      className={cn("gap-1.5", !conDot && "gap-0", className)}
    >
      {conDot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current opacity-90"
        />
      )}
      {status}
    </Badge>
  )
}

export default StatusBadge
