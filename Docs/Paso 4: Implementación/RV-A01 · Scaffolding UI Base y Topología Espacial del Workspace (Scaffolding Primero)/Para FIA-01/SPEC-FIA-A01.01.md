# SPEC-FIA-A01.01 · SHELL Y LAYOUT BASE DEL WORKSPACE (2 COL)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A01.01 · Shell y Layout Base del Workspace (2 Col)  
**PVF de Cierre:** PVF-A01.01 · Renderizado del Shell Base y Layout de 2 Columnas  
**VF:** VF-A01.01 · Shell y Topología Espacial del Workspace  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** No aplica: primera FIA de la secuencia (unidad inaugural)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la ficha táctica inaugural `FIA-A01.01` en una especificación técnica de construcción ejecutable y determinista para Antigravity CLI. Esta orden delimita única y exclusivamente la inicialización del proyecto limpio en `/home/hnoloh/Escritorio/Centra-T` y el montaje estructural del layout bidimensional a pantalla completa (`WorkspaceLayout`), postergando de forma estricta el colapso del Hub (`FIA-A01.02`), la telemetría de red (`FIA-A01.03`) y la lógica de acordeones o calendarios a unidades posteriores.

## 2. Objetivo
Materializar en el código la topología espacial de pantalla completa (100vw x 100vh) compuesta por:
1. Barra superior fija (`TopNavbar`, h=64px, rol `banner`).
2. Contenedor lateral izquierdo (`Hub`, w=380px, rol `complementary`).
3. Superficie interactiva principal (`Workbench`, flex: 1, rol `main`).
El contenedor debe garantizar contención perimetral estricta sin scroll en `body`, cero saltos visuales (CLS = 0) y contraste WCAG AA bajo la paleta canónica (`#0B0F17` base, `#131B26` Hub, `#233144` bordes).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en arranque inaugural)*
- **Archivos y Módulos Existentes:** Arranque en repositorio limpio / inicialización base. No existen archivos previos.
- **Estado de Compilación / Tests Actual:** Inexistente (se inicializará en esta unidad).
- **Riesgos Iniciales:** Colisión de versiones de React/Next o configuraciones de CSS que habiliten scroll horizontal involuntario en la ventana.

## 4. Estado Objetivo
El repositorio debe quedar inicializado con soporte TypeScript estricto, React 19 / Next.js (o entorno Vite/React según configuración base del workspace), suite de pruebas unitarias/integración funcional (Vitest + React Testing Library) y los 3 JSONs de estado en la raíz del proyecto.
- **Restricciones negativas explícitas:**
  - Prohibido scrollbar horizontal o vertical en `body` o `html`.
  - Prohibido botón o lógica de colapso en esta unidad.
  - Prohibida persistencia en localStorage/cookies no autorizada.
  - Prohibido renderizar acordeones internos, listas de tareas o celdas de calendario.

## 5. Contratos Afectados
- **5.1 Contrato de Entrada / Arranque:**
  - La ruta `/` o `/workspace` monta `WorkspaceLayout` como componente raíz envolvente.
- **5.2 Contrato de Geometría / Interfaz (zug-DSL Módulo 2.1):**
  - Viewport fijado a `100vw x 100vh`, `overflow: hidden`, padding exterior 16px.
  - Columna izquierda (Hub): `w=380px` (33% responsive con límites 320px..420px), fondo `#131B26`, borde `#233144`.
  - Columna derecha (Workbench): `flex: 1` (67% restante).
- **5.3 Contrato de Aislamiento:**
  - El layout es un cascarón visual aséptico puro (Pure Presentational Shell). Prohibido inyectar stores de negocio o peticiones de red.
