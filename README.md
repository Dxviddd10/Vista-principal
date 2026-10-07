import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notificaciones
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Filtros globales
  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  // Repositorio seleccionado (para contexto)
  selectedRepoId: string | null;
  setSelectedRepoId: (id: string | null) => void;

  // Modal de confirmacion
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  openConfirmDialog: (config: Omit<AppState['confirmDialog'], 'isOpen'>) => void;
  closeConfirmDialog: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Notificaciones
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() }
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearNotifications: () => set({ notifications: [] }),

  // Filtros globales
  globalSearch: '',
  setGlobalSearch: (search) => set({ globalSearch: search }),

  // Repositorio seleccionado
  selectedRepoId: null,
  setSelectedRepoId: (id) => set({ selectedRepoId: id }),

  // Modal de confirmacion
  confirmDialog: {
    isOpen: false,
    title: '',
    message: ''
  },
  openConfirmDialog: (config) =>
    set({
      confirmDialog: { ...config, isOpen: true }
    }),
  closeConfirmDialog: () =>
    set((state) => ({
      confirmDialog: { ...state.confirmDialog, isOpen: false }
    }))
}));

// Helper para notificaciones
export function notify(
  type: Notification['type'],
  title: string,
  message?: string
) {
  useAppStore.getState().addNotification({ type, title, message });
}
