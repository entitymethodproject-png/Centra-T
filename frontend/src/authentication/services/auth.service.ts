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

export interface SessionData {
  userId: string;
  email: string;
  createdAt: number;
}

export interface AuthLogoutResponse {
  statusCode: number;
  headers: {
    'Set-Cookie': string;
  };
  body: {
    message: string;
  };
}

export class AuthService {
  private activeSessions = new Map<string, SessionData>();

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

    // Registrar sesión activa en memoria
    this.activeSessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
    });

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

  validateSession(token: string): SessionData | null {
    if (!token) return null;
    return this.activeSessions.get(token) || null;
  }

  revokeSession(token: string): boolean {
    if (!token) return false;
    return this.activeSessions.delete(token);
  }

  logout(token?: string): AuthLogoutResponse {
    if (token) {
      this.revokeSession(token);
    }
    const purgeCookieHeader =
      'session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': purgeCookieHeader,
      },
      body: {
        message: 'Sesión cerrada correctamente',
      },
    };
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }
}
