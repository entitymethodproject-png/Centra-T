# CENTRA-T · FIA-A02.05 · INVALIDACIÓN DE SESIÓN (LOGOUT) Y AUTHGUARD
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Hito de Rebanada:** UNIDAD DE CIERRE Y CONSOLIDACIÓN DE RV-A02  

---

### 1. Identificación
- **FIA:** `FIA-A02.05`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Prevista:** `Invalidación de Sesión (Logout) y AuthGuard`
- **PVF de Cierre Cubierta:** `PVF-A02.05 · Cierre de Sesión Seguro e Invalidación de Cookie`
- **VF Interna de Derivación:** `VF-A02.05 · Cierre de Sesión Seguro y Purga de Credenciales`
- **Objetivo Indexado:** `Implementar POST /auth/logout (expiración cookie Max-Age=0) y SessionAuthGuard en NestJS que bloquea endpoints privados sin cookie válida con HTTP 401.`
- **Validación Indexada:** `src/authentication/guards/session-auth.guard.ts`
- **Evidencia de Cierre Indexada:** `Logout purga la cookie en el navegador; intento de acceso directo a /workspace es rechazado y redirigido a /auth/login.`
- **LOCK Previo Requerido:** `LOCK-FIA-A02.04.md APROBADO (Commit: ed76155)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Implementar la infraestructura completa de protección de rutas privadas e invalidación de sesión en Centra-T:
1. Revocación de sesión mediante `POST /auth/logout` coordinado por `AuthController` y `AuthService`: purga del identificador de sesión del almacén activo en el backend y emisión de cabecera `Set-Cookie` con `session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` (y expiración UNIX 1970).
2. Construcción de `SessionAuthGuard` (`src/authentication/guards/session-auth.guard.ts`): guard desacoplado y conforme a la arquitectura NestJS que extrae la cookie `session_token` de la petición (soporte tanto para cabecera `Cookie` cruda como para objeto `cookies`), valida su vigencia contra `AuthService`, vincula la identidad del usuario (`request.user = { id, email }`) y rechaza con `UnauthorizedSessionError` (HTTP 401: *"Sesión no válida o expirada"*) cualquier petición no autenticada o cuya sesión haya sido revocada.
3. Integración del flujo de logout del cliente: función o handler ejecutable desde el botón de cierre de sesión (`TopNavbar`) que invoca la revocación, purga cualquier estado residual en memoria y asegura la redirección hacia `/auth/login` (incluyendo la cláusula de escape: ante fallo de red o error 500, el cliente ejecuta obligatoriamente la desautenticación local y la expulsión hacia el login).
4. **Cierre de RV-A02:** La superación de esta unidad sella íntegramente la rebanada vertical de Autenticación, desbloqueando `RV-A03` (Tareas Generales).

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/authentication/guards/session-auth.guard.ts` con tipado `SessionAuthGuard`, extracción de cookie y excepción `UnauthorizedSessionError` (401).
  - Creación de `src/authentication/guards/session-auth.guard.test.ts` con cobertura del 100% de escenarios de guard (cookie ausente, token corrupto, token revocado tras logout, token válido inyectando `request.user`).
  - Extensión de `AuthService` (`src/authentication/services/auth.service.ts`) con gestión de sesiones activas en memoria (`activeSessions: Map<string, SessionData>`), métodos `validateSession(token: string)` y `revokeSession(token: string)`.
  - Extensión de `AuthController` (`src/authentication/controllers/auth.controller.ts`) con endpoint `logout(token?: string)` que emite cabecera `Set-Cookie` de purga inmediata (`Max-Age=0`).
  - Suite de pruebas de logout y persistencia de sesión en `auth.controller.test.ts` o suite complementaria.
  - Implementación del flujo de cliente de logout con cláusula de escape (redirección y purga local incondicional ante cualquier fallo).
  - Verificación del 100% de tests del proyecto pasando en verde (suite acumulada de mínimo 48-50 tests).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Implementación de entidades o tablas de tareas (`TaskItem`, `TasksService`, etc.; pertenecen a `RV-A03 · FIA-A03.01`).
  - Módulos de compras o limpieza doméstica.
  - Almacenamiento de tokens en `localStorage` o `sessionStorage`.

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Definición de SessionAuthGuard, protección de endpoints privados, aislamiento por userId y purga de cookie).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Integración con TopNavbar y transiciones).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.3: `Cerrar_Sesion_Logout_Y_Expiracion`, cláusula de escape).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Fila PVF-A02.05 / VF-A02.05).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A02.05).
  - `FIA-A02.04_AS_BUILT.md` (Estado previo bloqueado: `LoginPage` y flujo VV-001 cerrados).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, Vitest, `@testing-library/react`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A02.04` (Aprobado en commit `ed76155`).
  - *Posterior:* Sella formalmente `RV-A02`. Habilita el inicio de `RV-A03` (`FIA-A03.01`).

### 5. Contratos Afectados
- **Contrato de Revocación HTTP (Logout):**
  - `POST /auth/logout`
  - Cabecera de respuesta: `Set-Cookie: session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  - Cuerpo de respuesta: `{ statusCode: 200, message: 'Sesión cerrada correctamente' }`
