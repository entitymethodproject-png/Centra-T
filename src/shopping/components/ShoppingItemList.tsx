import React, { useState } from 'react';
import styles from './ShoppingItemList.module.css';
import { ShoppingItem } from '../entities/shopping-item.entity';

export interface ShoppingItemListProps {
  items: ShoppingItem[];
  onToggleItem: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  defaultCollapsedBought?: boolean;
}

export const ShoppingItemList: React.FC<ShoppingItemListProps> = ({
  items,
  onToggleItem,
  defaultCollapsedBought = false,
}) => {
  const [isBoughtCollapsed, setIsBoughtCollapsed] = useState(defaultCollapsedBought);

  const pendingItems = items.filter((item) => !item.comprado);
  const boughtItems = items.filter((item) => item.comprado);

  return (
    <div className={styles.container} data-testid="shopping-populated-list">
      {/* 1. Lista de Productos Pendientes (Modo Compra Activa) */}
      {pendingItems.length > 0 ? (
        <ul className={styles.itemList} role="list" aria-label="Productos pendientes">
          {pendingItems.map((item) => (
            <li
              key={item.id}
              className={styles.itemRow}
              data-testid={`shopping-item-${item.id}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggleItem(item.id)}
                  className={styles.checkbox}
                  aria-label={`Comprar producto ${item.nombre}`}
                />
              </label>

              <span className={styles.itemName}>{item.nombre}</span>

              <span className={styles.quantityBadge}>
                {item.cantidad} {item.unidad}
              </span>
            </li>
          ))}
        </ul>
      ) : boughtItems.length > 0 ? (
        <div className={styles.allBoughtNotice} data-testid="shopping-all-bought-notice">
          <span className={styles.allBoughtIcon} aria-hidden="true">✓</span>
          <span className={styles.allBoughtText}>¡Todos los productos han sido comprados!</span>
        </div>
      ) : null}

      {/* 2. Sección Secundaria Colapsable de Comprados */}
      {boughtItems.length > 0 && (
        <div className={styles.boughtSection} data-testid="shopping-bought-section">
          <button
            type="button"
            className={styles.boughtHeader}
            onClick={() => setIsBoughtCollapsed(!isBoughtCollapsed)}
            aria-expanded={!isBoughtCollapsed}
            data-testid="shopping-bought-toggle"
          >
            <div className={styles.boughtHeaderLeft}>
              <span
                className={`${styles.boughtChevron} ${!isBoughtCollapsed ? styles.boughtChevronOpen : ''}`}
                aria-hidden="true"
              >
                ▶
              </span>
              <span className={styles.boughtTitle}>
                Comprados ({boughtItems.length})
              </span>
            </div>
            <span className={styles.boughtBadge}>
              {boughtItems.length} {boughtItems.length === 1 ? 'adquirido' : 'adquiridos'}
            </span>
          </button>

          {!isBoughtCollapsed && (
            <ul
              className={styles.boughtList}
              role="list"
              aria-label="Productos comprados"
              data-testid="shopping-bought-list"
            >
              {boughtItems.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.itemRow} ${styles.boughtRow}`}
                  data-testid={`shopping-item-${item.id}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => onToggleItem(item.id)}
                      className={styles.checkbox}
                      aria-label={`Desmarcar producto ${item.nombre}`}
                    />
                  </label>

                  <span className={`${styles.itemName} ${styles.boughtName}`}>
                    {item.nombre}
                  </span>

                  <span className={`${styles.quantityBadge} ${styles.boughtQuantityBadge}`}>
                    {item.cantidad} {item.unidad}
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
