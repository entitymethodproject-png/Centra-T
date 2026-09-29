import { useState, useEffect, useMemo, useCallback } from 'react';
import { TaskItem, ShoppingItem, CleaningItem } from '../../items/entities/item.entity';
import {
  CalendarSchedulableItem,
  DragItemPayload,
  SchedulableDragPayload,
  ItemModule,
} from '../../calendar-sync/types/drag-drop.types';
import { useItemFilters } from '../../filters/hooks/useItemFilters';
import { sortItems } from '../../filters/utils/sortEngine';
import { applyFilters } from '../../filters/utils/filterEngine';
import { SortConfiguration, DEFAULT_SORT_CONFIG } from '../../filters/types/sort.types';
import { useNetworkStatus } from './useNetworkStatus';
import { EmpathicMessage, formatEmpathicError } from '../../infrastructure/http/apiClient';

export interface UseWorkspaceControllerProps {
  initialAuthenticated?: boolean;
  initialTasks?: TaskItem[];
  initialShoppingItems?: ShoppingItem[];
  initialCleaningItems?: CleaningItem[];
  simulateApiErrorOnToggle?: boolean;
}

export interface ReassignConflictState {
  item: DragItemPayload;
  targetDate: string;
  originDate: string;
}

export interface BulkShoppingConflictState {
  targetDate: string;
  pendingCount: number;
}

export interface ContextMenuState {
  position: { x: number; y: number };
  item: { id: string; modulo: ItemModule; titulo: string };
}

export interface ToastState {
  isOpen: boolean;
  message: EmpathicMessage;
  type?: 'error' | 'warning' | 'info' | 'success';
}

/**
 * Helper para sincronizar mutaciones de ítems directamente con PostgreSQL vía API REST.
 * Desacopla la serialización de fechas y compatibilidad de campos entre módulos.
 */
function syncItemUpdateToApi(
  modulo: 'tasks' | 'shopping' | 'cleaning',
  item: any,
  isMockEnvironment: boolean
) {
  if (typeof window === 'undefined' || isMockEnvironment) return;

  const fechaStr = item.fechaProgramada
    ? typeof item.fechaProgramada === 'string'
      ? (item.fechaProgramada as string).slice(0, 10)
      : item.fechaProgramada instanceof Date
      ? item.fechaProgramada.toISOString().slice(0, 10)
      : undefined
    : null;

  const payload: Record<string, any> = {
    titulo: item.titulo || item.nombre,
    descripcion: item.descripcion,
    prioridad: item.prioridad,
    completado: item.completado,
    fechaProgramada: fechaStr,
  };

  if (modulo === 'shopping') {
    payload.comprado = Boolean(item.comprado || item.completado);
  }

  fetch(`/api/${modulo}/${item.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function syncItemDeleteToApi(
  modulo: 'tasks' | 'shopping' | 'cleaning',
  id: string,
  isMockEnvironment: boolean
) {
  if (typeof window === 'undefined' || isMockEnvironment) return;
  fetch(`/api/${modulo}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => {});
}

/**
 * Controller / ViewModel para la orquestación del estado del Workspace de Centra-T.
 * Desacopla la lógica de negocio, optimismo, resolución de conflictos DnD
 * y sincronización de colecciones de la capa puramente presentacional (View).
 */
