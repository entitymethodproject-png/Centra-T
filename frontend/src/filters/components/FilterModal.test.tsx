import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterModal } from './FilterModal';
import { FilterCriteria, DEFAULT_FILTER_CRITERIA } from '../types/filter.types';

describe('Componente Accesible · FilterModal (Buffer Local Desacoplado y Control AND)', () => {
  it('debería no renderizar nada en el DOM si isOpen es false', () => {
    const { container } = render(
      <FilterModal
        isOpen={false}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debería renderizar diálogo modal accesible con título y botones principales cuando isOpen es true', () => {
    render(
      <FilterModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog', { name: /filtros combinados/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    expect(screen.getByText(/filtros combinados/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpiar filtros/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aplicar filtros/i })).toBeInTheDocument();
  });

  it('debería inicializar los campos con initialCriteria si se provee', () => {
    const initialCriteria: FilterCriteria = {
      prioridad: 'alta',
      estado: 'SOLO_PENDIENTES',
      fecha: {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-15',
        fechaFin: null,
      },
    };

    render(
      <FilterModal
        isOpen={true}
        initialCriteria={initialCriteria}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    // Prioridad Alta seleccionada
    const btnAlta = screen.getByRole('button', { name: /^alta$/i });
    expect(btnAlta).toHaveAttribute('aria-pressed', 'true');

    // Estado Solo Pendientes seleccionado
    const btnPendientes = screen.getByRole('button', { name: /solo pendientes/i });
    expect(btnPendientes).toHaveAttribute('aria-pressed', 'true');

    // Checkbox fecha activo
    const dateCheckbox = screen.getByLabelText(/filtrar por fecha/i);
    expect(dateCheckbox).toBeChecked();

    // Input fecha puntual poblado
    const dateInput = screen.getByLabelText(/fecha puntual/i);
    expect(dateInput).toHaveValue('2026-10-15');
  });

  it('debería conmutar la visibilidad de los controles de fecha mediante el checkbox', async () => {
    const user = userEvent.setup();
    render(
      <FilterModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    const dateCheckbox = screen.getByLabelText(/filtrar por fecha/i);
    expect(dateCheckbox).not.toBeChecked();
    expect(screen.queryByLabelText(/fecha puntual/i)).not.toBeInTheDocument();

    await user.click(dateCheckbox);
    expect(dateCheckbox).toBeChecked();
    expect(screen.getByLabelText(/fecha puntual/i)).toBeInTheDocument();

    await user.click(dateCheckbox);
    expect(dateCheckbox).not.toBeChecked();
    expect(screen.queryByLabelText(/fecha puntual/i)).not.toBeInTheDocument();
  });

  it('debería permitir conmutar entre tipo PUNTUAL y RANGO', async () => {
    const user = userEvent.setup();
    render(
      <FilterModal
        isOpen={true}
        initialCriteria={{
          ...DEFAULT_FILTER_CRITERIA,
          fecha: {
            activo: true,
            tipo: 'PUNTUAL',
            fechaInicio: '2026-10-15',
            fechaFin: null,
          },
        }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/fecha puntual/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/fecha desde/i)).not.toBeInTheDocument();

    const radioRango = screen.getByLabelText(/rango/i);
    await user.click(radioRango);

    expect(screen.queryByLabelText(/fecha puntual/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/fecha desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha hasta/i)).toBeInTheDocument();
  });

  it('debería mostrar advertencia visual y deshabilitar [Aplicar Filtros] si fechaInicio > fechaFin en modo RANGO', () => {
    render(
      <FilterModal
        isOpen={true}
        initialCriteria={{
          ...DEFAULT_FILTER_CRITERIA,
          fecha: {
            activo: true,
            tipo: 'RANGO',
            fechaInicio: '2026-10-20',
            fechaFin: '2026-10-10',
          },
        }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    expect(screen.getByText(/la fecha de inicio no puede ser posterior a la fecha de fin/i)).toBeInTheDocument();
    const applyBtn = screen.getByRole('button', { name: /aplicar filtros/i });
    expect(applyBtn).toBeDisabled();
  });

  it('debería cerrar sin invocar onApply al pulsar [Cancelar]', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const onApplyMock = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        onClose={onCloseMock}
        onApply={onApplyMock}
      />
    );

    // Cambiar prioridad en buffer local
    await user.click(screen.getByRole('button', { name: /^alta$/i }));

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onApplyMock).not.toHaveBeenCalled();
  });

  it('debería cerrar sin invocar onApply al pulsar la tecla Escape', () => {
    const onCloseMock = vi.fn();
    const onApplyMock = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        onClose={onCloseMock}
        onApply={onApplyMock}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onApplyMock).not.toHaveBeenCalled();
  });

  it('debería cerrar sin invocar onApply al hacer clic en el backdrop', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const onApplyMock = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        onClose={onCloseMock}
        onApply={onApplyMock}
      />
    );

    const backdrop = screen.getByTestId('filter-modal-backdrop');
    await user.click(backdrop);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onApplyMock).not.toHaveBeenCalled();
  });

  it('debería restablecer los criterios a DEFAULT_FILTER_CRITERIA al pulsar [Limpiar Filtros]', async () => {
    const user = userEvent.setup();
    const onResetMock = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        initialCriteria={{
          prioridad: 'alta',
          estado: 'SOLO_PENDIENTES',
          fecha: {
            activo: true,
            tipo: 'PUNTUAL',
            fechaInicio: '2026-10-15',
            fechaFin: null,
          },
        }}
        onClose={vi.fn()}
        onApply={vi.fn()}
        onReset={onResetMock}
      />
    );

    // Verificar que arrancó en alta
    expect(screen.getByRole('button', { name: /^alta$/i })).toHaveAttribute('aria-pressed', 'true');

    // Pulsar limpiar
    const resetBtn = screen.getByRole('button', { name: /limpiar filtros/i });
    await user.click(resetBtn);

    // Ahora "Todas" debe estar seleccionada
    expect(screen.getByRole('button', { name: /^todas$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^todos$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/filtrar por fecha/i)).not.toBeChecked();
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it('debería invocar onApply con los criterios acumulados y cerrar al pulsar [Aplicar Filtros]', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    const onApplyMock = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        onClose={onCloseMock}
        onApply={onApplyMock}
      />
    );

    // Seleccionar prioridad Media
    await user.click(screen.getByRole('button', { name: /^media$/i }));

    // Seleccionar Solo Completadas
    await user.click(screen.getByRole('button', { name: /solo completadas/i }));

    // Activar fecha puntual
    await user.click(screen.getByLabelText(/filtrar por fecha/i));
    const dateInput = screen.getByLabelText(/fecha puntual/i);
    await user.type(dateInput, '2026-10-25');

    // Pulsar aplicar
    const applyBtn = screen.getByRole('button', { name: /aplicar filtros/i });
    await user.click(applyBtn);

    expect(onApplyMock).toHaveBeenCalledWith({
      prioridad: 'media',
      estado: 'SOLO_COMPLETADAS',
      fecha: {
        activo: true,
        tipo: 'PUNTUAL',
        fechaInicio: '2026-10-25',
        fechaFin: null,
      },
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
