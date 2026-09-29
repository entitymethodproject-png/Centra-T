import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
// @ts-expect-error Service not yet implemented (TDD Fase RED)
import {
  UsersService,
  UserAlreadyExistsError,
  InvalidEmailError,
  WeakPasswordError,
} from './users.service';
// @ts-expect-error Repository not yet implemented (TDD Fase RED)
import { InMemoryUserRepository } from '../repositories/user.repository';

describe('PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users)', () => {
  let userRepository: InMemoryUserRepository;
  let usersService: UsersService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    usersService = new UsersService(userRepository);
  });

  it('debe registrar un usuario exitosamente con email normalizado y password hasheada con bcrypt', async () => {
    const inputDto = {
      email: '  Usuario.Test@Example.COM  ',
      password: 'Password123!',
    };

    const result = await usersService.createUser(inputDto);

    // 1. Verificación de DTO saneado
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.email).toBe('usuario.test@example.com');
    expect(result.createdAt).toBeInstanceOf(Date);

    // 2. Anti-Leak: NO debe exponer passwordHash ni password
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('password');

    // 3. Verificación de persistencia interna y hash
    const savedUser = await usersService.findByEmail('usuario.test@example.com');
    expect(savedUser).not.toBeNull();
    expect(savedUser?.passwordHash).toBeDefined();
    expect(savedUser?.passwordHash).not.toBe('Password123!');

    const isMatch = await bcrypt.compare('Password123!', savedUser!.passwordHash);
    expect(isMatch).toBe(true);
  });

  it('debe lanzar InvalidEmailError (400) si el email no cumple RFC 5322 o tiene longitud inválida', async () => {
    const invalidEmails = [
      '',
      '   ',
      'a@b',
      'invalido',
      'user@',
      '@domain.com',
      'user@domain..com',
      'a'.repeat(125) + '@example.com',
    ];

    for (const email of invalidEmails) {
      await expect(
        usersService.createUser({
          email,
          password: 'Password123!',
        })
      ).rejects.toThrow(InvalidEmailError);
    }
  });

  it('debe lanzar WeakPasswordError (400) si la contraseña no cumple la política de seguridad', async () => {
    const weakPasswords = [
      '',
      'Short1!', // Menos de 8 caracteres
      'password123!', // Sin mayúscula
      'PASSWORD123!', // Sin minúscula
      'Password!!!!', // Sin número
      'Password1234', // Sin símbolo
    ];

    for (const password of weakPasswords) {
      await expect(
        usersService.createUser({
          email: 'valido@example.com',
          password,
        })
      ).rejects.toThrow(WeakPasswordError);
    }
  });

  it('debe lanzar UserAlreadyExistsError con statusCode 409 ante emails duplicados (insensible a mayúsculas)', async () => {
    await usersService.createUser({
      email: 'original@example.com',
      password: 'Password123!',
    });

    const duplicateAttempts = [
      'original@example.com',
      'ORIGINAL@EXAMPLE.COM',
      '  original@example.com  ',
    ];

    for (const duplicateEmail of duplicateAttempts) {
      try {
        await usersService.createUser({
          email: duplicateEmail,
          password: 'AnotherPassword456!',
        });
        expect.fail('Debería haber lanzado UserAlreadyExistsError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(UserAlreadyExistsError);
        expect(error.statusCode).toBe(409);
      }
    }
  });

  it('debe buscar usuario por ID correctamente en el repositorio', async () => {
    const created = await usersService.createUser({
      email: 'search@example.com',
      password: 'Password123!',
    });

    const foundById = await userRepository.findById(created.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.email).toBe('search@example.com');

    const notFound = await userRepository.findById('non-existent-id');
    expect(notFound).toBeNull();
  });
});
