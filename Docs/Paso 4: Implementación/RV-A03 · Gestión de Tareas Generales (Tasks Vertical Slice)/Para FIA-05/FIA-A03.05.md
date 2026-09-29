# CENTRA-T · FIA-A03.05 · MENÚ CONTEXTUAL Y DIÁLOGO PREVENTIVO DE ELIMINACIÓN
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** QUINTA UNIDAD Y PVF DE CIERRE DE RV-A03 (CIERRE DE VERTICAL SLICE)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A03.05`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Prevista:** `TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación`
- **PVF de Cierre Cubierta:** `PVF-A03.05 · Edición Contextual y Eliminación con Diálogo Preventivo`
- **VF Interna de Derivación:** `VF-A03.05 · Edición y Eliminación con Diálogo Preventivo`
- **Objetivo Indexado:** `Menú desplegable accesible en cada tarjeta para edición rápida o eliminación con diálogo modal confirmatorio antes de emitir DELETE /tasks/:id.`
- **Validación Indexada:** `src/tasks/components/TaskActionMenu.tsx`
- **Evidencia de Cierre Indexada:** `Confirmación elimina la tarjeta con fade-out; cancelación cierra el modal sin mutaciones ni llamadas de red.`
- **LOCK Previo Requerido:** `LOCK-FIA-A03.04.md APROBADO (Commit: 479fb77)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar exhaustivamente con TDD en `@testing-library/react` y Vitest el componente `TaskActionMenu` en `src/tasks/components/TaskActionMenu.tsx` (con sus estilos encapsulados en `TaskActionMenu.module.css`), integrándolo en cada `TaskCard`:
1. **Menú Contextual Flotante Accesible:**
   - Botón disparador `(...)` accesible (`aria-label="Acciones de tarea"`, `aria-haspopup="menu"`, `aria-expanded`).
   - Menú emergente posicionado (`role="menu"`) con opciones interactivas (`role="menuitem"`):
     - `Cambiar Prioridad`: Permite alternar la prioridad de la tarea (`alta`, `media`, `baja`) invocando `tasksService.updateTask`.
     - `Eliminar Tarea`: Opción destructiva con estilo visual de peligro (`color: #EF4444`).
   - Cierre automático al hacer clic fuera del menú o presionar la tecla `Escape`.
2. **Diálogo Modal Preventivo de Eliminación:**
   - Al seleccionar `Eliminar Tarea`, se intercepta la acción y se despliega un diálogo modal de confirmación accesible (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="confirm-delete-title"`).
   - Título: `¿Eliminar tarea?`
   - Mensaje de advertencia: `Esta acción no se puede deshacer. Se eliminará permanentemente la tarea de tu lista.`
   - Foco inicial predeterminado en el botón neutro `[Cancelar]` para prevenir pulsaciones destructivas accidentales.
3. **Cancelación Inofensiva vs. Confirmación Destructiva:**
   - **Cancelación:** Pulsar `[Cancelar]`, el botón de cierre `(✕)`, hacer clic en el backdrop o pulsar la tecla `Escape` aborta inmediatamente el diálogo **sin emitir peticiones DELETE ni mutar el estado** (cero llamadas de red).
   - **Confirmación:** Pulsar `[Eliminar Definitivamente]` activa el estado de carga (`Eliminando...`), deshabilita botones y ejecuta `tasksService.deleteTask(userId, task.id)`. Al completarse (204 No Content / 200 OK), cierra el modal, retira la tarjeta del Hub mediante animación suave de salida y actualiza reactivamente el contador `Tareas (N)`.
   - En caso de error en el servicio, muestra alerta accesible en el modal y permite reintentar o cancelar.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/tasks/components/TaskActionMenu.tsx` con soporte para menú desplegable, cambio de prioridad y diálogo modal preventivo.
  - Creación de `src/tasks/components/TaskActionMenu.module.css` con estilos oscuros Centra-T para menú flotante (`#131B26`, bordes `#233144`), opciones de peligro y modal de confirmación.
  - Creación de `src/tasks/components/TaskActionMenu.test.tsx` con cobertura de todos los casos (apertura/cierre de menú, cambio de prioridad, modal preventivo, cancelación inofensiva sin DELETE, tecla ESC, eliminación confirmada y error de servidor).
  - Integración en `src/tasks/components/TaskCard.tsx` y propagación de `onTaskDeleted` hacia `TasksAccordion.tsx`.
  - Verificación del 100% de la suite global en verde en Vitest (mínimo 101-104 tests totales pasando).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Vaciado masivo de listas completas con modal crítico (`4.5 Vaciar_Lista_Modulo`).
  - Arrastre hacia el calendario o interacción Drag & Drop (`RV-A06`).
  - Módulos de compras o limpieza (`RV-A04`, `RV-A05`).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Invariantes del repositorio y eliminación de tareas).
  - `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 05: Edición Contextual y Menú Flotante; Feature 09: Acciones Destructivas Seguras).
  - `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.3: `Editar_Item_Contextual` y Proceso 4.4: `Eliminar_Item_Individual`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Fila PVF-A03.05).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A03.05).
  - `FIA-A03.04_AS_BUILT.md` (TaskCard con mutación optimista cerrada y bloqueada con commit `479fb77`).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A03.04` (Aprobado en commit `479fb77`).
  - *Posterior:* **CIERRA COMPLETAMENTE LA REBANADA VERTICAL RV-A03** y autoriza la apertura de la siguiente rebanada: `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`.

### 5. Contratos Afectados
- **Contrato de Interfaz (`TaskActionMenuProps`):**
  ```typescript
  export interface TaskActionMenuProps {
    task: TaskItem;
    userId?: string;
    tasksService?: TasksService;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onTaskDeleted?: (taskId: string) => void;
  }
  ```
- **Contrato de Actualización en `TaskCardProps`:**
  ```typescript
  export interface TaskCardProps {
    task: TaskItem;
    userId?: string;
    tasksService?: TasksService;
    onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onTaskDeleted?: (taskId: string) => void;
    onRollback?: (revertedTask: TaskItem) => void;
  }
  ```
- **Contrato de Accesibilidad:** `role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, y diálogo de confirmación con `role="dialog"`, `aria-modal="true"`.

