import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterTab } from './RegisterTab';
import { UsersService, UserAlreadyExistsError } from '../../users/services/users.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';

describe('PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009)', () => {
  let mockUsersService: UsersService;
  let mockCreateUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUser = vi.fn();
    mockUsersService = {
      createUser: mockCreateUser,
    } as unknown as UsersService;
  });

  it('debe renderizar los campos obligatorios, labels WCAG AA y el botón de creación', () => {
    render(<RegisterTab usersService={mockUsersService} />);

    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('debe bloquear el envío y mostrar error inline cuando las contraseñas no coinciden (Caso Forense VV-009)', async () => {
    const user = userEvent.setup();
    render(<RegisterTab usersService={mockUsersService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password999!');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('debe mostrar error inline si el formato del correo electrónico es inválido', async () => {
    const user = userEvent.setup();
    render(<RegisterTab usersService={mockUsersService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'email-invalido');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(screen.getByText(/formato de email no válido/i)).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('debe mostrar error inline si la contraseña no cumple los requisitos mínimos de seguridad', async () => {
    const user = userEvent.setup();
    render(<RegisterTab usersService={mockUsersService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'valid@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'debil');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'debil');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(screen.getByText(/la contraseña no cumple los requisitos mínimos de seguridad/i)).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('debe deshabilitar inputs y botón mostrando estado de carga durante el registro', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: UserResponseDto) => void;
    mockCreateUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );

    render(<RegisterTab usersService={mockUsersService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'carlos@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'SecurePass123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'SecurePass123!');

    const submitBtn = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitBtn);

    expect(screen.getByText(/creando cuenta\.\.\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeDisabled();
    expect(screen.getByLabelText(/^contraseña/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /creando cuenta\.\.\./i })).toBeDisabled();

    // Resolver la promesa para limpiar el test
    resolveCreate!({
      id: 'usr-1',
      email: 'carlos@example.com',
      createdAt: new Date(),
    });

    await waitFor(() => {
      expect(screen.getByText(/cuenta creada correctamente/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar alerta global si el usuario ya existe (Error 409 UserAlreadyExistsError)', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockRejectedValue(new UserAlreadyExistsError('duplicado@example.com'));

    render(<RegisterTab usersService={mockUsersService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'duplicado@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/no ha sido posible completar el registro\. compruebe los datos o intente iniciar sesión/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('debe invocar onSuccess tras un registro exitoso con datos válidos', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();
    const createdUser: UserResponseDto = {
      id: 'usr-valid-123',
      email: 'nuevo@example.com',
      createdAt: new Date(),
    };
    mockCreateUser.mockResolvedValue(createdUser);

    render(<RegisterTab usersService={mockUsersService} onSuccess={onSuccessMock} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'nuevo@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledWith(createdUser);
    });
    expect(screen.getByText(/cuenta creada correctamente\. redirigiendo\.\.\./i)).toBeInTheDocument();
  });

  it('debe invocar onSwitchToLogin al hacer clic en el enlace de inicio de sesión', async () => {
    const user = userEvent.setup();
    const onSwitchMock = vi.fn();

    render(<RegisterTab usersService={mockUsersService} onSwitchToLogin={onSwitchMock} />);

    const switchBtn = screen.getByRole('button', { name: /inicia sesión/i });
    expect(switchBtn).toBeInTheDocument();

    await user.click(switchBtn);
    expect(onSwitchMock).toHaveBeenCalledTimes(1);
  });
});
