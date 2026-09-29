import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortMenu } from './SortMenu';
import { SortConfiguration, DEFAULT_SORT_CONFIG, SORT_OPTIONS } from '../types/sort.types';

describe('Componente Accesible · SortMenu (Popover de Reordenación Multinivel)', () => {
  it('debería no renderizar el menú cuando isOpen es false', () => {
    const { container } = render(
      <SortMenu
        isOpen={false}
        activeConfig={DEFAULT_SORT_CONFIG}
        onClose={vi.fn()}
        onSelectOption={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debería renderizar el menú accesible con su lista de opciones cuando isOpen es true', () => {
    render(
      <SortMenu
        isOpen={true}
        activeConfig={DEFAULT_SORT_CONFIG}
        onClose={vi.fn()}
        onSelectOption={vi.fn()}
      />
    );

    const menu = screen.getByRole('menu', { name: /opciones de ordenación/i });
    expect(menu).toBeInTheDocument();

    const options = screen.getAllByRole('menuitemradio');
    expect(options).toHaveLength(SORT_OPTIONS.length);
  });

  it('debería marcar con aria-checked="true" la opción correspondiente a activeConfig', () => {
    const activeConfig: SortConfiguration = { field: 'FECHA', direction: 'ASC' };

    render(
      <SortMenu
        isOpen={true}
        activeConfig={activeConfig}
        onClose={vi.fn()}
        onSelectOption={vi.fn()}
      />
    );

    const activeOption = screen.getByRole('menuitemradio', {
      name: /fecha: más cercana primero/i,
    });
    expect(activeOption).toHaveAttribute('aria-checked', 'true');

    const inactiveOption = screen.getByRole('menuitemradio', {
      name: /prioridad: alta a baja/i,
    });
    expect(inactiveOption).toHaveAttribute('aria-checked', 'false');
  });

  it('debería invocar onSelectOption y onClose al hacer clic en una opción', async () => {
    const user = userEvent.setup();
    const onSelectMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <SortMenu
        isOpen={true}
        activeConfig={DEFAULT_SORT_CONFIG}
        onClose={onCloseMock}
        onSelectOption={onSelectMock}
      />
    );

    const alphaOption = screen.getByRole('menuitemradio', { name: /nombre: a - z/i });
    await user.click(alphaOption);

    expect(onSelectMock).toHaveBeenCalledWith({
      field: 'ALFABETICO',
      direction: 'ASC',
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debería invocar onClose al pulsar la tecla Escape', () => {
    const onCloseMock = vi.fn();

    render(
      <SortMenu
        isOpen={true}
        activeConfig={DEFAULT_SORT_CONFIG}
        onClose={onCloseMock}
        onSelectOption={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debería invocar onClose al hacer clic en el backdrop exterior', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <SortMenu
        isOpen={true}
        activeConfig={DEFAULT_SORT_CONFIG}
        onClose={onCloseMock}
        onSelectOption={vi.fn()}
      />
    );

    const backdrop = screen.getByTestId('sort-menu-backdrop');
    await user.click(backdrop);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
