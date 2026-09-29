import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  });

  it('debe devolver al usuario a LoginPage al pulsar Cerrar Sesión en el Workspace', async () => {
    const user = userEvent.setup();
    render(<App initialAuthenticated={true} />);

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toBeInTheDocument();
  });
});
