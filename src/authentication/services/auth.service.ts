import bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { LoginCredentialsDto } from '../dto/login-credentials.dto';
import { AuthHttpResponse } from '../dto/auth-response.dto';

export class InvalidCredentialsError extends Error {
  readonly statusCode = 401;
  constructor(message = 'Credenciales incorrectas') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class AuthService {
  constructor(private usersService: UsersService = new UsersService()) {}

  async authenticate(dto: LoginCredentialsDto): Promise<AuthHttpResponse> {
    const normalizedEmail = dto.email ? dto.email.trim().toLowerCase() : '';
    const user = await this.usersService.findByEmail(normalizedEmail);

    // Prevención de enumeración: comprobación de existencia y comparación de hash
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Caso Forense VV-001: Sesión segura con token y cookie HttpOnly
    const sessionToken = crypto.randomUUID();
    const setCookieHeader = `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': setCookieHeader,
      },
      body: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token: sessionToken,
      },
    };
  }
}
