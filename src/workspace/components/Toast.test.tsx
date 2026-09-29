import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast Component (RV-A08 / FIA-A08.02)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('no renderiza nada en el DOM cuando isOpen es false', () => {
    render(
      <Toast
        isOpen={false}
        what="Error de prueba"
        why="Motivo de prueba"
        action="Accion sugerida"
        onClose={() => {}}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
  });

  it('renderiza el Toast con role alert y aria-live="assertive" cuando isOpen es true', () => {
    render(
      <Toast
        isOpen={true}
        what="No se pudo completar la operación."
        why="Fallo temporal del servidor."
        action="Hemos revertido el cambio automáticamente."
        onClose={() => {}}
      />
    );

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
  });

  it('muestra los 3 componentes canónicos por separado (what, why, action)', () => {
    render(
      <Toast
        isOpen={true}
        what="Título del problema"
        why="Razón de la ocurrencia"
        action="Acción correctiva tomada"
        onClose={() => {}}
      />
    );

    const whatEl = screen.getByTestId('toast-what');
    const whyEl = screen.getByTestId('toast-why');
    const actionEl = screen.getByTestId('toast-action');

    expect(whatEl).toHaveTextContent('Título del problema');
    expect(whyEl).toHaveTextContent('Razón de la ocurrencia');
    expect(actionEl).toHaveTextContent('Acción correctiva tomada');
  });

  it('invoca onClose al hacer clic en el botón de cerrar [×]', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        isOpen={true}
        what="Error de prueba"
        why="Motivo de prueba"
        action="Acción sugerida"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invoca onClose automáticamente tras autoCloseMs', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        isOpen={true}
        what="Error de prueba"
        why="Motivo de prueba"
        action="Acción sugerida"
        onClose={handleClose}
        autoCloseMs={3000}
      />
    );

    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('muestra el icono correspondiente al tipo de toast (error, warning, info)', () => {
    const { rerender } = render(
      <Toast
        isOpen={true}
        type="error"
        what="Error"
        why="Motivo"
        action="Acción"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('❌')).toBeInTheDocument();

    rerender(
      <Toast
        isOpen={true}
        type="warning"
        what="Aviso"
        why="Motivo"
        action="Acción"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(
      <Toast
        isOpen={true}
        type="info"
        what="Información"
        why="Motivo"
        action="Acción"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });
});
