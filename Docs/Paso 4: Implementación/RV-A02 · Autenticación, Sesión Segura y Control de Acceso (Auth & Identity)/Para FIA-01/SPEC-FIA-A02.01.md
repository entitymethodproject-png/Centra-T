# SPEC-FIA-A02.01 · ENTIDAD USER, VO EMAIL, HASHING Y POST /USERS

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A02.01 · Entidad User, VO Email, Hashing y POST /users  
**PVF de Cierre:** PVF-A02.01 · Registro de Cuenta y Validación de Doble Contraseña (VV-009)  
**VF:** VF-A02.01 · Registro de Usuario y Validación de Doble Contraseña (VV-009)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A01.03.md APROBADO (Commit: `bdf04e3` · Cierre de RV-A01)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la orden técnica ejecutable para materializar el núcleo de dominio de identidad en el módulo `src/users/` para Antigravity CLI. La unidad comprende la entidad pura `User`, la validación de `Email` bajo RFC 5322 con normalización (trim + toLowerCase), el algoritmo de derivación de claves con bcrypt (coste 12), los DTOs inmutables `RegisterUserDto` y `UserResponseDto` (con purga estricta de hash de contraseña), el repositorio de usuarios y el servicio `UsersService` con detección de colisiones de email y lanzamiento de excepción HTTP 409 Conflict, garantizando el 100% de cobertura en tests de lógica de negocio conforme a la doctrina TDD 100/80/0.

## 2. Objetivo
Construir y verificar en tests:
1. Entidad `User` con campos `id` (UUID), `email`, `passwordHash`, `createdAt`, `updatedAt`.
2. Función/Value Object de validación de email con normalización RFC 5322 (5..120 caracteres).
3. Hashing de contraseña mediante `bcryptjs` fijado en 12 rondas de salting (`cost = 12`).
4. DTO de respuesta seguro `UserResponseDto` que omite de forma innegociable cualquier dato sensible o hash.
5. `UsersService` con control de unicidad de email: si el email ya existe, emite de forma determinista un error de conflicto HTTP 409.
6. Cobertura del 100% en la suite unitaria de `src/users/`.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en la Sección 15 de `FIA-A01.03_AS_BUILT.md` y `repo_state.json`)*
- **Archivos Existentes:**
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
  - `src/test/setup.ts`, `src/theme/tokens.css`
  - `src/workspace/components/WorkspaceLayout.tsx`, `TopNavbar.tsx` (y sus estilos/tests)
  - `src/hub/components/HubContainer.tsx` (y sus estilos/tests)
  - `context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`
- **Estado de Tests Actual:** 14/14 tests en verde en la suite global.
- **Riesgos Iniciales:** Ausencia del paquete `bcryptjs` en `package.json` para ejecutar hashing en entorno Node/Vite sin dependencias binarias nativas de C++. Se autoriza instalar `bcryptjs` y `@types/bcryptjs`.

## 4. Estado Objetivo
El repositorio debe contar con el módulo de negocio `src/users/` completamente estructurado, tipado y probado con cobertura del 100% en dominio, sin romper los 14 tests visuales previos.
- **Restricciones negativas explícitas:**
  - Prohibido retornar `passwordHash` en ningún DTO de salida ni respuesta de servicio.
  - Prohibido utilizar librerías o carpetas genéricas (`utils/`, `shared/`, `helpers/`).
  - Prohibido maquetar vistas de login o registro en UI en esta unidad (`RegisterTab.tsx` pertenece a `FIA-A02.02`).

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Llamada:**
  ```typescript
  export interface RegisterUserDto {
    email: string;
    password: string;
  }
  ```
- **5.2 Contrato de Salida Saneado:**
  ```typescript
  export interface UserResponseDto {
    id: string;
    email: string;
    createdAt: Date;
  }
  ```
