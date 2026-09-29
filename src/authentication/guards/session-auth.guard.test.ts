import { describe, it, expect, beforeEach } from 'vitest';
import { SessionAuthGuard, UnauthorizedSessionError, ExecutionContextLike } from './session-auth.guard';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users.service';

describe('SessionAuthGuard', () => {
  let authService: AuthService;
  let guard: SessionAuthGuard;

  beforeEach(() => {
    authService = new AuthService();
    guard = new SessionAuthGuard(authService);
  });

  it('debe rechazar con 401 si no hay objeto request ni cookies', () => {
    expect(() => guard.canActivate(null as unknown as ExecutionContextLike)).toThrow(UnauthorizedSessionError);
    try {
      guard.canActivate(null as unknown as ExecutionContextLike);
    } catch (err) {
      expect((err as UnauthorizedSessionError).statusCode).toBe(401);
      expect((err as UnauthorizedSessionError).message).toBe('Sesión no válida o expirada');
    }
  });

  it('debe rechazar con 401 si la cookie session_token no está presente', () => {
    const mockContext: ExecutionContextLike = {
      headers: { cookie: 'other_cookie=value' },
      cookies: {},
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedSessionError);
  });

  it('debe rechazar con 401 si el token no existe en el registro de sesiones activas', () => {
    const mockContext: ExecutionContextLike = {
      cookies: { session_token: 'uuid-no-existente' },
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedSessionError);
  });

  it('debe permitir el acceso e inyectar request.user cuando la cookie es válida', async () => {
    const usersService = new UsersService();
    await usersService.createUser({ email: 'usuario.guard@example.com', password: 'Password123!' });
    const authServiceWithUsers = new AuthService(usersService);
    const authGuard = new SessionAuthGuard(authServiceWithUsers);

    const loginResponse = await authServiceWithUsers.authenticate({
      email: 'usuario.guard@example.com',
      password: 'Password123!',
    });
    const validToken = loginResponse.body.token;

    const requestObj: any = {
      cookies: { session_token: validToken },
    };

    const allowed = authGuard.canActivate(requestObj);
    expect(allowed).toBe(true);
    expect(requestObj.user).toBeDefined();
    expect(requestObj.user.email).toBe('usuario.guard@example.com');
  });

  it('debe soportar extracción desde cabecera raw Cookie string', async () => {
    const usersService = new UsersService();
    await usersService.createUser({ email: 'usuario.header@example.com', password: 'Password123!' });
    const authServiceWithUsers = new AuthService(usersService);
    const authGuard = new SessionAuthGuard(authServiceWithUsers);

    const loginResponse = await authServiceWithUsers.authenticate({
      email: 'usuario.header@example.com',
      password: 'Password123!',
    });
    const validToken = loginResponse.body.token;

    const mockContext: ExecutionContextLike = {
      headers: {
        cookie: `unrelated=123; session_token=${validToken}; other=456`,
      },
    };

    const allowed = authGuard.canActivate(mockContext);
    expect(allowed).toBe(true);
    expect(mockContext.user?.email).toBe('usuario.header@example.com');
  });

  it('debe rechazar con 401 si el token ha sido revocado mediante logout', async () => {
    const usersService = new UsersService();
    await usersService.createUser({ email: 'usuario.revocado@example.com', password: 'Password123!' });
    const authServiceWithUsers = new AuthService(usersService);
    const authGuard = new SessionAuthGuard(authServiceWithUsers);

    const loginResponse = await authServiceWithUsers.authenticate({
      email: 'usuario.revocado@example.com',
      password: 'Password123!',
    });
    const validToken = loginResponse.body.token;

    // Verificar que antes de logout es válido
    const mockContext: any = { cookies: { session_token: validToken } };
    expect(authGuard.canActivate(mockContext)).toBe(true);

    // Ejecutar revocación
    authServiceWithUsers.revokeSession(validToken);

    // Verificar que tras revocación arroja 401
    expect(() => authGuard.canActivate(mockContext)).toThrow(UnauthorizedSessionError);
  });
});
