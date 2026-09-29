# SPEC-FIA-A02.04 · FORMULARIO LOGIN EMPÁTICO Y TRANSICIÓN (VV-001)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A02.04 · Formulario Login Empático y Transición (VV-001)  
**PVF de Cierre:** PVF-A02.02 · Validación No Agresiva en Formulario de Login y PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001)  
**VF:** VF-A02.02 · Interacción y Validación Empática de Login y VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A02.03.md APROBADO (Commit: `e7b8cba`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar la pantalla visual `LoginPage` (`/auth/login`) en `src/authentication/views/` para Antigravity CLI. Esta unidad conforma la superficie principal de acceso de Centra-T mediante una tarjeta centralizada (`AuthCard`) que integra selector de pestañas entre `[Iniciar Sesión]` y `[Crear Cuenta]` (reutilizando `RegisterTab`), implementa de forma innegociable la **Doctrina de Validación Empática** (cero mensajes de error o alertas rojas en el `onChange` inicial; la validación se dispara exclusivamente en `onBlur` o en `onSubmit`), botón interactivo `[Entrar]` con estado de carga (spinner y bloqueo de inputs), gestión de errores HTTP 401 y 429, y la culminación del **Caso Forense VV-001** garantizando la invocación de `onNavigateToWorkspace` / `onSuccess` tras recibir la sesión segura con cookie HttpOnly.

## 2. Objetivo
Construir y verificar con TDD en tests de integración:
1. Componente `LoginPage` en `src/authentication/views/LoginPage.tsx` con soporte para conmutación fluida entre pestañas `[Iniciar Sesión]` y `[Crear Cuenta]`.
2. Integración de `RegisterTab` en la pestaña `[Crear Cuenta]`, permitiendo navegación de retorno al login.
3. Formulario de inicio de sesión con campos `email` y `password`:
   - **Validación Empática:** Durante el primer tipeo en `onChange`, prohibición absoluta de desplegar mensajes de error o bordes rojos.
   - Validación inline en `onBlur`: Si el usuario abandona el campo con datos incorrectos, desplegar el error correspondiente ("El correo electrónico es obligatorio" o "Formato de email no válido").
   - Validación síncrona en `onSubmit`: Si los campos están incompletos, marcar los errores inline y detener el envío.
4. Estado de carga (*Loading*): Inputs deshabilitados y botón `[Entrar]` con spinner y texto *"Accediendo..."*.
5. Gestión de errores de autenticación:
   - Error 401 (`InvalidCredentialsError`): Banner de error global *"Credenciales incorrectas"*.
   - Error 429 (`TooManyRequestsError`): Banner de alerta global *"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*.
6. Culminación del Caso Forense VV-001: Ante respuesta 200 OK con cookie HttpOnly, feedback de éxito y llamada a `onNavigateToWorkspace` / `onSuccess`.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A02.03_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - `src/users/entities/user.entity.ts`, `dto/register-user.dto.ts`, `dto/user-response.dto.ts`, `repositories/user.repository.ts`, `services/users.service.ts`
  - `src/authentication/dto/auth-response.dto.ts`, `dto/login-credentials.dto.ts`
  - `src/authentication/services/auth.service.ts`, `services/throttler.service.ts`
  - `src/authentication/controllers/auth.controller.ts`
  - `src/authentication/views/RegisterTab.tsx`, `RegisterTab.module.css`, `RegisterTab.test.tsx`
  - `src/workspace/components/*`, `src/hub/components/*`
- **Estado de Tests Actual:** 32/32 tests en verde en la suite global de Vitest.
- **Riesgos Iniciales:** Acoplamiento rígido con el enrutador de Next.js (`useRouter`). Se debe implementar mediante callbacks desacoplados (`onNavigateToWorkspace?: () => void`, `onSuccess?: () => void`) para permitir ejecución pura en Vitest sin simular hooks de navegación complejos.

## 4. Estado Objetivo
El repositorio debe disponer de `LoginPage.tsx`, `LoginPage.module.css` y `LoginPage.test.tsx` en `src/authentication/views/`, plenamente integrado con `AuthController`, `UsersService` y `RegisterTab`.
- **Restricciones negativas explícitas:**
  - Prohibido disparar alertas de error en el `onChange` inicial antes del primer `onBlur` o `onSubmit` (violación de validación empática).
  - Prohibido recargar la página completa al conmutar entre pestañas.
  - Prohibido almacenar contraseñas o tokens de sesión en `localStorage` o `sessionStorage` (violación de seguridad VV-001).
  - Prohibido implementar lógica de logout o AuthGuard en esta unidad (reservado a `FIA-A02.05`).

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Props:**
  ```typescript
  export interface LoginPageProps {
    authController?: AuthController;
    usersService?: UsersService;
    defaultTab?: 'login' | 'register';
    onNavigateToWorkspace?: () => void;
    onSuccess?: () => void;
  }
  ```
- **5.2 Contrato de Geometría e Interfaz:**
  - Contenedor centrado en viewport (`min-height: 100vh`, fondo base `#0B0F17`).
  - Tarjeta central (`AuthCard`): ancho máximo de 440px, fondo `#131B26`, bordes `#233144`, radio 14px, padding 32px 28px.
  - Barra de pestañas accesible (`role="tablist"`): botones con `role="tab"` y estado `aria-selected`.
- **5.3 Contrato de Aislamiento:**
  - La vista delega la autenticación en `AuthController.login({ email, password })`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/authentication/views/LoginPage.tsx`: Componente React de la pantalla de autenticación con pestañas y validación empática.
- `src/authentication/views/LoginPage.module.css`: Hoja de estilos con tokens de Centra-T, diseño de tarjeta central, tabs, spinner y estados de alerta.
- `src/authentication/views/LoginPage.test.tsx`: Batería exhaustiva de tests de integración con `@testing-library/react`.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/authentication/views/RegisterTab.*`: Componente de registro previo intacto.
- `src/authentication/controllers/auth.controller.*`: Controlador de autenticación con throttling.
- `src/authentication/services/*`: Servicios de autenticación y protección de fuerza bruta.
- Todos los componentes de `src/workspace/*`, `src/hub/*` y `src/users/*` (32 tests existentes deben mantenerse en verde).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`.
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Caso Forense VV-001, Principios de Empatía UX), `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10), `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.2), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A02.03_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A02.03`. Desbloquea `FIA-A02.05`.

