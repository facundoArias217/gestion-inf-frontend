const MODULOS_VALIDOS = [
  'auth',
  'dashboard',
  'productos',
  'categorias',
  'clientes',
  'proveedores',
  'compras',
  'ventas',
  'presupuestos',
  'armados',
  'pagos',
  'usuarios',
];

const integrados = new Set(['auth']);

function validarModulo(modulo) {
  if (!MODULOS_VALIDOS.includes(modulo)) {
    throw new Error(
      `Módulo desconocido: "${modulo}". Módulos válidos: ${MODULOS_VALIDOS.join(', ')}`,
    );
  }
}

for (const modulo of integrados) {
  validarModulo(modulo);
}

export function isIntegrated(modulo) {
  validarModulo(modulo);
  return integrados.has(modulo);
}
