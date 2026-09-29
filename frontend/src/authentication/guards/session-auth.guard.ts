import { AuthService } from '../services/auth.service';

export class UnauthorizedSessionError extends Error {
  readonly statusCode = 401;
  constructor(message = 'Sesión no válida o expirada') {
    super(message);
    this.name = 'UnauthorizedSessionError';
  }
}

export interface RequestWithCookies {
  headers?: {
    cookie?: string;
    [key: string]: unknown;
  };
  cookies?: Record<string, string>;
  user?: { id: string; email: string };
  [key: string]: unknown;
}

export interface ExecutionContextLike {
  switchToHttp?: () => {
    getRequest: () => RequestWithCookies;
  };
  headers?: {
    cookie?: string;
    [key: string]: unknown;
  };
  cookies?: Record<string, string>;
  user?: { id: string; email: string };
  [key: string]: unknown;
}

export class SessionAuthGuard {
  constructor(private authService: AuthService = new AuthService()) {}

  canActivate(context: ExecutionContextLike): boolean {
    const request: RequestWithCookies = context?.switchToHttp
      ? context.switchToHttp().getRequest()
      : (context as RequestWithCookies);

    if (!request) {
      throw new UnauthorizedSessionError();
    }

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedSessionError();
    }

    const session = this.authService.validateSession(token);
    if (!session) {
      throw new UnauthorizedSessionError();
    }

    request.user = { id: session.userId, email: session.email };
    return true;
  }

  private extractToken(request: RequestWithCookies): string | null {
    // 1. Extraer desde objeto cookies si está presente
    if (request.cookies && request.cookies['session_token']) {
      return request.cookies['session_token'];
    }

    // 2. Extraer desde cabecera raw Cookie
    const cookieHeader = request.headers?.['cookie'] || request.headers?.cookie;
    if (typeof cookieHeader === 'string') {
      const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
