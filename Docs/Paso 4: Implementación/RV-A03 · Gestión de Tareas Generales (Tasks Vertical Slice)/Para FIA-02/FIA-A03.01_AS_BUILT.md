# CENTRA-T · FIA-A03.01 · ENTIDAD DOMESTICITEM (TASK) Y ENDPOINTS CRUD (AS-BUILT)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · MOTOR DE TAREAS Y DECISIÓN 2B BLINDADOS  
**Evidencia de Cierre:** LOCK-FIA-A03.01.md APROBADO (Commit: `0a4f3aa`)  

---

### 1. Identificación
- **FIA:** `FIA-A03.01`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Implementada:** `Entidad DomesticItem (Task) y Endpoints CRUD`
- **Hito de Rebanada:** `Apertura y Consolidación del Motor de Dominio de Tareas (RV-A03)`
- **PVF Satisfecha:** `PVF-A03.01 · Motor de Dominio de Tareas y Operaciones CRUD Aisladas por Tenant`
- **VF Asociada:** `VF-A03.01 · Modelo de Datos de Tarea y Endpoints REST`
- **Commit de Cierre (Git):** `0a4f3aa` (feat(tasks): implementar entidad TaskItem, repositorio aislado y endpoints CRUD)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A03.01.md Aprobado (68/68 tests en verde a través de 11 suites, 100% cobertura en dominio de tareas, Decisión 2B y multi-tenant)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A03.02.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A03.01.md` y `FIA-A03.01.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de agregados de `SUITE_ARQUITECTURA_CORE.docx` (Agregado DomesticItem, Aislamiento de Tenant por userId y Decisión 2B) y el Módulo 4 (`tasks, shopping & cleaning`) de `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A02.05` (Commit `778c049`), con 56 tests globales en verde y RV-A02 sellada.
- **Archivos Base:** Módulos de autenticación, usuarios, espacio de trabajo, hub y suite global de pruebas.

### 4. Objetivo Implementado
1. Creación de la entidad de dominio inmutable `TaskItem` (`src/tasks/entities/task-item.entity.ts`), subtipo del agregado `DomesticItem` con `modulo: 'tasks'`, tipado estricto `TaskPriority` (`'alta' | 'media' | 'baja'`), `completado: boolean`, `fechaProgramada: Date | null` y timestamps de auditoría.
2. Blindaje innegociable de la **Decisión 2B**:
   - Corte tipográfico estricto del título: 1 a 120 caracteres (`InvalidTaskTitleError`, HTTP 400).
   - Corte tipográfico estricto de la descripción: máximo 1000 caracteres (`InvalidTaskDescriptionError`, HTTP 400).
   - Validación de prioridad cerrada (`InvalidTaskPriorityError`, HTTP 400).
3. **Aislamiento Multi-Tenant Estricto:** Requerimiento incondicional de `userId` en todas las consultas y mutaciones (`findAllByUser`, `findById`, `updateTask`, `toggleTaskStatus`, `deleteTask`). Cualquier intento de acceso o mutación sobre una tarea de otro tenant responde con `TaskNotFoundError` (HTTP 404).
4. Implementación de `InMemoryTaskRepository` con almacenamiento compartido y sincronización transparente con `localStorage` (`centrat_tasks_db`) para soportar la experiencia interactiva en desarrollo, y método `clear()` para esterilidad de tests.
5. Implementación de `TasksService` y `TasksController` con respuestas HTTP REST tipadas (201 Created, 200 OK).

