const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PREFIJOS_PERSONA = ['20', '23', '24', '27'];

export function validarCuit(cuit) {
  const digitos = String(cuit ?? '');

  if (!/^\d{11}$/.test(digitos)) {
    return false;
  }

  if (!PREFIJOS_PERSONA.includes(digitos.slice(0, 2))) {
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
