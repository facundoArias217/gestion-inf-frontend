export function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value ?? 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