### 6. Restricciones
- **Prohibición de Eliminación Inmediata:** Ningún clic en el botón de eliminar debe disparar `DELETE` directamente; la acción debe ser interceptada obligatoriamente por el diálogo modal de confirmación.
- **Foco Seguro por Defecto:** Al abrir el diálogo de confirmación, el foco inicial debe posicionarse en el botón `[Cancelar]` para evitar eliminaciones involuntarias por pulsación rápida de la tecla `Enter`.
- **Cancelación Inofensiva:** Pulsar `[Cancelar]` o `Escape` no debe realizar mutaciones ni llamadas de red.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/tasks/components/TaskActionMenu.tsx`.
- **Estructura Interna:**
  - `isMenuOpen`: Controla la visibilidad del desplegable flotante.
  - `isConfirmOpen`: Controla la visibilidad del diálogo modal preventivo.
  - `isDeleting`: Estado de carga durante la ejecución de `deleteTask`.
  - `deleteError`: Mensaje de error si la petición DELETE falla.
- **Fronteras Físicas Autorizadas:** Directorio `src/tasks/components/*` y `src/hub/components/TasksAccordion.tsx`.

### 8. Flujo Operativo
1. El usuario hace clic en el botón `(...)` de la tarjeta -> se despliega el menú contextual.
2. Si elige `Cambiar Prioridad`, se actualiza la prioridad invocando `tasksService.updateTask` y se cierra el menú.
3. Si elige `Eliminar`, se cierra el menú flotante y se abre el diálogo modal preventivo de confirmación con foco en `[Cancelar]`.
4. Si pulsa `[Cancelar]` o presiona `Escape`: el modal se cierra y no ocurre ninguna mutación.
5. Si pulsa `[Eliminar Definitivamente]`: se deshabilita el diálogo, se invoca `tasksService.deleteTask`, se cierra el modal y se despacha `onTaskDeleted(taskId)`, retirando la tarjeta de la vista y actualizando el contador del Hub.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Apertura y Cierre de Menú):**
  - Clic en `(...)` abre el menú; clic fuera o pulsar `Escape` lo cierra.
- **Caso 2 (Cambio de Prioridad Contextual):**
  - Seleccionar una nueva prioridad actualiza la tarea y notifica con `onTaskUpdated`.
- **Caso 3 (Eliminación Confirmada):**
  - Seleccionar `Eliminar`, confirmar en el modal preventivo -> invoca `tasksService.deleteTask`, retira la tarea e invoca `onTaskDeleted`.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Cancelación de Eliminación):**
  - En el modal de confirmación, pulsar `[Cancelar]` o presionar `Escape` cierra el diálogo sin emitir ninguna petición DELETE.
- **Caso Inválido 2 (Fallo de Servidor en DELETE):**
  - Si `deleteTask` falla (500 Error / Red), el modal no se cierra, muestra un mensaje de error accesible y permite reintentar o cancelar.

### 11. Tests Requeridos
- **Tests de Integración (`TaskActionMenu.test.tsx`):**
  1. Renderizado accesible del botón disparador `(...)` con `aria-haspopup="menu"`.
  2. Apertura del menú flotante con opciones `Cambiar Prioridad` y `Eliminar Tarea`.
  3. Cierre automático del menú al presionar la tecla `Escape` o hacer clic fuera.
  4. Cambio de prioridad exitoso e invocación de `onTaskUpdated`.
  5. Despliegue obligatorio del modal preventivo al pulsar `Eliminar Tarea` con foco en `[Cancelar]`.
  6. **Cancelación Inofensiva:** Pulsar `[Cancelar]` o `Escape` cierra el modal sin invocar `deleteTask`.
  7. **Eliminación Exitosa:** Pulsar `[Eliminar Definitivamente]` ejecuta `deleteTask`, cierra el modal e invoca `onTaskDeleted`.
  8. Manejo de error si el servidor falla durante la eliminación.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 101-104 tests globales pasando).

### 12. Quality Gates (QG-FIA-A03.05)
- `QG-FIA-A03.05-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A03.05-02 · Tests Suite:` 100% de tests en verde en todo el proyecto (mínimo 101-104 tests pasando).
- `QG-FIA-A03.05-03 · Blindaje Diálogo Preventivo:` Tests automatizados de intercepción de eliminación y foco seguro en verde.
- `QG-FIA-A03.05-04 · Accesibilidad WCAG AA:` Marcado accesible de menú (`role="menu"`, `role="menuitem"`) y diálogo modal (`role="dialog"`).
- `QG-FIA-A03.05-05 · Cierre de Rebanada RV-A03:` Cobertura completa de los 5 PVFs de RV-A03 sin regresiones en las suites previas.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TaskActionMenu` y sus estilos están implementados respetando el menú contextual y el diálogo preventivo de confirmación.
2. La eliminación destructiva exige confirmación modal y no se ejecuta ninguna llamada DELETE si se cancela.
3. El componente está plenamente integrado en `TaskCard` y `TasksAccordion`.
4. El 100% de los tests del proyecto pasan en verde con Vitest (15 suites pasando).
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.05.md`, `TEST_REPORT_FIA-A03.05.md` y la propuesta formal de `LOCK-FIA-A03.05.md` cerrando la Rebanada Vertical RV-A03.
