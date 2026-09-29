import React, { useState, useEffect } from 'react';
import styles from './ShoppingAccordion.module.css';
import { ShoppingItem } from '../../shopping/entities/shopping-item.entity';
import { ShoppingService } from '../../shopping/services/shopping.service';
import { ShoppingCreationWizard } from '../../shopping/components/ShoppingCreationWizard';
import { ShoppingCard } from '../../shopping/components/ShoppingCard';

export interface ShoppingAccordionProps {
  items?: ShoppingItem[];
  shoppingService?: ShoppingService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onToggleExpand?: (expanded: boolean) => void;
  onCreateItemClick?: () => void;
  onItemCreated?: (item: ShoppingItem) => void;
  onItemUpdated?: (item: ShoppingItem) => void;
  onItemDeleted?: (itemId: string) => void;
  onItemToggle?: (itemId: string, newStatus?: boolean) => void;
  onRetry?: () => void;
}

export const ShoppingAccordion: React.FC<ShoppingAccordionProps> = ({
  items: propItems,
  shoppingService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onCreateItemClick,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
  onItemToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<ShoppingItem[]>(propItems || []);
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
    if (shoppingService && userId && propItems === undefined) {
      setIsLoading(true);
      setError(null);
      shoppingService
        .findAllByUser(userId)
        .then((data) => setItems(data))
        .catch(() => setError('Error al cargar la lista de compra'))
        .finally(() => setIsLoading(false));
    }
  }, [shoppingService, userId, propItems]);

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

  const handleItemCreated = (newItem: ShoppingItem) => {
    setItems((prev) => [newItem, ...prev]);
    setIsWizardOpen(false);
    if (onItemCreated) {
      onItemCreated(newItem);
    }
  };

  const handleItemUpdated = (updatedItem: ShoppingItem) => {
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
    <div className={styles.accordionContainer} data-testid="shopping-accordion">
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
        data-testid="shopping-accordion-header"
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>Compra ({items.length})</h3>
        </div>

        <button
          type="button"
          className={styles.newButton}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWizard();
          }}
          aria-label="Crear nuevo producto"
          title="Crear nuevo producto"
          data-testid="shopping-create-button"
        >
          +
        </button>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* Skeleton Screen */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="shopping-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* Estado de Error */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="shopping-error-state">
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
            <div className={styles.emptyContainer} data-testid="shopping-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">
                🛒
              </div>
              <p className={styles.emptyTitle}>No hay productos en la lista de compra</p>
              <p className={styles.emptySubtitle}>Añade productos para organizar tu compra</p>
              <button
                type="button"
                onClick={handleOpenWizard}
                className={styles.emptyCtaButton}
              >
                + Crear Producto
              </button>
            </div>
          )}

          {/* Populated List con ShoppingCard */}
          {!isLoading && !error && items.length > 0 && (
            <ul className={styles.shoppingList} role="list" data-testid="shopping-populated-list">
              {items.map((item) => (
                <ShoppingCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  shoppingService={shoppingService}
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
      <ShoppingCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        userId={userId}
        shoppingService={shoppingService}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
};
