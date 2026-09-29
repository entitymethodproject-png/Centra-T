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
