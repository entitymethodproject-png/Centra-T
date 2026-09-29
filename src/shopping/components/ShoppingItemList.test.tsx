import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingItemList } from './ShoppingItemList';
import { ShoppingItem } from '../entities/shopping-item.entity';

describe('ShoppingItemList Component (Modo Compra Activa y Sección Comprados)', () => {
  const mockItems: ShoppingItem[] = [
    {
      id: 'item-1',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Leche de avena',
      cantidad: 2,
      unidad: 'l',
      comprado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Arroz integral',
      cantidad: 1,
      unidad: 'kg',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-3',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Huevos ecológicos',
      cantidad: 12,
      unidad: 'ud',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('1. debe separar productos pendientes de la sección secundaria Comprados (1)', () => {
    render(<ShoppingItemList items={mockItems} onToggleItem={vi.fn()} />);

    // Pendientes presentes en la lista principal
    expect(screen.getByText('Arroz integral')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('Huevos ecológicos')).toBeInTheDocument();
    expect(screen.getByText('12 ud')).toBeInTheDocument();

    // Comprados presentes bajo la cabecera secundaria
    expect(screen.getByTestId('shopping-bought-section')).toBeInTheDocument();
    expect(screen.getByText(/comprados \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Leche de avena')).toBeInTheDocument();
  });

  it('2. debe invocar onToggleItem con el id del producto al marcar un pendiente como comprado', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<ShoppingItemList items={mockItems} onToggleItem={handleToggle} />);

    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz integral/i });
    expect(arrozCheckbox).not.toBeChecked();

    await user.click(arrozCheckbox);
    expect(handleToggle).toHaveBeenCalledWith('item-2');
  });

  it('3. debe invocar onToggleItem al desmarcar un producto en la sección de Comprados', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<ShoppingItemList items={mockItems} onToggleItem={handleToggle} />);

    const lecheCheckbox = screen.getByRole('checkbox', { name: /desmarcar producto leche de avena/i });
    expect(lecheCheckbox).toBeChecked();

    await user.click(lecheCheckbox);
    expect(handleToggle).toHaveBeenCalledWith('item-1');
  });

  it('4. debe colapsar y expandir la lista de Comprados al pulsar su botón de cabecera', async () => {
    const user = userEvent.setup();

    render(<ShoppingItemList items={mockItems} onToggleItem={vi.fn()} />);

    const toggleBtn = screen.getByTestId('shopping-bought-toggle');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-bought-list')).toBeInTheDocument();

    // Colapsar
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('shopping-bought-list')).not.toBeInTheDocument();

    // Expandir
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-bought-list')).toBeInTheDocument();
  });

  it('5. no debe renderizar la sección de Comprados si ningún producto ha sido comprado', () => {
    const pendingOnlyItems = mockItems.filter((i) => !i.comprado);
    render(<ShoppingItemList items={pendingOnlyItems} onToggleItem={vi.fn()} />);

    expect(screen.queryByTestId('shopping-bought-section')).not.toBeInTheDocument();
    expect(screen.getByText('Arroz integral')).toBeInTheDocument();
  });

  it('6. debe mostrar aviso de felicitación cuando todos los productos han sido comprados', () => {
    const allBoughtItems = mockItems.map((i) => ({ ...i, comprado: true }));
    render(<ShoppingItemList items={allBoughtItems} onToggleItem={vi.fn()} />);

    expect(screen.getByTestId('shopping-all-bought-notice')).toBeInTheDocument();
    expect(screen.getByText(/¡todos los productos han sido comprados!/i)).toBeInTheDocument();
    expect(screen.getByText(/comprados \(3\)/i)).toBeInTheDocument();
  });
});
