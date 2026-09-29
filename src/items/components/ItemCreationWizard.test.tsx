import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCreationWizard } from './ItemCreationWizard';

describe('ItemCreationWizard Component (Wizard 3 Pasos, Caso Forense VV-004 y Decisión 3A)', () => {
  it('debe renderizar el modal en el Paso 1 con autofocus y contador de caracteres (0/120)', () => {
    render(
      <ItemCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        modulo="tasks"
      />
    );

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: /nueva tarea: título/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/título o nombre de la tarea/i);
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('0/120')).toBeInTheDocument();
  });

  it('debe validar que el título no esté en blanco y respetar el límite de 120 caracteres', async () => {
    const user = userEvent.setup();
    render(<ItemCreationWizard isOpen={true} onClose={vi.fn()} modulo="tasks" />);

    const titleInput = screen.getByLabelText(/título o nombre de la tarea/i);
    expect(titleInput).toHaveAttribute('maxlength', '120');

    // Intentar avanzar en blanco
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByText(/el nombre no puede estar en blanco/i)).toBeInTheDocument();
  });

  it('debe navegar por los 3 pasos, conservar el buffer al retroceder y persistir el ítem', async () => {
    const onItemCreated = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ItemCreationWizard
        isOpen={true}
        onClose={onClose}
        modulo="tasks"
        onItemCreated={onItemCreated}
      />
    );

    // Paso 1
    const titleInput = screen.getByLabelText(/título o nombre de la tarea/i);
    await user.type(titleInput, 'Organizar trastero');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2
    expect(screen.getByRole('heading', { name: /nueva tarea: descripción/i })).toBeInTheDocument();
    const descInput = screen.getByLabelText(/descripción detallada/i);
    await user.type(descInput, 'Comprar cajas de plástico');

    // Retroceder con [Atrás]
    await user.click(screen.getByRole('button', { name: /atrás/i }));
    expect(screen.getByLabelText(/título o nombre de la tarea/i)).toHaveValue('Organizar trastero');

    // Avanzar de nuevo
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByLabelText(/descripción detallada/i)).toHaveValue('Comprar cajas de plástico');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3
    expect(screen.getByRole('heading', { name: /nueva tarea: prioridad/i })).toBeInTheDocument();
    const altaRadio = screen.getByRole('radio', { name: /alta/i });
    await user.click(altaRadio);

    // Guardar
    await user.click(screen.getByRole('button', { name: /guardar tarea/i }));

    await waitFor(() => {
      expect(onItemCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Organizar trastero',
          descripcion: 'Comprar cajas de plástico',
          prioridad: 'alta',
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('CASO FORENSE VV-004 & DECISIÓN 3A: cancelar con Escape purga el buffer a cero para la siguiente apertura', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ItemCreationWizard isOpen={true} onClose={onClose} modulo="tasks" />
    );

    // Introducir datos en Paso 1 y avanzar a Paso 2
    await user.type(screen.getByLabelText(/título o nombre de la tarea/i), 'Tarea que será cancelada');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByRole('heading', { name: /nueva tarea: descripción/i })).toBeInTheDocument();

    // Cancelar con Escape
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();

    // Reabrir el wizard
    rerender(<ItemCreationWizard isOpen={true} onClose={onClose} modulo="tasks" />);

    // Nace 100% limpio en Paso 1
    expect(screen.getByRole('heading', { name: /nueva tarea: título/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título o nombre de la tarea/i)).toHaveValue('');
  });
});
