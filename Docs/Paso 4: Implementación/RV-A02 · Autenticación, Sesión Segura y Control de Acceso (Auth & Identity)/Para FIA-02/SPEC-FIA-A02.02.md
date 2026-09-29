# SPEC-FIA-A02.02 · COMPONENTE DE REGISTRO EN UI Y PESTAÑA [CREAR CUENTA] (VV-009)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A02.02 · Componente de Registro en UI y Pestaña [Crear Cuenta] (VV-009)  
**PVF de Cierre:** PVF-A02.01 · Registro de Cuenta y Validación de Doble Contraseña (VV-009)  
**VF:** VF-A02.01 · Registro de Usuario y Validación de Doble Contraseña (VV-009)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A02.01.md APROBADO (Commit: `9106020`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la orden técnica ejecutable para materializar el componente visual de formulario `RegisterTab` en `src/authentication/views/` para Antigravity CLI. La unidad abarca la vista de la pestaña [Crear Cuenta] dentro de la superficie de autenticación, integrando validaciones en cliente para email RFC 5322, política de contraseñas, el **Caso Forense VV-009** (bloqueo absoluto y error inline si las contraseñas no coinciden), la gestión reactiva de los 5 estados de UI (Empty, Loading, Error, Success) y la persistencia real a través de `UsersService`.

## 2. Objetivo
Construir y verificar en tests:
1. Componente `RegisterTab` con campos `email`, `password` y `passwordConfirm`.
2. Validación inline estricta del Caso Forense VV-009: si `password !== passwordConfirm`, mostrar el mensaje inline *"Las contraseñas no coinciden"* y bloquear de inmediato la llamada al servicio.
3. Deshabilitación de inputs y botón durante el estado Loading ("Creando cuenta...").
4. Manejo de colisión 409: si `UsersService` arroja `UserAlreadyExistsError`, mostrar alerta: *"No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión"*.
5. Invocación exitosa del callback `onSuccess` con los datos del usuario registrado al completarse el guardado.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en la Sección 15 de `FIA-A02.01_AS_BUILT.md` y `repo_state.json`)*
- **Archivos Existentes:**
  - `src/users/entities/user.entity.ts`, `dto/register-user.dto.ts`, `dto/user-response.dto.ts`
  - `src/users/repositories/user.repository.ts`, `services/users.service.ts`, `services/users.service.test.ts`
  - `src/workspace/components/*`, `src/hub/components/*`
  - `context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`
- **Estado de Tests Actual:** 19/19 tests en verde en la suite global.
- **Riesgos Iniciales:** Acoplamiento rígido con `next/router` o `next/navigation`. Se debe utilizar el callback `onSuccess` para desacoplar el componente de enrutadores específicos en el entorno de pruebas de Vitest.

## 4. Estado Objetivo
El repositorio debe contar con el componente `RegisterTab` y su suite de pruebas en `src/authentication/views/`, listo para ser montado en la tarjeta de autenticación o modales del sistema.
- **Restricciones negativas explícitas:**
  - Prohibido omitir la validación de doble contraseña del Caso Forense VV-009.
  - Prohibido maquetar el formulario de Login en esta unidad (`LoginPage.tsx` pertenece a `FIA-A02.03`).
  - Prohibido almacenar contraseñas en texto plano en almacenamiento local.

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Props:**
  ```typescript
  export interface RegisterTabProps {
    usersService?: UsersService;
    onSuccess?: (user: UserResponseDto) => void;
    onSwitchToLogin?: () => void;
  }
  ```
- **5.2 Contrato de Geometría / Interfaz:**
  - Formulario con ancho máximo de 420px, fondo `--surface-hub` (`#131B26`), bordes `--border-subtle` (`#233144`), campos con labels asociados y estados de foco con borde `--accent` (`#3B82F6`).
