import React, { useState, useEffect, useMemo } from 'react';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';
import { HubContainer } from './hub/components/HubContainer';
import { TasksAccordion } from './hub/components/TasksAccordion';
import { ShoppingAccordion } from './hub/components/ShoppingAccordion';
import { CleaningAccordion } from './hub/components/CleaningAccordion';
import { FilterModal } from './filters/components/FilterModal';
import { SortMenu } from './filters/components/SortMenu';
import { MonthlyCalendarGrid } from './workspace/components/MonthlyCalendarGrid';
import { useItemFilters } from './filters/hooks/useItemFilters';
import { sortItems } from './filters/utils/sortEngine';
import { applyFilters } from './filters/utils/filterEngine';
import { SortConfiguration, DEFAULT_SORT_CONFIG } from './filters/types/sort.types';
import { TaskItem } from './tasks/entities/task-item.entity';
import { ShoppingItem } from './shopping/entities/shopping-item.entity';
import { CleaningItem } from './cleaning/entities/cleaning-item.entity';
import {
  CalendarSchedulableItem,
  DragItemPayload,
  SchedulableDragPayload,
} from './calendar-sync/types/drag-drop.types';
import { ReassignmentConfirmModal } from './calendar-sync/components/ReassignmentConfirmModal';
import { BulkShoppingConfirmModal } from './calendar-sync/components/BulkShoppingConfirmModal';

export interface AppProps {
  initialAuthenticated?: boolean;
  initialTasks?: TaskItem[];
  initialShoppingItems?: ShoppingItem[];
  initialCleaningItems?: CleaningItem[];
}

