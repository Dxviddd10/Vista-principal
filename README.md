export interface FlujoFavorito {
  id: string;
  name: string;
  estado: string;
  tipo: string;
  cliente: string;
  dateFrom: string;
  dateTo: string;
}

// Igual que antes: cada usuario tiene su propia lista, namespaced por su id,
// porque este proyecto real sí tiene autenticación (useAuth), a diferencia
// del mock donde simulábamos un usuario fijo.
function storageKey(userId: string): string {
  return `flujoDespliegues.favoritos.${userId}`;
}

export function getFlujoFavoritos(userId: string): FlujoFavorito[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as FlujoFavorito[]) : [];
  } catch {
    return [];
  }
}

export function saveFlujoFavorito(userId: string, favorito: FlujoFavorito): FlujoFavorito[] {
  const current = getFlujoFavoritos(userId);
  const updated = [...current, favorito];
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(updated));
  } catch {
    // si falla el guardado, no rompemos la UI
  }
  return updated;
}

export function deleteFlujoFavorito(userId: string, id: string): FlujoFavorito[] {
  const updated = getFlujoFavoritos(userId).filter((f) => f.id !== id);
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(updated));
  } catch {
    // ver comentario de arriba
  }
  return updated;
}
