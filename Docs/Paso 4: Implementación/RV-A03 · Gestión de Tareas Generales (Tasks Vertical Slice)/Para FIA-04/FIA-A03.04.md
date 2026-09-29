# CENTRA-T · FIA-A03.04 · TASKCARD CON MUTACIÓN OPTIMISTA Y ROLLBACK (VV-005)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A03.04`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Prevista:** `TaskCard con Mutación Optimista de Checkbox, Rollback y Toast ante 500 (Caso Forense VV-005)`
- **PVF de Cierre Cubierta:** `PVF-A03.04 · Conmutación Optimista de Checkbox con Rollback Automático (VV-005)`
- **VF Interna de Derivación:** `VF-A03.04 · Mutación Optimista de Checkbox y Rollback Automático (VV-005)`
- **Objetivo Indexado:** `Implementar toggle optimista de tarea en UI (tachado de texto line-through en <50ms) con llamada PATCH y reversión inmediata con Toast en fallo 500.`
- **Validación Indexada:** `src/tasks/components/TaskCard.tsx`
- **Evidencia de Cierre Indexada:** `Superación del caso VV-005: simulación de error 500 desmarca el checkbox, restaura el texto normal y despliega Toast empático.`
- **LOCK Previo Requerido:** `LOCK-FIA-A03.03.md APROBADO (Commit: 2ef6f9b)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y validar mediante pruebas de integración exhaustivas con Vitest y `@testing-library/react` el componente `TaskCard` en `src/tasks/components/TaskCard.tsx` (con sus estilos en `TaskCard.module.css`), refactorizando la lista de tareas de `TasksAccordion.tsx` para delegar la tarjeta individual e implementar el patrón de mutación optimista con resiliencia ante errores:
1. **Mutación Optimista Instantánea (< 50ms):**
   - Al hacer clic en el checkbox o etiqueta interactiva, el estado local conmuta de inmediato en memoria cliente sin esperar la respuesta del servidor.
   - El checkbox refleja el nuevo valor (`checked` o desmarcado) de forma síncrona.
   - El título de la tarea aplica o retira inmediatamente el estilo visual tachado (`text-decoration: line-through`) y la opacidad atenuada (`opacity: 0.6`).
   - El callback `onToggleOptimistic` o `onStatusChange` notifica al contenedor padre para que el contador de la cabecera `Tareas (N)` o filtros reactivos respondan al instante.
2. **Sincronización en Backend:**
   - Se despacha la petición de persistencia asíncrona mediante `tasksService.toggleTaskStatus(userId, task.id)` (o endpoint PATCH equivalente).
   - **Caso de Éxito (200 OK):** La sincronización es silenciosa y transparente. Se confirma el nuevo estado persistido y se notifica al padre con `onTaskUpdated(updatedTask)`.
3. **Caso Forense VV-005 & Rollback Automático ante Fallo 500 / Error de Red:**
   - Si la llamada al servicio/API falla (error 500 Internal Server Error, excepción o caída de red):
     - El componente ejecuta de forma inmediata e imperceptible el **Rollback de estado**:
       - El checkbox vuelve al estado anterior.
       - El título de la tarea retira el tachado (`line-through`) y recupera su opacidad y color original.
       - Se notifica la reversión al contenedor padre (`onRollback`).
     - Se despliega de forma inmediata un **Toast de alerta empático y accesible** (`role="alert"` o `role="status"`):
       > *"No se pudo actualizar el estado de la tarea. Se ha revertido el cambio."*
     - El Toast cuenta con botón de descarte manual `[✕]` y autocierre opcional, sin bloquear el resto de la interfaz.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/tasks/components/TaskCard.tsx` con soporte para checkbox optimista, rollback ante errores, renderizado de badges de prioridad y display de Toast empático.
  - Creación de `src/tasks/components/TaskCard.module.css` con diseño modular nocturno Centra-T (fondo de tarjeta `#131B26`, bordes `#233144`, estilos para tachado, checkboxes personalizados y estilos del Toast empático flotante/inline).
  - Creación de `src/tasks/components/TaskCard.test.tsx` con cobertura del 100% de los escenarios (toggle optimista, sincronización exitosa, caso forense VV-005 ante error 500 con rollback y Toast, y accesibilidad).
  - Refactorización e integración en `src/hub/components/TasksAccordion.tsx` para utilizar `TaskCard` en la lista poblada de tareas (`EV-LIST-01`).
  - Verificación del 100% de la suite global en verde en Vitest (mínimo 94-97 tests totales pasando).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Menú contextual flotante y modal preventivo de eliminación de tareas (`TaskActionMenu.tsx` pertenece a `FIA-A03.05`).
  - Drag & Drop e interacción con casillas del calendario mensual (`RV-A06`).
  - Modificación de listas de compra o limpieza (`RV-A04`, `RV-A05`).
  - Filtros avanzados reactivos multinivel (`RV-A05` / Módulo 5).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Invariantes del Agregado DomesticItem y sincronización).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología de Hub, Matriz de Estados, Feedback Empático).
  - `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 06: Alternancia de Estado y Checkboxes; UI Optimista y Rollback).
  - `10_CENTRA_T_VISUAL_VALIDATION_QA.docx` (Caso Forense VV-005: Conmutación Optimista de Checkbox y Rollback).
  - `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.2: `Alternar_Estado_Item`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Fila PVF-A03.04 / Caso Forense VV-005).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A03.04).
  - `FIA-A03.03_AS_BUILT.md` (Wizard en 3 pasos y alta de tareas consolidada con LOCK commit `2ef6f9b`).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A03.03` (Aprobado en commit `2ef6f9b`).
  - *Posterior:* Desbloquea `FIA-A03.05` (TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación).

### 5. Contratos Afectados
- **Contrato de Interfaz (`TaskCardProps`):**
  ```typescript
  export interface TaskCardProps {
    task: TaskItem;
    userId: string;
    tasksService?: TasksService;
    onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onRollback?: (revertedTask: TaskItem) => void;
  }
  ```
- **Contrato de Accesibilidad:** `<li role="listitem">`, `<input type="checkbox" aria-label="Completar tarea [Título]">`, mensaje de Toast con `role="alert"` o `role="status"` y `aria-live="assertive"`.

### 6. Restricciones
- **Latencia de Feedback:** La conmutación visual del checkbox y el tachado del texto deben ejecutarse en menos de 50ms (< 16ms en ciclo de render React).
- **Caso Forense VV-005:** Ante cualquier fallo HTTP 500, timeout o rechazo del servicio, el componente debe revertir obligatoriamente el checkbox a su estado previo, retirar el tachado y mostrar el Toast empático.
- **Aislamiento de Errores:** El fallo en la conmutación de una tarea no debe afectar el estado de otras tareas ni romper el montaje del Hub.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/tasks/components/TaskCard.tsx`.
- **Estructura Interna:**
  - `isCompleted`: Estado optimista local inicializado con `task.completado`.
  - `isSyncing`: Bandera booleana de sincronización en segundo plano.
  - `toastMessage`: Mensaje de error para el Toast empático (o `null`).
