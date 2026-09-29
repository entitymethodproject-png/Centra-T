import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItemFilters } from './useItemFilters';
import { FilterableItem } from '../utils/filterEngine';
import { FilterCriteria, DEFAULT_FILTER_CRITERIA } from '../types/filter.types';

describe('Hook Reactivo · useItemFilters (Evaluación en Memoria y Reactividad en Caliente)', () => {
  interface MockTask extends FilterableItem {
    id: string;
    nombre: string;
    prioridad: 'alta' | 'media' | 'baja';
    completado: boolean;
    fechaProgramada?: string | null;
  }

  const initialItems: MockTask[] = [
    {
      id: 'task-1',
      nombre: 'Pagar facturas',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: '2026-10-15',
    },
    {
      id: 'task-2',
      nombre: 'Comprar frutas',
      prioridad: 'media',
      completado: true,
      fechaProgramada: '2026-10-16',
    },
    {
      id: 'task-3',
      nombre: 'Limpiar cristales',
      prioridad: 'baja',
      completado: false,
      fechaProgramada: '2026-10-20',
    },
    {
      id: 'task-4',
      nombre: 'Revisar caldera',
      prioridad: 'alta',
      completado: true,
      fechaProgramada: null,
    },
  ];

  it('debería inicializarse con criterios neutros, isFiltered en false y activeFilterCount en 0', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    expect(result.current.criteria).toEqual(DEFAULT_FILTER_CRITERIA);
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.filteredItems).toEqual(initialItems);
    expect(result.current.filteredItems).toHaveLength(4);
  });

  it('debería inicializarse con initialCriteria si se proporciona', () => {
    const customCriteria: FilterCriteria = {
      prioridad: 'alta',
      estado: 'SOLO_PENDIENTES',
      fecha: {
        activo: false,
        tipo: 'PUNTUAL',
        fechaInicio: null,
        fechaFin: null,
      },
    };

    const { result } = renderHook(() => useItemFilters(initialItems, customCriteria));

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(2);
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1']);
  });

  it('debería actualizar prioridad con setPriority y recalcular filteredItems', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    act(() => {
      result.current.setPriority('alta');
    });

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.criteria.prioridad).toBe('alta');
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1', 'task-4']);
  });

  it('debería actualizar estado con setStatus y recalcular filteredItems', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    act(() => {
      result.current.setStatus('SOLO_PENDIENTES');
    });

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.criteria.estado).toBe('SOLO_PENDIENTES');
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1', 'task-3']);

    act(() => {
      result.current.setStatus('SOLO_COMPLETADAS');
    });

    expect(result.current.criteria.estado).toBe('SOLO_COMPLETADAS');
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-2', 'task-4']);
  });

  it('debería actualizar fecha con setDateCriteria y recalcular filteredItems', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    act(() => {
      result.current.setDateCriteria({
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-15',
        fechaFin: null,
      });
    });

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1']);
  });

  it('debería actualizar todos los criterios de una vez con setCriteria', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    const newCriteria: FilterCriteria = {
      prioridad: 'media',
      estado: 'SOLO_COMPLETADAS',
      fecha: {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-16',
        fechaFin: null,
      },
    };

    act(() => {
      result.current.setCriteria(newCriteria);
    });

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(3);
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-2']);
  });

  it('debería reevaluar en caliente ante la mutación de una propiedad en un item de la colección', () => {
    let itemsState = [...initialItems];

    const { result, rerender } = renderHook(() =>
      useItemFilters(itemsState, {
        ...DEFAULT_FILTER_CRITERIA,
        estado: 'SOLO_PENDIENTES',
      })
    );

    // Inicialmente pendientes: task-1 y task-3
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1', 'task-3']);

    // Mutamos task-1 para marcarla completada (como ocurre con mutación optimista de checkbox)
    itemsState = itemsState.map((task) =>
      task.id === 'task-1' ? { ...task, completado: true } : task
    );

    // Re-renderizamos el hook con el nuevo array de items
    rerender();

    // Ahora task-1 debe desaparecer inmediatamente de filteredItems en caliente
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-3']);
  });

  it('debería reevaluar en caliente al añadir un nuevo item a la colección', () => {
    let itemsState = [...initialItems];

    const { result, rerender } = renderHook(() =>
      useItemFilters(itemsState, {
        ...DEFAULT_FILTER_CRITERIA,
        prioridad: 'alta',
      })
    );

    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1', 'task-4']);

    // Añadir una nueva tarea con prioridad alta
    const newTask: MockTask = {
      id: 'task-5',
      nombre: 'Urgente cerrajero',
      prioridad: 'alta',
      completado: false,
    };
    itemsState = [...itemsState, newTask];

    rerender();

    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1', 'task-4', 'task-5']);
  });

  it('debería restaurar DEFAULT_FILTER_CRITERIA y restablecer todos los items al invocar resetFilters()', () => {
    const { result } = renderHook(() => useItemFilters(initialItems));

    act(() => {
      result.current.setPriority('alta');
      result.current.setStatus('SOLO_PENDIENTES');
    });

    expect(result.current.isFiltered).toBe(true);
    expect(result.current.activeFilterCount).toBe(2);
    expect(result.current.filteredItems.map((i) => i.id)).toEqual(['task-1']);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.criteria).toEqual(DEFAULT_FILTER_CRITERIA);
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.filteredItems).toEqual(initialItems);
  });

  it('debería manejar de forma segura entradas nulas o undefined de items', () => {
    // @ts-expect-error probando entrada nula defensiva
    const { result: resultNull } = renderHook(() => useItemFilters(null));
    expect(resultNull.current.filteredItems).toEqual([]);

    // @ts-expect-error probando entrada undefined defensiva
    const { result: resultUndef } = renderHook(() => useItemFilters(undefined));
    expect(resultUndef.current.filteredItems).toEqual([]);
  });
});
