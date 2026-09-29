# CENTRA-T · FIA-A03.03 · MODAL WIZARD DE CREACIÓN EN 3 PASOS (VV-004)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A03.03`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Prevista:** `Modal Wizard de Creación en 3 Pasos (Caso Forense VV-004)`
- **PVF de Cierre Cubiertas:** 
  - `PVF-A03.02 · Wizard de Creación en 3 Pasos y Fronteras Tipográficas`
  - `PVF-A03.03 · Cancelación del Wizard con Rollback Total a Cero (VV-004)`
- **VF Internas de Derivación:** 
  - `VF-A03.02 · Alta de Tarea mediante Wizard y Límites Tipográficos`
  - `VF-A03.03 · Rollback Total a Cero en Cancelación de Wizard (VV-004)`
- **Objetivo Indexado:** `Implementar Wizard modal en 3 pasos (Paso 1: Título 120 chars, Paso 2: Descripción 1000 chars, Paso 3: Prioridad). Cancelar/ESC purga buffer en memoria (Decisión 3A).`
- **Validación Indexada:** `src/tasks/components/TaskCreationWizard.tsx`
- **Evidencia de Cierre Indexada:** `Superación del caso VV-004: redacción parcial cancelada reabre el modal 100% vacío; creación exitosa añade la tarjeta al Hub.`
- **LOCK Previo Requerido:** `LOCK-FIA-A03.02.md APROBADO (Commit: f9df22d)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y validar mediante TDD exhaustivo con `@testing-library/react` el componente modal interactivo `TaskCreationWizard` en `src/tasks/components/TaskCreationWizard.tsx` (con sus estilos encapsulados en `TaskCreationWizard.module.css`), conectándolo al flujo de alta desde `TasksAccordion` en el Hub:
1. **Asistente Guiado en 3 Pasos Secuenciales:**
   - **Paso 1 (Nombre / Título):** Input de texto con autofocus automático, límite rígido de 120 caracteres (Decisión 2B), contador numérico de caracteres (`N/120`), bloqueo de avance con alerta inline (*"El nombre no puede estar en blanco"*) ante entradas vacías o compuestas exclusivamente por espacios en blanco, y botones `[Siguiente]` y `[Cancelar]`.
   - **Paso 2 (Descripción):** Textarea con soporte de saltos de línea, límite rígido de 1000 caracteres (Decisión 2B), contador numérico de caracteres (`N/1000`), botón `[Atrás]` (que retrocede al Paso 1 conservando intacto el título en el buffer de trabajo), botón `[Siguiente]` y botón `[Cancelar]`.
   - **Paso 3 (Prioridad y Guardado):** Selector de prioridad visual con tres tarjetas/opciones con código cromático canónico: `Alta` (Rojo `#EF4444`), `Media` (Ámbar `#F59E0B`), `Baja` (Azul `#3B82F6`), con valor inicial predeterminado en `'media'`. Botón `[Atrás]` (que retrocede al Paso 2 conservando la descripción), botón `[Guardar]` / `[Crear Tarea]` y botón `[Cancelar]`.
2. **Blindaje de Invariante Arquitectónica: Caso Forense VV-004 & Decisión 3A (Rollback Total a Cero):**
   - Si el usuario pulsa el botón `[Cancelar]`, el botón de cierre `(✕)` con `aria-label="Cerrar modal"`, o presiona la tecla `ESC` en **cualquier paso del asistente** (Paso 1, 2 o 3) tras haber redactado información parcial, el sistema aborta de inmediato la operación y **destruye por completo el buffer temporal en memoria**.
   - Queda terminantemente prohibido almacenar borradores o reabrir el formulario en pasos avanzados. Al volver a abrir el wizard, este debe nacer obligatoriamente en el **Paso 1**, con todos los campos de texto **100% vacíos** y la prioridad restablecida a su valor por defecto.
