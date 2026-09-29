import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCard } from './ItemCard';
import { Item } from '../entities/item.entity';
import { PolymorphicItemsService } from '../services/items.service';

describe('ItemCard Component (Tarjeta Polimórfica, Optimismo <16ms y Drag & Drop)', () => {
  const sampleTask: Item = {
    id: 'item-task-1',
    userId: 'usr-1',
    modulo: 'tasks',
    titulo: 'Pintar pared salón',
    nombre: 'Pintar pared salón',
    descripcion: 'Pintura mate color arena',
    prioridad: 'alta',
    completado: false,
    comprado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleShopping: Item = {
    id: 'item-shop-1',
    userId: 'usr-1',
    modulo: 'shopping',
    titulo: 'Café de especialidad',
    nombre: 'Café de especialidad',
    descripcion: 'Tueste medio',
    prioridad: 'media',
    completado: false,
    comprado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar título, indicador de prioridad y checkbox', () => {
    render(<ItemCard item={sampleTask} />);

    expect(screen.getByText('Pintar pared salón')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByLabelText(/prioridad alta/i)).toBeInTheDocument();
  });

  it('debe ejecutar mutación optimista inmediata del checkbox al hacer clic', async () => {
    const onToggleOptimistic = vi.fn();
    const user = userEvent.setup();

    render(<ItemCard item={sampleTask} onToggleOptimistic={onToggleOptimistic} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(onToggleOptimistic).toHaveBeenCalledWith('item-task-1', true);
  });

  it('debe revertir el estado (rollback) si el servicio remoto falla', async () => {
    const failingService: PolymorphicItemsService = {
      toggleItemStatus: vi.fn().mockRejectedValue(new Error('Network Error')),
    };
    const user = userEvent.setup();

    render(
      <ItemCard
        item={sampleTask}
        itemsService={failingService}
        userId="usr-1"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Tras el fallo, revierte a no marcado
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('debe configurar correctamente el atributo draggable y los datos de transferencia en onDragStart', () => {
    render(<ItemCard item={sampleShopping} isDraggable={true} />);

    const card = screen.getByTestId('shopping-item-item-shop-1');
    expect(card).toHaveAttribute('draggable', 'true');

    const setData = vi.fn();
    fireEvent.dragStart(card, {
      dataTransfer: {
        setData,
        effectAllowed: '',
      },
    });

    expect(setData).toHaveBeenCalledWith(
      'application/x-centrat-item',
      expect.stringContaining('item-shop-1')
    );
  });
});