- **Mecanismo de Rollback:**
  ```typescript
  const previousState = isCompleted;
  setIsCompleted(!previousState); // Optimista
  try {
    const updated = await service.toggleTaskStatus(userId, task.id);
    if (onTaskUpdated) onTaskUpdated(updated);
  } catch (err) {
    setIsCompleted(previousState); // Rollback
    setToastMessage('No se pudo actualizar el estado de la tarea. Se ha revertido el cambio.');
    if (onRollback) onRollback({ ...task, completado: previousState });
  }
  ```
- **Fronteras Físicas Autorizadas:** Directorio `src/tasks/components/*` y `src/hub/components/TasksAccordion.tsx`.

### 8. Flujo Operativo
1. El usuario visualiza la lista de tareas en `TasksAccordion`.
2. Pulsa sobre el checkbox de una tarea pendiente.
3. De forma inmediata (< 50ms), el checkbox se marca, el título se tacha y se reduce su opacidad.
4. En segundo plano, se invoca `tasksService.toggleTaskStatus(userId, task.id)`.
5. **Si la operación triunfa (200 OK):** La tarea queda sincronizada sin ruido visual.
6. **Si la operación falla (500 Error / Red):**
   - El checkbox se desmarca inmediatamente y el título recupera su estilo sin tachar.
   - Aparece un Toast empático visible notificando la reversión del cambio.
   - El usuario puede descartar el Toast o volver a intentar pulsar el checkbox.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Completar tarea con éxito):**
  - *Acción:* Clic en checkbox de tarea no completada.
  - *Resultado:* Se tacha inmediatamente el título (`line-through`), checkbox pasa a `checked`, el servicio persiste el cambio en backend y se notifica `onTaskUpdated`.
