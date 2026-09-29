import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemsAccordion } from './ItemsAccordion';
import { Item } from '../entities/item.entity';

describe('ItemsAccordion Component (Acordeón Polimórfico y Arrastre en Bloque)', () => {
  const sampleItems: Item[] = [
    {
      id: 'item-1',
      userId: 'usr-1',
      modulo: 'shopping',
      titulo: 'Manzanas',
      nombre: 'Manzanas',
      descripcion: '1kg Royal Gala',
      prioridad: 'media',
      completado: false,
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      userId: 'usr-1',
      modulo: 'shopping',
      titulo: 'Detergente lavadora',
      nombre: 'Detergente lavadora',
      descripcion: '',
      prioridad: 'alta',
      completado: true,
      comprado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar el título, contador dinámico y botón de creación', () => {
    render(
      <ItemsAccordion
        modulo="shopping"
        title="Lista de Compra"
        items={sampleItems}
      />
    );

    expect(screen.getByText(/lista de compra \(2\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear nuevo producto/i })).toBeInTheDocument();
  });

  it('debe colapsar y expandir el contenido al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    render(
      <ItemsAccordion
        modulo="tasks"
        title="Tareas"
        items={sampleItems}
        initialExpanded={true}
      />
    );

    const toggleBtn = screen.getByTestId('tasks-accordion-header');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('debe renderizar el tirador de arrastre masivo en el módulo shopping cuando hay compras pendientes', () => {
    render(
      <ItemsAccordion
        modulo="shopping"
        title="Compra"
        items={sampleItems}
      />
    );

    const bulkHandle = screen.getByTestId('shopping-bulk-drag-handle');
    expect(bulkHandle).toBeInTheDocument();
    expect(bulkHandle).toHaveAttribute('draggable', 'true');
    expect(bulkHandle).toHaveAttribute('title', 'Arrastrar lista de compra al calendario');

    const setData = vi.fn();
    fireEvent.dragStart(bulkHandle, {
      dataTransfer: {
        setData,
        effectAllowed: '',
      },
    });

    expect(setData).toHaveBeenCalledWith(
      'application/x-centrat-item',
      expect.stringContaining('"isBulk":true')
    );
  });
});
