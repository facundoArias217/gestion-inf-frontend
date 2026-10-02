import { useEffect, useState } from 'react';

const PREFIJO = 'gestion-inf-orden-';

export const ORDENES_VALIDOS = [
  'nombre-asc',
  'nombre-desc',
  'fecha-asc',
  'fecha-desc',
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

function compararNombre(a, b) {
  return String(a.nombre ?? '').localeCompare(
    String(b.nombre ?? ''),
    'es',
    { sensitivity: 'base' },
  );
}

function compararFecha(a, b) {
  return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
}

function compararId(a, b) {
  return (a.id ?? 0) - (b.id ?? 0);
}

const COMPARADORES = {
  'nombre-asc': (a, b) => compararNombre(a, b) || compararId(a, b),
  'nombre-desc': (a, b) => compararNombre(b, a) || compararId(a, b),
  'fecha-asc': (a, b) => compararFecha(a, b) || compararId(a, b),
  'fecha-desc': (a, b) => compararFecha(b, a) || compararId(a, b),
};

export function ordenarListado(listado, orden) {
  const comparador = COMPARADORES[orden] ?? COMPARADORES['nombre-asc'];
  return [...listado].sort(comparador);
}
