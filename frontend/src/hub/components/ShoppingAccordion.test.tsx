import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingAccordion } from './ShoppingAccordion';
import { ShoppingItem } from '../../items/entities/item.entity';

describe('ShoppingAccordion Component (Homogeneidad con Tareas)', () => {
  const mockItems: ShoppingItem[] = [
    {
      id: 'shop-1',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      titulo: 'Leche desnatada',
      descripcion: '2 litros sin lactosa',
      prioridad: 'alta',
      completado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-2',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      titulo: 'Arroz basmati',
      descripcion: '1 paquete',
      prioridad: 'media',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-3',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      titulo: 'Pechuga de pollo',
      descripcion: 'Fileteada fina',
      prioridad: 'baja',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar la cabecera limpia con conteo de items y botón [+]', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByText('Compra (3)')).toBeInTheDocument();
    expect(screen.getByTestId('shopping-create-button')).toBeInTheDocument();
  });

  it('debe colapsar y expandir el acordeón al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();

    render(<ShoppingAccordion items={mockItems} onToggleExpand={handleExpand} />);

    const header = screen.getByTestId('shopping-accordion-header');
    expect(screen.getByTestId('shopping-populated-list')).toBeInTheDocument();

    // Colapsar
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('shopping-populated-list')).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenCalledWith(false);

    // Expandir
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-populated-list')).toBeInTheDocument();
  });

  it('debe renderizar el Skeleton Screen cuando isLoading=true', () => {
    render(<ShoppingAccordion isLoading={true} />);
    expect(screen.getByTestId('shopping-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar Empty State sobrio cuando no hay productos (items=[])', () => {
    render(<ShoppingAccordion items={[]} />);
    expect(screen.getByTestId('shopping-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en la lista de compra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ crear producto/i })).toBeInTheDocument();
  });

  it('debe renderizar lista de productos con checkboxes, títulos y dot sutil de prioridad', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByText('Leche desnatada')).toBeInTheDocument();
    expect(screen.getByText('Arroz basmati')).toBeInTheDocument();
    expect(screen.getByText('Pechuga de pollo')).toBeInTheDocument();

    const dots = screen.getAllByTestId('shopping-card-priority');
    expect(dots[0]).toHaveClass(/priorityDot_alta/);
    expect(dots[1]).toHaveClass(/priorityDot_media/);
    expect(dots[2]).toHaveClass(/priorityDot_baja/);

    const lecheCheckbox = screen.getByRole('checkbox', { name: /desmarcar producto leche desnatada/i });
    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz basmati/i });

    expect(lecheCheckbox).toBeChecked();
    expect(arrozCheckbox).not.toBeChecked();
  });

  it('debe abrir el wizard de creación al pulsar el botón [+] de la cabecera', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const createBtn = screen.getByTestId('shopping-create-button');
    await user.click(createBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
  });

  it('renderiza el asa de arrastre maestro cuando hay productos pendientes sin fecha (pendingCount > 0)', () => {
    // mockItems tiene shop-2 y shop-3 pendientes sin fecha (pendingCount = 2)
    render(<ShoppingAccordion items={mockItems} />);

    const dragHandle = screen.getByTestId('shopping-bulk-drag-handle');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute('draggable', 'true');
    expect(dragHandle).toHaveTextContent('⠿');
  });

  it('no renderiza el asa de arrastre maestro cuando no hay productos pendientes sin fecha (pendingCount = 0)', () => {
    const allCompletedOrScheduled: ShoppingItem[] = [
      {
        id: 'shop-comp-1',
        userId: 'usr-1',
        modulo: 'shopping',
        titulo: 'Pan de molde',
        descripcion: '',
        prioridad: 'baja',
        completado: true,
        fechaProgramada: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'shop-sched-1',
        userId: 'usr-1',
        modulo: 'shopping',
        titulo: 'Huevos docena',
        descripcion: '',
        prioridad: 'alta',
        completado: false,
        fechaProgramada: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<ShoppingAccordion items={allCompletedOrScheduled} />);
    expect(screen.queryByTestId('shopping-bulk-drag-handle')).not.toBeInTheDocument();
  });

  it('empaqueta BulkShoppingDragPayload en onDragStart del asa maestro', () => {
    render(<ShoppingAccordion items={mockItems} />);

    const dragHandle = screen.getByTestId('shopping-bulk-drag-handle');
    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      effectAllowed: 'none',
      dropEffect: 'none',
    };

    fireEvent.dragStart(dragHandle, { dataTransfer });

    expect(dataTransfer.effectAllowed).toBe('move');
    const rawPayload = dataTransferData['application/x-centrat-item'];
    expect(rawPayload).toBeDefined();

    const parsed = JSON.parse(rawPayload);
    expect(parsed).toEqual({
      id: 'bulk-shopping',
      modulo: 'shopping',
      titulo: 'Compra Semanal',
      isBulk: true,
      pendingCount: 2,
    });
  });
});

