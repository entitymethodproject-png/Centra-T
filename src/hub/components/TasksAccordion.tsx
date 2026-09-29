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