3. **Persistencia e Inserción Reactiva en Hub:**
   - Al pulsar `[Guardar]`, el botón entra en estado `isLoading` (deshabilitado con indicador de carga *"Guardando..."*).
   - Se despacha la creación mediante `TasksService.createTask(userId, { titulo, descripcion, prioridad })`.
   - Tras recibir respuesta exitosa (201 Created), el modal se cierra, purga su buffer y despacha el callback `onTaskCreated(newTask)`, provocando que `TasksAccordion` inserte la nueva tarjeta en la cúspide de la lista y actualice reactivamente su contador en cabecera `Tareas (N)`.
   - En caso de error en la API/Servicio, permanece en el Paso 3, muestra alerta de error inline accesible y rehabilita los botones para permitir el reintento.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/tasks/components/TaskCreationWizard.tsx` implementando los 3 pasos, validación en línea, rollback a cero y tecla ESC.
  - Creación de `src/tasks/components/TaskCreationWizard.module.css` con estilos oscuros Centra-T (fondo modal `#131B26`, bordes `#233144`, overlay oscurecido con `backdrop-filter: blur(4px)`, tarjetas de prioridad y foco accesible).
  - Creación de `src/tasks/components/TaskCreationWizard.test.tsx` con cobertura del 100% de los casos (navegación hacia adelante/atrás, límites 2B, caso forense VV-004, cancelación por ESC y persistencia con servicio).
  - Integración del modal dentro de `src/hub/components/TasksAccordion.tsx` para que al pulsar `+ Nueva` o `+ Crear Tarea` se abra el wizard y al completarse se agregue la tarea al listado y se actualice el contador.
  - Verificación del 100% de la suite global en verde en Vitest (mínimo 86-90 tests globales pasando).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Mutación optimista de checkbox con rollback y Toast ante 500 (`TaskCard.tsx` pertenece a `FIA-A03.04`).
  - Menú contextual flotante y modal preventivo de eliminación de tareas (`TaskActionMenu.tsx` pertenece a `FIA-A03.05`).
  - Drag & Drop y vinculación de tareas con casillas del calendario mensual (`RV-A06`).
  - Listas de la compra o limpieza (`RV-A04`, `RV-A05`).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Decisión 2B: Límites tipográficos 120/1000; Decisión 3A: Rollback a cero en cancelación).
  - `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 04: Asistente de Creación de Items en 3 Pasos; Tabla de validaciones).
  - `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.1: `Crear_Item_Wizard_Pasos`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Filas PVF-A03.02 y PVF-A03.03 / Caso Forense VV-004).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A03.03).
  - `FIA-A03.02_AS_BUILT.md` (Acordeón de Hub y Estados EV-01..05 operativos con credenciales demo).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A03.02` (Aprobado en commit `f9df22d`).
  - *Posterior:* Desbloquea `FIA-A03.04` (TaskCard con Mutación Optimista y Reversión ante 500).

### 5. Contratos Afectados
- **Contrato de Interfaz (`TaskCreationWizardProps`):**
  ```typescript
  export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    tasksService?: TasksService;
    onTaskCreated?: (task: TaskItem) => void;
  }
  ```
- **Contrato de Actualización de `TasksAccordionProps`:**
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
- **Contrato Físico / Module Map:** Directorio `src/tasks/components/*` e integración en `src/hub/components/*`.
- **Contrato de Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="wizard-title"`, labels explícitos asociados, feedback de errores con `role="alert"`, navegación completa por teclado y captura de tecla `Escape`.

### 6. Restricciones
- **Decisión 2B (Fronteras Tipográficas Innegociables):** El título admite entre 1 y 120 caracteres tras aplicar `.trim()`. La descripción admite entre 0 y 1000 caracteres. No se permiten caracteres adicionales en la UI (corte o prevención con contador numérico).
- **Decisión 3A & Caso Forense VV-004 (Rollback a Cero):** Pulsar `[Cancelar]`, `ESC` o botón `(✕)` debe destruir de inmediato el buffer temporal en memoria. Ningún borrador debe persistir en localStorage ni en estado de sesión. Al reabrir, el modal debe iniciar en Paso 1 con campos completamente limpios.
- **Transición Hacia Atrás:** Pulsar `[Atrás]` en Paso 2 o Paso 3 debe preservar los datos ingresados en los pasos anteriores durante la sesión activa del asistente.
- **Aislamiento Multi-Tenant:** Toda creación de tarea debe asociarse obligatoriamente al `userId` del usuario en sesión.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/tasks/components/TaskCreationWizard.tsx`.
- **Estructura Interna de Estados:**
  - `step`: `1 | 2 | 3` (paso activo).
  - `titulo`: `string` (buffer de nombre).
  - `descripcion`: `string` (buffer de descripción).
  - `prioridad`: `TaskPriority` (`'alta' | 'media' | 'baja'`, default `'media'`).
  - `error`: `string | null` (mensajes de validación o fallo de API).
  - `isSubmitting`: `boolean` (bloqueo durante petición HTTP/Service).
- **Control de Ciclo de Vida:**
  - `resetState()`: Función pura que restablece los estados a sus valores iniciales en frío.
  - Al recibir `isOpen === false` o al cancelar/pulsar ESC, invoca `resetState()` y `onClose()`.
- **Fronteras Físicas Autorizadas:** Directorio `src/tasks/components/*` y `src/hub/components/TasksAccordion.tsx`.

### 8. Flujo Operativo
1. El usuario pulsa `[+ Nueva]` en la cabecera del acordeón o `[+ Crear Tarea]` en el Empty State del Hub.
2. El modal `TaskCreationWizard` se abre en **Paso 1 (Título)** con foco automático en el input de texto.
3. El usuario escribe el título (validando longitud 1..120). Si pulsa `[Siguiente]` sin texto, recibe alerta inline. Si tiene texto válido, avanza a **Paso 2**.
4. En **Paso 2 (Descripción)**, redacta opcionalmente hasta 1000 caracteres. Puede pulsar `[Atrás]` para corregir el título sin perderlo, o `[Siguiente]` para avanzar a **Paso 3**.
5. En **Paso 3 (Prioridad)**, selecciona entre `Alta`, `Media` o `Baja`. Pulsa `[Guardar]`.
6. El wizard activa el estado de carga (`Guardando...`), invoca `tasksService.createTask(userId, payload)`.
7. Tras respuesta exitosa, purga su buffer, cierra el modal y notifica a `TasksAccordion` mediante `onTaskCreated`.
8. En cualquier momento del flujo (Paso 1, 2 o 3), si el usuario pulsa `[Cancelar]`, `ESC` o `(✕)`, el asistente aborta inmediatamente y purga todo el buffer en memoria.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Creación estándar en 3 pasos):**
  - *Acción:* Paso 1: "Revisar presión caldera" ➔ Paso 2: "Ajustar manómetro a 1.5 bar" ➔ Paso 3: Prioridad 'alta' ➔ Guardar.
  - *Resultado:* Se crea la tarea con éxito, se cierra el modal, la tarjeta se añade a la cabecera del listado en el Hub y el contador sube a `Tareas (N+1)`.
- **Caso 2 (Navegación bidireccional preservando buffer):**
  - *Acción:* Avanzar a Paso 2, pulsar `[Atrás]`.
  - *Resultado:* Vuelve a Paso 1 mostrando el título previamente redactado. Volver a avanzar al Paso 2 preserva la descripción.
- **Caso 3 (Creación con descripción vacía):**
  - *Acción:* Paso 1 con título válido ➔ Paso 2 en blanco ➔ Paso 3 prioridad 'baja' ➔ Guardar.
  - *Resultado:* Tarea creada correctamente con descripción `""`.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Caso Forense VV-004 / Decisión 3A - Cancelación y Purga Total):**
  - *Acción:* Escribir título en Paso 1, avanzar a Paso 2 y escribir descripción, pulsar `[Cancelar]` (o `ESC`). Luego volver a abrir el asistente.
  - *Resultado:* El modal se abre en **Paso 1**, con el input de título completamente vacío `""`, la descripción vacía y la prioridad por defecto. **Buffer purgado al 100%**.
- **Caso Inválido 2 (Título en blanco en Paso 1):**
  - *Acción:* Dejar el campo vacío o con espacios e intentar pulsar `[Siguiente]`.
  - *Resultado:* Se bloquea la transición de paso y se renderiza el mensaje de error inline *"El nombre no puede estar en blanco"*.
- **Caso Inválido 3 (Límites tipográficos Decisión 2B):**
  - *Acción:* Intentar ingresar más de 120 caracteres en título o más de 1000 en descripción.
  - *Resultado:* La interfaz impide superar la cuota (`maxLength` y control reactivo), mostrando el contador al tope.
- **Caso Inválido 4 (Fallo de servidor al persistir):**
  - *Acción:* `tasksService.createTask` arroja excepción (HTTP 500 / Network Error).
  - *Resultado:* Permanece en Paso 3, muestra mensaje de error inline y rehabilita el botón `[Guardar]`.

### 11. Tests Requeridos
- **Tests Unitarios y de Integración (`TaskCreationWizard.test.tsx`):**
  1. Renderizado accesible del modal en Paso 1 con autofocus y contador de caracteres `0/120`.
  2. Bloqueo de avance con mensaje de error inline si el título está vacío o solo contiene espacios.
  3. Límite estricto de 120 caracteres en título (Decisión 2B).
  4. Navegación fluida hacia adelante y preservación de datos en buffer al pulsar `[Atrás]`.
  5. Textarea de descripción en Paso 2 con contador `0/1000` y límite de 1000 caracteres (Decisión 2B).
  6. Selección visual de prioridad en Paso 3 (Alta, Media, Baja).
  7. Persistencia exitosa mediante `tasksService`, llamada a `onTaskCreated` y cierre del modal.
  8. **Test Canónico Caso Forense VV-004:** Redacción parcial en paso 2, cancelación con botón `[Cancelar]`, reapertura del modal y aserción estricta de que nace en Paso 1 con campos 100% vacíos.
  9. Cancelación y purga total al presionar la tecla `Escape`.
  10. Manejo de error al fallar la creación sin perder los datos del paso 3 para permitir reintentar.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 86-90 tests globales pasando).

### 12. Quality Gates (QG-FIA-A03.03)
- `QG-FIA-A03.03-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A03.03-02 · Tests Suite:` 100% de tests en verde en todo el proyecto (13 suites pasando).
- `QG-FIA-A03.03-03 · Blindaje VV-004 Validado:` Tests automatizados de Rollback total a cero en verde.
- `QG-FIA-A03.03-04 · Fronteras Decisión 2B:` 120 caracteres de título y 1000 de descripción verificados en UI y dominio.
- `QG-FIA-A03.03-05 · Cero Regresiones:` Los 77 tests previos continúan en verde sin alteraciones.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TaskCreationWizard` y sus estilos encapsulados están implementados cumpliendo el wizard en 3 pasos.
2. El Caso Forense VV-004 (Rollback total a cero al cancelar o presionar ESC) está demostrado mediante tests automatizados rigurosos.
3. El asistente está integrado con `TasksAccordion` en el Hub para creación real de tareas.
4. El 100% de los tests del proyecto pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.03.md`, `TEST_REPORT_FIA-A03.03.md` y la propuesta formal de `LOCK-FIA-A03.03.md`.
