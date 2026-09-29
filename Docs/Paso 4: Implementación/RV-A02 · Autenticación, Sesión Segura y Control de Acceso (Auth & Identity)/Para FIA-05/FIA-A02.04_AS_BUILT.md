# CENTRA-T · FIA-A02.04 · FORMULARIO LOGIN EMPÁTICO Y TRANSICIÓN (VV-001) (AS-BUILT)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · DOCTRINA EMPÁTICA Y CASO VV-001 BLINDADOS  
**Evidencia de Cierre:** LOCK-FIA-A02.04.md APROBADO (Commit: `ed76155`)  

---

### 1. Identificación
- **FIA:** `FIA-A02.04`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Implementada:** `Formulario Login Empático y Transición (VV-001)`
- **PVF Satisfecha:** `PVF-A02.02 · Validación No Agresiva en Formulario de Login` y `PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001)`
- **VF Asociada:** `VF-A02.02 · Interacción y Validación Empática de Login` y `VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)`
- **Commit de Cierre (Git):** `ed76155` (feat: `127143d`, test: `655a494`)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A02.04.md Aprobado (41/41 tests en verde, 100% cobertura en login UI y validación empática, 0 errores, 0 warnings)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A02.05.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A02.04.md` y `FIA-A02.04.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura UI de `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10) y el proceso algorítmico 1.2 (`Iniciar_Sesion_Login`) de `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A02.03` (Commit `e7b8cba`).
- **Archivos Base:** Módulos `src/users/`, `src/authentication/` (backend con `AuthController`, `AuthService`, `ThrottlerService`) y componente `RegisterTab` con 32 tests globales en verde.

### 4. Objetivo Implementado
Construcción y verificación de la pantalla y superficie central de acceso `LoginPage` (`/auth/login`) en `src/authentication/views/`:
1. Selector de pestañas accesible entre `[Iniciar Sesión]` y `[Crear Cuenta]` (integrando `RegisterTab`).
2. Blindaje innegociable de la **Doctrina de Validación Empática**: ausencia absoluta de alertas rojas o mensajes de error durante el tipeo inicial en `onChange`.
3. Activación de validación no agresiva en el evento `onBlur` (al abandonar el campo) o al enviar el formulario (`onSubmit`).
4. Estado de carga (*Loading*): Inputs deshabilitados y botón `[Entrar]` con spinner y texto *"Accediendo..."*.
5. Gestión de errores HTTP: banner accesible 401 (*"Credenciales incorrectas"*) y banner 429 (*"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*).
6. Culminación del **Caso Forense VV-001**: feedback visual de éxito e invocación de callbacks desacoplados `onNavigateToWorkspace` y `onSuccess` tras recibir la sesión segura HttpOnly.

### 5. Alcance Final
- Creación de `src/authentication/views/LoginPage.tsx` implementando el ciclo de validación empática, estados UI y consumo de `AuthController`.
- Creación de `src/authentication/views/LoginPage.module.css` con estilos encapsulados, diseño de tarjeta central de 440px y tokens corporativos.
- Creación de `src/authentication/views/LoginPage.test.tsx` con 9 tests de integración exhaustivos con `@testing-library/react`.
- Total de la suite global del proyecto: 41/41 tests pasando en verde con Vitest.
- Actualización de los 3 archivos JSON de estado del repositorio (`context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`).

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato Funcional:** Interfaz gráfica de login con alternancia a registro, validación empática en `onBlur`/`onSubmit`, retroalimentación de spinner y redirección al Workspace.
- **Contrato de Interfaz (Props):**
  ```typescript
  export interface LoginPageProps {
    authController?: AuthController;
    usersService?: UsersService;
    defaultTab?: 'login' | 'register';
    onNavigateToWorkspace?: () => void;
    onSuccess?: () => void;
  }
  ```
- **Contrato Físico / Module Map:** Directorio `src/authentication/views/` con componentes React puramente desacoplados de enrutadores globales.

### 8. Restricciones Finales
- Doctrina empática respetada al 100%: ningún error inline disparado en el `onChange` inicial.
- Cumplimiento de accesibilidad WCAG AA: inputs con `<label>` asociados mediante `htmlFor`/`id`, `aria-invalid`, `aria-describedby` y `role="tab"`.
- Prohibición de almacenamiento de tokens o credenciales en almacenamiento local del navegador (`localStorage`/`sessionStorage`).

### 9. Diseño Técnico Final
- `src/authentication/views/LoginPage.tsx`: Estado local desacoplado (`email`, `password`, `touched`, `errors`, `isLoading`, `isSuccess`), conmutador de pestañas y consumo asíncrono de `AuthController`.
- `src/authentication/views/LoginPage.module.css`: Paleta centrada en `#0B0F17` (fondo), `#131B26` (tarjeta), `#233144` (bordes), `#3B82F6` (acentos) y animación de spinner rotativo.