export const App: React.FC<AppProps> = ({
  initialAuthenticated = false,
  initialTasks,
  initialShoppingItems,
  initialCleaningItems,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initialAuthenticated) return true;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('centrat_auth') === 'true';
    }
    return false;
  });

  // Colecciones de ítems reactivas en cliente
  const [allTasks, setAllTasks] = useState<TaskItem[]>(initialTasks || []);
  const [allShopping, setAllShopping] = useState<ShoppingItem[]>(initialShoppingItems || []);
  const [allCleaning, setAllCleaning] = useState<CleaningItem[]>(initialCleaningItems || []);

  // Diálogos de filtrado y menú de reordenación
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfiguration>(DEFAULT_SORT_CONFIG);

  // Buffer de conflicto para reasignación de fecha (Decisión 4B / VV-003)
  const [reassignConflict, setReassignConflict] = useState<{
    item: DragItemPayload;
    targetDate: string;
    originDate: string;
  } | null>(null);

  // Buffer de conflicto para asignación masiva de compras (Caso Forense VV-006)
  const [bulkShoppingConflict, setBulkShoppingConflict] = useState<{
    targetDate: string;
    pendingCount: number;
  } | null>(null);

  useEffect(() => {
    if (initialTasks !== undefined) {
      setAllTasks(initialTasks);
    }
  }, [initialTasks]);

  useEffect(() => {
    if (initialShoppingItems !== undefined) {
      setAllShopping(initialShoppingItems);
    }
  }, [initialShoppingItems]);

  useEffect(() => {
    if (initialCleaningItems !== undefined) {
      setAllCleaning(initialCleaningItems);
    }
  }, [initialCleaningItems]);

  // Hook reactivo de filtrado en cliente
  const {
    criteria,
    filteredItems: filteredTasks,
    isFiltered,
    activeFilterCount,
    setCriteria,
    resetFilters,
  } = useItemFilters(allTasks);

  // Procesamiento combinado de filtros y ordenación en caliente
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

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('centrat_auth', 'true');
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('centrat_auth');
    }
    setIsAuthenticated(false);
  };

  const handleTaskToggle = (taskId: string) => {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completado: !t.completado } : t))
    );
  };

  const handleShoppingToggle = (itemId: string) => {
    setAllShopping((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado: !i.completado } : i))
    );
  };

  const handleCleaningToggle = (itemId: string) => {
    setAllCleaning((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado: !i.completado } : i))
    );
  };

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

  const applySchedule = (item: DragItemPayload, targetDate: string) => {
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
  };

  const handleConfirmBulkShopping = () => {
    if (!bulkShoppingConflict) return;
    const targetDateObj = new Date(`${bulkShoppingConflict.targetDate}T00:00:00`);
    setAllShopping((prev) =>
      prev.map((item) =>
        !item.completado && !item.fechaProgramada
          ? { ...item, fechaProgramada: targetDateObj }
          : item
      )
    );
    setBulkShoppingConflict(null);
  };

  const handleScheduleItem = (draggedItem: SchedulableDragPayload, targetDate: string) => {
    // Manejo de Compra Masiva (Caso VV-006)
    if ('isBulk' in draggedItem && draggedItem.isBulk === true && draggedItem.modulo === 'shopping') {
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

    // Si ya tenía fecha asignada y es distinta a la fecha de destino -> CONFLICTO (Decisión 4B / VV-003)
    if (originDateStr && originDateStr !== targetDate) {
      setReassignConflict({
        item,
        targetDate,
        originDate: originDateStr,
      });
      return;
    }

    // Si no tenía fecha previa o es la misma, asignación directa sin modal
    applySchedule(item, targetDate);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToWorkspace={handleLoginSuccess}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <>
      <WorkspaceLayout
        navbarSlot={
          <TopNavbar
            user={{ name: 'Usuario Centra-T' }}
            onLogout={handleLogout}
          />
        }
        hubSlot={
          <HubContainer
            onFilterClick={() => setIsFilterModalOpen(true)}
            onSortClick={() => setIsSortMenuOpen(true)}
            isFilterActive={isFiltered}
            activeFilterCount={activeFilterCount}
            onClearFilters={resetFilters}
          >
            <TasksAccordion
              tasks={processedTasks}
              onTaskCreated={(newTask) => setAllTasks((prev) => [newTask, ...prev])}
              onTaskUpdated={(updated) =>
                setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }
              onTaskDeleted={(id) => setAllTasks((prev) => prev.filter((t) => t.id !== id))}
              onTaskToggle={handleTaskToggle}
            />
            <ShoppingAccordion
              items={processedShopping}
              onItemCreated={(newItem) => setAllShopping((prev) => [newItem, ...prev])}
              onItemUpdated={(updated) =>
                setAllShopping((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
              }
              onItemDeleted={(id) => setAllShopping((prev) => prev.filter((i) => i.id !== id))}
              onItemToggle={handleShoppingToggle}
            />
            <CleaningAccordion
              items={processedCleaning}
              onItemCreated={(newItem) => setAllCleaning((prev) => [newItem, ...prev])}
              onItemUpdated={(updated) =>
                setAllCleaning((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
              }
              onItemDeleted={(id) => setAllCleaning((prev) => prev.filter((i) => i.id !== id))}
              onItemToggle={handleCleaningToggle}
            />
          </HubContainer>
        }
        workbenchSlot={
          <MonthlyCalendarGrid
            scheduledItems={allScheduledItems}
            onItemDrop={handleScheduleItem}
          />
        }
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        initialCriteria={criteria}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newCriteria) => {
          setCriteria(newCriteria);
          setIsFilterModalOpen(false);
        }}
        onReset={resetFilters}
      />

      <SortMenu
        isOpen={isSortMenuOpen}
        activeConfig={sortConfig}
        onClose={() => setIsSortMenuOpen(false)}
        onSelectOption={(newConfig) => {
          setSortConfig(newConfig);
          setIsSortMenuOpen(false);
        }}
      />

      <ReassignmentConfirmModal
        isOpen={Boolean(reassignConflict)}
        itemTitle={reassignConflict?.item.titulo || ''}
        originDate={reassignConflict?.originDate || ''}
        targetDate={reassignConflict?.targetDate || ''}
        onConfirm={() => {
          if (reassignConflict) {
            applySchedule(reassignConflict.item, reassignConflict.targetDate);
            setReassignConflict(null);
          }
        }}
        onCancel={() => setReassignConflict(null)}
      />

      <BulkShoppingConfirmModal
        isOpen={Boolean(bulkShoppingConflict)}
        pendingCount={bulkShoppingConflict?.pendingCount || 0}
        targetDate={bulkShoppingConflict?.targetDate || ''}
        onConfirm={handleConfirmBulkShopping}
        onCancel={() => setBulkShoppingConflict(null)}
      />
    </>
  );
};
