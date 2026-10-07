export const CATEGORIAS_OBLIGATORIAS_NOMBRES = [
  'Procesador',
  'Motherboard',
  'Memoria RAM',
  'Almacenamiento',
  'Fuente',
  'Gabinete',
]

const SOCKETS_POR_KEYWORD = [
  { socket: 'AM4', keywords: ['am4', 'b550', 'b450', 'a520', 'x570'] },
  { socket: 'AM5', keywords: ['am5', 'b650', 'b850', 'x670', 'x870'] },
  {
    socket: 'LGA1700',
    keywords: ['lga1700', 'b760', 'z790', 'h610', '13400', '13700', '14900'],
  },
  { socket: 'LGA1851', keywords: ['lga1851', 'z890', 'b860', 'core ultra'] },
]

function textoDe(producto) {
  return `${producto.nombre} ${producto.descripcion ?? ''}`.toLowerCase()
}

export function extraerSocket(producto) {
  const texto = textoDe(producto)
  const ryzen = texto.match(/ryzen\s+(?:\d\s*)?([1-9])\d{3}/)

  if (ryzen) {
    return Number(ryzen[1]) >= 7 ? 'AM5' : 'AM4'
  }

  const definicion = SOCKETS_POR_KEYWORD.find((definicionSocket) =>
    definicionSocket.keywords.some((keyword) => texto.includes(keyword)),
  )

  return definicion?.socket ?? null
}

export function extraerMemoria(producto) {
  const texto = textoDe(producto)

  if (texto.includes('ddr4')) {
    return 'DDR4'
  }
  if (texto.includes('ddr5')) {
    return 'DDR5'
  }
  return null
}

function productosDelBuild(componentes, productos, categorias) {
  const productosPorId = new Map(productos.map((p) => [p.id, p]))
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]))

  return componentes
    .map((componente) => productosPorId.get(componente.productoId))
    .filter(Boolean)
    .map((producto) => ({
      ...producto,
      categoriaNombre:
        categoriasPorId.get(producto.categoriaId)?.nombre ?? null,
      cantidad: componentes.find(
        (componente) => componente.productoId === producto.id,
      )?.cantidad,
    }))
}

export function categoriasFaltantes(componentes, productos, categorias) {
  const presentes = new Set(
    productosDelBuild(componentes, productos, categorias).map(
      (producto) => producto.categoriaNombre,
    ),
  )

  return CATEGORIAS_OBLIGATORIAS_NOMBRES.filter(
    (nombre) => !presentes.has(nombre),
  )
}

export function obtenerAdvertencias(componentes, productos, categorias) {
  const enBuild = productosDelBuild(componentes, productos, categorias)
  const advertencias = []

  const cpu = enBuild.find((p) => p.categoriaNombre === 'Procesador')
  const motherboard = enBuild.find((p) => p.categoriaNombre === 'Motherboard')
  const rams = enBuild.filter((p) => p.categoriaNombre === 'Memoria RAM')
  const gpu = enBuild.find((p) => p.categoriaNombre === 'Placa de video')

  if (cpu && motherboard) {
    const socketCpu = extraerSocket(cpu)
    const socketMotherboard = extraerSocket(motherboard)

    if (socketCpu && socketMotherboard && socketCpu !== socketMotherboard) {
      advertencias.push(
        `El motherboard ${motherboard.nombre} usa socket ${socketMotherboard} y el procesador ${cpu.nombre} usa ${socketCpu}: posible incompatibilidad`,
      )
    } else if (socketCpu == null && socketMotherboard == null) {
      advertencias.push(
        'No se pudo determinar el socket del procesador ni del motherboard: verificá la compatibilidad manualmente',
      )
    } else if (socketCpu == null || socketMotherboard == null) {
      const indeterminado = socketCpu == null ? cpu : motherboard
      advertencias.push(
        `No se pudo determinar el socket de ${indeterminado.nombre}: verificá la compatibilidad manualmente`,
      )
    }
  }

  if (motherboard && rams.length > 0) {
    const memoriaMotherboard = extraerMemoria(motherboard)

    rams.forEach((ram) => {
      const memoriaRam = extraerMemoria(ram)

      if (memoriaRam && memoriaMotherboard && memoriaRam !== memoriaMotherboard) {
        advertencias.push(
          `La memoria ${ram.nombre} es ${memoriaRam} y el motherboard ${motherboard.nombre} soporta ${memoriaMotherboard}`,
        )
      } else if (
        (memoriaRam == null || memoriaMotherboard == null) &&
        memoriaRam !== memoriaMotherboard
      ) {
        advertencias.push(
          'No se pudo determinar el tipo de memoria de la RAM o del motherboard: verificá la compatibilidad manualmente',
        )
      }
    })
  }

  if (!gpu && cpu && motherboard) {
    advertencias.push(
      'La configuración no incluye placa de video: verificá que el procesador tenga gráficos integrados',
    )
  }

  componentes.forEach((componente) => {
    const producto = enBuild.find((p) => p.id === componente.productoId)

    if (producto && componente.cantidad > producto.stock) {
      advertencias.push(
        `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock}): la disponibilidad se re-verifica al confirmar la venta (RN-ARM-03)`,
      )
    }
  })

  return advertencias
}
