export const PREFIJOS_PERSONA = ['20', '23', '24', '27'];
export const PREFIJOS_EMPRESA = ['30', '33', '34'];
export const PREFIJOS_TODOS = [...PREFIJOS_PERSONA, ...PREFIJOS_EMPRESA];

export function validarCuit(cuit, prefijos = PREFIJOS_PERSONA) {
  const digitos = String(cuit ?? '');

  if (!/^\d{11}$/.test(digitos)) {
    return false;
  }

  return prefijos.includes(digitos.slice(0, 2));
}
