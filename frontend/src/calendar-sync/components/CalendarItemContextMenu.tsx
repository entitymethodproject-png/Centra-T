import React, { useEffect } from 'react';
import styles from './CalendarItemContextMenu.module.css';
import { ItemModule } from '../types/drag-drop.types';

export interface CalendarItemContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  itemId: string;
  modulo: ItemModule;
  itemTitle: string;
  onUnschedule: (itemId: string, modulo: ItemModule) => void;
  onClose: () => void;
}

export const CalendarItemContextMenu: React.FC<CalendarItemContextMenuProps> = ({
  isOpen,
  position,
  itemId,
  modulo,
  itemTitle,
  onUnschedule,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        data-testid="context-menu-backdrop"
      />
      <div
        className={styles.menuContainer}
        role="menu"
        aria-label={`Opciones de ${itemTitle}`}
        data-testid="calendar-item-context-menu"
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          data-testid="context-menu-unschedule-btn"
          onClick={() => onUnschedule(itemId, modulo)}
        >
          <span className={styles.icon} aria-hidden="true">
            ↩
          </span>
          <span className={styles.label}>Mover a Sin Asignar</span>
        </button>
      </div>
    </>
  );
};
