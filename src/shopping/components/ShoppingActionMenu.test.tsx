import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingActionMenu } from './ShoppingActionMenu';
import { ShoppingItem } from '../entities/shopping-item.entity';
import { ShoppingService } from '../services/shopping.service';

describe('ShoppingActionMenu Component (Menú Contextual y Modal Preventivo)', () => {
  const baseItem: ShoppingItem = {
    id: 'shop-action-01',
    userId: 'usr-demo-elena-001',
    modulo: 'shopping',
    titulo: 'Aceite de oliva virgen extra',
    descripcion: 'Botella de 1 litro',
    prioridad: 'media',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar accesiblemente el disparador (...) con aria-haspopup="menu"', () => {
    render(<ShoppingActionMenu item={baseItem} />);

    const trigger = screen.getByRole('button', { name: /acciones de producto/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('debe desplegar el menú contextual al hacer clic en el disparador', async () => {
    const user = userEvent.setup();
    render(<ShoppingActionMenu item={baseItem} />);

    const trigger = screen.getByRole('button', { name: /acciones de producto/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /opciones de producto/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /descripción/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /cambiar prioridad/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /eliminar producto/i })).toBeInTheDocument();
  });

  it('debe abrir el modal de descripción y mostrar la descripción actual para su lectura', async () => {
    const user = userEvent.setup();
    render(<ShoppingActionMenu item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /descripción del producto/i })).toBeInTheDocument();
    expect(screen.getByText(/aceite de oliva virgen extra/i)).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: /descripción del producto/i });
    expect(textarea).toHaveValue('Botella de 1 litro');
  });

  it('debe permitir editar la descripción y persistir los cambios al pulsar Guardar', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const mockService = {
      updateItem: vi.fn().mockResolvedValue({
        ...baseItem,
        descripcion: 'Botella de 2 litros prensado en frío',
      }),
    } as unknown as ShoppingService;

    render(
      <ShoppingActionMenu
        item={baseItem}
        shoppingService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const textarea = screen.getByRole('textbox', { name: /descripción del producto/i });
    await user.clear(textarea);
    await user.type(textarea, 'Botella de 2 litros prensado en frío');

    const saveBtn = screen.getByTestId('save-description-btn');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockService.updateItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'shop-action-01',
        { descripcion: 'Botella de 2 litros prensado en frío' }
      );
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: 'Botella de 2 litros prensado en frío' })
      );
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe permitir borrar la descripción existente al pulsar Borrar descripción', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const mockService = {
      updateItem: vi.fn().mockResolvedValue({
        ...baseItem,
        descripcion: '',
      }),
    } as unknown as ShoppingService;

    render(
      <ShoppingActionMenu
        item={baseItem}
        shoppingService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));

    const clearBtn = screen.getByTestId('clear-description-btn');
    await user.click(clearBtn);

    await waitFor(() => {
      expect(mockService.updateItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'shop-action-01',
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
      updateItem: vi.fn(),
    } as unknown as ShoppingService;

    render(<ShoppingActionMenu item={baseItem} shoppingService={mockService} />);

    // Cancelar con botón Cancelar
    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.updateItem).not.toHaveBeenCalled();

    // Cancelar con tecla Escape
    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /descripción/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.updateItem).not.toHaveBeenCalled();
  });

  it('debe cerrar el menú contextual al presionar la tecla Escape', async () => {
    const user = userEvent.setup();
    render(<ShoppingActionMenu item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cambiar la prioridad del producto e invocar onItemUpdated', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      updateItem: vi.fn().mockResolvedValue({
        ...baseItem,
        prioridad: 'alta',
      }),
    } as unknown as ShoppingService;

    render(
      <ShoppingActionMenu
        item={baseItem}
        shoppingService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /cambiar prioridad/i }));
    await user.click(screen.getByRole('menuitem', { name: /alta/i }));

    await waitFor(() => {
      expect(mockService.updateItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'shop-action-01',
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
    render(<ShoppingActionMenu item={baseItem} />);

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar producto/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿eliminar producto\?/i })).toBeInTheDocument();
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
    } as unknown as ShoppingService;
    const handleDeleted = vi.fn();

    render(
      <ShoppingActionMenu
        item={baseItem}
        shoppingService={mockService}
        onItemDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar producto/i }));

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
    } as unknown as ShoppingService;
    const handleDeleted = vi.fn();

    render(
      <ShoppingActionMenu
        item={baseItem}
        shoppingService={mockService}
        userId="usr-demo-elena-001"
        onItemDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de producto/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar producto/i }));

    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockService.deleteItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'shop-action-01'
      );
      expect(handleDeleted).toHaveBeenCalledWith('shop-action-01');
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
