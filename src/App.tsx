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
import { useItemFilters } from './filters/hooks/useItemFilters';
import { sortItems } from './filters/utils/sortEngine';
import { applyFilters } from './filters/utils/filterEngine';
import { SortConfiguration, DEFAULT_SORT_CONFIG } from './filters/types/sort.types';
import { TaskItem } from './tasks/entities/task-item.entity';
import { ShoppingItem } from './shopping/entities/shopping-item.entity';
import { CleaningItem } from './cleaning/entities/cleaning-item.entity';

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
    </>
  );
};