- **Contrato de Guard (`SessionAuthGuard`):**
  - `canActivate(context: ExecutionContext | any): boolean`
  - Inyección: `request.user = { id: string; email: string }`
  - Fallo: Arroja `UnauthorizedSessionError` (`statusCode: 401`, `message: 'Sesión no válida o expirada'`).
- **Contrato de Sesión en Servicio (`AuthService`):**
  - `validateSession(token: string): SessionData | null`
  - `revokeSession(token: string): void`

### 6. Restricciones
- La cookie de revocación debe contener obligatoriamente los flags `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`.
- Una sesión revocada mediante `logout` debe quedar inmediatamente inhabilitada en `SessionAuthGuard` (los intentos de acceso posteriores con ese mismo token deben arrojar HTTP 401).
- Si no existe cookie `session_token` en la petición, `SessionAuthGuard` no debe continuar la ejecución bajo ninguna circunstancia.
- Cláusula de escape en cliente: si el backend no responde o devuelve 500 al llamar a `logout`, el frontend debe igualmente desautenticar localmente y redirigir a `/auth/login`.

### 7. Diseño Técnico
- **Entrada / Puntos de Acceso:**
  - `src/authentication/guards/session-auth.guard.ts`
  - `src/authentication/services/auth.service.ts`
  - `src/authentication/controllers/auth.controller.ts`
- **Estructura Interna:**
  ```typescript
  export interface SessionData {
    userId: string;
    email: string;
    createdAt: number;
  }
  ```
  - `AuthService` gestiona `private activeSessions = new Map<string, SessionData>()`.
  - Al autenticar con éxito (`authenticate`), almacena la sesión.
  - Al revocar (`revokeSession` / `logout`), purga la clave del mapa y emite cookie `Max-Age=0`.
  - `SessionAuthGuard` analiza `request.cookies['session_token']` o parsea `request.headers['cookie']`.
- **Fronteras Físicas Autorizadas:** Directorio `src/authentication/*`.

### 8. Flujo Operativo
1. **Flujo de Acceso Protegido (Guard):**
   - Una petición entrante arriba a un endpoint privado del backend o controlador protegido.
   - `SessionAuthGuard.canActivate(context)` intercepta la petición y extrae la cookie `session_token`.
   - Si no hay token o no existe en `AuthService.activeSessions`, se lanza `UnauthorizedSessionError` (401).
   - Si existe, se inyecta `request.user = { id, email }` y se permite el acceso (`return true`).
2. **Flujo de Logout Voluntario:**
   - El usuario hace clic en `[Cerrar Sesión]` en la interfaz (TopNavbar).
   - El cliente envía la petición `POST /auth/logout` con el token de sesión.
   - `AuthController.logout(token)` purga el token de la memoria del servidor y emite `Set-Cookie` con `Max-Age=0`.
   - El cliente elimina cualquier estado en memoria y redirige inmediatamente hacia `/auth/login`.
