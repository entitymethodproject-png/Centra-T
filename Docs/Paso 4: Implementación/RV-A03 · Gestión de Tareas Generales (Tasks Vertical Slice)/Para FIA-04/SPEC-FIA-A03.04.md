# SPEC-FIA-A03.04 · TASKCARD CON MUTACIÓN OPTIMISTA Y ROLLBACK (VV-005)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A03.04 · TaskCard con Mutación Optimista de Checkbox, Rollback y Toast ante 500 (Caso Forense VV-005)  
**PVF de Cierre:** PVF-A03.04 · Conmutación Optimista de Checkbox con Rollback Automático (VV-005)  
**VF:** VF-A03.04 · Mutación Optimista de Checkbox y Rollback Automático (VV-005)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A03.03.md APROBADO (Commit: `2ef6f9b`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el componente atómico `TaskCard` en `src/tasks/components/TaskCard.tsx` (con sus estilos encapsulados en `TaskCard.module.css` y tests exhaustivos en `TaskCard.test.tsx`), e integrarlo en la lista poblada de `src/hub/components/TasksAccordion.tsx` para Antigravity CLI. Esta unidad abarca la conmutación optimista inmediata del checkbox (< 50ms), el tachado visual instantáneo (`line-through`) de la tarea, la sincronización en segundo plano con el backend y el blindaje incondicional del **Caso Forense VV-005**: reversión inmediata de estado (desmarcado del checkbox y recuperación de estilo de texto normal) y despliegue de un **Toast empático y accesible** ante cualquier fallo 500 o error de red.

## 2. Objetivo
Construir y verificar mediante TDD con Vitest y `@testing-library/react`:
1. Componente `TaskCard` en `src/tasks/components/TaskCard.tsx` con soporte para marcado accesible semántico (`<li role="listitem">`, `<input type="checkbox" aria-label="Completar tarea [Título]">`).
2. Mutación optimista en memoria cliente: al pulsar el checkbox, conmuta el estado de forma síncrona (< 16ms en ciclo de render), marcando/desmarcando el checkbox y aplicando/retirando el estilo tachado (`line-through`) y menor opacidad.
3. Sincronización asíncrona mediante `tasksService.toggleTaskStatus(userId, task.id)`:
   - **Éxito (200 OK):** Confirmación silenciosa e invocación de `onTaskUpdated`.
   - **Fallo (500 Error / Red) — Caso Forense VV-005:**
     - Rollback automático e instantáneo del estado visual: el checkbox regresa a su valor previo y el texto retira el tachado.
     - Despliegue de un Toast de alerta accesible (`role="alert"`, `aria-live="assertive"`) con el mensaje:
       > *"No se pudo actualizar el estado de la tarea. Se ha revertido el cambio."*
     - Botón de descarte accesible `[✕]` para cerrar el Toast.
4. Refactorización de `TasksAccordion.tsx` para delegar el renderizado de cada tarjeta en `TaskCard` sin romper ninguno de los 87 tests existentes.
5. 100% de los tests del proyecto en verde (mínimo 94 tests globales pasando en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A03.03_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa de Dominio y Endpoints: `src/tasks/entities/*`, `src/tasks/services/*`, `src/tasks/controllers/*` (12 tests pasando).
  - Capa de Wizard de Creación: `src/tasks/components/TaskCreationWizard.*` (10 tests pasando, blindando caso VV-004 y Decisión 3A).
  - Capa de Hub y Acordeón: `src/hub/components/TasksAccordion.*`, `src/hub/components/HubContainer.*` (11 tests pasando).
  - Capa de Autenticación, Usuarios y Shell: `src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*` (54 tests pasando).
- **Estado de Tests Actual:** 87/87 tests pasando en verde a través de 13 archivos de prueba en Vitest.
- **Riesgos Iniciales:** La extracción del componente `TaskCard` no debe romper los selectores ni las aserciones de `TasksAccordion.test.tsx` (especialmente las etiquetas de accesibilidad `aria-label` de los checkboxes y las clases de prioridad).

## 4. Estado Objetivo
El repositorio debe contar con `TaskCard.tsx`, `TaskCard.module.css` y `TaskCard.test.tsx` en `src/tasks/components/`, conectado a `TasksAccordion.tsx`.
- **Restricciones negativas explícitas:**
  - Prohibido dejar el checkbox marcado si el servidor responde con 500 (violación flagrante del Caso Forense VV-005).
  - Prohibido silenciar el error ante un fallo de red o 500: el Toast empático debe renderizarse y ser accesible.
  - Prohibido introducir latencias o bloqueos en la interfaz antes de reflejar el cambio visual (< 50ms garantizados).

## 5. Contratos Afectados
- **5.1 Contrato de Interfaz (`TaskCardProps`):**
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
- **5.2 Contrato Físico / Module Map:** Directorio `src/tasks/components/*` e integración en `src/hub/components/*`.
- **5.3 Contrato de Accesibilidad:** `<li role="listitem">`, `<input type="checkbox" aria-label="Completar tarea [Título]">`, mensaje de Toast con `role="alert"` y botón de descarte accesible.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/tasks/components/TaskCard.tsx`: Componente React de tarjeta de tarea con lógica de mutación optimista, rollback y Toast.
- `src/tasks/components/TaskCard.module.css`: Estilos visuales de la tarjeta, badges de prioridad, texto tachado y Toast empático.
- `src/tasks/components/TaskCard.test.tsx`: Batería exhaustiva de tests TDD (7 pruebas que cubren happy path, latencia, caso VV-005 ante error 500 y descarte de Toast).

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/hub/components/TasksAccordion.tsx`: Sustituir el mapeo inline de `<li>` por `<TaskCard />`.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/tasks/components/TaskCreationWizard.*` (10 tests de alta de tareas intactos).
- `src/hub/components/TasksAccordion.test.tsx` (7 tests de matriz EV-LIST intactos).
- Todos los archivos de dominio, repositorios, servicios, controladores, autenticación y App (70 tests intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/shopping/*`, `src/cleaning/*` (rebanadas futuras).
- Menú contextual flotante (`TaskActionMenu.tsx` pertenece a `FIA-A03.05`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 06), `10_CENTRA_T_VISUAL_VALIDATION_QA.docx` (Caso Forense VV-005), `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.2), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A03.03_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A03.03`. Desbloquea `FIA-A03.05`.

## 8. Restricciones
- La mutación optimista visual en el cliente debe ocurrir inmediatamente (< 50ms).
- En caso de fallo 500 o caída de red: reversión estricta al estado anterior y despliegue del Toast de alerta.
- Accesibilidad WCAG AA en checkboxes, títulos y alertas.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/tasks/components/TaskCard.test.tsx` los 7 tests:
  1. Renderizado accesible con título, badge de prioridad y checkbox con label WCAG AA.
  2. Conmutación optimista instantánea: clic en checkbox tacha el texto de inmediato.
  3. Desmarcado y retirada del tachado en una tarea completada.
  4. Sincronización exitosa con `tasksService.toggleTaskStatus` e invocación de `onTaskUpdated`.
  5. **Caso Forense VV-005:** Simulación de rechazo/error 500: el checkbox se desmarca, se retira el tachado visual y se despliega el Toast empático.
  6. Descarte del Toast empático al pulsar el botón `[✕]`.
  7. Invocación inmediata de `onToggleOptimistic` al pulsar el checkbox.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos corresponden a la ausencia del componente `TaskCard`.
- **Paso 3 — Implementar Mínimo:** Crear `TaskCard.tsx` y `TaskCard.module.css` satisfaciendo la mutación optimista, el rollback y el Toast (`GREEN`).
- **Paso 4 — Refactorizar TasksAccordion:** Conectar `TaskCard` en la lista poblada de `src/hub/components/TasksAccordion.tsx`.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 87 tests previos más los 7 nuevos tests (mínimo 94 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A03.04.md`, `TEST_REPORT_FIA-A03.04.md`, redactar la propuesta formal de `LOCK-FIA-A03.04.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/tasks/components/TaskCard.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TaskCard.module.css';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

export interface TaskCardProps {
  task: TaskItem;
  userId?: string;
  tasksService?: TasksService;
  onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
  onTaskUpdated?: (updatedTask: TaskItem) => void;
  onRollback?: (revertedTask: TaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userId = 'usr-demo-elena-001',
  tasksService,
  onToggleOptimistic,
  onTaskUpdated,
  onRollback,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(task.completado);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sincronizar estado si la prop externa cambia
  useEffect(() => {
    setIsCompleted(task.completado);
  }, [task.completado]);

  const handleToggle = async () => {
    if (isSyncing) return;

    const previousStatus = isCompleted;
    const newStatus = !previousStatus;

    // 1. Mutación optimista inmediata (<16ms)
    setIsCompleted(newStatus);
    setToastMessage(null);

    if (onToggleOptimistic) {
      onToggleOptimistic(task.id, newStatus);
    }

    // 2. Sincronización en backend
    if (tasksService && userId) {
      setIsSyncing(true);
      try {
        const updated = await tasksService.toggleTaskStatus(userId, task.id);
        setIsSyncing(false);
        if (onTaskUpdated) {
          onTaskUpdated(updated);
        }
      } catch {
        // 3. Caso Forense VV-005: Rollback inmediato y Toast empático
        setIsCompleted(previousStatus);
        setIsSyncing(false);
        setToastMessage('No se pudo actualizar el estado de la tarea. Se ha revertido el cambio.');
        if (onRollback) {
          onRollback({ ...task, completado: previousStatus });
        }
      }
    } else {
      if (onTaskUpdated) {
        onTaskUpdated({ ...task, completado: newStatus });
      }
    }
  };

  const handleDismissToast = () => {
    setToastMessage(null);
  };

  return (
    <li
      className={`${styles.taskItem} ${isCompleted ? styles.completed : ''}`}
      data-testid={`task-card-${task.id}`}
      data-completed={isCompleted}
    >
      <div className={styles.taskMain}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            className={styles.checkbox}
            disabled={isSyncing}
            aria-label={`Completar tarea ${task.titulo}`}
          />
        </label>

        <span
          className={`${styles.taskTitle} ${isCompleted ? styles.titleCompleted : ''}`}
          data-testid="task-card-title"
        >
          {task.titulo}
        </span>

        <span
          className={`${styles.priorityBadge} ${styles['priority_' + task.prioridad]}`}
          data-testid="task-card-priority"
        >
          {task.prioridad.toUpperCase()}
        </span>
      </div>

      {/* Caso Forense VV-005: Toast empático de reversión ante fallo 500 */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className={styles.toastAlert}
          data-testid="task-card-toast"
        >
          <span className={styles.toastText}>{toastMessage}</span>
          <button
            type="button"
            onClick={handleDismissToast}
            className={styles.toastDismissButton}
            aria-label="Cerrar notificación de error"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
};
```

### 10.2 Estilos encapsulados de `src/tasks/components/TaskCard.module.css`:
```css
.taskItem {
  display: flex;
  flex-direction: column;
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
  transition: all 0.15s ease;
}

.taskItem:hover {
  border-color: #334155;
  background: #17212f;
}

.taskMain {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  border-radius: 4px;
}

.checkbox:disabled {
  opacity: 0.6;
  cursor: wait;
}

.taskTitle {
  flex: 1;
  font-size: 14px;
  color: #f8fafc;
  word-break: break-word;
  transition: color 0.15s, text-decoration 0.15s;
}

.titleCompleted {
  text-decoration: line-through;
  color: #64748b;
}

.completed {
  opacity: 0.75;
}

.priorityBadge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.priority_alta {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority_media {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority_baja {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.toastAlert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  line-height: 1.4;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toastText {
  flex: 1;
  font-weight: 500;
}

.toastDismissButton {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 13px;
  border-radius: 4px;
  margin-left: 8px;
  line-height: 1;
  transition: background 0.15s;
}

.toastDismissButton:hover {
  background: rgba(239, 68, 68, 0.2);
}
```

### 10.3 Batería exhaustiva de tests en `src/tasks/components/TaskCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

describe('TaskCard Component (Mutación Optimista & Caso Forense VV-005)', () => {
  const baseTask: TaskItem = {
    id: 'task-opt-01',
    userId: 'usr-demo-elena-001',
    modulo: 'tasks',
    titulo: 'Revisar caldera de gasoil',
    descripcion: 'Verificar presión en 1.5 bar',
    prioridad: 'alta',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar la tarjeta con título, badge de prioridad y checkbox con label accesible', () => {
    render(<TaskCard task={baseTask} />);

    expect(screen.getByText('Revisar caldera de gasoil')).toBeInTheDocument();
    expect(screen.getByText('ALTA')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /completar tarea revisar caldera de gasoil/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('debe conmutar de forma optimista el checkbox y tachar el texto inmediatamente al hacer clic (<50ms)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    render(<TaskCard task={baseTask} onTaskUpdated={handleUpdated} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /completar tarea revisar caldera de gasoil/i,
    });
    const title = screen.getByTestId('task-card-title');

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);

    // Clic inmediato
    await user.click(checkbox);

    // Verificación inmediata (< 50ms) en la UI
    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);
    expect(handleUpdated).toHaveBeenCalled();
  });

  it('debe desmarcar el checkbox y retirar el tachado en una tarea completada', async () => {
    const user = userEvent.setup();
    const completedTask: TaskItem = { ...baseTask, completado: true };

    render(<TaskCard task={completedTask} />);

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('task-card-title');

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass(/titleCompleted/);

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(title).not.toHaveClass(/titleCompleted/);
  });

  it('debe sincronizar silenciosamente con tasksService y llamar a onTaskUpdated cuando la llamada es exitosa (200 OK)', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      toggleTaskStatus: vi.fn().mockResolvedValue({
        ...baseTask,
        completado: true,
      }),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockService.toggleTaskStatus).toHaveBeenCalledWith('usr-demo-elena-001', 'task-opt-01');
      expect(handleUpdated).toHaveBeenCalled();
    });

    // Ningún toast de error desplegado
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('CASO FORENSE VV-005: ante error 500 del servidor, revierte inmediatamente el checkbox, retira el tachado visual y muestra el Toast empático', async () => {
    const user = userEvent.setup();
    const handleRollback = vi.fn();

    const failingService = {
      toggleTaskStatus: vi.fn().mockRejectedValue(new Error('Internal Server Error (500)')),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={failingService}
        userId="usr-demo-elena-001"
        onRollback={handleRollback}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByTestId('task-card-title');

    // 1. Clic inicial optimista
    await user.click(checkbox);

    // 2. Al fallar el servicio, debe revertir automáticamente
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(title).not.toHaveClass(/titleCompleted/);
    });

    // 3. Despliegue del Toast empático
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/no se pudo actualizar el estado de la tarea\. se ha revertido el cambio/i);
    expect(handleRollback).toHaveBeenCalled();
  });

  it('debe permitir descartar el Toast empático al pulsar el botón de cierre [✕]', async () => {
    const user = userEvent.setup();
    const failingService = {
      toggleTaskStatus: vi.fn().mockRejectedValue(new Error('500 Server Down')),
    } as unknown as TasksService;

    render(
      <TaskCard
        task={baseTask}
        tasksService={failingService}
        userId="usr-demo-elena-001"
      />
    );

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole('button', { name: /cerrar notificación de error/i });
    await user.click(dismissBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('debe invocar onToggleOptimistic inmediatamente al pulsar el checkbox', async () => {
    const user = userEvent.setup();
    const handleOptimistic = vi.fn();

    render(
      <TaskCard
        task={baseTask}
        onToggleOptimistic={handleOptimistic}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(handleOptimistic).toHaveBeenCalledWith('task-opt-01', true);
  });
});
```

### 10.4 Refactorización canónica de `src/hub/components/TasksAccordion.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TasksAccordion.module.css';
import { TaskItem } from '../../tasks/entities/task-item.entity';
import { TasksService } from '../../tasks/services/tasks.service';
import { TaskCreationWizard } from '../../tasks/components/TaskCreationWizard';
import { TaskCard } from '../../tasks/components/TaskCard';

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

export const TasksAccordion: React.FC<TasksAccordionProps> = ({
  tasks: propTasks,
  tasksService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onCreateTaskClick,
  onTaskCreated,
  onTaskToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [tasks, setTasks] = useState<TaskItem[]>(propTasks || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Sincronizar props cuando cambian
  useEffect(() => {
    if (propTasks !== undefined) {
      setTasks(propTasks);
    }
  }, [propTasks]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  // Carga automática opcional si se provee tasksService y userId
  useEffect(() => {
    if (tasksService && userId && propTasks === undefined) {
      setIsLoading(true);
      setError(null);
      tasksService
        .findAllByUser(userId)
        .then((items) => setTasks(items))
        .catch(() => setError('Error al cargar las tareas'))
        .finally(() => setIsLoading(false));
    }
  }, [tasksService, userId, propTasks]);

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleOpenWizard = () => {
    if (onCreateTaskClick) {
      onCreateTaskClick();
    } else {
      setIsWizardOpen(true);
    }
  };

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
    setIsWizardOpen(false);
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
  };

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  return (
    <div className={styles.accordionContainer}>
      {/* Cabecera del Acordeón */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className={styles.header}
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>Tareas ({tasks.length})</h3>
        </div>

        <button
          type="button"
          className={styles.newButton}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWizard();
          }}
          aria-label="Crear nueva tarea"
        >
          + Nueva
        </button>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* EV-LIST-02: Skeleton Screen de Carga */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="tasks-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* EV-LIST-05: Estado de Error */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="tasks-error-state">
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* EV-LIST-03: Empty State */}
          {!isLoading && !error && tasks.length === 0 && (
            <div className={styles.emptyContainer} data-testid="tasks-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">
                📋
              </div>
              <p className={styles.emptyTitle}>No tienes tareas pendientes</p>
              <p className={styles.emptySubtitle}>Añade tareas para organizarte en casa</p>
              <button
                type="button"
                onClick={handleOpenWizard}
                className={styles.emptyCtaButton}
              >
                + Crear Tarea
              </button>
            </div>
          )}

          {/* EV-LIST-01: Lista Poblada de Tareas con TaskCard */}
          {!isLoading && !error && tasks.length > 0 && (
            <ul className={styles.taskList} role="list" data-testid="tasks-populated-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userId={userId}
                  tasksService={tasksService}
                  onToggleOptimistic={(taskId) => {
                    if (onTaskToggle) {
                      onTaskToggle(taskId);
                    }
                  }}
                  onTaskUpdated={handleTaskUpdated}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal Wizard de Creación en 3 Pasos (VV-004) */}
      <TaskCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        userId={userId}
        tasksService={tasksService}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
```

## 11. Verificación y Evidencia
- Ejecutar suite completa con Vitest:
  ```bash
  npm test -- --run
  ```
- **Evidencia requerida:** Mínimo 94 tests pasando al 100% en verde a través de 14 archivos de prueba sin regresión en ninguna suite previa.

## 12. Matriz de Trazabilidad
| Requerimiento Indexado | Archivo de Especificación | Componente / Código | Test de Verificación |
| :--- | :--- | :--- | :--- |
| **PVF-A03.04 / VF-A03.04** | `SPEC-FIA-A03.04.md` (Sec. 10.1) | `TaskCard.tsx` (`handleToggle`) | `TaskCard.test.tsx` (Tests 1, 2, 3, 4) |
| **Caso Forense VV-005 (500 Error)** | `SPEC-FIA-A03.04.md` (Sec. 10.1, 10.2) | `setIsCompleted(previousStatus)` + Toast | `TaskCard.test.tsx` (Test 5) |
| **Toast Descarte Accesible** | `SPEC-FIA-A03.04.md` (Sec. 10.1) | `handleDismissToast` | `TaskCard.test.tsx` (Test 6) |
| **Integración en Hub** | `SPEC-FIA-A03.04.md` (Sec. 10.4) | `TasksAccordion.tsx` (`<TaskCard />`) | `TasksAccordion.test.tsx` (7 tests intactos) |

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)",
  "completed_fias": ["FIA-A01.01", "FIA-A01.02", "FIA-A01.03", "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05", "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04"],
  "latest_locked_fia": "FIA-A03.04",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y creaciones de tareas",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de título y 1000 de descripción",
    "Decisión 3A & Caso Forense VV-004: Rollback total a cero en memoria al cancelar o presionar ESC",
    "Caso Forense VV-005: Mutación optimista en <50ms con reversión automática y Toast empático ante fallo 500",
    "Prohibición de spinners a pantalla completa: modal autocontenido y carga local",
    "Usuario demo elena@centrat.local con acceso out-of-the-box blindado"
  ],
  "unlocked_next": "FIA-A03.05 (TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/tasks/components/TaskCard.tsx",
    "src/tasks/components/TaskCard.module.css",
    "src/tasks/components/TaskCard.test.tsx"
  ],
  "files_modified": [
    "src/hub/components/TasksAccordion.tsx"
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
    "TasksAccordion",
    "TaskCard",
    "TaskCreationWizard",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion con TaskCard y Wizard",
    "task_items": "TaskCard (item individual con checkbox optimista y toast de rollback)",
    "modal_layer": "TaskCreationWizard (fixed inset-0, z-index 1000, card 500px centrada)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle_con_acordeon_tareas_y_wizard",
    "task_card": "optimistic_toggle_rollback_toast_vv005_active",
    "tasks_wizard": "step_flow_1_2_3_atomic_rollback_vv004",
    "session_lifecycle": "login_guard_logout_purgado_completo",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TaskCard` y sus estilos están implementados respetando la mutación optimista inmediata (< 50ms) y la accesibilidad WCAG AA.
2. El Caso Forense VV-005 (reversión automática del checkbox y tachado ante error 500 con despliegue de Toast empático) está demostrado mediante tests automatizados en Vitest.
3. `TasksAccordion.tsx` refactorizado para usar `TaskCard` sin romper ninguno de los tests previos.
4. El 100% de los tests del proyecto (mínimo 94 tests) pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.04.md`, `TEST_REPORT_FIA-A03.04.md` y la propuesta formal de `LOCK-FIA-A03.04.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A03.04`. Prohibido implementar menús contextuales de eliminación o drag & drop en esta sesión (reservados a `FIA-A03.05` y `RV-A06`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Blindaje Caso Forense VV-005:** Asegúrate de simular expresamente el error 500 en `toggleTaskStatus` para verificar que el checkbox se desmarca y el Toast empático se renderiza.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A03.04.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
