# SPEC-FIA-A03.01 · ENTIDAD DOMESTICITEM (TASK) Y ENDPOINTS CRUD

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A03.01 · Entidad DomesticItem (Task) y Endpoints CRUD  
**PVF de Cierre:** PVF-A03.01 · Motor de Dominio de Tareas y Operaciones CRUD Aisladas por Tenant  
**VF:** VF-A03.01 · Modelo de Datos de Tarea y Endpoints REST  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A02.05.md APROBADO (Commit: `778c049`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A03 (APERTURA DEL MOTOR DE TAREAS)  

---

## 1. Identificación
Compilar la orden técnica ejecutable para materializar el modelo de datos de dominio y los servicios/controladores CRUD del subsistema de Tareas Generales (`src/tasks/*`) para Antigravity CLI. Esta unidad conforma el cimiento funcional de la Rebanada Vertical 3, formalizando la entidad `TaskItem` (subtipo del agregado raíz `DomesticItem`), blindando las fronteras tipográficas de la **Decisión 2B** (título: 1 a 120 caracteres; descripción: 0 a 1000 caracteres; prioridad: alta/media/baja), garantizando el **Aislamiento Absoluto de Tenant** mediante el atributo inmutable `userId` en todas las operaciones, e implementando el ciclo completo CRUD (`createTask`, `findAllByUser`, `findById`, `updateTask`, `toggleTaskStatus`, `deleteTask`) coordinado a través de `TasksService`, `ITaskRepository` y `TasksController`.

## 2. Objetivo
Construir y verificar con TDD en pruebas unitarias y de integración:
1. Entidad inmutable `TaskItem` en `src/tasks/entities/task-item.entity.ts` con tipado estricto para `TaskPriority` (`'alta' | 'media' | 'baja'`), `modulo: 'tasks'`, estado `completado: boolean`, `fechaProgramada: Date | null` y timestamps de auditoría.
2. Invariantes de la **Decisión 2B**:
   - Título obligatorio sanitizado con longitud entre 1 y 120 caracteres. Si excede o está vacío, arrojar `InvalidTaskTitleError` (HTTP 400).
   - Descripción opcional con límite máximo de 1000 caracteres. Si excede, arrojar `InvalidTaskDescriptionError` (HTTP 400).
   - Prioridad restringida a `'alta' | 'media' | 'baja'`. Si es inválida, arrojar `InvalidTaskPriorityError` (HTTP 400).
3. **Aislamiento Multi-Tenant Estricto:** Toda consulta o mutación exige `userId`. Si se intenta acceder o mutar una tarea inexistente o perteneciente a otro usuario, arrojar `TaskNotFoundError` (HTTP 404).
4. `InMemoryTaskRepository` con almacenamiento compartido y sincronización transparente con `localStorage` (`centrat_tasks_db`) para soporte del modo interactivo en navegador de desarrollo, con método estático `clear()` para esterilidad de tests.
5. `TasksService` y `TasksController` con soporte integral para operaciones CRUD.
6. 100% de la suite global de tests pasando en verde (mínimo 70 tests totales en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A02.05_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa Auth & Usuarios: `src/users/*`, `src/authentication/*` (entidades, repositorios, servicios, guards, controladores y vistas).
  - Capa Topología & Layout: `src/workspace/*`, `src/hub/*` (WorkspaceLayout, HubContainer, TopNavbar).
  - Capa Raíz: `src/App.tsx`, `src/App.test.tsx`, `src/test/setup.ts`.
- **Estado de Tests Actual:** 56/56 tests pasando en verde en 9 archivos de test.
- **Riesgos Iniciales:** Colisión de almacenamiento o contaminación cruzada entre tests. Se debe registrar `InMemoryTaskRepository.clear()` en el gancho `beforeEach` de `src/test/setup.ts`.

## 4. Estado Objetivo
El repositorio debe contar con el nuevo subsistema `src/tasks/` completamente implementado, probado y desacoplado, listo para alimentar visualmente el acordeón del Hub en `FIA-A03.02`.
- **Restricciones negativas explícitas:**
  - Prohibido admitir títulos de más de 120 caracteres o descripciones de más de 1000 caracteres (Decisión 2B innegociable).
  - Prohibido omitir el filtro por `userId` en cualquier método del repositorio o servicio.
  - Prohibido crear componentes visuales de UI en esta unidad (reservados a `FIA-A03.02`, `03` y `04`).
  - Prohibido alterar o degradar los 56 tests existentes de RV-A01 y RV-A02.

## 5. Contratos Afectados
- **5.1 Contrato de Entidad (`TaskItem`):**
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
- **5.2 Contratos de Entrada (DTOs):**
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
- **5.3 Contrato de Excepciones Tipadas:**
  - `InvalidTaskTitleError`: `statusCode = 400`, mensaje descriptivo.
  - `InvalidTaskDescriptionError`: `statusCode = 400`, mensaje descriptivo.
  - `InvalidTaskPriorityError`: `statusCode = 400`, mensaje descriptivo.
  - `TaskNotFoundError`: `statusCode = 404`, mensaje: *"Tarea no encontrada"*.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/tasks/entities/task-item.entity.ts`: Modelo de dominio `TaskItem`, tipo `TaskPriority` y límites tipográficos (Decisión 2B).
- `src/tasks/dto/create-task.dto.ts`: DTO de creación de tarea.
- `src/tasks/dto/update-task.dto.ts`: DTO de edición de tarea.
- `src/tasks/repositories/task.repository.ts`: Interfaz `ITaskRepository` e implementación `InMemoryTaskRepository`.
- `src/tasks/services/tasks.service.ts`: Lógica de validación de negocio, agregación e invariantes.
- `src/tasks/services/tasks.service.test.ts`: Batería de pruebas unitarias de dominio y multi-tenant.
- `src/tasks/controllers/tasks.controller.ts`: Controlador HTTP REST para tareas.
- `src/tasks/controllers/tasks.controller.test.ts`: Pruebas de integración del controlador REST.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/test/setup.ts`: Incorporar `InMemoryTaskRepository.clear()` en el `beforeEach` global para aislamiento hermético.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Todos los archivos de `src/authentication/*`, `src/users/*`, `src/workspace/*` y `src/hub/*` (56 tests existentes deben mantenerse intactos en verde).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/shopping/*`, `src/cleaning/*` (pertenecen a rebanadas posteriores RV-A04 y RV-A05).
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Agregado DomesticItem, Aislamiento de Tenant por userId, Decisión 2B), `Centra-T Pseudocódigo (unificado).odt` (Módulo 4: Procesos 4.1 a 4.4), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A02.05_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, Vitest 3.x, API estándar de `crypto.randomUUID()`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A02.05`. Desbloquea `FIA-A03.02`.

## 8. Restricciones
- La Decisión 2B es innegociable: corte estricto en 120 caracteres para el título y 1000 caracteres para la descripción.
- Ninguna operación de lectura, edición o borrado puede omitir el parámetro `userId`.
- Las tareas creadas por el usuario `A` deben ser completamente invisibles e inaccesibles para el usuario `B`.
- El valor por defecto de `prioridad` es `'media'`; el de `completado` es `false`; y el de `modulo` es estrictamente `'tasks'`.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:**
  - Escribir `src/tasks/services/tasks.service.test.ts` con tests para:
    1. Creación exitosa con título válido y valores por defecto (`prioridad: 'media'`, `completado: false`).
    2. Decisión 2B: rechazo de título de 121 caracteres con `InvalidTaskTitleError` (400).
    3. Decisión 2B: rechazo de descripción de 1001 caracteres con `InvalidTaskDescriptionError` (400).
    4. Rechazo de título vacío o solo espacios (400).
    5. Rechazo de prioridad inválida (400).
    6. Aislamiento Multi-Tenant: `findAllByUser` solo retorna las tareas del usuario especificado.
    7. Aislamiento Multi-Tenant: intentar obtener o modificar una tarea de otro usuario arroja `TaskNotFoundError` (404).
    8. Alternancia atómica del estado completado (`toggleTaskStatus`).
    9. Actualización selectiva de campos con `updateTask`.
    10. Eliminación exitosa y posterior verificación 404.
  - Escribir `src/tasks/controllers/tasks.controller.test.ts` verificando los endpoints REST.
  Verificar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos corresponden a la ausencia del módulo `src/tasks/*`.
- **Paso 3 — Implementar Mínimo:** Crear entidades, DTOs, repositorio `InMemoryTaskRepository`, servicio `TasksService` y controlador `TasksController` (`GREEN`).
- **Paso 4 — Integrar Setup:** Actualizar `src/test/setup.ts` para incluir la limpieza estática del repositorio en cada test.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 56 tests previos más todos los nuevos tests de `tasks` (mínimo 70 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A03.01.md`, `TEST_REPORT_FIA-A03.01.md`, redactar la propuesta formal de `LOCK-FIA-A03.01.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Creación de `src/tasks/entities/task-item.entity.ts`:
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

export const TASK_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000, // Decisión 2B
} as const;

export class InvalidTaskTitleError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El título de la tarea debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidTaskTitleError';
  }
}

export class InvalidTaskDescriptionError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La descripción no puede superar los 1000 caracteres') {
    super(message);
    this.name = 'InvalidTaskDescriptionError';
  }
}

export class InvalidTaskPriorityError extends Error {
  readonly statusCode = 400;
  constructor(message = "La prioridad debe ser 'alta', 'media' o 'baja'") {
    super(message);
    this.name = 'InvalidTaskPriorityError';
  }
}

export class TaskNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Tarea no encontrada') {
    super(message);
    this.name = 'TaskNotFoundError';
  }
}
```

### 10.2 Creación de `src/tasks/dto/create-task.dto.ts` y `update-task.dto.ts`:
`create-task.dto.ts`:
```typescript
import { TaskPriority } from '../entities/task-item.entity';

export interface CreateTaskDto {
  titulo: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fechaProgramada?: Date | null;
}
```

`update-task.dto.ts`:
```typescript
import { TaskPriority } from '../entities/task-item.entity';

export interface UpdateTaskDto {
  titulo?: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fechaProgramada?: Date | null;
}
```

### 10.3 Creación de `src/tasks/repositories/task.repository.ts`:
```typescript
import { TaskItem } from '../entities/task-item.entity';

export interface ITaskRepository {
  save(task: TaskItem): Promise<TaskItem>;
  findById(userId: string, id: string): Promise<TaskItem | null>;
  findAllByUser(userId: string): Promise<TaskItem[]>;
  delete(userId: string, id: string): Promise<boolean>;
}

const sharedTasksStore = new Map<string, TaskItem>();

// Hidratación segura para entorno navegador interactivo
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = window.localStorage.getItem('centrat_tasks_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const t of parsed) {
          sharedTasksStore.set(t.id, {
            ...t,
            fechaProgramada: t.fechaProgramada ? new Date(t.fechaProgramada) : null,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          });
        }
      }
    }
  } catch {
    // Si falla el almacenamiento, continúa en memoria pura
  }
}

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, TaskItem>;

  constructor(customStore?: Map<string, TaskItem>) {
    this.tasks = customStore || sharedTasksStore;
  }

  async save(task: TaskItem): Promise<TaskItem> {
    this.tasks.set(task.id, { ...task });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.tasks.values());
        window.localStorage.setItem('centrat_tasks_db', JSON.stringify(arr));
      } catch {
        // ignore
      }
    }
    return { ...task };
  }

  async findById(userId: string, id: string): Promise<TaskItem | null> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return null;
    }
    return { ...task };
  }

  async findAllByUser(userId: string): Promise<TaskItem[]> {
    const result: TaskItem[] = [];
    for (const task of this.tasks.values()) {
      if (task.userId === userId) {
        result.push({ ...task });
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return false;
    }
    const removed = this.tasks.delete(id);
    if (removed && typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.tasks.values());
        window.localStorage.setItem('centrat_tasks_db', JSON.stringify(arr));
      } catch {
        // ignore
      }
    }
    return removed;
  }

  static clear(): void {
    sharedTasksStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_tasks_db');
      } catch {
        // ignore
      }
    }
  }
}
```

### 10.4 Creación de `src/tasks/services/tasks.service.ts`:
```typescript
import {
  TaskItem,
  TaskPriority,
  TASK_LIMITS,
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  TaskNotFoundError,
} from '../entities/task-item.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ITaskRepository, InMemoryTaskRepository } from '../repositories/task.repository';

export class TasksService {
  constructor(private taskRepository: ITaskRepository = new InMemoryTaskRepository()) {}

  static validateTitle(title: string): string {
    const trimmed = title ? title.trim() : '';
    if (
      trimmed.length < TASK_LIMITS.MIN_TITLE_LENGTH ||
      trimmed.length > TASK_LIMITS.MAX_TITLE_LENGTH
    ) {
      throw new InvalidTaskTitleError();
    }
    return trimmed;
  }

  static validateDescription(description?: string): string {
    if (!description) return '';
    const trimmed = description.trim();
    if (trimmed.length > TASK_LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidTaskDescriptionError();
    }
    return trimmed;
  }

  static validatePriority(priority?: TaskPriority): TaskPriority {
    if (!priority) return 'media';
    if (!['alta', 'media', 'baja'].includes(priority)) {
      throw new InvalidTaskPriorityError();
    }
    return priority;
  }

  async createTask(userId: string, dto: CreateTaskDto): Promise<TaskItem> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar la tarea');
    }

    const validTitle = TasksService.validateTitle(dto.titulo);
    const validDesc = TasksService.validateDescription(dto.descripcion);
    const validPriority = TasksService.validatePriority(dto.prioridad);

    const now = new Date();
    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'tasks',
      titulo: validTitle,
      descripcion: validDesc,
      prioridad: validPriority,
      completado: false,
      fechaProgramada: dto.fechaProgramada || null,
      createdAt: now,
      updatedAt: now,
    };

    return this.taskRepository.save(newTask);
  }

  async findAllByUser(userId: string): Promise<TaskItem[]> {
    if (!userId) return [];
    return this.taskRepository.findAllByUser(userId.trim());
  }

  async findById(userId: string, id: string): Promise<TaskItem> {
    const task = await this.taskRepository.findById(userId.trim(), id);
    if (!task) {
      throw new TaskNotFoundError();
    }
    return task;
  }

  async updateTask(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskItem> {
    const existing = await this.findById(userId, id);

    let updatedTitle = existing.titulo;
    if (dto.titulo !== undefined) {
      updatedTitle = TasksService.validateTitle(dto.titulo);
    }

    let updatedDesc = existing.descripcion;
    if (dto.descripcion !== undefined) {
      updatedDesc = TasksService.validateDescription(dto.descripcion);
    }

    let updatedPriority = existing.prioridad;
    if (dto.prioridad !== undefined) {
      updatedPriority = TasksService.validatePriority(dto.prioridad);
    }

    const updatedTask: TaskItem = {
      ...existing,
      titulo: updatedTitle,
      descripcion: updatedDesc,
      prioridad: updatedPriority,
      fechaProgramada:
        dto.fechaProgramada !== undefined ? dto.fechaProgramada : existing.fechaProgramada,
      updatedAt: new Date(),
    };

    return this.taskRepository.save(updatedTask);
  }

  async toggleTaskStatus(userId: string, id: string): Promise<TaskItem> {
    const existing = await this.findById(userId, id);

    const toggledTask: TaskItem = {
      ...existing,
      completado: !existing.completado,
      updatedAt: new Date(),
    };

    return this.taskRepository.save(toggledTask);
  }

  async deleteTask(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.taskRepository.delete(userId.trim(), existing.id);
  }
}
```

### 10.5 Creación de `src/tasks/controllers/tasks.controller.ts`:
```typescript
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskItem } from '../entities/task-item.entity';

export interface HttpResponse<T> {
  statusCode: number;
  body: T;
}

export class TasksController {
  constructor(private tasksService: TasksService = new TasksService()) {}

  async create(userId: string, dto: CreateTaskDto): Promise<HttpResponse<TaskItem>> {
    const task = await this.tasksService.createTask(userId, dto);
    return {
      statusCode: 201,
      body: task,
    };
  }

  async findAll(userId: string): Promise<HttpResponse<TaskItem[]>> {
    const tasks = await this.tasksService.findAllByUser(userId);
    return {
      statusCode: 200,
      body: tasks,
    };
  }

  async findById(userId: string, id: string): Promise<HttpResponse<TaskItem>> {
    const task = await this.tasksService.findById(userId, id);
    return {
      statusCode: 200,
      body: task,
    };
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<HttpResponse<TaskItem>> {
    const updated = await this.tasksService.updateTask(userId, id, dto);
    return {
      statusCode: 200,
      body: updated,
    };
  }

  async toggle(userId: string, id: string): Promise<HttpResponse<TaskItem>> {
    const toggled = await this.tasksService.toggleTaskStatus(userId, id);
    return {
      statusCode: 200,
      body: toggled,
    };
  }

  async delete(userId: string, id: string): Promise<HttpResponse<{ message: string }>> {
    await this.tasksService.deleteTask(userId, id);
    return {
      statusCode: 200,
      body: { message: 'Tarea eliminada correctamente' },
    };
  }
}
```

### 10.6 Actualización de `src/test/setup.ts`:
Añadir la limpieza estática del repositorio de tareas:
```typescript
import { InMemoryUserRepository } from '../users/repositories/user.repository';
import { InMemoryTaskRepository } from '../tasks/repositories/task.repository';

beforeEach(() => {
  InMemoryUserRepository.clear();
  InMemoryTaskRepository.clear();
  if (typeof window !== 'undefined') {
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  }
});
```

## 11. Tests Requeridos

### 11.1 `src/tasks/services/tasks.service.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TasksService } from './tasks.service';
import {
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  TaskNotFoundError,
} from '../entities/task-item.entity';

describe('TasksService (Motor de Dominio y Decisión 2B)', () => {
  let tasksService: TasksService;
  const USER_A = 'usr-tenant-a';
  const USER_B = 'usr-tenant-b';

  beforeEach(() => {
    tasksService = new TasksService();
  });

  it('debe crear una tarea exitosamente con valores por defecto y sanitización', async () => {
    const task = await tasksService.createTask(USER_A, {
      titulo: '  Revisar instalación eléctrica  ',
    });

    expect(task.id).toBeDefined();
    expect(task.userId).toBe(USER_A);
    expect(task.modulo).toBe('tasks');
    expect(task.titulo).toBe('Revisar instalación eléctrica');
    expect(task.descripcion).toBe('');
    expect(task.prioridad).toBe('media');
    expect(task.completado).toBe(false);
    expect(task.fechaProgramada).toBeNull();
  });

  it('debe rechazar títulos vacíos o con solo espacios (400)', async () => {
    await expect(tasksService.createTask(USER_A, { titulo: '' })).rejects.toThrow(InvalidTaskTitleError);
    await expect(tasksService.createTask(USER_A, { titulo: '    ' })).rejects.toThrow(InvalidTaskTitleError);
  });

  it('debe rechazar títulos que superen los 120 caracteres (Decisión 2B)', async () => {
    const title120 = 'a'.repeat(120);
    const title121 = 'a'.repeat(121);

    const validTask = await tasksService.createTask(USER_A, { titulo: title120 });
    expect(validTask.titulo.length).toBe(120);

    await expect(tasksService.createTask(USER_A, { titulo: title121 })).rejects.toThrow(InvalidTaskTitleError);
  });

  it('debe rechazar descripciones que superen los 1000 caracteres (Decisión 2B)', async () => {
    const desc1000 = 'b'.repeat(1000);
    const desc1001 = 'b'.repeat(1001);

    const validTask = await tasksService.createTask(USER_A, {
      titulo: 'Tarea con descripción límite',
      descripcion: desc1000,
    });
    expect(validTask.descripcion.length).toBe(1000);

    await expect(
      tasksService.createTask(USER_A, {
        titulo: 'Tarea inválida',
        descripcion: desc1001,
      })
    ).rejects.toThrow(InvalidTaskDescriptionError);
  });

  it('debe rechazar prioridades desconocidas (400)', async () => {
    await expect(
      tasksService.createTask(USER_A, {
        titulo: 'Tarea prioridad rota',
        prioridad: 'urgente' as any,
      })
    ).rejects.toThrow(InvalidTaskPriorityError);
  });

  it('debe garantizar aislamiento multi-tenant en findAllByUser', async () => {
    await tasksService.createTask(USER_A, { titulo: 'Tarea A-1' });
    await tasksService.createTask(USER_A, { titulo: 'Tarea A-2' });
    await tasksService.createTask(USER_B, { titulo: 'Tarea B-1' });

    const tasksA = await tasksService.findAllByUser(USER_A);
    const tasksB = await tasksService.findAllByUser(USER_B);

    expect(tasksA.length).toBe(2);
    expect(tasksB.length).toBe(1);
    expect(tasksA.every((t) => t.userId === USER_A)).toBe(true);
    expect(tasksB[0].titulo).toBe('Tarea B-1');
  });

  it('debe rechazar acceso con 404 si un usuario intenta consultar o mutar una tarea ajena', async () => {
    const taskA = await tasksService.createTask(USER_A, { titulo: 'Secreto de A' });

    // Usuario B intenta leer la tarea de A
    await expect(tasksService.findById(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta hacer toggle de la tarea de A
    await expect(tasksService.toggleTaskStatus(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta editar la tarea de A
    await expect(tasksService.updateTask(USER_B, taskA.id, { titulo: 'Hack' })).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta borrar la tarea de A
    await expect(tasksService.deleteTask(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);
  });

  it('debe alternar atómicamente el estado completado con toggleTaskStatus', async () => {
    const task = await tasksService.createTask(USER_A, { titulo: 'Comprar bombilla' });
    expect(task.completado).toBe(false);

    const completed = await tasksService.toggleTaskStatus(USER_A, task.id);
    expect(completed.completado).toBe(true);

    const pendingAgain = await tasksService.toggleTaskStatus(USER_A, task.id);
    expect(pendingAgain.completado).toBe(false);
  });

  it('debe actualizar campos selectivos y eliminar la tarea', async () => {
    const task = await tasksService.createTask(USER_A, { titulo: 'Original', prioridad: 'baja' });

    const updated = await tasksService.updateTask(USER_A, task.id, {
      titulo: 'Modificado',
      prioridad: 'alta',
    });
    expect(updated.titulo).toBe('Modificado');
    expect(updated.prioridad).toBe('alta');

    await tasksService.deleteTask(USER_A, task.id);
    await expect(tasksService.findById(USER_A, task.id)).rejects.toThrow(TaskNotFoundError);
  });
});
```

### 11.2 `src/tasks/controllers/tasks.controller.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TasksController } from './tasks.controller';

describe('TasksController (API REST Tipada)', () => {
  let controller: TasksController;
  const USER_ID = 'usr-controller-test';

  beforeEach(() => {
    controller = new TasksController();
  });

  it('debe responder 201 al crear una tarea', async () => {
    const response = await controller.create(USER_ID, { titulo: 'Limpiar filtro campana' });
    expect(response.statusCode).toBe(201);
    expect(response.body.titulo).toBe('Limpiar filtro campana');
  });

  it('debe responder 200 con la lista de tareas del usuario', async () => {
    await controller.create(USER_ID, { titulo: 'T1' });
    await controller.create(USER_ID, { titulo: 'T2' });

    const response = await controller.findAll(USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('debe responder 200 en toggle y delete', async () => {
    const created = await controller.create(USER_ID, { titulo: 'Toggle me' });
    const toggleRes = await controller.toggle(USER_ID, created.body.id);
    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.body.completado).toBe(true);

    const deleteRes = await controller.delete(USER_ID, created.body.id);
    expect(deleteRes.statusCode).toBe(200);
  });
});
```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores TypeScript).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 68-70 tests totales en Vitest).
- `QG-04 · Blindaje Decisión 2B:` Tests específicos comprobando el corte en 120 caracteres de título y 1000 de descripción.
- `QG-05 · Aislamiento Multi-Tenant Certificado:` Tests comprobando que peticiones cruzadas devuelven 404.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar)",
    "RV-A02: Autenticación, sesión segura HttpOnly, validación empática de login, registro con doble contraseña (VV-009), throttler (429), logout y SessionAuthGuard. Cierre formal total.",
    "FIA-A03.01: Modelo de datos TaskItem, invariantes tipográficas de la Decisión 2B (120/1000 caracteres), aislamiento multi-tenant estricto por userId y endpoints CRUD completos (POST, GET, PUT, PATCH toggle, DELETE)"
  ],
  "active_constraints": [
    "Aislamiento absoluto de tenant por userId en todas las consultas del repositorio de tareas",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de título y 1000 de descripción",
    "Aislamiento hermético de tests en Vitest sin contaminación cruzada de almacenamiento",
    "Persistencia transparente en cliente para soporte interactivo en navegador de desarrollo"
  ],
  "unlocked_next": "FIA-A03.02 (Acordeón de Tareas en Hub con Estados EV-01..05)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/tasks/entities/task-item.entity.ts",
    "src/tasks/dto/create-task.dto.ts",
    "src/tasks/dto/update-task.dto.ts",
    "src/tasks/repositories/task.repository.ts",
    "src/tasks/services/tasks.service.ts",
    "src/tasks/services/tasks.service.test.ts",
    "src/tasks/controllers/tasks.controller.ts",
    "src/tasks/controllers/tasks.controller.test.ts"
  ],
  "files_modified": [
    "src/test/setup.ts"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "HubContainer",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)",
    "tasks_surface": "Pendiente de montaje en Hub (FIA-A03.02)"
  },
  "observable_states": {
    "hub": "reactivo_toggle",
    "navbar_telemetry": "navigator_online_offline_reactive",
    "session_lifecycle": "login_guard_logout_purgado_completo",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TaskItem`, DTOs, `ITaskRepository`, `TasksService` y `TasksController` están implementados respetando la Decisión 2B y el aislamiento multi-tenant.
2. Los tests de dominio y controlador pasan al 100% en verde con Vitest (mínimo 68-70 tests totales).
3. Se actualiza `src/test/setup.ts` garantizando esterilidad absoluta de tests.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.01.md`, `TEST_REPORT_FIA-A03.01.md` y la propuesta formal de `LOCK-FIA-A03.01.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A03.01`. Prohibido crear componentes visuales de tareas (`TasksAccordion`, `TaskCard`) en esta sesión (reservados a `FIA-A03.02` y posteriores).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir la lógica de producción.
- **Blindaje Decisión 2B:** Asegúrate de que las pruebas de longitud de título (120) y descripción (1000) pasen limpiamente.
- **Aislamiento Multi-Tenant:** Ninguna consulta puede omitir el `userId`.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A03.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
