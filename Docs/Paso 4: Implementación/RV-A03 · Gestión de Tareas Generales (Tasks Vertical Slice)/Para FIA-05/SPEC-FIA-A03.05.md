# SPEC-FIA-A03.05 · MENÚ CONTEXTUAL Y DIÁLOGO PREVENTIVO DE ELIMINACIÓN

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Hito de Rebanada:** QUINTA UNIDAD Y PVF DE CIERRE DE RV-A03 (CIERRE DE VERTICAL SLICE)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A03.05 · TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación  
**PVF de Cierre:** PVF-A03.05 · Edición Contextual y Eliminación con Diálogo Preventivo  
**VF:** VF-A03.05 · Edición y Eliminación con Diálogo Preventivo  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A03.04.md APROBADO (Commit: `479fb77`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el componente `TaskActionMenu` en `src/tasks/components/TaskActionMenu.tsx` (con sus estilos encapsulados en `TaskActionMenu.module.css` y tests en `TaskActionMenu.test.tsx`), e integrarlo en `TaskCard.tsx` y `TasksAccordion.tsx` para Antigravity CLI. Esta unidad culmina y sella la Rebanada Vertical RV-A03, proveyendo un menú contextual flotante accesible (`role="menu"`) en cada tarjeta para edición rápida (cambio de prioridad) y el blindaje de la acción destructiva de eliminación: **ninguna tarea se elimina directamente al pulsar un botón; la acción es interceptada obligatoriamente por un diálogo modal preventivo con foco seguro en `[Cancelar]`**. La cancelación aborta sin mutaciones ni llamadas de red, y la confirmación ejecuta `DELETE`, retira la tarjeta del Hub y actualiza reactivamente el contador `Tareas (N)`.

## 2. Objetivo
Construir y verificar exhaustivamente con TDD en `@testing-library/react` y Vitest:
1. Componente `TaskActionMenu` en `src/tasks/components/TaskActionMenu.tsx` con botón disparador `(...)` accesible (`aria-haspopup="menu"`, `aria-expanded`).
2. Menú contextual flotante accesible (`role="menu"`, `role="menuitem"`):
   - Opción para alternar prioridad (`alta`, `media`, `baja`) invocando `tasksService.updateTask` y notificando a `onTaskUpdated`.
   - Opción destructiva de peligro `Eliminar tarea`.
   - Cierre automático al hacer clic fuera del menú o presionar la tecla `Escape`.
3. Diálogo modal preventivo de confirmación:
   - Al pulsar `Eliminar tarea`, se abre el diálogo modal (`role="dialog"`, `aria-modal="true"`).
   - Título explícito: `¿Eliminar tarea?` y advertencia: `Esta acción no se puede deshacer. Se eliminará permanentemente la tarea de tu lista.`
   - Foco inicial seguro en el botón `[Cancelar]` (`cancelButtonRef.current?.focus()`) para evitar eliminaciones accidentales por pulsación involuntaria de `Enter`.
4. Comportamiento ante Cancelación vs Confirmación:
   - **Cancelación:** Pulsar `[Cancelar]`, `Escape` o `(✕)` cierra el modal sin emitir ninguna petición HTTP DELETE ni mutar el estado.
   - **Confirmación:** Pulsar `[Eliminar Definitivamente]` ejecuta `tasksService.deleteTask(userId, task.id)`, cierra el modal y despacha `onTaskDeleted(taskId)`, retirando la tarjeta de la lista de tareas en `TasksAccordion` y recalculando el contador `Tareas (N)`.
5. 100% de los tests del proyecto en verde (mínimo 101-104 tests globales pasando en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A03.04_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa de Dominio Tasks: `src/tasks/entities/*`, `src/tasks/services/*`, `src/tasks/controllers/*` (12 tests pasando, incluyendo `deleteTask` y `updateTask`).
  - Capa de Interfaz Tasks: `TaskCreationWizard.*` (10 tests pasando), `TaskCard.*` (7 tests pasando con mutación optimista y caso VV-005).
  - Capa de Hub y Acordeón: `TasksAccordion.*`, `HubContainer.*` (11 tests pasando).
  - Capa de Autenticación, Usuarios y Shell: `src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*` (54 tests pasando).
- **Estado de Tests Actual:** 94/94 tests pasando en verde a través de 14 archivos de prueba en Vitest.
- **Riesgos Iniciales:** El menú contextual no debe desbordar los límites del HubContainer ni interferir con los checkboxes de completado de las tareas adyacentes.

## 4. Estado Objetivo
El repositorio debe contar con `TaskActionMenu.tsx`, `TaskActionMenu.module.css` y `TaskActionMenu.test.tsx` en `src/tasks/components/`, conectado a `TaskCard.tsx` y `TasksAccordion.tsx`.
- **Restricciones negativas explícitas:**
  - Prohibido emitir peticiones DELETE sin confirmación explícita en el modal preventivo.
  - Prohibido posicionar el foco predeterminado en el botón de eliminar del modal (riesgo de pérdida involuntaria de datos).
  - Prohibido degradar cualquiera de los 94 tests existentes.

## 5. Contratos Afectados
- **5.1 Contrato de Interfaz (`TaskActionMenuProps`):**
  ```typescript
  export interface TaskActionMenuProps {
    task: TaskItem;
    userId?: string;
    tasksService?: TasksService;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onTaskDeleted?: (taskId: string) => void;
  }
  ```
- **5.2 Contrato de Actualización en `TaskCardProps`:**
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
- **5.3 Contrato Físico / Module Map:** Directorio `src/tasks/components/*` e integración en `src/hub/components/TasksAccordion.tsx`.
- **5.4 Contrato de Accesibilidad:** `role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, y diálogo modal con `role="dialog"`, `aria-modal="true"`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/tasks/components/TaskActionMenu.tsx`: Componente React de menú contextual y modal preventivo.
- `src/tasks/components/TaskActionMenu.module.css`: Estilos visuales del menú flotante, opciones y modal de confirmación.
- `src/tasks/components/TaskActionMenu.test.tsx`: Batería exhaustiva de tests TDD (8-9 pruebas unitarias y de integración).

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/tasks/components/TaskCard.tsx`: Integrar `TaskActionMenu` al final de la fila de la tarea.
- `src/hub/components/TasksAccordion.tsx`: Conectar `onTaskDeleted` para retirar la tarjeta de la lista en memoria.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/tasks/components/TaskCreationWizard.*` (10 tests de alta intactos).
- `src/tasks/components/TaskCard.test.tsx` (7 tests de mutación optimista intactos).
- `src/hub/components/TasksAccordion.test.tsx` (7 tests de matriz EV-LIST intactos).
- Todos los servicios, repositorios, controladores y vistas previas (70 tests intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/shopping/*`, `src/cleaning/*` (módulos posteriores).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Features 05 y 09), `Centra-T Pseudocódigo (unificado).odt` (Procesos 4.3 y 4.4), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A03.04_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A03.04`. Cierra formalmente la rebanada RV-A03 y desbloquea `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`.

## 8. Restricciones
- La eliminación exige confirmación modal obligatoria.
- Foco predeterminado en `[Cancelar]` en el diálogo modal.
- Cero llamadas DELETE si el usuario cancela o pulsa `Escape`.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/tasks/components/TaskActionMenu.test.tsx` los 9 tests:
  1. Renderizado accesible del botón disparador `(...)` con `aria-haspopup="menu"`.
  2. Apertura del menú flotante al pulsar el disparador.
  3. Cierre automático del menú al presionar la tecla `Escape`.
  4. Cierre automático al hacer clic fuera del menú.
  5. Cambio de prioridad contextual e invocación de `onTaskUpdated`.
  6. Intercepción obligatoria: pulsar `Eliminar tarea` abre el modal preventivo con foco en `[Cancelar]`.
  7. Cancelación inofensiva: pulsar `[Cancelar]` cierra el modal y no invoca `deleteTask`.
  8. Cancelación con tecla `Escape` en el modal preventivo.
  9. Eliminación confirmada: pulsar `[Eliminar Definitivamente]` ejecuta `deleteTask`, cierra el modal e invoca `onTaskDeleted`.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos corresponden a la ausencia del componente `TaskActionMenu`.
- **Paso 3 — Implementar Mínimo:** Crear `TaskActionMenu.tsx` y `TaskActionMenu.module.css` satisfaciendo el menú y el modal preventivo (`GREEN`).
- **Paso 4 — Integrar en TaskCard y TasksAccordion:** Renderizar `TaskActionMenu` en `TaskCard.tsx` y propagar la eliminación en `TasksAccordion.tsx`.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 94 tests previos más los 9 nuevos tests (mínimo 103 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A03.05.md`, `TEST_REPORT_FIA-A03.05.md`, redactar la propuesta formal de `LOCK-FIA-A03.05.md` que certifica el **CIERRE TOTAL DE LA REBANADA RV-A03** y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/tasks/components/TaskActionMenu.tsx`:
```tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './TaskActionMenu.module.css';
import { TaskItem, TaskPriority } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

export interface TaskActionMenuProps {
  task: TaskItem;
  userId?: string;
  tasksService?: TasksService;
  onTaskUpdated?: (updatedTask: TaskItem) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export const TaskActionMenu: React.FC<TaskActionMenuProps> = ({
  task,
  userId = 'usr-demo-elena-001',
  tasksService,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPrioritySubmenuOpen, setIsPrioritySubmenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsPrioritySubmenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Manejo de foco seguro al abrir el modal de confirmación
  useEffect(() => {
    if (isConfirmOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isConfirmOpen]);

  // Captura de tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfirmOpen && !isDeleting) {
          handleCancelDelete();
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
          setIsPrioritySubmenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmOpen, isDeleting, isMenuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
    setIsPrioritySubmenuOpen(false);
  };

  const handleOpenDeleteConfirm = () => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);
    setDeleteError(null);
    setIsConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteError(null);
  };

  const handleChangePriority = async (newPriority: TaskPriority) => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);

    if (tasksService && userId) {
      try {
        const updated = await tasksService.updateTask(userId, task.id, {
          prioridad: newPriority,
        });
        if (onTaskUpdated) onTaskUpdated(updated);
      } catch {
        // En caso de fallo se preserva el estado
      }
    } else {
      if (onTaskUpdated) {
        onTaskUpdated({ ...task, prioridad: newPriority });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (tasksService && userId) {
        await tasksService.deleteTask(userId, task.id);
      }
      setIsDeleting(false);
      setIsConfirmOpen(false);
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err?.message || 'No se pudo eliminar el elemento del servidor');
    }
  };

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Botón Disparador (...) */}
      <button
        type="button"
        className={styles.triggerButton}
        onClick={handleToggleMenu}
        aria-label="Acciones de tarea"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        data-testid="task-action-trigger"
      >
        •••
      </button>

      {/* Menú Desplegable Flotante */}
      {isMenuOpen && (
        <div
          role="menu"
          className={styles.dropdownMenu}
          data-testid="task-action-dropdown"
          aria-label="Opciones de tarea"
        >
          {/* Submenú / Opciones de Prioridad */}
          <div className={styles.prioritySubmenuSection}>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => setIsPrioritySubmenuOpen((prev) => !prev)}
            >
              <span>Cambiar prioridad</span>
              <span className={styles.menuChevron}>{isPrioritySubmenuOpen ? '▲' : '▼'}</span>
            </button>

            {isPrioritySubmenuOpen && (
              <div className={styles.priorityChoices}>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityAlta}`}
                  onClick={() => handleChangePriority('alta')}
                >
                  <span className={styles.dot} /> Alta
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityMedia}`}
                  onClick={() => handleChangePriority('media')}
                >
                  <span className={styles.dot} /> Media
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityBaja}`}
                  onClick={() => handleChangePriority('baja')}
                >
                  <span className={styles.dot} /> Baja
                </button>
              </div>
            )}
          </div>

          <div className={styles.menuDivider} />

          {/* Opción Destructiva: Eliminar */}
          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.deleteItem}`}
            onClick={handleOpenDeleteConfirm}
            data-testid="action-delete-task"
          >
            Eliminar tarea
          </button>
        </div>
      )}

      {/* Diálogo Modal Preventivo de Confirmación */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className={styles.backdrop}
          data-testid="delete-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              handleCancelDelete();
            }
          }}
        >
          <div className={styles.modalCard} data-testid="delete-modal-card">
            <div className={styles.modalHeader}>
              <h3 id="confirm-delete-title" className={styles.modalTitle}>
                ¿Eliminar tarea?
              </h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCancelDelete}
                disabled={isDeleting}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Esta acción no se puede deshacer. Se eliminará permanentemente la tarea{' '}
                <strong>"{task.titulo}"</strong> de tu lista de pendientes.
              </p>
              {deleteError && (
                <div role="alert" className={styles.errorAlert}>
                  {deleteError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                ref={cancelButtonRef}
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                data-testid="confirm-delete-btn"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 10.2 Estilos encapsulados de `src/tasks/components/TaskActionMenu.module.css`:
```css
.container {
  position: relative;
  display: inline-block;
}

.triggerButton {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: -1px;
  line-height: 1;
  transition: all 0.15s ease;
}

.triggerButton:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}

.dropdownMenu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
  min-width: 170px;
  padding: 6px;
  margin-top: 4px;
  animation: menuAppear 0.15s ease-out;
}

@keyframes menuAppear {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menuItem {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.menuItem:hover {
  background: #1e293b;
  color: #f8fafc;
}

.menuChevron {
  font-size: 10px;
  color: #64748b;
}

.priorityChoices {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 4px 10px;
  background: rgba(11, 15, 23, 0.4);
  border-radius: 6px;
  margin-top: 2px;
}

.priorityChoice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.priorityChoice:hover {
  background: #1e293b;
  color: #f8fafc;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.priorityAlta .dot {
  background: #ef4444;
}

.priorityMedia .dot {
  background: #f59e0b;
}

.priorityBaja .dot {
  background: #3b82f6;
}

.menuDivider {
  height: 1px;
  background: #233144;
  margin: 4px 0;
}

.deleteItem {
  color: #ef4444;
}

.deleteItem:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* Modal Preventivo */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modalCard {
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(10px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #233144;
}

.modalTitle {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.closeButton {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.closeButton:hover:not(:disabled) {
  color: #f8fafc;
}

.modalBody {
  padding: 20px 22px;
}

.modalText {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.errorAlert {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
}

.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid #233144;
  background: rgba(11, 15, 23, 0.5);
}

.cancelButton,
.confirmDeleteButton {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancelButton {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
}

.cancelButton:hover:not(:disabled) {
  background: #334155;
}

.confirmDeleteButton {
  background: #ef4444;
  border: 1px solid #dc2626;
  color: #ffffff;
}

.confirmDeleteButton:hover:not(:disabled) {
  background: #dc2626;
}

.cancelButton:disabled,
.confirmDeleteButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 10.3 Batería exhaustiva de tests en `src/tasks/components/TaskActionMenu.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskActionMenu } from './TaskActionMenu';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

describe('TaskActionMenu Component (Menú Contextual y Modal Preventivo)', () => {
  const baseTask: TaskItem = {
    id: 'task-action-01',
    userId: 'usr-demo-elena-001',
    modulo: 'tasks',
    titulo: 'Pintar rodapiés del salón',
    descripcion: 'Color blanco satinado',
    prioridad: 'media',
    completado: false,
    fechaProgramada: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe renderizar accesiblemente el disparador (...) con aria-haspopup="menu"', () => {
    render(<TaskActionMenu task={baseTask} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('debe desplegar el menú contextual al hacer clic en el disparador', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    const trigger = screen.getByRole('button', { name: /acciones de tarea/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /opciones de tarea/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /cambiar prioridad/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /eliminar tarea/i })).toBeInTheDocument();
  });

  it('debe cerrar el menú contextual al presionar la tecla Escape', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cerrar el menú al hacer clic fuera del mismo', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside-area">Área Exterior</div>
        <TaskActionMenu task={baseTask} />
      </div>
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByTestId('outside-area'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe cambiar la prioridad de la tarea e invocar onTaskUpdated', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();

    const mockService = {
      updateTask: vi.fn().mockResolvedValue({
        ...baseTask,
        prioridad: 'alta',
      }),
    } as unknown as TasksService;

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskUpdated={handleUpdated}
      />
    );

    // Abrir menú
    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    // Abrir submenú de prioridad
    await user.click(screen.getByRole('menuitem', { name: /cambiar prioridad/i }));
    // Seleccionar 'Alta'
    await user.click(screen.getByRole('menuitem', { name: /alta/i }));

    await waitFor(() => {
      expect(mockService.updateTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01',
        { prioridad: 'alta' }
      );
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ prioridad: 'alta' })
      );
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('intercepción obligatoria: pulsar Eliminar abre el modal preventivo con foco en Cancelar', async () => {
    const user = userEvent.setup();
    render(<TaskActionMenu task={baseTask} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿eliminar tarea\?/i })).toBeInTheDocument();
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();

    // Foco en Cancelar
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await waitFor(() => {
      expect(cancelBtn).toHaveFocus();
    });
  });

  it('CANCELACIÓN INOFENSIVA: pulsar Cancelar cierra el modal preventivo sin emitir DELETE ni mutar estado', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn(),
    } as unknown as TasksService;
    const handleDeleted = vi.fn();

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        onTaskDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.deleteTask).not.toHaveBeenCalled();
    expect(handleDeleted).not.toHaveBeenCalled();
  });

  it('cancelar mediante tecla Escape en el modal preventivo cierra el diálogo sin mutaciones', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn(),
    } as unknown as TasksService;

    render(<TaskActionMenu task={baseTask} tasksService={mockService} />);

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockService.deleteTask).not.toHaveBeenCalled();
  });

  it('ELIMINACIÓN EXITOSA: confirmar eliminación ejecuta deleteTask e invoca onTaskDeleted', async () => {
    const user = userEvent.setup();
    const mockService = {
      deleteTask: vi.fn().mockResolvedValue(undefined),
    } as unknown as TasksService;
    const handleDeleted = vi.fn();

    render(
      <TaskActionMenu
        task={baseTask}
        tasksService={mockService}
        userId="usr-demo-elena-001"
        onTaskDeleted={handleDeleted}
      />
    );

    await user.click(screen.getByRole('button', { name: /acciones de tarea/i }));
    await user.click(screen.getByRole('menuitem', { name: /eliminar tarea/i }));

    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockService.deleteTask).toHaveBeenCalledWith(
        'usr-demo-elena-001',
        'task-action-01'
      );
      expect(handleDeleted).toHaveBeenCalledWith('task-action-01');
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

### 10.4 Actualización canónica de `src/tasks/components/TaskCard.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TaskCard.module.css';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';
import { TaskActionMenu } from './TaskActionMenu';

export interface TaskCardProps {
  task: TaskItem;
  userId?: string;
  tasksService?: TasksService;
  onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
  onTaskUpdated?: (updatedTask: TaskItem) => void;
  onTaskDeleted?: (taskId: string) => void;
  onRollback?: (revertedTask: TaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userId = 'usr-demo-elena-001',
  tasksService,
  onToggleOptimistic,
  onTaskUpdated,
  onTaskDeleted,
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

        {/* Menú Contextual de Tarjeta */}
        <TaskActionMenu
          task={task}
          userId={userId}
          tasksService={tasksService}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
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

### 10.5 Actualización canónica de `src/hub/components/TasksAccordion.tsx`:
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

  const handleTaskDeleted = (deletedId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
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

          {/* EV-LIST-01: Lista Poblada de Tareas con TaskCard y ActionMenu */}
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
                  onTaskDeleted={handleTaskDeleted}
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
- Ejecutar la suite completa:
  ```bash
  npm test -- --run
  ```
- **Evidencia requerida:** Mínimo 103 tests pasando al 100% en verde a través de 15 archivos de prueba sin ninguna regresión en ninguna suite previa.

## 12. Matriz de Trazabilidad
| Requerimiento Indexado | Archivo de Especificación | Componente / Código | Test de Verificación |
| :--- | :--- | :--- | :--- |
| **PVF-A03.05 / VF-A03.05** | `SPEC-FIA-A03.05.md` (Sec. 10.1) | `TaskActionMenu.tsx` | `TaskActionMenu.test.tsx` (Tests 1 a 9) |
| **Diálogo Preventivo Obligatorio** | `SPEC-FIA-A03.05.md` (Sec. 10.1) | `isConfirmOpen`, `cancelButtonRef` | `TaskActionMenu.test.tsx` (Test 6) |
| **Cancelación Inofensiva** | `SPEC-FIA-A03.05.md` (Sec. 10.1) | `handleCancelDelete`, Escape | `TaskActionMenu.test.tsx` (Tests 7 y 8) |
| **Eliminación Exitosa y Fade-out** | `SPEC-FIA-A03.05.md` (Sec. 10.1, 10.5) | `handleConfirmDelete`, `handleTaskDeleted` | `TaskActionMenu.test.tsx` (Test 9) |

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)",
  "completed_fias": ["FIA-A01.01", "FIA-A01.02", "FIA-A01.03", "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05", "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05"],
  "latest_locked_fia": "FIA-A03.05",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y mutaciones de tareas",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de título y 1000 de descripción",
    "Decisión 3A & Caso Forense VV-004: Rollback total a cero en memoria al cancelar o presionar ESC",
    "Caso Forense VV-005: Mutación optimista en <50ms con reversión automática y Toast empático ante fallo 500",
    "Diálogo preventivo de confirmación con foco seguro en Cancelar antes de cualquier DELETE",
    "Rebanada Vertical RV-A03 completada y cerrada al 100%"
  ],
  "unlocked_next": "FIA-A04.01 (Módulo Backend Shopping y Asignación Grupal en RV-A04)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/tasks/components/TaskActionMenu.tsx",
    "src/tasks/components/TaskActionMenu.module.css",
    "src/tasks/components/TaskActionMenu.test.tsx"
  ],
  "files_modified": [
    "src/tasks/components/TaskCard.tsx",
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
    "TaskActionMenu",
    "TaskCreationWizard",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion",
    "task_items": "TaskCard -> aloja Checkbox optimista, Toast de reversión y TaskActionMenu",
    "action_menu": "TaskActionMenu (dropdown flotante z-index 50 + modal confirmación preventivo z-index 1000)",
    "modal_layer": "TaskCreationWizard (fixed inset-0, z-index 1000, card 500px centrada)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle_con_acordeon_tareas_y_wizard",
    "task_card": "optimistic_toggle_rollback_toast_vv005_active",
    "task_action_menu": "context_menu_safe_delete_modal_active",
    "tasks_wizard": "step_flow_1_2_3_atomic_rollback_vv004",
    "session_lifecycle": "login_guard_logout_purgado_completo",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active",
    "vertical_slice_rv_a03": "completed_100_percent_closed"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TaskActionMenu` y sus estilos encapsulados están implementados respetando la accesibilidad WCAG AA (`role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`).
2. El diálogo preventivo intercepta la eliminación, establece el foco predeterminado en `[Cancelar]` y garantiza que la cancelación no emite peticiones DELETE ni muta el estado.
3. La eliminación confirmada ejecuta `deleteTask`, retira la tarjeta del Hub y actualiza reactivamente el contador `Tareas (N)`.
4. El 100% de los tests del proyecto (mínimo 103 tests) pasan en verde con Vitest a través de 15 suites de prueba.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.05.md`, `TEST_REPORT_FIA-A03.05.md` y la propuesta formal de `LOCK-FIA-A03.05.md`, sellando el **CIERRE TOTAL DE LA REBANADA VERTICAL RV-A03**.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A03.05`. Cierra formalmente la rebanada RV-A03; no inicies `RV-A04` (Shopping) en esta sesión.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Blindaje del Diálogo Preventivo:** Asegúrate de verificar mediante tests que al pulsar `[Cancelar]` o `Escape`, `deleteTask` no sea invocado jamás.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A03.05.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
