import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningAccordion } from './CleaningAccordion';
import { CleaningItem } from '../../items/entities/item.entity';

describe('CleaningAccordion Component (Homogeneidad con Tareas y Compra)', () => {
  const mockItems: CleaningItem[] = [
    {
      id: 'clean-1',
      userId: 'usr-1',
      modulo: 'cleaning',
      titulo: 'Fregar suelo cocina',
      descripcion: 'Con fregasuelos aroma limón',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'clean-2',
      userId: 'usr-1',
      modulo: 'cleaning',
      titulo: 'Desinfectar ducha',
      descripcion: 'Antical en mampara',
      prioridad: 'media',
      completado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'clean-3',
      userId: 'usr-1',
      modulo: 'cleaning',
      titulo: 'Aspirar alfombra salón',
      descripcion: 'A fondo',
      prioridad: 'baja',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('1. debe renderizar la cabecera limpia con conteo de items y botón [+]', () => {
    render(<CleaningAccordion items={mockItems} />);

    expect(screen.getByText('Limpieza (3)')).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-create-button')).toBeInTheDocument();
  });

  it('2. debe colapsar y expandir el contenido al pulsar la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();

    render(<CleaningAccordion items={mockItems} onToggleExpand={handleExpand} />);

    const header = screen.getByTestId('cleaning-accordion-header');
    expect(screen.getByTestId('cleaning-populated-list')).toBeInTheDocument();

    // Colapsar
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('cleaning-populated-list')).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenCalledWith(false);

    // Expandir
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('cleaning-populated-list')).toBeInTheDocument();
  });

  it('3. debe renderizar todas las tareas con títulos, checkboxes y dot sutil de prioridad', () => {
    render(<CleaningAccordion items={mockItems} />);

    expect(screen.getByText('Fregar suelo cocina')).toBeInTheDocument();
    expect(screen.getByText('Desinfectar ducha')).toBeInTheDocument();
    expect(screen.getByText('Aspirar alfombra salón')).toBeInTheDocument();

    const dots = screen.getAllByTestId('cleaning-card-priority');
    expect(dots[0]).toHaveClass(/priorityDot_alta/);
    expect(dots[1]).toHaveClass(/priorityDot_media/);
    expect(dots[2]).toHaveClass(/priorityDot_baja/);

    const fregarCheckbox = screen.getByRole('checkbox', { name: /completar limpieza fregar suelo cocina/i });
    const duchaCheckbox = screen.getByRole('checkbox', { name: /desmarcar limpieza desinfectar ducha/i });

    expect(fregarCheckbox).not.toBeChecked();
    expect(duchaCheckbox).toBeChecked();
  });

  it('4. debe renderizar el Skeleton Screen cuando isLoading=true', () => {
    render(<CleaningAccordion isLoading={true} />);
    expect(screen.getByTestId('cleaning-skeleton')).toBeInTheDocument();
  });

  it('5. debe renderizar Empty State sobrio cuando no hay tareas disponibles', () => {
    render(<CleaningAccordion items={[]} />);
    expect(screen.getByTestId('cleaning-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no hay tareas de limpieza/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ crear limpieza/i })).toBeInTheDocument();
  });

  it('6. debe abrir el wizard de creación al pulsar [+] sin colapsar el acordeón', async () => {
    const user = userEvent.setup();
    render(<CleaningAccordion items={mockItems} />);

    const createBtn = screen.getByTestId('cleaning-create-button');
    expect(createBtn).toHaveTextContent('+');
    await user.click(createBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-accordion-header')).toHaveAttribute('aria-expanded', 'true');
  });

  it('7. debe incorporar nueva tarea creada e incrementar el contador de la cabecera', async () => {
    const user = userEvent.setup();
    render(<CleaningAccordion items={mockItems} />);

    await user.click(screen.getByTestId('cleaning-create-button'));

    // Paso 1
    await user.type(screen.getByRole('textbox', { name: /título de la tarea/i }), 'Barrer terraza');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3
    await user.click(screen.getByRole('button', { name: /guardar tarea/i }));

    expect(screen.getByText('Barrer terraza')).toBeInTheDocument();
    expect(screen.getByText('Limpieza (4)')).toBeInTheDocument();
  });
});
