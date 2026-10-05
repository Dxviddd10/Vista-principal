# Panel-gestion
PAGE.TSX
'use client';

import { useDashboardStats, useActividadReciente, useMergeRequests } from '@/hooks/use-data';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/loading';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderGit2,
  GitMerge,
  FileText,
  GitCommit,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { actividad, isLoading: actividadLoading } = useActividadReciente(10);
  const { mergeRequests, isLoading: mergesLoading } = useMergeRequests({ estado: 'pendiente' }, 1, 5);

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

  const getActionLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      commit: 'Realizó un commit',
      merge: 'Solicitud de merge',
      solicitud: 'Creó una solicitud',
      rollback: 'Ejecutó rollback',
    };
    return labels[tipo] || tipo;
  };

  const actividadIcons: Record<string, React.ElementType> = {
    commit: GitCommit,
    merge: GitMerge,
    solicitud: FileText,
    rollback: Clock,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general del sistema de gestion de repositorios"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Merge Requests Pendientes */}
        <Card className='h-[400px]'>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-amber-600" />
                  Merge Requests Pendientes
                </CardTitle>
                <CardDescription>Solicitudes esperando aprobacion</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/merges">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='overflow-scroll'>
            {mergesLoading ? (
              <Loading text="Cargando merges..." />
            ) : mergeRequests.length === 0 ? (
              <div className="py-8 text-center">
                <GitMerge className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay merge requests pendientes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mergeRequests.map((mr) => (
                  <Link
                    key={mr.id}
                    href={`/merges/${mr.id}`}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 hover:border-amber-200"
                  >
                    <div className="rounded-lg bg-amber-50 p-2">
                      <GitMerge className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{mr.titulo}</span>
                        <StatusBadge type="estado-merge" value={mr.estado} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="rounded bg-muted px-1.5 py-0.5">{mr.rama_origen}</code>
                        <ArrowRight className="h-3 w-3" />
                        <code className="rounded bg-muted px-1.5 py-0.5">{mr.rama_destino}</code>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className='h-[400px] '>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Ultimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent className='overflow-scroll'>
            {actividadLoading ? (
              <Loading text="Cargando actividad..." />
            ) : actividad.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay actividad reciente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividad.map((item, idx) => {
                  const Icon = actividadIcons[item.tipo] || GitCommit;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{item.usuario}</span>
                          {' '}
                          <span className="text-muted-foreground">{getActionLabel(item.tipo)}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.fecha), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
API-CLIENT.TS
import type {
	ApiResponse,
	PaginatedResponse,
	Rama,
	Usuario,
	Commit,
	Version,
	SolicitudFuente,
	SolicitudNomenclatura,
	RespuestaNomenclatura,
	DashboardStats,
	ActividadReciente,
	FiltrosMerge,
	CambioArchivo
} from './types';
import axios from 'axios';
import { request } from '@/lib/http/request';
import { http } from '@/lib/http/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClientError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new ApiClientError(
			errorData.error || errorData.message || 'Error en la solicitud',
			response.status
		);
	}
	return response.json();
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			searchParams.append(key, String(value));
		}
	});
	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : '';
}

// Unifica los distintos formatos que devuelve el backend (snake_case o camelCase) al formato camelCase que consume la UI
function normalizeSolicitud(raw: any): any {
	if (!raw) return raw;

	const fuentesRaw = raw.fuentes ?? raw.fuentesSolicitadas ?? [];

	return {
		...raw,
		id: raw.id ?? raw._id,
		numeroSolicitud: raw.numeroSolicitud ?? raw.numero_solicitud,
		desarrolladorId: raw.desarrolladorId ?? raw.desarrollador,
		fechaCreacion: raw.fechaCreacion ?? raw.fecha_creacion,
		updatedAt: raw.updatedAt ?? raw.fecha_actualizacion,
		ramaAsignada: raw.ramaAsignada ?? raw.rama_asociada,
		repositorioId: raw.repositorioId ?? raw.repositorio_id,
		fuentesSolicitadas: (Array.isArray(fuentesRaw) ? fuentesRaw : []).map((fuente: any) => ({
			nombre: fuente.nombre,
			tipo: fuente.tipo,
			clase: fuente.clase,
			accion: fuente.accion ?? (fuente.tipo === 'nuevo' ? 'crear' : 'modificar'),
			estado: fuente.estado
		}))
	};
}

// Cliente API principal
export const apiClient = {
	// ==================== REPOSITORIOS ====================

	async getRepositorios(
		nombre?: string,
		cliente?: string,
		last_id?: string,
		activo?: string
	) {
		try {
			const query = buildQueryString({
				nombre,
				cliente: cliente !== "all" ? cliente : undefined,
				last_id,
				activo
			});

			const response = await request<any>({
				method: 'GET',
				url: `/api/v1/repos${query}`
			});

			const repos = Array.isArray(response.data)
				? response.data
				: [];

			return {
				data: repos,
				total: repos.length,
				last_id: repos.length
					? repos[repos.length - 1].id
					: null
			};
		} catch (error: any) {
			return {
				data: [],
				total: 0,
				last_id: null,
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	async getRepositorio(id: string) {
		try {
			const response = await request<any>({
				method: 'GET',
				url: `/api/v1/repos/${id}`
			});

			const repo = response.data;

			return {
				data: repo
			};
		} catch (error: any) {
			return {
				data: [],
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	async getRepositorioRamas(repoId: string) {
		try {
			const response = await request<any>({
				method: 'GET',
				url: `/api/v1/projects/${repoId}/branches`
			});

			const ramas = Array.isArray(response.data)
				? response.data
				: [];

			return {
				data: ramas,
				total: ramas.length,
			}
		} catch (error: any) {
			return {
				data: [],
				total: 0,
				error:
					error.message ||
					'Error inesperado'
			}
		}
	},

	async getRepositorioCommits(repoId: string, branch?: string, page = 1) {
		try {
			const query = buildQueryString({ branch, page });
			const response = await axios.get(
				`${API_BASE_URL}/api/v1/projects/${repoId}/commits${query}`,
				{
					headers: {
						"X-Test-Email": "dayron.quevedo@sistemasgyg.com"
					},
					timeout: 15000
				}
			);
			return {
				data: response.data.data || [],
				total: response.data.data?.length || 0
			};
		} catch (error: any) {
			return {
				data: [],
				total: 0,
				error: error?.response?.data?.message || error.message || "Error inesperado"
			};
		}
	},

	async getRepositorioVersiones(repoId: string): Promise<ApiResponse<Version[]>> {
		const response = await fetch(`${API_BASE_URL}/repositorios/${repoId}/versions`);
		return handleResponse<ApiResponse<Version[]>>(response);
	},

	async manageBranchProtection(data: {
		target_id: string;
		target_type: 'project' | 'group';
		action: 'protect' | 'unprotect';
	}) {
		try {
			const response = await http.post(
				'/api/v1/governance/branch-protection',
				{
					target_id: data.target_id,
					target_type: data.target_type,
					action: data.action
				},
				{
					headers: {
						'X-Test-Email': 'juan.palencia@sistemasgyg.com',
						'X-User-Username': 'juan.palencia'
					}
				}
			);

			return {
				success: true,
				data: response.data,
				status: response.status
			};
		} catch (error: any) {
			const status = error?.response?.status;
			const message =
				error?.response?.data?.error ||
				error?.response?.data?.message ||
				error.message ||
				'Error inesperado';

			return {
				success: false,
				data: null,
				status,
				error: message
			};
		}
	},

	// ==================== RAMAS ====================

	async getRama(id: string): Promise<ApiResponse<Rama>> {
		const response = await fetch(`${API_BASE_URL}/ramas/${id}`);
		return handleResponse<ApiResponse<Rama>>(response);
	},

	async crearRama(data: {
		repo_id: string;
		name: string;
		base_branch: string;
		solicitud: number;
		tipoderama: string;
		cliente: string;
	}): Promise<ApiResponse<Rama>> {
		const response = await fetch(`${API_BASE_URL}/ramas`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return handleResponse<ApiResponse<Rama>>(response);
	},

	async actualizarEstadoRama(id: string, estado: string): Promise<ApiResponse<Rama>> {
		const response = await fetch(`${API_BASE_URL}/ramas/${id}/estado`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ estado })
		});
		return handleResponse<ApiResponse<Rama>>(response);
	},

	// ==================== SOLICITUDES ====================

	async getSolicitudes(page = 1, limit = 20): Promise<PaginatedResponse<SolicitudFuente>> {
		try {
			const response = await request<any>({
				method: 'GET',
				url: '/api/v1/solicitudes'
			});

			const solicitudesRaw = Array.isArray(response)
				? response
				: Array.isArray(response.data)
				? response.data
				: [];

			const solicitudes = solicitudesRaw.map(normalizeSolicitud);
			const total = solicitudes.length;
			const totalPages = Math.max(1, Math.ceil(total / limit));
			const start = (page - 1) * limit;

			return {
				data: solicitudes.slice(start, start + limit),
				total,
				page,
				limit,
				totalPages,
			};
		} catch (error: any) {
			return {
				data: [],
				total: 0,
				page,
				limit,
				totalPages: 0,
				error: error.message || 'Error al cargar solicitudes'
			};
		}
	},

	async getSolicitud(id: string): Promise<ApiResponse<SolicitudFuente>> {
		const response = await request<any>({
			method: 'GET',
			url: `/api/v1/solicitudes/${id}`
		});

		return { success: true, data: normalizeSolicitud(response?.data ?? response) };
	},

	async crearSolicitud(
		numero_solicitud: string,
		tipo_solicitud: string,
		cliente: string,
		descripcion: string,
		fuentes?: Array<{
			nombre: string;
			tipo: string;
			clase: string;
			accion: 'crear' | 'modificar';
			estado?: string;
		}>
	) {
		try {
			const response = await request<any>({
				method: 'POST',
				url: '/api/v1/solicitudes',
				data: {
					numero_solicitud,
					tipo_solicitud,
					cliente,
					descripcion,
					email_responsable: "dayron.quevedo@sistemasgyg.com",
					...(fuentes ? { fuentes } : {})
				}
			});

			const payload = response?.data ?? response;

			return {
				success: true,
				data: payload
			};
		} catch (error: any) {
			return {
				success: false,
				data: null,
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	async validarExistenciaFuente(
		nombre_elemento: string,
		archivo_fuente: string,
		tipo_elemento: string,
		param0 = '053'
	) {
		try {
			const response = await request<any>({
				method: 'POST',
				url: '/api/v1/solicitudes/consultar_fuente',
				data: {
					Param0: param0,
					Nombre_Del_Elemento: nombre_elemento,
					Archivo_Fuente: archivo_fuente,
					Tipo_De_Elemento: tipo_elemento
				}
			});

			return {
				success: true,
				data: response?.data ?? response,
				status: response?.status ?? 200
			};
		} catch (error: any) {
			const status = error?.status || error?.response?.status;

			return {
				success: false,
				data: null,
				status,
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	// ==================== NOMENCLATURA ====================

	async procesarFuentes(data: {
		numero_solicitud: string;
		codigo_as400: string;
		cliente: string;
		tipo_solicitud: string;
		descripcion: string;
		fuentes: Array<{
			accion: 'crear' | 'modificar';
			nombre: string;
			tipo: string;
			clase: string;
		}>;
	}) {
		try {
			const response = await request<any>({
				method: 'POST',
				url: '/api/v1/solicitudes/procesar-fuentes',
				data: { Data: data }
			});

			return {
				success: true,
				data: response?.data ?? response,
				status: response?.status ?? 200
			};
		} catch (error: any) {
			const status = error?.status || error?.response?.status;
			return {
				success: false,
				data: null,
				status,
				error: error.message || 'Error inesperado'
			};
		}
	},

	// ==================== MERGE REQUESTS ====================

	async getMergeRequests(
		filtros?: FiltrosMerge,
		last_id?: string
	) {
		try {
			// Creamos el query string para la peticion
			const query = buildQueryString({
				repo_nombre: filtros?.repo_nombre,
				rama_destino: filtros?.rama_destino,
				estado: filtros?.estado,
				last_id
			});

			const response = await request<any>({
				method: 'GET',
				url: `/api/v1/merge_requests${query}`
			});

			const merges = Array.isArray(response.data)
				? response.data
				: [];

			return {
				data: merges,
				total: merges.length,
				last_id: merges.length
					? merges[merges.length - 1].id
					: null
			};
		} catch (error: any) {
			return {
				data: [],
				total: 0,
				last_id: null,
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	async getMergeRequest(merge_id: string) {
		try {
			const query = buildQueryString({ merge_id });

			const response = await request<any>({
				method: 'GET',
				url: `/api/v1/merge_requests${query}`
			});

			return response.data[0];
		} catch (error: any) {
			return {
				data: null,
				error:
					error.message ||
					'Error inesperado'
			};
		}
	},

	async crearMergeRequest(
		repoId: string,
		data: {
			source_branch: string;
			target_branch: string;
			title: string;
			descripcion: string;
			solicitud_numero?: number;
			solicitante: string;
		}
	) {
		return await request<any>({
			method: 'POST',
			url: `/api/v1/projects/${repoId}/merge_requests`,
			data
		});
	},

	async aprobarMergeRequest(
		id: string,
		rama_origen: string,
		payload: {
			email_admin: string
			delete_repo: boolean
		}
	) {
		return await request<{
			gitlab_closed: boolean;
			mensaje?: string;
		}>({
			method: 'POST',
			url: `/api/v1/projects/${id}/branches/${rama_origen}/approve`,
			data: {
				email_admin: payload.email_admin
			}
		});
	},

	async rechazarMergeRequest(
		id: string,
		branch_name: string,
		payload: {
			email_responsable: string;
			motivo: string;
			tipo_devolucion: string;
		}
	) {
		return await request<{
			gitlab_closed: boolean;
			mensaje?: string;
		}>({
			method: 'POST',
			url: `/api/v1/projects/${id}/branches/${branch_name}/return`,
			data: {
				email_responsable: payload.email_responsable,
				motivo: payload.motivo,
				tipo_devolucion: payload.tipo_devolucion
			}
		});
	},

	async getMergeRequestDiff(id: string): Promise<ApiResponse<{ cambios: import('./types').CambioArchivo[] }>> {
		const response = await fetch(`${API_BASE_URL}/merges/${id}/diff`);
		return handleResponse<ApiResponse<{ cambios: import('./types').CambioArchivo[] }>>(response);
	},

	// ==================== ROLLBACK ====================

	async previewRollback(repoId: string, rama: string, commitSha: string) {
		try {
			const query = buildQueryString({ branch: rama, commit_sha: commitSha });
			const response = await axios.get(
				`${API_BASE_URL}/api/v1/projects/${repoId}/rollback/preview${query}`,
				{
					headers: { 'X-Test-Email': 'juan.palencia@sistemasgyg.com' },
					timeout: 15000,
				}
			);
			return { success: true, data: response.data.data };
		} catch (error: any) {
			return {
				success: false,
				data: null,
				error: error?.response?.data?.error || error.message,
			};
		}
	},

	async ejecutarRollback(
		repoId: string,
		data: { rama: string; commitSha: string; motivo: string }
	) {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/v1/projects/${repoId}/rollback`,
				data,
				{
					headers: {
						'X-Test-Email': 'juan.palencia@sistemasgyg.com',
						'Content-Type': 'application/json',
					},
					timeout: 30000,
				}
			);
			return { success: true, message: response.data.message };
		} catch (error: any) {
			return {
				success: false,
				message: error?.response?.data?.error || error.message,
			};
		}
	},

	// ==================== USUARIOS ====================

	async getUsuarios(page = 1, limit = 50): Promise<PaginatedResponse<Usuario>> {
		const query = buildQueryString({ page, limit });
		const response = await fetch(`${API_BASE_URL}/usuarios${query}`);
		return handleResponse<PaginatedResponse<Usuario>>(response);
	},

	async getUsuario(id: string): Promise<ApiResponse<Usuario>> {
		const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
		return handleResponse<ApiResponse<Usuario>>(response);
	},

	async actualizarRolUsuario(id: string, rol: string): Promise<ApiResponse<Usuario>> {
		const response = await fetch(`${API_BASE_URL}/usuarios/${id}/rol`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ rol })
		});
		return handleResponse<ApiResponse<Usuario>>(response);
	},

	// ==================== DASHBOARD ====================

	async getDashboardStats(): Promise<DashboardStats> {
		try {
			const response = await request<any>({
				method: 'GET',
				url: 'api/v1/dashboard/estadisticas'
			});

			return {
				total_commits: response.data?.total_commits || 0,
				total_merges_aprobados: response.data?.total_merges_aprobados || 0,
				total_ramas_creadas: response.data?.total_ramas_creadas || 0,
				desde: response.data?.desde,
				hasta: response.data?.hasta
			};
		} catch (error: any) {
			return {
				total_commits: 0,
				total_merges_aprobados: 0,
				total_ramas_creadas: 0
			};
		}
	},

	async getActividadReciente(limit = 10): Promise<ActividadReciente[]> {
		try {
			const query = buildQueryString({ limit });
			const response = await request<any>({
				method: 'GET',
				url: `api/v1/dashboard/actividad${query}`
			});

			const actividades = Array.isArray(response.data) ? response.data : [];
			return actividades;
		} catch (error: any) {
			return [];
		}
	},

	// ==================== COMMITS ====================

	async getCommit(repoId: string, commitId: string): Promise<ApiResponse<Commit>> {
		const response = await fetch(`${API_BASE_URL}/repositorios/${repoId}/commits/${commitId}`);
		return handleResponse<ApiResponse<Commit>>(response);
	},

	async getCommitDiff(repoId: string, commitId: string): Promise<ApiResponse<{ cambios: import('./types').CambioArchivo[] }>> {
		const response = await fetch(`${API_BASE_URL}/repositorios/${repoId}/commits/${commitId}/diff`);
		return handleResponse<ApiResponse<{ cambios: import('./types').CambioArchivo[] }>>(response);
	},

	async compareBranches(
		id: string,
		from: string,
		to: string
	) {
		return await request<ApiResponse<{
			compare_timeout: boolean,
			compare_same_ref: boolean,
			diffs: CambioArchivo[];
		}>>({
			method: 'GET',
			url: `api/v1/projects/${id}/branches/compare`,
			params: {
				from,
				to
			}
		})
	}
};

export { ApiClientError };
export default apiClient;
MOCK-DATA.TS
import type {
    SourceRequest,
    User,
    AuditLog,
} from "./types";

// Usuario actual simulado (admin)
export const currentUser: User = {
    id: "usr-001",
    email: "admin@empresa.com",
    nombre: "Carlos Administrador",
    rol: "admin",
    activo: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
};

// Usuarios del sistema
export const mockUsers: User[] = [
    currentUser,
    {
        id: "usr-002",
        email: "maria.lead@empresa.com",
        nombre: "María García",
        rol: "lead",
        activo: true,
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
    },
    {
        id: "usr-003",
        email: "pedro.dev@empresa.com",
        nombre: "Pedro Desarrollador",
        rol: "developer",
        activo: true,
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
    },
    {
        id: "usr-004",
        email: "ana.qa@empresa.com",
        nombre: "Ana QA",
        rol: "devops",
        activo: true,
        createdAt: "2024-02-10T10:00:00Z",
        updatedAt: "2024-02-10T10:00:00Z",
    },
    {
        id: "usr-005",
        email: "luis.viewer@empresa.com",
        nombre: "Luis Consultor",
        rol: "viewer",
        activo: true,
        createdAt: "2024-03-01T10:00:00Z",
        updatedAt: "2024-03-01T10:00:00Z",
    },
];

// Solicitudes de fuentes
export const mockSourceRequests: SourceRequest[] = [
    {
        id: "req-001",
        numeroSolicitud: "R1205",
        tipo: "requerimiento",
        cliente: "Corporativo ABC",
        descripcion: "Implementar validación de CFDI 4.0 según nuevas normativas del SAT",
        tipoFuente: "modificacion",
        fuentesSolicitadas: [
            { nombre: "src/validators/cfdi.ts", tipo: "modificacion", estado: "en_desarrollo" },
            { nombre: "src/models/invoice.ts", tipo: "modificacion", estado: "en_desarrollo" },
            { nombre: "tests/cfdi.test.ts", tipo: "nuevo", estado: "en_desarrollo" },
        ],
        repositorioId: "repo-001",
        ramaAsignada: "R1205",
        estado: "en_desarrollo",
        desarrolladorId: "usr-003",
        createdAt: "2024-04-15T09:00:00Z",
        updatedAt: "2024-04-22T11:30:00Z",
    },
    {
        id: "req-002",
        numeroSolicitud: "R1208",
        tipo: "requerimiento",
        cliente: "Retail XYZ",
        descripcion: "Agregar soporte para notas de crédito en el sistema de facturación",
        tipoFuente: "nuevo",
        fuentesSolicitadas: [
            { nombre: "src/documents/creditNote.ts", tipo: "nuevo", estado: "en_desarrollo" },
            { nombre: "src/api/routes.ts", tipo: "modificacion", estado: "en_desarrollo" },
        ],
        repositorioId: "repo-001",
        ramaAsignada: "R1208",
        estado: "en_desarrollo",
        desarrolladorId: "usr-002",
        createdAt: "2024-04-18T14:00:00Z",
        updatedAt: "2024-04-22T09:15:00Z",
    },
    {
        id: "req-003",
        numeroSolicitud: "R1195",
        tipo: "incidente",
        cliente: "Servicios DEF",
        descripcion: "Error en generación de PDF para facturas con más de 100 conceptos",
        tipoFuente: "modificacion",
        fuentesSolicitadas: [
            { nombre: "src/generators/pdf.ts", tipo: "modificacion", estado: "completado" },
            { nombre: "src/templates/invoice.hbs", tipo: "modificacion", estado: "completado" },
        ],
        repositorioId: "repo-001",
        ramaAsignada: "R1195",
        estado: "en_test",
        desarrolladorId: "usr-003",
        createdAt: "2024-04-10T11:00:00Z",
        updatedAt: "2024-04-20T17:00:00Z",
    },
    {
        id: "req-004",
        numeroSolicitud: "R1210",
        tipo: "requerimiento",
        cliente: "Logística GHI",
        descripcion: "Rediseño del dashboard de usuario con nuevas métricas",
        tipoFuente: "modificacion",
        fuentesSolicitadas: [
            { nombre: "src/pages/Dashboard.tsx", tipo: "modificacion", estado: "en_desarrollo" },
            { nombre: "src/components/UserStats.tsx", tipo: "nuevo", estado: "pendiente" },
        ],
        repositorioId: "repo-002",
        ramaAsignada: "R1210",
        estado: "pendiente_autorizacion",
        desarrolladorId: "usr-003",
        createdAt: "2024-04-20T10:00:00Z",
        updatedAt: "2024-04-22T14:30:00Z",
    },
    {
        id: "req-005",
        numeroSolicitud: "R1198",
        tipo: "incidente",
        cliente: "Corporativo ABC",
        descripcion: "Timeout en consultas de reportes con más de 10,000 registros",
        tipoFuente: "modificacion",
        fuentesSolicitadas: [
            { nombre: "src/queries/reports.ts", tipo: "modificacion", estado: "completado" },
        ],
        repositorioId: "repo-001",
        ramaAsignada: "R1198",
        estado: "completado",
        desarrolladorId: "usr-003",
        createdAt: "2024-04-05T08:00:00Z",
        updatedAt: "2024-04-15T14:00:00Z",
    },
];

// Audit Logs
export const mockAuditLogs: AuditLog[] = [
    {
        id: "log-001",
        usuarioId: "usr-003",
        usuarioNombre: "Pedro Desarrollador",
        accion: "commit",
        entidad: "repositorio",
        entidadId: "repo-001",
        detalles: {
            rama: "R1205",
            sha: "a1b2c3d4e5f6789012345678901234567890abcd",
            mensaje: "feat: Implementar validación de CFDI 4.0",
        },
        createdAt: "2024-04-22T11:30:00Z",
    },
    {
        id: "log-002",
        usuarioId: "usr-003",
        usuarioNombre: "Pedro Desarrollador",
        accion: "solicitar_merge",
        entidad: "merge_request",
        entidadId: "mr-001",
        detalles: {
            ramaOrigen: "R1205",
            ramaDestino: "desarrollo",
        },
        createdAt: "2024-04-22T12:00:00Z",
    },
    {
        id: "log-003",
        usuarioId: "usr-001",
        usuarioNombre: "Carlos Administrador",
        accion: "aprobar_merge",
        entidad: "merge_request",
        entidadId: "mr-003",
        detalles: {
            ramaOrigen: "R1198",
            ramaDestino: "main",
        },
        createdAt: "2024-04-15T14:00:00Z",
    },
    {
        id: "log-004",
        usuarioId: "usr-001",
        usuarioNombre: "Carlos Administrador",
        accion: "rechazar_merge",
        entidad: "merge_request",
        entidadId: "mr-005",
        detalles: {
            ramaOrigen: "R1190",
            ramaDestino: "desarrollo",
            motivo: "Se requieren pruebas adicionales de rendimiento antes de aprobar",
        },
        createdAt: "2024-04-09T11:00:00Z",
    },
    {
        id: "log-005",
        usuarioId: "usr-003",
        usuarioNombre: "Pedro Desarrollador",
        accion: "crear_solicitud",
        entidad: "solicitud",
        entidadId: "req-001",
        detalles: {
            numeroSolicitud: "R1205",
            cliente: "Corporativo ABC",
        },
        createdAt: "2024-04-15T09:00:00Z",
    },
    {
        id: "log-006",
        usuarioId: "usr-001",
        usuarioNombre: "Carlos Administrador",
        accion: "rollback",
        entidad: "repositorio",
        entidadId: "repo-003",
        detalles: {
            rama: "main",
            commitAnterior: "abc123",
            commitNuevo: "def456",
            motivo: "Error crítico en producción",
        },
        createdAt: "2024-04-10T08:30:00Z",
    },
];

export const getSourceRequestById = (id: string) => mockSourceRequests.find((s) => s.id === id);

export const getUserById = (id: string) => mockUsers.find((u) => u.id === id);

// Simular delay de API
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

