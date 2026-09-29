import React, { useState, useEffect } from 'react';
import styles from './ShoppingAccordion.module.css';
import { ShoppingItem } from '../../shopping/entities/shopping-item.entity';
import { ShoppingService } from '../../shopping/services/shopping.service';
import { QuickItemInput } from '../../shopping/components/QuickItemInput';

export interface ShoppingAccordionProps {
  items?: ShoppingItem[];
  shoppingService?: ShoppingService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onToggleExpand?: (expanded: boolean) => void;
  onItemCreated?: (item: ShoppingItem) => void;
  onItemToggle?: (itemId: string) => void;
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
  onItemCreated,
  onItemToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<ShoppingItem[]>(propItems || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);

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

  const total = items.length;
  const comprados = items.filter((i) => i.comprado).length;
  const pendientes = total - comprados;

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (onItemToggle) {
      onItemToggle(itemId);
    }

    if (shoppingService && userId) {
      try {
        const updated = await shoppingService.toggleBoughtStatus(userId, itemId);
        setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      } catch {
        // En caso de fallo se preserva el estado
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, comprado: !item.comprado } : item
        )
      );
    }
  };

  const handleQuickAdd = async (dto: { nombre: string; cantidad: number; unidad: string }) => {
    if (shoppingService && userId) {
      try {
        const newItem = await shoppingService.createItem(userId, dto);
        setItems((prev) => [...prev, newItem]);
        if (onItemCreated) onItemCreated(newItem);
      } catch {
        setError('Error al añadir producto');
      }
    } else {
      const mockItem: ShoppingItem = {
        id: crypto.randomUUID(),
        userId,
        modulo: 'shopping',
        nombre: dto.nombre,
        cantidad: dto.cantidad,
        unidad: dto.unidad,
        comprado: false,
        fechaProgramada: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setItems((prev) => [...prev, mockItem]);
      if (onItemCreated) onItemCreated(mockItem);
    }
  };

  return (
    <div className={styles.accordionContainer} data-testid="shopping-accordion">
      {/* Cabecera con Telemetría */}
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
        data-testid="shopping-accordion-header"
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>
            Compra Semanal ({comprados}/{total})
          </h3>
        </div>

        <div className={styles.headerRight}>
          {pendientes > 0 && (
            <span className={styles.pendingBadge} data-testid="shopping-pending-badge">
              {pendientes} pendientes
            </span>
          )}
          <span
            className={styles.dragHandleIcon}
            title="Arrastrar lista de compra al calendario"
            aria-label="Arrastrar compra completa"
          >
            ⋮⋮
          </span>
        </div>
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
              <p className={styles.emptySubtitle}>Añade productos abajo para organizar tu compra</p>
            </div>
          )}

          {/* Populated List */}
          {!isLoading && !error && items.length > 0 && (
            <ul className={styles.shoppingList} role="list" data-testid="shopping-populated-list">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.shoppingItem} ${item.comprado ? styles.completed : ''}`}
                  data-testid={`shopping-item-${item.id}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.comprado}
                      onChange={() => handleToggleItem(item.id)}
                      className={styles.checkbox}
                      aria-label={`Comprar producto ${item.nombre}`}
                    />
                  </label>

                  <span
                    className={`${styles.itemName} ${item.comprado ? styles.nameCompleted : ''}`}
                  >
                    {item.nombre}
                  </span>

                  <span className={styles.quantityBadge}>
                    {item.cantidad} {item.unidad}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Input Rápido Inline en el pie */}
          <div className={styles.footerInputContainer}>
            <QuickItemInput onAddItem={handleQuickAdd} disabled={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};
