# CENTRA-T · FIA-A02.05 · INVALIDACIÓN DE SESIÓN (LOGOUT), AUTHGUARD Y FLUJO INTERACTIVO APP (AS-BUILT)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** AS-BUILT CONSOLIDADO · CIERRE FORMAL DEFINITIVO DE LA REBANADA VERTICAL RV-A02  
**Evidencia de Cierre:** LOCK-FIA-A02.05.md APROBADO (Commit: `778c049`)  

---

### 1. Identificación
- **FIA:** `FIA-A02.05`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Implementada:** `Invalidación de Sesión (Logout), AuthGuard y Flujo Interactivo de App`
- **PVF Satisfecha:** `PVF-A02.05 · Cierre de Sesión Seguro e Invalidación de Cookie`
- **VF Asociada:** `VF-A02.05 · Cierre de Sesión Seguro y Purga de Credenciales`
- **Commit de Cierre (Git):** `778c049` (refactor/calidad: `5ab68bc` / `5b717b5` / `574a0df` / `8bad779` / `a587aed`)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A02.05.md Aprobado (56/56 tests en verde a través de 9 suites, 100% cobertura en guard perimetral, sesión activa, revocación, auto-transición, persistencia y cierre de RV-A02)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Sella y bloquea la rebanada vertical completa RV-A02 y autoriza formalmente la apertura de RV-A03.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A02.05.md` y `FIA-A02.05.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de seguridad y tenants de `SUITE_ARQUITECTURA_CORE.docx` y el proceso algorítmico 1.3 (`Cerrar_Sesion_Logout_Y_Expiracion`) de `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A02.04` (Commit `ed76155`), con 41 tests pasando en verde.
- **Archivos Base:** Módulos `src/users/`, `src/authentication/` (backend y vistas de login/registro), `src/workspace/` y `src/hub/`.

### 4. Objetivo Implementado
1. Creación del guard de autorización `SessionAuthGuard` (`src/authentication/guards/session-auth.guard.ts`) que extrae la cookie `session_token` de la petición, valida la vigencia en `AuthService`, inyecta la identidad del usuario en `request.user = { id, email }` y rechaza con `UnauthorizedSessionError` (HTTP 401) cualquier intento de acceso no autorizado o con token revocado.
2. Implementación de la revocación activa de sesión mediante `POST /auth/logout` en `AuthController` y `AuthService`, emitiendo la cabecera `Set-Cookie` de purga inmediata con `Max-Age=0` y expiración UNIX en 1970 (`session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`).
3. Conexión interactiva del flujo en `App.tsx` y `LoginPage.tsx`: auto-transición inmediata al Workspace tras registrarse con éxito, sincronización bidireccional tolerante a fallos de persistencia en cliente (`InMemoryUserRepository` con `localStorage` y estado de sesión con `sessionStorage`), permitiendo verificar interactivamente en navegador el ciclo completo: Registro ➔ Workspace ➔ Logout ➔ Login.
4. Blindaje del entorno de pruebas en `src/test/setup.ts` para garantizar el aislamiento absoluto y evitar la contaminación cruzada entre tests (0 state leakage).

