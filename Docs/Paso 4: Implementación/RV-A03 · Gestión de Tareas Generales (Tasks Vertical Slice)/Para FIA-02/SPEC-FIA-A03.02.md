# SPEC-FIA-A03.02 · ACORDEÓN DE TAREAS EN HUB CON ESTADOS EV-01..05

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A03.02 · Acordeón de Tareas en Hub con Estados EV-01..05  
**PVF de Cierre:** PVF-A03.01 · Renderizado de Acordeón de Tareas y Estados Vacíos  
**VF:** VF-A03.01 · Acordeón de Tareas y Estado Vacío en Hub  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A03.01.md APROBADO (Commit: `0a4f3aa`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el componente de interfaz `TasksAccordion` en `src/hub/components/TasksAccordion.tsx` para Antigravity CLI. Esta unidad abarca la vista colapsable del acordeón de tareas en el panel lateral Hub, su cabecera reactiva con contador de tareas en tiempo real (`Tareas (N)`), botón de acción rápida `[+ Nueva]`, y la implementación rigurosa de la matriz canónica de estados visuales del Documento 09 (`EV-LIST-01..05`): Skeleton Screen local con shimmer para la carga (`EV-LIST-02`), Empty State sobrio con borde discontinuo tenue y llamada a la acción (`EV-LIST-03`), Banner de error inline con reintento (`EV-LIST-05`) y Lista poblada con checkboxes accesibles y badges de prioridad (`EV-LIST-01`).

## 2. Objetivo
Construir y verificar con TDD en pruebas de integración con `@testing-library/react`:
1. Componente `TasksAccordion` en `src/hub/components/TasksAccordion.tsx` con soporte para expansión y colapso reactivo mediante atributos `aria-expanded`.
2. Cabecera con conteo dinámico exacto de tareas: `Tareas (${tasks.length})`, botón interactivo `[+ Nueva]` y chevron indicador (`▼` / `►`).
3. Matriz visual completa conforme al estándar de diseño de Centra-T:
   - **`EV-LIST-02 (Carga):`** Skeleton Screen de 3 items con animación de pulso confinado al interior del acordeón (prohibición terminante de spinners a pantalla completa).
   - **`EV-LIST-03 (Vacío):`** Contenedor con borde discontinuo (`1px dashed #233144`), icono, texto *"No tienes tareas pendientes"* y botón CTA ilustrado `[+ Crear Tarea]`.
   - **`EV-LIST-05 (Error):`** Alerta inline con mensaje de error y botón `[Reintentar]`.
   - **`EV-LIST-01 (Lista):`** Renderizado accesible de elementos con checkbox interactivo, título con tachado (`line-through`) en completadas y badges de prioridad ('alta', 'media', 'baja').
4. Manejo desacoplado mediante props e integración opcional con `TasksService` para cargar tareas por `userId`.
5. 100% de los tests del proyecto en verde (mínimo 78-80 tests totales en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A03.01_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa de Dominio Tasks: `src/tasks/entities/task-item.entity.ts`, DTOs, `src/tasks/repositories/task.repository.ts`, `src/tasks/services/tasks.service.ts`, `src/tasks/controllers/tasks.controller.ts` (12 tests específicos de dominio y API REST).
  - Capa de Topología & Layout: `src/workspace/components/*`, `src/hub/components/HubContainer.*` (14 tests).
  - Capa de Autenticación & Raíz: `src/authentication/*`, `src/users/*`, `src/App.*` (42 tests).
- **Estado de Tests Actual:** 68/68 tests pasando en verde en 11 archivos de pruebas.
- **Riesgos Iniciales:** El acordeón de tareas debe respetar el ancho y estilos del `HubContainer` (fondo `#131B26`, bordes `#233144`) sin desbordar el contenedor ni generar scroll parásito horizontal.

## 4. Estado Objetivo
El repositorio debe contar con `TasksAccordion.tsx`, `TasksAccordion.module.css` y `TasksAccordion.test.tsx` en `src/hub/components/`, montado como parte del contenido del `HubContainer`.
- **Restricciones negativas explícitas:**
  - Prohibido el uso de spinners globales o modales para la carga del acordeón (violación de la regla de Skeleton Screens).
  - Prohibido omitir los atributos de accesibilidad WCAG AA (`aria-expanded`, `<ul role="list">`, etiquetas `aria-label` en checkboxes).
  - Prohibido alterar o degradar los 68 tests existentes en la suite global.

## 5. Contratos Afectados
- **5.1 Contrato de Interfaz (`TasksAccordionProps`):**
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
- **5.2 Contrato Físico / Module Map:** Directorio `src/hub/components/*`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/hub/components/TasksAccordion.tsx`: Componente React del acordeón con selector de estados EV-01..05.
- `src/hub/components/TasksAccordion.module.css`: Estilos encapsulados con diseño sobrio, badges de prioridad y animación shimmer.
- `src/hub/components/TasksAccordion.test.tsx`: Batería exhaustiva de tests de integración con `@testing-library/react`.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno (o integración opcional en vistas de prueba).

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Todos los archivos de `src/tasks/*` (12 tests de dominio y controlador de tareas intactos).
- Todos los archivos de `src/hub/components/HubContainer.*` (4 tests de Hub previos intactos).
- Todos los archivos de `src/workspace/*`, `src/authentication/*` y `src/users/*` (52 tests previos intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/shopping/*`, `src/cleaning/*` (pertenecen a rebanadas posteriores).
- Carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología de Hub, Prohibición de Spinners a Pantalla Completa), `09_CENTRA_T_VISUAL_STATES.docx` (Matriz EV-LIST-01 a EV-LIST-05), `Centra-T Pseudocódigo (unificado).odt` (Módulo 3), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A03.01_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A03.01`. Desbloquea `FIA-A03.03`.

## 8. Restricciones
- La cabecera del acordeón debe mostrar `Tareas (${tasks.length})`.
- El Skeleton Screen debe renderizar exactamente 3 filas con animación de brillo suave.
- El Empty State debe contener el botón con texto `+ Crear Tarea`.
- Las tareas completadas deben reflejar visualmente el estilo tachado (`line-through`) y menor opacidad.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/hub/components/TasksAccordion.test.tsx` la suite de pruebas:
  1. Renderizado de la cabecera con contador reactivo `Tareas (3)` y botón `+ Nueva`.
  2. Alternancia de expansión y colapso al hacer clic en la cabecera (`aria-expanded`).
  3. Renderizado del estado de carga Skeleton Screen de 3 líneas cuando `isLoading = true` (sin spinner global).
  4. Renderizado del Empty State cuando `tasks = []`, con texto *"No tienes tareas pendientes"* y botón CTA.
  5. Clic en el botón CTA del estado vacío o en `+ Nueva` invoca `onCreateTaskClick`.
  6. Renderizado de lista poblada con badges de prioridad con sus clases visuales correspondientes.
  7. Marcado y tachado al conmutar un checkbox, e invocación de `onTaskToggle`.
  8. Renderizado del estado de error y llamada a `onRetry`.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos responden a la ausencia del componente `TasksAccordion`.
- **Paso 3 — Implementar Mínimo:** Crear `TasksAccordion.tsx` y `TasksAccordion.module.css` con soporte para todos los estados visuales (`GREEN`).
- **Paso 4 — Integrar:** Conectar la carga opcional por `tasksService` cuando se provean las props.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 68 tests previos más los nuevos tests del acordeón (mínimo 78-80 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A03.02.md`, `TEST_REPORT_FIA-A03.02.md`, redactar la propuesta formal de `LOCK-FIA-A03.02.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/hub/components/TasksAccordion.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TasksAccordion.module.css';
import { TaskItem } from '../../tasks/entities/task-item.entity';
import { TasksService } from '../../tasks/services/tasks.service';

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

export const TasksAccordion: React.FC<TasksAccordionProps> = ({
  tasks: propTasks,
  tasksService,
  userId,
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onCreateTaskClick,
  onTaskToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [tasks, setTasks] = useState<TaskItem[]>(propTasks || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);

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

  const handleToggleTask = async (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    }
    if (tasksService && userId) {
      try {
        const updated = await tasksService.toggleTaskStatus(userId, taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch {
        // En caso de fallo, se mantiene el estado previo
      }
    } else {
      // Mutación local si es controlado por props
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completado: !t.completado } : t))
      );
    }
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

        {onCreateTaskClick && (
          <button
            type="button"
            className={styles.newButton}
            onClick={(e) => {
              e.stopPropagation();
              onCreateTaskClick();
            }}
            aria-label="Crear nueva tarea"
          >
            + Nueva
          </button>
        )}
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
              {onCreateTaskClick && (
                <button
                  type="button"
                  onClick={onCreateTaskClick}
                  className={styles.emptyCtaButton}
                >
                  + Crear Tarea
                </button>
              )}
            </div>
          )}

          {/* EV-LIST-01: Lista Poblada de Tareas */}
          {!isLoading && !error && tasks.length > 0 && (
            <ul className={styles.taskList} role="list" data-testid="tasks-populated-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`${styles.taskItem} ${task.completado ? styles.completed : ''}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={task.completado}
                      onChange={() => handleToggleTask(task.id)}
                      className={styles.checkbox}
                      aria-label={`Completar tarea ${task.titulo}`}
                    />
                  </label>

                  <span className={styles.taskTitle}>{task.titulo}</span>

                  <span
                    className={`${styles.priorityBadge} ${styles['priority_' + task.prioridad]}`}
                  >
                    {task.prioridad.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
```

### 10.2 Estilos canónicos en `src/hub/components/TasksAccordion.module.css`:
```css
.accordionContainer {
  background-color: var(--surface-hub, #131B26);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  color: #FFFFFF;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  user-select: none;
  transition: background-color 150ms ease;
}

.header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.titleSection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chevron {
  font-size: 10px;
  color: #94A3B8;
  display: inline-block;
  transition: transform 200ms ease;
}

.chevronOpen {
  transform: rotate(90deg);
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #F8FAFC;
}

.newButton {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60A5FA;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms ease;
}

.newButton:hover {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.contentArea {
  padding: 12px 14px;
  border-top: 1px solid var(--border-subtle, #233144);
}

/* EV-LIST-02: Skeleton Shimmer */
.skeletonContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeletonItem {
  height: 38px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* EV-LIST-03: Empty State */
.emptyContainer {
  border: 1px dashed #233144;
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  background-color: rgba(11, 15, 23, 0.4);
}

.emptyIcon {
  font-size: 24px;
  margin-bottom: 8px;
}

.emptyTitle {
  font-size: 13px;
  font-weight: 600;
  color: #E2E8F0;
  margin: 0 0 4px 0;
}

.emptySubtitle {
  font-size: 11px;
  color: #94A3B8;
  margin: 0 0 14px 0;
}

.emptyCtaButton {
  background-color: #3B82F6;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.emptyCtaButton:hover {
  background-color: #2563EB;
}

/* EV-LIST-05: Error State */
.errorContainer {
  background-color: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.errorMessage {
  font-size: 12px;
  color: #FCA5A5;
}

.retryButton {
  background: transparent;
  border: 1px solid #F87171;
  color: #F87171;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.retryButton:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

/* EV-LIST-01: Populated List */
.taskList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.taskItem {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #0B0F17;
  border: 1px solid #233144;
  border-radius: 6px;
  padding: 10px 12px;
  transition: all 150ms ease;
}

.taskItem:hover {
  border-color: #3B82F6;
}

.completed {
  opacity: 0.6;
}

.completed .taskTitle {
  text-decoration: line-through;
  color: #94A3B8;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3B82F6;
  cursor: pointer;
}

.taskTitle {
  flex: 1;
  font-size: 13px;
  color: #FFFFFF;
  word-break: break-word;
}

.priorityBadge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.priority_alta {
  background-color: rgba(239, 68, 68, 0.15);
  color: #FCA5A5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.priority_media {
  background-color: rgba(245, 158, 11, 0.15);
  color: #FCD34D;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.priority_baja {
  background-color: rgba(59, 130, 246, 0.15);
  color: #93C5FD;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
```

## 11. Tests Requeridos

### Estructura canónica de `src/hub/components/TasksAccordion.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksAccordion } from './TasksAccordion';
import { TaskItem } from '../../tasks/entities/task-item.entity';

describe('TasksAccordion Component (EV-LIST-01 a EV-LIST-05)', () => {
  const mockTasks: TaskItem[] = [
    {
      id: 'task-1',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Revisar caldera',
      descripcion: 'Presión a 1.5 bar',
      prioridad: 'alta',
      completado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-2',
      userId: 'usr-1',
      modulo: 'tasks',
      titulo: 'Comprar bombilla LED',
      descripcion: '',
      prioridad: 'baja',
      completado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar la cabecera con contador dinámico Tareas (N) y botón de nueva tarea', () => {
    const handleNew = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onCreateTaskClick={handleNew} />);

    expect(screen.getByRole('button', { name: /tareas \(2\)/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: /crear nueva tarea/i })).toBeInTheDocument();
  });

  it('debe colapsar y expandir el contenido al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onToggleExpand={handleExpand} />);

    const header = screen.getByRole('button', { name: /tareas \(2\)/i });
    expect(screen.getByTestId('tasks-populated-list')).toBeInTheDocument();

    // Colapsar
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('tasks-populated-list')).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenCalledWith(false);

    // Expandir
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('tasks-populated-list')).toBeInTheDocument();
  });

  it('EV-LIST-02: debe renderizar el Skeleton Screen de 3 líneas cuando isLoading=true sin bloquear la UI', () => {
    render(<TasksAccordion isLoading={true} />);

    expect(screen.getByTestId('tasks-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('EV-LIST-03: debe renderizar Empty State sobrio cuando no hay tareas y disparar CTA', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<TasksAccordion tasks={[]} onCreateTaskClick={handleCreate} />);

    expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no tienes tareas pendientes/i)).toBeInTheDocument();

    const ctaButton = screen.getByRole('button', { name: /\+ crear tarea/i });
    await user.click(ctaButton);

    expect(handleCreate).toHaveBeenCalled();
  });

  it('EV-LIST-05: debe renderizar banner de error y permitir reintento', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<TasksAccordion error="Error de conexión" onRetry={handleRetry} />);

    expect(screen.getByTestId('tasks-error-state')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/error de conexión/i);

    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    await user.click(retryBtn);

    expect(handleRetry).toHaveBeenCalled();
  });

  it('EV-LIST-01: debe renderizar lista de tareas con badges de prioridad y texto tachado en completadas', () => {
    render(<TasksAccordion tasks={mockTasks} />);

    expect(screen.getByText('Revisar caldera')).toBeInTheDocument();
    expect(screen.getByText('ALTA')).toHaveClass(/priority_alta/);

    const completedTaskTitle = screen.getByText('Comprar bombilla LED');
    expect(completedTaskTitle).toBeInTheDocument();
    expect(screen.getByText('BAJA')).toHaveClass(/priority_baja/);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('debe invocar onTaskToggle al pulsar el checkbox de una tarea', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(<TasksAccordion tasks={mockTasks} onTaskToggle={handleToggle} />);

    const checkbox = screen.getByRole('checkbox', { name: /completar tarea revisar caldera/i });
    await user.click(checkbox);

    expect(handleToggle).toHaveBeenCalledWith('task-1');
  });
});
```

- **Comandos de Verificación:**
  ```bash
  npm run test
  npm run typecheck
  npm run lint
  ```

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (0 errores TypeScript).
- `QG-02 · Linting:` `npm run lint` (0 warnings).
- `QG-03 · Tests Suite:` 100% tests en verde (mínimo 75-78 tests totales en Vitest).
- `QG-04 · Validación Matriz EV-LIST:` Tests automatizados de Skeleton, Empty State y Populated List en verde.
- `QG-05 · Accesibilidad WCAG AA:` Marcado semántico y `aria-expanded` verificado.

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "RV-A01: Topología espacial y scaffolding completo del Workspace (WorkspaceLayout, HubContainer reactivo, TopNavbar)",
    "RV-A02: Autenticación, sesión segura HttpOnly, validación empática de login, registro con doble contraseña (VV-009), throttler (429), logout y SessionAuthGuard. Cierre formal total.",
    "FIA-A03.01: Modelo de datos TaskItem, invariantes tipográficas de la Decisión 2B (120/1000 caracteres), aislamiento multi-tenant estricto por userId y endpoints CRUD completos (POST, GET, PUT, PATCH toggle, DELETE)",
    "FIA-A03.02: Acordeón de Tareas en Hub (TasksAccordion) con conteo reactivo 'Tareas (N)', Skeleton Screen de 3 líneas (EV-LIST-02), Empty State con CTA (EV-LIST-03), Error State (EV-LIST-05) y Lista Poblada con badges de prioridad y checkbox (EV-LIST-01)"
  ],
  "active_constraints": [
    "Aislamiento absoluto de tenant por userId en todas las consultas del repositorio de tareas",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de título y 1000 de descripción",
    "Prohibición de spinners a pantalla completa: carga confinada mediante Skeleton Screens en acordeón",
    "Aislamiento hermético de tests en Vitest sin contaminación cruzada de almacenamiento"
  ],
  "unlocked_next": "FIA-A03.03 (Modal Wizard de Creación en 3 Pasos - VV-004)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/hub/components/TasksAccordion.tsx",
    "src/hub/components/TasksAccordion.module.css",
    "src/hub/components/TasksAccordion.test.tsx"
  ],
  "files_modified": [],
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
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle_con_acordeon_tareas",
    "tasks_accordion": "ev_list_matrix_active_01_05",
    "session_lifecycle": "login_guard_logout_purgado_completo",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TasksAccordion` y sus estilos encapsulados están implementados respetando la accesibilidad WCAG AA y la matriz de estados EV-LIST-01 a EV-LIST-05.
2. La suite de pruebas de integración verifica todas las transiciones (Skeleton, Empty State, Error y Populated List).
3. El 100% de los tests del proyecto (mínimo 75-78 tests) pasan en verde con Vitest.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.02.md`, `TEST_REPORT_FIA-A03.02.md` y la propuesta formal de `LOCK-FIA-A03.02.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A03.02`. Prohibido implementar el modal Wizard (`TaskCreationWizard`) en esta sesión (reservado a `FIA-A03.03`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Prohibición de Spinners a Pantalla Completa:** Asegúrate de que el estado de carga use estrictamente el Skeleton Screen local.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A03.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
