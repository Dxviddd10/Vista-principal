'use client';

import { useState } from 'react';
import { useDashboardStats, useActividadReciente } from '@/hooks/use-data';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FolderGit2,
  GitMerge,
  FileText,
  GitCommit,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FlujoDespliegueCard } from '@/components/dashboard/flujo-despliegues-card';
import { ActivityHistoryDialog } from '@/components/dashboard/activity-history-dialog';

export default function DashboardPage() {
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useDashboardStats();
  const { actividad, isLoading: actividadLoading, refresh: refreshActividad } = useActividadReciente(10);

  const [tipoFiltro, setTipoFiltro] = useState('all');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const actividadFiltrada = actividad.filter((item) => tipoFiltro === 'all' || item.tipo === tipoFiltro);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refreshStats(), refreshActividad()]);
      setRefreshSignal((n) => n + 1); // avisa a FlujoDespliegueCard que también se actualice
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }

  const statCards = [
    {
      title: 'Commits Totales',
      value: stats?.total_commits ?? 0,
      icon: GitCommit,
      href: '/repositorios',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Merges Aprobados',
      value: stats?.total_merges_aprobados ?? 0,
      icon: GitMerge,
      href: '/merges',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Ramas Creadas',
      value: stats?.total_ramas_creadas ?? 0,
      icon: FolderGit2,
      href: '/repositorios',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const tipoIcons: Record<string, React.ElementType> = {
    commit: GitCommit,
    merge: GitMerge,
    solicitud: FileText,
    rollback: Clock,
  };

  const getActionLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      commit: 'Realizó un commit',
      merge: 'Solicitud de merge',
      solicitud: 'Creó una solicitud',
      rollback: 'Ejecutó rollback',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Dashboard" description="Resumen general del sistema de gestion de repositorios" />
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing
            ? 'Actualizando...'
            : lastUpdated
              ? `Actualizado ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: es })}`
              : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{statsLoading ? '-' : stat.value}</div>
                </div>
                <Link
                  href={stat.href}
                  className="mt-3 flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ver detalles
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <FlujoDespliegueCard refreshSignal={refreshSignal} />

        {/* Actividad Reciente */}
        <Card className="h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Actividad Reciente
              </CardTitle>
            </div>
            <CardDescription>Ultimas acciones en el sistema</CardDescription>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="commit">Commits</SelectItem>
                <SelectItem value="merge">Merges</SelectItem>
                <SelectItem value="solicitud">Solicitudes</SelectItem>
                <SelectItem value="rollback">Rollbacks</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="overflow-scroll">
            {actividadLoading ? (
              <Loading text="Cargando actividad..." />
            ) : actividadFiltrada.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividadFiltrada.map((item, idx) => {
                  const Icon = tipoIcons[item.tipo] || GitCommit;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{item.usuario}</span>{' '}
                          <span className="text-muted-foreground">{getActionLabel(item.tipo)}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.fecha), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <div className="border-t p-3">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setHistoryOpen(true)}>
              Ver historial completo →
            </Button>
          </div>
        </Card>
      </div>

      <ActivityHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
