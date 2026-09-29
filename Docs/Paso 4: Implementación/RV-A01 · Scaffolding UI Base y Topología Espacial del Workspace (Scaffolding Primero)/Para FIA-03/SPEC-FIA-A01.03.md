# SPEC-FIA-A01.03 · TOPNAVBAR CON PERFIL Y TELEMETRÍA DE RED

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A01.03 · TopNavbar con Perfil y Telemetría de Red  
**PVF de Cierre:** PVF-A01.03 · Barra de Navegación Superior y Telemetría Visual  
**VF:** VF-A01.03 · Barra de Navegación Superior y Telemetría Visual  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A01.02.md APROBADO (Commit: `1aaf541`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la orden técnica ejecutable para implementar el componente `TopNavbar` (h=64px) en Antigravity CLI, dotándolo de la marca visual "Centra-T", una píldora reactiva de telemetría de red (`navigator.onLine` / eventos de ventana), la ficha de perfil de usuario con avatar y el botón accesible de cierre de sesión con emisión de callback `onLogout`. Esta unidad cierra formalmente la rebanada vertical `RV-A01` (Scaffolding Primero).

## 2. Objetivo
Materializar en la interfaz:
1. Barra fija `TopNavbar` a 64px de altura fijada en la parte superior del Workspace.
2. Píldora de conectividad reactiva accesible con `role="status"` y `aria-live="polite"`:
   - "Online" con dot verde (`#10B981`) cuando el navegador está conectado.
   - "Offline" con dot ámbar (`#F59E0B`) cuando se pierde la conexión.
3. Ficha de perfil de usuario mostrando avatar (con inicial o imagen) y nombre/email.
4. Botón interactivo [Cerrar Sesión] accesible que dispara el callback `onLogout`.
5. Integración por defecto en `WorkspaceLayout.tsx` conservando el 100% de los tests previos.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en la Sección 15 de `FIA-A01.02_AS_BUILT.md` y `repo_state.json`)*
- **Archivos Existentes:**
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
  - `src/test/setup.ts`, `src/vite-env.d.ts`, `src/theme/tokens.css`
  - `src/workspace/components/WorkspaceLayout.tsx`, `WorkspaceLayout.module.css`, `WorkspaceLayout.test.tsx`
  - `src/hub/components/HubContainer.tsx`, `HubContainer.module.css`, `HubContainer.test.tsx`
  - `context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`
- **Estado de Tests Actual:** 8/8 tests en verde.
- **Riesgos Iniciales:** Fugas de memoria por no desuscribir los listeners de eventos de ventana (`window.removeEventListener('online', ...)` y `window.removeEventListener('offline', ...)`) al desmontar el componente.

## 4. Estado Objetivo
El Workspace renderiza de forma nativa su `TopNavbar` en la región superior, escuchando activamente el estado de red y ofreciendo la acción de logout.
- **Restricciones negativas explícitas:**
  - Prohibido acoplar llamadas HTTP a endpoints de autenticación backend (`POST /logout` pertenece a `RV-A02`).
  - Prohibida la instalación de librerías de iconos pesadas de terceros.
  - Prohibido alterar la altura nominal de 64px de la cabecera.

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Arranque:**
  - `WorkspaceLayout.tsx` monta `TopNavbar` por defecto en su slot `navbarSlot`.
- **5.2 Contrato de Geometría / Interfaz:**
  - `height: 64px`, `background: var(--surface-hub, #131B26)` o `#0B0F17`, borde inferior `1px solid #233144`.
  - Píldora de red: padding `4px 10px`, border-radius `999px`, fuente `12px`, dot circular de 8px.
- **5.3 Contrato de Aislamiento:**
  - Detección de red basada estrictamente en la API del navegador (`window.navigator.onLine` y eventos del DOM).
