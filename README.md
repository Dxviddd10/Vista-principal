'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRepositorios } from '@/hooks/use-data';
import { PageHeader } from '@/components/shared/page-header';
import { Loading } from '@/components/shared/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEstadoBadge } from '@/utils/getEstadoBadge';

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
	FolderGit2,
	Search,
	GitBranch,
	History,
	ExternalLink,
	Filter,
	RotateCcw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { advancedMatch } from '@/utils/filtered';

export default function RepositoriosPage() {

	const [searchInput, setSearchInput] = useState('');
	const [searchApi, setSearchApi] = useState('');
	const [status, setStatus] = useState('all');
	const [clienteInput, setClienteInput] = useState('');
	const [clienteApi, setClienteApi] = useState('');

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	const {
		repositorios,
		total,
		isLoading,
		error,
		loadMore,
		isLoadingMore,
		isReachingEnd
	} = useRepositorios(searchApi, clienteApi);

	const reposFiltrados = useMemo(() => {
		return repositorios.filter((repo: any) => {
			const coincideTexto =
				advancedMatch(repo.nombre || '', searchInput) ||
				advancedMatch(repo.descripcion || '', searchInput);

			const coincideCliente = advancedMatch(
				repo.cliente || '',
				clienteInput
			);

			const coincideEstado =
				status === 'all'
					? true
					: repo.activo === status;

			return coincideTexto && coincideCliente && coincideEstado
		});
	}, [repositorios, searchInput, clienteInput, status]);

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
		setClienteApi(clienteInput.trim());
	};

	const clearFilters = () => {
		setSearchInput('');
		setSearchApi('');
		setClienteInput('');
		setClienteApi('');
		setStatus('all');
	};

	if (error) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<p className="text-destructive">
					Error al cargar repositorios
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Repositorios"
				description={`${total} repositorios registrados en el sistema`}
			/>

			{/* Filtros */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<CardTitle className="text-base">
							Filtros
						</CardTitle>
					</div>
				</CardHeader>

				<CardContent>
					<div className="flex flex-col gap-4 md:flex-row md:items-end">
						<form
							onSubmit={handleSearch}
							className="flex flex-1 gap-2"
						>
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

								<Input
									placeholder="Buscar por nombre o descripción..."
									value={searchInput}
									onChange={(e) =>
										setSearchInput(e.target.value)
									}
									className="pl-9"
								/>
							</div>

							<div className="relative w-[220px]">
								<Input
									placeholder="Filtrar cliente..."
									value={clienteInput}
									onChange={(e) =>
										setClienteInput(e.target.value)
									}
								/>
							</div>

							<Button
								type="submit"
								variant="secondary"
							>
								Buscar
							</Button>
						</form>

						<Select
							value={status}
							onValueChange={setStatus}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Estado" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="all">
									Todos
								</SelectItem>
								<SelectItem value="active">
									Activo
								</SelectItem>
								<SelectItem value="deprecated">
									Obsoleto
								</SelectItem>
								<SelectItem value="frozen">
									Congelado
								</SelectItem>
							</SelectContent>
						</Select>

						{(searchInput || clienteInput || status !== 'all') && (
							<Button
								variant="ghost"
								onClick={clearFilters}
							>
								Limpiar filtros
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tabla */}
			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<Loading text="Cargando repositorios..." />
					) : reposFiltrados.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<FolderGit2 className="mb-4 h-12 w-12 text-muted-foreground/30" />

							<p className="text-muted-foreground">
								No se encontraron repositorios
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<div>
								<div
									className="max-h-[400px] overflow-y-auto "
									ref={scrollContainerRef}
									onScroll={handleScroll}
								>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>
													Repositorio
												</TableHead>

												<TableHead>
													Cliente
												</TableHead>

												<TableHead>
													Estado
												</TableHead>

												<TableHead>
													Ramas
												</TableHead>

												<TableHead>
													Última Actividad
												</TableHead>

												<TableHead className="text-right">
													Acciones
												</TableHead>
											</TableRow>
										</TableHeader>

										<TableBody className=''>
											{reposFiltrados.map((repo: any, index: number) => (
												<TableRow key={index}>
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
																<FolderGit2 className="h-5 w-5 text-blue-600" />
															</div>

															<div>
																<Link
																	href={`/repositorios/${repo.gitlabId}`}
																	className="font-medium hover:underline"
																>
																	{repo.nombre}
																</Link>

																<p className="text-sm text-muted-foreground line-clamp-1 w-80 overflow-x-hidden">
																	{repo.descripcion}
																</p>
															</div>
														</div>
													</TableCell>

													<TableCell>
														{repo.cliente}
													</TableCell>

													<TableCell>
														{getEstadoBadge(repo.activo)}
													</TableCell>

													<TableCell>
														<span className="font-medium">
															{repo.numeroDeRamas}
														</span>
													</TableCell>

													<TableCell>
														<span className="text-sm text-muted-foreground">
															{formatDistanceToNow(
																new Date(
																	repo.updatedAt
																),
																{
																	addSuffix: true,
																	locale: es
																}
															)}
														</span>
													</TableCell>

													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-1">
															<Button
																variant="ghost"
																size="icon"
																asChild
																title="Ver detalles"
															>
																<Link
																	href={`/repositorios/${repo.gitlabId}`}
																>
																	<ExternalLink className="h-4 w-4" />
																</Link>
															</Button>

															<Button
																variant="ghost"
																size="icon"
																asChild
																title="Ver ramas"
															>
																<Link
																	href={`/repositorios/${repo.gitlabId}/ramas`}
																>
																	<GitBranch className="h-4 w-4" />
																</Link>
															</Button>

															<Button
																variant="ghost"
																size="icon"
																asChild
																title="Ver commits"
															>
																<Link
																	href={`/repositorios/${repo.gitlabId}/commits`}
																>
																	<History className="h-4 w-4" />
																</Link>
															</Button>

															<Button
																variant="ghost"
																size="icon"
																asChild
																title="Rollback"
															>
																<Link
																	href={`/repositorios/${repo.gitlabId}/rollback`}
																>
																	<RotateCcw className="h-4 w-4" />
																</Link>
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									{isLoadingMore && (
										<div className="py-4 text-center text-sm text-muted-foreground">
											Cargando más repositorios...
										</div>
									)}

									{isReachingEnd && repositorios.length > 0 && (
										<div className="py-4 text-center text-sm text-muted-foreground">
											No hay más repositorios
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
