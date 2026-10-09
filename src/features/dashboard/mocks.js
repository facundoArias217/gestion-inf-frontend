export const DASHBOARD_MOCK = {
  productosBajoStock: {
    total: 11,
    items: [
      { id: 8, nombre: 'ASRock Radeon RX 7600 Challenger', stock: 0 },
      { id: 7, nombre: 'Gigabyte RTX 4060 Eagle 8GB', stock: 3 },
      { id: 21, nombre: 'HP 15s-fq', stock: 3 },
    ],
  },
  ventasHoy: { cantidad: 0, montoTotal: 0 },
  ventasMes: { cantidad: 2, montoTotal: 709000 },
  presupuestosPendientes: { cantidad: 2 },
  comprasRecientes: [
    { id: 2, proveedorId: 2, fecha: '2026-10-06', estado: 'PENDIENTE' },
    { id: 3, proveedorId: 3, fecha: '2026-10-04', estado: 'CANCELADA' },
    { id: 1, proveedorId: 1, fecha: '2026-10-02', estado: 'COMPLETADA' },
  ],
}
