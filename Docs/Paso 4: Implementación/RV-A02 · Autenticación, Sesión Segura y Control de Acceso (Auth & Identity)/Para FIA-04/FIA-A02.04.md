# CENTRA-T · FIA-A02.04 · FORMULARIO LOGIN EMPÁTICO Y TRANSICIÓN (VV-001)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A02.04`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Prevista:** `Formulario Login Empático y Transición (VV-001)`
- **PVF de Cierre Cubierta:** `PVF-A02.02 · Validación No Agresiva en Formulario de Login` y `PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001)`
- **VF Interna de Derivación:** `VF-A02.02 · Interacción y Validación Empática de Login` y `VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)`
- **Objetivo Indexado:** `Construir vista /auth/login con validación en onBlur y onSubmit, spinner local en botón, deshabilitación de inputs y redirección a /workspace tras login exitoso.`
- **Validación Indexada:** `src/authentication/views/LoginPage.tsx`
- **Evidencia de Cierre Indexada:** `Superación del caso VV-001: interacción sin errores en onChange inicial, feedback de spinner, cookie fijada y redirección a /workspace.`
- **LOCK Previo Requerido:** `LOCK-FIA-A02.03.md APROBADO (Commit: e7b8cba)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir la pantalla principal de autenticación `LoginPage` (`/auth/login`), articulada como una tarjeta central de acceso (`AuthCard`) que ofrece navegación fluida entre pestañas `[Iniciar Sesión]` y `[Crear Cuenta]` (integrando `RegisterTab`), implementando la doctrina de **Validación Empática** en el formulario de login (prohibición estricta de alertas rojas en el `onChange` inicial; la validación se dispara exclusivamente en `onBlur` o en `onSubmit`), botón interactivo `[Entrar]` con estado de carga (spinner y bloqueo de inputs), consumo del `AuthController` y redirección/callback hacia `/workspace` tras la emisión exitosa de la sesión (Caso Forense VV-001).

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación del componente `LoginPage.tsx` en `src/authentication/views/LoginPage.tsx`.
  - Hoja de estilos `LoginPage.module.css` con estética centrada, fondo base `#0B0F17`, tarjeta `#131B26` y bordes `#233144`.
  - Barra superior de pestañas accesibles:
    - Pestaña `[Iniciar Sesión]` (formulario de login).
    - Pestaña `[Crear Cuenta]` (renderiza el componente `RegisterTab` ya probado en `FIA-A02.02`).
  - Formulario de Login (`email` y `password`):
    - **Validación Empática (No agresiva):** Prohibido alertar visualmente de errores mientras el usuario está escribiendo por primera vez (`onChange`).
    - Disparo de errores inline únicamente cuando el campo pierde el foco (`onBlur`) o al presionar `[Entrar]` (`onSubmit`).
  - Matriz de estados UI:
    - *Empty:* Inputs listos para interacción sin advertencias rojas prematuras.
    - *Loading:* Inputs deshabilitados y botón `[Entrar]` con spinner y texto *"Accediendo..."*.
    - *Error:* Banner de error global si el backend devuelve 401 (*"Credenciales incorrectas"*) o 429 (*"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*).
    - *Success (VV-001):* Feedback de acceso concedido y llamada al callback `onSuccess` o redirección hacia `/workspace`.
  - Batería de pruebas de integración con `@testing-library/react` que certifique la validación empática (cero errores en `onChange`), la aparición de errores en `onBlur`, el bloqueo 429 y la transición al Workspace.
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Endpoint `POST /auth/logout` y purga de sesión en backend (pertenece a `FIA-A02.05`).
  - Guard de protección de rutas privadas `SessionAuthGuard` (pertenece a `FIA-A02.05`).
  - Lógica de tareas, listas o calendario.

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Caso Forense VV-001, Principios de Empatía UX).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Validación no agresiva, Matriz de 5 Estados, Tokens).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.2: `Iniciar_Sesion_Login`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Filas PVF-A02.02 / VF-A02.02 y PVF-A02.03 / VF-A02.03).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A02.04).
  - `FIA-A02.03_AS_BUILT.md` (Estado previo bloqueado: `AuthController` y `AuthService` operativos).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A02.03` (Aprobado en commit `e7b8cba`).
  - *Posterior:* La unidad `FIA-A02.05` (Invalidación de Sesión - Logout y AuthGuard) no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato Funcional:** Vista `/auth/login` con selector de pestañas, formulario de login con validación empática en `onBlur`/`onSubmit`, integración con `AuthController` y transición a `/workspace`.
- **Contrato Físico / Module Map:** `src/authentication/views/LoginPage.tsx` (y sus estilos/tests asociados).
- **Contrato de Aislamiento:** Componente desacoplado de enrutadores globales mediante callbacks `onNavigateToWorkspace` u `onSuccess`.

### 6. Restricciones
- La regla de validación empática es innegociable: el primer tipeo en `onChange` no debe marcar inputs como erróneos ni desplegar alertas rojas.
- La conmutación entre pestañas (`[Iniciar Sesión]` y `[Crear Cuenta]`) debe preservar la fluidez sin recargas de página.
- El botón `[Entrar]` debe deshabilitarse durante el estado de carga para prevenir peticiones duplicadas.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/authentication/views/LoginPage.tsx`.
- **Estructura Interna:**
  - `LoginPage`: Tarjeta central con cabecera de marca ("Centra-T"), barra de tabs (`activeTab: 'login' | 'register'`) y renderizado condicional del formulario de login o `<RegisterTab />`.
  - Estado del formulario de Login:
    - `email`, `password`.
    - `touched: { email: boolean, password: boolean }`: Controla si el campo ya ha perdido el foco para activar validación inline.
    - `errors: { email?: string, password?: string, global?: string }`.
    - `isLoading: boolean`.
  - `LoginPageProps`:
    ```typescript
    export interface LoginPageProps {
      authController?: AuthController;
      usersService?: UsersService;
      defaultTab?: 'login' | 'register';
      onNavigateToWorkspace?: () => void;
    }
    ```
