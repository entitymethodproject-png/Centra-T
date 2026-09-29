import React from 'react';
import '../../theme/tokens.css';
import styles from './WorkspaceLayout.module.css';

export interface WorkspaceLayoutProps {
  navbarSlot?: React.ReactNode;
  hubSlot?: React.ReactNode;
  workbenchSlot?: React.ReactNode;
  children?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  navbarSlot,
  hubSlot,
  workbenchSlot,
}) => {
  return (
    <div className={styles.workspaceShell}>
      <header role="banner" className={styles.navbarRegion}>
        {navbarSlot || <div data-testid="navbar-placeholder">TopNavbar (64px)</div>}
      </header>
      <div className={styles.bodyRegion}>
        <aside role="complementary" aria-label="Hub lateral" className={styles.hubRegion}>
          {hubSlot || <div data-testid="hub-placeholder">Hub Lateral (380px)</div>}
        </aside>
        <main role="main" aria-label="Lienzo de trabajo" className={styles.workbenchRegion}>
          {workbenchSlot || <div data-testid="workbench-placeholder">Workbench / Calendario</div>}
        </main>
      </div>
    </div>
  );
};
