import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App Root Integration (Flujo de Sesión y Acceso UI)', () => {
  it('debe renderizar la pantalla de Login con pestañas [Iniciar Sesión] y [Crear Cuenta] cuando no hay sesión activa', () => {
    render(<App initialAuthenticated={false} />);

    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('debe conmutar y mostrar visiblemente el botón [Crear Cuenta] y el formulario de registro al seleccionar la pestaña', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={false} />);

    const registerTab = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTab);

    expect(registerTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /^crear cuenta$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('debe mostrar el WorkspaceLayout cuando la sesión está autenticada', () => {
    render(<App initialAuthenticated={true} />);

    expect(screen.getByText(/^centra-t$/i)).toBeInTheDocument();
    expect(screen.getByText(/usuario centra-t/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(0\)/i })).toBeInTheDocument();
  });

  it('debe renderizar MonthlyCalendarGrid en el workbench al estar autenticado', () => {
    render(<App initialAuthenticated={true} />);

    expect(screen.getByRole('region', { name: /calendario mensual/i })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /cuadrícula del mes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir al mes actual|hoy/i })).toBeInTheDocument();
  });

  it('debe devolver al usuario a LoginPage al pulsar Cerrar Sesión en el Workspace', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} />);

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('debe transicionar automáticamente al Workspace y guardar sesión tras registro exitoso', async () => {
    const user = userEvent.setup();
    render(<App />);

    const registerTab = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTab);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena.app@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /^crear cuenta$/i }));

    await waitFor(() => {
      expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem('centrat_auth')).toBe('true');
  });

  it('debe montar directamente el Workspace si existe una sesión previa en sessionStorage (recarga/F5)', () => {
    window.sessionStorage.setItem('centrat_auth', 'true');
    render(<App />);

    expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it('debe completar el flujo interactivo integral: Registro -> Workspace -> Logout -> Login exitoso con credenciales', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Registro
    const registerTab = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTab);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'carlos.flow@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'SecurePass123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /^crear cuenta$/i }));

    // 2. Llegada a Workspace
    await waitFor(() => {
      expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    });

    // 3. Logout
    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    // 4. Vuelta a LoginPage y verificación de sesión purgada
    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(window.sessionStorage.getItem('centrat_auth')).toBeNull();

    // 5. Login con las credenciales registradas
    await user.type(screen.getByLabelText(/correo electrónico/i), 'carlos.flow@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'SecurePass123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // 6. Acceso garantizado de nuevo al Workspace
    await waitFor(() => {
      expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem('centrat_auth')).toBe('true');
  });

  it('debe permitir login directo con las credenciales demo preconfiguradas (elena@centrat.local / Password123!)', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={false} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem('centrat_auth')).toBe('true');
  });

  it('debe rechazar con error credenciales erróneas para el usuario demo', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={false} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'ContrasenaIncorrecta123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciales incorrectas/i);
    });
    expect(screen.queryByRole('main', { name: /lienzo de trabajo/i })).not.toBeInTheDocument();
  });
});

