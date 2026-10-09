import { differenceInCalendarDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value ?? 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}

function comoFecha(valor) {
  if (valor instanceof Date) {
    return valor
  }
  return new Date(`${String(valor).slice(0, 10)}T00:00:00`)
}

export function formatFecha(valor) {
  if (!valor) {
    return '—'
  }
  const fecha = comoFecha(valor)
  if (Number.isNaN(fecha.getTime())) {
    return String(valor)
  }
  return format(fecha, 'dd/MM/yyyy', { locale: es })
}

export function formatVencimiento(valor) {
  if (!valor) {
    return '—'
  }
  const fecha = comoFecha(valor)
  if (Number.isNaN(fecha.getTime())) {
    return String(valor)
  }
  const dias = differenceInCalendarDays(fecha, new Date())
  if (dias > 1) {
    return `vence en ${dias} días`
  }
  if (dias === 1) {
    return 'vence mañana'
  }
  if (dias === 0) {
    return 'vence hoy'
  }
  if (dias === -1) {
    return 'venció ayer'
  }
  return `venció hace ${-dias} días`
}

export function formatCuit(cuit) {
  const digitos = String(cuit ?? '');
  if (digitos.length !== 11) {
    return digitos || '—';
  }
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}
