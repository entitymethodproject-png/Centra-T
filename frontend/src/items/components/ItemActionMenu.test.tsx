import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemActionMenu } from './ItemActionMenu';
import { Item } from '../entities/item.entity';

describe('ItemActionMenu Component (Menú Contextual, A11y y Borrado Seguro)', () => {
  const sampleItem: Item = {
    id: 'item-act-1',
    userId: 'usr-1',
    modulo: 'tasks',
    titulo: 'Revisar caldera',
    nombre: 'Revisar caldera',
    descripcion: 'Texto previo',
    prioridad: 'media',
    completado: false,
    comprado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe desplegar el menú contextual al pulsar el botón de opciones', async () => {
    const user = userEvent.setup();
    render(<ItemActionMenu item={sampleItem} />);

    const trigger = screen.getByLabelText(/acciones de tarea/i);
    await user.click(trigger);

    expect(screen.getByRole('menu')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /^descripción$/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /prioridad/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /eliminar tarea/i })).toBeInTheDocument();
  });

  it('debe abrir el modal de edición de descripción y permitir actualizarla', async () => {
    const onItemUpdated = vi.fn();
    const user = userEvent.setup();

    render(<ItemActionMenu item={sampleItem} onItemUpdated={onItemUpdated} />);

    await user.click(screen.getByLabelText(/acciones de tarea/i));
    await user.click(screen.getByRole('menuitem', { name: /^descripción$/i }));

    const textarea = screen.getByRole('textbox', { name: /descripción de la tarea/i });
    expect(textarea).toHaveValue('Texto previo');

    await user.clear(textarea);
    await user.type(textarea, 'Nueva descripción ampliada');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onItemUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        descripcion: 'Nueva descripción ampliada',
      })
    );
  });

  it('debe abrir el diálogo seguro de borrado, enfocar Cancelar por defecto y cancelar con Escape', async () => {
    const onItemDeleted = vi.fn();
    const user = userEvent.setup();

    render(<ItemActionMenu item={sampleItem} onItemDeleted={onItemDeleted} />);

    await user.click(screen.getByLabelText(/acciones de tarea/i));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(screen.getByText(/¿eliminar tarea\?/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await waitFor(() => {
      expect(cancelBtn).toHaveFocus();
    });

    // Cancelación con tecla Escape
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(onItemDeleted).not.toHaveBeenCalled();
  });

  it('debe ejecutar onItemDeleted al confirmar la eliminación', async () => {
    const onItemDeleted = vi.fn();
    const user = userEvent.setup();

    render(<ItemActionMenu item={sampleItem} onItemDeleted={onItemDeleted} />);

    await user.click(screen.getByLabelText(/acciones de tarea/i));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const confirmBtn = screen.getByRole('button', { name: /eliminar permanentemente/i });
    await user.click(confirmBtn);

    expect(onItemDeleted).toHaveBeenCalledWith('item-act-1');
  });

  it('renderiza el desplegable fuera del contenedor del Hub en el body mediante portal flotante (Realidad Validada / Sin descuadre)', async () => {
    const user = userEvent.setup();
    const { container } = render(<ItemActionMenu item={sampleItem} />);

    const trigger = screen.getByLabelText(/acciones de tarea/i);
    await user.click(trigger);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    // La realidad validada dicta que el menú NO debe estar confinado dentro del contenedor DOM del ítem
    expect(container.contains(menu)).toBe(false);
    // Debe residir directamente en document.body mediante createPortal
    expect(document.body.contains(menu)).toBe(true);
  });

  it('cierra el menú flotante al pulsar sobre su backdrop exterior o tecla Escape', async () => {
    const user = userEvent.setup();
    render(<ItemActionMenu item={sampleItem} />);

    const trigger = screen.getByLabelText(/acciones de tarea/i);
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    const backdrop = screen.getByTestId('action-menu-backdrop');
    await user.click(backdrop);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('permite desplegar el submenú de prioridades y seleccionar una nueva prioridad', async () => {
    const onItemUpdated = vi.fn();
    const user = userEvent.setup();
    render(<ItemActionMenu item={sampleItem} onItemUpdated={onItemUpdated} />);

    await user.click(screen.getByLabelText(/acciones de tarea/i));
    await user.click(screen.getByTestId('action-menu-change-priority'));

    expect(screen.getByTestId('priority-submenu')).toBeInTheDocument();
    const altaOption = screen.getByTestId('priority-option-alta');
    await user.click(altaOption);

    expect(onItemUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        prioridad: 'alta',
      })
    );
  });
});
