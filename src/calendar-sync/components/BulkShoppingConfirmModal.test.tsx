import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkShoppingConfirmModal } from './BulkShoppingConfirmModal';

describe('BulkShoppingConfirmModal Component (Asignación Masiva / VV-006)', () => {
  const defaultProps = {
    isOpen: true,
    pendingCount: 4,
    targetDate: '2026-10-05',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('no renderiza nada en el DOM cuando isOpen es false', () => {
    render(<BulkShoppingConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el diálogo modal con atributos ARIA correctos cuando isOpen es true', () => {
    render(<BulkShoppingConfirmModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'bulk-shopping-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'bulk-shopping-modal-desc');

    expect(screen.getByText('Programar Compra Semanal')).toBeInTheDocument();
  });

  it('muestra la fecha de destino y el conteo exacto de productos pendientes', () => {
    render(<BulkShoppingConfirmModal {...defaultProps} pendingCount={7} targetDate="2026-10-12" />);

    expect(screen.getByText('2026-10-12')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(
      screen.getByText(/¿Asignar el/i)
    ).toBeInTheDocument();
  });

  it('invoca onConfirm al hacer clic en [Asignar Fecha a Todos]', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    render(<BulkShoppingConfirmModal {...defaultProps} onConfirm={handleConfirm} />);

    const confirmBtn = screen.getByRole('button', { name: /asignar fecha a todos/i });
    await user.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('invoca onCancel al hacer clic en [Cancelar]', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<BulkShoppingConfirmModal {...defaultProps} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('invoca onCancel al presionar la tecla Escape', () => {
    const handleCancel = vi.fn();
    render(<BulkShoppingConfirmModal {...defaultProps} onCancel={handleCancel} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('enfoca inicialmente el botón [Cancelar] por seguridad para prevenir confirmaciones accidentales', () => {
    render(<BulkShoppingConfirmModal {...defaultProps} />);

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelBtn).toHaveFocus();
  });

  it('invoca onCancel al hacer clic en el backdrop fuera del modal', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<BulkShoppingConfirmModal {...defaultProps} onCancel={handleCancel} />);

    const dialogBackdrop = screen.getByRole('dialog');
    await user.click(dialogBackdrop);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