export function useWorkspaceController({
  initialAuthenticated = false,
  initialTasks,
  initialShoppingItems,
  initialCleaningItems,
  simulateApiErrorOnToggle = false,
}: UseWorkspaceControllerProps = {}) {
  // 1. Estado de Sesión y Red
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initialAuthenticated) return true;
    if (typeof window !== 'undefined') {
      if (window.localStorage && window.localStorage.getItem('centrat_auth') === 'true') {
        return true;
      }
      if (window.sessionStorage && window.sessionStorage.getItem('centrat_auth') === 'true') {
        return true;
      }
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<{ userId: string; email: string; name: string } | null>(null);

  const { isOffline } = useNetworkStatus();

  // 2. Estado de Colecciones Reactivas en Cliente
  const [allTasks, setAllTasks] = useState<TaskItem[]>(initialTasks || []);
  const [allShopping, setAllShopping] = useState<ShoppingItem[]>(initialShoppingItems || []);
  const [allCleaning, setAllCleaning] = useState<CleaningItem[]>(initialCleaningItems || []);

  // 3. Modales y Configuración de Filtrado/Ordenación
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfiguration>(DEFAULT_SORT_CONFIG);

  // 4. Estados de Conflicto y Menús Contextuales
  const [reassignConflict, setReassignConflict] = useState<ReassignConflictState | null>(null);
  const [bulkShoppingConflict, setBulkShoppingConflict] = useState<BulkShoppingConflictState | null>(null);
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);
  const [toastState, setToastState] = useState<ToastState | null>(null);


  // Comprobación de sesión HttpOnly activa en NestJS al montar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    const checkServerSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok && isMounted) {
          const data = await res.json().catch(() => null);
          if (data?.user) {
            setCurrentUser(data.user);
          }
          setIsAuthenticated(true);
          if (window.localStorage) {
            window.localStorage.setItem('centrat_auth', 'true');
          }
          if (window.sessionStorage) {
            window.sessionStorage.setItem('centrat_auth', 'true');
          }
        } else if (res.status === 401 && isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          if (window.localStorage) {
            window.localStorage.removeItem('centrat_auth');
          }
          if (window.sessionStorage) {
            window.sessionStorage.removeItem('centrat_auth');
          }
        }
      } catch {
        // En entorno mock o sin red
      }
    };

    if (!initialAuthenticated) {
      checkServerSession();
    }
    return () => {
      isMounted = false;
    };
  }, [initialAuthenticated]);

  // Carga de colecciones reales desde PostgreSQL cuando la sesión está activa
  useEffect(() => {
    if (!isAuthenticated || initialTasks !== undefined) return;
    if (typeof window === 'undefined') return;

    let isMounted = true;
    const fetchCollections = async () => {
      try {
        const [tasksRes, shoppingRes, cleaningRes] = await Promise.all([
          fetch('/api/tasks', { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
          fetch('/api/shopping', { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
          fetch('/api/cleaning', { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
        ]);

        if (!isMounted) return;

        const normalize = (item: any) => ({
          ...item,
          nombre: item.titulo,
          fechaProgramada: item.fechaProgramada
            ? new Date(`${String(item.fechaProgramada).slice(0, 10)}T00:00:00`)
            : null,
          createdAt: new Date(item.createdAt || Date.now()),
          updatedAt: new Date(item.updatedAt || Date.now()),
        });

        if (Array.isArray(tasksRes)) setAllTasks(tasksRes.map(normalize));
        if (Array.isArray(shoppingRes)) setAllShopping(shoppingRes.map(normalize));
        if (Array.isArray(cleaningRes)) setAllCleaning(cleaningRes.map(normalize));
      } catch {
        // En entorno mock o sin backend
      }
    };

    fetchCollections();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, initialTasks]);

  // Hook reactivo de filtrado para tareas
  const {
    criteria,
    filteredItems: filteredTasks,
    isFiltered,
    activeFilterCount,
    setCriteria,
    resetFilters,
  } = useItemFilters(allTasks);

  // Procesamiento reactivo (Filtro + Ordenación) para cada colección
  const processedTasks = useMemo(() => {
    return sortItems(filteredTasks, sortConfig);
  }, [filteredTasks, sortConfig]);

  const processedShopping = useMemo(() => {
    const filtered = applyFilters(allShopping, criteria);
    return sortItems(filtered, sortConfig);
  }, [allShopping, criteria, sortConfig]);

  const processedCleaning = useMemo(() => {
    const filtered = applyFilters(allCleaning, criteria);
    return sortItems(filtered, sortConfig);
  }, [allCleaning, criteria, sortConfig]);

  // Manejo de autenticación
  const handleLoginSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.setItem('centrat_auth', 'true');
      }
      if (window.sessionStorage) {
        window.sessionStorage.setItem('centrat_auth', 'true');
      }
    }
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.removeItem('centrat_auth');
      }
      if (window.sessionStorage) {
        window.sessionStorage.removeItem('centrat_auth');
      }
      try {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch {}
    }
  }, []);

  // Mutación optimista genérica con rollback empático
  const toggleOptimisticItem = useCallback(
    async (
      itemId: string,
      contextLabel: string,
      stateGetter: () => any[],
      stateSetter: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
      const currentList = stateGetter();
      const target = currentList.find((i) => i.id === itemId);
      if (!target) return;

      // Actualización optimista inmediata (<16ms)
      stateSetter((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i;
          const next = !i.completado;
          return { ...i, completado: next, comprado: next };
        })
      );

      // Simulación de fallo en servidor con reversión garantizada
      if (simulateApiErrorOnToggle) {
        await Promise.resolve();
        const errorMsg = formatEmpathicError(500, contextLabel);
        stateSetter(currentList.map((i) => ({ ...i })));
        setToastState({
          isOpen: true,
          message: errorMsg,
          type: 'error',
        });
      }
    },
    [simulateApiErrorOnToggle]
  );

  const handleTaskToggle = useCallback(
    async (taskId: string) => {
      toggleOptimisticItem(taskId, 'Actualización de tarea', () => allTasks, setAllTasks);
      if (!simulateApiErrorOnToggle && initialTasks === undefined && typeof window !== 'undefined') {
        try {
          await fetch(`/api/tasks/${taskId}/toggle`, { method: 'PATCH', credentials: 'include' });
        } catch {}
      }
    },
    [allTasks, toggleOptimisticItem, simulateApiErrorOnToggle, initialTasks]
  );

  const handleShoppingToggle = useCallback(
    async (itemId: string) => {
      toggleOptimisticItem(itemId, 'Actualización de compra', () => allShopping, setAllShopping);
      if (!simulateApiErrorOnToggle && initialShoppingItems === undefined && typeof window !== 'undefined') {
        try {
          await fetch(`/api/shopping/${itemId}/toggle`, { method: 'PATCH', credentials: 'include' });
        } catch {}
      }
    },
    [allShopping, toggleOptimisticItem, simulateApiErrorOnToggle, initialShoppingItems]
  );

  const handleCleaningToggle = useCallback(
    async (itemId: string) => {
      toggleOptimisticItem(itemId, 'Actualización de limpieza', () => allCleaning, setAllCleaning);
      if (!simulateApiErrorOnToggle && initialCleaningItems === undefined && typeof window !== 'undefined') {
        try {
          await fetch(`/api/cleaning/${itemId}/toggle`, { method: 'PATCH', credentials: 'include' });
        } catch {}
      }
    },
    [allCleaning, toggleOptimisticItem, simulateApiErrorOnToggle, initialCleaningItems]
  );

  // Colección agregada de ítems asignados al calendario mensual
  const allScheduledItems: CalendarSchedulableItem[] = useMemo(() => {
    return [
      ...allTasks.map((t) => ({
        id: t.id,
        modulo: 'tasks' as const,
        titulo: t.titulo,
        prioridad: t.prioridad,
        completado: t.completado,
        fechaProgramada: t.fechaProgramada,
      })),
      ...allShopping.map((s) => ({
        id: s.id,
        modulo: 'shopping' as const,
        titulo: s.titulo || s.nombre || '',
        prioridad: s.prioridad,
        completado: s.completado || !!s.comprado,
        fechaProgramada: s.fechaProgramada,
      })),
      ...allCleaning.map((c) => ({
        id: c.id,
        modulo: 'cleaning' as const,
        titulo: c.titulo || c.nombre || '',
        prioridad: c.prioridad,
        completado: c.completado,
        fechaProgramada: c.fechaProgramada,
      })),
    ].filter((i) => Boolean(i.fechaProgramada));
  }, [allTasks, allShopping, allCleaning]);

  // Aplicación de asignación temporal a un ítem
  const applySchedule = useCallback((item: DragItemPayload, targetDate: string) => {
    const targetDateObj = new Date(`${targetDate}T00:00:00`);
    if (item.modulo === 'tasks') {
      setAllTasks((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, fechaProgramada: targetDateObj } : t))
      );
    } else if (item.modulo === 'shopping') {
      setAllShopping((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, fechaProgramada: targetDateObj } : s))
      );
    } else if (item.modulo === 'cleaning') {
      setAllCleaning((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, fechaProgramada: targetDateObj } : c))
      );
    }
    if (typeof window !== 'undefined') {
      fetch(`/api/${item.modulo}/${item.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fechaProgramada: targetDate }),
      }).catch(() => {});
    }
  }, []);

  // Confirmación de asignación masiva de compras (Caso VV-006)
  const handleConfirmBulkShopping = useCallback(() => {
    if (!bulkShoppingConflict) return;
    const targetDateObj = new Date(`${bulkShoppingConflict.targetDate}T00:00:00`);
    const dateStr = bulkShoppingConflict.targetDate;
    setAllShopping((prev) =>
      prev.map((item) =>
        !item.completado && !item.fechaProgramada
          ? { ...item, fechaProgramada: targetDateObj }
          : item
      )
    );
    if (typeof window !== 'undefined') {
      fetch('/api/shopping/bulk-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fechaProgramada: dateStr }),
      }).catch(() => {});
    }
    setBulkShoppingConflict(null);
  }, [bulkShoppingConflict]);

  // Menú contextual en el calendario (Caso VV-007)
  const handleItemContextMenu = useCallback(
    (e: React.MouseEvent, item: { id: string; modulo: ItemModule; titulo: string }) => {
      e.preventDefault();
      setContextMenuState({
        position: { x: e.clientX, y: e.clientY },
        item,
      });
    },
    []
  );

  // Desasignación de fecha (desvincular del calendario)
  const handleUnscheduleItem = useCallback((itemId: string, modulo: ItemModule) => {
    if (modulo === 'tasks') {
      setAllTasks((prev) =>
        prev.map((t) => (t.id === itemId ? { ...t, fechaProgramada: null } : t))
      );
    } else if (modulo === 'shopping') {
      setAllShopping((prev) =>
        prev.map((s) => (s.id === itemId ? { ...s, fechaProgramada: null } : s))
      );
    } else if (modulo === 'cleaning') {
      setAllCleaning((prev) =>
        prev.map((c) => (c.id === itemId ? { ...c, fechaProgramada: null } : c))
      );
    }
    if (typeof window !== 'undefined') {
      fetch(`/api/${modulo}/${itemId}/unschedule`, {
        method: 'PATCH',
        credentials: 'include',
      }).catch(() => {});
    }
    setContextMenuState(null);
  }, []);

  // Orquestación Drag & Drop y detección de conflictos (Decisión 4B / VV-003 / VV-006)
  const handleScheduleItem = useCallback(
    (draggedItem: SchedulableDragPayload, targetDate: string) => {
      // Manejo de Compra Masiva
      if (
        'isBulk' in draggedItem &&
        draggedItem.isBulk === true &&
        draggedItem.modulo === 'shopping'
      ) {
        const pendingCount = allShopping.filter(
          (s) => !s.completado && !s.fechaProgramada
        ).length;
        if (pendingCount === 0) return;
        setBulkShoppingConflict({ targetDate, pendingCount });
        return;
      }

      const item = draggedItem as DragItemPayload;
      let existingItemDate: Date | string | null = item.fechaProgramada || null;
      if (!existingItemDate) {
        if (item.modulo === 'tasks') {
          const found = allTasks.find((t) => t.id === item.id);
          if (found?.fechaProgramada) existingItemDate = found.fechaProgramada;
        } else if (item.modulo === 'shopping') {
          const found = allShopping.find((s) => s.id === item.id);
          if (found?.fechaProgramada) existingItemDate = found.fechaProgramada;
        } else if (item.modulo === 'cleaning') {
          const found = allCleaning.find((c) => c.id === item.id);
          if (found?.fechaProgramada) existingItemDate = found.fechaProgramada;
        }
      }

      const originDateStr = existingItemDate
        ? typeof existingItemDate === 'string'
          ? existingItemDate.slice(0, 10)
          : existingItemDate instanceof Date
          ? existingItemDate.toISOString().slice(0, 10)
          : null
        : null;

      // Conflicto: Si ya tenía fecha asignada y es distinta a la fecha destino
      if (originDateStr && originDateStr !== targetDate) {
        setReassignConflict({
          item,
          targetDate,
          originDate: originDateStr,
        });
        return;
      }

      // Asignación directa sin conflicto
      applySchedule(item, targetDate);
    },
    [allShopping, allTasks, allCleaning, applySchedule]
  );

  return {
    // Sesión y Red
    isAuthenticated,
    currentUser,
    isOffline,
    handleLoginSuccess,
    handleLogout,

    // Colecciones procesadas
    processedTasks,
    processedShopping,
    processedCleaning,
    allScheduledItems,

    // Acciones de Tareas
    handleTaskCreated: (newTask: TaskItem) => setAllTasks((prev) => [newTask, ...prev]),
    handleTaskUpdated: (updated: TaskItem) => {
      setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      syncItemUpdateToApi('tasks', updated, initialTasks !== undefined);
    },
    handleTaskDeleted: (id: string) => {
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      syncItemDeleteToApi('tasks', id, initialTasks !== undefined);
    },
    handleTaskToggle,

    // Acciones de Compras
    handleShoppingCreated: (newItem: ShoppingItem) => setAllShopping((prev) => [newItem, ...prev]),
    handleShoppingUpdated: (updated: ShoppingItem) => {
      setAllShopping((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      syncItemUpdateToApi('shopping', updated, initialShoppingItems !== undefined);
    },
    handleShoppingDeleted: (id: string) => {
      setAllShopping((prev) => prev.filter((i) => i.id !== id));
      syncItemDeleteToApi('shopping', id, initialShoppingItems !== undefined);
    },
    handleShoppingToggle,

    // Acciones de Limpiezas
    handleCleaningCreated: (newItem: CleaningItem) => setAllCleaning((prev) => [newItem, ...prev]),
    handleCleaningUpdated: (updated: CleaningItem) => {
      setAllCleaning((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      syncItemUpdateToApi('cleaning', updated, initialCleaningItems !== undefined);
    },
    handleCleaningDeleted: (id: string) => {
      setAllCleaning((prev) => prev.filter((i) => i.id !== id));
      syncItemDeleteToApi('cleaning', id, initialCleaningItems !== undefined);
    },
    handleCleaningToggle,

    // Filtrado y Ordenación
    criteria,
    isFiltered,
    activeFilterCount,
    isFilterModalOpen,
    openFilterModal: () => setIsFilterModalOpen(true),
    closeFilterModal: () => setIsFilterModalOpen(false),
    setCriteria,
    resetFilters,
    isSortMenuOpen,
    sortConfig,
    openSortMenu: () => setIsSortMenuOpen(true),
    closeSortMenu: () => setIsSortMenuOpen(false),
    setSortConfig,

    // Drag & Drop y Calendario
    handleScheduleItem,
    applySchedule,
    handleUnscheduleItem,

    // Conflictos y Menús
    reassignConflict,
    setReassignConflict,
    bulkShoppingConflict,
    setBulkShoppingConflict,
    handleConfirmBulkShopping,
    contextMenuState,
    handleItemContextMenu,
    closeContextMenu: () => setContextMenuState(null),

    // Notificaciones Toast
    toastState,
    closeToast: () => setToastState(null),
  };
}
