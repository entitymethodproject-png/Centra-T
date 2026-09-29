# CENTRA-T · FIA-A03.04 · TASKCARD CON MUTACIÓN OPTIMISTA Y ROLLBACK (VV-005) (AS-BUILT)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · BLINDAJE CASO FORENSE VV-005 CERTIFICADO  
**Evidencia de Cierre:** LOCK-FIA-A03.04.md APROBADO (Commit: `479fb77`)  

---

### 1. Identificación
- **FIA:** `FIA-A03.04`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Implementada:** `TaskCard con Mutación Optimista de Checkbox, Rollback y Toast ante 500 (Caso Forense VV-005)`
- **Hito de Rebanada:** `Cuarta Unidad de RV-A03 (Mutación Optimista y Reversión ante 500)`
- **PVF Satisfecha:** `PVF-A03.04 · Conmutación Optimista de Checkbox con Rollback Automático (VV-005)`
- **VF Asociada:** `VF-A03.04 · Mutación Optimista de Checkbox y Rollback Automático (VV-005)`
- **Commit de Cierre (Git):** `479fb77`
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A03.04.md Aprobado (94/94 tests en verde a través de 14 suites, 7 tests específicos dedicados a TaskCard y caso VV-005)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A03.05.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A03.04.md` y `FIA-A03.04.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx`, `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 06), `10_CENTRA_T_VISUAL_VALIDATION_QA.docx` (Caso Forense VV-005) y `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.2: `Alternar_Estado_Item`).

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A03.03` (Commit `2ef6f9b`), con 87 tests en verde, wizard de creación en 3 pasos con purga de buffer VV-004 y acordeón reactivo en Hub.
- **Archivos Base:** Módulos `src/tasks/*`, `src/hub/*`, `src/workspace/*`, `src/authentication/*` y `src/users/*`.

### 4. Objetivo Implementado
1. Materialización del componente atómico `TaskCard` en `src/tasks/components/TaskCard.tsx` con estilos encapsulados en `TaskCard.module.css`.
2. Marcado semántico accesible WCAG AA (`<li role="listitem">`, `<input type="checkbox" aria-label="Completar tarea [Título]">`, badges de prioridad independientes).
3. **Mutación Optimista Instantánea (< 16ms / < 50ms):**
   - Conmutación síncrona en memoria cliente del estado del checkbox y tachado dinámico del texto (`line-through`) con opacidad atenuada antes de resolver la petición de red.
   - Disparo inmediato del callback `onToggleOptimistic(taskId, newStatus)`.
4. **Sincronización en Backend:**
   - Despacho asíncrono con `tasksService.toggleTaskStatus(userId, task.id)`.
   - Confirmación silenciosa sin ruido visual ante 200 OK y notificación mediante `onTaskUpdated`.
5. **Blindaje de Invariante: Caso Forense VV-005 & Rollback Automático ante Error 500:**
   - Si la llamada al servicio/API falla con error 500 o fallo de red:
     - El componente revierte automáticamente el checkbox a su estado previo.
     - El título de la tarea retira de inmediato el tachado (`line-through`).
     - Se despliega un Toast de alerta accesible (`role="alert"`, `aria-live="assertive"`) con el mensaje:
       > *"No se pudo actualizar el estado de la tarea. Se ha revertido el cambio."*
     - El Toast incluye botón de descarte accesible `[✕]` (`aria-label="Cerrar notificación de error"`).
     - Se notifica la reversión mediante `onRollback`.
6. Refactorización limpia de `TasksAccordion.tsx` delegando la lista poblada en `<TaskCard />`.

### 5. Alcance Final
- Creación de `src/tasks/components/TaskCard.tsx`.
- Creación de `src/tasks/components/TaskCard.module.css`.
- Creación de `src/tasks/components/TaskCard.test.tsx` (7 tests de unidad, integración y caso forense VV-005).
- Modificación de `src/hub/components/TasksAccordion.tsx` (integración con `TaskCard` y manejador reactivo de actualizaciones).
- Suite global completa: 94/94 tests pasando al 100% en verde con Vitest a través de 14 suites.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-05/De FIA-04/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.2.7), `@testing-library/react` (^16.3.2), `@testing-library/user-event` (^14.6.1), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Componente Tarjeta (`TaskCardProps`):**
  ```typescript
  export interface TaskCardProps {
    task: TaskItem;
    userId?: string;
    tasksService?: TasksService;
    onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onRollback?: (revertedTask: TaskItem) => void;
  }
  ```
