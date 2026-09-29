import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCreationWizard } from './ShoppingCreationWizard';
import { ShoppingService } from '../services/shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';

describe('ShoppingCreationWizard Component (Wizard 3 Pasos & Homogeneidad con Tareas)', () => {
  let mockRepository: InMemoryShoppingRepository;
  let shoppingService: ShoppingService;
  const mockUserId = 'usr-demo-test-01';

  beforeEach(() => {
    mockRepository = new InMemoryShoppingRepository();
    shoppingService = new ShoppingService(mockRepository);
  });

  it('debe renderizar el modal en el Paso 1 con autofocus y contador de caracteres (0/120)', () => {
    const handleClose = vi.fn();
    render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nuevo producto: nombre/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /nombre del producto/i });
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debe bloquear el avance a Paso 2 y mostrar error si el nombre está vacío', async () => {
    const user = userEvent.setup();
    render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el nombre no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
  });

  it('debe navegar al Paso 2 y permitir retroceder al Paso 1 conservando el buffer', async () => {
    const user = userEvent.setup();
    render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(titleInput, 'Café en grano');

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByText(/paso 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nuevo producto: descripción/i })).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: /atrás/i });
    await user.click(backButton);

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nombre del producto/i })).toHaveValue('Café en grano');
  });

  it('debe permitir añadir descripción en Paso 2 y seleccionar prioridad en Paso 3', async () => {
    const user = userEvent.setup();
    render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /nombre del producto/i }),
      'Manzanas Golden'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const descTextarea = screen.getByRole('textbox', { name: /detalles y notas/i });
    await user.type(descTextarea, '1 kg aproximadamente, maduras');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nuevo producto: prioridad/i })).toBeInTheDocument();

    const altaRadio = screen.getByRole('radio', { name: /alta/i });
    await user.click(altaRadio);
    expect(altaRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('debe persistir exitosamente el producto al pulsar Guardar e invocar onItemCreated y onClose', async () => {
    const user = userEvent.setup();
    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        shoppingService={shoppingService}
        onItemCreated={handleCreated}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /nombre del producto/i }),
      'Detergente lavadora'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByRole('textbox', { name: /detalles y notas/i }),
      'Eco friendly'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const saveButton = screen.getByRole('button', { name: /guardar producto/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledTimes(1);
    });

    const created = handleCreated.mock.calls[0][0];
    expect(created.titulo).toBe('Detergente lavadora');
    expect(created.descripcion).toBe('Eco friendly');
    expect(created.prioridad).toBe('media');
    expect(created.userId).toBe(mockUserId);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('pulsar Cancelar o Escape destruye el buffer y al reabrir nace limpio en Paso 1', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /nombre del producto/i }),
      'Borrador que se cancela'
    );
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <ShoppingCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    rerender(
      <ShoppingCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        shoppingService={shoppingService}
      />
    );

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nombre del producto/i })).toHaveValue('');
  });
});
