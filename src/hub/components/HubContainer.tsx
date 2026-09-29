import React, { useState } from 'react';
import '../../theme/tokens.css';
import styles from './HubContainer.module.css';

export interface HubContainerProps {
  children?: React.ReactNode;
  initialCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  onClearFilters?: () => void;
  activeFilterCount?: number;
  onSortClick?: () => void;
}

export const HubContainer: React.FC<HubContainerProps> = ({
  children,
  initialCollapsed = false,
  onToggle,
  onFilterClick,
  isFilterActive = false,
  onClearFilters,
  activeFilterCount = 0,
  onSortClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Hub lateral"
      className={`${styles.hubContainer} ${isCollapsed ? styles.collapsed : styles.expanded}`}
    >
      <div className={styles.toggleBar}>
        {!isCollapsed && (
          <div className={styles.filterGroup}>
            <button
              type="button"
              aria-label={activeFilterCount > 0 ? `Filtrar (${activeFilterCount})` : 'Filtrar'}
              className={`${styles.filterButton} ${isFilterActive ? styles.filterButtonActive : ''}`}
              onClick={onFilterClick}
            >
              <span className={styles.filterIcon} aria-hidden="true">🔍</span>
              <span className={styles.filterText}>
                Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </span>
            </button>
            <button
              type="button"
              aria-label="Reordenar"
              className={styles.sortButton}
              onClick={onSortClick}
            >
              <span className={styles.sortIcon} aria-hidden="true">⇅</span>
              <span className={styles.sortText}>Reordenar</span>
            </button>
            {isFilterActive && onClearFilters && (
              <button
                type="button"
                aria-label="Limpiar filtros"
                className={styles.clearFilterButton}
                onClick={onClearFilters}
                title="Restablecer filtros a valores por defecto"
              >
                <span className={styles.clearIcon} aria-hidden="true">✕</span>
                <span className={styles.clearText}>Limpiar</span>
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
          className={styles.toggleButton}
          onClick={handleToggle}
        >
          <span className={styles.toggleIcon}>{isCollapsed ? '›' : '‹'}</span>
        </button>
      </div>
      <div className={styles.contentArea}>
        {children}
      </div>
    </aside>
  );
};
