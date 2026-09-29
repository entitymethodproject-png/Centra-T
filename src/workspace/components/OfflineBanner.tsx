import React from 'react';
import styles from './OfflineBanner.module.css';

export interface OfflineBannerProps {
  isOffline: boolean;
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  message = 'Modo sin conexión: la aplicación está en modo solo lectura. Las modificaciones y creaciones están deshabilitadas hasta restablecer la red.',
}) => {
  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={styles.bannerContainer}
      data-testid="offline-banner"
    >
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <span className={styles.message}>{message}</span>
    </div>
  );
};
