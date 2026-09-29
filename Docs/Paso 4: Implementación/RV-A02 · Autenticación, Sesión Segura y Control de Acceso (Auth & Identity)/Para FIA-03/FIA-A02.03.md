# CENTRA-T · FIA-A02.03 · CONTROLADOR AUTH, COOKIE HTTPONLY Y THROTTLER
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A02.03`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Prevista:** `Controlador Auth, Cookie HttpOnly y Throttler`
- **PVF de Cierre Cubierta:** `PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001)` y `PVF-A02.04 · Mitigación de Enumeración y Throttling de Login`
- **VF Interna de Derivación:** `VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)`
- **Objetivo Indexado:** `Implementar POST /auth/login con verificación de credenciales, ThrottlerGuard (5 intentos/15min) y emisión de cookie de sesión (HttpOnly, Secure, SameSite=Strict).`
- **Validación Indexada:** `src/authentication/controllers/auth.controller.ts` (y servicio/tests asociados)
- **Evidencia de Cierre Indexada:** `200 OK emite cabecera Set-Cookie con flags de seguridad; 401 devuelve mensaje genérico 'Credenciales incorrectas'; 6º intento devuelve 429 Too Many Requests.`
- **LOCK Previo Requerido:** `LOCK-FIA-A02.02.md APROBADO (Commit: e267f8e)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir el núcleo del motor de autenticación en backend para el endpoint `POST /auth/login`, coordinando:
1. Verificación criptográfica segura de credenciales contra `UsersService` mediante `bcryptjs.compare`.
2. Mitigación de enumeración de usuarios (OWASP): emisión determinista del mensaje de error genérico *"Credenciales incorrectas"* con código HTTP 401 ante cualquier fallo de coincidencia (sea email inexistente o contraseña inválida).
3. Throttling / Rate Limiting contra fuerza bruta: control de hasta 5 intentos fallidos consecutivos por identificador o IP en una ventana de 15 minutos (900 segundos); al 6º intento fallido se bloquea de inmediato respondiendo HTTP 429 Too Many Requests con tiempo restante de penalización.
4. Caso Forense VV-001 (Sesión Segura HttpOnly): ante autenticación exitosa (HTTP 200 OK), generación de token de sesión y emisión de la cabecera `Set-Cookie` con la cookie `session_token` configurada con los flags innegociables `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - DTO de entrada `LoginCredentialsDto` (`email: string`, `password: string`).
  - DTO de respuesta `AuthResponseDto` (`user: UserResponseDto`, `message: string`).
  - Mecanismo de Throttling en memoria (`ThrottlerService` / `ThrottlerGuard`):
    - Ventana temporal de 15 minutos (900.000 ms).
    - Límite máximo de 5 intentos fallidos permitidos.
    - Bloqueo determinista con código HTTP 429 Too Many Requests y mensaje informativo a partir del 6º intento.
    - Reseteo del contador de intentos al autenticarse con éxito.
  - Servicio de autenticación `AuthService`:
    - Búsqueda de usuario por email normalizado.
    - Comparación criptográfica con `bcryptjs.compare`.
    - Lanzamiento de `InvalidCredentialsError` (HTTP 401) sin filtrar detalles de existencia.
    - Creación de token de sesión y ensamblado de cabecera `Set-Cookie`.
  - Controlador `AuthController`:
    - Método `login(dto: LoginCredentialsDto)` que procesa la petición y devuelve el payload con la cabecera `Set-Cookie` configurada con los atributos: `session_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
  - Batería de pruebas unitarias y de integración que verifique el 100% de los casos (200 OK con Set-Cookie, 401 genérico ante email no existente, 401 ante contraseña errónea, y 429 tras 5 fallos consecutivos).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Maquetación de la pantalla de login en interfaz React (`LoginPage.tsx` pertenece a `FIA-A02.04`).
  - Endpoint de cierre de sesión `POST /auth/logout` y purga de cookies (pertenece a `FIA-A02.05`).
  - Guard de protección de rutas privadas `SessionAuthGuard` (pertenece a `FIA-A02.05`).
  - Lógica de tareas, listas o calendario.

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: Caso Forense VV-001, Aislamiento de Tenant, Mitigaciones OWASP).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.2: `Iniciar_Sesion_Login`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A02.03 / VF-A02.03 y PVF-A02.04).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A02.03).
  - `FIA-A02.02_AS_BUILT.md` (Estado previo bloqueado).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, `bcryptjs`, Vitest.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A02.02` (Aprobado en commit `e267f8e`).
  - *Posterior:* La unidad `FIA-A02.04` (Formulario Login Empático y Transición - VV-001) no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato Funcional:** El endpoint `POST /auth/login` emite la cookie `session_token` con los 4 flags de seguridad en caso de éxito, devuelve 401 idéntico ante cualquier error de credenciales y responde 429 al superar 5 intentos fallidos en 15 minutos.
- **Contrato Físico / Module Map:** Directorio `src/authentication/`:
  - `src/authentication/dto/login-credentials.dto.ts`
  - `src/authentication/dto/auth-response.dto.ts`
  - `src/authentication/services/throttler.service.ts`
  - `src/authentication/services/auth.service.ts`
  - `src/authentication/controllers/auth.controller.ts`
  - `src/authentication/controllers/auth.controller.test.ts`
- **Contrato de Aislamiento:** El módulo `authentication` consume `UsersService` únicamente como cliente para verificar existencia y hash. Prohibido manipular la persistencia relacional directamente.

### 6. Restricciones
- La cookie de sesión debe contener obligatoriamente los flags: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
- El mensaje ante fallo de credenciales debe ser unificado y constante: *"Credenciales incorrectas"*.
- Ventana de throttling: 5 intentos fallidos máximo por IP/clave; el 6º intento devuelve HTTP 429 con cabecera `Retry-After`.
- Prohibido devolver el hash de contraseña en la respuesta o en el token.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/authentication/controllers/auth.controller.ts`.
- **Estructura Interna:**
  - `LoginCredentialsDto`: `{ email: string; password: string }`.
  - `AuthResult`: `{ user: UserResponseDto; token: string; setCookieHeader: string }`.
  - `ThrottlerService`: Gestiona intentos fallidos con mapa en memoria `{ key: { attempts: number, blockedUntil?: number } }`.
  - `AuthService`: Orquesta la verificación con `UsersService`, registra fallos en `ThrottlerService` y genera la cabecera `Set-Cookie`.
  - `AuthController`: Expone `login(dto: LoginCredentialsDto)` devolviendo status 200, cabeceras HTTP y payload saneado.