3. **Flujo de Fallo / Escape:**
   - Si el endpoint de logout falla o se corta la red, el cliente ejecuta la purga de estado y la redirección a `/auth/login` de forma incondicional.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Guard permite acceso con sesión válida):**
  - *Input:* Petición con cabecera `Cookie: session_token=token-valido`.
  - *Resultado:* Guard retorna `true` y `request.user` contiene la identidad del usuario.
- **Caso 2 (Logout exitoso e invalidación inmediata):**
  - *Input:* Invocación de `logout(token)`.
  - *Resultado:* Devuelve 200 OK con `Set-Cookie: session_token=; ... Max-Age=0`; subsecuente llamada al Guard con ese token es rechazada con HTTP 401.
- **Caso 3 (Soporte multi-formato de cookies en Guard):**
  - *Input:* Soporte transparente tanto si el request dispone de `request.cookies['session_token']` como si proporciona `request.headers.cookie`.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Petición sin cookie de sesión):**
  - *Acción:* Petición sin cabecera `Cookie` ni objeto `cookies`.
  - *Resultado:* Arroja `UnauthorizedSessionError` (HTTP 401: *"Sesión no válida o expirada"*).
- **Caso Inválido 2 (Token inexistente o falsificado):**
  - *Acción:* Cookie con token `uuid-falso`.
  - *Resultado:* Arroja `UnauthorizedSessionError` (HTTP 401).
- **Caso Inválido 3 (Acceso tras Logout):**
  - *Acción:* Petición con un token que acaba de ser revocado mediante `logout`.
  - *Resultado:* Arroja `UnauthorizedSessionError` (HTTP 401).

### 11. Tests Requeridos
- **Tests Unitarios y de Integración del Guard (`session-auth.guard.test.ts`):**
  1. Bloqueo 401 si no hay cookies en el contexto.
  2. Bloqueo 401 si la cookie `session_token` está ausente.
  3. Bloqueo 401 si el token no existe en el registro de sesiones activas de `AuthService`.
  4. Autorización exitosa (retorna `true`) e inyección de `request.user` cuando el token es válido.
  5. Soporte para extracción desde `request.headers['cookie']` y desde `request.cookies`.
  6. Bloqueo 401 tras revocación explícita del token.
- **Tests del Flujo de Logout (`auth.controller.test.ts`):**
  1. `logout` revoca la sesión activa del almacén.
  2. `logout` devuelve cabecera `Set-Cookie` con `Max-Age=0` y flags `HttpOnly; Secure; SameSite=Strict`.
  3. Ejecución de la cláusula de escape en cliente ante fallo del backend.
- **Evidencia Exigida:** Suite completa en verde (mínimo 48-50 tests totales en Vitest).

### 12. Quality Gates (QG-FIA-A02.05)
- `QG-FIA-A02.05-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A02.05-02 · Tests Suite:` 100% de tests en verde en todo el proyecto.
- `QG-FIA-A02.05-03 · Protección Absoluta de Rutas:` Tests verificando rechazo 401 ante accesos no autorizados.
- `QG-FIA-A02.05-04 · Purga de Cookie Certificada:` Cabecera `Set-Cookie` con `Max-Age=0` y expiración en 1970 verificada.
- `QG-FIA-A02.05-05 · Cierre de Rebanada RV-A02:` Emisión de reporte de cierre de rebanada vertical.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `SessionAuthGuard` está implementado y probado con cobertura total de rechazo 401 e inyección de identidad.
2. `POST /auth/logout` está implementado con purga en servidor y emisión de cookie `Max-Age=0`.
3. El 100% de los tests del proyecto (mínimo 48-50 tests) pasan en verde con Vitest.
4. Los 3 JSONs de estado quedan actualizados certificando la culminación de `RV-A02` y el desbloqueo de `RV-A03`.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.05.md`, `TEST_REPORT_FIA-A02.05.md` y la propuesta formal de `LOCK-FIA-A02.05.md`.
