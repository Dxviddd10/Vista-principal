# Panel-gestion
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite from "swr/infinite";
import {
    mockSourceRequests,
    mockUsers,
    mockAuditLogs,
    getSourceRequestById,
    delay,
    currentUser,
} from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { useEffect, useMemo } from 'react';
import { EstadoMerge, SolicitudNomenclatura } from '@/lib/types';

// Mock mode enabled - simulates API calls
const MOCK_DELAY = 300;

// Fetcher que simula delay de API
const mockFetcher = async <T>(data: T): Promise<T> => {
    await delay(MOCK_DELAY);
    return data;
};

const normalizeSolicitudId = (id: string) => id.replace(/^req-/i, '');

// ==================== DASHBOARD ====================

export function useDashboardStats() {
    const { data, error, isLoading, mutate } = useSWR(
        'dashboard-stats',
        () => apiClient.getDashboardStats(),
        { refreshInterval: 30000 }
    );

    return {
        stats: data,
        isLoading,
        error,
        refresh: mutate
    };
}

export function useActividadReciente(limit = 10) {
    const { data, error, isLoading, mutate } = useSWR(
        `actividad-${limit}`,
        () => apiClient.getActividadReciente(limit),
        { refreshInterval: 15000 }
    );

    return {
        actividad: data || [],
        isLoading,
        error,
        refresh: mutate
    };
}

// ==================== REPOSITORIOS ====================

export function useRepositorios(
    nombre?: string,
    cliente?: string
) {
    const { mutate: globalMutate } = useSWRConfig();

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.data.length) return null;

        if (pageIndex === 0) {
            return ["repositorios", nombre || "", cliente || ""];
        }

        return [
            "repositorios",
            nombre || "",
            cliente || "",
            previousPageData.last_id
        ];
    };

    const {
        data,
        error,
        isLoading,
        size,
        setSize,
        mutate
    } = useSWRInfinite(
        getKey,
        (key) => {
            const [, nombre, cliente, last_id] = key;

            return apiClient.getRepositorios(
                nombre,
                cliente,
                last_id
            );
        }
    );

    const repositorios = useMemo(() => {
        return data ? data.flatMap((page) => page.data) : [];
    }, [data]);

    const total = repositorios.length;

    const isLoadingMore =
        isLoading ||
        (size > 0 &&
            data &&
            typeof data[size - 1] === "undefined");

    const isEmpty = data?.[0]?.data?.length === 0;

    const isReachingEnd =
        isEmpty ||
        (data &&
            data[data.length - 1]?.data.length === 0);

    useEffect(() => {
        repositorios.forEach((repo: any) => {
            globalMutate(`repo-${repo.gitlabId}`, repo, false);
        });
    }, [repositorios, globalMutate]);

    return {
        repositorios,
        total,
        error,
        isLoading,
        isLoadingMore,
        isReachingEnd,
        loadMore: () => setSize(size + 1),
        refresh: mutate
    };
}

export function useRepositorio(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? ["repositorio", id] : null,
        ([_, repoId]) => apiClient.getRepositorio(repoId)
    );

    return {
        repositorio: data?.data ?? [],
        isLoading,
        error: error || data?.error || null,
        refresh: mutate
    };
}

export function useRepositorioRamas(
    repoId: string | null,
    filtros?: {
        tipoderama?: string;
        estado?: string;
    }
) {
    const { data, error, isLoading, mutate } = useSWR(
        repoId ? ["ramas", repoId] : null,
        async ([, id]) => await apiClient.getRepositorioRamas(id)
    );

    let ramas = data?.data || [];

    if (filtros?.tipoderama) {
        ramas = ramas.filter(
            (rama: any) =>
                rama.tipo_de_rama === filtros.tipoderama
        );
    }

    if (filtros?.estado) {
        ramas = ramas.filter(
            (rama: any) =>
                rama.estado === filtros.estado
        );
    }

    return {
        ramas,
        total: ramas.length,
        isLoading,
        error: error || data?.error || null,
        refresh: mutate
    };
}

export function useRepositorioCommits(
    repoId: string | null,
    rama?: string,
    page = 1,
    limit = 5
) {
    const { data, error, isLoading, mutate } = useSWR(
        repoId && rama ? [`commits`, repoId, rama, page] : null,
        async ([, id, branch, p]) =>
            await apiClient.getRepositorioCommits(id, branch, p)
    );

    return {
        commits: data?.data || [],
        total: data?.total || 0,
        totalPages: 1,
        isLoading,
        error,
        refresh: mutate
    };
}

// ==================== COMMITS INFINITO ====================

