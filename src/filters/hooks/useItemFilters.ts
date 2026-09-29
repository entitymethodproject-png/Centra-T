import { useState, useMemo, useCallback } from 'react';
import {
  FilterCriteria,
  FilterPriority,
  FilterDateCriteria,
  FilterStatus,
  DEFAULT_FILTER_CRITERIA,
} from '../types/filter.types';
import { FilterableItem, applyFilters } from '../utils/filterEngine';

export interface UseItemFiltersResult<T extends FilterableItem> {
  criteria: FilterCriteria;
  filteredItems: T[];
  isFiltered: boolean;
  activeFilterCount: number;
  setCriteria: (criteria: FilterCriteria) => void;
  setPriority: (priority: FilterPriority) => void;
  setDateCriteria: (dateCriteria: FilterDateCriteria) => void;
  setStatus: (status: FilterStatus) => void;
  resetFilters: () => void;
}

/**
 * Hook reactivo de cliente que encapsula los criterios de filtrado y evalúa
 * en caliente las colecciones de ítems mediante el motor puro applyFilters con useMemo.
 */
export function useItemFilters<T extends FilterableItem>(
  items: T[],
  initialCriteria?: FilterCriteria
): UseItemFiltersResult<T> {
  const [criteria, setCriteriaState] = useState<FilterCriteria>(
    initialCriteria || DEFAULT_FILTER_CRITERIA
  );

  const setCriteria = useCallback((newCriteria: FilterCriteria) => {
    setCriteriaState(newCriteria);
  }, []);

  const setPriority = useCallback((prioridad: FilterPriority) => {
    setCriteriaState((prev) => ({ ...prev, prioridad }));
  }, []);

  const setDateCriteria = useCallback((fecha: FilterDateCriteria) => {
    setCriteriaState((prev) => ({ ...prev, fecha }));
  }, []);

  const setStatus = useCallback((estado: FilterStatus) => {
    setCriteriaState((prev) => ({ ...prev, estado }));
  }, []);

  const resetFilters = useCallback(() => {
    setCriteriaState(DEFAULT_FILTER_CRITERIA);
  }, []);

  const isFiltered = useMemo(() => {
    return (
      criteria.prioridad !== 'TODAS' ||
      criteria.fecha.activo ||
      criteria.estado !== 'TODOS'
    );
  }, [criteria]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (criteria.prioridad !== 'TODAS') count += 1;
    if (criteria.fecha.activo) count += 1;
    if (criteria.estado !== 'TODOS') count += 1;
    return count;
  }, [criteria]);

  const filteredItems = useMemo(() => {
    return applyFilters(items || [], criteria);
  }, [items, criteria]);

  return {
    criteria,
    filteredItems,
    isFiltered,
    activeFilterCount,
    setCriteria,
    setPriority,
    setDateCriteria,
    setStatus,
    resetFilters,
  };
}
