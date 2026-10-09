import { Input } from '@/components/ui/input'

function formatear(digitos) {
  if (digitos.length <= 2) {
    return digitos
  }
  if (digitos.length <= 6) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2)}`
  }
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 6)}-${digitos.slice(6)}`
}

function TelefonoInput({ value, onChange, ...props }) {
  const digitos = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 10)

  return (
    <Input
      inputMode="numeric"
      placeholder="11-5555-2020"
      value={formatear(digitos)}
      onChange={(event) => {
        onChange(event.target.value.replace(/\D/g, '').slice(0, 10))
      }}
      {...props}
    />
  )
}

export default TelefonoInput
