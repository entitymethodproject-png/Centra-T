import bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { IUserRepository, InMemoryUserRepository } from '../repositories/user.repository';

export class UserAlreadyExistsError extends Error {
  readonly statusCode = 409;
  constructor(email: string) {
    super(`El usuario con el email '${email}' ya existe`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidEmailError extends Error {
  readonly statusCode = 400;
  constructor(message = 'Formato de email no válido') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}

export class WeakPasswordError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La contraseña no cumple los requisitos mínimos de seguridad') {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

const RFC_5322_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export class UsersService {
  private static readonly SALT_ROUNDS = 12;

  constructor(private userRepository: IUserRepository = new InMemoryUserRepository()) {}

  static validateEmail(email: string): string {
    const trimmed = email ? email.trim() : '';
    if (trimmed.length < 5 || trimmed.length > 120 || !RFC_5322_EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailError();
    }
    return trimmed.toLowerCase();
  }

  static validatePassword(password: string): void {
    if (!password || password.length < 8 || password.length > 128) {
      throw new WeakPasswordError();
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      throw new WeakPasswordError();
    }
  }

  async createUser(dto: RegisterUserDto): Promise<UserResponseDto> {
    const normalizedEmail = UsersService.validateEmail(dto.email);
    UsersService.validatePassword(dto.password);

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    const passwordHash = await bcrypt.hash(dto.password, UsersService.SALT_ROUNDS);
    const now = new Date();

    const newUser: UserEntity = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    const savedUser = await this.userRepository.save(newUser);

    return {
      id: savedUser.id,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.userRepository.findByEmail(normalizedEmail);
  }
}