export function useRepositorioCommitsInfinite(
    repoId: string,
    branch?: string

) {
    const COMMITS_PER_PAGE = 5;

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (!repoId || repoId === 'undefined') return null;
        if (previousPageData && previousPageData.data?.length === 0) return null;
        if (previousPageData && previousPageData.data?.length < COMMITS_PER_PAGE) return null;
        return ['commits-infinite', repoId, branch, pageIndex + 1];
    };

    const { data, error, isLoading, size, setSize, isValidating } = useSWRInfinite(
        getKey,
        async ([, id, br, page]) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return await apiClient.getRepositorioCommits(
                String(id),
                String(br),
                Number(page)
            );
        });

    const commits = data ? data.flatMap((p) => p.data ?? []) : [];
    const isEmpty = data?.[0]?.data?.length === 0;
    const isReachingEnd =
        isEmpty ||
        (data != null && (data[data.length - 1]?.data?.length ?? 0) < COMMITS_PER_PAGE);
    const isLoadingMore = isValidating && size > 1 && !isLoading;

    const loadMore = () => {
        if (isLoadingMore || isReachingEnd) return;
        setSize(size + 1);
    };

    return {
        commits,
        isLoading,
        isLoadingMore,
        isReachingEnd,
        isEmpty,
        error,
        loadMore,
        totalLoaded: commits.length,

    };
}


// ==================== MERGE REQUESTS ====================

export function useMergeRequests(
    filtros?: {
        estado?: string;
        rama_destino?: string;
        nombre_repo?: string;
    }
) {

    const getKey = (
        pageIndex: number,
        previousPageData: any
    ) => {
        if (
            previousPageData &&
            !previousPageData.data.length
        ) {
            return null;
        }

        if (pageIndex === 0) {
            return {
                estado: filtros?.estado,
                rama_destino: filtros?.rama_destino,
                nombre_repo: filtros?.nombre_repo,
                last_id: undefined
            };
        }

        return {
            estado: filtros?.estado,
            rama_destino: filtros?.rama_destino,
            nombre_repo: filtros?.nombre_repo,
            last_id: previousPageData.last_id
        };
    };

    const {
        data,
        error,
        isLoading,
        size,
        setSize,
        mutate
    } = useSWRInfinite(
        getKey,
        async (params) => {

            return apiClient.getMergeRequests(
                {
                    estado: params.estado as EstadoMerge,
                    rama_destino: params.rama_destino,
                    repo_nombre: params.nombre_repo
                },
                params.last_id
            );

        }
    );

    const mergeRequests = useMemo(() => {

        return data
            ? data.flatMap(
                (page) => page.data || []
            )
            : [];

    }, [data]);

    const total =
        data?.[0]?.total || 0;

    const isLoadingMore =
        isLoading ||
        (
            size > 0 &&
            data &&
            typeof data[size - 1] === 'undefined'
        );

    const isEmpty =
        data?.[0]?.data?.length === 0;

    const isReachingEnd =
        isEmpty ||
        (
            data &&
            data[data.length - 1]?.data.length === 0
        );

    return {
        mergeRequests,
        total,
        error,
        isLoading,
        isLoadingMore,
        isReachingEnd,

        loadMore: () => setSize(size + 1),

        refresh: mutate
    };
}

export function useMergeRequest(
    id: string | null
) {
    const {
        data,
        error,
        isLoading,
        mutate
    } = useSWR(
        id
            ? ['merge-request', id]
            : null,

        async () => {
            const response =
                await apiClient.getMergeRequest(id!);

            return response;
        }
    );

    return {
        mergeRequest: data,
        isLoading,
        error,
        refresh: mutate
    };
}

// ==================== SOLICITUDES ====================

