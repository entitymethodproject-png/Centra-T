import React, { useEffect, useRef } from 'react';
import styles from './ReassignmentConfirmModal.module.css';

export interface ReassignmentConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  originDate: string;
  targetDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReassignmentConfirmModal: React.FC<ReassignmentConfirmModalProps> = ({
  isOpen,
  itemTitle,
  originDate,
  targetDate,
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reassign-modal-title"
      aria-describedby="reassign-modal-desc"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="reassign-modal-title" className={styles.title}>
          Conflicto de Programación
        </h3>
        <p id="reassign-modal-desc" className={styles.description}>
          Esta tarea (<strong className={styles.itemName}>{itemTitle}</strong>) ya está asignada al{' '}
          <strong className={styles.dateBadge}>{originDate}</strong>.
          <br />
          ¿Deseas moverla al <strong className={styles.dateBadge}>{targetDate}</strong>?
        </p>
        <div className={styles.actionButtons}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Mantener fecha
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Mover fecha
          </button>
        </div>
      </div>
    </div>
  );
};
