'use client';

import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, Star } from 'lucide-react';
import type { FlujoFavorito } from '@/lib/flujo-favorites';

export interface FlujoFiltrosValue {
  cliente: string;
  descripcion: string;
  dateFrom: string;
  dateTo: string;
}

export function FlujoFiltros({
  clientes,
  value,
  onChange,
  favoritos,
  onApplyFavorito,
}: {
  clientes: string[];
  value: FlujoFiltrosValue;
  onChange: (value: FlujoFiltrosValue) => void;
  favoritos: FlujoFavorito[];
  onApplyFavorito: (favorito: FlujoFavorito) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const activeCount = [
    value.cliente !== '',
    value.descripcion !== '',
    Boolean(value.dateFrom),
    Boolean(value.dateTo),
  ].filter(Boolean).length;

  const favoritosFiltrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return favoritos;
    return favoritos.filter((f) => f.name.toLowerCase().includes(term));
  }, [favoritos, query]);

  function handleApply(favorito: FlujoFavorito) {
    onApplyFavorito(favorito);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Más filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {favoritos.length > 2 && (
          <div className="border-b p-3">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Star className="h-3 w-3" /> Buscar un filtro guardado
            </label>
            <Input
              className="mt-1.5"
              placeholder="Nombre del filtro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
              {favoritosFiltrados.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleApply(f)}
                  className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/50"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 p-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Cliente</label>
            <Select
              value={value.cliente || 'all'}
              onValueChange={(v) => onChange({ ...value, cliente: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input
              className="mt-1.5"
              placeholder="Buscar en la descripción..."
              value={value.descripcion}
              onChange={(e) => onChange({ ...value, descripcion: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Última actividad</label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                type="date"
                value={value.dateFrom}
                onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="date"
                value={value.dateTo}
                onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
