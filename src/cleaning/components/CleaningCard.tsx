import React, { useState, useEffect } from 'react';
import styles from './CleaningCard.module.css';
import { CleaningItem } from '../entities/cleaning-item.entity';
import { CleaningService } from '../services/cleaning.service';
import { CleaningActionMenu } from './CleaningActionMenu';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../../calendar-sync/types/drag-drop.types';

export interface CleaningCardProps {
  item: CleaningItem;
  userId?: string;
  cleaningService?: CleaningService;
  onToggleOptimistic?: (itemId: string, newStatus: boolean) => void;
  onItemUpdated?: (updatedItem: CleaningItem) => void;
  onItemDeleted?: (itemId: string) => void;
  onRollback?: (revertedItem: CleaningItem) => void;
  isDraggable?: boolean;
}

export const CleaningCard: React.FC<CleaningCardProps> = ({
  item,
  userId = 'usr-demo-elena-001',
  cleaningService,
  onToggleOptimistic,
  onItemUpdated,
  onItemDeleted,
  onRollback,
  isDraggable = true,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(item.completado);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsCompleted(item.completado);
  }, [item.completado]);

  const handleToggle = async () => {
    if (isSyncing) return;

    const previousStatus = isCompleted;
    const newStatus = !previousStatus;

    setIsCompleted(newStatus);
    setToastMessage(null);

    if (onToggleOptimistic) {
      onToggleOptimistic(item.id, newStatus);
    }

    if (cleaningService && userId) {
      setIsSyncing(true);
      try {
        const updated = await cleaningService.updateItem(userId, item.id, {
          completado: newStatus,
        });
        setIsSyncing(false);
        if (onItemUpdated) {
          onItemUpdated(updated);
        }
      } catch {
        setIsCompleted(previousStatus);
        setIsSyncing(false);
        setToastMessage('No se pudo actualizar el estado de la tarea de limpieza. Se ha revertido el cambio.');
        if (onRollback) {
          onRollback({ ...item, completado: previousStatus });
        }
      }
    } else {
      if (onItemUpdated) {
        onItemUpdated({ ...item, completado: newStatus });
      }
    }
  };

  const handleDismissToast = () => {
    setToastMessage(null);
  };

  const displayName = item.titulo || item.nombre || '';

  const handleDragStart = (e: React.DragEvent) => {
    const payload: DragItemPayload = {
      id: item.id,
      modulo: 'cleaning',
      titulo: displayName,
      prioridad: item.prioridad,
      completado: isCompleted,
      fechaProgramada: item.fechaProgramada ? String(item.fechaProgramada) : null,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <li
      className={`${styles.taskItem} ${isCompleted ? styles.completed : ''}`}
      data-testid={`cleaning-item-${item.id}`}
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
            aria-label={
              isCompleted
                ? `Desmarcar limpieza ${displayName}`
                : `Completar limpieza ${displayName}`
            }
          />
        </label>

        {/* Puntito sutil de prioridad entre casilla y nombre */}
        <span
          className={`${styles.priorityDot} ${styles['priorityDot_' + (item.prioridad || 'media')]}`}
          data-testid="cleaning-card-priority"
          title={`Prioridad ${item.prioridad || 'media'}`}
          aria-label={`Prioridad ${item.prioridad || 'media'}`}
        />

        <span
          className={`${styles.taskTitle} ${isCompleted ? styles.titleCompleted : ''}`}
          data-testid="cleaning-card-title"
        >
          {displayName}
        </span>

        {/* Menú Contextual de Tarjeta */}
        <CleaningActionMenu
          item={item}
          userId={userId}
          cleaningService={cleaningService}
          onItemUpdated={onItemUpdated}
          onItemDeleted={onItemDeleted}
        />
      </div>

      {/* Toast empático de reversión ante fallo */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className={styles.toastAlert}
          data-testid="cleaning-card-toast"
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
