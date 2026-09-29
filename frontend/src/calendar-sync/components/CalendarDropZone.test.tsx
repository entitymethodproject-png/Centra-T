import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarDropZone } from './CalendarDropZone';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../types/drag-drop.types';

describe('CalendarDropZone Component', () => {
  const mockDate = '2026-09-29';

  it('renderiza los elementos hijos proporcionados', () => {
    render(
      <CalendarDropZone dateString={mockDate}>
        <span data-testid="child-element">Contenido del día</span>
      </CalendarDropZone>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByTestId(`calendar-drop-zone-${mockDate}`)).toBeInTheDocument();
    expect(screen.getByTestId(`calendar-drop-zone-${mockDate}`)).toHaveAttribute('data-date', mockDate);
  });

  it('activa el estado visual isOver al recibir dragOver y desactiva al recibir dragLeave', () => {
    render(
      <CalendarDropZone dateString={mockDate}>
        <span>Casilla</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId(`calendar-drop-zone-${mockDate}`);
    expect(dropZone).not.toHaveClass(/dropZoneActive/);

    // Simular dragOver
    fireEvent.dragOver(dropZone, {
      dataTransfer: { dropEffect: 'none' },
    });
    expect(dropZone).toHaveClass(/dropZoneActive/);

    // Simular dragLeave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass(/dropZoneActive/);
  });

  it('ejecuta onItemDrop con el payload deserializado y la fecha correcta al disparar drop', () => {
    const handleDrop = vi.fn();
    render(
      <CalendarDropZone dateString={mockDate} onItemDrop={handleDrop}>
        <span>Casilla</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId(`calendar-drop-zone-${mockDate}`);
    const payload: DragItemPayload = {
      id: 'task-drag-1',
      modulo: 'tasks',
      titulo: 'Planificar semana',
      prioridad: 'alta',
      completado: false,
    };

    const dataTransfer = {
      getData: (format: string) => {
        if (format === DRAG_TRANSFER_MIME || format === 'text/plain') {
          return JSON.stringify(payload);
        }
        return '';
      },
    };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(handleDrop).toHaveBeenCalledTimes(1);
    expect(handleDrop).toHaveBeenCalledWith(payload, mockDate);
    expect(dropZone).not.toHaveClass(/dropZoneActive/);
  });

  it('ignora el drop si el payload de datos no es válido o está vacío', () => {
    const handleDrop = vi.fn();
    render(
      <CalendarDropZone dateString={mockDate} onItemDrop={handleDrop}>
        <span>Casilla</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId(`calendar-drop-zone-${mockDate}`);

    // Drop vacío
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: () => '',
      },
    });
    expect(handleDrop).not.toHaveBeenCalled();

    // Drop con JSON corrupto
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: () => '{"invalid-json',
      },
    });
    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('aplica clases CSS personalizadas pasadas vía className', () => {
    render(
      <CalendarDropZone dateString={mockDate} className="custom-cell-class">
        <span>Casilla con clase</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId(`calendar-drop-zone-${mockDate}`);
    expect(dropZone).toHaveClass('custom-cell-class');
  });

  it('ignora drop si faltan campos obligatorios como id o modulo', () => {
    const handleDrop = vi.fn();
    render(
      <CalendarDropZone dateString={mockDate} onItemDrop={handleDrop}>
        <span>Casilla</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId(`calendar-drop-zone-${mockDate}`);

    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: () => JSON.stringify({ titulo: 'Sin id ni modulo' }),
      },
    });
    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('activa el estado isBlocked (.dropZonePastBlocked) y establece dropEffect = none al sobrevolar una casilla pasada (isPast=true)', () => {
    render(
      <CalendarDropZone dateString="2026-09-01" isPast={true}>
        <span>Casilla Pasada</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-01');
    const dataTransfer = { dropEffect: 'move' };

    fireEvent.dragOver(dropZone, { dataTransfer });

    expect(dropZone).toHaveClass(/dropZonePastBlocked/);
    expect(dropZone).toHaveAttribute('data-drop-blocked', 'true');
    expect(dropZone).not.toHaveClass(/dropZoneActive/);
    expect(dataTransfer.dropEffect).toBe('none');
  });

  it('remueve .dropZonePastBlocked al salir de la casilla pasada con dragLeave', () => {
    render(
      <CalendarDropZone dateString="2026-09-01" isPast={true}>
        <span>Casilla Pasada</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-01');

    fireEvent.dragOver(dropZone, { dataTransfer: { dropEffect: 'move' } });
    expect(dropZone).toHaveClass(/dropZonePastBlocked/);

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass(/dropZonePastBlocked/);
    expect(dropZone).not.toHaveAttribute('data-drop-blocked');
  });

  it('anula el drop y NO invoca onItemDrop cuando isPast=true (Caso VV-002)', () => {
    const handleDrop = vi.fn();
    render(
      <CalendarDropZone dateString="2026-09-01" isPast={true} onItemDrop={handleDrop}>
        <span>Casilla Pasada</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-01');
    const payload: DragItemPayload = {
      id: 'task-past-1',
      modulo: 'tasks',
      titulo: 'Tarea rechazada en pasado',
      prioridad: 'alta',
      completado: false,
    };

    const dataTransfer = {
      getData: (format: string) => {
        if (format === DRAG_TRANSFER_MIME || format === 'text/plain') {
          return JSON.stringify(payload);
        }
        return '';
      },
    };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(handleDrop).not.toHaveBeenCalled();
    expect(dropZone).not.toHaveClass(/dropZonePastBlocked/);
    expect(dropZone).not.toHaveClass(/dropZoneActive/);
  });

  it('mantiene el funcionamiento habitual con .dropZoneActive y dropEffect = move cuando isPast=false', () => {
    const handleDrop = vi.fn();
    render(
      <CalendarDropZone dateString="2026-09-30" isPast={false} onItemDrop={handleDrop}>
        <span>Casilla Futura</span>
      </CalendarDropZone>
    );

    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-30');
    const dataTransfer = { dropEffect: 'none' };

    fireEvent.dragOver(dropZone, { dataTransfer });

    expect(dropZone).toHaveClass(/dropZoneActive/);
    expect(dropZone).not.toHaveClass(/dropZonePastBlocked/);
    expect(dataTransfer.dropEffect).toBe('move');
  });
});