- **Manejo de Errores:**
  - `InvalidCredentialsError` (HTTP 401): *"Credenciales incorrectas"*.
  - `TooManyRequestsError` (HTTP 429): *"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*.

### 8. Flujo Operativo
1. Se recibe la petición `POST /auth/login` con `LoginCredentialsDto`.
2. Se consulta al `ThrottlerService` si la IP/clave de origen está bloqueada:
   - Si está bloqueada, se detiene el flujo inmediatamente y se responde con código HTTP 429.
3. Se normaliza el email y se busca el usuario en `UsersService`.
4. Si el usuario no existe:
   - Se incrementa el contador de fallos en el Throttler.
   - Se lanza `InvalidCredentialsError` (HTTP 401: *"Credenciales incorrectas"*).
5. Si el usuario existe, se compara la contraseña con `bcryptjs.compare(password, user.passwordHash)`.
6. Si la contraseña no coincide:
   - Se incrementa el contador de fallos en el Throttler.
   - Se lanza `InvalidCredentialsError` (HTTP 401: *"Credenciales incorrectas"*).
7. Si la contraseña coincide:
   - Se resetea el contador de fallos en el Throttler.
   - Se genera el token de sesión y se construye la cabecera `Set-Cookie: session_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`.
   - Se responde HTTP 200 OK con los datos saneados del usuario.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Autenticación exitosa - Caso VV-001):**
  - *Input:* Credenciales de un usuario registrado en `FIA-A02.01`.
  - *Resultado:* HTTP 200 OK, cabecera `Set-Cookie` presente con flags `HttpOnly`, `Secure` y `SameSite=Strict`, respuesta con `{ id, email, createdAt }` y contador de throttling limpio.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Email no registrado - Anti-Enumeración):**
  - *Input:* Email inexistente en base de datos.
  - *Resultado:* HTTP 401 con mensaje "Credenciales incorrectas".
- **Caso Inválido 2 (Contraseña errónea - Anti-Enumeración):**
  - *Input:* Email existente con contraseña incorrecta.
  - *Resultado:* HTTP 401 con mensaje exactamente idéntico ("Credenciales incorrectas").
- **Caso Inválido 3 (Superación de límite de intentos - Throttling 429):**
  - *Condición:* 5 intentos fallidos consecutivos previos.
  - *Acción:* 6º intento de autenticación.
  - *Resultado:* HTTP 429 Too Many Requests con mensaje "Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos".

### 11. Tests Requeridos
- **Tests de Integración y Seguridad (Auth Module):**
  - Autenticación exitosa: verificación de status 200 y presencia de los 4 flags de seguridad en la cabecera `Set-Cookie`.
  - Prueba de anti-enumeración: verificar que tanto email inexistente como contraseña incorrecta devuelven exactamente el mismo error 401 con el mensaje "Credenciales incorrectas".
  - Prueba de rate limiting / Throttler: ejecutar 5 llamadas fallidas consecutivas; verificar que la 6ª llamada devuelve status 429 Too Many Requests.
  - Prueba de reseteo: verificar que un login exitoso limpia el historial de intentos fallidos.
- **Evidencia Exigida:** Suite de tests ejecutada en verde con reporte emitido por Vitest.

### 12. Quality Gates (QG-FIA-A02.03)
- `QG-FIA-A02.03-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A02.03-02 · Tests Suite:` 100% de tests en verde en la suite de autenticación.
- `QG-FIA-A02.03-03 · Cumplimiento Caso Forense VV-001:` Presencia incondicional de flags `HttpOnly`, `Secure` y `SameSite=Strict` en la cookie emitida.
- `QG-FIA-A02.03-04 · Mitigación OWASP:** Verificación de mensaje idéntico 401 y bloqueo activo 429 al 6º fallo.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `AuthController`, `AuthService` y `ThrottlerService` están implementados y satisfacen el objetivo indexado.
2. La emisión de cookie HttpOnly (VV-001), la mitigación de enumeración y el bloqueo 429 están certificados con pruebas automatizadas.
3. El 100% de los tests del proyecto pasan en verde.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.03.md`, `TEST_REPORT_FIA-A02.03.md` y la propuesta formal de `LOCK-FIA-A02.03.md`.
