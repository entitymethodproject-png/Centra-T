import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningCreationModal } from './CleaningCreationModal';

describe('CleaningCreationModal Component', () => {
  it('1. no debe renderizarse en el DOM cuando isOpen=false', () => {
    render(<CleaningCreationModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByTestId('cleaning-creation-modal')).not.toBeInTheDocument();
  });

  it('2. debe renderizar el modal accesible con campos de nombre, selectores de zona y frecuencia cuando isOpen=true', () => {
    render(<CleaningCreationModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('cleaning-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-zone-select')).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-frequency-select')).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-submit-button')).toBeInTheDocument();
  });

  it('3. debe emitir DTO validado al completar el formulario y pulsar Guardar', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<CleaningCreationModal isOpen={true} onClose={vi.fn()} onSubmit={handleSubmit} />);

    await user.type(screen.getByTestId('cleaning-name-input'), 'Limpiar azulejos del baño');
    await user.selectOptions(screen.getByTestId('cleaning-zone-select'), 'baño');
    await user.selectOptions(screen.getByTestId('cleaning-frequency-select'), 'quincenal');
    await user.click(screen.getByTestId('cleaning-submit-button'));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Limpiar azulejos del baño',
        zona: 'baño',
        frecuencia: 'quincenal',
      })
    );
  });

  it('4. debe bloquear el envío y mostrar error ante nombre vacío o compuesto por espacios', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<CleaningCreationModal isOpen={true} onClose={vi.fn()} onSubmit={handleSubmit} />);

    await user.type(screen.getByTestId('cleaning-name-input'), '     ');
    await user.click(screen.getByTestId('cleaning-submit-button'));

    expect(screen.getByTestId('cleaning-modal-error')).toHaveTextContent(/obligatorio/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('5. debe acotar la longitud máxima del nombre a 120 caracteres bajo Decisión 2B', () => {
    render(<CleaningCreationModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    const nameInput = screen.getByTestId('cleaning-name-input');
    expect(nameInput).toHaveAttribute('maxLength', '120');
  });

  it('6. ROLLBACK A CERO: debe invocar onClose al presionar Cancelar o tecla Escape', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<CleaningCreationModal isOpen={true} onClose={handleClose} onSubmit={vi.fn()} />);

    // Cancelar
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
