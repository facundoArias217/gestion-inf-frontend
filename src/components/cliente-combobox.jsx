import ComboboxBuscable from '@/components/combobox-buscable'

function ClienteCombobox({
  clientes,
  valor,
  onValorChange,
  placeholder = 'Buscar cliente…',
  textoTrigger = 'Seleccioná un cliente',
  className,
}) {
  return (
    <ComboboxBuscable
      className={className}
      items={clientes.map((cliente) => ({
        valor: String(cliente.id),
        label: `${cliente.apellido}, ${cliente.nombre}`,
        keywords: `${cliente.email ?? ''}`,
        cliente,
      }))}
      valor={valor}
      onValorChange={onValorChange}
      placeholder={placeholder}
      textoTrigger={textoTrigger}
      renderItem={(item) => (
        <span className="flex w-full flex-col">
          <span className="truncate">
            {item.cliente.apellido}, {item.cliente.nombre}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {item.cliente.email}
          </span>
        </span>
      )}
    />
  )
}

export default ClienteCombobox