## 8. Restricciones
- La regla de validación empática es innegociable: el primer tipeo en `onChange` no debe marcar inputs como erróneos ni desplegar alertas rojas bajo ninguna circunstancia.
- Todos los inputs y pestañas deben cumplir WCAG AA: `<label>` vinculados mediante `htmlFor`/`id`, `aria-invalid`, `aria-describedby` y `role="tab"`.
- Los mensajes inline deben ser exactos:
  - Email vacío: *"El correo electrónico es obligatorio"*.
  - Formato email inválido: *"Formato de email no válido"*.
  - Password vacía: *"La contraseña es obligatoria"*.
- Los mensajes globales deben ser exactos:
  - Error 401: *"Credenciales incorrectas"*.
  - Error 429: *"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/authentication/views/LoginPage.test.tsx` la suite de pruebas que valide:
  1. Renderizado de tarjeta con cabecera y pestañas `[Iniciar Sesión]` y `[Crear Cuenta]`.
  2. **Validación Empática:** Escribir en `email` sin desenfocar; verificar ausencia de mensajes de error en `onChange`.
  3. Desenfocar con email inválido (`blur`); verificar aparición de *"Formato de email no válido"*.
  4. Desenfocar con email vacío; verificar *"El correo electrónico es obligatorio"*.
  5. Desenfocar con contraseña vacía; verificar *"La contraseña es obligatoria"*.
  6. Enviar formulario vacío (`onSubmit`); verificar que se muestran errores inline y no se invoca `login`.
  7. Simular error 401; verificar banner de alerta global *"Credenciales incorrectas"*.
  8. Simular bloqueo 429; verificar banner *"Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos"*.
  9. Simular éxito 200 OK (Caso VV-001); verificar que se llama a `onNavigateToWorkspace` / `onSuccess`.
  10. Conmutación reactiva entre pestañas `[Iniciar Sesión]` y `[Crear Cuenta]` (montando `RegisterTab`).
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos responden a la inexistencia de `LoginPage`.
- **Paso 3 — Implementar Mínimo:** Crear `LoginPage.tsx` y `LoginPage.module.css` con estado empático, pestañas y llamadas al controlador (`GREEN`).
- **Paso 4 — Integrar:** Conectar las instancias por defecto de `AuthController` y `UsersService`.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 32 tests previos más los nuevos tests de `LoginPage` (mínimo 40 tests en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A02.04.md`, `TEST_REPORT_FIA-A02.04.md`, redactar la propuesta formal de `LOCK-FIA-A02.04.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### Estructura canónica de `LoginPage.tsx`:
```tsx
import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import { AuthController } from '../controllers/auth.controller';
import { UsersService, InvalidEmailError } from '../../users/services/users.service';
import { InvalidCredentialsError } from '../services/auth.service';
import { TooManyRequestsError } from '../services/throttler.service';
import { RegisterTab } from './RegisterTab';

export interface LoginPageProps {
  authController?: AuthController;
  usersService?: UsersService;
  defaultTab?: 'login' | 'register';
  onNavigateToWorkspace?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  authController = new AuthController(),
  usersService = new UsersService(),
  defaultTab = 'login',
  onNavigateToWorkspace,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Estados del formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    global?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validación auxiliar de email
  const validateEmailValue = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'El correo electrónico es obligatorio';
    }
    try {
      UsersService.validateEmail(trimmed);
      return undefined;
    } catch (err) {
      if (err instanceof InvalidEmailError) {
        return err.message;
      }
      return 'Formato de email no válido';
    }
  };

  // Manejo de cambios (Doctrina Empática: no advertir en el primer tipeo)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmailValue(val) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: val.trim() ? undefined : 'La contraseña es obligatoria',
      }));
    }
  };

  // Manejo de desenfoque (onBlur)
  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmailValue(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({
      ...prev,
      password: password.trim() ? undefined : 'La contraseña es obligatoria',
    }));
  };

  // Envío del formulario de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrors((prev) => ({ ...prev, global: undefined }));

    const emailError = validateEmailValue(email);
    const passwordError = password.trim() ? undefined : 'La contraseña es obligatoria';

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authController.login({ email, password });
      if (response && response.statusCode === 200) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
        if (onNavigateToWorkspace) {
          onNavigateToWorkspace();
        }
      }
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      if (err instanceof InvalidCredentialsError || error?.statusCode === 401) {
        setErrors((prev) => ({ ...prev, global: 'Credenciales incorrectas' }));
      } else if (err instanceof TooManyRequestsError || error?.statusCode === 429) {
        setErrors((prev) => ({
          ...prev,
          global: 'Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          global: error?.message || 'Error inesperado al iniciar sesión',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        {/* Cabecera de Marca */}
        <div className={styles.header}>
          <h1 className={styles.brandTitle}>Centra-T</h1>
          <p className={styles.brandSubtitle}>Gestor Doméstico Integral y Planificador Temporal</p>
        </div>

        {/* Selector de Pestañas */}
        <div className={styles.tabList} role="tablist" aria-label="Opciones de autenticación">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`${styles.tabButton} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Vista Pestaña Iniciar Sesión */}
        {activeTab === 'login' && (
          <div className={styles.tabContent} role="tabpanel">
            {errors.global && (
              <div role="alert" className={styles.globalError}>
                {errors.global}
              </div>
            )}

            {isSuccess && (
              <div role="status" className={styles.successMessage}>
                Acceso concedido. Entrando al Workspace...
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="login-email" className={styles.label}>
                  Correo Electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="tu.email@ejemplo.com"
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                />
                {errors.email && (
                  <span id="login-email-error" role="alert" className={styles.errorMessage}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="login-password" className={styles.label}>
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Tu contraseña"
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                />
                {errors.password && (
                  <span id="login-password-error" role="alert" className={styles.errorMessage}>
                    {errors.password}
                  </span>
                )}
              </div>

              <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (
                  <span className={styles.loadingWrapper}>
                    <span className={styles.spinner} />
                    Accediendo...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className={styles.switchSection}>
              <span className={styles.switchText}>¿No tienes una cuenta?</span>
              <button
                type="button"
                className={styles.switchButton}
                onClick={() => setActiveTab('register')}
              >
                Regístrate
              </button>
            </div>
          </div>
        )}

        {/* Vista Pestaña Crear Cuenta */}
        {activeTab === 'register' && (
          <div className={styles.tabContent} role="tabpanel">
            <RegisterTab
              usersService={usersService}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### Estilos canónicos en `LoginPage.module.css`:
```css
.pageWrapper {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-base, #0B0F17);
  padding: 24px 16px;
  box-sizing: border-box;
  font-family: inherit;
  color: #FFFFFF;
}

.authCard {
  width: 100%;
  max-width: 440px;
  background-color: var(--surface-hub, #131B26);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 14px;
  padding: 32px 28px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.brandTitle {
  font-size: 24px;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.brandSubtitle {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
}

.tabList {
  display: flex;
  border-bottom: 1px solid #233144;
  margin-bottom: 24px;
  gap: 8px;
}

.tabButton {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #94A3B8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.tabButton:hover:not(.activeTab) {
  color: #CBD5E1;
}

.activeTab {
  color: #FFFFFF;
  border-bottom-color: #3B82F6;
  font-weight: 700;
}

.tabContent {
  width: 100%;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  color: #CBD5E1;
}

.input {
  background-color: #0B0F17;
  border: 1px solid #233144;
  border-radius: 8px;
  padding: 10px 12px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  transition: border-color 150ms ease;
  box-sizing: border-box;
  width: 100%;
}

.input:focus {
  border-color: #3B82F6;
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.inputError {
  border-color: #EF4444;
}

.errorMessage {
  font-size: 11px;
  color: #F87171;
  font-weight: 600;
}

.globalError {
  background-color: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #FCA5A5;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.successMessage {
  background-color: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #6EE7B7;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.submitButton {
  background-color: #3B82F6;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms ease;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submitButton:hover:not(:disabled) {
  background-color: #2563EB;
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loadingWrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.switchSection {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #94A3B8;
}

.switchButton {
  background: transparent;
  border: none;
  color: #60A5FA;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.switchButton:hover {
  text-decoration: underline;
}
```

## 11. Tests Requeridos
Estructura canónica de pruebas para `LoginPage.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { AuthController } from '../controllers/auth.controller';
import { InvalidCredentialsError } from '../services/auth.service';
import { TooManyRequestsError } from '../services/throttler.service';

describe('LoginPage Component', () => {
  it('debe renderizar la tarjeta de autenticación con pestañas y formulario de login por defecto', () => {
    render(<LoginPage />);

    expect(screen.getByRole('tab', { name: /iniciar sesión/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /crear cuenta/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('debe cumplir con la Validación Empática: NO mostrar errores en el onChange inicial', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    // Escribir formato incompleto sin salir del foco
    await user.type(emailInput, 'usuario_incompleto');

    // Comprobar ausencia absoluta de errores mientras el campo tiene el foco
    expect(screen.queryByText(/formato de email no válido/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/el correo electrónico es obligatorio/i)).not.toBeInTheDocument();
    expect(emailInput).not.toHaveClass('inputError');
  });

  it('debe mostrar error inline al perder el foco (onBlur) con formato de email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'invalido');
    fireEvent.blur(emailInput);

    expect(screen.getByText(/formato de email no válido/i)).toBeInTheDocument();
  });

  it('debe mostrar error inline al perder el foco (onBlur) con campo vacío', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.blur(emailInput);

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/^contraseña/i);
    fireEvent.blur(passwordInput);

    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
  });

  it('debe validar en onSubmit y bloquear la llamada a login si los campos son inválidos', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn();
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('debe mostrar banner de alerta ante error 401 (Credenciales incorrectas)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new InvalidCredentialsError());
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'valido@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'WrongPassword123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciales incorrectas/i);
    });
  });

  it('debe mostrar banner de bloqueo ante error 429 (Demasiados intentos fallidos)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new TooManyRequestsError(900));
    const mockController = { login: mockLogin } as unknown as AuthController;

    render(<LoginPage authController={mockController} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'atacante@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/demasiados intentos fallidos/i);
    });
  });

  it('debe completar el login exitoso (Caso VV-001) e invocar onNavigateToWorkspace', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      statusCode: 200,
      headers: {
        'Set-Cookie': 'session_token=test-uuid; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400',
      },
      body: {
        user: { id: 'usr-1', email: 'elena@example.com', createdAt: new Date() },
        token: 'test-uuid',
      },
    });
    const mockController = { login: mockLogin } as unknown as AuthController;
    const mockNavigate = vi.fn();

    render(<LoginPage authController={mockController} onNavigateToWorkspace={mockNavigate} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'elena@example.com',
        password: 'Password123!',
      });
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('debe conmutar reactivamente a la pestaña Crear Cuenta y montar RegisterTab', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const registerTabButton = screen.getByRole('tab', { name: /crear cuenta/i });
    await user.click(registerTabButton);

    expect(registerTabButton).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });
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
- `QG-02 · Linting:` `npm run lint` (0 warnings o errores ESLint).
- `QG-03 · Tests Suite:` 100% de la suite en verde (mínimo 40 tests totales pasando en Vitest).
- `QG-04 · Validación Empática Certificada:` Test automatizado que confirma que `onChange` inicial no renderiza errores.
- `QG-05 · Certificación Caso Forense VV-001:` Test de login exitoso confirmando transición al Workspace.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar)",
    "FIA-A02.01: Entidad User, validación de Email RFC 5322, hashing bcrypt (coste 12), DTOs y UsersService con control de unicidad 409",
    "FIA-A02.02: Componente de interfaz RegisterTab con validación inline de contraseñas desiguales (Caso Forense VV-009), matriz de 5 estados y consumo de UsersService",
    "FIA-A02.03: Autenticación segura en backend con AuthController, AuthService, ThrottlerService (fuerza bruta 429) y sesión segura HttpOnly (Caso Forense VV-001)",
    "FIA-A02.04: Vista LoginPage con selector de pestañas (Iniciar Sesión / Crear Cuenta), validación empática en onBlur/onSubmit (Caso Forense VV-001), bloqueo 429 y redirección a /workspace"
  ],
  "active_constraints": [
    "Validación innegociable de doble contraseña (VV-009)",
    "Doctrina de Validación Empática en login: prohibición estricta de alertas rojas en onChange inicial",
    "Emisión y custodia de sesión exclusivamente mediante cookie HttpOnly SameSite=Strict (VV-001)",
    "Consumo desacoplado de AuthController sin acoplamiento a enrutadores de framework"
  ],
  "unlocked_next": "FIA-A02.05 (Invalidación de Sesión - Logout y AuthGuard)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/authentication/views/LoginPage.tsx",
    "src/authentication/views/LoginPage.module.css",
    "src/authentication/views/LoginPage.test.tsx"
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
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px)",
    "hub": "HubContainer (w=380px/colapsado)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "register_tab": "validado_vv009_5_estados",
    "login_page": "empatica_onblur_vv001_transicion"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `LoginPage` y sus estilos están implementados respetando estrictamente la doctrina de validación empática y el selector accesible de pestañas.
2. Los casos de error (401 y 429) y el flujo exitoso (Caso Forense VV-001) están demostrados mediante tests en verde.
3. El 100% de los tests del proyecto (mínimo 40 tests) pasan con Vitest.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.04.md`, `TEST_REPORT_FIA-A02.04.md` y la propuesta formal de `LOCK-FIA-A02.04.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A02.04`. Prohibido implementar lógica de logout o AuthGuard en esta sesión (reservado a `FIA-A02.05`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Doctrina Empática Innegociable:** Asegúrate de que el test que verifica la ausencia de errores en el `onChange` inicial pase limpiamente.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A02.04.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
