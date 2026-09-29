import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { AuthController } from '../controllers/auth.controller';
import { InvalidCredentialsError } from '../services/auth.service';
import { TooManyRequestsError } from '../services/throttler.service';
import { UsersService } from '../../users/services/users.service';

describe('LoginPage Component', () => {
  it('debe renderizar la tarjeta de autenticación con pestañas y formulario de login por defecto', () => {
    render(<LoginPage />);

    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('debe cumplir con la Validación Empática: NO mostrar errores en el onChange inicial', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    // Escribir formato incompleto sin salir del foco
    await user.type(emailInput, 'usuario_incompleto');

    // Comprobar ausencia absoluta de errores mientras el campo tiene el foco
    expect(screen.queryByText(/formato de email no válido/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/el correo electrónico es obligatorio/i)).not.toBeInTheDocument();
    expect(emailInput).not.toHaveClass('inputError');
  });

  it('debe mostrar error inline al perder el foco (onBlur) con formato de email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'invalido');
    fireEvent.blur(emailInput);

    expect(screen.getByText(/formato de email no válido/i)).toBeInTheDocument();
  });

  it('debe mostrar error inline al perder el foco (onBlur) con campo vacío', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.blur(emailInput);

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/^contraseña/i);
    fireEvent.blur(passwordInput);

    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
  });

  it('debe validar en onSubmit y bloquear la llamada a login si los campos son inválidos', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('debe mostrar banner de alerta ante error 401 (Credenciales incorrectas)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new InvalidCredentialsError());
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'valido@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'WrongPassword123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciales incorrectas/i);
    });
  });

  it('debe mostrar banner de bloqueo ante error 429 (Demasiados intentos fallidos)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new TooManyRequestsError(900));
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'atacante@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/demasiados intentos fallidos/i);
    });
  });

  it('debe completar el login exitoso (Caso VV-001) e invocar onNavigateToWorkspace y onSuccess', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      statusCode: 200,
      headers: {
        'Set-Cookie': 'session_token=test-uuid; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400',
      },
      body: {
        user: { id: 'usr-1', email: 'elena@example.com', createdAt: new Date() },
        token: 'test-uuid',
      },
    });
    const mockController = { login: mockLogin } as unknown as AuthController;
    const mockNavigate = vi.fn();
    const mockSuccess = vi.fn();

    render(
      <LoginPage
        authController={mockController}
        onNavigateToWorkspace={mockNavigate}
        onSuccess={mockSuccess}
      />
    );

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'elena@example.com',
        password: 'Password123!',
      });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('debe conmutar reactivamente a la pestaña Crear Cuenta y montar RegisterTab', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const registerTabButton = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTabButton);

    expect(registerTabButton).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('debe invocar onNavigateToWorkspace y onSuccess tras registro exitoso en RegisterTab', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    const mockSuccess = vi.fn();
    const mockUsersService = {
      createUser: vi.fn().mockResolvedValue({
        id: 'usr-reg-1',
        email: 'nuevo@centrat.local',
        createdAt: new Date(),
      }),
    } as unknown as UsersService;

    render(
      <LoginPage
        usersService={mockUsersService}
        defaultTab="register"
        onNavigateToWorkspace={mockNavigate}
        onSuccess={mockSuccess}
      />
    );

    await user.type(screen.getByLabelText(/correo electrónico/i), 'nuevo@centrat.local');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledTimes(1);
    });
  });
});

