import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarTaskPill } from './CalendarTaskPill';
import { DRAG_TRANSFER_MIME } from '../types/drag-drop.types';

describe('CalendarTaskPill Component', () => {
  it('renderiza el título del ítem correctamente', () => {
    render(
      <CalendarTaskPill
        id="task-1"
        titulo="Reparar grifo cocina"
        prioridad="alta"
        modulo="tasks"
      />
    );

    expect(screen.getByText('Reparar grifo cocina')).toBeInTheDocument();
  });

  it('aplica la clase de dot de prioridad correspondiente (alta, media, baja)', () => {
    const { rerender } = render(
      <CalendarTaskPill
        id="task-1"
        titulo="Tarea Alta"
        prioridad="alta"
        modulo="tasks"
      />
    );
    const dotAlta = screen.getByTestId('calendar-pill-dot');
    expect(dotAlta).toHaveClass(/priorityDot_alta/);

    rerender(
      <CalendarTaskPill
        id="task-1"
        titulo="Tarea Media"
        prioridad="media"
        modulo="tasks"
      />
    );
    const dotMedia = screen.getByTestId('calendar-pill-dot');
    expect(dotMedia).toHaveClass(/priorityDot_media/);

    rerender(
      <CalendarTaskPill
        id="task-1"
        titulo="Tarea Baja"
        prioridad="baja"
        modulo="tasks"
      />
    );
    const dotBaja = screen.getByTestId('calendar-pill-dot');
    expect(dotBaja).toHaveClass(/priorityDot_baja/);
  });

  it('muestra el badge del módulo (tasks -> T, shopping -> C, cleaning -> L)', () => {
    const { rerender } = render(
      <CalendarTaskPill
        id="item-1"
        titulo="Hacer algo"
        prioridad="media"
        modulo="tasks"
      />
    );
    expect(screen.getByTestId('calendar-pill-module')).toHaveTextContent('T');

    rerender(
      <CalendarTaskPill
        id="item-1"
        titulo="Hacer algo"
        prioridad="media"
        modulo="shopping"
      />
    );
    expect(screen.getByTestId('calendar-pill-module')).toHaveTextContent('C');

    rerender(
      <CalendarTaskPill
        id="item-1"
        titulo="Hacer algo"
        prioridad="media"
        modulo="cleaning"
      />
    );
    expect(screen.getByTestId('calendar-pill-module')).toHaveTextContent('L');
  });

  it('dispone de atributos data-testid, data-item-id y data-modulo válidos', () => {
    render(
      <CalendarTaskPill
        id="test-123"
        titulo="Limpiar cristales"
        prioridad="baja"
        modulo="cleaning"
      />
    );

    const pill = screen.getByTestId('calendar-pill-test-123');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveAttribute('data-item-id', 'test-123');
    expect(pill).toHaveAttribute('data-modulo', 'cleaning');
  });

  it('invoca onClick con el id del ítem al hacer clic', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <CalendarTaskPill
        id="task-click-1"
        titulo="Clickable"
        prioridad="media"
        modulo="tasks"
        onClick={handleClick}
      />
    );

    const pill = screen.getByTestId('calendar-pill-task-click-1');
    await user.click(pill);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('task-click-1');
  });

  it('aplica estilo de completado cuando completado=true', () => {
    render(
      <CalendarTaskPill
        id="task-comp-1"
        titulo="Tarea completada"
        prioridad="alta"
        modulo="tasks"
        completado={true}
      />
    );

    const titleEl = screen.getByText('Tarea completada');
    expect(titleEl).toHaveClass(/completedTitle/);
  });

  it('permite arrastre nativo serializando DragItemPayload con su fecha previa', () => {
    render(
      <CalendarTaskPill
        id="task-drag-pill"
        titulo="Mover estantería"
        prioridad="alta"
        modulo="tasks"
        fechaProgramada="2026-09-15"
        isDraggable={true}
      />
    );

    const pill = screen.getByTestId('calendar-pill-task-drag-pill');
    expect(pill).toHaveAttribute('draggable', 'true');

    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      dropEffect: 'none',
      effectAllowed: 'none',
    };

    fireEvent.dragStart(pill, { dataTransfer });

    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransferData[DRAG_TRANSFER_MIME]).toBeDefined();

    const parsed = JSON.parse(dataTransferData[DRAG_TRANSFER_MIME]);
    expect(parsed).toEqual(
      expect.objectContaining({
        id: 'task-drag-pill',
        modulo: 'tasks',
        titulo: 'Mover estantería',
        prioridad: 'alta',
        fechaProgramada: '2026-09-15',
      })
    );
  });

  it('dispara onContextMenu suprimiendo el menú nativo (preventDefault) con los datos del ítem', () => {
    const handleContextMenu = vi.fn();
    render(
      <CalendarTaskPill
        id="task-pill-ctx"
        titulo="Limpiar filtros campana"
        prioridad="media"
        modulo="cleaning"
        onContextMenu={handleContextMenu}
      />
    );

    const pill = screen.getByTestId('calendar-pill-task-pill-ctx');
    fireEvent.contextMenu(pill);

    expect(handleContextMenu).toHaveBeenCalledTimes(1);
    expect(handleContextMenu).toHaveBeenCalledWith(
      expect.any(Object),
      {
        id: 'task-pill-ctx',
        modulo: 'cleaning',
        titulo: 'Limpiar filtros campana',
      }
    );
  });
});

