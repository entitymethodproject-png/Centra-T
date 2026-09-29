# CENTRA-T · FIA-A03.02 · ACORDEÓN DE TAREAS EN HUB CON ESTADOS EV-01..05 (AS-BUILT)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · SUPERFICIE DE TAREAS EN HUB BLINDADA  
**Evidencia de Cierre:** LOCK-FIA-A03.02.md APROBADO (Commit: `f9df22d`)  

---

### 1. Identificación
- **FIA:** `FIA-A03.02`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Implementada:** `Acordeón de Tareas en Hub con Estados EV-01..05 & Acceso Out-Of-The-Box`
- **Hito de Rebanada:** `Segunda Unidad de RV-A03 (Superficie de Tareas en Hub)`
- **PVF Satisfecha:** `PVF-A03.01 · Renderizado de Acordeón de Tareas y Estados Vacíos`
- **VF Asociada:** `VF-A03.01 · Acordeón de Tareas y Estado Vacío en Hub`
- **Commit de Cierre (Git):** `f9df22d` (Cierre, acordeón de tareas y blindaje de acceso demo: `034763d`, `c1dc8b8`)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A03.02.md Aprobado (77/77 tests en verde a través de 12 suites, 100% cobertura en matriz EV-LIST-01..05 y usuario demo out-of-the-box)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A03.03.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A03.02.md` y `FIA-A03.02.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura UI de `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10) y la matriz canónica de estados de `09_CENTRA_T_VISUAL_STATES.docx` (`EV-LIST-01..05`).

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A03.01` (Commit `0a4f3aa`), con 68 tests en verde y el motor de dominio de tareas operativo.
- **Archivos Base:** Módulos `src/tasks/*`, `src/workspace/*`, `src/hub/*`, `src/authentication/*` y `src/users/*`.

### 4. Objetivo Implementado
1. Materialización del componente `TasksAccordion` (`src/hub/components/TasksAccordion.tsx`) con estilos encapsulados en `TasksAccordion.module.css`.
2. Cabecera reactiva accesible con `role="button"` y `aria-expanded`:
   - Conteo en tiempo real de tareas: `Tareas (N)`.
   - Botón de acción rápida `[+ Nueva]` con aislamiento de evento (`stopPropagation`).
   - Chevron interactivo con rotación fluida según el estado de expansión.
3. Blindaje de la matriz exhaustiva de estados UI del Documento 09 (`EV-LIST-01..05`):
   - **`EV-LIST-02 (Loading):`** Skeleton Screen de 3 líneas con animación `shimmer` (cumpliendo la prohibición taxativa de spinners a pantalla completa).
   - **`EV-LIST-03 (Empty State):`** Contenedor sobrio con borde discontinuo tenue (`1px dashed #233144`), icono descriptivo, mensaje *"No tienes tareas pendientes"* y botón CTA ilustrado `[+ Crear Tarea]`.
   - **`EV-LIST-05 (Error State):`** Banner inline con mensaje de error y botón `[Reintentar]`.
   - **`EV-LIST-01 (Populated List):`** Lista accesible (`<ul role="list">`) con checkboxes interactivos, título tachado (`line-through`) en tareas completadas y badges de prioridad (`alta`, `media`, `baja`).
4. Inyección del acordeón en `HubContainer` dentro del `WorkspaceLayout` a través de `App.tsx`.
5. Siembra de usuario demo out-of-the-box (`DEFAULT_DEMO_USER`: `elena@centrat.local` / `Password123!`) en `src/users/repositories/user.repository.ts`, eliminando la fricción de acceso en frío para evaluación en navegador.

