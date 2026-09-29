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


