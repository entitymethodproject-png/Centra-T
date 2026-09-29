import React from 'react';
import styles from './CalendarTaskPill.module.css';
import { ItemModule, ItemPriority, DRAG_TRANSFER_MIME, DragItemPayload } from '../types/drag-drop.types';

export interface CalendarTaskPillProps {
  id: string;
  titulo: string;
  prioridad: ItemPriority;
  modulo: ItemModule;
  completado?: boolean;
  fechaProgramada?: string | Date | null;
  isDraggable?: boolean;
  isBulk?: boolean;
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
  fechaProgramada = null,
  isDraggable = true,
  isBulk = false,
  onClick,
}) => {
  const moduleInitial = MODULE_INITIALS[modulo] || 'T';

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;
    const dateStr =
      fechaProgramada instanceof Date
        ? fechaProgramada.toISOString().slice(0, 10)
        : fechaProgramada || null;
    const payload: DragItemPayload = {
      id,
      modulo,
      titulo,
      prioridad,
      completado: Boolean(completado),
      fechaProgramada: dateStr,
      isBulk,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`${styles.pillContainer} ${isBulk ? styles.bulkShoppingPill : ''}`}
      data-testid={`calendar-pill-${id}`}
      data-item-id={id}
      data-modulo={modulo}
      data-is-bulk={isBulk ? 'true' : undefined}
      draggable={isDraggable}
      onDragStart={handleDragStart}
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