### 5. Alcance Final
- Creación de `src/hub/components/TasksAccordion.tsx`.
- Creación de `src/hub/components/TasksAccordion.module.css`.
- Creación de `src/hub/components/TasksAccordion.test.tsx` (7 tests específicos).
- Actualización de `src/users/repositories/user.repository.ts` (siembra demo y rehidratación reactiva).
- Actualización de `src/App.tsx` (montaje del acordeón en Hub) y `src/App.test.tsx` (9 tests con login demo directo).
- Suite global completa: 77/77 tests pasando en verde con Vitest.
- Emisión de `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-03/De FIA-02/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Componente:**
  ```typescript
  export interface TasksAccordionProps {
    tasks?: TaskItem[];
    tasksService?: TasksService;
    userId?: string;
    initialExpanded?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onToggleExpand?: (expanded: boolean) => void;
    onCreateTaskClick?: () => void;
    onTaskToggle?: (taskId: string) => void;
    onRetry?: () => void;
  }
  ```
- **Contrato de Usuario Semilla:**
  ```typescript
  export const DEFAULT_DEMO_USER: UserEntity = {
    id: 'usr-demo-elena-001',
    email: 'elena@centrat.local',
    passwordHash: '$2b$12$XL7tMK5Wh1nbl1wbmheD/.xVlDytaTJCvpHGutlNRjO3dbc/kYHAO', // Password123!
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  ```

### 8. Restricciones Finales
- Cero spinners a pantalla completa: carga confinada mediante Skeleton Screens en acordeón.
- Conteo dinámico exacto: `Tareas (${tasks.length})`.
- Accesibilidad WCAG AA: semántica de listas, `aria-expanded` y etiquetas `aria-label` en checkboxes.
- Aislamiento hermético en Vitest garantizado por `InMemoryUserRepository.clear()` y `InMemoryTaskRepository.clear()`.

### 9. Diseño Técnico Final
- Acordeón modular en `src/hub/components/` integrado en el Hub lateral.
- Estilos con variables CSS de tokens (`--surface-hub`, `--border-subtle`, `--accent`).
- Shimmer keyframes para esqueletos y animación de opacidad para tareas completadas.

### 10. Flujo Operativo Final
1. El usuario accede al Workspace -> `TasksAccordion` se monta en el Hub.
2. Si `isLoading = true`, muestra el esqueleto de 3 filas.
3. Si la lista está vacía, muestra el Empty State sobrio con botón CTA `[+ Crear Tarea]`.
4. Si hay tareas, renderiza la lista con sus prioridades y checkboxes.
5. Clic en cabecera colapsa o expande la sección con `aria-expanded`.
6. Clic en checkbox invoca `onTaskToggle` y conmuta el estado de la tarea.
7. Clic en `[+ Nueva]` o CTA invoca `onCreateTaskClick`.

### 11. Casos Válidos Finales
- **Validado 1:** Renderizado de cabecera con contador dinámico `Tareas (N)` y botón `[+ Nueva]`.
- **Validado 2:** Colapso y expansión accesible mediante clic en cabecera.
- **Validado 3:** Skeleton Screen de 3 líneas en estado de carga.
- **Validado 4:** Empty State sobrio con botón CTA al no haber tareas.
- **Validado 5:** Lista poblada con badges de prioridad y texto tachado en tareas completadas.
- **Validado 6:** Invocación de `onTaskToggle` al pulsar un checkbox.

### 12. Casos Inválidos Finales
- **Validado 1:** Renderizado de banner de error ante fallos de carga con botón de reintento.
- **Validado 2:** Rechazo estricto ante contraseñas incorrectas en login demo.

### 13. Tests Requeridos Finales
Suite global de 77 tests validada al 100% en verde:
- `TasksAccordion.test.tsx` (7 tests de matriz EV-LIST)
- `App.test.tsx` (9 tests de integración y login demo)
- 61 tests previos preservados sin regresiones.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (77/77 tests pasando en verde en Vitest).
- `QG-04 · Matriz EV-LIST Validada:` Superado (Skeleton, Empty State y Lista Poblada certificados).
- `QG-05 · Accesibilidad WCAG AA:` Superado (`aria-expanded` y semántica de listas verificadas).

### 15. Archivos Reales Afectados
```
Creados:
- src/hub/components/TasksAccordion.tsx
- src/hub/components/TasksAccordion.module.css
- src/hub/components/TasksAccordion.test.tsx

Modificados:
- src/App.tsx
- src/App.test.tsx
- src/users/repositories/user.repository.ts
```

### 16. Diferencias Respecto a la FIA Original
Se integró el usuario demo semilla en el repositorio de usuarios para permitir el acceso directo en frío durante la evaluación en navegador.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
- `CHG-A03.02-01`: Incorporación de `DEFAULT_DEMO_USER` para testing interactivo out-of-the-box.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A03.02` ha completado su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 77/77 tests en verde y materializando la superficie de tareas en el Hub con la matriz de estados EV-01..05. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y ejecución de **`FIA-A03.03 · Modal Wizard de Creación en 3 Pasos (Caso Forense VV-004)`**.
