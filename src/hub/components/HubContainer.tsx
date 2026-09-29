import React, { useState } from 'react';
import '../../theme/tokens.css';
import styles from './HubContainer.module.css';

export interface HubContainerProps {
  children?: React.ReactNode;
  initialCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export const HubContainer: React.FC<HubContainerProps> = ({
  children,
  initialCollapsed = false,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Hub lateral"
      className={`${styles.hubContainer} ${isCollapsed ? styles.collapsed : styles.expanded}`}
    >
      <div className={styles.toggleBar}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
          className={styles.toggleButton}
          onClick={handleToggle}
        >
          <span className={styles.toggleIcon}>{isCollapsed ? '›' : '‹'}</span>
        </button>
      </div>
      <div className={styles.contentArea}>
        {children}
      </div>
    </aside>
  );
};
