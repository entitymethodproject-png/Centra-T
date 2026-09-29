import React, { useState, useEffect } from 'react';
import styles from './ItemsAccordion.module.css';
import { Item, ItemModulo } from '../entities/item.entity';
import { ItemsService } from '../services/items.service';
import { ItemCreationWizard } from './ItemCreationWizard';
import { ItemCard } from './ItemCard';
import {
  BulkShoppingDragPayload,
  DRAG_TRANSFER_MIME,
} from '../../calendar-sync/types/drag-drop.types';

export interface ItemsAccordionProps {
  modulo?: ItemModulo;
  title?: string;
  items?: Item[];
  itemsService?: ItemsService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  isOffline?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onCreateClick?: () => void;
  onItemCreated?: (item: Item) => void;
  onItemUpdated?: (item: Item) => void;
  onItemDeleted?: (id: string) => void;
  onItemToggle?: (id: string, newStatus?: boolean) => void;
  onRetry?: () => void;

  // Propiedades retrocompatibles para tasks/shopping/cleaning accordions:
  tasks?: Item[];
  tasksService?: ItemsService;
  onCreateTaskClick?: () => void;
  onTaskCreated?: (item: Item) => void;
  onTaskUpdated?: (item: Item) => void;
  onTaskDeleted?: (id: string) => void;
  onTaskToggle?: (id: string, newStatus?: boolean) => void;

  shoppingService?: ItemsService;
  onCreateItemClick?: () => void;

  cleaningService?: ItemsService;
}

