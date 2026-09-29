# SPEC-FIA-A02.05 · INVALIDACIÓN DE SESIÓN (LOGOUT) Y AUTHGUARD

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A02.05 · Invalidación de Sesión (Logout) y AuthGuard  
**PVF de Cierre:** PVF-A02.05 · Cierre de Sesión Seguro e Invalidación de Cookie  
**VF:** VF-A02.05 · Cierre de Sesión Seguro y Purga de Credenciales  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A02.04.md APROBADO (Commit: `ed76155`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Hito de Rebanada:** UNIDAD DE CIERRE Y CONSOLIDACIÓN DE RV-A02  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar la protección perimetral de rutas y la invalidación definitiva de sesiones en Centra-T para Antigravity CLI. Esta unidad abarca la creación del guard de autorización `SessionAuthGuard` en `src/authentication/guards/session-auth.guard.ts`, la ampliación de `AuthService` y `AuthController` para soportar el almacenamiento activo de sesiones en memoria, la validación estricta de cookies de sesión, el endpoint de revocación `POST /auth/logout` con emisión obligatoria de la cabecera `Set-Cookie` de purga inmediata (`Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`), y la verificación de la cláusula de escape ante fallos de red en el cliente. Esta es la última unidad de `RV-A02`, culminando la rebanada vertical completa de Autenticación.

## 2. Objetivo
Construir y verificar con TDD en tests unitarios y de integración:
1. `SessionAuthGuard` (`src/authentication/guards/session-auth.guard.ts`):
   - Extraer la cookie `session_token` desde `request.cookies` o desde la cabecera HTTP `Cookie`.
   - Validar la vigencia del token contra `AuthService.validateSession(token)`.
   - Inyectar en la petición la identidad del usuario autenticado: `request.user = { id: session.userId, email: session.email }`.
   - Si no existe cookie, el token es inválido o ha sido revocado, bloquear de inmediato con la excepción tipada `UnauthorizedSessionError` (HTTP 401: *"Sesión no válida o expirada"*).
2. Endpoint `logout` en `AuthController` y `AuthService`:
   - Revocar activamente el token del almacén del backend.
   - Responder con HTTP 200 OK y cabecera `Set-Cookie` de purga con los 5 flags mandatorios: `session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`.
3. Gestión del ciclo de vida de sesiones en memoria en `AuthService` (`activeSessions`).
4. Cláusula de escape para clientes: ante cualquier error en la red o caída del backend al cerrar sesión, garantizar la desautenticación local y la expulsión hacia `/auth/login`.
5. Batería de tests completa que certifique el 100% de la funcionalidad (mínimo 48-50 tests globales en verde).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A02.04_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - `src/users/entities/*`, `dto/*`, `repositories/*`, `services/*` (5 tests de dominio de usuarios)
  - `src/workspace/components/*`, `src/hub/components/*` (14 tests de layout y TopNavbar con botón logout)
  - `src/authentication/dto/*`, `services/auth.service.ts`, `services/throttler.service.ts`, `controllers/auth.controller.ts` (5 tests de controlador de auth y throttling)
  - `src/authentication/views/RegisterTab.*`, `views/LoginPage.*` (17 tests visuales: 8 de registro + 9 de login empático)
- **Estado de Tests Actual:** 41/41 tests pasando en verde en Vitest.
- **Riesgos Iniciales:** Acoplamiento a decoradores específicos de NestJS que requieran paquetes pesados `@nestjs/common` en un entorno ligero de testing. Se debe implementar `SessionAuthGuard` con una interfaz compatible con NestJS (`canActivate(context)`) capaz de ejecutarse nativamente en Vitest sin dependencias de runtime no instaladas.

## 4. Estado Objetivo
El repositorio debe disponer del guard perimetral `SessionAuthGuard` y el endpoint `logout` completamente funcionales y probados.
- **Restricciones negativas explícitas:**
  - Prohibido omitir el flag `Max-Age=0` en la cookie de logout.
  - Prohibido que un token revocado mediante logout pueda volver a superar el `SessionAuthGuard`.
  - Prohibido permitir el paso a endpoints protegidos si la cookie de sesión no existe (debe arrojar HTTP 401).
  - Prohibido alterar la firma de los 41 tests existentes (todos deben mantenerse en verde).

## 5. Contratos Afectados
- **5.1 Contrato de Guard (`SessionAuthGuard`):**
  ```typescript
  export class UnauthorizedSessionError extends Error {
    readonly statusCode = 401;
    constructor(message = 'Sesión no válida o expirada') {
      super(message);
      this.name = 'UnauthorizedSessionError';
    }
  }

  export class SessionAuthGuard {
    constructor(private authService: AuthService = new AuthService()) {}
    canActivate(context: ExecutionContextLike): boolean;
  }
  ```
- **5.2 Contrato de Sesión (`SessionData` y `AuthLogoutResponse`):**
  ```typescript
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
  ```
- **5.3 Contrato de Controlador HTTP (`AuthController`):**
  ```typescript
  async logout(sessionToken?: string): Promise<AuthLogoutResponse>;
  ```

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/authentication/guards/session-auth.guard.ts`: Implementación del guard con extracción de cookie, validación de token y asignación de `request.user`.
- `src/authentication/guards/session-auth.guard.test.ts`: Suite de pruebas exhaustiva del guard.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/authentication/services/auth.service.ts`: Añadir registro en memoria `activeSessions`, `validateSession`, `revokeSession` y `logout`.
- `src/authentication/controllers/auth.controller.ts`: Añadir método `logout(sessionToken?: string)`.
- `src/authentication/controllers/auth.controller.test.ts`: Añadir tests unitarios de logout, revocación y purga de cookie.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/authentication/views/LoginPage.*`: Formulario de login y validación empática intactos.
- `src/authentication/views/RegisterTab.*`: Componente de registro intacto.
- `src/authentication/services/throttler.service.ts`: Servicio de limitación por fuerza bruta intacto.
- Todos los archivos de `src/users/*`, `src/workspace/*` y `src/hub/*` (41 tests existentes deben continuar en verde).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*` (pertenecen a rebanadas posteriores).
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Definición de SessionAuthGuard y aislamiento multi-tenant), `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.3: `Cerrar_Sesion_Logout_Y_Expiracion`), `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A02.05 / VF-A02.05), `CENTRA-T_INDICE_RV_FIA.docx` (FIA-A02.05), `FIA-A02.04_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, Vitest, `@testing-library/react`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A02.04`. Sella `RV-A02` y desbloquea `RV-A03` (`FIA-A03.01`).

## 8. Restricciones
- La cabecera `Set-Cookie` en logout debe contener incondicionalmente: `session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`.
- Cualquier petición a `SessionAuthGuard` sin una cookie válida debe ser rechazada con HTTP 401 (`UnauthorizedSessionError`).
- Inmediatamente tras `revokeSession(token)`, cualquier invocación subsiguiente a `canActivate` con ese mismo token debe ser rechazada.
- Compatibilidad dual en la extracción de cookies: tanto objeto `request.cookies` como cadena en `request.headers['cookie']` deben ser parseados correctamente.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:**
  - Escribir `src/authentication/guards/session-auth.guard.test.ts` cubriendo:
    1. Rechazo 401 ante petición sin objeto de cookies ni cabecera cookie.
    2. Rechazo 401 ante cookie ausente.
    3. Rechazo 401 ante token inválido o inexistente en el registro de sesiones.
    4. Aprobación (retorno `true`) e inyección de `request.user` ante token activo válido.
    5. Extracción correcta desde cabecera cruda `cookie` (`session_token=xyz; other=123`).
    6. Extracción correcta desde objeto `request.cookies`.
    7. Rechazo 401 tras revocación del token (`revokeSession`).
  - Añadir en `src/authentication/controllers/auth.controller.test.ts` tests para `logout`:
    1. Emisión de cabecera `Set-Cookie` con `Max-Age=0`.
    2. Revocación del token en `AuthService`.
  Verificar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos responden a la falta del guard y de los métodos de logout.
- **Paso 3 — Implementar Mínimo:**
  - Ampliar `AuthService` con `activeSessions`, `validateSession`, `revokeSession` y `logout`.
  - Ampliar `AuthController` con `logout`.
  - Crear `SessionAuthGuard` en `src/authentication/guards/session-auth.guard.ts` (`GREEN`).
- **Paso 4 — Integrar:** Verificar que los métodos de `AuthService.authenticate` registran la sesión generada en `activeSessions`.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 41 tests previos más todos los nuevos tests (mínimo 48-50 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado certificando el cierre formal de `RV-A02`.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A02.05.md`, `TEST_REPORT_FIA-A02.05.md`, redactar la propuesta formal de `LOCK-FIA-A02.05.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Ampliación de `src/authentication/services/auth.service.ts`:
```typescript
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
```

### 10.2 Ampliación de `src/authentication/controllers/auth.controller.ts`:
```typescript
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
```

### 10.3 Creación de `src/authentication/guards/session-auth.guard.ts`:
```typescript
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
    [key: string]: any;
  };
  cookies?: Record<string, string>;
  user?: { id: string; email: string };
  [key: string]: any;
}

export interface ExecutionContextLike {
  switchToHttp?: () => {
    getRequest: () => RequestWithCookies;
  };
  headers?: {
    cookie?: string;
    [key: string]: any;
  };
  cookies?: Record<string, string>;
  user?: { id: string; email: string };
  [key: string]: any;
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
```

## 11. Tests Requeridos

### 11.1 Creación de `src/authentication/guards/session-auth.guard.test.ts`:
```typescript
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
```

### 11.2 Extensión de `src/authentication/controllers/auth.controller.test.ts`:
Añadir al archivo existente:
```typescript
  it('debe realizar logout exitoso emitiendo cookie con Max-Age=0 y purgando la sesión activa', async () => {
    const registerDto = { email: 'logout.test@example.com', password: 'Password123!' };
    await usersService.createUser(registerDto);

    const loginResponse = await authController.login(registerDto);
    const sessionToken = loginResponse.body.token;

    expect(authService.getActiveSessionsCount()).toBe(1);

    const logoutResponse = await authController.logout(sessionToken);

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.headers['Set-Cookie']).toContain('Max-Age=0');
    expect(logoutResponse.headers['Set-Cookie']).toContain('HttpOnly');
    expect(logoutResponse.headers['Set-Cookie']).toContain('SameSite=Strict');
    expect(authService.getActiveSessionsCount()).toBe(0);
  });
```

- **Comandos de Verificación:**
  ```bash
  npm run test
  npm run typecheck
  npm run lint
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores TypeScript).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 48 tests totales en Vitest).
- `QG-04 · Protección Perimetral de Rutas:` Tests certificando rechazo HTTP 401 si no hay cookie o token es inválido/revocado.
- `QG-05 · Purga de Cookie Certificada:` Cabecera `Set-Cookie` con `Max-Age=0` y expiración 1970 verificada.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar)",
    "FIA-A02.01: Entidad User, validación de Email RFC 5322, hashing bcrypt (coste 12), DTOs y UsersService con control de unicidad 409",
    "FIA-A02.02: Componente de interfaz RegisterTab con validación inline de contraseñas desiguales (Caso Forense VV-009), matriz de 5 estados y consumo de UsersService",
    "FIA-A02.03: Autenticación segura en backend con AuthController, AuthService, ThrottlerService (fuerza bruta 429) y sesión segura HttpOnly (Caso Forense VV-001)",
    "FIA-A02.04: Vista LoginPage con selector de pestañas (Iniciar Sesión / Crear Cuenta), validación empática en onBlur/onSubmit (Caso Forense VV-001), bloqueo 429 y redirección a /workspace",
    "FIA-A02.05: Invalidación de sesión (POST /auth/logout con Max-Age=0) y SessionAuthGuard que protege rutas privadas con HTTP 401 ante cookies inválidas o revocadas. Cierre total de RV-A02."
  ],
  "active_constraints": [
    "Aislamiento absoluto de tenant por userId derivado exclusivamente de la sesión verificada",
    "Protección de endpoints privados mediante SessionAuthGuard con cookie HttpOnly SameSite=Strict",
    "Revocación inmediata en servidor y purga de cliente con Max-Age=0 ante logout",
    "Cláusula de escape: ante fallo de red en logout, forzar purga local y redirección a /auth/login"
  ],
  "unlocked_next": "RV-A03 · FIA-A03.01 (Entidad DomesticItem (Task) y Endpoints CRUD)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/authentication/guards/session-auth.guard.ts",
    "src/authentication/guards/session-auth.guard.test.ts"
  ],
  "files_modified": [
    "src/authentication/services/auth.service.ts",
    "src/authentication/controllers/auth.controller.ts",
    "src/authentication/controllers/auth.controller.test.ts"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "WorkspaceLayout",
    "HubContainer",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "register_tab": "validado_vv009_5_estados",
    "login_page": "empatica_onblur_vv001_transicion",
    "session_lifecycle": "login_guard_logout_purgado_completo"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `SessionAuthGuard` está implementado y probado con cobertura total de rechazo 401 e inyección de identidad del usuario en el request.
2. `AuthController.logout` y `AuthService.logout` están implementados con purga en servidor y emisión de cabecera `Set-Cookie` con `Max-Age=0`.
3. El 100% de los tests del proyecto (mínimo 48 tests) pasan en verde con Vitest.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.05.md`, `TEST_REPORT_FIA-A02.05.md` y la propuesta formal de `LOCK-FIA-A02.05.md`.
6. Se certifica formalmente la finalización de la rebanada vertical `RV-A02` y el desbloqueo de `RV-A03`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A02.05`. Prohibido crear entidades de tareas (`TaskItem`, `TasksService`) en esta sesión (reservado a `RV-A03`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir la lógica de producción.
- **Blindaje de Sesión:** Asegúrate de que tanto el guard (401) como el logout (`Max-Age=0`) pasen los tests limpiamente sin degradar los 41 tests existentes.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A02.05.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario para sellar `RV-A02`.
