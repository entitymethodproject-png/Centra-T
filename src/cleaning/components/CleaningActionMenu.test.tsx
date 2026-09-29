import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningActionMenu } from './CleaningActionMenu';
import { CleaningItem } from '../entities/cleaning-item.entity';
import { CleaningService } from '../services/cleaning.service';

describe('CleaningActionMenu Component (Menú Contextual y Modal Preventivo)', () => {
  const baseItem: CleaningItem = {
    id: 'clean-action-01',
    userId: 'usr-demo-elena-001',
    modulo: 'cleaning',
    titulo: 'Limpiar cristales del salón',
    descripcion: 'Interior y exterior con limpiacristales',
    prioridad: 'media',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar accesiblemente el disparador (...) con aria-haspopup="menu"', () => {
    render(<CleaningActionMenu item={baseItem} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea de limpieza/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('debe desplegar el menú contextual al hacer clic en el disparador', async () => {
    const user = userEvent.setup();
    render(<CleaningActionMenu item={baseItem} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea de limpieza/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /opciones de tarea de limpieza/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /cambiar prioridad/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /eliminar tarea/i })).toBeInTheDocument();
  });

  it('debe cerrar el menú contextual al presionar la tecla Escape', async () => {
    const user = userEvent.setup();
    render(<CleaningActionMenu item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea de limpieza/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cambiar la prioridad de la tarea e invocar onItemUpdated', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      updateItem: vi.fn().mockResolvedValue({
        ...baseItem,
        prioridad: 'alta',
      }),
    } as unknown as CleaningService;

    render(
      <CleaningActionMenu
        item={baseItem}
        cleaningService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea de limpieza/i }));
    await user.click(screen.getByRole('menuitem', { name: /cambiar prioridad/i }));
    await user.click(screen.getByRole('menuitem', { name: /alta/i }));

    await waitFor(() => {
      expect(mockService.updateItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'clean-action-01',
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
    render(<CleaningActionMenu item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea de limpieza/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿eliminar tarea de limpieza\?/i })).toBeInTheDocument();
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await waitFor(() => {
      expect(cancelBtn).toHaveFocus();
    });
  });

  it('CANCELACIÓN INOFENSIVA: pulsar Cancelar cierra el modal preventivo sin emitir DELETE ni mutar estado', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteItem: vi.fn(),
    } as unknown as CleaningService;
    const handleDeleted = vi.fn();

    render(
      <CleaningActionMenu
        item={baseItem}
        cleaningService={mockService}
        onItemDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea de limpieza/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.deleteItem).not.toHaveBeenCalled();
    expect(handleDeleted).not.toHaveBeenCalled();
  });

  it('ELIMINACIÓN EXITOSA: confirmar eliminación ejecuta deleteItem e invoca onItemDeleted', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteItem: vi.fn().mockResolvedValue(undefined),
    } as unknown as CleaningService;
    const handleDeleted = vi.fn();

    render(
      <CleaningActionMenu
        item={baseItem}
        cleaningService={mockService}
        userId="usr-demo-elena-001"
        onItemDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea de limpieza/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const confirmBtn = screen.getByTestId('confirm-delete-cleaning-btn');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockService.deleteItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'clean-action-01'
      );
      expect(handleDeleted).toHaveBeenCalledWith('clean-action-01');
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
