import React, { useState, useEffect } from 'react';
import styles from './TaskCard.module.css';
import { TaskItem } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';
import { TaskActionMenu } from './TaskActionMenu';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../../calendar-sync/types/drag-drop.types';

export interface TaskCardProps {
  task: TaskItem;
  userId?: string;
  tasksService?: TasksService;
  onToggleOptimistic?: (taskId: string, newStatus: boolean) => void;
  onTaskUpdated?: (updatedTask: TaskItem) => void;
  onTaskDeleted?: (taskId: string) => void;
  onRollback?: (revertedTask: TaskItem) => void;
  isDraggable?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userId = 'usr-demo-elena-001',
  tasksService,
  onToggleOptimistic,
  onTaskUpdated,
  onTaskDeleted,
  onRollback,
  isDraggable = true,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(task.completado);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sincronizar estado local si el prop cambia
  useEffect(() => {
    setIsCompleted(task.completado);
  }, [task.completado]);

  // VV-005: Mutación optimista inmediata (<50ms)
  const handleToggle = async () => {
    if (isSyncing) return;

    const previousStatus = isCompleted;
    const newStatus = !previousStatus;

    // Mutación optimista local
    setIsCompleted(newStatus);
    setToastMessage(null);

    if (onToggleOptimistic) {
      onToggleOptimistic(task.id, newStatus);
    }

    if (tasksService && userId) {
      setIsSyncing(true);
      try {
        const updated = await tasksService.toggleTaskStatus(userId, task.id);
        setIsSyncing(false);
        if (onTaskUpdated) {
          onTaskUpdated(updated);
        }
      } catch {
        // Rollback automático incondicional ante fallo 500
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

  const handleDragStart = (e: React.DragEvent) => {
    const payload: DragItemPayload = {
      id: task.id,
      modulo: 'tasks',
      titulo: task.titulo,
      prioridad: task.prioridad,
      completado: isCompleted,
      fechaProgramada: task.fechaProgramada ? String(task.fechaProgramada) : null,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <li
      className={`${styles.taskItem} ${isCompleted ? styles.completed : ''}`}
      data-testid={`task-card-${task.id}`}
      data-completed={isCompleted}
      draggable={isDraggable}
      onDragStart={handleDragStart}
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

        {/* Puntito sutil de prioridad entre casilla y nombre */}
        <span
          className={`${styles.priorityDot} ${styles['priorityDot_' + task.prioridad]}`}
          data-testid="task-card-priority"
          title={`Prioridad ${task.prioridad}`}
          aria-label={`Prioridad ${task.prioridad}`}
        />

        <span
          className={`${styles.taskTitle} ${isCompleted ? styles.titleCompleted : ''}`}
          data-testid="task-card-title"
        >
          {task.titulo}
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