### 10. Flujo Operativo Final
1. El usuario accede a la vista de login; por defecto se selecciona la pestaña `[Iniciar Sesión]`.
2. El usuario introduce datos: `onChange` actualiza el valor sin desplegar errores mientras no pierda el foco.
3. Al desenfocar (`onBlur`) o al presionar `[Entrar]` (`onSubmit`), se ejecuta la validación empática.
4. Si los datos son válidos, los inputs se deshabilitan y el botón muestra spinner y texto *"Accediendo..."*.
5. Ante respuesta 401 o 429, se despliega el banner de error correspondiente.
6. Ante respuesta 200 OK (Caso Forense VV-001), se muestra mensaje de confirmación y se ejecutan `onSuccess()` y `onNavigateToWorkspace()`.

### 11. Casos Válidos Finales
- **Validado 1 (Caso Forense VV-001):** Credenciales correctas disparan estado Loading, muestran confirmación de acceso y ejecutan `onNavigateToWorkspace` y `onSuccess`.
- **Validado 2 (Conmutación de Pestañas):** Clic en `[Crear Cuenta]` conmuta a la pestaña de registro y monta `RegisterTab`.
- **Validado 3 (Enlace inferior):** Clic en *"¿No tienes una cuenta? Regístrate"* cambia a la pestaña de registro.

### 12. Casos Inválidos Finales
- **Validado 1 (Doctrina Empática en onChange):** Tipeo inicial incompleto o erróneo en el input de email no despliega ningún mensaje de error mientras el campo conserve el foco.
- **Validado 2 (Error en onBlur):** Al salir del campo con email inválido o vacío, se despliega el error inline correspondiente.
- **Validado 3 (Error en onSubmit):** Intento de envío con campos vacíos bloquea la llamada a `authController.login` y resalta los errores.
- **Validado 4 (Error 401):** Respuesta de credenciales incorrectas despliega banner accesible *"Credenciales incorrectas"*.
- **Validado 5 (Bloqueo 429):** Respuesta de exceso de intentos despliega banner accesible *"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*.

### 13. Tests Requeridos Finales
Suite de 41 tests validada al 100% en verde:
- `LoginPage.test.tsx` (9 tests):
  1. Renderizado de tarjeta con pestañas y formulario.
  2. Validación empática en `onChange` inicial sin errores.
  3. Validación en `onBlur` con email inválido.
  4. Validación en `onBlur` con campos vacíos.
  5. Bloqueo en `onSubmit` con campos incompletos.
  6. Banner de error 401.
  7. Banner de bloqueo 429.
  8. Autenticación exitosa VV-001 y transiciones.
  9. Conmutación reactiva a `RegisterTab`.
- Tests previos conservados: 5 en `auth.controller.test.ts`, 8 en `RegisterTab.test.tsx`, 5 en `users.service.test.ts`, 14 en layout/hub/navbar.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (41/41 tests pasando en verde en Vitest).
- `QG-04 · Validación Empática Certificada:` Superado mediante test automatizado.
- `QG-05 · Certificación Caso Forense VV-001:` Superado mediante test de login y transición.

### 15. Archivos Reales Afectados
```
Creados:
- src/authentication/views/LoginPage.tsx
- src/authentication/views/LoginPage.module.css
- src/authentication/views/LoginPage.test.tsx

Modificados:
(Ninguno)
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. Fidelidad total a los requerimientos de la FIA y SPEC.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A02.04` ha completado con éxito su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 41/41 tests en verde, blindaje formal de la doctrina empática y culminación del caso forense VV-001. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y ejecución de **`FIA-A02.05 · Invalidación de Sesión (Logout) y AuthGuard`**, última unidad de cierre de la rebanada vertical `RV-A02`.
