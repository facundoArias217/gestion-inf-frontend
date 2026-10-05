export function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value ?? 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}

export function formatCuit(cuit) {
  const digitos = String(cuit ?? '');
  if (digitos.length !== 11) {
    return digitos || '—';
  }
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}
