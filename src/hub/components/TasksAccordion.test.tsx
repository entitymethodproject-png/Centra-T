import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksAccordion } from './TasksAccordion';
import { TaskItem } from '../../tasks/entities/task-item.entity';

describe('TasksAccordion Component (EV-LIST-01 a EV-LIST-05)', () => {
  const mockTasks: TaskItem[] = [
    {
      id: 'task-1',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Revisar caldera',
      descripcion: 'Presión a 1.5 bar',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-2',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Comprar bombilla LED',
      descripcion: '',
      prioridad: 'baja',
      completado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar la cabecera con contador dinámico Tareas (N) y botón de nueva tarea', () => {
    const handleNew = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onCreateTaskClick={handleNew} />);

    expect(screen.getByRole('button', { name: /tareas \(2\)/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: /crear nueva tarea/i })).toBeInTheDocument();
  });

  it('debe colapsar y expandir el contenido al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onToggleExpand={handleExpand} />);

    const header = screen.getByRole('button', { name: /tareas \(2\)/i });
    expect(screen.getByTestId('tasks-populated-list')).toBeInTheDocument();

    // Colapsar
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('tasks-populated-list')).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenCalledWith(false);

    // Expandir
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('tasks-populated-list')).toBeInTheDocument();
  });

  it('EV-LIST-02: debe renderizar el Skeleton Screen de 3 líneas cuando isLoading=true sin bloquear la UI', () => {
    render(<TasksAccordion isLoading={true} />);

    expect(screen.getByTestId('tasks-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('EV-LIST-03: debe renderizar Empty State sobrio cuando no hay tareas y disparar CTA', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<TasksAccordion tasks={[]} onCreateTaskClick={handleCreate} />);

    expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no tienes tareas pendientes/i)).toBeInTheDocument();

    const ctaButton = screen.getByRole('button', { name: /\+ crear tarea/i });
    await user.click(ctaButton);

    expect(handleCreate).toHaveBeenCalled();
  });

  it('EV-LIST-05: debe renderizar banner de error y permitir reintento', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<TasksAccordion error="Error de conexión" onRetry={handleRetry} />);

    expect(screen.getByTestId('tasks-error-state')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/error de conexión/i);

    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    await user.click(retryBtn);

    expect(handleRetry).toHaveBeenCalled();
  });

  it('EV-LIST-01: debe renderizar lista de tareas con dot sutil de prioridad y texto tachado en completadas', () => {
    render(<TasksAccordion tasks={mockTasks} />);

    expect(screen.getByText('Revisar caldera')).toBeInTheDocument();
    const priorityDots = screen.getAllByTestId('task-card-priority');
    expect(priorityDots[0]).toHaveClass(/priorityDot_alta/);

    const completedTaskTitle = screen.getByText('Comprar bombilla LED');
    expect(completedTaskTitle).toBeInTheDocument();
    expect(priorityDots[1]).toHaveClass(/priorityDot_baja/);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('debe invocar onTaskToggle al pulsar el checkbox de una tarea', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onTaskToggle={handleToggle} />);

    const checkbox = screen.getByRole('checkbox', { name: /completar tarea revisar caldera/i });
    await user.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('task-1');
  });

  it('deshabilita el botón de crear (+) cuando isOffline es true', async () => {
    const user = userEvent.setup();
    render(<TasksAccordion tasks={mockTasks} isOffline={true} />);

    const newBtn = screen.getByRole('button', { name: /crear nueva tarea/i });
    expect(newBtn).toBeDisabled();
    expect(newBtn).toHaveAttribute('aria-disabled', 'true');
    expect(newBtn).toHaveClass(/newButtonDisabled/);

    await user.click(newBtn);
    expect(screen.queryByTestId('task-creation-wizard')).not.toBeInTheDocument();
  });
});
