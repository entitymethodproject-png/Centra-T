import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  isOpen: boolean;
  type?: 'error' | 'warning' | 'info' | 'success';
  what: string;
  why: string;
  action: string;
  onClose: () => void;
  autoCloseMs?: number;
  'data-testid'?: string;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  type = 'error',
  what,
  why,
  action,
  onClose,
  autoCloseMs = 5000,
  'data-testid': testId = 'toast-notification',
}) => {
  useEffect(() => {
    if (!isOpen || autoCloseMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid={testId}
      className={`${styles.toastContainer} ${styles['toast_' + type]}`}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon} aria-hidden="true">
            {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <strong className={styles.whatText} data-testid="toast-what">
            {what}
          </strong>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Cerrar notificación"
          data-testid="toast-close-btn"
        >
          &times;
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.whyText} data-testid="toast-why">
          {why}
        </p>
      </div>

      <div className={styles.footer}>
        <p className={styles.actionText} data-testid="toast-action">
          {action}
        </p>
      </div>
    </div>
  );
};
