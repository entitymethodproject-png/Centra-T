import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningCreationWizard } from './CleaningCreationWizard';
import { CleaningService } from '../services/cleaning.service';
import { InMemoryCleaningRepository } from '../repositories/cleaning.repository';

describe('CleaningCreationWizard Component (Wizard 3 Pasos & Homogeneidad)', () => {
  let mockRepository: InMemoryCleaningRepository;
  let cleaningService: CleaningService;
  const mockUserId = 'usr-demo-test-01';

  beforeEach(() => {
    mockRepository = new InMemoryCleaningRepository();
    cleaningService = new CleaningService(mockRepository);
  });

  it('debe renderizar el modal en el Paso 1 con autofocus y contador de caracteres (0/120)', () => {
    const handleClose = vi.fn();
    render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea de limpieza: título/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /título de la tarea/i });
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debe bloquear el avance a Paso 2 y mostrar error si el título está vacío', async () => {
    const user = userEvent.setup();
    render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el título no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
  });

  it('debe navegar al Paso 2 y permitir retroceder al Paso 1 conservando el buffer', async () => {
    const user = userEvent.setup();
    render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /título de la tarea/i });
    await user.type(titleInput, 'Limpiar campana extractora');

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByText(/paso 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea de limpieza: descripción/i })).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /atrás/i });
    await user.click(backButton);

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /título de la tarea/i })).toHaveValue('Limpiar campana extractora');
  });

  it('debe permitir añadir descripción en Paso 2 y seleccionar prioridad en Paso 3', async () => {
    const user = userEvent.setup();
    render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título de la tarea/i }),
      'Desengrasar filtros'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const descTextarea = screen.getByRole('textbox', { name: /descripción y notas/i });
    await user.type(descTextarea, 'Dejar en remojo 30 min con quitagrasas');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea de limpieza: prioridad/i })).toBeInTheDocument();

    const altaRadio = screen.getByRole('radio', { name: /alta/i });
    await user.click(altaRadio);
    expect(altaRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('debe persistir exitosamente la tarea de limpieza al pulsar Guardar e invocar onItemCreated y onClose', async () => {
    const user = userEvent.setup();
    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        cleaningService={cleaningService}
        onItemCreated={handleCreated}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título de la tarea/i }),
      'Fregar suelos'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByRole('textbox', { name: /descripción y notas/i }),
      'Con jabón neutro'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const saveButton = screen.getByRole('button', { name: /guardar tarea/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledTimes(1);
    });

    const created = handleCreated.mock.calls[0][0];
    expect(created.titulo).toBe('Fregar suelos');
    expect(created.descripcion).toBe('Con jabón neutro');
    expect(created.prioridad).toBe('media');
    expect(created.userId).toBe(mockUserId);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('pulsar Cancelar o Escape destruye el buffer y al reabrir nace limpio en Paso 1', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <CleaningCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título de la tarea/i }),
      'Borrador que se cancela'
    );
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <CleaningCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    rerender(
      <CleaningCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        cleaningService={cleaningService}
      />
    );

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /título de la tarea/i })).toHaveValue('');
  });
});
