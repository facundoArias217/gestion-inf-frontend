const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export const PREFIJOS_PERSONA = ['20', '23', '24', '27'];
export const PREFIJOS_EMPRESA = ['30', '33', '34'];
export const PREFIJOS_TODOS = [...PREFIJOS_PERSONA, ...PREFIJOS_EMPRESA];

export function validarCuit(cuit, prefijos = PREFIJOS_PERSONA) {
  const digitos = String(cuit ?? '');

  if (!/^\d{11}$/.test(digitos)) {
    return false;
  }

  if (!prefijos.includes(digitos.slice(0, 2))) {
    return false;
  }

  const suma = digitos
    .slice(0, 10)
    .split('')
    .reduce((acum, digito, i) => acum + Number(digito) * PESOS[i], 0);
  const verificador = 11 - (suma % 11);
  const esperado = verificador === 11 ? 0 : verificador;

  return esperado !== 10 && Number(digitos[10]) === esperado;
}
