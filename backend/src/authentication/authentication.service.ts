import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthenticationService {
  // Almacén seguro de sesiones de servidor
  private readonly activeSessions = new Map<string, AuthSession>();

  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<{ user: AuthSession; sessionToken: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const sessionToken = this.createSessionToken(user.id, user.email, user.name);
    return {
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      sessionToken,
    };
  }

  async login(dto: LoginDto): Promise<{ user: AuthSession; sessionToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const sessionToken = this.createSessionToken(user.id, user.email, user.name);
    return {
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      sessionToken,
    };
  }

  validateSessionToken(token: string): AuthSession | null {
    if (!token) return null;
    return this.activeSessions.get(token) || null;
  }

  async validateOrRestoreSessionToken(token: string): Promise<AuthSession | null> {
    if (!token) return null;
    const cached = this.activeSessions.get(token);
    if (cached) return cached;

    // Si el servidor se reinició, restaurar la sesión a partir del userId y PostgreSQL
    const match = token.match(/^centrat_sess_([0-9a-fA-F-]+)_[a-z0-9]+$/);
    if (match) {
      try {
        const user = await this.usersService.findById(match[1]);
        if (user) {
          const session: AuthSession = { userId: user.id, email: user.email, name: user.name };
          this.activeSessions.set(token, session);
          return session;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  revokeSession(token: string): void {
    if (token) {
      this.activeSessions.delete(token);
    }
  }

  private createSessionToken(userId: string, email: string, name: string): string {
    const randomPart = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const token = `centrat_sess_${userId}_${randomPart}`;
    this.activeSessions.set(token, { userId, email, name });
    return token;
  }
}