- **Contrato de Acordeón en Hub (`TasksAccordionProps`):** Preservado al 100% con compatibilidad hacia atrás.

### 8. Restricciones Finales
- Latencia de feedback imperceptible (< 50ms) en la mutación optimista local.
- Rollback obligatorio e instantáneo ante cualquier rechazo HTTP 500.
- Accesibilidad WCAG AA: Checkboxes etiquetados y Toast accesible con `role="alert"`.
- Aislamiento de fallos: El error en una tarea no degrada el resto de la interfaz.

### 9. Diseño Técnico Final
- Componente atómico modular en `src/tasks/components/` con aislamiento CSS.
- Sincronización desacoplada con reversión controlada por try/catch.
- Banner/Toast de notificación flotante/inline con animación `fadeIn` y descarte manual.

### 10. Flujo Operativo Final
1. El usuario visualiza la tarjeta de tarea en la lista del Hub.
2. Pulsa sobre el checkbox -> el estado conmuta de inmediato (< 16ms), el texto se tacha visualmente y se notifica el cambio optimista.
3. Se envía `tasksService.toggleTaskStatus(userId, task.id)`.
4. Si la respuesta es exitosa (200 OK), el estado queda confirmado de forma silenciosa.
5. Si ocurre un error 500, el checkbox se desmarca de inmediato, se elimina el tachado y aparece el Toast empático de reversión con botón de descarte.

### 11. Casos Válidos Finales
- **Validado 1:** Renderizado accesible con título, badge de prioridad y checkbox con label WCAG AA.
- **Validado 2:** Conmutación optimista instantánea (< 50ms): clic en checkbox tacha el texto de inmediato.
- **Validado 3:** Desmarcado del checkbox y retirada del tachado en una tarea completada.
- **Validado 4:** Sincronización silenciosa con `tasksService.toggleTaskStatus` e invocación de `onTaskUpdated` (200 OK).
- **Validado 5:** Invocación inmediata de `onToggleOptimistic` al pulsar el checkbox.

### 12. Casos Inválidos Finales
- **Validado 1 (Caso Forense VV-005):** Simulación de error 500 del servidor desmarca inmediatamente el checkbox, retira el tachado visual y despliega el Toast empático de reversión.
- **Validado 2:** Descarte del Toast empático al pulsar el botón de cierre `[✕]`.

### 13. Tests Requeridos Finales
Suite global de 94 tests validada al 100% en verde:
- `TaskCard.test.tsx` (7 tests de mutación optimista, latencia y caso forense VV-005)
- `TaskCreationWizard.test.tsx` (10 tests intactos)
- `TasksAccordion.test.tsx` (7 tests intactos)
- `HubContainer.test.tsx` (4 tests intactos)
- `tasks.service.test.ts` (9 tests intactos)
- `tasks.controller.test.ts` (3 tests intactos)
- Suites previas de auth, users, workspace y App (54 tests intactos).

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (94/94 tests pasando al 100% en verde en Vitest).
- `QG-04 · Validación Caso Forense VV-005:` Superado y certificado por tests automatizados.
- `QG-05 · Accesibilidad WCAG AA:` Superado (marcado semántico, labels accesibles y roles de alerta).

### 15. Archivos Reales Afectados
```
Creados:
- src/tasks/components/TaskCard.tsx
- src/tasks/components/TaskCard.module.css
- src/tasks/components/TaskCard.test.tsx

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
Se certifica que la unidad `FIA-A03.04` ha completado satisfactoriamente su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 94/94 tests en verde y blindando taxativamente el Caso Forense VV-005. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y redacción de la quinta y última unidad de la rebanada: **`FIA-A03.05 · TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación`**.
