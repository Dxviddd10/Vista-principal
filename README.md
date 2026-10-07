<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {actividad.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
          {actividad.length}
        </span>
      )}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-80">
    <DropdownMenuLabel>Actividad reciente</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {actividad.length === 0 ? (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No hay actividad reciente
      </div>
    ) : (
      actividad.slice(0, 5).map((item, idx) => (
        <DropdownMenuItem key={idx} className="flex flex-col items-start gap-1">
          <span className="font-medium">{item.usuario}</span>
          <span className="text-xs text-muted-foreground">{item.descripcion}</span>
        </DropdownMenuItem>
      ))
    )}
  </DropdownMenuContent>
</DropdownMenu>

