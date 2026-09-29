# CENTRA-T · FIA-A03.03 · MODAL WIZARD DE CREACIÓN EN 3 PASOS (VV-004) (AS-BUILT)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · BLINDAJE VV-004 Y DECISIÓN 3A CERTIFICADOS  
**Evidencia de Cierre:** LOCK-FIA-A03.03.md APROBADO (Commit: `2ef6f9b`)  

---

### 1. Identificación
- **FIA:** `FIA-A03.03`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Implementada:** `Modal Wizard de Creación en 3 Pasos (Caso Forense VV-004)`
- **Hito de Rebanada:** `Tercera Unidad de RV-A03 (Alta de Tareas y Rollback Total a Cero)`
- **PVF Satisfechas:** 
  - `PVF-A03.02 · Wizard de Creación en 3 Pasos y Fronteras Tipográficas`
  - `PVF-A03.03 · Cancelación del Wizard con Rollback Total a Cero (VV-004)`
- **VF Asociadas:** 
  - `VF-A03.02 · Alta de Tarea mediante Wizard y Límites Tipográficos`
  - `VF-A03.03 · Rollback Total a Cero en Cancelación de Wizard (VV-004)`
- **Commit de Cierre (Git):** `2ef6f9b`
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A03.03.md Aprobado (87/87 tests en verde a través de 13 suites, 10 tests específicos dedicados a TaskCreationWizard y caso VV-004)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A03.04.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A03.03.md` y `FIA-A03.03.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx` (Decisiones 2B y 3A), `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 04) y `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.1: `Crear_Item_Wizard_Pasos`).

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A03.02` (Commit `f9df22d`), con 77 tests en verde, acordeón de tareas en Hub con matriz de estados EV-01..05 y usuario demo accesible out-of-the-box.
- **Archivos Base:** Módulos `src/tasks/*`, `src/hub/*`, `src/workspace/*`, `src/authentication/*` y `src/users/*`.

### 4. Objetivo Implementado
1. Materialización del componente `TaskCreationWizard` en `src/tasks/components/TaskCreationWizard.tsx` con estilos encapsulados en `TaskCreationWizard.module.css`.
2. Diálogo modal accesible WCAG AA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="wizard-title"`, foco automático en título y captura de tecla `Escape`).
3. Asistente interactivo guiado en 3 pasos:
   - **Paso 1 (Título / Nombre):** Input con `autoFocus`, límite de 120 caracteres (Decisión 2B), contador en tiempo real `${titulo.length}/120`, bloqueo inline con error (*"El nombre no puede estar en blanco"*) ante entradas vacías y botones `[Siguiente]` y `[Cancelar]`.
   - **Paso 2 (Descripción):** Textarea multilínea con límite de 1000 caracteres (Decisión 2B), contador `${descripcion.length}/1000`, botón `[Atrás]` (que retrocede al Paso 1 conservando intacto el buffer del título) y botón `[Siguiente]`.
   - **Paso 3 (Prioridad y Guardado):** Tarjetas selectoras con código de color accesible (`Alta` en rojo, `Media` en ámbar por defecto, `Baja` en azul), botón `[Atrás]` (retrocede a Paso 2 conservando la descripción) y botón `[Guardar Tarea]`.
4. **Blindaje de Invariante: Caso Forense VV-004 & Decisión 3A (Rollback Total a Cero):**
   - Cancelar, presionar el botón `(✕)`, hacer clic en el backdrop o pulsar la tecla `Escape` en cualquier paso destruye inmediatamente el buffer en memoria (`resetWizardState()`).
   - Al volver a abrir, el diálogo modal nace obligatoriamente en **Paso 1**, con campos **100% limpios**, garantizando 0 fuga de datos y 0 retención de borradores.
5. **Persistencia e Integración Reactiva en Hub (`TasksAccordion`):**
   - Los botones `[+ Nueva]` y `[+ Crear Tarea]` despliegan el wizard.
   - La llamada exitosa a `tasksService.createTask` inserta la tarea creada en la cúspide de la lista de tareas en el Hub e incrementa el contador dinámico `Tareas (N)`.
   - En caso de error, muestra banner inline accesible y rehabilita el guardado para reintento.

### 5. Alcance Final
- Creación de `src/tasks/components/TaskCreationWizard.tsx`.
- Creación de `src/tasks/components/TaskCreationWizard.module.css`.
- Creación de `src/tasks/components/TaskCreationWizard.test.tsx` (10 tests de unidad, integración y caso forense VV-004).
- Modificación de `src/hub/components/TasksAccordion.tsx` (integración con el wizard y reactividad de estado).
- Suite global completa: 87/87 tests pasando en verde con Vitest a través de 13 suites.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-04/De FIA-03/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.2.7), `@testing-library/react` (^16.3.2), `@testing-library/user-event` (^14.6.1), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Componente Wizard (`TaskCreationWizardProps`):**
  ```typescript
  export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    tasksService?: TasksService;
    onTaskCreated?: (task: TaskItem) => void;
  }
  ```
- **Contrato de Acordeón en Hub (`TasksAccordionProps`):**
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
    onTaskCreated?: (task: TaskItem) => void;
    onTaskToggle?: (taskId: string) => void;
    onRetry?: () => void;
  }
  ```

