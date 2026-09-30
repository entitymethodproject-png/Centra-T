import React, { useEffect, useState, useRef } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: position.x, y: position.y });

  useEffect(() => {
    if (!isOpen) return;

    // Dimensiones estimadas para clamping de seguridad en viewport
    const menuWidth = 200;
    const menuHeight = 52;
    const margin = 12;

    const safeX =
      typeof window !== 'undefined'
        ? Math.max(margin, Math.min(position.x, window.innerWidth - menuWidth - margin))
        : position.x;

    const safeY =
      typeof window !== 'undefined'
        ? Math.max(margin, Math.min(position.y, window.innerHeight - menuHeight - margin))
        : position.y;

    setCoords({ x: safeX, y: safeY });
  }, [isOpen, position.x, position.y]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
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
        ref={menuRef}
        className={styles.menuContainer}
        role="menu"
        aria-label={`Opciones de ${itemTitle}`}
        data-testid="calendar-item-context-menu"
        style={{ top: `${coords.y}px`, left: `${coords.x}px` }}
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