- **Caso 2 (Desmarcar tarea completada con éxito):**
  - *Acción:* Clic en checkbox de tarea completada.
  - *Resultado:* Se retira el tachado inmediatamente, checkbox pasa a desmarcado y se persiste el cambio.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Caso Forense VV-005 — Error 500 y Rollback con Toast):**
  - *Acción:* Clic en checkbox de tarea cuando el servicio arroja error 500.
  - *Resultado:* La UI tacha momentáneamente el texto de forma optimista; al capturar el rechazo 500, revierte de inmediato el checkbox a desmarcado, elimina el tachado y renderiza el Toast empático con mensaje *"No se pudo actualizar el estado de la tarea. Se ha revertido el cambio."*.
- **Caso Inválido 2 (Descarte manual del Toast):**
  - *Acción:* Tras mostrarse el Toast de error, el usuario pulsa el botón `[✕]` de cierre.
  - *Resultado:* El Toast desaparece de la vista.

### 11. Tests Requeridos
- **Tests de Integración y Caso Forense VV-005 (`TaskCard.test.tsx`):**
  1. Renderizado accesible con título, badge de prioridad y checkbox con label WCAG AA.
  2. Conmutación optimista instantánea: clic en checkbox tacha el texto (`line-through`) de inmediato.
  3. Sincronización exitosa con el servicio e invocación de `onTaskUpdated`.
  4. **Test Canónico Caso Forense VV-005:** Simulación de rechazo/error 500 en `toggleTaskStatus`: verificación de que el checkbox se desmarca, se retira el tachado visual y se despliega el Toast empático de reversión.
  5. Descarte accesible del Toast empático al pulsar el botón de cerrar.
  6. Preservación del estado ante múltiples conmutaciones controladas.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 94-97 tests globales pasando).

### 12. Quality Gates (QG-FIA-A03.04)
- `QG-FIA-A03.04-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A03.04-02 · Tests Suite:` 100% de tests en verde en todo el proyecto (mínimo 94-97 tests pasando).
- `QG-FIA-A03.04-03 · Blindaje Caso Forense VV-005:` Test automatizado de reversión optimista ante error 500 y Toast empático en verde.
- `QG-FIA-A03.04-04 · Accesibilidad WCAG AA:` Marcado semántico, atributos accesibles en checkbox y alert role en Toast.
- `QG-FIA-A03.04-05 · Cero Regresiones:` Los 87 tests previos continúan en verde sin alteraciones.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TaskCard` y sus estilos están implementados respetando la mutación optimista y el Toast empático.
2. El Caso Forense VV-005 (reversión automática del checkbox y texto ante error 500 con Toast accesible) está demostrado mediante tests automatizados en Vitest.
3. `TasksAccordion` utiliza `TaskCard` en su lista poblada de tareas sin romper los tests previos de la matriz EV-LIST.
4. El 100% de los tests del proyecto pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.04.md`, `TEST_REPORT_FIA-A03.04.md` y la propuesta formal de `LOCK-FIA-A03.04.md`.
