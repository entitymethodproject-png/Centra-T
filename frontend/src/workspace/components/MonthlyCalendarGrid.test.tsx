import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthlyCalendarGrid } from './MonthlyCalendarGrid';

describe('MonthlyCalendarGrid Component', () => {
  const mockInitialDate = new Date(2026, 8, 29); // 29 Septiembre 2026

  it('debería desplegar el mes y año en español en la cabecera', () => {
    render(<MonthlyCalendarGrid initialDate={mockInitialDate} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/septiembre 2026/i);
  });

  it('debería renderizar los 7 encabezados de la semana (L a D)', () => {
    render(<MonthlyCalendarGrid initialDate={mockInitialDate} />);
    const headers = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    headers.forEach((h) => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });
  });

  it('debería avanzar al mes siguiente al hacer clic en [>]', async () => {
    const user = userEvent.setup();
    const handleMonthChange = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onMonthChange={handleMonthChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /mes siguiente/i });
    await user.click(nextBtn);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/octubre 2026/i);
    expect(handleMonthChange).toHaveBeenCalledWith(2026, 9);
  });

  it('debería retroceder al mes anterior al hacer clic en [<]', async () => {
    const user = userEvent.setup();
    const handleMonthChange = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onMonthChange={handleMonthChange}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /mes anterior/i });
    await user.click(prevBtn);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/agosto 2026/i);
    expect(handleMonthChange).toHaveBeenCalledWith(2026, 7);
  });

  it('debería regresar al mes actual al hacer clic en [Hoy] tras navegar', async () => {
    const user = userEvent.setup();
    render(<MonthlyCalendarGrid initialDate={mockInitialDate} />);

    const nextBtn = screen.getByRole('button', { name: /mes siguiente/i });
    await user.click(nextBtn);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/octubre 2026/i);

    const todayBtn = screen.getByRole('button', { name: /ir al mes actual|hoy/i });
    await user.click(todayBtn);

    // Debe volver al mes del sistema (o fecha inicial si se fijó)
    const now = new Date();
    const currentMonthRegex = new RegExp(`${now.getFullYear()}`, 'i');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(currentMonthRegex);
  });

  it('debería renderizar casillas con data-date e identificar días adyacentes', () => {
    render(<MonthlyCalendarGrid initialDate={mockInitialDate} />);

    // Septiembre 2026: celda 2026-08-31 debe existir como día adyacente
    const cellPrevMonth = screen.getByTestId('calendar-cell-2026-08-31');
    expect(cellPrevMonth).toBeInTheDocument();
    expect(cellPrevMonth.getAttribute('data-date')).toBe('2026-08-31');

    // Celda de Septiembre 2026
    const cellCurrentMonth = screen.getByTestId('calendar-cell-2026-09-15');
    expect(cellCurrentMonth).toBeInTheDocument();
    expect(cellCurrentMonth.getAttribute('data-date')).toBe('2026-09-15');
  });

  it('debería disparar onDayClick al hacer clic en una casilla', async () => {
    const user = userEvent.setup();
    const handleDayClick = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onDayClick={handleDayClick}
      />
    );

    const cell = screen.getByTestId('calendar-cell-2026-09-15');
    await user.click(cell);

    expect(handleDayClick).toHaveBeenCalledTimes(1);
    expect(handleDayClick).toHaveBeenCalledWith(
      expect.objectContaining({
        dateString: '2026-09-15',
        dayNumber: 15,
        isCurrentMonth: true,
      })
    );
  });

  it('debería cambiar de año al avanzar más allá de Diciembre', async () => {
    const user = userEvent.setup();
    const handleMonthChange = vi.fn();
    const decDate = new Date(2026, 11, 15); // Diciembre 2026
    render(
      <MonthlyCalendarGrid
        initialDate={decDate}
        onMonthChange={handleMonthChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /mes siguiente/i });
    await user.click(nextBtn);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/enero 2027/i);
    expect(handleMonthChange).toHaveBeenCalledWith(2027, 0);
  });

  it('debería invocar onDayClick mediante el teclado pulsando Enter sobre una casilla', async () => {
    const user = userEvent.setup();
    const handleDayClick = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onDayClick={handleDayClick}
      />
    );

    const cell = screen.getByTestId('calendar-cell-2026-09-15');
    cell.focus();
    await user.keyboard('{Enter}');

    expect(handleDayClick).toHaveBeenCalledTimes(1);
    expect(handleDayClick).toHaveBeenCalledWith(
      expect.objectContaining({
        dateString: '2026-09-15',
      })
    );
  });

  it('debería renderizar CalendarDropZone en las casillas del mes', () => {
    render(<MonthlyCalendarGrid initialDate={mockInitialDate} />);
    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-15');
    expect(dropZone).toBeInTheDocument();
    expect(dropZone).toHaveAttribute('data-date', '2026-09-15');
  });

  it('debería proyectar las píldoras CalendarTaskPill en la casilla de la fecha programada', () => {
    const scheduledItems = [
      {
        id: 'scheduled-1',
        titulo: 'Revisión anual caldera',
        prioridad: 'alta' as const,
        modulo: 'tasks' as const,
        completado: false,
        fechaProgramada: '2026-09-15',
      },
    ];

    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        scheduledItems={scheduledItems}
      />
    );

    const pill = screen.getByTestId('calendar-pill-scheduled-1');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent('Revisión anual caldera');
  });

  it('debería invocar onItemDrop al soltar un ítem sobre una casilla presente o futura', () => {
    const handleItemDrop = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onItemDrop={handleItemDrop}
      />
    );

    const dropZone = screen.getByTestId('calendar-drop-zone-2026-09-30');
    const payload = {
      id: 'task-dnd-1',
      modulo: 'tasks' as const,
      titulo: 'Comprar bombillas',
      prioridad: 'media' as const,
      completado: false,
    };

    const dataTransfer = {
      getData: (format: string) => {
        if (format === 'application/x-centra-t-item' || format === 'text/plain') {
          return JSON.stringify(payload);
        }
        return '';
      },
    };

    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    dropZone.dispatchEvent(dropEvent);

    expect(handleItemDrop).toHaveBeenCalledTimes(1);
    expect(handleItemDrop).toHaveBeenCalledWith(payload, '2026-09-30');
  });

  it('bloquea el soltado en casillas de días pasados y lo permite en días presentes y futuros (Decisión 1A / VV-002)', () => {
    const handleItemDrop = vi.fn();
    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        onItemDrop={handleItemDrop}
      />
    );

    const payload = {
      id: 'task-dnd-vv002',
      modulo: 'tasks' as const,
      titulo: 'Auditoría caldera',
      prioridad: 'alta' as const,
      completado: false,
    };

    const dataTransfer = {
      getData: (format: string) => {
        if (format === 'application/x-centra-t-item' || format === 'text/plain') {
          return JSON.stringify(payload);
        }
        return '';
      },
    };

    // 1. Intento de soltado en casilla pasada (2026-09-15)
    const pastDropZone = screen.getByTestId('calendar-drop-zone-2026-09-15');
    const pastDropEvent = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(pastDropEvent, 'dataTransfer', { value: dataTransfer });
    pastDropZone.dispatchEvent(pastDropEvent);

    expect(handleItemDrop).not.toHaveBeenCalled();

    // 2. Soltado en casilla futura (2026-09-30)
    const futureDropZone = screen.getByTestId('calendar-drop-zone-2026-09-30');
    const futureDropEvent = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(futureDropEvent, 'dataTransfer', { value: dataTransfer });
    futureDropZone.dispatchEvent(futureDropEvent);

    expect(handleItemDrop).toHaveBeenCalledTimes(1);
    expect(handleItemDrop).toHaveBeenCalledWith(payload, '2026-09-30');
  });

  it('propaga onItemContextMenu a CalendarTaskPill al recibir clic derecho', () => {
    const handleContextMenu = vi.fn();
    const scheduledItems = [
      {
        id: 'task-grid-ctx',
        modulo: 'tasks' as const,
        titulo: 'Revisión contador gas',
        prioridad: 'alta' as const,
        completado: false,
        fechaProgramada: '2026-09-29',
      },
    ];

    render(
      <MonthlyCalendarGrid
        initialDate={mockInitialDate}
        scheduledItems={scheduledItems}
        onItemContextMenu={handleContextMenu}
      />
    );

    const pill = screen.getByTestId('calendar-pill-task-grid-ctx');
    fireEvent.contextMenu(pill);

    expect(handleContextMenu).toHaveBeenCalledTimes(1);
    expect(handleContextMenu).toHaveBeenCalledWith(
      expect.any(Object),
      {
        id: 'task-grid-ctx',
        modulo: 'tasks',
        titulo: 'Revisión contador gas',
      }
    );
  });
});