### 8. Restricciones Finales
- Fronteras tipográficas de la Decisión 2B: 120 caracteres máximos en título y 1000 en descripción estrictamente enforced en UI y Dominio.
- Decisión 3A / Caso Forense VV-004: Purga incondicional de buffer en memoria ante cualquier mecanismo de cancelación.
- Preservación de buffers en avance/retroceso durante la sesión activa del asistente.
- Accesibilidad WCAG AA: Diálogo modal con `aria-modal="true"`, `aria-labelledby`, `role="radiogroup"`, `role="radio"` y contadores con `aria-live="polite"`.

### 9. Diseño Técnico Final
- Componente modular en `src/tasks/components/` autocontenido.
- Backdrop fixed con blur y tarjeta centrada de 500px máx con tokens de Centra-T (`#131B26`, `#233144`, `#0B0F17`).
- Barra de progreso superior en 3 pasos con estados activos e inactivos.
- Manejo síncrono del buffer con purga atómica `resetWizardState()`.

### 10. Flujo Operativo Final
1. Usuario pulsa `[+ Nueva]` o `[+ Crear Tarea]` en el Hub -> `isWizardOpen = true`.
2. Modal se abre en Paso 1 con foco en input de título.
3. Usuario introduce título válido -> pulsa `[Siguiente]` -> avanza a Paso 2.
4. Usuario redacta descripción opcional -> puede retroceder con `[Atrás]` (conserva título) o avanzar con `[Siguiente]`.
5. En Paso 3, selecciona prioridad (default `Media`) -> pulsa `[Guardar Tarea]`.
6. Botón entra en carga (`Guardando...`) e invoca `tasksService.createTask`.
7. Al completar (201 Created), purga buffer, cierra modal, inserta tarea en cabecera de `TasksAccordion` y actualiza contador.
8. Si en cualquier paso pulsa `[Cancelar]`, `(✕)` o `Escape`, se purga el estado y el modal se cierra.

### 11. Casos Válidos Finales
- **Validado 1:** Renderizado en Paso 1 con autofocus y contador de caracteres `(0/120)`.
- **Validado 2:** Respeto del límite de 120 caracteres en título (Decisión 2B).
- **Validado 3:** Navegación a Paso 2 y retroceso a Paso 1 conservando el buffer del título con `[Atrás]`.
- **Validado 4:** Adición de descripción en Paso 2 y respeto del límite de 1000 caracteres (Decisión 2B).
- **Validado 5:** Selección de prioridad en Paso 3 (Alta, Media, Baja; `Media` por defecto).
- **Validado 6:** Persistencia exitosa con `tasksService.createTask`, invocación de `onTaskCreated` y cierre.

### 12. Casos Inválidos Finales
- **Validado 1:** Bloqueo de avance a Paso 2 ante título vacío o con solo espacios con alerta inline.
- **Validado 2:** Alerta accesible ante fallo de servidor sin perder el estado del formulario en Paso 3.
- **Validado 3 (Caso Forense VV-004):** Pulsar `[Cancelar]` en Paso 2 o 3 destruye el buffer en memoria y al reabrir nace 100% limpio en Paso 1.
- **Validado 4 (Caso Forense VV-004):** Presionar la tecla `Escape` purga el buffer en memoria y cierra el modal.

### 13. Tests Requeridos Finales
Suite global de 87 tests validada al 100% en verde:
- `TaskCreationWizard.test.tsx` (10 tests de unidad, navegación, límites 2B y caso forense VV-004)
- `TasksAccordion.test.tsx` (7 tests intactos)
- `HubContainer.test.tsx` (4 tests intactos)
- `tasks.service.test.ts` (9 tests intactos)
- `tasks.controller.test.ts` (3 tests intactos)
- Suites previas de auth, users, workspace y App (54 tests intactos).

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (87/87 tests pasando al 100% en verde en Vitest).
- `QG-04 · Validación VV-004 & Decisión 2B:` Superado y certificado por tests automatizados.
- `QG-05 · Accesibilidad WCAG AA:` Superado (marcado semántico de modal, radios y captura de `Escape`).

### 15. Archivos Reales Afectados
```
Creados:
- src/tasks/components/TaskCreationWizard.tsx
- src/tasks/components/TaskCreationWizard.module.css
- src/tasks/components/TaskCreationWizard.test.tsx

Modificados:
- src/hub/components/TasksAccordion.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna desviación. Implementación exacta conforme a especificación.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna alteración respecto a la especificación técnica.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A03.03` ha completado satisfactoriamente su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 87/87 tests en verde y blindando taxativamente el Caso Forense VV-004 y la Decisión 3A. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y redacción de **`FIA-A03.04 · TaskCard con Mutación Optimista de Checkbox, Rollback y Toast ante 500`**.