- **5.4 Contrato de Dominio / Datos:**
  ```typescript
  export interface UserProfileData {
    name: string;
    email?: string;
    avatarUrl?: string;
  }

  export interface TopNavbarProps {
    user?: UserProfileData;
    onLogout?: () => void;
  }
  ```

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/workspace/components/TopNavbar.tsx`: Componente de navegación superior con badge y perfil.
- `src/workspace/components/TopNavbar.module.css`: Estilos encapsulados con tokens oficiales.
- `src/workspace/components/TopNavbar.test.tsx`: Suite de pruebas unitarias y de simulación de eventos de red.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/workspace/components/WorkspaceLayout.tsx`: Actualizar para inyectar `<TopNavbar />` por defecto en el `navbarSlot` cuando no se provee slot externo.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/workspace/components/WorkspaceLayout.test.tsx`: Los 4 tests del layout deben seguir pasando al 100%.
- `src/hub/components/HubContainer.tsx` y su suite de tests (4 tests).
- `src/theme/tokens.css`, `src/test/setup.ts`, `vite.config.ts`, `vitest.config.ts`.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `backend/*`
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`, `src/authentication/*`
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_UI.docx`, `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A01.02_AS_BUILT.md`, `FIA-A01.03.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A01.02`. Cierra `RV-A01` y desbloquea `RV-A02`.

## 8. Restricciones
- La altura debe ser invariante a 64px (`height: 64px`, `box-sizing: border-box`).
- Limpieza obligatoria de event listeners en la función de cleanup del hook `useEffect`.
- Todo código de producción debe nacer de un test previo en rojo (TDD).

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:** Escribir en `src/workspace/components/TopNavbar.test.tsx` los tests que validen:
  1. Renderizado de la marca "Centra-T" y el nombre/avatar del usuario.
  2. Píldora de estado de red inicial en estado "Online".
  3. Mutación dinámica de la píldora a "Offline" al emitir el evento `offline` en `window`.
  4. Reversión a "Online" al emitir el evento `online` en `window`.
  5. Disparo del callback `onLogout` al hacer clic en el botón [Cerrar Sesión].
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo responde exclusivamente a la ausencia de `TopNavbar`.
- **Paso 3 — Implementar Mínimo:** Crear `TopNavbar.tsx` y `TopNavbar.module.css` con el estado local de red (`navigator.onLine`), los listeners en `useEffect` con limpieza en unmount y los elementos de interfaz (`GREEN`).
- **Paso 4 — Integrar:** Enlazar `<TopNavbar />` en `WorkspaceLayout.tsx` asegurando que el rol `banner` sigue presente y que no se altera el comportamiento del Hub ni del Workbench.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 8 tests anteriores más los nuevos tests de `TopNavbar` (mínimo 12-13 tests en verde al 100%).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado de la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A01.03.md`, `TEST_REPORT_FIA-A01.03.md`, redactar la propuesta formal de `LOCK-FIA-A01.03.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### Estructura canónica de `TopNavbar.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TopNavbar.module.css';

export interface UserProfileData {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface TopNavbarProps {
  user?: UserProfileData;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user = { name: 'Usuario Demo' },
  onLogout,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={styles.navbarWrapper}>
      <div className={styles.brandSection}>
        <span className={styles.brandTitle}>Centra-T</span>
      </div>

      <div className={styles.controlsSection}>
        <div
          role="status"
          aria-live="polite"
          className={`${styles.networkBadge} ${isOnline ? styles.online : styles.offline}`}
        >
          <span className={styles.networkDot} />
          <span className={styles.networkLabel}>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        <div className={styles.profileSection} aria-label="Perfil de usuario">
          <div className={styles.avatarCircle} aria-hidden="true">
            {avatarInitial}
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>

        <button
          type="button"
          aria-label="Cerrar sesión"
          className={styles.logoutButton}
          onClick={onLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
```

### Estilos canónicos en `TopNavbar.module.css`:
```css
.navbarWrapper {
  height: 64px;
  width: 100%;
  background-color: var(--surface-hub, #131B26);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 12px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.brandTitle {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #FFFFFF;
}

.controlsSection {
  display: flex;
  align-items: center;
  gap: 16px;
}

.networkBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid transparent;
}

.networkBadge.online {
  background-color: rgba(16, 185, 129, 0.12);
  color: #34D399;
  border-color: rgba(16, 185, 129, 0.3);
}

.networkBadge.offline {
  background-color: rgba(245, 158, 11, 0.12);
  color: #FBBF24;
  border-color: rgba(245, 158, 11, 0.3);
}

.networkDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.profileSection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatarCircle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #202D3F;
  border: 1px solid #364863;
  color: #93C5FD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.userName {
  font-size: 13px;
  color: #E2E8F0;
  font-weight: 600;
}

.logoutButton {
  background: transparent;
  border: 1px solid #33445C;
  color: #94A3B8;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.logoutButton:hover {
  background-color: rgba(239, 68, 68, 0.12);
  color: #F87171;
  border-color: rgba(239, 68, 68, 0.3);
}
```

## 11. Tests Requeridos
- **11.1 Tests Unitarios:**
  - Renderizado de marca "Centra-T" y avatar con nombre del usuario.
  - Comprobación de que hacer clic en el botón [Cerrar Sesión] dispara `onLogout`.
- **11.2 Tests de Integración / Reactividad de Red:**
  ```tsx
  it('debe conmutar dinámicamente el badge de Online a Offline y viceversa', () => {
    render(<TopNavbar />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent(/online/i);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(badge).toHaveTextContent(/offline/i);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(badge).toHaveTextContent(/online/i);
  });
  ```
- **11.3 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 12 tests en total).
- `QG-04 · Anti-Drift Scan:` Cero archivos fuera del perímetro autorizado.
- `QG-05 · No-Secret Scan:` Cero credenciales o claves privadas.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A01.01: Inicialización del repositorio y scaffolding del WorkspaceLayout (100vw x 100vh, 2 columnas, Navbar 64px, Hub 380px, Workbench flex:1)",
    "FIA-A01.02: Mecanismo de colapso y expansión reactiva del Hub (380px <-> colapso) con transición CSS <= 200ms y preservación de estado interno",
    "FIA-A01.03: TopNavbar con telemetría de red reactiva (online/offline), ficha de perfil de usuario y botón accesible de logout"
  ],
  "active_constraints": [
    "Prohibido scroll global en body",
    "Preservar montaje de hijos en Hub colapsado",
    "Navbar fijado a altura 64px",
    "Rebanada RV-A01 (Scaffolding UI Base) COMPLETADA Y BLOQUEADA"
  ],
  "unlocked_next": "RV-A02 · FIA-A02.01 (Entidad User, VO Email, Hashing y POST /users)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/workspace/components/TopNavbar.tsx",
    "src/workspace/components/TopNavbar.module.css",
    "src/workspace/components/TopNavbar.test.tsx"
  ],
  "files_modified": [
    "src/workspace/components/WorkspaceLayout.tsx"
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
    "active_route": "/workspace"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TopNavbar` y su hoja de estilos están implementados respetando la altura de 64px.
2. La telemetría de red reacciona inmediatamente a los eventos `online` y `offline` del navegador.
3. El botón [Cerrar Sesión] dispara su callback de evento.
4. Toda la suite de tests (mínimo 12 tests) pasa al 100% en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados y consolidan el cierre formal de `RV-A01`.
6. Se emiten `IMPLEMENTATION_REPORT_FIA-A01.03.md`, `TEST_REPORT_FIA-A01.03.md` y `LOCK-FIA-A01.03.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A01.03`. Prohibido crear endpoints de backend o lógica de auth JWT todavía.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Limpieza de Recursos:** Asegura que los event listeners de `window` se desuscriban en el cleanup de React.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A01.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