### 5. Alcance Final
- Creación de `src/tasks/entities/task-item.entity.ts`.
- Creación de DTOs inmutables: `src/tasks/dto/create-task.dto.ts` y `src/tasks/dto/update-task.dto.ts`.
- Creación de `src/tasks/repositories/task.repository.ts` con interfaz `ITaskRepository` y clase `InMemoryTaskRepository`.
- Creación de `src/tasks/services/tasks.service.ts` y suite `tasks.service.test.ts` (9 tests).
- Creación de `src/tasks/controllers/tasks.controller.ts` y suite `tasks.controller.test.ts` (3 tests).
- Actualización de `src/test/setup.ts` con `InMemoryTaskRepository.clear()`.
- Suite global completa: 68/68 tests pasando en verde con Vitest.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-02/De FIA-01/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Entidad:**
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
- **Contratos de Entrada (DTOs):** `CreateTaskDto` y `UpdateTaskDto`.
- **Contratos de Excepciones:** `InvalidTaskTitleError` (400), `InvalidTaskDescriptionError` (400), `InvalidTaskPriorityError` (400), `TaskNotFoundError` (404).

### 8. Restricciones Finales
- Límites tipográficos inalterables: título de 1 a 120 caracteres y descripción de 0 a 1000 caracteres.
- Presencia innegociable de `userId` en todas las operaciones.
- Prohibición de acceso cruzado entre tenants (404 asegurado).

### 9. Diseño Técnico Final
- Estructura modular y desacoplada bajo `src/tasks/`.
- Repositorio con tolerancia a fallos y sincronización con almacenamiento del navegador para persistencia viva.
- Servicio con validaciones estáticas puras e invariantes de negocio.

### 10. Flujo Operativo Final
1. `TasksController.create(userId, dto)` -> `TasksService.createTask(userId, dto)`.
2. Validación de título (1..120 chars), descripción (0..1000 chars) y prioridad ('alta' | 'media' | 'baja').
3. Persistencia en `taskRepository.save(newTask)` asociando `userId`.
4. Consultas y mutaciones filtrando estrictamente por `userId === task.userId`.

### 11. Casos Válidos Finales
- **Validado 1:** Creación con valores por defecto (`prioridad: 'media'`, `completado: false`, `fechaProgramada: null`).
- **Validado 2:** Creación en los límites extremos de la Decisión 2B (título de 120 caracteres y descripción de 1000 caracteres).
- **Validado 3:** Listado multi-tenant aislado (`findAllByUser` solo retorna tareas del usuario solicitante).
- **Validado 4:** Alternancia atómica del estado completado (`toggleTaskStatus`).
- **Validado 5:** Edición selectiva y eliminación exitosa.

### 12. Casos Inválidos Finales
- **Validado 1:** Título vacío o solo espacios arroja `InvalidTaskTitleError` (400).
- **Validado 2:** Título de 121 caracteres arroja `InvalidTaskTitleError` (400).
- **Validado 3:** Descripción de 1001 caracteres arroja `InvalidTaskDescriptionError` (400).
- **Validado 4:** Prioridad desconocida arroja `InvalidTaskPriorityError` (400).
- **Validado 5:** Acceso cruzado por un tenant distinto arroja `TaskNotFoundError` (404).

### 13. Tests Requeridos Finales
Suite global de 68 tests validada al 100% en verde:
- `tasks.service.test.ts` (9 tests de dominio y aislamiento)
- `tasks.controller.test.ts` (3 tests de endpoints REST)
- 56 tests previos preservados sin regresiones.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (68/68 tests pasando en verde en Vitest).
- `QG-04 · Blindaje Decisión 2B:` Superado (Límites 120/1000 certificados).
- `QG-05 · Aislamiento Multi-Tenant Certificado:` Superado (404 cruzado certificado).

### 15. Archivos Reales Afectados
```
Creados:
- src/tasks/entities/task-item.entity.ts
- src/tasks/dto/create-task.dto.ts
- src/tasks/dto/update-task.dto.ts
- src/tasks/repositories/task.repository.ts
- src/tasks/services/tasks.service.ts
- src/tasks/services/tasks.service.test.ts
- src/tasks/controllers/tasks.controller.ts
- src/tasks/controllers/tasks.controller.test.ts

Modificados:
- src/test/setup.ts
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. Fidelidad absoluta a la especificación técnica.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A03.01` ha completado su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 68/68 tests en verde y blindando el motor de dominio de tareas y la Decisión 2B. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y ejecución de **`FIA-A03.02 · Acordeón de Tareas en Hub con Estados EV-01..05`**.