describe('App Root Integration - Filtrado Reactivo y Reordenación en Caliente (RV-A06)', () => {
  const mockTasksForApp = [
    {
      id: 'task-app-1',
      userId: 'usr-1',
      modulo: 'tasks' as const,
      titulo: 'Reparar caldera urgente',
      descripcion: 'Falla la presión',
      prioridad: 'alta' as const,
      completado: false,
      fechaProgramada: new Date('2026-10-01T10:00:00Z'),
      createdAt: new Date('2026-09-01T08:00:00Z'),
      updatedAt: new Date('2026-09-01T08:00:00Z'),
    },
    {
      id: 'task-app-2',
      userId: 'usr-1',
      modulo: 'tasks' as const,
      titulo: 'Comprar bombilla LED',
      descripcion: 'Para el pasillo',
      prioridad: 'baja' as const,
      completado: false,
      fechaProgramada: new Date('2026-10-15T10:00:00Z'),
      createdAt: new Date('2026-09-02T08:00:00Z'),
      updatedAt: new Date('2026-09-02T08:00:00Z'),
    },
    {
      id: 'task-app-3',
      userId: 'usr-1',
      modulo: 'tasks' as const,
      titulo: 'Revisar recibos electricidad',
      descripcion: 'Facturas pendientes',
      prioridad: 'media' as const,
      completado: true,
      fechaProgramada: new Date('2026-10-05T10:00:00Z'),
      createdAt: new Date('2026-09-03T08:00:00Z'),
      updatedAt: new Date('2026-09-03T08:00:00Z'),
    },
  ];

  it('debe filtrar tareas por prioridad desde la interfaz real y restaurarlas con [Limpiar]', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} initialTasks={mockTasksForApp} />);

    const hub = screen.getByRole('complementary', { name: /hub lateral/i });

    // 1. Estado inicial: 3 tareas visibles y contador Tareas (3)
    expect(within(hub).getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(within(hub).getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(within(hub).getByText('Revisar recibos electricidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(3\)/i })).toBeInTheDocument();

    // 2. Abrir FilterModal haciendo clic en [Filtrar]
    const filterBtn = screen.getByRole('button', { name: /^filtrar/i });
    await user.click(filterBtn);

    // 3. Modal abierto con título y controles
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Filtros Combinados')).toBeInTheDocument();

    // 4. Seleccionar Prioridad Alta
    const altaBtn = screen.getByRole('button', { name: /^alta$/i });
    await user.click(altaBtn);
    expect(altaBtn).toHaveAttribute('aria-pressed', 'true');

    // 5. Aplicar Filtros
    const applyBtn = screen.getByRole('button', { name: /aplicar filtros/i });
    await user.click(applyBtn);

    // 6. Tareas no-alta desaparecen de la pantalla en tiempo real
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(hub).getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(within(hub).queryByText('Comprar bombilla LED')).not.toBeInTheDocument();
    expect(within(hub).queryByText('Revisar recibos electricidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(1\)/i })).toBeInTheDocument();

    // 7. Botón [Limpiar] visible en toolbar del Hub
    expect(screen.getByRole('button', { name: /filtrar \(1\)/i })).toBeInTheDocument();
    const clearBtn = screen.getByRole('button', { name: /limpiar filtros/i });
    expect(clearBtn).toBeInTheDocument();

    // 8. Pulsar [Limpiar]: Vuelven a aparecer todas las tareas
    await user.click(clearBtn);

    expect(within(hub).getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(within(hub).getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(within(hub).getByText('Revisar recibos electricidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(3\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument();
  });

  it('debe ocultar en caliente una tarea al completarla cuando el filtro SOLO_PENDIENTES está activo', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} initialTasks={mockTasksForApp} />);

    const hub = screen.getByRole('complementary', { name: /hub lateral/i });

    // 1. Abrir FilterModal
    await user.click(screen.getByRole('button', { name: /^filtrar/i }));

    // 2. Seleccionar Solo pendientes y Aplicar
    await user.click(screen.getByRole('button', { name: /solo pendientes/i }));
    await user.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    // 3. Se muestran las 2 pendientes
    expect(within(hub).getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(within(hub).getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(within(hub).queryByText('Revisar recibos electricidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(2\)/i })).toBeInTheDocument();

    // 4. Completar en caliente 'Reparar caldera urgente'
    const checkbox = within(hub).getByRole('checkbox', { name: /completar tarea reparar caldera urgente/i });
    await user.click(checkbox);

    // 5. Debe desaparecer inmediatamente de la vista
    expect(within(hub).queryByText('Reparar caldera urgente')).not.toBeInTheDocument();
    expect(within(hub).getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(1\)/i })).toBeInTheDocument();

    // 6. Restaurar filtros con [Limpiar] para volver a ver todas
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(within(hub).getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(within(hub).getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(within(hub).getByText('Revisar recibos electricidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(3\)/i })).toBeInTheDocument();
  });

  it('debe reordenar las tareas interactivamente al abrir el menú [Reordenar] y seleccionar un criterio', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} initialTasks={mockTasksForApp} />);

    // Abrir popover de reordenación
    const sortBtn = screen.getByRole('button', { name: /reordenar/i });
    await user.click(sortBtn);

    expect(screen.getByRole('menu', { name: /opciones de ordenación/i })).toBeInTheDocument();

    // Seleccionar Nombre: A - Z
    await user.click(screen.getByRole('menuitemradio', { name: /nombre: a - z/i }));

    // El menú se cierra tras la selección
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Validar orden físico por orden alfabético
    const titles = screen.getAllByTestId('task-card-title').map((el) => el.textContent);
    expect(titles).toEqual([
      'Comprar bombilla LED',
      'Reparar caldera urgente',
      'Revisar recibos electricidad',
    ]);
  });

  it('programa una tarea en el calendario al arrastrarla desde el Hub y soltarla en una casilla de día (RV-A07 / FIA-A07.02)', async () => {
    const mockTasks = [
      {
        id: 'task-dnd-test',
        titulo: 'Instalar estantería salón',
        prioridad: 'alta' as const,
        completado: false,
        modulo: 'tasks' as const,
        descripcion: 'Para el salón',
        userId: 'usr-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaProgramada: null,
      },
    ];

    render(<App initialAuthenticated={true} initialTasks={mockTasks} />);

    // Verificar que la tarjeta existe en el Hub y es arrastrable
    const taskCard = screen.getByTestId('task-card-task-dnd-test');
    expect(taskCard).toHaveAttribute('draggable', 'true');

    // Simular dragStart y drop sobre la casilla con fireEvent (envuelto en act)
    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      dropEffect: 'none',
      effectAllowed: 'none',
    };

    fireEvent.dragStart(taskCard, { dataTransfer });

    // Obtener la casilla destino en el calendario (hoy es una fecha válida presente)
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const targetDate = `${y}-${m}-${d}`;

    const dropZone = screen.getByTestId(`calendar-drop-zone-${targetDate}`);
    expect(dropZone).toBeInTheDocument();

    fireEvent.drop(dropZone, { dataTransfer });

    // Verificar que la píldora aparece materializada en el calendario
    await waitFor(() => {
      const pill = screen.getByTestId('calendar-pill-task-dnd-test');
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent('Instalar estantería salón');
    });
  });

  it('[VV-002]: Arrastrar una tarea a una casilla de fecha pasada anula la operación, no crea la pastilla en el calendario y preserva la tarea intacta en el Hub (Decisión 1A)', async () => {
    const mockTasks = [
      {
        id: 'task-dnd-past-test',
        titulo: 'Reparar tejado pasado',
        prioridad: 'alta' as const,
        completado: false,
        modulo: 'tasks' as const,
        descripcion: 'Intento en fecha pasada',
        userId: 'usr-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaProgramada: null,
      },
    ];

    render(<App initialAuthenticated={true} initialTasks={mockTasks} />);

    // Verificar presencia de la tarjeta en el Hub
    const hub = screen.getByRole('complementary', { name: /hub lateral/i });
    const taskCard = within(hub).getByTestId('task-card-task-dnd-past-test');
    expect(taskCard).toBeInTheDocument();

    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      dropEffect: 'none',
      effectAllowed: 'none',
    };

    fireEvent.dragStart(taskCard, { dataTransfer });

    // Casilla de fecha pasada comprobable (día 1 del mes en curso, hoy es 29)
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const pastDate = `${y}-${m}-01`;

    const dropZone = screen.getByTestId(`calendar-drop-zone-${pastDate}`);
    expect(dropZone).toBeInTheDocument();

    // Comprobar que al sobrevolar se activa el bloqueo carmesí
    fireEvent.dragOver(dropZone, { dataTransfer });
    expect(dropZone).toHaveClass(/dropZonePastBlocked/);
    expect(dropZone).toHaveAttribute('data-drop-blocked', 'true');
    expect(dataTransfer.dropEffect).toBe('none');

    // Intentar soltar en la casilla pasada
    fireEvent.drop(dropZone, { dataTransfer });

    // La pastilla NO debe aparecer en el calendario (VV-002)
    expect(screen.queryByTestId('calendar-pill-task-dnd-past-test')).not.toBeInTheDocument();

    // La tarjeta permanece intacta en el Hub
    expect(within(hub).getByTestId('task-card-task-dnd-past-test')).toBeInTheDocument();
  });

  it('[VV-003]: Al mover una tarea ya fechada a una nueva fecha se abre el modal de conflicto y [Mantener fecha] conserva la fecha original (Decisión 4B)', async () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayIso = `${y}-${m}-${d}`;
    const nextDay = String(today.getDate() + 1).padStart(2, '0');
    const nextDayIso = `${y}-${m}-${nextDay}`;

    const mockTasks = [
      {
        id: 'task-conflict-1',
        titulo: 'Revisión cuadro eléctrico',
        prioridad: 'alta' as const,
        completado: false,
        modulo: 'tasks' as const,
        descripcion: 'Con fecha programada',
        userId: 'usr-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaProgramada: new Date(`${todayIso}T00:00:00`),
      },
    ];

    render(<App initialAuthenticated={true} initialTasks={mockTasks} />);

    // Verificar que la pastilla está inicialmente en la casilla de hoy
    expect(screen.getByTestId('calendar-pill-task-conflict-1')).toBeInTheDocument();

    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      dropEffect: 'none',
      effectAllowed: 'none',
    };

    // Arrastramos la pastilla desde el calendario
    const pill = screen.getByTestId('calendar-pill-task-conflict-1');
    fireEvent.dragStart(pill, { dataTransfer });

    // Soltamos en la casilla de mañana
    const nextDayZone = screen.getByTestId(`calendar-drop-zone-${nextDayIso}`);
    fireEvent.drop(nextDayZone, { dataTransfer });

    // Debe abrirse el modal de conflicto
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText('Conflicto de Programación')).toBeInTheDocument();
    expect(within(modal).getByText('Revisión cuadro eléctrico')).toBeInTheDocument();

    // Cancelar con [Mantener fecha]
    const cancelBtn = screen.getByRole('button', { name: /mantener fecha/i });
    fireEvent.click(cancelBtn);

    // Modal se cierra
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // La pastilla sigue en la casilla original (hoy) y no en mañana
    const todayDropZone = screen.getByTestId(`calendar-drop-zone-${todayIso}`);
    expect(within(todayDropZone).getByTestId('calendar-pill-task-conflict-1')).toBeInTheDocument();
  });

  it('[VV-003]: Al pulsar [Mover fecha] en el modal de conflicto se confirma la reasignación a la nueva casilla', async () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayIso = `${y}-${m}-${d}`;
    const nextDay = String(today.getDate() + 1).padStart(2, '0');
    const nextDayIso = `${y}-${m}-${nextDay}`;

    const mockTasks = [
      {
        id: 'task-conflict-confirm',
        titulo: 'Pintar habitación',
        prioridad: 'media' as const,
        completado: false,
        modulo: 'tasks' as const,
        descripcion: 'Mover a mañana',
        userId: 'usr-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fechaProgramada: new Date(`${todayIso}T00:00:00`),
      },
    ];

    render(<App initialAuthenticated={true} initialTasks={mockTasks} />);

    const dataTransferData: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dataTransferData[format] = data;
      },
      getData: (format: string) => dataTransferData[format] || '',
      dropEffect: 'none',
      effectAllowed: 'none',
    };

    const pill = screen.getByTestId('calendar-pill-task-conflict-confirm');
    fireEvent.dragStart(pill, { dataTransfer });

    const nextDayZone = screen.getByTestId(`calendar-drop-zone-${nextDayIso}`);
    fireEvent.drop(nextDayZone, { dataTransfer });

    // Confirmar pulsando [Mover fecha]
    const confirmBtn = screen.getByRole('button', { name: /mover fecha/i });
    fireEvent.click(confirmBtn);

    // Modal se cierra
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // La pastilla ahora se ha trasladado a la casilla de mañana
    await waitFor(() => {
      expect(within(nextDayZone).getByTestId('calendar-pill-task-conflict-confirm')).toBeInTheDocument();
    });
  });
});




