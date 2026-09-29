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
});
