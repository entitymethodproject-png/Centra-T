# CENTRA-T · FIA-A03.01 · ENTIDAD DOMESTICITEM (TASK) Y ENDPOINTS CRUD
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A03 (APERTURA DEL MOTOR DE TAREAS)  

---

### 1. Identificación
- **FIA:** `FIA-A03.01`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Prevista:** `Entidad DomesticItem (Task) y Endpoints CRUD`
- **PVF de Cierre Cubierta:** `PVF-A03.01 · Motor de Dominio de Tareas y Operaciones CRUD Aisladas por Tenant`
- **VF Interna de Derivación:** `VF-A03.01 · Modelo de Datos de Tarea y Endpoints REST`
- **Objetivo Indexado:** `Implementar modelo de dominio de Tareas con userId inmutable, límites tipográficos (título 120 chars, descripción 1000 chars - Decisión 2B) y endpoints CRUD.`
- **Validación Indexada:** `src/tasks/services/tasks.service.ts`
- **Evidencia de Cierre Indexada:** `100% de cobertura en tests unitarios: validación de longitud, aislamiento multi-tenant por userId y operaciones de base de datos exitosas.`
- **LOCK Previo Requerido:** `LOCK-FIA-A02.05.md APROBADO (Commit: 778c049)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar con TDD en pruebas unitarias y de integración el modelo de dominio y el backend completo para la gestión de Tareas Generales (`tasks`):
1. Definir la entidad `TaskItem` (subtipo del agregado `DomesticItem` con `modulo: 'tasks'`), modelando sus atributos obligatorios (`id`, `userId`, `titulo`, `descripcion`, `prioridad`, `completado`, `fechaProgramada`, `createdAt`, `updatedAt`).
2. Blindar las invariantes de negocio de la **Decisión 2B**:
   - Título obligatorio con límite tipográfico duro: entre 1 y 120 caracteres tras sanitización.
   - Descripción opcional con límite tipográfico duro: máximo 1000 caracteres.
   - Prioridad restringida al conjunto tipado: `'alta' | 'media' | 'baja'` (por defecto `'media'`).
   - Estado `completado` booleano (por defecto `false`).
3. Garantizar el **Aislamiento Absoluto de Tenant**: el `userId` es inmutable y actúa como condición estricta (`WHERE user_id = :userId`) en todas las operaciones de consulta, modificación, alternancia de estado y eliminación. Un usuario jamás puede acceder ni mutar tareas de otro usuario.
4. Desarrollar `TasksService`, `ITaskRepository` (con implementación `InMemoryTaskRepository` persistente y sincronizada con `localStorage` para modo navegador interactivo, con método `clear()` para esterilidad de tests), DTOs tipados y `TasksController` exponiendo la API REST tipada:
   - `POST /tasks`: Creación de tarea.
   - `GET /tasks`: Listado de tareas del usuario autenticado.
   - `GET /tasks/:id`: Obtención de tarea por ID.
   - `PUT /tasks/:id`: Edición de título, descripción y prioridad.
   - `PATCH /tasks/:id/toggle`: Alternancia atómica del estado completado (`completado = !completado`).
   - `DELETE /tasks/:id`: Eliminación física de la tarea.
5. Alcanzar el 100% de cobertura en tests de dominio, validación de excepciones tipadas (400, 404) y aislamiento de inquilinos.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Entidad de dominio `src/tasks/entities/task-item.entity.ts`.
  - DTOs inmutables: `src/tasks/dto/create-task.dto.ts`, `src/tasks/dto/update-task.dto.ts`, `src/tasks/dto/task-response.dto.ts`.
  - Repositorio `src/tasks/repositories/task.repository.ts` con interfaz `ITaskRepository` y clase `InMemoryTaskRepository`.
  - Errores de dominio tipados: `InvalidTaskTitleError` (400), `InvalidTaskDescriptionError` (400), `InvalidTaskPriorityError` (400), `TaskNotFoundError` (404).
  - Servicio de dominio `src/tasks/services/tasks.service.ts` con todos los métodos CRUD y validación de invariantes.
  - Controlador HTTP `src/tasks/controllers/tasks.controller.ts` con endpoints REST.
  - Batería completa de pruebas unitarias y de integración en `src/tasks/services/tasks.service.test.ts` y `src/tasks/controllers/tasks.controller.test.ts`.
  - Verificación del 100% de tests del proyecto en verde (sin regresiones en los 56 tests de RV-A01 y RV-A02).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Componentes visuales del acordeón de tareas en el Hub (`TasksAccordion.tsx` pertenece a `FIA-A03.02`).
  - Modal Wizard de creación en 3 pasos (`TaskCreationWizard.tsx` pertenece a `FIA-A03.03`).
  - Tarjeta de tarea con checkbox optimista (`TaskCard.tsx` pertenece a `FIA-A03.04`).
  - Lógica de lista de compra (`shopping`) o limpieza (`cleaning`).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Agregado DomesticItem, Aislamiento de Tenant por userId, Decisión 2B: límites de 120 y 1000 caracteres).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Integración de tareas en el Hub).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 4: `tasks, shopping & cleaning`, Proceso 4.1 a 4.4).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Fila PVF-A03.01 / Decisión 2B).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A03.01).
  - `FIA-A02.05_AS_BUILT.md` (Cierre formal de RV-A02: `SessionAuthGuard` y `UsersService` operativos).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, Vitest 3.x, crypto nativo para UUIDs.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A02.05` (Aprobado en commit `778c049`).
  - *Posterior:* Desbloquea `FIA-A03.02` (Acordeón de Tareas en Hub con Estados EV-01..05).

