import React, { useState, useEffect } from 'react';
import '../../theme/tokens.css';
import styles from './TopNavbar.module.css';

export interface UserProfileData {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface TopNavbarProps {
  user?: UserProfileData;
  onLogout?: () => void;
  'data-testid'?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user = { name: 'Usuario Demo' },
  onLogout,
  'data-testid': testId,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={styles.navbarWrapper}
      data-testid={testId || 'navbar-wrapper'}
    >
      <div className={styles.brandSection}>
        <span className={styles.brandTitle}>Centra-T</span>
      </div>

      <div className={styles.controlsSection}>
        <div
          role="status"
          aria-live="polite"
          className={`${styles.networkBadge} ${isOnline ? styles.online : styles.offline}`}
        >
          <span className={styles.networkDot} />
          <span className={styles.networkLabel}>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        <div className={styles.profileSection} aria-label="Perfil de usuario">
          <div className={styles.avatarCircle} aria-hidden="true">
            {avatarInitial}
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>

        <button
          type="button"
          aria-label="Cerrar sesión"
          className={styles.logoutButton}
          onClick={onLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
