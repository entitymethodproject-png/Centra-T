import { AuthService, AuthLogoutResponse } from '../services/auth.service';
import { ThrottlerService } from '../services/throttler.service';
import { LoginCredentialsDto } from '../dto/login-credentials.dto';
import { AuthHttpResponse } from '../dto/auth-response.dto';

export class AuthController {
  constructor(
    private authService: AuthService = new AuthService(),
    private throttlerService: ThrottlerService = new ThrottlerService()
  ) {}

  async login(dto: LoginCredentialsDto, clientIp = '127.0.0.1'): Promise<AuthHttpResponse> {
    const throttleKey = `${clientIp}_${dto.email ? dto.email.trim().toLowerCase() : ''}`;

    // Paso 1: Verificar si el cliente está bloqueado por fuerza bruta
    this.throttlerService.checkBlocked(throttleKey);

    try {
      // Paso 2: Intentar autenticación
      const response = await this.authService.authenticate(dto);

      // Paso 3: Éxito -> limpiar contador de throttling
      this.throttlerService.recordSuccess(throttleKey);

      return response;
    } catch (err) {
      // Paso 4: Fallo -> registrar intento en Throttler
      this.throttlerService.recordFailure(throttleKey);
      throw err;
    }
  }

  async logout(sessionToken?: string): Promise<AuthLogoutResponse> {
    return this.authService.logout(sessionToken);
  }
}
