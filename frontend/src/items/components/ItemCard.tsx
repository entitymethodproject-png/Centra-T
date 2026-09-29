import React, { useState, useEffect } from 'react';
import styles from './ItemCard.module.css';
import { Item } from '../entities/item.entity';
import { type PolymorphicItemsService } from '../services/items.service';
import { ItemActionMenu } from './ItemActionMenu';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../../calendar-sync/types/drag-drop.types';

export interface ItemCardProps {
  item?: Item;
  task?: Item; // alias retrocompatible
  userId?: string;
  itemsService?: PolymorphicItemsService;
  tasksService?: PolymorphicItemsService; // alias retrocompatible
  shoppingService?: PolymorphicItemsService; // alias retrocompatible
  cleaningService?: PolymorphicItemsService; // alias retrocompatible
  onToggleOptimistic?: (itemId: string, newStatus: boolean) => void;
  onItemUpdated?: (updatedItem: Item) => void;
  onTaskUpdated?: (updatedTask: Item) => void; // alias retrocompatible
  onItemDeleted?: (itemId: string) => void;
  onTaskDeleted?: (itemId: string) => void; // alias retrocompatible
  onRollback?: (revertedItem: Item) => void;
  isDraggable?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item: propItem,
  task: propTask,
  userId = 'usr-demo-elena-001',
  itemsService,
  tasksService,
  shoppingService,
  cleaningService,
  onToggleOptimistic,
  onItemUpdated,
  onTaskUpdated,
  onItemDeleted,
  onTaskDeleted,
  onRollback,
  isDraggable = true,
}) => {
  const currentItem = propItem || propTask!;
  const service = itemsService || tasksService || shoppingService || cleaningService;
  const notifyUpdated = onItemUpdated || onTaskUpdated;
  const notifyDeleted = onItemDeleted || onTaskDeleted;

  const modulo = currentItem?.modulo || 'tasks';
  const initialCompleted = currentItem
    ? modulo === 'shopping'
      ? Boolean(currentItem.completado || currentItem.comprado)
      : Boolean(currentItem.completado)
    : false;

  const [isCompleted, setIsCompleted] = useState<boolean>(initialCompleted);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentItem) return;
    const completed =
      modulo === 'shopping'
        ? Boolean(currentItem.completado || currentItem.comprado)
        : Boolean(currentItem.completado);
    setIsCompleted(completed);
  }, [currentItem?.completado, currentItem?.comprado, currentItem, modulo]);

  if (!currentItem) return null;

  const displayName = currentItem.titulo || currentItem.nombre || '';

  const handleToggle = async () => {
    if (isSyncing) return;

    const previousStatus = isCompleted;
    const newStatus = !previousStatus;

    setIsCompleted(newStatus);
    setToastMessage(null);

    if (onToggleOptimistic) {
      onToggleOptimistic(currentItem.id, newStatus);
    }

    if (service && userId) {
      setIsSyncing(true);
      try {
        let updated: Item | undefined;
        if (modulo === 'shopping') {
          if (typeof service.toggleBoughtStatus === 'function') {
            updated = (await service.toggleBoughtStatus(userId, currentItem.id)) as Item;
          } else if (typeof service.toggleItemStatus === 'function') {
            updated = await service.toggleItemStatus(userId, currentItem.id);
          }
        } else if (modulo === 'cleaning') {
          if (typeof service.updateItem === 'function') {
            updated = await service.updateItem(userId, currentItem.id, { completado: newStatus });
          } else if (typeof service.toggleTaskStatus === 'function') {
            updated = (await service.toggleTaskStatus(userId, currentItem.id)) as Item;
          } else if (typeof service.toggleItemStatus === 'function') {
            updated = await service.toggleItemStatus(userId, currentItem.id);
          }
        } else {
          // tasks
          if (typeof service.toggleTaskStatus === 'function') {
            updated = (await service.toggleTaskStatus(userId, currentItem.id)) as Item;
          } else if (typeof service.toggleItemStatus === 'function') {
            updated = await service.toggleItemStatus(userId, currentItem.id);
          }
        }
        setIsSyncing(false);
        if (notifyUpdated && updated) {
          notifyUpdated(updated);
        }
      } catch {
        setIsCompleted(previousStatus);
        setIsSyncing(false);

        const rollbackText =
          modulo === 'shopping'
            ? 'No se pudo actualizar el estado del producto. Se ha revertido el cambio.'
            : modulo === 'cleaning'
            ? 'No se pudo actualizar el estado de la tarea de limpieza. Se ha revertido el cambio.'
            : 'No se pudo actualizar el estado de la tarea. Se ha revertido el cambio.';

        setToastMessage(rollbackText);

        if (onRollback) {
          onRollback({
            ...currentItem,
            completado: previousStatus,
            comprado: previousStatus,
          });
        }
      }
    } else if (!onToggleOptimistic) {
      if (notifyUpdated) {
        notifyUpdated({
          ...currentItem,
          completado: newStatus,
          comprado: newStatus,
        });
      }
    }
  };

  const handleDismissToast = () => {
    setToastMessage(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    const payload: DragItemPayload = {
      id: currentItem.id,
      modulo,
      titulo: displayName,
      prioridad: currentItem.prioridad || 'media',
      completado: isCompleted,
      fechaProgramada: currentItem.fechaProgramada ? String(currentItem.fechaProgramada) : null,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const itemTestId =
    modulo === 'tasks'
      ? `task-card-${currentItem.id}`
      : modulo === 'shopping'
      ? `shopping-item-${currentItem.id}`
      : `cleaning-item-${currentItem.id}`;

  const priorityTestId =
    modulo === 'tasks'
      ? 'task-card-priority'
      : modulo === 'shopping'
      ? 'shopping-card-priority'
      : 'cleaning-card-priority';

  const titleTestId =
    modulo === 'tasks'
      ? 'task-card-title'
      : modulo === 'shopping'
      ? 'shopping-card-title'
      : 'cleaning-card-title';

  const toastTestId =
    modulo === 'tasks'
      ? 'task-card-toast'
      : modulo === 'shopping'
      ? 'shopping-card-toast'
      : 'cleaning-card-toast';

  const checkboxAriaLabel =
    modulo === 'tasks'
      ? `Completar tarea ${displayName}`
      : modulo === 'shopping'
      ? isCompleted
        ? `Desmarcar producto ${displayName}`
        : `Comprar producto ${displayName}`
      : isCompleted
      ? `Desmarcar limpieza ${displayName}`
      : `Completar limpieza ${displayName}`;

  const priority = currentItem.prioridad || 'media';

  return (
    <li
      className={`${styles.taskItem} ${isCompleted ? styles.completed : ''}`}
      data-testid={itemTestId}
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
            aria-label={checkboxAriaLabel}
          />
        </label>

        <span
          className={`${styles.priorityDot} ${styles['priorityDot_' + priority]}`}
          data-testid={priorityTestId}
          title={`Prioridad ${priority}`}
          aria-label={`Prioridad ${priority}`}
        />

        <span
          className={`${styles.taskTitle} ${isCompleted ? styles.titleCompleted : ''}`}
          data-testid={titleTestId}
        >
          {displayName}
        </span>

        <ItemActionMenu
          item={currentItem}
          userId={userId}
          itemsService={service}
          onItemUpdated={notifyUpdated}
          onItemDeleted={notifyDeleted}
        />
      </div>

      {toastMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className={styles.toastAlert}
          data-testid={toastTestId}
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

// Aliases para retrocompatibilidad
export const TaskCard = ItemCard;
export const ShoppingCard = ItemCard;
export const CleaningCard = ItemCard;
