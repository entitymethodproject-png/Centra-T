# SPEC-FIA-A01.02 · MECANISMO COLAPSABLE REACTIVO DEL HUB

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A01.02 · Mecanismo Colapsable Reactivo del Hub  
**PVF de Cierre:** PVF-A01.02 · Colapso y Expansión Reactiva del Hub Lateral  
**VF:** VF-A01.02 · Comportamiento Colapsable del Hub Lateral  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A01.01.md APROBADO (Commit: `0d2c2a8`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la orden técnica ejecutable para materializar el mecanismo de colapso y re-expansión reactiva del Hub (`w=380px` a `0px`) y la expansión adaptativa del Workbench al 100% de la ventana en Antigravity CLI. Esta unidad abarca la creación del componente `HubContainer`, su botón de alternancia accesible y la transición fluida CSS ($\le 200$ms), preservando de forma incondicional el árbol de nodos hijos del Hub en el DOM y aplazando la telemetría de red (`FIA-A01.03`) a la siguiente iteración.

## 2. Objetivo
Lograr que al hacer clic en el botón de toggle del Hub:
1. El ancho del panel Hub transicione de 380px a 0px en un tiempo $\le 200$ms mediante CSS.
2. El contenedor Workbench se expanda para absorber el espacio disponible sin saltos visuales (CLS = 0).
3. Los atributos ARIA del botón toggle se sincronicen reactivamente (`aria-expanded="true"` / `"false"`).
4. El contenido interno del Hub permanezca montado en el DOM para salvaguardar cualquier estado reactivo.

## 3. Estado Actual del Repositorio
*(Basado estrictamente en la Sección 15 de `FIA-A01.01_AS_BUILT.md` y `repo_state.json`)*
- **Archivos y Módulos Existentes:**
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
  - `src/test/setup.ts`, `src/vite-env.d.ts`, `src/theme/tokens.css`
  - `src/workspace/components/WorkspaceLayout.tsx`
  - `src/workspace/components/WorkspaceLayout.module.css`
  - `src/workspace/components/WorkspaceLayout.test.tsx`
  - `context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`
- **Estado de Compilación / Tests Actual:** 4/4 tests en verde. Cero errores de TypeScript.
- **Riesgos Iniciales:** Romper el test semántico existente de `WorkspaceLayout` o causar desbordamientos horizontales durante la animación CSS si no se aplica `overflow: hidden` al colapsar.

## 4. Estado Objetivo
El repositorio debe contar con el componente `HubContainer` en `src/hub/components/`, conectado con `WorkspaceLayout` o capaz de gestionar el colapso del panel lateral.
- **Restricciones negativas explícitas:**
  - Prohibido desmontar (`unmount`) condicionalmente los hijos del Hub con `{isOpen && children}`.
  - Prohibido que la transición CSS supere los 200ms.
  - Prohibido implementar avatares, reloj o telemetría de red en TopNavbar en esta unidad.
  - Prohibido introducir librerías de animación externas.

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Arranque:**
  - El Hub arranca visible por defecto (`isCollapsed = false`, ancho 380px, `aria-expanded="true"`).
- **5.2 Contrato de Geometría / Interfaz:**
  - Transición CSS: `transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1), min-width 200ms ease, opacity 200ms ease`.
  - Estado colapsado: `width: 0px`, `min-width: 0px`, `overflow: hidden`, `padding: 0`.
  - Workbench: `flex: 1`, llenando todo el ancho cuando el Hub colapsa a 0px.
- **5.3 Contrato de Aislamiento:**
  - Estado puramente efímero de UI en memoria (React state). Prohibido sincronizar con backend.
- **5.4 Contrato de Dominio / Datos:**
  ```typescript
  export interface HubContainerProps {
    children?: React.ReactNode;
    initialCollapsed?: boolean;
    onToggle?: (collapsed: boolean) => void;
  }
  ```

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/hub/components/HubContainer.tsx`: Componente contenedor del panel Hub con botón de toggle integrado.
- `src/hub/components/HubContainer.module.css`: Estilos de transición suave ($\le 200$ms) y clases para estado colapsado/expandido.
- `src/hub/components/HubContainer.test.tsx`: Suite de pruebas unitarias y de interacción con React Testing Library.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/workspace/components/WorkspaceLayout.tsx`: Actualizar para integrar `HubContainer` en el slot del Hub o adaptar clases de contención si es necesario.
- `src/workspace/components/WorkspaceLayout.module.css`: Ajustar soporte de ancho dinámico o transiciones en el contenedor lateral si aplica.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/workspace/components/WorkspaceLayout.test.tsx`: Los 4 tests previos deben seguir pasando al 100%.
- `src/theme/tokens.css`, `src/test/setup.ts`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `backend/*`
- `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`, `src/authentication/*`
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_UI.docx`, `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A01.01_AS_BUILT.md`, `FIA-A01.02.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A01.01`. Desbloquea `FIA-A01.03`.

## 8. Restricciones
- El botón de alternancia debe ser navegable por teclado (foco accesible) y exponer atributos ARIA válidos.
- Todo código debe derivar de un test TDD previo en rojo.
- La duración de la transición CSS no puede exceder los 200ms.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:** Escribir en `src/hub/components/HubContainer.test.tsx` los tests que validan:
  1. Renderizado de hijos y estado inicial expandido (`aria-expanded="true"`).
  2. Clic en botón toggle conmuta `aria-expanded` a `"false"` y aplica clase de colapso.
  3. Los hijos del Hub siguen existiendo en el DOM tras el colapso (`toBeInTheDocument()`).
  Comprobar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo responde únicamente a la ausencia del componente `HubContainer`.
- **Paso 3 — Implementar Mínimo:** Crear `HubContainer.tsx` y `HubContainer.module.css` implementando el estado reactivo `isCollapsed`, el botón con icono/etiqueta accesible y las clases CSS con transición de 200ms (`GREEN`).
- **Paso 4 — Integrar:** Conectar `HubContainer` con `WorkspaceLayout.tsx` asegurando que la superficie del Workbench se expanda de forma reactiva al 100% sin generar scrollbar horizontal.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan tanto los tests nuevos de `HubContainer` como los anteriores de `WorkspaceLayout` (100% green).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y verificar cero errores de tipado.
- **Paso 7 — Estado Documental:** Preparar deltas en `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A01.02.md`, `TEST_REPORT_FIA-A01.02.md`, generar propuesta formal de `LOCK-FIA-A01.02.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### Estructura canónica de `HubContainer.tsx`:
```tsx
import React, { useState } from 'react';
import styles from './HubContainer.module.css';

export interface HubContainerProps {
  children?: React.ReactNode;
  initialCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export const HubContainer: React.FC<HubContainerProps> = ({
  children,
  initialCollapsed = false,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Hub lateral"
      className={`${styles.hubContainer} ${isCollapsed ? styles.collapsed : styles.expanded}`}
    >
      <div className={styles.toggleBar}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir panel lateral" : "Colapsar panel lateral"}
          className={styles.toggleButton}
          onClick={handleToggle}
        >
          <span className={styles.toggleIcon}>{isCollapsed ? "›" : "‹"}</span>
        </button>
      </div>
      <div className={styles.contentArea}>
        {children}
      </div>
    </aside>
  );
};
```

### Estilos canónicos en `HubContainer.module.css`:
```css
.hubContainer {
  width: 380px;
  min-width: 380px;
  height: 100%;
  background-color: var(--surface-hub, #131B26);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1),
              min-width 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
}

.hubContainer.collapsed {
  width: 48px;
  min-width: 48px;
}

.toggleBar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.toggleButton {
  background: transparent;
  border: 1px solid var(--border-subtle, #233144);
  color: #94A3B8;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.toggleButton:hover {
  color: #FFFFFF;
  border-color: #3B82F6;
}

.contentArea {
  flex: 1;
  overflow-y: auto;
  transition: opacity 150ms ease;
}

.collapsed .contentArea {
  opacity: 0;
  pointer-events: none;
}
```

## 11. Tests Requeridos
- **11.1 Tests Unitarios:**
  - Montaje de `HubContainer` con estado por defecto expandido (`aria-expanded="true"`).
  - Inyección de hijos y verificación de que se renderizan.
- **11.2 Tests de Integración / UI:**
  ```tsx
  it('debe colapsar el Hub al hacer clic en el botón toggle y actualizar aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <HubContainer>
        <div data-testid="test-content">Contenido Interno</div>
      </HubContainer>
    );

    const toggleBtn = screen.getByRole('button', { name: /colapsar panel lateral/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
  ```
- **11.3 Tests de Regresión:**
  - Ejecutar toda la suite completa: los 4 tests de `WorkspaceLayout` y los tests de `HubContainer` deben estar 100% en verde.
- **11.4 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 7/7 tests combinados).
- `QG-04 · Anti-Drift Scan:` Cero archivos fuera del perímetro autorizado.
- `QG-05 · No-Secret Scan:` Cero credenciales o claves privadas.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A01.01: Inicialización del repositorio y scaffolding del WorkspaceLayout (100vw x 100vh, 2 columnas, Navbar 64px, Hub 380px, Workbench flex:1)",
    "FIA-A01.02: Mecanismo de colapso y expansión reactiva del Hub (380px <-> colapso) con transición CSS <= 200ms y preservación de estado interno"
  ],
  "active_constraints": [
    "Prohibido scroll global en body",
    "Preservar montaje de hijos en Hub colapsado (no unmount destructivo)",
    "Transiciones CSS <= 200ms"
  ],
  "unlocked_next": "FIA-A01.03"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/hub/components/HubContainer.tsx",
    "src/hub/components/HubContainer.module.css",
    "src/hub/components/HubContainer.test.tsx"
  ],
  "files_modified": [
    "src/workspace/components/WorkspaceLayout.tsx",
    "src/workspace/components/WorkspaceLayout.module.css"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "WorkspaceLayout",
    "HubContainer"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "height 64px, role banner",
    "hub": "width 380px (expandido) / 48px o 0px (colapsado), role complementary",
    "workbench": "flex 1 (expande dinámicamente al colapsar el Hub), role main"
  },
  "observable_states": {
    "hub": "reactivo_toggle_expandido_colapsado",
    "active_route": "/workspace"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `HubContainer` y su hoja de estilos están implementados respetando la transición de $\le 200$ms.
2. `WorkspaceLayout` integra o soporta la reactividad del Hub sin romper los tests previos.
3. El árbol de componentes hijos permanece montado en el DOM tras el colapso.
4. Toda la suite de tests (anteriores + nuevos) pasa al 100% en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados con los deltas de las secciones 13, 14 y 15.
6. Se emiten `IMPLEMENTATION_REPORT_FIA-A01.02.md`, `TEST_REPORT_FIA-A01.02.md` y la propuesta formal de `LOCK-FIA-A01.02.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A01.02`. Prohibido adelantar perfiles de usuario o listas de tareas.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el código de producción.
- **Inversión de Autoridad Post-Implementación:** La verdad absoluta la dicta la UI verificada; no deshagas ajustes visuales aprobados para complacer tests obsoletos.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A01.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