- **5.3 Contrato de Aislamiento:**
  - El componente delega la persistencia y hashing exclusivamente en `UsersService`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/authentication/views/RegisterTab.tsx`: Componente React de formulario con validación inline.
- `src/authentication/views/RegisterTab.module.css`: Estilos de formulario, inputs, alertas inline y botones.
- `src/authentication/views/RegisterTab.test.tsx`: Suite de pruebas de integración con `@testing-library/react`.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Todos los archivos de `src/users/*` (5 tests de dominio de usuarios deben continuar en verde).
- Todos los archivos de `src/workspace/*` y `src/hub/*` (14 tests visuales previos intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`.
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Caso Forense VV-009), `SUITE_ARQUITECTURA_UI.docx`, `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.1), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A02.01_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A02.01`. Desbloquea `FIA-A02.03`.

## 8. Restricciones
- La verificación de coincidencia de contraseñas es innegociable.
- Todos los inputs deben contar con sus respectivos elementos `<label>` asociados mediante `htmlFor` e `id` para WCAG AA.
- El mensaje de error de coincidencia de contraseñas debe ser textualmente: *"Las contraseñas no coinciden"*.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/authentication/views/RegisterTab.test.tsx` la batería de tests que validen:
  1. Renderizado de campos (Email, Contraseña, Confirmar Contraseña) y botón [Crear Cuenta].
  2. **Caso Forense VV-009:** Introducir contraseñas desiguales; verificar que aparece el mensaje inline "Las contraseñas no coinciden" y que `createUser` nunca es llamado.
  3. Comprobar que email con formato inválido muestra "Formato de email no válido".
  4. Comprobar que contraseña débil muestra "La contraseña no cumple los requisitos mínimos de seguridad".
  5. Comprobar que durante la petición los inputs se deshabilitan y el botón muestra "Creando cuenta...".
  6. Comprobar que ante error 409 de colisión se despliega la alerta global de registro.
  7. Comprobar que con datos válidos se crea el usuario y se invoca `onSuccess`.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo responde a la ausencia de `RegisterTab`.
- **Paso 3 — Implementar Mínimo:** Crear `RegisterTab.tsx` y `RegisterTab.module.css` con el estado de formulario, control de errores inline y bloqueo VV-009 (`GREEN`).
- **Paso 4 — Integrar:** Conectar el componente con `UsersService` predeterminado y verificar el tipado estricto de las props.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 19 tests previos más los nuevos tests de `RegisterTab` (mínimo 24-25 tests en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A02.02.md`, `TEST_REPORT_FIA-A02.02.md`, redactar la propuesta formal de `LOCK-FIA-A02.02.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### Estructura canónica de `RegisterTab.tsx`:
```tsx
import React, { useState } from 'react';
import styles from './RegisterTab.module.css';
import { UsersService, UserAlreadyExistsError, InvalidEmailError, WeakPasswordError } from '../../users/services/users.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface RegisterTabProps {
  usersService?: UsersService;
  onSuccess?: (user: UserResponseDto) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterTab: React.FC<RegisterTabProps> = ({
  usersService = new UsersService(),
  onSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
    global?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Caso Forense VV-009: Validación innegociable de doble contraseña
    if (password !== passwordConfirm) {
      setErrors((prev) => ({ ...prev, passwordConfirm: 'Las contraseñas no coinciden' }));
      return;
    }

    try {
      UsersService.validateEmail(email);
    } catch (err) {
      if (err instanceof InvalidEmailError) {
        setErrors((prev) => ({ ...prev, email: err.message }));
        return;
      }
    }

    try {
      UsersService.validatePassword(password);
    } catch (err) {
      if (err instanceof WeakPasswordError) {
        setErrors((prev) => ({ ...prev, password: err.message }));
        return;
      }
    }

    setIsLoading(true);

    try {
      const createdUser = await usersService.createUser({ email, password });
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        setErrors({
          global: 'No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión',
        });
      } else {
        setErrors({ global: 'Error inesperado al registrar el usuario' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Crear Cuenta</h2>
      <p className={styles.subtitle}>Comienza a organizar tu hogar con Centra-T</p>

      {errors.global && (
        <div role="alert" className={styles.globalError}>
          {errors.global}
        </div>
      )}

      {isSuccess && (
        <div role="status" className={styles.successMessage}>
          Cuenta creada correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="register-email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu.email@ejemplo.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span id="register-email-error" className={styles.errorMessage}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="register-password" className={styles.label}>
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Mínimo 8 caracteres (mayús, núm, símb)"
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span id="register-password-error" className={styles.errorMessage}>
              {errors.password}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="register-password-confirm" className={styles.label}>
            Confirmar Contraseña
          </label>
          <input
            id="register-password-confirm"
            type="password"
            value={passwordConfirm}
            disabled={isLoading}
            aria-invalid={!!errors.passwordConfirm}
            aria-describedby={errors.passwordConfirm ? 'register-password-confirm-error' : undefined}
            className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
            placeholder="Repite tu contraseña"
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {errors.passwordConfirm && (
            <span id="register-password-confirm-error" className={styles.errorMessage}>
              {errors.passwordConfirm}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className={styles.switchSection}>
          <span className={styles.switchText}>¿Ya tienes una cuenta?</span>
          <button
            type="button"
            className={styles.switchButton}
            onClick={onSwitchToLogin}
          >
            Inicia Sesión
          </button>
        </div>
      )}
    </div>
  );
};
```

### Estilos canónicos en `RegisterTab.module.css`:
```css
.container {
  width: 100%;
  max-width: 420px;
  background-color: var(--surface-hub, #131B26);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 14px;
  padding: 28px 24px;
  box-sizing: border-box;
  color: #FFFFFF;
}

.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: #FFFFFF;
}

.subtitle {
  font-size: 13px;
  color: #94A3B8;
  margin: 0 0 20px 0;
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
}

.successMessage {
  background-color: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #6EE7B7;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
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
}

.submitButton:hover:not(:disabled) {
  background-color: #2563EB;
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
- **11.1 Test del Caso Forense VV-009:**
  ```tsx
  it('debe bloquear el envío y mostrar error inline cuando las contraseñas no coinciden (VV-009)', async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.fn();
    const mockService = { createUser: mockCreateUser } as unknown as UsersService;

    render(<RegisterTab usersService={mockService} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'elena@example.com');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password999!');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
  ```
- **11.2 Test de Colisión 409:**
  - Simular rechazo con `UserAlreadyExistsError`; comprobar que aparece la alerta global.
- **11.3 Test de Registro Exitoso:**
  - Simular respuesta 201; comprobar que se llama a `onSuccess`.
- **11.4 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 24 tests en total).
- `QG-04 · Superación del Caso Forense VV-009:` Test automatizado específico de contraseñas desiguales en verde.
- `QG-05 · Anti-Drift Scan:` Cero archivos fuera de `src/authentication/views/`.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar)",
    "FIA-A02.01: Entidad User, validación de Email RFC 5322, hashing bcrypt (coste 12), DTOs y UsersService con control de unicidad 409",
    "FIA-A02.02: Componente de interfaz RegisterTab con validación inline de contraseñas desiguales (Caso Forense VV-009), matriz de 5 estados y consumo de UsersService"
  ],
  "active_constraints": [
    "Validación innegociable de doble contraseña (VV-009)",
    "Contención perimetral de formulario sin scroll parásito",
    "Consumo desacoplado de UsersService sin manipulación directa de credenciales"
  ],
  "unlocked_next": "FIA-A02.03 (Autenticación Exitosa y Sesión Segura HttpOnly - VV-001)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/authentication/views/RegisterTab.tsx",
    "src/authentication/views/RegisterTab.module.css",
    "src/authentication/views/RegisterTab.test.tsx"
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
    "auth_surface": "RegisterTab (max-width 420px, card container)"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "register_tab": "validado_vv009_5_estados"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `RegisterTab` y sus estilos están implementados respetando la accesibilidad WCAG AA.
2. El Caso Forense VV-009 queda verificado con test automatizado de contraseñas desiguales.
3. El componente se conecta limpiamente con `UsersService`.
4. El 100% de los tests del proyecto (mínimo 24 tests) pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten `IMPLEMENTATION_REPORT_FIA-A02.02.md`, `TEST_REPORT_FIA-A02.02.md` y `LOCK-FIA-A02.02.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A02.02`. Prohibido crear vistas de Login o lógica de tokens JWT en esta sesión.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Blindaje Caso Forense VV-009:** Asegúrate de que el test de contraseñas desiguales sea exhaustivo y pase limpiamente.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A02.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
