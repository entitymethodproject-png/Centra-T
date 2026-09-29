import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingAccordion } from './ShoppingAccordion';
import { ShoppingItem } from '../../shopping/entities/shopping-item.entity';

describe('ShoppingAccordion Component (Telemetría e Integración en Hub)', () => {
  const mockItems: ShoppingItem[] = [
    {
      id: 'shop-1',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Leche desnatada',
      cantidad: 2,
      unidad: 'l',
      comprado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-2',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Arroz basmati',
      cantidad: 1,
      unidad: 'kg',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-3',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Pechuga de pollo',
      cantidad: 500,
      unidad: 'g',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar la cabecera con ratio exacto de telemetría (1/3) y badge de 2 pendientes', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByRole('button', { name: /compra semanal \(1\/3\)/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByTestId('shopping-pending-badge')).toHaveTextContent('2 pendientes');
  });

  it('debe colapsar y expandir el acordeón al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();

    render(<ShoppingAccordion items={mockItems} onToggleExpand={handleExpand} />);

    const header = screen.getByRole('button', { name: /compra semanal \(1\/3\)/i });
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

  it('debe renderizar el Skeleton Screen de 3 líneas cuando isLoading=true', () => {
    render(<ShoppingAccordion isLoading={true} />);
    expect(screen.getByTestId('shopping-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar Empty State sobrio cuando no hay productos (items=[])', () => {
    render(<ShoppingAccordion items={[]} />);
    expect(screen.getByTestId('shopping-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en la lista de compra/i)).toBeInTheDocument();
  });

  it('debe renderizar lista de productos con checkboxes, nombres y cantidades', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByText('Leche desnatada')).toBeInTheDocument();
    expect(screen.getByText('2 l')).toBeInTheDocument();

    expect(screen.getByText('Arroz basmati')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();

    const lecheCheckbox = screen.getByRole('checkbox', { name: /desmarcar producto leche desnatada/i });
    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz basmati/i });

    expect(lecheCheckbox).toBeChecked(); // Leche comprada
    expect(arrozCheckbox).not.toBeChecked(); // Arroz pendiente
  });

  it('debe actualizar la telemetría dinámicamente al alternar un checkbox', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const header = screen.getByRole('button', { name: /compra semanal \(1\/3\)/i });
    expect(header).toBeInTheDocument();

    // Marcar arroz como comprado mediante su etiqueta accesible
    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz basmati/i });
    await user.click(arrozCheckbox);

    // Ratio pasa a 2/3 y pendientes pasa a 1
    expect(screen.getByRole('button', { name: /compra semanal \(2\/3\)/i })).toBeInTheDocument();
    expect(screen.getByTestId('shopping-pending-badge')).toHaveTextContent('1 pendientes');
  });

  it('debe incorporar de inmediato un producto tecleado en QuickItemInput e incrementar el contador total', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const quickInput = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(quickInput, 'Aceite de girasol{Enter}');

    expect(screen.getByText('Aceite de girasol')).toBeInTheDocument();
    // Ahora total es 4, comprados 1 -> (1/4)
    expect(screen.getByRole('button', { name: /compra semanal \(1\/4\)/i })).toBeInTheDocument();
  });
});
