# SPEC-FIA-A02.03 · CONTROLADOR AUTH, COOKIE HTTPONLY Y THROTTLER

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A02.03 · Controlador Auth, Cookie HttpOnly y Throttler  
**PVF de Cierre:** PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001) y PVF-A02.04 · Mitigación de Enumeración y Throttling  
**VF:** VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A02.02.md APROBADO (Commit: `e267f8e`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la orden técnica ejecutable para materializar el controlador y los servicios de autenticación en `src/authentication/` para Antigravity CLI. La unidad implementa el endpoint `POST /auth/login` coordinando: verificación de credenciales con `UsersService` mediante `bcryptjs.compare`, prevención de enumeración (mensaje de error genérico 401 inalterable), rate limiting con `ThrottlerService` (bloqueo HTTP 429 al 6º fallo consecutivo en 15 minutos) y el **Caso Forense VV-001** (emisión de la cookie de sesión `session_token` con flags `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`).

## 2. Objetivo
Construir y verificar en tests:
1. Endpoint/Método `authController.login(dto: LoginCredentialsDto)` con estado HTTP 200 OK en caso de éxito.
2. Emisión de la cabecera `Set-Cookie` con los flags obligatorios del Caso Forense VV-001:
   `session_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
3. Prevención de enumeración de usuarios: devolver exactamente el mismo error HTTP 401 (`InvalidCredentialsError: "Credenciales incorrectas"`) tanto si el email no existe como si la contraseña no coincide.
4. Throttling / Rate Limiting: contador de intentos fallidos por clave/IP con ventana de 15 minutos (900s). Permitir hasta 5 intentos fallidos; al 6º intento consecutivo, responder HTTP 429 (`TooManyRequestsError: "Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"`).
5. Reseteo del contador de fallos tras una autenticación exitosa.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en la Sección 15 de `FIA-A02.02_AS_BUILT.md` y `repo_state.json`)*
- **Archivos Existentes:**
  - `src/users/*`: `user.entity.ts`, `register-user.dto.ts`, `user-response.dto.ts`, `user.repository.ts`, `users.service.ts`
  - `src/authentication/views/*`: `RegisterTab.tsx`, `RegisterTab.module.css`, `RegisterTab.test.tsx`
  - `src/workspace/*`, `src/hub/*`
  - `context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`
- **Estado de Tests Actual:** 27/27 tests en verde en la suite global.
- **Riesgos Iniciales:** Manejo de cabeceras HTTP en un entorno de pruebas sin servidor Express/Nest levantado. Se diseñará el controlador y el servicio devolviendo una estructura tipada `AuthHttpResponse` con status, headers y body, facilitando pruebas deterministas en Vitest y compatibilidad directa con adaptadores HTTP futuros.

## 4. Estado Objetivo
El módulo `src/authentication/` debe contar con sus DTOs, `ThrottlerService`, `AuthService` y `AuthController` completamente implementados y cubiertos por tests unitarios y de integración al 100%.
- **Restricciones negativas explícitas:**
  - Prohibido omitir cualquiera de los flags de seguridad de la cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=86400`).
  - Prohibido diferenciar el mensaje de error de credenciales según si el usuario existe o no (prevención estricta de enumeración).
  - Prohibido maquetar la vista `LoginPage.tsx` en esta unidad (pertenece a `FIA-A02.04`).

## 5. Contratos Afectados
- **5.1 Contrato de Entrada (LoginCredentialsDto):**
  ```typescript
  export interface LoginCredentialsDto {
    email: string;
    password: string;
  }
  ```
- **5.2 Contrato de Respuesta HTTP (AuthHttpResponse):**
  ```typescript
  export interface AuthResponseDto {
    user: UserResponseDto;
    token: string;
  }

  export interface AuthHttpResponse {
    statusCode: number;
    headers: {
      'Set-Cookie': string;
    };
    body: AuthResponseDto;
  }
  ```
- **5.3 Contrato de Aislamiento:**
  - `AuthService` consume `UsersService` únicamente a través de su interfaz pública (`findByEmail`).

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/authentication/dto/login-credentials.dto.ts`: DTO de entrada.
- `src/authentication/dto/auth-response.dto.ts`: Contratos de respuesta y cabeceras.
- `src/authentication/services/throttler.service.ts`: Control de fuerza bruta y bloqueo 429.
- `src/authentication/services/auth.service.ts`: Verificación de hash, anti-enumeración y ensamblado de sesión.
- `src/authentication/controllers/auth.controller.ts`: Orquestador HTTP de login.
- `src/authentication/controllers/auth.controller.test.ts`: Batería de pruebas de seguridad y casos forenses.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/authentication/views/RegisterTab.*` (8 tests intactos).
- `src/users/*` (5 tests de dominio de usuarios intactos).
- `src/workspace/*` y `src/hub/*` (14 tests visuales intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`.
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Caso Forense VV-001, Anti-Enumeración, Throttling), `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.2), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A02.02_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** `bcryptjs`, `crypto` (nativo), TypeScript 5.x, Vitest.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A02.02`. Desbloquea `FIA-A02.04`.

## 8. Restricciones
- La cabecera `Set-Cookie` debe contener la cookie `session_token` con todos los flags: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
- El mensaje de fallo de credenciales debe ser inmutablemente: *"Credenciales incorrectas"*.
- Throttler fijado en 5 intentos fallidos máximo por clave; el 6º intento falla con HTTP 429.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/authentication/controllers/auth.controller.test.ts` la batería de tests que validen:
  1. Autenticación exitosa (200 OK) con usuario válido y emisión de cabecera `Set-Cookie` con `session_token`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=86400`.
  2. Anti-enumeración: verificar que si el email no existe, devuelve 401 con mensaje "Credenciales incorrectas".
  3. Anti-enumeración: verificar que si el email existe pero la contraseña no coincide, devuelve exactamente el mismo error 401 ("Credenciales incorrectas").
  4. Throttling: ejecutar 5 intentos fallidos seguidos; verificar que el 6º intento devuelve 429 Too Many Requests.
  5. Reseteo de Throttling: tras un intento fallido, si se realiza un intento exitoso, el contador se resetea.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo responde a la ausencia de los archivos de autenticación.
- **Paso 3 — Implementar Mínimo:** Crear `login-credentials.dto.ts`, `auth-response.dto.ts` y `throttler.service.ts`.
- **Paso 4 — Implementar AuthService y AuthController:** Implementar `auth.service.ts` con verificación bcrypt y ensamblado de cabeceras, y `auth.controller.ts` coordinando con el Throttler (`GREEN`).
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 27 tests previos más los nuevos tests de autenticación (mínimo 32-33 tests en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A02.03.md`, `TEST_REPORT_FIA-A02.03.md`, redactar la propuesta formal de `LOCK-FIA-A02.03.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### DTOs de Autenticación (`src/authentication/dto/`):
```typescript
// login-credentials.dto.ts
export interface LoginCredentialsDto {
  email: string;
  password: string;
}

// auth-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}

export interface AuthHttpResponse {
  statusCode: number;
  headers: {
    'Set-Cookie': string;
  };
  body: AuthResponseDto;
}
```

### Servicio de Throttling (`src/authentication/services/throttler.service.ts`):
```typescript
export class TooManyRequestsError extends Error {
  readonly statusCode = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 900) {
    super('Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos');
    this.name = 'TooManyRequestsError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface ThrottleRecord {
  failedAttempts: number;
  blockedUntil?: number;
}

export class ThrottlerService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly BLOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

  private records = new Map<string, ThrottleRecord>();

  checkBlocked(key: string): void {
    const record = this.records.get(key);
    if (!record || !record.blockedUntil) return;

    const now = Date.now();
    if (now < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      throw new TooManyRequestsError(remainingSeconds);
    } else {
      // Bloqueo expirado
      this.records.delete(key);
    }
  }

  recordFailure(key: string): void {
    const record = this.records.get(key) || { failedAttempts: 0 };
    record.failedAttempts += 1;

    if (record.failedAttempts >= ThrottlerService.MAX_FAILED_ATTEMPTS) {
      record.blockedUntil = Date.now() + ThrottlerService.BLOCK_WINDOW_MS;
    }

    this.records.set(key, record);
  }

  recordSuccess(key: string): void {
    this.records.delete(key);
  }

  getFailedAttempts(key: string): number {
    return this.records.get(key)?.failedAttempts || 0;
  }
}
```

### Servicio de Autenticación (`src/authentication/services/auth.service.ts`):
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
```

### Controlador de Autenticación (`src/authentication/controllers/auth.controller.ts`):
```typescript
import { AuthService } from '../services/auth.service';
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
}
```

## 11. Tests Requeridos
- **11.1 Test Caso Forense VV-001 (Sesión Segura HttpOnly):**
  - Autenticar credenciales válidas; verificar que `res.statusCode === 200` y `res.headers['Set-Cookie']` contiene:
    - `session_token=`
    - `HttpOnly`
    - `Secure`
    - `SameSite=Strict`
    - `Path=/`
    - `Max-Age=86400`
- **11.2 Test Anti-Enumeración (OWASP):**
  - Fallo por email inexistente: devuelve 401 con mensaje `"Credenciales incorrectas"`.
  - Fallo por contraseña errónea: devuelve 401 con mensaje exactamente `"Credenciales incorrectas"`.
- **11.3 Test de Throttling (Rate Limiting 429):**
  - Realizar 5 intentos fallidos consecutivos.
  - El 6º intento arroja `TooManyRequestsError` con `statusCode === 429`.
- **11.4 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 32 tests combinados).
- `QG-04 · Cumplimiento Caso Forense VV-001:` Presencia formal de los 4 flags de seguridad en la cabecera Set-Cookie.
- `QG-05 · Mitigación OWASP:** Anti-enumeración (401 unificado) y Throttling activo (429 al 6º fallo).

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Scaffolding UI Base y Topología Espacial del Workspace",
    "FIA-A02.01: Entidad User, VO Email RFC 5322, hashing bcrypt (coste 12) y UsersService con control de unicidad 409",
    "FIA-A02.02: Componente RegisterTab en UI con validación de doble contraseña (VV-009) y matriz de 5 estados",
    "FIA-A02.03: AuthController y AuthService con cookie HttpOnly (Caso Forense VV-001), prevención de enumeración y ThrottlerGuard (5 fallos/15 min)"
  ],
  "active_constraints": [
    "Cookie de sesión configurada con flags HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400",
    "Prevención estricta de enumeración (mensaje 401 invariable)",
    "Throttling activo en endpoint de login"
  ],
  "unlocked_next": "FIA-A02.04 (Formulario Login Empático y Transición - VV-001)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/authentication/dto/login-credentials.dto.ts",
    "src/authentication/dto/auth-response.dto.ts",
    "src/authentication/services/throttler.service.ts",
    "src/authentication/services/auth.service.ts",
    "src/authentication/controllers/auth.controller.ts",
    "src/authentication/controllers/auth.controller.test.ts"
  ],
  "files_modified": [],
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
    "RegisterTab"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px)",
    "hub": "HubContainer (w=380px/colapsado)",
    "workbench": "flex 1",
    "auth_surface": "RegisterTab (activo)"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "backend_auth": "login_controller_session_cookie_httponly_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `AuthController`, `AuthService` y `ThrottlerService` están implementados.
2. La emisión de cookie de sesión segura (VV-001), la anti-enumeración 401 y el bloqueo 429 al 6º intento están demostrados mediante tests en verde.
3. El 100% de los tests del proyecto (mínimo 32 tests) pasan con Vitest.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A02.03.md`, `TEST_REPORT_FIA-A02.03.md` y `LOCK-FIA-A02.03.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A02.03`. Prohibido maquetar vistas de login en React en esta sesión.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir la lógica del controlador o servicios.
- **Caso Forense VV-001:** Comprueba minuciosamente que la cabecera `Set-Cookie` contenga los flags `HttpOnly`, `Secure` y `SameSite=Strict`.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A02.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
