import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

describe('TaskCard Component (Mutación Optimista & Caso Forense VV-005)', () => {
  const baseTask: TaskItem = {
    id: 'task-opt-01',
    userId: 'usr-demo-elena-001',
    modulo: 'tasks',
    titulo: 'Revisar caldera de gasoil',
    descripcion: 'Verificar presión en 1.5 bar',
    prioridad: 'alta',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar la tarjeta con título, badge de prioridad y checkbox con label accesible', () => {
    render(<TaskCard task={baseTask} />);

    expect(screen.getByText('Revisar caldera de gasoil')).toBeInTheDocument();
    expect(screen.getByText('ALTA')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /completar tarea revisar caldera de gasoil/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('debe conmutar de forma optimista el checkbox y tachar el texto inmediatamente al hacer clic (<50ms)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    render(<TaskCard task={baseTask} onTaskUpdated={handleUpdated} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /completar tarea revisar caldera de gasoil/i,
    });
    const title = screen.getByTestId('task-card-title');

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);

    // Clic inmediato
    await user.click(checkbox);

    // Verificación inmediata (< 50ms) en la UI
    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);
    expect(handleUpdated).toHaveBeenCalled();
  });

  it('debe desmarcar el checkbox y retirar el tachado en una tarea completada', async () => {
    const user = userEvent.setup();
    const completedTask: TaskItem = { ...baseTask, completado: true };

    render(<TaskCard task={completedTask} />);

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('task-card-title');

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);
  });

  it('debe sincronizar silenciosamente con tasksService y llamar a onTaskUpdated cuando la llamada es exitosa (200 OK)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      toggleTaskStatus: vi.fn().mockResolvedValue({
        ...baseTask,
        completado: true,
      }),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockService.toggleTaskStatus).toHaveBeenCalledWith('usr-demo-elena-001', 'task-opt-01');
      expect(handleUpdated).toHaveBeenCalled();
    });

    // Ningún toast de error desplegado
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('CASO FORENSE VV-005: ante error 500 del servidor, revierte inmediatamente el checkbox, retira el tachado visual y muestra el Toast empático', async () => {
    const user = userEvent.setup();
    const handleRollback = vi.fn();

    const failingService = {
      toggleTaskStatus: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={failingService}
        userId="usr-demo-elena-001"
        onRollback={handleRollback}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('task-card-title');

    // 1. Clic inicial optimista
    await user.click(checkbox);

    // 2. Al fallar el servicio, debe revertir automáticamente
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(title).not.toHaveClass(/titleCompleted/);
    });

    // 3. Despliegue del Toast empático
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/no se pudo actualizar el estado de la tarea\. se ha revertido el cambio/i);
    expect(handleRollback).toHaveBeenCalled();
  });

  it('debe permitir descartar el Toast empático al pulsar el botón de cierre [✕]', async () => {
    const user = userEvent.setup();
    const failingService = {
      toggleTaskStatus: vi.fn().mockRejectedValue(new Error('500 Server Down')),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={failingService}
        userId="usr-demo-elena-001"
      />
    );

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole('button', { name: /cerrar notificación de error/i });
    await user.click(dismissBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('debe invocar onToggleOptimistic inmediatamente al pulsar el checkbox', async () => {
    const user = userEvent.setup();
    const handleOptimistic = vi.fn();

    render(
      <TaskCard
        task={baseTask}
        onToggleOptimistic={handleOptimistic}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(handleOptimistic).toHaveBeenCalledWith('task-opt-01', true);
  });
});