export const ItemsAccordion: React.FC<ItemsAccordionProps> = ({
  modulo = 'tasks',
  title,
  items: propItems,
  tasks: propTasks,
  itemsService,
  tasksService,
  shoppingService,
  cleaningService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  isOffline = false,
  onToggleExpand,
  onCreateClick,
  onCreateTaskClick,
  onCreateItemClick,
  onItemCreated,
  onTaskCreated,
  onItemUpdated,
  onTaskUpdated,
  onItemDeleted,
  onTaskDeleted,
  onItemToggle,
  onTaskToggle,
  onRetry,
}) => {
  const activeService = itemsService || tasksService || shoppingService || cleaningService;
  const initialItems = propItems !== undefined ? propItems : propTasks;

  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<Item[]>(initialItems || []);
  const [prevPropItems, setPrevPropItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  if (initialItems !== prevPropItems) {
    setPrevPropItems(initialItems);
    setItems(initialItems || []);
  }

  useEffect(() => {
    if (initialItems !== undefined) {
      setItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (activeService && userId && initialItems === undefined) {
      setIsLoading(true);
      setError(null);
      activeService
        .findAllByUser(userId, modulo)
        .then((loaded) => setItems(loaded))
        .catch(() => setError(`Error al cargar los elementos de ${modulo}`))
        .finally(() => setIsLoading(false));
    }
  }, [activeService, userId, initialItems, modulo]);

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleOpenWizard = () => {
    const trigger = onCreateClick || onCreateTaskClick || onCreateItemClick;
    if (trigger) {
      trigger();
    } else {
      setIsWizardOpen(true);
    }
  };

  const notifyCreated = onItemCreated || onTaskCreated;
  const notifyUpdated = onItemUpdated || onTaskUpdated;
  const notifyDeleted = onItemDeleted || onTaskDeleted;
  const notifyToggle = onItemToggle || onTaskToggle;

  const handleCreated = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    setIsWizardOpen(false);
    if (notifyCreated) {
      notifyCreated(newItem);
    }
  };

  const handleUpdated = (updatedItem: Item) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    if (notifyUpdated) {
      notifyUpdated(updatedItem);
    }
  };

  const handleDeleted = (deletedId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId));
    if (notifyDeleted) {
      notifyDeleted(deletedId);
    }
  };

  const handleToggle = (itemId: string) => {
    if (notifyToggle) {
      notifyToggle(itemId);
    }
  };

  const pendingCount = items.filter(
    (i) => !i.completado && !i.comprado && !i.fechaProgramada
  ).length;

  const handleBulkDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const payload: BulkShoppingDragPayload = {
      id: 'bulk-shopping',
      modulo: 'shopping',
      titulo: 'Compra Semanal',
      isBulk: true,
      pendingCount,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const defaultTitle =
    modulo === 'tasks' ? 'Tareas' : modulo === 'shopping' ? 'Compra' : 'Limpieza';
  const displayTitle = title || defaultTitle;

  const headerTestId = `${modulo}-accordion-header`;
  const listTestId = `${modulo}-populated-list`;
  const skeletonTestId = `${modulo}-skeleton`;
  const errorTestId = `${modulo}-error-state`;
  const emptyTestId = `${modulo}-empty-state`;
  const createButtonTestId = `${modulo === 'tasks' ? 'task' : modulo}-create-button`;

  const ariaCreateLabel =
    modulo === 'shopping'
      ? 'Crear nuevo producto'
      : modulo === 'cleaning'
      ? 'Crear nueva limpieza'
      : 'Crear nueva tarea';

  const emptyTitleText =
    modulo === 'shopping'
      ? 'No hay productos en la lista de compra'
      : modulo === 'cleaning'
      ? 'No hay tareas de limpieza'
      : 'No tienes tareas pendientes';

  const emptySubtitleText =
    modulo === 'shopping'
      ? 'Añade productos para organizar tu compra'
      : modulo === 'cleaning'
      ? 'Añade tareas para organizar la limpieza de casa'
      : 'Añade tareas para organizarte en casa';

  const emptyCtaText =
    modulo === 'shopping'
      ? '+ Crear Producto'
      : modulo === 'cleaning'
      ? '+ Crear Limpieza'
      : '+ Crear Tarea';

  const emptyIcon = modulo === 'shopping' ? '🛒' : modulo === 'cleaning' ? '🧹' : '📋';

  return (
    <div className={styles.accordionContainer} data-testid={`${modulo}-accordion`}>
      {/* Cabecera del Acordeón */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className={`${styles.header} ${!isExpanded ? styles.headerCollapsed : ''}`}
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        data-testid={headerTestId}
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>
            {displayTitle} ({items.length})
          </h3>
          {modulo === 'shopping' && pendingCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              draggable={true}
              onDragStart={handleBulkDragStart}
              onClick={(e) => e.stopPropagation()}
              className={styles.bulkDragHandle}
              title="Arrastrar lista de compra al calendario"
              data-testid="shopping-bulk-drag-handle"
            >
              ⠿
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isOffline}
          aria-disabled={isOffline}
          className={`${styles.newButton} ${isOffline ? styles.newButtonDisabled : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOffline) {
              handleOpenWizard();
            }
          }}
          aria-label={ariaCreateLabel}
          title={isOffline ? 'Creación deshabilitada en modo sin conexión' : ariaCreateLabel}
          data-testid={createButtonTestId}
        >
          +
        </button>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid={skeletonTestId}>
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid={errorTestId}>
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className={styles.emptyContainer} data-testid={emptyTestId}>
              <div className={styles.emptyIcon} aria-hidden="true">
                {emptyIcon}
              </div>
              <p className={styles.emptyTitle}>{emptyTitleText}</p>
              <p className={styles.emptySubtitle}>{emptySubtitleText}</p>
              <button
                type="button"
                onClick={handleOpenWizard}
                className={styles.emptyCtaButton}
              >
                {emptyCtaText}
              </button>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <ul className={styles.taskList} role="list" data-testid={listTestId}>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  itemsService={activeService}
                  onToggleOptimistic={(id) => handleToggle(id)}
                  onItemUpdated={handleUpdated}
                  onItemDeleted={handleDeleted}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal Wizard de Creación en 3 Pasos */}
      <ItemCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        userId={userId}
        itemsService={activeService}
        modulo={modulo}
        onItemCreated={handleCreated}
      />
    </div>
  );
};
