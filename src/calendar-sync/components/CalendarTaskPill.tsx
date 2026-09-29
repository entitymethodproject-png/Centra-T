import React from 'react';
import styles from './CalendarTaskPill.module.css';
import { ItemModule, ItemPriority } from '../types/drag-drop.types';

export interface CalendarTaskPillProps {
  id: string;
  titulo: string;
  prioridad: ItemPriority;
  modulo: ItemModule;
  completado?: boolean;
  onClick?: (id: string) => void;
}

const MODULE_INITIALS: Record<ItemModule, string> = {
  tasks: 'T',
  shopping: 'C',
  cleaning: 'L',
};

export const CalendarTaskPill: React.FC<CalendarTaskPillProps> = ({
  id,
  titulo,
  prioridad,
  modulo,
  completado = false,
  onClick,
}) => {
  const moduleInitial = MODULE_INITIALS[modulo] || 'T';

  return (
    <div
      className={styles.pillContainer}
      data-testid={`calendar-pill-${id}`}
      data-item-id={id}
      data-modulo={modulo}
      onClick={() => onClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(id);
        }
      }}
    >
      <span
        className={`${styles.priorityDot} ${styles['priorityDot_' + prioridad]}`}
        data-testid="calendar-pill-dot"
        aria-label={`Prioridad ${prioridad}`}
      />
      <span
        className={styles.moduleBadge}
        data-testid="calendar-pill-module"
        aria-label={`Módulo ${modulo}`}
      >
        {moduleInitial}
      </span>
      <span
        className={`${styles.pillTitle} ${completado ? styles.completedTitle : ''}`}
        title={titulo}
      >
        {titulo}
      </span>
    </div>
  );
};
