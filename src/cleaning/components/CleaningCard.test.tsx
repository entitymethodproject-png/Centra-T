import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningCard } from './CleaningCard';
import { CleaningItem } from '../entities/cleaning-item.entity';
import { CleaningService } from '../services/cleaning.service';

describe('CleaningCard Component (Mutación Optimista & Homogeneidad)', () => {
  const baseItem: CleaningItem = {
    id: 'clean-opt-01',
    userId: 'usr-demo-elena-001',
    modulo: 'cleaning',
    titulo: 'Desinfectar encimera de cocina',
    descripcion: 'Usar producto neutro y bayeta de microfibra',
    prioridad: 'alta',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar la tarjeta con título, badge de prioridad y checkbox con label accesible', () => {
    render(<CleaningCard item={baseItem} />);

    expect(screen.getByText('Desinfectar encimera de cocina')).toBeInTheDocument();
    expect(screen.getByText('ALTA')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /completar limpieza desinfectar encimera de cocina/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('debe conmutar de forma optimista el checkbox y tachar el texto inmediatamente al hacer clic (<50ms)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    render(<CleaningCard item={baseItem} onItemUpdated={handleUpdated} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /completar limpieza desinfectar encimera de cocina/i,
    });
    const title = screen.getByTestId('cleaning-card-title');

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);
    expect(handleUpdated).toHaveBeenCalled();
  });

  it('debe desmarcar el checkbox y retirar el tachado en una tarea completada', async () => {
    const user = userEvent.setup();
    const completedItem: CleaningItem = { ...baseItem, completado: true };

    render(<CleaningCard item={completedItem} />);

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('cleaning-card-title');

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);
  });

  it('debe sincronizar silenciosamente con cleaningService y llamar a onItemUpdated cuando la llamada es exitosa (200 OK)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      updateItem: vi.fn().mockResolvedValue({
        ...baseItem,
        completado: true,
      }),
    } as unknown as CleaningService;

    render(
      <CleaningCard
        item={baseItem}
        cleaningService={mockService}
        userId="usr-demo-elena-001"
        onItemUpdated={handleUpdated}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockService.updateItem).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'clean-opt-01',
        { completado: true }
      );
      expect(handleUpdated).toHaveBeenCalled();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ante error del servidor, revierte inmediatamente el checkbox, retira el tachado visual y muestra Toast', async () => {
    const user = userEvent.setup();
    const handleRollback = vi.fn();

    const failingService = {
      updateItem: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
    } as unknown as CleaningService;

    render(
      <CleaningCard
        item={baseItem}
        cleaningService={failingService}
        userId="usr-demo-elena-001"
        onRollback={handleRollback}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('cleaning-card-title');

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(title).not.toHaveClass(/titleCompleted/);
    });

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/no se pudo actualizar el estado de la tarea de limpieza\. se ha revertido el cambio/i);
    expect(handleRollback).toHaveBeenCalled();
  });

  it('debe permitir descartar el Toast de error al pulsar el botón de cierre [✕]', async () => {
    const user = userEvent.setup();
    const failingService = {
      updateItem: vi.fn().mockRejectedValue(new Error('500 Server Down')),
    } as unknown as CleaningService;

    render(
      <CleaningCard
        item={baseItem}
        cleaningService={failingService}
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
      <CleaningCard
        item={baseItem}
        onToggleOptimistic={handleOptimistic}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(handleOptimistic).toHaveBeenCalledWith('clean-opt-01', true);
  });
});
