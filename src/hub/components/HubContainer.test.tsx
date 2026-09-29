import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HubContainer } from './HubContainer';

describe('PVF-A01.02 · HubContainer (Mecanismo Colapsable Reactivo del Hub)', () => {
  it('debe renderizar el Hub en estado expandido por defecto con sus hijos', () => {
    render(
      <HubContainer>
        <div data-testid="test-content">Contenido Interno</div>
      </HubContainer>
    );

    const aside = screen.getByRole('complementary', { name: /hub lateral/i });
    expect(aside).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /colapsar panel lateral/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('debe colapsar el Hub al hacer clic en el botón toggle y actualizar aria-expanded', async () => {
    const user = userEvent.setup();
    const onToggleMock = vi.fn();

    render(
      <HubContainer onToggle={onToggleMock}>
        <div data-testid="test-content">Contenido Interno</div>
      </HubContainer>
    );

    const toggleBtn = screen.getByRole('button', { name: /colapsar panel lateral/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggleBtn);

    const expandBtn = screen.getByRole('button', { name: /expandir panel lateral/i });
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
    expect(onToggleMock).toHaveBeenCalledWith(true);

    // Contrato esencial: NO desmontar los hijos del DOM al colapsar
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('debe re-expandir el Hub al volver a hacer clic en el botón toggle', async () => {
    const user = userEvent.setup();
    const onToggleMock = vi.fn();

    render(<HubContainer onToggle={onToggleMock} />);

    const toggleBtn = screen.getByRole('button', { name: /colapsar panel lateral/i });
    await user.click(toggleBtn);
    expect(onToggleMock).toHaveBeenLastCalledWith(true);

    const expandBtn = screen.getByRole('button', { name: /expandir panel lateral/i });
    await user.click(expandBtn);
    expect(onToggleMock).toHaveBeenLastCalledWith(false);

    expect(screen.getByRole('button', { name: /colapsar panel lateral/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('debe respetar la prop initialCollapsed si se pasa como true', () => {
    render(
      <HubContainer initialCollapsed={true}>
        <div data-testid="test-content">Contenido en Hub Colapsado</div>
      </HubContainer>
    );

    const toggleBtn = screen.getByRole('button', { name: /expandir panel lateral/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('debe renderizar el botón [Filtrar] cuando el Hub está expandido e invocar onFilterClick al pulsar', async () => {
    const user = userEvent.setup();
    const onFilterClickMock = vi.fn();

    render(<HubContainer onFilterClick={onFilterClickMock} />);

    const filterBtn = screen.getByRole('button', { name: /filtrar/i });
    expect(filterBtn).toBeInTheDocument();

    await user.click(filterBtn);
    expect(onFilterClickMock).toHaveBeenCalledTimes(1);
  });

  it('debe ocultar el botón [Filtrar] cuando el Hub está colapsado', () => {
    render(<HubContainer initialCollapsed={true} />);

    expect(screen.queryByRole('button', { name: /filtrar/i })).not.toBeInTheDocument();
  });

  it('debe renderizar el botón [Limpiar] cuando isFilterActive={true} y se provee onClearFilters', () => {
    render(
      <HubContainer
        isFilterActive={true}
        onClearFilters={vi.fn()}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /limpiar filtros/i });
    expect(clearBtn).toBeInTheDocument();
  });

  it('debe no renderizar el botón [Limpiar] cuando isFilterActive={false}', () => {
    render(
      <HubContainer
        isFilterActive={false}
        onClearFilters={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it('debe invocar onClearFilters al hacer clic en el botón [Limpiar]', async () => {
    const user = userEvent.setup();
    const onClearMock = vi.fn();

    render(
      <HubContainer
        isFilterActive={true}
        onClearFilters={onClearMock}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /limpiar filtros/i });
    await user.click(clearBtn);

    expect(onClearMock).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el contador activeFilterCount en el botón [Filtrar] cuando es mayor que 0', () => {
    render(
      <HubContainer
        isFilterActive={true}
        activeFilterCount={2}
      />
    );

    expect(screen.getByRole('button', { name: /filtrar/i })).toHaveTextContent('Filtrar (2)');
  });

  it('debe renderizar el botón [Reordenar] cuando el Hub está expandido e invocar onSortClick al pulsar', async () => {
    const user = userEvent.setup();
    const onSortClickMock = vi.fn();

    render(<HubContainer onSortClick={onSortClickMock} />);

    const sortBtn = screen.getByRole('button', { name: /reordenar/i });
    expect(sortBtn).toBeInTheDocument();

    await user.click(sortBtn);
    expect(onSortClickMock).toHaveBeenCalledTimes(1);
  });

  it('debe ocultar el botón [Reordenar] cuando el Hub está colapsado', () => {
    render(<HubContainer initialCollapsed={true} />);

    expect(screen.queryByRole('button', { name: /reordenar/i })).not.toBeInTheDocument();
  });
});