- **5.3 Contrato de Aislamiento:**
  - El módulo `users` es una entidad fundacional. No depende de ningún otro módulo de negocio ni de la capa de interfaz.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/users/entities/user.entity.ts`: Modelo de datos y entidad de dominio User.
- `src/users/dto/register-user.dto.ts`: DTO de entrada tipado con validación.
- `src/users/dto/user-response.dto.ts`: DTO de salida seguro sin hash sensible.
- `src/users/repositories/user.repository.ts`: Interfaz y repositorio en memoria con índice por email.
- `src/users/services/users.service.ts`: Lógica de creación, hashing bcrypt (coste 12) y unicidad 409.
- `src/users/services/users.service.test.ts`: Batería exhaustiva de tests unitarios de dominio (100% cobertura).

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `package.json`: Incorporar `bcryptjs` y `@types/bcryptjs` en dependencias/devDependencies.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Todos los archivos de `src/workspace/*` y `src/hub/*` (14/14 tests previos deben seguir pasando en verde).
- `src/theme/tokens.css`, `src/test/setup.ts`, `vite.config.ts`, `vitest.config.ts`.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`, `src/authentication/*`.
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Docs 01-05), `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.1), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A01.03_AS_BUILT.md`, `FIA-A02.01.md`.
- **Tecnológicas Autorizadas:** `bcryptjs` (^2.4.3), `@types/bcryptjs` (^2.4.6), `crypto` (nativo de Node/Web API para UUID), TypeScript 5.x, Vitest.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A01.03`. Desbloquea `FIA-A02.02`.

## 8. Restricciones
- El factor de coste de bcrypt debe ser exactamente `12` (`SALT_ROUNDS = 12`).
- El email debe ser saneado mediante `trim().toLowerCase()` antes de persistencia y comparación.
- El error de duplicado debe corresponder a un error tipado `UserAlreadyExistsError` con código de estado HTTP 409.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Instalar `bcryptjs` y `@types/bcryptjs` (`npm install bcryptjs @types/bcryptjs`). Escribir en `src/users/services/users.service.test.ts` la batería de pruebas que validen:
  1. Creación exitosa de usuario con email normalizado y hash generado.
  2. Comprobación de que `UserResponseDto` no contiene la propiedad `passwordHash` ni `password`.
  3. Rechazo con error 400 ante emails no válidos según RFC 5322 o menores a 5 caracteres.
  4. Rechazo con error 400 ante contraseñas que incumplan la política (menos de 8 chars, sin mayúsculas, sin números o sin símbolos).
  5. Rechazo con error de conflicto 409 al intentar registrar un email duplicado.
  6. Verificación de que el hash generado es válido mediante `bcryptjs.compare`.
  Comprobar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo responde a la ausencia de los archivos de `src/users/`.
- **Paso 3 — Implementar Mínimo:** Crear `user.entity.ts`, los DTOs y `user.repository.ts`.
- **Paso 4 — Implementar Servicio e Integrar:** Implementar `users.service.ts` con hashing `bcryptjs.hash(password, 12)`, validaciones de frontera y control de conflicto 409 (`GREEN`).
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan tanto los 14 tests visuales previos como todos los nuevos tests de `UsersService` (100% verde).
- **Paso 6 — Ejecutar Quality Gates y Cobertura:** Comprobar `npm run typecheck` y verificar que la cobertura sobre `src/users/` es del 100% en servicios y lógica de dominio.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A02.01.md`, `TEST_REPORT_FIA-A02.01.md`, redactar la propuesta formal de `LOCK-FIA-A02.01.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### Entidad de Usuario (`src/users/entities/user.entity.ts`):
```typescript
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### DTOs (`src/users/dto/register-user.dto.ts` y `user-response.dto.ts`):
```typescript
export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: Date;
}
```

### Repositorio de Usuarios (`src/users/repositories/user.repository.ts`):
```typescript
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, { ...user });
    return { ...user };
  }
}
```

### Servicio de Usuarios (`src/users/services/users.service.ts`):
```typescript
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
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasNumber || !hasSymbol) {
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
```

## 11. Tests Requeridos
- **11.1 Tests de Validación y Hashing:**
  - Registro de usuario con salting bcrypt (coste 12) verificado mediante `bcrypt.compare`.
  - Normalización de email (mayúsculas y espacios convertidos a minúsculas).
  - Rechazo de contraseñas de menos de 8 caracteres o sin caracteres especiales.
  - Rechazo de emails malformados.
- **11.2 Tests de Unicidad (409 Conflict):**
  - Registro inicial exitoso.
  - Segundo registro con el mismo email arroja `UserAlreadyExistsError` con `statusCode === 409`.
- **11.3 Tests Anti-Leak:**
  - La respuesta de `createUser` no contiene la clave `passwordHash`.
- **11.4 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 20 tests combinados).
- `QG-04 · Cobertura Honesta (TDD 100/80/0):` 100% de cobertura en servicios y lógica de dominio de `src/users/`.
- `QG-05 · Anti-Leak de Seguridad:` Cero exposición de hashes en DTOs de salida.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar con telemetría de red)",
    "FIA-A02.01: Entidad User, validación de Email RFC 5322, hashing bcrypt (coste 12), DTOs y UsersService con control de unicidad 409"
  ],
  "active_constraints": [
    "Coste de hashing bcrypt fijado estrictamente en 12",
    "Prohibida la exposición de passwordHash en DTOs o respuestas",
    "Aislamiento de dominio de usuarios verificado"
  ],
  "unlocked_next": "FIA-A02.02 (Componente de Registro en UI y Pestaña [Crear Cuenta] - VV-009)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/users/entities/user.entity.ts",
    "src/users/dto/register-user.dto.ts",
    "src/users/dto/user-response.dto.ts",
    "src/users/repositories/user.repository.ts",
    "src/users/services/users.service.ts",
    "src/users/services/users.service.test.ts"
  ],
  "files_modified": [
    "package.json"
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
    "TopNavbar"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (height 64px, role banner, brand Centra-T, network status badge, user profile, logout button)",
    "hub": "HubContainer (width 380px expandido / 48px colapsado, role complementary)",
    "workbench": "flex 1 (lienzo adaptable), role main"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "active_route": "/workspace",
    "backend_domain": "users_module_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `UsersService`, `user.entity.ts`, DTOs y `InMemoryUserRepository` están implementados.
2. La validación RFC 5322, el hashing bcrypt (coste 12) y el error 409 están demostrados mediante pruebas automatizadas.
3. El 100% de los tests (anteriores + nuevos) pasan en verde con Vitest.
4. La cobertura en `src/users/` alcanza el 100%.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten `IMPLEMENTATION_REPORT_FIA-A02.01.md`, `TEST_REPORT_FIA-A02.01.md` y `LOCK-FIA-A02.01.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A02.01`. Prohibido diseñar formularios visuales en React todavía.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir la lógica de producción.
- **Cobertura Honesta:** Garantiza el 100% de cobertura en los servicios y entidades de `src/users/`.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A02.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
