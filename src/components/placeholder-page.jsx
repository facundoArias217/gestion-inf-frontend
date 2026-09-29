function PlaceholderPage({ titulo, descripcion }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-8 text-center">
      <p className="text-lg font-semibold tracking-tight">{titulo}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {descripcion ||
          'Pantalla del BRD que se implementa en su tarjeta del módulo correspondiente.'}
      </p>
    </div>
  )
}

export default PlaceholderPage
