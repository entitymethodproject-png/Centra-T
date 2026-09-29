import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

describe('AuthenticationService (NestJS HttpOnly Sessions)', () => {
  let authService: AuthenticationService;
  let mockUsersService: Partial<UsersService>;

  beforeEach(() => {
    mockUsersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    authService = new AuthenticationService(mockUsersService as UsersService);
  });

  it('debe autenticar credenciales correctas y emitir un token de sesión seguro', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const mockUser = {
      id: 'usr-1',
      email: 'elena@centrat.local',
      passwordHash,
      name: 'Elena',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockUsersService.findByEmail as any).mockResolvedValue(mockUser);

    const { user, sessionToken } = await authService.login({
      email: 'elena@centrat.local',
      password: 'Password123!',
    });

    expect(user.email).toBe('elena@centrat.local');
    expect(sessionToken).toBeDefined();
    expect(sessionToken.startsWith('centrat_sess_')).toBe(true);

    const session = authService.validateSessionToken(sessionToken);
    expect(session).toBeDefined();
    expect(session?.userId).toBe('usr-1');
  });

  it('debe lanzar UnauthorizedException si la contraseña no coincide', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
    (mockUsersService.findByEmail as any).mockResolvedValue({
      id: 'usr-1',
      email: 'elena@centrat.local',
      passwordHash,
      name: 'Elena',
    });

    await expect(
      authService.login({ email: 'elena@centrat.local', password: 'WrongPassword!' })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe permitir revocar una sesión activa en logout', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    (mockUsersService.findByEmail as any).mockResolvedValue({
      id: 'usr-1',
      email: 'elena@centrat.local',
      passwordHash,
      name: 'Elena',
      createdAt: new Date(),
    });

    const { sessionToken } = await authService.login({
      email: 'elena@centrat.local',
      password: 'Password123!',
    });

    expect(authService.validateSessionToken(sessionToken)).not.toBeNull();
    authService.revokeSession(sessionToken);
    expect(authService.validateSessionToken(sessionToken)).toBeNull();
  });

  it('debe registrar un nuevo usuario y emitir token de sesión', async () => {
    (mockUsersService.findByEmail as any).mockResolvedValue(null);
    (mockUsersService.create as any).mockResolvedValue({
      id: 'usr-new-1',
      email: 'nuevo@centrat.local',
      passwordHash: 'hashed',
      name: 'Nuevo Usuario',
    });

    const { user, sessionToken } = await authService.register({
      email: 'nuevo@centrat.local',
      password: 'password123',
      name: 'Nuevo Usuario',
    });

    expect(user.userId).toBe('usr-new-1');
    expect(user.email).toBe('nuevo@centrat.local');
    expect(sessionToken.startsWith('centrat_sess_')).toBe(true);
  });

  it('debe restaurar la sesión desde base de datos si el servidor se reinició', async () => {
    mockUsersService.findById = vi.fn().mockResolvedValue({
      id: 'usr-persistent-1',
      email: 'persistent@centrat.local',
      name: 'Persistent User',
    });

    // Token simulando reinicio (no está en la memoria del Map)
    const token = 'centrat_sess_usr-persistent-1_random123abc';
    const restored = await authService.validateOrRestoreSessionToken(token);

    expect(restored).not.toBeNull();
    expect(restored?.userId).toBe('usr-persistent-1');
    expect(restored?.email).toBe('persistent@centrat.local');
    expect(mockUsersService.findById).toHaveBeenCalledWith('usr-persistent-1');
  });

  it('debe permitir restablecer la contraseña e iniciar sesión directamente', async () => {
    const existingUser = {
      id: 'usr-reset-1',
      email: 'olvidadizo@centrat.local',
      name: 'Usuario',
      passwordHash: 'oldhash',
    };
    (mockUsersService.findByEmail as any).mockResolvedValue(existingUser);
    mockUsersService.save = vi.fn().mockResolvedValue(existingUser);

    const { user, sessionToken } = await authService.resetPassword('olvidadizo@centrat.local', 'nuevaPassword123');

    expect(user.userId).toBe('usr-reset-1');
    expect(sessionToken.startsWith('centrat_sess_')).toBe(true);
    expect(mockUsersService.save).toHaveBeenCalled();
  });
});
