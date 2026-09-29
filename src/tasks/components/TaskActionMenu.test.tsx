import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskActionMenu } from './TaskActionMenu';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

describe('TaskActionMenu Component (Menú Contextual y Modal Preventivo)', () => {
  const baseTask: TaskItem = {
    id: 'task-action-01',
    userId: 'usr-demo-elena-001',
    modulo: 'tasks',
    titulo: 'Pintar rodapiés del salón',
    descripcion: 'Color blanco satinado',
    prioridad: 'media',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar accesiblemente el disparador (...) con aria-haspopup="menu"', () => {
    render(<TaskActionMenu task={baseTask} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('debe desplegar el menú contextual al hacer clic en el disparador', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /opciones de tarea/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /descripción/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /cambiar prioridad/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /eliminar tarea/i })).toBeInTheDocument();
  });

  it('debe abrir el modal de descripción y mostrar la descripción actual para su lectura', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /descripción de la tarea/i })).toBeInTheDocument();
    expect(screen.getByText(/pintar rodapiés del salón/i)).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: /descripción de la tarea/i });
    expect(textarea).toHaveValue('Color blanco satinado');
  });

  it('debe permitir editar la descripción y persistir los cambios al pulsar Guardar', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const mockService = {
      updateTask: vi.fn().mockResolvedValue({
        ...baseTask,
        descripcion: 'Color blanco satinado dos capas',
      }),
    } as unknown as TasksService;

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const textarea = screen.getByRole('textbox', { name: /descripción de la tarea/i });
    await user.clear(textarea);
    await user.type(textarea, 'Color blanco satinado dos capas');

    const saveBtn = screen.getByTestId('save-description-btn');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockService.updateTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01',
        { descripcion: 'Color blanco satinado dos capas' }
      );
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: 'Color blanco satinado dos capas' })
      );
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe permitir borrar la descripción existente al pulsar Borrar descripción', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const mockService = {
      updateTask: vi.fn().mockResolvedValue({
        ...baseTask,
        descripcion: '',
      }),
    } as unknown as TasksService;

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const clearBtn = screen.getByTestId('clear-description-btn');
    await user.click(clearBtn);

    await waitFor(() => {
      expect(mockService.updateTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01',
        { descripcion: '' }
      );
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: '' })
      );
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe cancelar la edición de descripción sin guardar al pulsar Cancelar o presionar Escape', async () => {
    const user = userEvent.setup();
    const mockService = {
      updateTask: vi.fn(),
    } as unknown as TasksService;

    render(<TaskActionMenu task={baseTask} tasksService={mockService} />);

    // Cancelar con botón Cancelar
    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.updateTask).not.toHaveBeenCalled();

    // Cancelar con tecla Escape
    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.updateTask).not.toHaveBeenCalled();
  });

  it('debe cerrar el menú contextual al presionar la tecla Escape', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cerrar el menú al hacer clic fuera del mismo', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside-area">Área Exterior</div>
        <TaskActionMenu task={baseTask} />
      </div>
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByTestId('outside-area'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cambiar la prioridad de la tarea e invocar onTaskUpdated', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      updateTask: vi.fn().mockResolvedValue({
        ...baseTask,
        prioridad: 'alta',
      }),
    } as unknown as TasksService;

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    // Abrir menú
    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    // Abrir submenú de prioridad
    await user.click(screen.getByRole('menuitem', { name: /cambiar prioridad/i }));
    // Seleccionar 'Alta'
    await user.click(screen.getByRole('menuitem', { name: /alta/i }));

    await waitFor(() => {
      expect(mockService.updateTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01',
        { prioridad: 'alta' }
      );
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ prioridad: 'alta' })
      );
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('intercepción obligatoria: pulsar Eliminar abre el modal preventivo con foco en Cancelar', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿eliminar tarea\?/i })).toBeInTheDocument();
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();

    // Foco en Cancelar
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await waitFor(() => {
      expect(cancelBtn).toHaveFocus();
    });
  });

  it('CANCELACIÓN INOFENSIVA: pulsar Cancelar cierra el modal preventivo sin emitir DELETE ni mutar estado', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn(),
    } as unknown as TasksService;
    const handleDeleted = vi.fn();

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        onTaskDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.deleteTask).not.toHaveBeenCalled();
    expect(handleDeleted).not.toHaveBeenCalled();
  });

  it('cancelar mediante tecla Escape en el modal preventivo cierra el diálogo sin mutaciones', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn(),
    } as unknown as TasksService;

    render(<TaskActionMenu task={baseTask} tasksService={mockService} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.deleteTask).not.toHaveBeenCalled();
  });

  it('ELIMINACIÓN EXITOSA: confirmar eliminación ejecuta deleteTask e invoca onTaskDeleted', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn().mockResolvedValue(undefined),
    } as unknown as TasksService;
    const handleDeleted = vi.fn();

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockService.deleteTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01'
      );
      expect(handleDeleted).toHaveBeenCalledWith('task-action-01');
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
