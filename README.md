'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { SlidersHorizontal, Star, Trash2, Bookmark } from 'lucide-react';
import {
  deleteFlujoFavorito,
  getFlujoFavoritos,
  saveFlujoFavorito,
  type FlujoFavorito,
} from '@/lib/flujo-favorites';

export interface FlujoFiltrosValue {
  cliente: string;
  dateFrom: string;
  dateTo: string;
}

export function FlujoFiltros({
  clientes,
  value,
  onChange,
  estado,
  tipo,
  onApplyFavorito,
}: {
  clientes: string[];
  value: FlujoFiltrosValue;
  onChange: (value: FlujoFiltrosValue) => void;
  estado: string;
  tipo: string;
  onApplyFavorito: (favorito: FlujoFavorito) => void;
}) {
  const { user } = useAuth();
  const userId = user?.id || 'anon';

  const [open, setOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [query, setQuery] = useState('');
  const [favoritos, setFavoritos] = useState<FlujoFavorito[]>([]);

  useEffect(() => {
    setFavoritos(getFlujoFavoritos(userId));
  }, [userId]);

  const activeCount = [value.cliente !== '', Boolean(value.dateFrom), Boolean(value.dateTo)].filter(
    Boolean,
  ).length;

  const favoritosFiltrados = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return favoritos;
    return favoritos.filter((f) => f.name.toLowerCase().includes(term));
  }, [favoritos, query]);

  function handleSaveFavorito() {
    const name = favoriteName.trim();
    if (!name) return;
    const favorito: FlujoFavorito = {
      id: `fav-${Date.now()}`,
      name,
      estado,
      tipo,
      cliente: value.cliente,
      dateFrom: value.dateFrom,
      dateTo: value.dateTo,
    };
    setFavoritos(saveFlujoFavorito(userId, favorito));
    setFavoriteName('');
  }

  function handleRemoveFavorito(id: string) {
    setFavoritos(deleteFlujoFavorito(userId, id));
  }

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
        {/* Buscador de favoritos */}
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
          <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
            {favoritos.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted-foreground">
                Aún no tienes filtros guardados.
              </p>
            )}
            {favoritos.length > 0 && favoritosFiltrados.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted-foreground">
                Ningún filtro coincide con &quot;{query}&quot;.
              </p>
            )}
            {favoritosFiltrados.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 rounded-md hover:bg-muted/50">
                <button onClick={() => handleApply(f)} className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-xs">
                  {f.name}
                </button>
                <button
                  aria-label={`Eliminar ${f.name}`}
                  onClick={() => handleRemoveFavorito(f.id)}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros manuales */}
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

        {/* Guardar combinación actual */}
        <div className="border-t p-3">
          <label className="text-xs font-medium text-muted-foreground">Guardar esta combinación</label>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Input
              placeholder="Nombre para este filtro"
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveFavorito()}
            />
            <Button size="icon" variant="secondary" disabled={!favoriteName.trim()} onClick={handleSaveFavorito}>
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
