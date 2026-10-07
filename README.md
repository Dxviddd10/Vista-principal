'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSolicitudes } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Search, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { advancedMatch } from '@/utils/filtered';

const estadosSolicitud: Record<string, { label: string; color: string; bgColor: string }> = {
  pendiente_autorizacion: { label: 'Pendiente', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  en_desarrollo: { label: 'En Desarrollo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  en_test: { label: 'En Test', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  completado: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
};

const estadoOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pendiente_autorizacion', label: 'Pendiente' },
  { value: 'en_desarrollo', label: 'Desarrollo' },
  { value: 'en_test', label: 'Test' },
  { value: 'completado', label: 'Completado' },
];

// Recibe refreshSignal desde el dashboard: cuando ese número cambia,
// esta tarjeta vuelve a pedir sus propios datos (tiene su propia
// instancia de useSolicitudes, con sus propios filtros, separada de la
// página de /solicitudes).
export function FlujoDespliegueCard({ refreshSignal }: { refreshSignal: number }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchApi, setSearchApi] = useState('');
  const [estadoApi, setEstadoApi] = useState('');

  const { solicitudes, total, isLoading, isLoadingMore, isReachingEnd, loadMore, refresh } =
    useSolicitudes(searchApi, estadoApi, '');

  useEffect(() => {
    if (refreshSignal > 0) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const filtradas = useMemo(
    () =>
      solicitudes.filter(
        (s: any) =>
          advancedMatch(s.numeroSolicitud || '', searchInput) ||
          advancedMatch(s.descripcion || '', searchInput),
      ),
    [solicitudes, searchInput],
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchApi(searchInput.trim());
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    if (nearBottom && !isLoadingMore && !isReachingEnd) loadMore();
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-600" />
              Flujo de despliegues
            </CardTitle>
            <CardDescription>{total} solicitudes · cada una es un cambio en curso</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/solicitudes">
              Ver todas <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>
          <Select value={estadoApi || 'all'} onValueChange={(v) => setEstadoApi(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {estadoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No hay solicitudes que coincidan.
          </div>
        ) : (
          <div onScroll={handleScroll} className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {filtradas.map((s: any) => {
              const estadoConfig = estadosSolicitud[s.estado] || estadosSolicitud.pendiente_autorizacion;
              return (
                <Link
                  key={s.id}
                  href={`/solicitudes/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.numeroSolicitud}</span>
                      <Badge variant={s.tipo === 'incidente' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {s.tipo === 'incidente' ? 'Incidente' : 'Requerimiento'}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.cliente} · {s.descripcion}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${estadoConfig.bgColor} ${estadoConfig.color}`}
                    >
                      {estadoConfig.label}
                    </span>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </Link>
              );
            })}
            {isLoadingMore && (
              <div className="py-2 text-center text-xs text-muted-foreground">Cargando más...</div>
            )}
            {isReachingEnd && filtradas.length > 0 && (
              <div className="py-2 text-center text-xs text-muted-foreground">No hay más solicitudes.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
