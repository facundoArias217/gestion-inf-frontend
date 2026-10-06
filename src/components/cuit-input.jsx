import { Input } from '@/components/ui/input'

function formatear(digitos) {
  if (digitos.length <= 2) {
    return digitos
  }
  if (digitos.length <= 10) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2)}`
  }
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`
}

function CuitInput({ value, onChange, ...props }) {
  const digitos = String(value ?? '').replace(/\D/g, '').slice(0, 11)

  return (
    <Input
      inputMode="numeric"
      placeholder="20-12345678-9"
      value={formatear(digitos)}
      onChange={(event) => {
        onChange(event.target.value.replace(/\D/g, '').slice(0, 11))
      }}
      {...props}
    />
  )
}

export default CuitInput