### 5. Alcance Final
- Creación de `src/authentication/guards/session-auth.guard.ts` y su suite `session-auth.guard.test.ts` (6 tests).
- Ampliación de `src/authentication/services/auth.service.ts` con gestión de `activeSessions`, `validateSession`, `revokeSession` y `logout`.
- Ampliación de `src/authentication/controllers/auth.controller.ts` con método `logout(sessionToken)` y sus tests en `auth.controller.test.ts` (6 tests).
- Ajustes de integración en `src/authentication/views/LoginPage.tsx` y `LoginPage.test.tsx` (10 tests).
- Creación de `src/App.tsx` y su suite de integración raíz `src/App.test.tsx` (7 tests).
- Actualización de `src/users/repositories/user.repository.ts` y `src/test/setup.ts`.
- Suite global completa: 56/56 tests pasando en verde con Vitest.
- Emisión de `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-01/De FIA-05`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `@types/bcryptjs` (^2.4.6), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Guard:**
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
- **Contrato de Revocación HTTP (Logout):**
  - Cabecera: `Set-Cookie: session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  - Cuerpo: `{ statusCode: 200, body: { message: 'Sesión cerrada correctamente' } }`
- **Contrato de Almacén de Sesión:**
  ```typescript
  export interface SessionData {
    userId: string;
    email: string;
    createdAt: number;
  }
  ```

### 8. Restricciones Finales
- Presencia innegociable de `Max-Age=0` y flags de seguridad en la cookie de logout.
- Rechazo HTTP 401 tajante ante ausencia de cookie de sesión o token no registrado.
- Desautenticación inmediata: tras revocar un token, este no puede volver a franquear el `SessionAuthGuard`.
- Cláusula de escape garantizada en cliente: ante fallo de red en logout, la desautenticación local se fuerza sin excepción.

### 9. Diseño Técnico Final
- `SessionAuthGuard`: Diseñado conforme a la especificación de guards de NestJS pero desacoplado para su ejecución pura y ultrarrápida en Vitest. Soporta lectura desde `request.cookies['session_token']` y parsing de cabecera cruda `request.headers['cookie']`.
- `AuthService`: Mantiene el mapa de sesiones activas `activeSessions` y coordina validación y revocación.
- `InMemoryUserRepository`: Almacén en memoria compartida sincronizado con `localStorage` (`centrat_users_db`) en entorno navegador, con método `clear()` invocado en el setup de Vitest para esterilidad de tests.
- `App.tsx`: Orquestador raíz que conmuta entre la pantalla de autenticación y el Workspace, reteniendo la sesión mediante `sessionStorage` (`centrat_auth`).

### 10. Flujo Operativo Final
1. Petición a endpoint protegido -> `SessionAuthGuard.canActivate(context)` verifica cookie -> Si válida, inyecta `request.user` y permite acceso (200 OK); si no, arroja 401.
2. Clic en `[Cerrar Sesión]` -> `AuthController.logout(token)` purga la sesión activa y emite `Set-Cookie` con `Max-Age=0`.
3. El cliente desmantela el estado local y expulsa al usuario hacia `/auth/login`.
4. Ante registro exitoso en `[Crear Cuenta]` -> el sistema conmuta automáticamente al usuario hacia el Workspace.

### 11. Casos Válidos Finales
- **Validado 1:** `SessionAuthGuard` permite acceso e inyecta `request.user` con cookie válida en objeto `cookies`.
- **Validado 2:** `SessionAuthGuard` permite acceso extrayendo el token de cabecera `Cookie` cruda.
- **Validado 3:** Logout revoca la sesión activa en el servidor y emite cabecera con `Max-Age=0` y flags de seguridad.
- **Validado 4:** Auto-transición inmediata al Workspace tras creación de cuenta.
- **Validado 5:** Persistencia de sesión en recarga (F5) en cliente.

### 12. Casos Inválidos Finales
- **Validado 1:** Rechazo 401 si no hay contexto o request.
- **Validado 2:** Rechazo 401 si la cookie `session_token` no está presente.
- **Validado 3:** Rechazo 401 si el token no existe en el mapa de sesiones.
- **Validado 4:** Rechazo 401 si se intenta reutilizar un token revocado mediante logout.

### 13. Tests Requeridos Finales
Suite global de 56 tests validada al 100% en verde:
- `session-auth.guard.test.ts` (6 tests)
- `auth.controller.test.ts` (6 tests)
- `LoginPage.test.tsx` (10 tests)
- `App.test.tsx` (7 tests)
- `RegisterTab.test.tsx` (8 tests)
- `users.service.test.ts` (5 tests)
- `WorkspaceLayout.test.tsx` (4 tests)
- `HubContainer.test.tsx` (4 tests)
- `TopNavbar.test.tsx` (6 tests)

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (56/56 tests pasando en verde en Vitest).
- `QG-04 · Protección Perimetral de Rutas:` Superado (HTTP 401 certificado en tests).
- `QG-05 · Purga de Cookie Certificada:` Superado (`Max-Age=0` verificado en tests).

### 15. Archivos Reales Afectados
```
Creados:
- src/authentication/guards/session-auth.guard.ts
- src/authentication/guards/session-auth.guard.test.ts
- src/App.tsx
- src/App.test.tsx

Modificados:
- src/authentication/services/auth.service.ts
- src/authentication/controllers/auth.controller.ts
- src/authentication/controllers/auth.controller.test.ts
- src/authentication/views/LoginPage.tsx
- src/authentication/views/LoginPage.test.tsx
- src/users/repositories/user.repository.ts
- src/test/setup.ts
- src/main.tsx
```

### 16. Diferencias Respecto a la FIA Original
Se incorporó la auto-transición tras registro y la sincronización tolerante a fallos en `localStorage`/`sessionStorage` para permitir la verificación interactiva real en navegador de desarrollo previo a la infraestructura Docker/PostgreSQL.

### 17. Drift Integrado
Cero drift arquitectónico. Todo el código añadido respeta rigurosamente las fronteras de módulos y principios de aislamiento.

### 18. Decisiones de Cambio (CHG) Integradas
- `CHG-A02.05-01`: Transición inmediata al Workspace tras registro exitoso en `RegisterTab`.
- `CHG-A02.05-02`: Persistencia local sincronizada en cliente para soporte del ciclo interactivo en navegador de desarrollo.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A02.05` ha completado con matrícula de honor su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 56/56 tests en verde y blindaje exhaustivo de la protección perimetral, la revocación de sesión y el flujo interactivo de la aplicación.  

**HITO HISTÓRICO:** Queda formalmente sellada y concluida con **LOCK DEFINITIVO** la Rebanada Vertical **`RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`**.  
Queda formalmente autorizada y desbloqueada la apertura de la Rebanada Vertical **`RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`** comenzando por su primera unidad táctica: **`FIA-A03.01 · Entidad DomesticItem (Task) y Endpoints CRUD`**.
