import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReassignmentConfirmModal } from './ReassignmentConfirmModal';

describe('ReassignmentConfirmModal Component (Decisión 4B / VV-003)', () => {
  const defaultProps = {
    isOpen: true,
    itemTitle: 'Instalar antena parabólica',
    originDate: '2026-09-15',
    targetDate: '2026-09-30',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('no renderiza nada en el DOM cuando isOpen es false', () => {
    render(<ReassignmentConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el diálogo modal cuando isOpen es true con atributos de accesibilidad', () => {
    render(<ReassignmentConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'reassign-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'reassign-modal-desc');
  });

  it('muestra el título de la tarea y las fechas de origen y destino', () => {
    render(<ReassignmentConfirmModal {...defaultProps} />);
    expect(screen.getByText('Conflicto de Programación')).toBeInTheDocument();
    expect(screen.getByText('Instalar antena parabólica')).toBeInTheDocument();
    expect(screen.getByText('2026-09-15')).toBeInTheDocument();
    expect(screen.getByText('2026-09-30')).toBeInTheDocument();
  });

  it('invoca onConfirm al pulsar el botón [Mover fecha]', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    render(<ReassignmentConfirmModal {...defaultProps} onConfirm={handleConfirm} />);

    const confirmBtn = screen.getByRole('button', { name: /mover fecha/i });
    await user.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('invoca onCancel al pulsar el botón [Mantener fecha]', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<ReassignmentConfirmModal {...defaultProps} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole('button', { name: /mantener fecha/i });
    await user.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('invoca onCancel al presionar la tecla Escape', () => {
    const handleCancel = vi.fn();
    render(<ReassignmentConfirmModal {...defaultProps} onCancel={handleCancel} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('asigna foco automático preventivo en el botón [Mantener fecha] al abrir', () => {
    render(<ReassignmentConfirmModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: /mantener fecha/i });
    expect(cancelBtn).toHaveFocus();
  });
});
