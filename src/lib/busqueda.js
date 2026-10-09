export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function filtrarPorBusqueda(listado, texto, campos) {
  const buscado = normalizar(texto)
  if (!buscado) {
    return listado
  }

  return listado.filter((item) =>
    campos.some((campo) => {
      const valor =
        typeof campo === 'function' ? campo(item) : item[campo]
      return normalizar(valor).includes(buscado)
    }),
  )
}
