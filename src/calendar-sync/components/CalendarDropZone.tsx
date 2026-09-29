import React, { useState } from 'react';
import styles from './CalendarDropZone.module.css';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../types/drag-drop.types';

export interface CalendarDropZoneProps {
  dateString: string;
  isPast?: boolean;
  isCurrentMonth?: boolean;
  children?: React.ReactNode;
  onItemDrop?: (item: DragItemPayload, targetDate: string) => void;
  className?: string;
}

export const CalendarDropZone: React.FC<CalendarDropZoneProps> = ({
  dateString,
  isPast = false,
  children,
  onItemDrop,
  className,
}) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isPast) {
      e.dataTransfer.dropEffect = 'none';
      if (!isBlocked) setIsBlocked(true);
      if (isOver) setIsOver(false);
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (isPast) {
      e.dataTransfer.dropEffect = 'none';
      setIsBlocked(true);
      setIsOver(false);
      return;
    }
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Prevenir falsos positivos al moverse sobre elementos hijos
    const relatedTarget = e.relatedTarget as Node | null;
    if (e.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsOver(false);
    setIsBlocked(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setIsBlocked(false);

    // Decisión 1A / Caso VV-002: Bloqueo inflexible de fechas pasadas
    if (isPast) {
      return;
    }

    const rawData =
      e.dataTransfer.getData(DRAG_TRANSFER_MIME) ||
      e.dataTransfer.getData('text/plain');

    if (!rawData) {
      return;
    }

    try {
      const payload = JSON.parse(rawData) as DragItemPayload;
      if (payload && payload.id && payload.modulo) {
        onItemDrop?.(payload, dateString);
      }
    } catch {
      // Descarte inofensivo ante payloads corruptos
    }
  };

  const combinedClasses = [
    styles.dropZone,
    isOver ? styles.dropZoneActive : '',
    isBlocked ? styles.dropZonePastBlocked : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={combinedClasses}
      data-testid={`calendar-drop-zone-${dateString}`}
      data-date={dateString}
      data-drop-blocked={isBlocked ? 'true' : undefined}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};
