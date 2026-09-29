import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCreationWizard } from './TaskCreationWizard';
import { TasksService } from '../services/tasks.service';
import { InMemoryTaskRepository } from '../repositories/task.repository';

describe('TaskCreationWizard Component (Wizard 3 Pasos & Caso Forense VV-004)', () => {
  let mockRepository: InMemoryTaskRepository;
  let tasksService: TasksService;
  const mockUserId = 'usr-demo-test-01';

  beforeEach(() => {
    mockRepository = new InMemoryTaskRepository();
    tasksService = new TasksService(mockRepository);
  });

  it('debe renderizar el modal en el Paso 1 con autofocus y contador de caracteres (0/120)', () => {
    const handleClose = vi.fn();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: título/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debe bloquear el avance a Paso 2 y mostrar error si el título está vacío o solo contiene espacios', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el nombre no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();

    // Probar con espacios en blanco
    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    await user.type(titleInput, '    ');
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el nombre no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
  });

  it('debe respetar el límite de 120 caracteres en el título (Decisión 2B)', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    const longTitle = 'A'.repeat(150);
    await user.type(titleInput, longTitle);

    expect(titleInput).toHaveValue('A'.repeat(120));
    expect(screen.getByText('120/120')).toBeInTheDocument();
  });

  it('debe navegar al Paso 2 y permitir retroceder al Paso 1 conservando el buffer con el botón Atrás', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    await user.type(titleInput, 'Comprar filtro de agua');

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    // En Paso 2
    expect(screen.getByText(/paso 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: descripción/i })).toBeInTheDocument();

    // Retroceder a Paso 1
    const backButton = screen.getByRole('button', { name: /atrás/i });
    await user.click(backButton);

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /título o nombre de la tarea/i })).toHaveValue(
      'Comprar filtro de agua'
    );
  });

  it('debe permitir añadir descripción en Paso 2 y respetar el límite de 1000 caracteres (Decisión 2B)', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Revisar radiadores'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const descTextarea = screen.getByRole('textbox', { name: /descripción detallada/i });
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    const descText = 'Purgar el aire de los radiadores de las habitaciones.';
    await user.type(descTextarea, descText);

    expect(descTextarea).toHaveValue(descText);
    expect(screen.getByText(`${descText.length}/1000`)).toBeInTheDocument();
  });

  it('debe avanzar al Paso 3, permitir seleccionar la prioridad y mantener "media" por defecto', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Pintar valla'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // En Paso 3
    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: prioridad/i })).toBeInTheDocument();

    const mediaRadio = screen.getByRole('radio', { name: /media/i });
    const altaRadio = screen.getByRole('radio', { name: /alta/i });

    expect(mediaRadio).toHaveAttribute('aria-checked', 'true');
    expect(altaRadio).toHaveAttribute('aria-checked', 'false');

    await user.click(altaRadio);
    expect(altaRadio).toHaveAttribute('aria-checked', 'true');
    expect(mediaRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('debe persistir exitosamente la tarea al pulsar Guardar e invocar onTaskCreated y onClose', async () => {
    const user = userEvent.setup();
    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
        onTaskCreated={handleCreated}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Instalar termostato'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByRole('textbox', { name: /descripción detallada/i }),
      'Modelo inteligente Wi-Fi'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const saveButton = screen.getByRole('button', { name: /guardar tarea/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledTimes(1);
    });

    const createdTask = handleCreated.mock.calls[0][0];
    expect(createdTask.titulo).toBe('Instalar termostato');
    expect(createdTask.descripcion).toBe('Modelo inteligente Wi-Fi');
    expect(createdTask.prioridad).toBe('media');
    expect(createdTask.userId).toBe(mockUserId);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar alerta de error si el servicio de tareas falla durante la persistencia y permitir reintentar', async () => {
    const user = userEvent.setup();
    const brokenService = {
      createTask: vi.fn().mockRejectedValue(new Error('Fallo crítico en servidor de base de datos')),
    } as unknown as TasksService;

    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={brokenService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Tarea problemática'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /guardar tarea/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/fallo crítico en servidor/i);
    });

    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar tarea/i })).not.toBeDisabled();
  });

  it('CASO FORENSE VV-004 & DECISIÓN 3A: pulsar [Cancelar] en Paso 2 o 3 destruye el buffer en memoria y al reabrir nace 100% limpio en Paso 1', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    // Escribir en Paso 1
    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Borrador incompleto que debe ser purgado'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Escribir en Paso 2
    await user.type(
      screen.getByRole('textbox', { name: /descripción detallada/i }),
      'Notas secretas temporales'
    );

    // Pulsar Cancelar (Caso Forense VV-004)
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Simular cierre y reapertura del modal
    rerender(
      <TaskCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    rerender(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    // Comprobar rigurosamente que nace 100% limpio en Paso 1 (Decisión 3A)
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    const cleanTitleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    expect(cleanTitleInput).toHaveValue('');
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.queryByText(/notas secretas temporales/i)).not.toBeInTheDocument();
  });

  it('CASO FORENSE VV-004: presionar la tecla Escape purga el buffer en memoria y cierra el modal', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Tarea abortada con tecla Escape'
    );

    // Presionar tecla ESC
    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Reabrir y verificar que el buffer ha sido purgado a cero
    rerender(
      <TaskCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    rerender(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    expect(screen.getByRole('textbox', { name: /título o nombre de la tarea/i })).toHaveValue('');
  });
});