### 5. Contratos Afectados
- **Contrato de Entidad (`TaskItem`):**
  ```typescript
  export type TaskPriority = 'alta' | 'media' | 'baja';

  export interface TaskItem {
    id: string;
    userId: string;
    modulo: 'tasks';
    titulo: string;
    descripcion: string;
    prioridad: TaskPriority;
    completado: boolean;
    fechaProgramada: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **Contratos de Entrada (DTOs):**
  ```typescript
  export interface CreateTaskDto {
    titulo: string;
    descripcion?: string;
    prioridad?: TaskPriority;
    fechaProgramada?: Date | null;
  }

  export interface UpdateTaskDto {
    titulo?: string;
    descripcion?: string;
    prioridad?: TaskPriority;
    fechaProgramada?: Date | null;
  }
  ```
- **Contrato de Servicio (`TasksService`):**
  - `createTask(userId: string, dto: CreateTaskDto): Promise<TaskItem>`
  - `findAllByUser(userId: string): Promise<TaskItem[]>`
  - `findById(userId: string, id: string): Promise<TaskItem>`
  - `updateTask(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskItem>`
  - `toggleTaskStatus(userId: string, id: string): Promise<TaskItem>`
  - `deleteTask(userId: string, id: string): Promise<void>`

### 6. Restricciones
- **Decisión 2B Innegociable:** El título no puede superar 120 caracteres ni ser una cadena vacía. La descripción no puede superar 1000 caracteres.
- **Multi-Tenant Estricto:** Toda lectura, mutación o borrado DEBE incluir el parámetro `userId`. Si una tarea existe pero pertenece a otro usuario, el sistema debe responder `TaskNotFoundError` (404) para evitar la enumeración o filtración de datos de otros inquilinos.
- **Inmutabilidad del Identificador:** El `id` y el `userId` no pueden ser alterados tras la creación de la tarea.

### 7. Diseño Técnico
- **Ubicación Física:** Directorio `src/tasks/*`.
- **Estructura Modular:**
  - `src/tasks/entities/task-item.entity.ts`: Definición de tipos, interfaz `TaskItem` y constantes de límites (MAX_TITULO = 120, MAX_DESCRIPCION = 1000).
  - `src/tasks/dto/`: DTOs de creación, actualización y respuesta.
  - `src/tasks/repositories/task.repository.ts`: Interfaz `ITaskRepository` e implementación `InMemoryTaskRepository` con aislamiento por `userId` y persistencia en cliente.
  - `src/tasks/services/tasks.service.ts`: Lógica de validación de negocio y orquestación.
  - `src/tasks/controllers/tasks.controller.ts`: Puntos de entrada HTTP REST.

### 8. Flujo Operativo
1. Un usuario autenticado emite una orden de creación con `{ titulo, descripcion?, prioridad? }`.
2. `TasksController.create(userId, dto)` recibe la petición (el `userId` se deriva de la sesión autenticada).
3. `TasksService.createTask` valida las invariantes de la Decisión 2B:
   - Sanitiza y comprueba longitud del título (1..120 caracteres).
   - Comprueba longitud de descripción (0..1000 caracteres).
   - Valida la prioridad (`'alta'`, `'media'`, `'baja'`).
4. Si falla cualquier validación, arroja error tipado con status 400.
5. Si es válido, ensambla la entidad con `modulo: 'tasks'`, `completado: false`, `createdAt: now`, y la persiste en el repositorio.
6. Retorna la entidad creada.
7. Al listar, mutar o eliminar, el servicio comprueba que `task.userId === userId`; de lo contrario, responde 404.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Creación exitosa con valores por defecto):**
  - *Input:* `userId: "usr-1"`, `dto: { titulo: "Comprar bombillas" }`.
  - *Resultado:* Tarea creada con prioridad `'media'`, `descripcion: ""`, `completado: false`, `fechaProgramada: null`.
- **Caso 2 (Creación con límites máximos permitidos - Decisión 2B):**
  - *Input:* Título de exactamente 120 caracteres y descripción de exactamente 1000 caracteres.
  - *Resultado:* Creación exitosa.
- **Caso 3 (Listado multi-tenant aislado):**
  - *Input:* Usuario 1 crea 2 tareas; Usuario 2 crea 1 tarea.
  - *Resultado:* `findAllByUser("usr-1")` devuelve exactamente 2 tareas; `findAllByUser("usr-2")` devuelve 1 tarea.
- **Caso 4 (Toggle atómico de estado):**
  - *Input:* Tarea pendiente (`completado: false`). Invocación a `toggleTaskStatus`.
  - *Resultado:* `completado: true`. Segunda invocación: `completado: false`.
- **Caso 5 (Actualización y eliminación):**
  - *Input:* `updateTask` modifica título y prioridad; `deleteTask` retira la tarea del repositorio.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Título vacío o solo espacios):**
  - *Resultado:* Arroja `InvalidTaskTitleError` (HTTP 400).
- **Caso Inválido 2 (Título excediendo 120 caracteres - Decisión 2B):**
  - *Input:* Cadena de 121 caracteres.
  - *Resultado:* Arroja `InvalidTaskTitleError` (HTTP 400: *"El título de la tarea debe tener entre 1 y 120 caracteres"*).
- **Caso Inválido 3 (Descripción excediendo 1000 caracteres - Decisión 2B):**
  - *Input:* Cadena de 1001 caracteres.
  - *Resultado:* Arroja `InvalidTaskDescriptionError` (HTTP 400).
- **Caso Inválido 4 (Prioridad desconocida):**
  - *Input:* Prioridad `'urgente'`.
  - *Resultado:* Arroja `InvalidTaskPriorityError` (HTTP 400).
- **Caso Inválido 5 (Violación de Aislamiento Tenant):**
  - *Acción:* El usuario "usr-2" intenta leer, editar, conmutar o eliminar una tarea creada por "usr-1".
  - *Resultado:* Arroja `TaskNotFoundError` (HTTP 404).

### 11. Tests Requeridos
- **Tests Unitarios del Servicio (`tasks.service.test.ts`):**
  1. Creación exitosa de tarea con atributos predeterminados y saneamiento de espacios.
  2. Cumplimiento de la Decisión 2B: rechazo de títulos con más de 120 caracteres y descripciones con más de 1000 caracteres.
  3. Rechazo de títulos vacíos o inválidos (400).
  4. Rechazo de prioridades inválidas (400).
  5. Aislamiento absoluto de inquilinos: confirmación de que un usuario no puede leer ni modificar tareas ajenas (404).
  6. Alternancia atómica del estado `completado` con `toggleTaskStatus`.
  7. Actualización parcial de campos con `updateTask`.
  8. Eliminación exitosa y posterior verificación de no existencia (404).
- **Tests de Integración del Controlador (`tasks.controller.test.ts`):**
  1. Puntos de entrada HTTP retornando códigos de estado adecuados (201 en creación, 200 en lecturas/actualizaciones, 204/200 en borrado).
- **Evidencia Exigida:** 100% de la suite global en verde (mínimo 68-70 tests totales en Vitest).

### 12. Quality Gates (QG-FIA-A03.01)
- `QG-FIA-A03.01-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A03.01-02 · Tests Suite:` 100% de tests en verde en todo el proyecto.
- `QG-FIA-A03.01-03 · Blindaje Decisión 2B:` Tests específicos comprobando el corte en 120 caracteres de título y 1000 de descripción.
- `QG-FIA-A03.01-04 · Aislamiento Multi-Tenant Certificado:` Tests comprobando que peticiones cruzadas devuelven 404.
- `QG-FIA-A03.01-05 · Anti-Drift Scan:` Cero archivos fuera de `src/tasks/*`.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TaskItem`, DTOs, `TasksService`, `ITaskRepository` y `TasksController` están implementados y respetan estrictamente la Decisión 2B y el aislamiento multi-tenant.
2. Los tests de dominio y controlador pasan al 100% en verde con Vitest.
3. Se preserva el 100% de tests previos de RV-A01 y RV-A02 sin ninguna regresión.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.01.md`, `TEST_REPORT_FIA-A03.01.md` y la propuesta formal de `LOCK-FIA-A03.01.md`.
