export const COMPRAS_MOCK = [
  {
    id: 1,
    proveedorId: 1,
    fecha: '2026-10-02',
    estado: 'COMPLETADA',
    detalles: [
      { id: 1, productoId: 5, cantidad: 2, precioUnitario: 68000 },
      { id: 2, productoId: 31, cantidad: 10, precioUnitario: 12000 },
    ],
    createdAt: '2026-10-02T14:00:00.000Z',
    updatedAt: '2026-10-02T18:00:00.000Z',
  },
  {
    id: 2,
    proveedorId: 2,
    fecha: '2026-10-06',
    estado: 'PENDIENTE',
    detalles: [
      { id: 3, productoId: 1, cantidad: 2, precioUnitario: 305000 },
    ],
    createdAt: '2026-10-06T11:30:00.000Z',
    updatedAt: '2026-10-06T11:30:00.000Z',
  },
  {
    id: 3,
    proveedorId: 3,
    fecha: '2026-10-04',
    estado: 'CANCELADA',
    detalles: [
      { id: 4, productoId: 8, cantidad: 1, precioUnitario: 598000 },
    ],
    createdAt: '2026-10-04T15:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z',
  },
]
