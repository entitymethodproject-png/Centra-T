import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkspaceController } from './useWorkspaceController';
import { TaskItem, ShoppingItem, CleaningItem } from '../../items/entities/item.entity';

describe('useWorkspaceController (Workspace State & Business Orchestration Hook)', () => {
  const initialTask: TaskItem = {
    id: 't-1',
    userId: 'u-1',
    modulo: 'tasks',
    titulo: 'Organizar facturas',
    nombre: 'Organizar facturas',
    descripcion: 'Detalle de facturación',
    prioridad: 'alta',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const initialShopping: ShoppingItem = {
    id: 's-1',
    userId: 'u-1',
    modulo: 'shopping',
    titulo: 'Leche entera',
    nombre: 'Leche entera',
    descripcion: '',
    prioridad: 'media',
    completado: false,
    comprado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const initialCleaning: CleaningItem = {
    id: 'c-1',
    userId: 'u-1',
    modulo: 'cleaning',
    titulo: 'Limpieza cocina',
    nombre: 'Limpieza cocina',
    descripcion: '',
    prioridad: 'baja',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe inicializarse con el estado no autenticado por defecto y permitir login/logout', () => {
    const { result } = renderHook(() => useWorkspaceController({ initialAuthenticated: false }));

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.handleLoginSuccess();
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.handleLogout();
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  const initialTasksList = [initialTask];
  const initialShoppingList = [initialShopping];
  const initialCleaningList = [initialCleaning];

  it('debe procesar colecciones iniciales y conmutar optimista el estado de tareas', async () => {
    const { result } = renderHook(() =>
      useWorkspaceController({
        initialAuthenticated: true,
        initialTasks: initialTasksList,
        initialShoppingItems: initialShoppingList,
        initialCleaningItems: initialCleaningList,
      })
    );

    expect(result.current.processedTasks).toHaveLength(1);
    expect(result.current.processedTasks[0].completado).toBe(false);

    // Toggle de tarea
    await act(async () => {
      result.current.handleTaskToggle('t-1');
    });

    expect(result.current.processedTasks[0].completado).toBe(true);
  });

  it('debe revertir optimísticamente y activar Toast cuando simulateApiErrorOnToggle es true', async () => {
    const tasksForError = [{ ...initialTask }];
    const { result } = renderHook(() =>
      useWorkspaceController({
        initialAuthenticated: true,
        initialTasks: tasksForError,
        simulateApiErrorOnToggle: true,
      })
    );

    await act(async () => {
      await result.current.handleTaskToggle('t-1');
    });

    // Revertido a false
    expect(result.current.processedTasks[0].completado).toBe(false);
    expect(result.current.toastState?.isOpen).toBe(true);
    expect(result.current.toastState?.message.what).toContain('Actualización de tarea');
  });

  it('debe detectar conflicto al reasignar un ítem con fecha previa distinta (Decisión 4B)', () => {
    const taskWithDate: TaskItem = {
      ...initialTask,
      fechaProgramada: new Date('2026-10-15T00:00:00'),
    };
    const taskList = [taskWithDate];

    const { result } = renderHook(() =>
      useWorkspaceController({
        initialAuthenticated: true,
        initialTasks: taskList,
      })
    );

    act(() => {
      result.current.handleScheduleItem(
        {
          id: 't-1',
          modulo: 'tasks',
          titulo: 'Organizar facturas',
          prioridad: 'alta',
          completado: false,
          fechaProgramada: '2026-10-15',
        },
        '2026-10-20'
      );
    });

    expect(result.current.reassignConflict).not.toBeNull();
    expect(result.current.reassignConflict?.originDate).toBe('2026-10-15');
    expect(result.current.reassignConflict?.targetDate).toBe('2026-10-20');
  });

  it('debe desasignar un ítem del calendario mediante handleUnscheduleItem', () => {
    const taskWithDate: TaskItem = {
      ...initialTask,
      fechaProgramada: new Date('2026-10-15T00:00:00'),
    };
    const taskList = [taskWithDate];

    const { result } = renderHook(() =>
      useWorkspaceController({
        initialAuthenticated: true,
        initialTasks: taskList,
      })
    );

    expect(result.current.allScheduledItems).toHaveLength(1);

    act(() => {
      result.current.handleUnscheduleItem('t-1', 'tasks');
    });

    expect(result.current.allScheduledItems).toHaveLength(0);
  });
});
