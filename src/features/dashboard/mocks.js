export const DASHBOARD_MOCK = {
  productosBajoStock: {
    total: 11,
    items: [
      { id: 8, nombre: 'ASRock Radeon RX 7600 Challenger', stock: 0 },
      { id: 30, nombre: 'Mouse logitech G203', stock: 2 },
      { id: 5, nombre: 'Teclado mecánico Redragon Kumara', stock: 3 },
      { id: 13, nombre: 'Gabinete Cooler Master Q300L', stock: 4 },
      { id: 15, nombre: 'Fuente Gigabyte 550W', stock: 5 },
    ],
  },
  ventasHoy: { cantidad: 2, montoTotal: 545000 },
  ventasMes: { cantidad: 6, montoTotal: 2202000 },
  presupuestosPendientes: { cantidad: 4 },
  comprasRecientes: [
    { id: 6, proveedorId: 2, fecha: '2026-10-07', estado: 'COMPLETADA' },
    { id: 5, proveedorId: 5, fecha: '2026-10-05', estado: 'PENDIENTE' },
    { id: 4, proveedorId: 3, fecha: '2026-10-03', estado: 'COMPLETADA' },
    { id: 3, proveedorId: 1, fecha: '2026-10-01', estado: 'COMPLETADA' },
    { id: 2, proveedorId: 4, fecha: '2026-09-28', estado: 'CANCELADA' },
  ],
}