export function useSolicitudes(
    search = '',
    estado = '',
    tipo = ''
) {
    const { mutate: globalMutate } = useSWRConfig();

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && previousPageData.data.length === 0) return null;
        return ['solicitudes', search || '', estado || '', tipo || '', pageIndex + 1];
    };

    const { data, error, isLoading, size, setSize, mutate, isValidating } = useSWRInfinite(
        getKey,
        async ([, searchQuery, estadoQuery, tipoQuery, page]) => {
            const response = await apiClient.getSolicitudes();

            if (response.error) {
                throw new Error(response.error);
            }

            let solicitudes = response.data || [];
            const searchLower = (searchQuery || '').toString().toLowerCase();

            if (estadoQuery) {
                solicitudes = solicitudes.filter((s: any) => s.estado === estadoQuery);
            }
            if (tipoQuery) {
                solicitudes = solicitudes.filter((s: any) => s.tipo === tipoQuery);
            }
            if (searchLower) {
                solicitudes = solicitudes.filter((s: any) =>
                    (s.numeroSolicitud?.toString().toLowerCase() || '').includes(searchLower) ||
                    (s.descripcion || '').toLowerCase().includes(searchLower) ||
                    (s.cliente || '').toLowerCase().includes(searchLower)
                );
            }

            const pageNumber = Number(page) || 1;
            const limit = 20;
            const start = (pageNumber - 1) * limit;
            const pageData = solicitudes.slice(start, start + limit);

            return {
                data: pageData,
                total: solicitudes.length,
                page: pageNumber,
                limit,
                totalPages: Math.max(1, Math.ceil(solicitudes.length / limit))
            };
        }
    );

    const solicitudes = useMemo(() => {
        return data ? data.flatMap((page) => page.data) : [];
    }, [data]);

    const total = solicitudes.length;

    const isLoadingMore =
        isLoading ||
        (size > 0 &&
            data &&
            typeof data[size - 1] === 'undefined');

    const isEmpty = data?.[0]?.data?.length === 0;

    const isReachingEnd =
        isEmpty ||
        (data &&
            data[data.length - 1]?.data.length === 0);

    useEffect(() => {
        solicitudes.forEach((soli: any) => {
            globalMutate(`soli-${soli.numeroSolicitud}`, soli, false);
        });
    }, [solicitudes, globalMutate]);

    return {
        solicitudes,
        total,
        error,
        isLoading,
        isLoadingMore,
        isReachingEnd,
        loadMore: () => setSize(size + 1),
        refresh: mutate
    };
}

export function useSolicitud(id: string | null) {
    const normalizedId = id ? normalizeSolicitudId(id) : null;
    const { data, error, isLoading, mutate } = useSWR(
        normalizedId ? `solicitud-${normalizedId}` : null,
        async () => {
            if (!normalizedId) return null;

            const response = await apiClient.getSolicitud(normalizedId);
            let solicitud = response.data;

            if (!solicitud) {
                solicitud = await mockFetcher(getSourceRequestById(normalizedId));
            }

            if (!solicitud) return null;

            // Transformar estructura de fuentes para coincidir con la UI esperada
            // y mapear propiedades del mock/endpoint a lo que espera el componente
            return {
                ...solicitud,
                numero_solicitud: solicitud.numeroSolicitud,
                rama_asociada: solicitud.ramaAsignada,
                desarrollador: solicitud.desarrolladorId,
                fuentes: (solicitud.fuentesSolicitadas || []).map((fuente: any) => ({
                    nombre: fuente.nombre,
                    tipo: fuente.tipo,
                    estado: fuente.estado,
                    accion: (fuente.tipo === 'nuevo' ? 'crear' : 'modificar') as 'crear' | 'modificar',
                    clase: fuente.tipo === 'nuevo' ? 'N' : 'M'
                }))
            };
        }
    );

    return {
        solicitud: data,
        isLoading,
        error,
        refresh: mutate
    };
}

// ==================== USUARIOS ====================

export function useUsuarios(page = 1, limit = 50) {
    const { data, error, isLoading, mutate } = useSWR(
        `usuarios-${page}-${limit}`,
        async () => {
            await delay(MOCK_DELAY);
            const start = (page - 1) * limit;
            return {
                data: mockUsers.slice(start, start + limit),
                total: mockUsers.length,
                page,
                limit,
                totalPages: Math.ceil(mockUsers.length / limit)
            };
        }
    );

    return {
        usuarios: data?.data || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 0,
        isLoading,
        error,
        refresh: mutate
    };
}

export function useCurrentUser() {
    const { data, error, isLoading } = useSWR(
        'current-user',
        () => mockFetcher(currentUser)
    );

    return {
        user: data,
        isLoading,
        error
    };
}

// ==================== AUDIT LOGS ====================

export function useAuditLogs(filtros?: { entidad?: string; accion?: string }, page = 1, limit = 50) {
    const { data, error, isLoading, mutate } = useSWR(
        `audit-${JSON.stringify(filtros)}-${page}-${limit}`,
        async () => {
            await delay(MOCK_DELAY);
            let logs = [...mockAuditLogs];

            if (filtros?.entidad) {
                logs = logs.filter(l => l.entidad === filtros.entidad);
            }
            if (filtros?.accion) {
                logs = logs.filter(l => l.accion === filtros.accion);
            }

            const start = (page - 1) * limit;
            return {
                data: logs.slice(start, start + limit),
                total: logs.length
            };
        }
    );

    return {
        logs: data?.data || [],
        total: data?.total || 0,
        isLoading,
        error,
        refresh: mutate
    };
}

// ==================== ACCIONES MOCK ====================