- **Fronteras Físicas Autorizadas:** Directorio `src/authentication/views/*`.

### 8. Flujo Operativo
1. El usuario accede a la pantalla de autenticación; por defecto se selecciona la pestaña `[Iniciar Sesión]`.
2. El usuario hace clic en el campo de email e introduce caracteres: no se despliega ninguna alerta roja (`onChange` empático).
3. Si el usuario sale del campo (`onBlur`) dejándolo vacío o con formato inválido, se marca el borde en rojo y se muestra el mensaje de error correspondiente.
4. Al pulsar `[Entrar]`, se validan ambos campos de forma síncrona:
   - Si faltan datos, se resaltan los campos y se detiene el envío.
5. Con datos completos, el botón pasa a estado de carga (*"Accediendo..."*, spinner activado, inputs bloqueados).
6. Se invoca asíncronamente `authController.login({ email, password })`.
7. Si el backend responde 401 (*"Credenciales incorrectas"*) o 429 (*"Demasiados intentos fallidos"*), se muestra el banner de alerta global y se desbloquea el formulario.
8. Si responde 200 OK (Caso VV-001), se muestra feedback de éxito y se invoca `onNavigateToWorkspace()`.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Login exitoso y transición al Workspace - VV-001):**
  - *Input:* Credenciales correctas de un usuario existente.
  - *Resultado:* Pasa a Loading, se recibe la sesión con cookie HttpOnly y se invoca `onNavigateToWorkspace`.
- **Caso 2 (Conmutación reactiva a Pestaña Crear Cuenta):**
  - *Acción:* Clic en la pestaña `[Crear Cuenta]` o en el enlace "¿No tienes cuenta? Regístrate".
  - *Resultado:* Se renderiza el componente `RegisterTab` de forma instantánea.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Validación Empática - Cero errores en tipeo inicial):**
  - *Acción:* El usuario escribe "e" en el campo de email.
  - *Resultado:* Ningún mensaje de error mostrado mientras el campo conserva el foco.
- **Caso Inválido 2 (Error en onBlur):**
  - *Acción:* El usuario sale del campo de email tras escribir "invalido".
  - *Resultado:* Aparece mensaje inline "Formato de email no válido".
- **Caso Inválido 3 (Rechazo 401 por credenciales incorrectas):**
  - *Resultado:* Banner de error global "Credenciales incorrectas".
- **Caso Inválido 4 (Bloqueo 429 por Throttling):**
  - *Resultado:* Banner de alerta "Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos".

### 11. Tests Requeridos
- **Tests de Integración (Testing Library):**
  - Renderizado de tarjeta de autenticación con pestañas `[Iniciar Sesión]` y `[Crear Cuenta]`.
  - **Prueba de Validación Empática:** Escribir en el campo de email sin desenfocar; verificar que `queryByText(/formato de email no válido/i)` es nulo.
  - Desenfocar el campo (`fireEvent.blur`); verificar que se despliega el mensaje de error.
  - Manejo de error 401: Simular rechazo; comprobar que aparece la alerta global.
  - Manejo de bloqueo 429: Simular rechazo de Throttler; comprobar mensaje de bloqueo.
  - Login exitoso (Caso VV-001): Simular 200 OK; verificar llamada a `onNavigateToWorkspace`.
  - Conmutación de pestañas: Clic en `[Crear Cuenta]` monta `RegisterTab`.
- **Evidencia Exigida:** Suite de tests ejecutada en verde con reporte emitido por Vitest.

### 12. Quality Gates (QG-FIA-A02.04)
- `QG-FIA-A02.04-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A02.04-02 · Tests Suite:` 100% de tests de `LoginPage` en verde.
- `QG-FIA-A02.04-03 · Validación Empática Certificada:` Test automatizado confirmando ausencia de errores en `onChange`.
- `QG-FIA-A02.04-04 · Cumplimiento Caso Forense VV-001:` Transición verificada hacia `/workspace` tras login.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `LoginPage` y sus estilos están implementados respetando la validación empática y el selector de pestañas.
2. Los casos de error (401 y 429) y el flujo exitoso (VV-001) están demostrados mediante tests en verde.
3. El 100% de los tests del proyecto pasan con Vitest.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.04.md`, `TEST_REPORT_FIA-A02.04.md` y la propuesta formal de `LOCK-FIA-A02.04.md`.
