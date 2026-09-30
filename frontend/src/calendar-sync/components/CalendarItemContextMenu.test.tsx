import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarItemContextMenu } from './CalendarItemContextMenu';

describe('CalendarItemContextMenu Component (Desasignación / VV-007)', () => {
  const defaultProps = {
    isOpen: true,
    position: { x: 250, y: 180 },
    itemId: 'item-task-1',
    modulo: 'tasks' as const,
    itemTitle: 'Reparar cerradura',
    onUnschedule: vi.fn(),
    onClose: vi.fn(),
  };

  it('no renderiza nada en el DOM cuando isOpen es false', () => {
    render(<CalendarItemContextMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('calendar-item-context-menu')).not.toBeInTheDocument();
  });

  it('renderiza el menú contextual en coordenadas fixed cuando isOpen es true', () => {
    render(<CalendarItemContextMenu {...defaultProps} />);

    const menu = screen.getByTestId('calendar-item-context-menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('role', 'menu');
    expect(menu).toHaveAttribute('aria-label', 'Opciones de Reparar cerradura');
    expect(menu.style.top).toBe('180px');
    expect(menu.style.left).toBe('250px');
  });

  it('muestra la opción "Mover a Sin Asignar" con role="menuitem"', () => {
    render(<CalendarItemContextMenu {...defaultProps} />);

    const menuItem = screen.getByRole('menuitem', { name: /mover a sin asignar/i });
    expect(menuItem).toBeInTheDocument();
  });

  it('invoca onUnschedule con itemId y modulo al hacer clic en "Mover a Sin Asignar"', async () => {
    const user = userEvent.setup();
    const handleUnschedule = vi.fn();
    render(<CalendarItemContextMenu {...defaultProps} onUnschedule={handleUnschedule} />);

    const unscheduleBtn = screen.getByTestId('context-menu-unschedule-btn');
    await user.click(unscheduleBtn);

    expect(handleUnschedule).toHaveBeenCalledTimes(1);
    expect(handleUnschedule).toHaveBeenCalledWith('item-task-1', 'tasks');
  });

  it('invoca onClose al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(<CalendarItemContextMenu {...defaultProps} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invoca onClose al hacer clic sobre el backdrop exterior', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<CalendarItemContextMenu {...defaultProps} onClose={handleClose} />);

    const backdrop = screen.getByTestId('context-menu-backdrop');
    await user.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('limita las coordenadas en pantalla cuando el clic ocurre cerca del borde inferior o derecho (Realidad Validada / Clamping seguro)', () => {
    // Simular clic en el extremo inferior derecho de la pantalla
    const edgePosition = { x: window.innerWidth - 20, y: window.innerHeight - 15 };
    render(<CalendarItemContextMenu {...defaultProps} position={edgePosition} />);

    const menu = screen.getByTestId('calendar-item-context-menu');
    const computedLeft = parseInt(menu.style.left, 10);
    const computedTop = parseInt(menu.style.top, 10);

    // Debe haberse desplazado hacia adentro para no salirse de la ventana
    expect(computedLeft).toBeLessThan(edgePosition.x);
    expect(computedTop).toBeLessThan(edgePosition.y);
    expect(computedLeft + 190).toBeLessThanOrEqual(window.innerWidth);
    expect(computedTop + 50).toBeLessThanOrEqual(window.innerHeight);
  });

  it('invoca onClose de forma limpia al hacer scroll en la ventana para evitar desfases visuales', () => {
    const handleClose = vi.fn();
    render(<CalendarItemContextMenu {...defaultProps} onClose={handleClose} />);

    fireEvent.scroll(window);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