export const dataActions = {
    async aprobarMerge(id: string, comentarios?: string) {
        await delay(500);
        console.log('[MOCK] Aprobar merge:', id, comentarios);
        return { success: true, message: 'Merge aprobado exitosamente' };
    },

    async rechazarMerge(id: string, comentarios: string) {
        await delay(500);
        console.log('[MOCK] Rechazar merge:', id, comentarios);
        return { success: true, message: 'Merge rechazado' };
    },

    async crearMergeRequest(data: {
        repositorioId: string;
        ramaOrigen: string;
        ramaDestino: string;
        titulo: string;
        descripcion?: string;
    }) {
        await delay(500);
        return { success: true, data: { id: 'mr-new-' + Date.now() } };
    },

    async ejecutarRollback(repoId: string, data: { rama: string; commitSha: string; motivo: string }) {
        return await apiClient.ejecutarRollback(repoId, data);
    },

    async previewRollback(repoId: string, rama: string, commitSha: string) {
        return await apiClient.previewRollback(repoId, rama, commitSha);
    },

    async actualizarRolUsuario(id: string, rol: string) {
        await delay(500);
        console.log('[MOCK] Actualizar rol:', id, rol);
        return { success: true, message: 'Rol actualizado' };
    },

    async crearRama(data: { repositorioId: string; nombre: string; ramaBase: string }) {
        await delay(500);
        console.log('[MOCK] Crear rama:', data);
        return { success: true, data: { id: 'branch-new-' + Date.now() } };
    },

    async crearSolicitud(data: {
        numeroSolicitud?: string | number;
        tipo?: string;
        cliente?: string;
        descripcion?: string;
        fuentes?: Array<{
            nombre: string;
            tipo: string;
            clase: string;
            accion: 'crear' | 'modificar';
            estado?: string;
        }>;
    }) {
        try {
            const response = await apiClient.crearSolicitud(
                String(data.numeroSolicitud ?? ''),
                data.tipo ?? 'requerimiento',
                data.cliente ?? '',
                data.descripcion ?? '',
                data.fuentes
            );

            if (response?.success && response?.data) {
                return { success: true, data: response.data };
            }

            return {
                success: false,
                data: null,
                error: response?.error || 'Error al crear la solicitud'
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error?.message || 'Error al crear la solicitud'
            };
        }
    },

    async procesarFuentes(data: {
        numeroSolicitud: string | number;
        codigoAS400: string;
        cliente: string;
        tipoSolicitud: string;
        descripcion: string;
        fuentes: Array<{
            accion: 'crear' | 'modificar';
            nombre: string;
            tipo: string;
            clase: string;
        }>;
    }) {
        try {
            const response = await apiClient.procesarFuentes({
                numero_solicitud: String(data.numeroSolicitud ?? ''),
                codigo_as400: data.codigoAS400,
                cliente: data.cliente,
                tipo_solicitud: data.tipoSolicitud,
                descripcion: data.descripcion,
                fuentes: data.fuentes
            });

            if (response?.success && response?.data) {
                const fuentesConErrores = response.data?.fuentes_con_errores ?? [];

                if (Array.isArray(fuentesConErrores) && fuentesConErrores.length > 0) {
                    return {
                        success: false,
                        data: response.data,
                        error: fuentesConErrores[0]?.error || 'Una o mas fuentes presentaron errores al procesarse'
                    };
                }

                return { success: true, data: response.data };
            }

            return {
                success: false,
                data: null,
                error: response?.error || 'Error al procesar las fuentes'
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error?.message || 'Error al procesar las fuentes'
            };
        }
    },

    async solicitarNomenclatura(data: SolicitudNomenclatura) {
        try {
            const response = await apiClient.procesarFuentes({
                numero_solicitud: String(data.numero_solicitud ?? ''),
                codigo_as400: data.codigo_as400,
                cliente: String(data.cliente ?? ''),
                tipo_solicitud: data.tipo_solicitud ?? 'requerimiento',
                descripcion: data.descripcion ?? '',
                fuentes: data.fuentes ?? []
            });

            if (response?.success && response?.data) {
                const fuentesExitosas = response.data?.fuentes_exitosas ?? [];
                const fuentesConErrores = response.data?.fuentes_con_errores ?? [];

                if (Array.isArray(fuentesConErrores) && fuentesConErrores.length > 0) {
                    return {
                        success: false,
                        data: null,
                        error: fuentesConErrores[0]?.error || response.data?.message || 'Error al procesar fuentes'
                    };
                }

                const fuente = Array.isArray(fuentesExitosas) && fuentesExitosas.length > 0
                    ? fuentesExitosas[0]
                    : null;

                return {
                    success: true,
                    data: {
                        nombre: fuente?.nombre || fuente?.fuente || data.fuentes?.[0]?.nombre || ''
                    }
                };
            }

            return {
                success: false,
                data: null,
                error: response?.error || 'Error al procesar fuentes'
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error?.message || 'Error al procesar fuentes'
            };
        }
    }
};

