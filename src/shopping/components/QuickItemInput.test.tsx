import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickItemInput } from './QuickItemInput';

describe('QuickItemInput Component (Input Rápido Inline)', () => {
  it('debe renderizar los campos de nombre, cantidad y selector de unidad', () => {
    render(<QuickItemInput onAddItem={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /nombre del producto/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /cantidad/i })).toHaveValue(1);
    expect(screen.getByRole('combobox', { name: /unidad/i })).toHaveValue('ud');
    expect(screen.getByRole('button', { name: /añadir ítem/i })).toBeInTheDocument();
  });

  it('debe invocar onAddItem al presionar Enter con nombre válido', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(<QuickItemInput onAddItem={handleAdd} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Café molido{Enter}');

    expect(handleAdd).toHaveBeenCalledWith({
      nombre: 'Café molido',
      cantidad: 1,
      unidad: 'ud',
    });
  });

  it('debe limpiar el campo de nombre tras la adición exitosa', async () => {
    const user = userEvent.setup();
    render(<QuickItemInput onAddItem={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Yogur natural{Enter}');

    expect(input).toHaveValue('');
  });

  it('RETENCIÓN DE FOCO CONTINUO: el input conserva el foco tras pulsar Enter para ingreso en ráfaga', async () => {
    const user = userEvent.setup();
    render(<QuickItemInput onAddItem={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Manzanas Golden{Enter}');

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('debe bloquear el envío ante nombre vacío o compuesto exclusivamente por espacios', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(<QuickItemInput onAddItem={handleAdd} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, '    {Enter}');

    expect(handleAdd).not.toHaveBeenCalled();
  });
});
