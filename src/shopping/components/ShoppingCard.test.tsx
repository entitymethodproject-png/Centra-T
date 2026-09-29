import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCard } from './ShoppingCard';
import { ShoppingItem } from '../entities/shopping-item.entity';
import { ShoppingService } from '../services/shopping.service';

describe('ShoppingCard Component (Mutación Optimista & Paridad de Diseño)', () => {
  const baseItem: ShoppingItem = {
    id: 'shop-opt-01',
    userId: 'usr-demo-elena-001',
    modulo: 'shopping',
    titulo: 'Leche desnatada',
    descripcion: '2 bricks sin lactosa',
    prioridad: 'alta',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar la tarjeta con título, dot sutil de prioridad y checkbox con label accesible', () => {
    render(<ShoppingCard item={baseItem} />);

    expect(screen.getByText('Leche desnatada')).toBeInTheDocument();
    const priorityDot = screen.getByTestId('shopping-card-priority');
    expect(priorityDot).toBeInTheDocument();
    expect(priorityDot).toHaveClass(/priorityDot_alta/);

    const checkbox = screen.getByRole('checkbox', {
      name: /comprar producto leche desnatada/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('debe conmutar de forma optimista el checkbox y tachar el texto inmediatamente al hacer clic (<50ms)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    render(<ShoppingCard item={baseItem} onItemUpdated={handleUpdated} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /comprar producto leche desnatada/i,
    });
    const title = screen.getByTestId('shopping-card-title');

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);
    expect(handleUpdated).toHaveBeenCalled();
  });

  it('debe desmarcar el checkbox y retirar el tachado en un producto comprado', async () => {
    const user = userEvent.setup();
    const completedItem: ShoppingItem = { ...baseItem, completado: true };

    render(<ShoppingCard item={completedItem} />);

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('shopping-card-title');

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);
  });

  it('debe sincronizar silenciosamente con shoppingService y llamar a onItemUpdated cuando la llamada es exitosa (200 OK)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      toggleBoughtStatus: vi.fn().mockResolvedValue({
        ...baseItem,
        completado: true,
      }),
    } as unknown as ShoppingService;

    render(
      <ShoppingCard
        item={baseItem}
        shoppingService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockService.toggleBoughtStatus).toHaveBeenCalledWith('usr-demo-elena-001', 'shop-opt-01');
      expect(handleUpdated).toHaveBeenCalled();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ante error del servidor, revierte inmediatamente el checkbox, retira el tachado visual y muestra Toast', async () => {
    const user = userEvent.setup();
    const handleRollback = vi.fn();

    const failingService = {
      toggleBoughtStatus: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
    } as unknown as ShoppingService;

    render(
      <ShoppingCard
        item={baseItem}
        shoppingService={failingService}
        userId="usr-demo-elena-001"
        onRollback={handleRollback}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('shopping-card-title');

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(title).not.toHaveClass(/titleCompleted/);
    });

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/no se pudo actualizar el estado del producto\. se ha revertido el cambio/i);
    expect(handleRollback).toHaveBeenCalled();
  });

  it('debe permitir descartar el Toast de error al pulsar el botón de cierre [✕]', async () => {
    const user = userEvent.setup();
    const failingService = {
      toggleBoughtStatus: vi.fn().mockRejectedValue(new Error('500 Server Down')),
    } as unknown as ShoppingService;

    render(
      <ShoppingCard
        item={baseItem}
        shoppingService={failingService}
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
      <ShoppingCard
        item={baseItem}
        onToggleOptimistic={handleOptimistic}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(handleOptimistic).toHaveBeenCalledWith('shop-opt-01', true);
  });
});
