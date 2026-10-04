import { useEffect, useState } from 'react';

const PREFIJO = 'gestion-inf-orden-';

export const ORDENES_VALIDOS = [
  'nombre-asc',
  'nombre-desc',
  'fecha-asc',
  'fecha-desc',
  'precio-asc',
  'precio-desc',
  'stock-asc',
  'stock-desc',
];

function leerOrden(modulo, ordenInicial) {
  try {
    const guardado = localStorage.getItem(PREFIJO + modulo);
    if (guardado && ORDENES_VALIDOS.includes(guardado)) {
      return guardado;
    }
  } catch {
    return ordenInicial;
  }
  return ordenInicial;
}

export function useOrden(modulo, ordenInicial = 'nombre-asc') {
  const [orden, setOrden] = useState(() => leerOrden(modulo, ordenInicial));

  useEffect(() => {
    localStorage.setItem(PREFIJO + modulo, orden);
  }, [modulo, orden]);

  return [orden, setOrden];
}

function compararTexto(a, b, campo) {
  return String(a[campo] ?? '').localeCompare(
    String(b[campo] ?? ''),
    'es',
    { sensitivity: 'base' },
  );
}

function compararFecha(a, b) {
  return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
}

function compararPrecio(a, b) {
  return (Number(a.precio) || 0) - (Number(b.precio) || 0);
}

function compararStock(a, b) {
  return (Number(a.stock) || 0) - (Number(b.stock) || 0);
}

function compararId(a, b) {
  return (a.id ?? 0) - (b.id ?? 0);
}

function comparadorPara(orden, campoNombre) {
  const compararNombre = (a, b) => compararTexto(a, b, campoNombre);

  switch (orden) {
    case 'nombre-desc':
      return (a, b) => compararNombre(b, a) || compararId(a, b);
    case 'fecha-asc':
      return (a, b) => compararFecha(a, b) || compararId(a, b);
    case 'fecha-desc':
      return (a, b) => compararFecha(b, a) || compararId(a, b);
    case 'precio-asc':
      return (a, b) => compararPrecio(a, b) || compararId(a, b);
    case 'precio-desc':
      return (a, b) => compararPrecio(b, a) || compararId(a, b);
    case 'stock-asc':
      return (a, b) => compararStock(a, b) || compararId(a, b);
    case 'stock-desc':
      return (a, b) => compararStock(b, a) || compararId(a, b);
    default:
      return (a, b) => compararNombre(a, b) || compararId(a, b);
  }
}

export function ordenarListado(listado, orden, { campoNombre = 'nombre' } = {}) {
  const comparador = comparadorPara(orden, campoNombre);
  return [...listado].sort(comparador);
}
