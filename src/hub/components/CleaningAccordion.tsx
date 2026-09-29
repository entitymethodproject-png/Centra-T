import React, { useState, useEffect } from 'react';
import styles from './CleaningAccordion.module.css';
import { CleaningItem } from '../../cleaning/entities/cleaning-item.entity';
import { CleaningService } from '../../cleaning/services/cleaning.service';
import { CleaningCreationWizard } from '../../cleaning/components/CleaningCreationWizard';
import { CleaningCard } from '../../cleaning/components/CleaningCard';

export interface CleaningAccordionProps {
  items?: CleaningItem[];
  cleaningService?: CleaningService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  isOffline?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onCreateItemClick?: () => void;
  onItemCreated?: (item: CleaningItem) => void;
  onItemUpdated?: (item: CleaningItem) => void;
  onItemDeleted?: (itemId: string) => void;
  onItemToggle?: (itemId: string, newStatus?: boolean) => void;
  onRetry?: () => void;
}

export const CleaningAccordion: React.FC<CleaningAccordionProps> = ({
  items: propItems,
  cleaningService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  isOffline = false,
  onToggleExpand,
  onCreateItemClick,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
  onItemToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<CleaningItem[]>(propItems || []);
  const [prevPropItems, setPrevPropItems] = useState(propItems);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Sincronizar props cuando cambian en fase de render para reactividad inmediata
  if (propItems !== prevPropItems) {
    setPrevPropItems(propItems);
    setItems(propItems || []);
  }

  useEffect(() => {
    if (propItems !== undefined) {
      setItems(propItems);
    }
  }, [propItems]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (cleaningService && userId && propItems === undefined) {
      setIsLoading(true);
      setError(null);
      cleaningService
        .findAllByUser(userId)
        .then((data) => setItems(data))
        .catch(() => setError('Error al cargar tareas de limpieza'))
        .finally(() => setIsLoading(false));
    }
  }, [cleaningService, userId, propItems]);

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleOpenWizard = () => {
    if (onCreateItemClick) {
      onCreateItemClick();
    } else {
      setIsWizardOpen(true);
    }
  };

  const handleItemCreated = (newItem: CleaningItem) => {
    setItems((prev) => [newItem, ...prev]);
    setIsWizardOpen(false);
    if (onItemCreated) {
      onItemCreated(newItem);
    }
  };

  const handleItemUpdated = (updatedItem: CleaningItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    if (onItemUpdated) {
      onItemUpdated(updatedItem);
    }
  };

  const handleItemDeleted = (deletedId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId));
    if (onItemDeleted) {
      onItemDeleted(deletedId);
    }
  };

  const handleToggleItem = (itemId: string, newStatus?: boolean) => {
    if (onItemToggle) {
      onItemToggle(itemId, newStatus);
    }
  };

  return (
    <div className={styles.accordionContainer} data-testid="cleaning-accordion">
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
        data-testid="cleaning-accordion-header"
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>Limpieza ({items.length})</h3>
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
          aria-label="Crear nueva tarea de limpieza"
          title={isOffline ? 'Creación deshabilitada en modo sin conexión' : 'Crear nueva tarea de limpieza'}
          data-testid="cleaning-create-button"
        >
          +
        </button>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* Skeleton Screen */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="cleaning-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* Estado de Error */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="cleaning-error-state">
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && (
            <div className={styles.emptyContainer} data-testid="cleaning-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">
                🧹
              </div>
              <p className={styles.emptyTitle}>No hay tareas de limpieza</p>
              <p className={styles.emptySubtitle}>Añade tareas para organizar la limpieza de casa</p>
              <button
                type="button"
                onClick={handleOpenWizard}
                className={styles.emptyCtaButton}
              >
                + Crear Limpieza
              </button>
            </div>
          )}

          {/* Populated List con CleaningCard */}
          {!isLoading && !error && items.length > 0 && (
            <ul className={styles.cleaningList} role="list" data-testid="cleaning-populated-list">
              {items.map((item) => (
                <CleaningCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  cleaningService={cleaningService}
                  onToggleOptimistic={handleToggleItem}
                  onItemUpdated={handleItemUpdated}
                  onItemDeleted={handleItemDeleted}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal Wizard de Creación en 3 Pasos */}
      <CleaningCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        userId={userId}
        cleaningService={cleaningService}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
};
