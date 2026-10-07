'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSolicitudes, useCurrentUser } from '@/hooks/use-data';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    FileText,
    Plus,
    ExternalLink,
    GitBranch,
    AlertCircle,
    CheckCircle,
    Search,
    Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { advancedMatch } from '@/utils/filtered';

const estadosSolicitud: Record<string, { label: string; color: string; bgColor: string }> = {
    pendiente_autorizacion: { label: 'Pendiente', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    en_desarrollo: { label: 'En Desarrollo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    en_test: { label: 'En Test', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    completado: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
};

const normalizeSolicitudId = (id: string) => id.replace(/^req-/i, '');

export default function SolicitudesPage() {

    // Estados necesarios para el componente
    const [searchInput, setSearchInput] = useState('');
    const [estadoInput, setEstadoInput] = useState('all')
    const [tipoInput, setTipoInput] = useState('all')

    // Estados necesarios para la api
    const [searchApi, setSearchApi] = useState('');
    const [estadoApi, setEstadoApi] = useState('');
    const [tipoApi, setTipoApi] = useState('');

    // Referencia para el scroll infinito
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const {
        solicitudes,
        total,
        isLoading,
        error,
        loadMore,
        isLoadingMore,
        isReachingEnd
    } = useSolicitudes(searchApi, estadoApi, tipoApi);

    const solicitudesFiltradas = useMemo(() => {
        return solicitudes.filter((soli: any) => {
            const coincideTexto =
                advancedMatch(soli.numeroSolicitud || '', searchInput) ||
                advancedMatch(soli.descripcion || '', searchInput);

            const coincideTipo =
                tipoInput === 'all' || soli.tipo === tipoInput;

            const coincideEstado =
                estadoInput === 'all' || soli.estado === estadoInput;

            return coincideTexto && coincideTipo && coincideEstado
        });
    }, [solicitudes, searchInput, estadoInput, tipoInput]);

    const handleScroll = (
        e: React.UIEvent<HTMLDivElement>
    ) => {
        const { scrollTop, scrollHeight, clientHeight } =
            e.currentTarget;

        const isNearBottom =
            scrollTop + clientHeight >= scrollHeight - 50;

        if (
            isNearBottom &&
            !isLoadingMore &&
            !isReachingEnd
        ) {
            loadMore();
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        setSearchApi(searchInput.trim());
        setEstadoApi(estadoInput);
        setTipoApi(tipoInput);
    };

    const clearFilters = () => {
        setSearchApi('');
        setEstadoApi('');
        setTipoApi('');
        setSearchInput('');
        setEstadoInput('all')
        setTipoInput('all')
    };

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-destructive">Error al cargar solicitudes</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Solicitudes de Fuentes"
                description={`${total} solicitudes registradas`}
            >
                <Button asChild>
                    <Link href="/solicitudes/nueva">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Solicitud
                    </Link>
                </Button>
            </PageHeader>

            {/* Filtros */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Filtros</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por numero o descripcion..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>

                        <Select value={estadoInput} onValueChange={(value) => setEstadoInput(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="pendiente_autorizacion">Pendiente</SelectItem>
                                <SelectItem value="en_desarrollo">En Desarrollo</SelectItem>
                                <SelectItem value="en_test">En Test</SelectItem>
                                <SelectItem value="completado">Completado</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={tipoInput} onValueChange={(value) => setTipoInput(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                <SelectItem value="requerimiento">Requerimiento</SelectItem>
                                <SelectItem value="incidente">Incidente</SelectItem>
                            </SelectContent>
                        </Select>

                        {(estadoInput !== 'all' || tipoInput !== 'all' || searchInput !== '') && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Limpiar filtros
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <Loading text="Cargando solicitudes..." />
                    ) : solicitudesFiltradas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
                            <p className="text-muted-foreground">No hay solicitudes registradas</p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/solicitudes/nueva">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear primera solicitud
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                className="max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Solicitud</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fuentes</TableHead>
                                            <TableHead>Actualizado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {solicitudesFiltradas.map((solicitud) => {
                                            const estadoConfig = estadosSolicitud[solicitud.estado] || estadosSolicitud.pendiente_autorizacion;
                                            return (
                                                <TableRow key={solicitud.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                                                                <FileText className="h-5 w-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={`/solicitudes/${solicitud.id}`}
                                                                    className="font-medium hover:underline"
                                                                >
                                                                    {solicitud.numeroSolicitud}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {solicitud.descripcion}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={solicitud.tipo === 'incidente' ? 'destructive' : 'secondary'}>
                                                            {solicitud.tipo === 'incidente' ? (
                                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                            ) : (
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                            )}
                                                            {solicitud.tipo === 'incidente' ? 'Incidente' : 'Requerimiento'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{solicitud.cliente}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${estadoConfig.bgColor} ${estadoConfig.color}`}>
                                                            {estadoConfig.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{solicitud.fuentesSolicitadas.length} fuentes</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDistanceToNow(new Date(solicitud.updatedAt), {
                                                                addSuffix: true,
                                                                locale: es
                                                            })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" asChild title="Ver detalles">
                                                                <Link href={`/solicitudes/${solicitud.id}`}>
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            {solicitud.ramaAsignada && (
                                                                <Button variant="ghost" size="icon" asChild title="Ver rama">
                                                                    <Link href={`/repositorios/${solicitud.repositorioId}/ramas`}>
                                                                        <GitBranch className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {isLoadingMore && (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        Cargando más solicitudes...
                                    </div>
                                )}

                                {isReachingEnd && solicitudes.length > 0 && (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        No hay más solicitudes
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
