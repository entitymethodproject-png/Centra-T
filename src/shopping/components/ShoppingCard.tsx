import React, { useState, useEffect } from 'react';
import styles from './ShoppingCard.module.css';
import { ShoppingItem } from '../entities/shopping-item.entity';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingActionMenu } from './ShoppingActionMenu';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../../calendar-sync/types/drag-drop.types';

export interface ShoppingCardProps {
  item: ShoppingItem;
  userId?: string;
  shoppingService?: ShoppingService;
  onToggleOptimistic?: (itemId: string, newStatus: boolean) => void;
  onItemUpdated?: (updatedItem: ShoppingItem) => void;
  onItemDeleted?: (itemId: string) => void;
  onRollback?: (revertedItem: ShoppingItem) => void;
  isDraggable?: boolean;
}

export const ShoppingCard: React.FC<ShoppingCardProps> = ({
  item,
  userId = 'usr-demo-elena-001',
  shoppingService,
  onToggleOptimistic,
  onItemUpdated,
  onItemDeleted,
  onRollback,
  isDraggable = true,
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(item.completado || !!item.comprado);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsCompleted(item.completado || !!item.comprado);
  }, [item.completado, item.comprado]);

  const handleToggle = async () => {
    if (isSyncing) return;

    const previousStatus = isCompleted;
    const newStatus = !previousStatus;

    setIsCompleted(newStatus);
    setToastMessage(null);

    if (onToggleOptimistic) {
      onToggleOptimistic(item.id, newStatus);
    }

    if (shoppingService && userId) {
      setIsSyncing(true);
      try {
        const updated = await shoppingService.toggleBoughtStatus(userId, item.id);
        setIsSyncing(false);
        if (onItemUpdated) {
          onItemUpdated(updated);
        }
      } catch {
        setIsCompleted(previousStatus);
        setIsSyncing(false);
        setToastMessage('No se pudo actualizar el estado del producto. Se ha revertido el cambio.');
        if (onRollback) {
          onRollback({ ...item, completado: previousStatus, comprado: previousStatus });
        }
      }
    } else {
      if (onItemUpdated) {
        onItemUpdated({ ...item, completado: newStatus, comprado: newStatus });
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
      modulo: 'shopping',
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
      data-testid={`shopping-item-${item.id}`}
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
                ? `Desmarcar producto ${displayName}`
                : `Comprar producto ${displayName}`
            }
          />
        </label>

        {/* Puntito sutil de prioridad entre casilla y nombre */}
        <span
          className={`${styles.priorityDot} ${styles['priorityDot_' + (item.prioridad || 'media')]}`}
          data-testid="shopping-card-priority"
          title={`Prioridad ${item.prioridad || 'media'}`}
          aria-label={`Prioridad ${item.prioridad || 'media'}`}
        />

        <span
          className={`${styles.taskTitle} ${isCompleted ? styles.titleCompleted : ''}`}
          data-testid="shopping-card-title"
        >
          {displayName}
        </span>

        {/* Menú Contextual de Tarjeta */}
        <ShoppingActionMenu
          item={item}
          userId={userId}
          shoppingService={shoppingService}
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
          data-testid="shopping-card-toast"
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
