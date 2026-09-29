import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

    // 1. Estado inicial: 3 tareas visibles y contador Tareas (3)
    expect(screen.getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(screen.getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.getByText('Revisar recibos electricidad')).toBeInTheDocument();
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
    expect(screen.getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(screen.queryByText('Comprar bombilla LED')).not.toBeInTheDocument();
    expect(screen.queryByText('Revisar recibos electricidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(1\)/i })).toBeInTheDocument();

    // 7. Botón [Limpiar] visible en toolbar del Hub
    expect(screen.getByRole('button', { name: /filtrar \(1\)/i })).toBeInTheDocument();
    const clearBtn = screen.getByRole('button', { name: /limpiar filtros/i });
    expect(clearBtn).toBeInTheDocument();

    // 8. Pulsar [Limpiar]: Vuelven a aparecer todas las tareas
    await user.click(clearBtn);

    expect(screen.getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(screen.getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.getByText('Revisar recibos electricidad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(3\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument();
  });

  it('debe ocultar en caliente una tarea al completarla cuando el filtro SOLO_PENDIENTES está activo', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} initialTasks={mockTasksForApp} />);

    // 1. Abrir FilterModal
    await user.click(screen.getByRole('button', { name: /^filtrar/i }));

    // 2. Seleccionar Solo pendientes y Aplicar
    await user.click(screen.getByRole('button', { name: /solo pendientes/i }));
    await user.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    // 3. Se muestran las 2 pendientes
    expect(screen.getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(screen.getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.queryByText('Revisar recibos electricidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(2\)/i })).toBeInTheDocument();

    // 4. Completar en caliente 'Reparar caldera urgente'
    const checkbox = screen.getByRole('checkbox', { name: /completar tarea reparar caldera urgente/i });
    await user.click(checkbox);

    // 5. Debe desaparecer inmediatamente de la vista
    expect(screen.queryByText('Reparar caldera urgente')).not.toBeInTheDocument();
    expect(screen.getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tareas \(1\)/i })).toBeInTheDocument();

    // 6. Restaurar filtros con [Limpiar] para volver a ver todas
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(screen.getByText('Reparar caldera urgente')).toBeInTheDocument();
    expect(screen.getByText('Comprar bombilla LED')).toBeInTheDocument();
    expect(screen.getByText('Revisar recibos electricidad')).toBeInTheDocument();
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
});



