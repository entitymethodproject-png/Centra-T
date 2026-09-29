import React, { useEffect, useRef } from 'react';
import styles from './BulkShoppingConfirmModal.module.css';

export interface BulkShoppingConfirmModalProps {
  isOpen: boolean;
  pendingCount: number;
  targetDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkShoppingConfirmModal: React.FC<BulkShoppingConfirmModalProps> = ({
  isOpen,
  pendingCount,
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
      aria-labelledby="bulk-shopping-modal-title"
      aria-describedby="bulk-shopping-modal-desc"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="bulk-shopping-modal-title" className={styles.title}>
          Programar Compra Semanal
        </h3>
        <p id="bulk-shopping-modal-desc" className={styles.description}>
          ¿Asignar el <strong className={styles.dateBadge}>{targetDate}</strong> como día de compra para{' '}
          <strong className={styles.countBadge}>{pendingCount}</strong> productos pendientes?
        </p>
        <div className={styles.actionButtons}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Asignar Fecha a Todos
          </button>
        </div>
      </div>
    </div>
  );
};
