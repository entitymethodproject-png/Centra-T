import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @ts-expect-error Component not yet implemented (TDD Fase RED)
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
});
