# CENTRA-T · FIA-A03.02 · ACORDEÓN DE TAREAS EN HUB CON ESTADOS EV-01..05
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A03.02`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Prevista:** `Acordeón de Tareas en Hub con Estados EV-01..05`
- **PVF de Cierre Cubierta:** `PVF-A03.01 · Renderizado de Acordeón de Tareas y Estados Vacíos`
- **VF Interna de Derivación:** `VF-A03.01 · Acordeón de Tareas y Estado Vacío en Hub`
- **Objetivo Indexado:** `Construir componente acordeón en Hub con cabecera de conteo reactiva 'Tareas (N)', Skeleton de carga, Empty State con CTA ilustrado y lista de tarjetas.`
- **Validación Indexada:** `src/hub/components/TasksAccordion.tsx`
- **Evidencia de Cierre Indexada:** `Tests RTL verifican transición entre skeleton, estado vacío y lista de tarjetas según la respuesta de la API.`
- **LOCK Previo Requerido:** `LOCK-FIA-A03.01.md APROBADO (Commit: 0a4f3aa)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar en pruebas de integración de interfaz con `@testing-library/react` el componente `TasksAccordion` en `src/hub/components/TasksAccordion.tsx`, integrándolo en la columna lateral `HubContainer` del espacio de trabajo:
1. Cabecera accesible con `role="button"` y `aria-expanded`:
   - Título y contador reactivo en tiempo real: `Tareas (N)`.
   - Indicador de chevron interactivo (`▼` expandido, `►` colapsado) con transición suave.
   - Botón de acción rápida `[+ Nueva]` o `[+ Crear]` para invocar el flujo de alta.
2. Matriz exhaustiva de estados UI canónicos (Doc 09 · `EV-LIST-01..05`):
   - **`EV-LIST-02 (LOADING / SKELETON):`** Skeleton Screen de 3 filas animadas con pulso shimmer dentro del contenedor del acordeón (prohibición estricta de spinners a pantalla completa).
   - **`EV-LIST-03 (EMPTY STATE):`** Contenedor con borde discontinuo tenue (`1px dashed #233144`), mensaje sobrio *"No tienes tareas pendientes"* y botón CTA ilustrado `[+ Crear Tarea]`.
   - **`EV-LIST-05 (ERROR STATE):`** Banner inline con mensaje de error y botón `[Reintentar]`.
   - **`EV-LIST-01 (POPULATED LIST):`** Lista accesible (`<ul role="list">`) renderizando las tarjetas con checkbox, título, tachado visual si está completada (`line-through`) y badge de prioridad con código de color (`alta`: rojo, `media`: ámbar, `baja`: azul).
