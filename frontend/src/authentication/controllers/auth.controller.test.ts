import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthController } from './auth.controller';
import { AuthService, InvalidCredentialsError } from '../services/auth.service';
import { ThrottlerService, TooManyRequestsError } from '../services/throttler.service';
import { UsersService } from '../../users/services/users.service';
import { UserEntity } from '../../users/entities/user.entity';

describe('PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling)', () => {
  let mockUsersService: UsersService;
  let throttlerService: ThrottlerService;
  let authService: AuthService;
  let authController: AuthController;

  const validPassword = 'Password123!';
  let passwordHash: string;
  const existingUser: UserEntity = {
    id: 'user-uuid-1234',
    email: 'carlos@example.com',
    passwordHash: '',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    passwordHash = await bcrypt.hash(validPassword, 4); // Coste bajo para velocidad de test
    existingUser.passwordHash = passwordHash;

    mockUsersService = {
      findByEmail: vi.fn(async (email: string) => {
        if (email.trim().toLowerCase() === existingUser.email) {
          return existingUser;
        }
        return null;
      }),
    } as unknown as UsersService;

    throttlerService = new ThrottlerService();
    authService = new AuthService(mockUsersService);
    authController = new AuthController(authService, throttlerService);
  });

  describe('Caso Forense VV-001 · Autenticación Exitosa y Cookie HttpOnly', () => {
    it('debe autenticar credenciales válidas devolviendo 200 OK y Set-Cookie con todos los flags de seguridad obligatorios', async () => {
      const response = await authController.login({
        email: 'carlos@example.com',
        password: validPassword,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toEqual({
        id: existingUser.id,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      });
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');

      const setCookie = response.headers['Set-Cookie'];
      expect(setCookie).toBeDefined();

      // Verificación estricta del Caso Forense VV-001
      expect(setCookie).toContain(`session_token=${response.body.token}`);
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Secure');
      expect(setCookie).toContain('SameSite=Strict');
      expect(setCookie).toContain('Path=/');
      expect(setCookie).toContain('Max-Age=86400');
    });
  });

  describe('Anti-Enumeración de Usuarios (OWASP)', () => {
    it('debe lanzar InvalidCredentialsError (401) con mensaje genérico si el email no existe', async () => {
      await expect(
        authController.login({
          email: 'no-existe@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidCredentialsError);

      try {
        await authController.login({
          email: 'no-existe@example.com',
          password: 'Password123!',
        });
      } catch (err: unknown) {
        const error = err as InvalidCredentialsError;
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Credenciales incorrectas');
      }
    });

    it('debe lanzar exactamente el mismo InvalidCredentialsError (401) si el email existe pero la contraseña es errónea', async () => {
      await expect(
        authController.login({
          email: 'carlos@example.com',
          password: 'WrongPassword999!',
        })
      ).rejects.toThrow(InvalidCredentialsError);

      try {
        await authController.login({
          email: 'carlos@example.com',
          password: 'WrongPassword999!',
        });
      } catch (err: unknown) {
        const error = err as InvalidCredentialsError;
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Credenciales incorrectas');
      }
    });
  });

  describe('Throttling y Rate Limiting (PVF-A02.04)', () => {
    it('debe bloquear con TooManyRequestsError (429) tras 5 intentos fallidos consecutivos', async () => {
      const credentials = {
        email: 'carlos@example.com',
        password: 'BadPassword!',
      };

      // Ejecutar 5 intentos fallidos permitidos
      for (let i = 1; i <= 5; i++) {
        await expect(authController.login(credentials)).rejects.toThrow(InvalidCredentialsError);
      }

      // El 6º intento consecutivo debe ser bloqueado por el Throttler
      await expect(authController.login(credentials)).rejects.toThrow(TooManyRequestsError);

      try {
        await authController.login(credentials);
      } catch (err: unknown) {
        const error = err as TooManyRequestsError;
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe('Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos');
        expect(error.retryAfterSeconds).toBeGreaterThan(0);
        expect(error.retryAfterSeconds).toBeLessThanOrEqual(900);
      }
    });

    it('debe resetear el contador de intentos fallidos al realizar una autenticación exitosa', async () => {
      const badCredentials = {
        email: 'carlos@example.com',
        password: 'BadPassword!',
      };
      const goodCredentials = {
        email: 'carlos@example.com',
        password: validPassword,
      };

      // 3 intentos fallidos
      for (let i = 0; i < 3; i++) {
        await expect(authController.login(badCredentials)).rejects.toThrow(InvalidCredentialsError);
      }

      // Intento exitoso
      const successResponse = await authController.login(goodCredentials);
      expect(successResponse.statusCode).toBe(200);

      // Comprobar que el contador se reseteó
      const throttleKey = `127.0.0.1_carlos@example.com`;
      expect(throttlerService.getFailedAttempts(throttleKey)).toBe(0);
    });
  });

  describe('Cierre de Sesión Seguro (PVF-A02.05 - Logout)', () => {
    it('debe realizar logout exitoso emitiendo cookie con Max-Age=0 y purgando la sesión activa', async () => {
      const loginResponse = await authController.login({
        email: 'carlos@example.com',
        password: validPassword,
      });
      const sessionToken = loginResponse.body.token;

      expect(authService.getActiveSessionsCount()).toBe(1);

      const logoutResponse = await authController.logout(sessionToken);

      expect(logoutResponse.statusCode).toBe(200);
      expect(logoutResponse.headers['Set-Cookie']).toContain('Max-Age=0');
      expect(logoutResponse.headers['Set-Cookie']).toContain('HttpOnly');
      expect(logoutResponse.headers['Set-Cookie']).toContain('SameSite=Strict');
      expect(authService.getActiveSessionsCount()).toBe(0);
    });
  });
});

