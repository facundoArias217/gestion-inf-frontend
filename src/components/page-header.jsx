function PageHeader({ titulo, descripcion, acciones }) {
  return (
    <div className="flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descripcion && (
          <p className="max-w-xl text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  )
}

export default PageHeader
