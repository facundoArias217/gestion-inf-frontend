export const VENTAS_MOCK = [
  {
    id: 1,
    clienteId: 1,
    fecha: '2026-10-05',
    estado: 'COMPLETADA',
    detalles: [
      { id: 1, productoId: 23, cantidad: 1, precioUnitario: 480000 },
      { id: 2, productoId: 32, cantidad: 1, precioUnitario: 26000 },
    ],
    createdAt: '2026-10-05T14:00:00.000Z',
    updatedAt: '2026-10-05T14:00:00.000Z',
  },
  {
    id: 2,
    clienteId: 2,
    fecha: '2026-10-06',
    estado: 'COMPLETADA',
    detalles: [
      { id: 3, productoId: 16, cantidad: 1, precioUnitario: 78000 },
      { id: 4, productoId: 37, cantidad: 1, precioUnitario: 125000 },
    ],
    createdAt: '2026-10-06T16:30:00.000Z',
    updatedAt: '2026-10-06T16:30:00.000Z',
  },
  {
    id: 3,
    clienteId: 3,
    fecha: '2026-10-03',
    estado: 'CANCELADA',
    presupuestoId: 4,
    detalles: [
      { id: 5, productoId: 26, cantidad: 1, precioUnitario: 385000 },
    ],
    createdAt: '2026-10-03T12:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
  },
]
