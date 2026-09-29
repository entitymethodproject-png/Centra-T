import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CleaningAccordion } from './CleaningAccordion';
import { CleaningItem } from '../../cleaning/entities/cleaning-item.entity';

describe('CleaningAccordion Component (Telemetría e Integración en Hub)', () => {
  const mockItems: CleaningItem[] = [
    {
      id: 'clean-1',
      userId: 'usr-1',
      modulo: 'cleaning',
      nombre: 'Fregar suelo cocina',
      zona: 'cocina',
      frecuencia: 'semanal',
      completado: false,
      lastCompletedAt: null,
      proximaFechaSugerida: new Date(),
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'clean-2',
      userId: 'usr-1',
      modulo: 'cleaning',
      nombre: 'Desinfectar ducha',
      zona: 'baño',
      frecuencia: 'quincenal',
      completado: true,
      lastCompletedAt: new Date(),
      proximaFechaSugerida: new Date(),
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'clean-3',
      userId: 'usr-1',
      modulo: 'cleaning',
      nombre: 'Aspirar alfombra salón',
      zona: 'salon',
      frecuencia: 'semanal',
      completado: false,
      lastCompletedAt: null,
      proximaFechaSugerida: new Date(),
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('1. debe renderizar la cabecera con ratio exacto (2 pend / 3 tot) y badge de pendientes', () => {
    render(<CleaningAccordion items={mockItems} />);

    expect(screen.getByRole('button', { name: /limpieza \(2 pend \/ 3 tot\)/i })).toBeInTheDocument();
    expect(screen.getByTestId('cleaning-pending-badge')).toHaveTextContent('2 pendientes');
  });

  it('2. debe colapsar y expandir el contenido al pulsar la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();

    render(<CleaningAccordion items={mockItems} onToggleExpand={handleExpand} />);

    const header = screen.getByRole('button', { name: /limpieza \(2 pend \/ 3 tot\)/i });
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

  it('3. debe filtrar reactivamente las tareas por zona al pulsar los chips semánticos', async () => {
    const user = userEvent.setup();
    render(<CleaningAccordion items={mockItems} />);

    // Inicialmente todas visibles
    expect(screen.getByText('Fregar suelo cocina')).toBeInTheDocument();
    expect(screen.getByText('Desinfectar ducha')).toBeInTheDocument();
    expect(screen.getByText('Aspirar alfombra salón')).toBeInTheDocument();

    // Filtrar por Cocina
    await user.click(screen.getByTestId('cleaning-chip-cocina'));
    expect(screen.getByText('Fregar suelo cocina')).toBeInTheDocument();
    expect(screen.queryByText('Desinfectar ducha')).not.toBeInTheDocument();
    expect(screen.queryByText('Aspirar alfombra salón')).not.toBeInTheDocument();

    // Volver a Todas
    await user.click(screen.getByTestId('cleaning-chip-todas'));
    expect(screen.getByText('Desinfectar ducha')).toBeInTheDocument();
  });

  it('4. debe renderizar el Skeleton Screen de 3 líneas cuando isLoading=true', () => {
    render(<CleaningAccordion isLoading={true} />);
    expect(screen.getByTestId('cleaning-skeleton')).toBeInTheDocument();
  });

  it('5. debe renderizar Empty State sobrio cuando no hay tareas disponibles', () => {
    render(<CleaningAccordion items={[]} />);
    expect(screen.getByTestId('cleaning-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no hay tareas de limpieza/i)).toBeInTheDocument();
  });

  it('6. debe abrir el modal de creación al pulsar [+ Nueva Limpieza] sin colapsar el acordeón', async () => {
    const user = userEvent.setup();
    render(<CleaningAccordion items={mockItems} />);

    const createBtn = screen.getByTestId('cleaning-create-button');
    await user.click(createBtn);

    expect(screen.getByTestId('cleaning-creation-modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpieza \(2 pend \/ 3 tot\)/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('7. debe incorporar nueva tarea creada e incrementar los contadores de la cabecera', async () => {
    const user = userEvent.setup();
    render(<CleaningAccordion items={mockItems} />);

    await user.click(screen.getByTestId('cleaning-create-button'));

    await user.type(screen.getByTestId('cleaning-name-input'), 'Barrer terraza');
    await user.click(screen.getByTestId('cleaning-submit-button'));

    expect(screen.getByText('Barrer terraza')).toBeInTheDocument();
    // Ahora: total 4, pendientes 3 -> (3 pend / 4 tot)
    expect(screen.getByRole('button', { name: /limpieza \(3 pend \/ 4 tot\)/i })).toBeInTheDocument();
  });
});