3. Conexión limpia con `TasksService` para la carga inicial por `userId` y alternancia de estado de tareas (`toggleTaskStatus`), con soporte para inyección de props para testing determinista.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/hub/components/TasksAccordion.tsx` con soporte para expansión/colapso, estados y listado.
  - Creación de `src/hub/components/TasksAccordion.module.css` con tokens de Centra-T (fondo `#131B26`, bordes `#233144`, badges de prioridad y animaciones de esqueleto).
  - Creación de `src/hub/components/TasksAccordion.test.tsx` con cobertura de todos los estados y transiciones.
  - Integración del acordeón en `HubContainer` en el entorno de montaje del Workspace.
  - Verificación del 100% de tests del proyecto pasando en verde (mínimo 78-80 tests totales).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Modal Wizard de creación en 3 pasos (`TaskCreationWizard.tsx` pertenece a `FIA-A03.03`).
  - Mutación optimista de checkbox con rollback y Toast ante 500 (`TaskCard.tsx` pertenece a `FIA-A03.04`).
  - Menú contextual y modal preventivo de eliminación (`TaskActionMenu.tsx` pertenece a `FIA-A03.05`).
  - Listas de compras o limpieza.

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología de Hub, Matriz de 5 Estados, Prohibición de Spinners a Pantalla Completa).
  - `09_CENTRA_T_VISUAL_STATES.docx` (Matriz canónica EV-LIST-01 a EV-LIST-05).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 3: Hub y Acordeones).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Fila PVF-A03.01 / VF-A03.01).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A03.02).
  - `FIA-A03.01_AS_BUILT.md` (Motor de dominio `TasksService` y `TaskItem` cerrados y operativos).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A03.01` (Aprobado en commit `0a4f3aa`).
  - *Posterior:* Desbloquea `FIA-A03.03` (Modal Wizard de Creación en 3 Pasos - VV-004).

### 5. Contratos Afectados
- **Contrato de Interfaz (`TasksAccordionProps`):**
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
- **Contrato Físico / Module Map:** Directorio `src/hub/components/*`.
- **Contrato de Accesibilidad:** `aria-expanded` en cabecera, `role="region"` o `role="tabpanel"` en contenido, y lista accesible con `<ul role="list">`.

### 6. Restricciones
- Queda terminantemente prohibido utilizar spinners a pantalla completa: el estado de carga debe representarse exclusivamente mediante Skeleton Screens dentro del acordeón.
- El contador en la cabecera debe reflejar reactivamente la cantidad exacta de tareas visibles: `Tareas (${tasks.length})`.
- El colapso del acordeón no debe destruir el estado ni resetear los datos cargados.
- Accesibilidad WCAG AA: contraste adecuado en badges de prioridad y textos legibles.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/hub/components/TasksAccordion.tsx`.
- **Estructura Interna:**
  - `isExpanded`: Controla la visibilidad del cuerpo del acordeón.
  - Renderizado condicional de estados:
    1. Si `isLoading`: renderiza 3 items esqueleto con efecto de brillo (shimmer).
    2. Si `error`: renderiza banner de error con botón de reintento.
    3. Si `!isLoading && tasks.length === 0`: renderiza Empty State con borde discontinuo y CTA `[+ Crear Tarea]`.
    4. Si `!isLoading && tasks.length > 0`: renderiza lista de tareas con badges de prioridad y checkboxes.
- **Fronteras Físicas Autorizadas:** Directorio `src/hub/components/*`.

### 8. Flujo Operativo
1. El componente se monta en el Hub; si no se proveen `tasks` directas, invoca `tasksService.findAllByUser(userId)`.
2. Durante la carga, muestra el Skeleton Screen de 3 filas.
3. Si el usuario no tiene tareas, se presenta el Empty State sobrio con el botón CTA para añadir la primera tarea.
4. Si hay tareas, se despliega la lista con sus prioridades y checkboxes.
5. Al hacer clic en la cabecera, el cuerpo se contrae o expande fluidamente actualizando `aria-expanded`.
6. Al marcar un checkbox, se llama a `onTaskToggle` y/o `tasksService.toggleTaskStatus(userId, taskId)`.
7. Al pulsar el botón `[+ Nueva]` o el CTA del estado vacío, se invoca `onCreateTaskClick()`.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Carga exitosa con tareas - EV-LIST-01):**
  - *Input:* Lista con 3 tareas.
  - *Resultado:* Cabecera muestra "Tareas (3)", lista renderiza 3 filas con badges y checkboxes.
- **Caso 2 (Estado Vacío - EV-LIST-03):**
  - *Input:* Lista vacía (`tasks = []`).
  - *Resultado:* Cabecera muestra "Tareas (0)", cuerpo muestra mensaje "No tienes tareas pendientes" y botón CTA.
- **Caso 3 (Skeleton Screen de Carga - EV-LIST-02):**
  - *Input:* `isLoading = true`.
  - *Resultado:* Se renderiza el Skeleton de 3 líneas sin bloquear el resto de la interfaz.
- **Caso 4 (Colapso y Expansión):**
  - *Acción:* Clic en la cabecera del acordeón.
  - *Resultado:* Alterna `isExpanded`, ocultando o mostrando el cuerpo y rotando el icono chevron.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Error de Carga - EV-LIST-05):**
  - *Input:* Fallo en la llamada al servicio o prop `error`.
  - *Resultado:* Despliega banner inline de advertencia con botón para reintentar la operación.
- **Caso Inválido 2 (Clic en CTA de error):**
  - *Acción:* Clic en `[Reintentar]`.
  - *Resultado:* Ejecuta `onRetry` o re-invoca la consulta al servicio.

### 11. Tests Requeridos
- **Tests de Integración (Testing Library en `TasksAccordion.test.tsx`):**
  1. Renderizado de cabecera con contador dinámico `Tareas (N)` y botón `[+ Nueva]`.
  2. Alternancia de expansión y colapso al pulsar la cabecera (`aria-expanded`).
  3. Renderizado del estado de carga Skeleton Screen cuando `isLoading = true`.
  4. Renderizado del Empty State cuando no hay tareas y verificación del clic en el botón CTA.
  5. Renderizado de lista poblada con badges de prioridad adecuados ('alta', 'media', 'baja').
  6. Tachado de texto (`line-through`) en tareas completadas.
  7. Invocación de `onTaskToggle` al hacer clic en el checkbox.
  8. Renderizado del estado de error y llamada a `onRetry`.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 78-80 tests globales).

### 12. Quality Gates (QG-FIA-A03.02)
- `QG-FIA-A03.02-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A03.02-02 · Tests Suite:` 100% de tests en verde en todo el proyecto.
- `QG-FIA-A03.02-03 · Matriz EV-LIST Validada:` Tests automatizados de Skeleton, Empty State y Populated List en verde.
- `QG-FIA-A03.02-04 · Accesibilidad WCAG AA:` Atributos `aria-expanded`, labels accesibles y marcado semántico.
- `QG-FIA-A03.02-05 · Cero Regresiones:` Los 68 tests previos continúan en verde.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TasksAccordion` y sus estilos están implementados respetando la matriz de estados EV-LIST-01 a 05.
2. Las transiciones de skeleton, empty state y lista poblada están demostradas mediante tests de integración.
3. El 100% de los tests del proyecto pasan en verde con Vitest.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.02.md`, `TEST_REPORT_FIA-A03.02.md` y la propuesta formal de `LOCK-FIA-A03.02.md`.
