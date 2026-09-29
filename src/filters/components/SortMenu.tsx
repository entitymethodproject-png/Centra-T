import React, { useEffect } from 'react';
import '../../theme/tokens.css';
import styles from './SortMenu.module.css';
import {
  SortConfiguration,
  SORT_OPTIONS,
  SortOptionDescriptor,
} from '../types/sort.types';

export interface SortMenuProps {
  isOpen: boolean;
  activeConfig: SortConfiguration;
  onClose: () => void;
  onSelectOption: (config: SortConfiguration) => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export const SortMenu: React.FC<SortMenuProps> = ({
  isOpen,
  activeConfig,
  onClose,
  onSelectOption,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelect = (option: SortOptionDescriptor) => {
    onSelectOption(option.config);
    onClose();
  };

  const isOptionActive = (option: SortOptionDescriptor): boolean => {
    return (
      activeConfig.field === option.config.field &&
      activeConfig.direction === option.config.direction
    );
  };

  return (
    <>
      <div
        className={styles.backdrop}
        data-testid="sort-menu-backdrop"
        onClick={handleBackdropClick}
      />
      <div
        role="menu"
        aria-label="Opciones de ordenación"
        className={styles.menuPopover}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = isOptionActive(opt);
          return (
            <button
              key={opt.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <span>{opt.label}</span>
              {active && <span className={styles.checkIcon} aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </>
  );
};
