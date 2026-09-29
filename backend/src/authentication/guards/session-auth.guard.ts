import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.['centrat_session'] ||
      this.extractBearerToken(request.headers?.['authorization']);

    if (!token) {
      throw new UnauthorizedException('Sesión no válida o expirada');
    }

    const session = await this.authService.validateOrRestoreSessionToken(token);
    if (!session) {
      throw new UnauthorizedException('Sesión no válida o expirada');
    }

    request.user = session;
    return true;
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}