- **5.4 Contrato de Dominio / Datos:**
  - Props tipadas mediante interfaz estricta `WorkspaceLayoutProps`:
    ```typescript
    export interface WorkspaceLayoutProps {
      navbarSlot?: React.ReactNode;
      hubSlot?: React.ReactNode;
      workbenchSlot?: React.ReactNode;
      children?: React.ReactNode;
    }
    ```

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `package.json`: Configuración base de dependencias y scripts de ejecución.
- `tsconfig.json`: Configuración TypeScript con tipado estricto (`strict: true`).
- `vite.config.ts` (o `next.config.mjs`): Configuración de empaquetador y entorno de ejecución.
- `vitest.config.ts` (o config de Jest): Entorno de testing con soporte jsdom y setup de `@testing-library/jest-dom`.
- `src/workspace/components/WorkspaceLayout.tsx`: Implementación del contenedor raíz de 2 columnas y Navbar.
- `src/workspace/components/WorkspaceLayout.module.css`: Estilos encapsulados con tokens semánticos oficiales.
- `src/workspace/components/WorkspaceLayout.test.tsx`: Suite de pruebas unitarias y de accesibilidad con RTL.
- `src/theme/tokens.css` (o definición de variables de estilo): Paleta semántica `#0B0F17`, `#131B26`, `#233144`, etc.
- `context_accumulated.json`: Archivo raíz de memoria acumulada.
- `repo_state.json`: Archivo raíz de estado físico del repositorio.
- `ui_state_accumulated.json`: Archivo raíz de estado visual observable.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno (unidad inaugural en repositorio limpio).

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Ninguno (unidad inaugural).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- Prohibido crear carpetas en backend (`backend/*`).
- Prohibido crear módulos de lógica (`src/tasks/*`, `src/shopping/*`, `src/cleaning/*`, `src/authentication/*`).
- Prohibido crear carpetas genéricas (`utils/`, `shared/`, `helpers/`, `common/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `SUITE_ARQUITECTURA_UI.docx`, `Centra-T Pseudocódigo (unificado).odt` (Módulo 2.1), `FIA-A01.01.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/jest-dom`.
- **Dependencia Secuencial:** Requiere inicialización limpia. Desbloquea `FIA-A01.02`.

## 8. Restricciones
- Prohibido el uso de librerías de componentes UI pesadas no autorizadas (usar CSS nativo / CSS Modules con tokens).
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).
- Prohibido alterar las medidas de referencia: Navbar = 64px, Hub = 380px, Padding = 16px.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:** Inicializar entorno base de proyecto y escribir en `src/workspace/components/WorkspaceLayout.test.tsx` los tests que validan la presencia de los roles semánticos `banner`, `complementary` y `main`, y la contención de layout. Ejecutar el test y comprobar que falla (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que el fallo del test responde únicamente a la ausencia del componente `WorkspaceLayout` y no a un error de configuración de Vitest/TypeScript.
- **Paso 3 — Implementar Mínimo:** Crear `WorkspaceLayout.tsx` y su hoja de estilos con los tokens de color oficiales, montando los tres elementos HTML5 con sus respectivos roles y restricciones geométricas (`GREEN`).
- **Paso 4 — Integrar:** Verificar que los slots opcionales `navbarSlot`, `hubSlot` y `workbenchSlot` renderizan correctamente contenido inyectado sin alterar las dimensiones perimetrales.
- **Paso 5 — Ejecutar Tests:** Correr la suite con `npm run test` y verificar 100% de tests en verde.
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y verificar cero errores de tipado.
- **Paso 7 — Estado Documental:** Inicializar y registrar los deltas en `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A01.01.md`, `TEST_REPORT_FIA-A01.01.md`, redactar la propuesta de `LOCK-FIA-A01.01.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos
Estructura JSX canónica requerida para `WorkspaceLayout.tsx`:
```tsx
import React from 'react';
import styles from './WorkspaceLayout.module.css';

export interface WorkspaceLayoutProps {
  navbarSlot?: React.ReactNode;
  hubSlot?: React.ReactNode;
  workbenchSlot?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  navbarSlot,
  hubSlot,
  workbenchSlot,
}) => {
  return (
    <div className={styles.workspaceShell}>
      <header role="banner" className={styles.navbarRegion}>
        {navbarSlot || <div data-testid="navbar-placeholder">TopNavbar (64px)</div>}
      </header>
      <div className={styles.bodyRegion}>
        <aside role="complementary" aria-label="Hub lateral" className={styles.hubRegion}>
          {hubSlot || <div data-testid="hub-placeholder">Hub Lateral (380px)</div>}
        </aside>
        <main role="main" aria-label="Lienzo de trabajo" className={styles.workbenchRegion}>
          {workbenchSlot || <div data-testid="workbench-placeholder">Workbench / Calendario</div>}
        </main>
      </div>
    </div>
  );
};
```

## 11. Tests Requeridos
- **11.1 Tests Unitarios:**
  - Renderizado sin errores de `WorkspaceLayout`.
  - Inyección y renderizado de nodos en `navbarSlot`, `hubSlot` y `workbenchSlot`.
- **11.2 Tests de Integración / UI:**
  ```tsx
  it('debe contener los roles semánticos banner, complementary y main', () => {
    render(<WorkspaceLayout />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /hub lateral/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
  });
  ```
- **11.3 Tests Negativos y de Regresión:**
  - Comprobación de que el contenedor raíz posee la clase con `overflow: hidden` para evitar scroll parásito en viewport.
- **11.4 Comandos de Ejecución:**
  ```bash
  npm run test
  npm run typecheck
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores de TypeScript).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde sin exclusiones (`it.skip`).
- `QG-04 · Anti-Drift Scan:` Verificación de que no existen archivos fuera de `src/workspace/` o configuración raíz.
- `QG-05 · No-Secret Scan:` Cero credenciales o claves privadas.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A01.01: Inicialización del repositorio y scaffolding del WorkspaceLayout (100vw x 100vh, 2 columnas, Navbar 64px, Hub 380px, Workbench flex:1)"
  ],
  "active_constraints": [
    "Prohibido scroll global en body",
    "Hub fijado a 380px (pendiente colapso en FIA-A01.02)",
    "Uso estricto de tokens de color (#0B0F17, #131B26, #233144)"
  ],
  "unlocked_next": "FIA-A01.02"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "vitest.config.ts",
    "src/theme/tokens.css",
    "src/workspace/components/WorkspaceLayout.tsx",
    "src/workspace/components/WorkspaceLayout.module.css",
    "src/workspace/components/WorkspaceLayout.test.tsx",
    "context_accumulated.json",
    "repo_state.json",
    "ui_state_accumulated.json"
  ],
  "files_modified": [],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "WorkspaceLayout"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "height 64px, role banner",
    "hub": "width 380px, role complementary, background #131B26",
    "workbench": "flex 1, role main"
  },
  "observable_states": {
    "hub": "fijo_expandido",
    "active_route": "/workspace"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. El proyecto en `/home/hnoloh/Escritorio/Centra-T` está inicializado y compila limpiamente.
2. `WorkspaceLayout.tsx` y su hoja de estilos están implementados respetando la topología oficial.
3. La suite de pruebas `WorkspaceLayout.test.tsx` pasa al 100% en verde con Vitest.
4. Los 3 JSONs de estado (`context_accumulated.json`, `repo_state.json`, `ui_state_accumulated.json`) están creados con los deltas indicados.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A01.01.md` y `TEST_REPORT_FIA-A01.01.md`.
6. Se propone el archivo `LOCK-FIA-A01.01.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en esta unidad `FIA-A01.01`. Queda terminantemente prohibido implementar botones de colapso, calendarios o llamadas de red.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Parada Obligatoria:** Tras verificar los tests en verde, generar los reportes y crear `LOCK-FIA-A01.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
