'use client';

import { useMemo, useState } from 'react';
import { useActividadReciente } from '@/hooks/use-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitCommit, GitMerge, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// IMPORTANTE: apiClient.getActividadReciente(limit) hoy solo acepta un
// límite, no un rango de días — así que pedimos un límite alto y
// filtramos por fecha aquí en el cliente. Si el volumen de actividad
// crece mucho, esto debería moverse al backend (igual que hablamos para
// solicitudes). Repórtalo a tu equipo como pendiente.
const HISTORY_FETCH_LIMIT = 200;
const dayOptions = [3, 5, 7];

const tipoIcons: Record<string, React.ElementType> = {
  commit: GitCommit,
  merge: GitMerge,
  solicitud: FileText,
  rollback: Clock,
};

const tipoLabels: Record<string, string> = {
  commit: 'Commits',
  merge: 'Merges',
  solicitud: 'Solicitudes',
  rollback: 'Rollbacks',
};

export function ActivityHistoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [days, setDays] = useState(7);
  const [tipo, setTipo] = useState('all');
  const { actividad, isLoading } = useActividadReciente(HISTORY_FETCH_LIMIT);

  const filtrada = useMemo(() => {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    return actividad.filter((item) => {
      const matchesDate = new Date(item.fecha).getTime() >= since;
      const matchesTipo = tipo === 'all' || item.tipo === tipo;
      return matchesDate && matchesTipo;
    });
  }, [actividad, days, tipo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>Historial de actividad</DialogTitle>
          <DialogDescription>Revisa lo que ha pasado en el sistema por rango de fecha.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 border-b pb-3">
          <div className="flex gap-1 rounded-md bg-muted p-1">
            {dayOptions.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'ghost'}
                className="h-7 px-2 text-xs"
                onClick={() => setDays(d)}
              >
                {d} días
              </Button>
            ))}
          </div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="commit">Commits</SelectItem>
              <SelectItem value="merge">Merges</SelectItem>
              <SelectItem value="solicitud">Solicitudes</SelectItem>
              <SelectItem value="rollback">Rollbacks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
          ) : filtrada.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay eventos en los últimos {days} días con este filtro.
            </div>
          ) : (
            filtrada.map((item, idx) => {
              const Icon = tipoIcons[item.tipo] || GitCommit;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.usuario}</span>{' '}
                      <span className="text-muted-foreground">{tipoLabels[item.tipo] || item.tipo}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.fecha), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

