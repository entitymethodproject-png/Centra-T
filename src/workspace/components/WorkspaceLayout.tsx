import React from 'react';
import '../../theme/tokens.css';
import styles from './WorkspaceLayout.module.css';
import { HubContainer } from '../../hub/components/HubContainer';
import { TopNavbar } from './TopNavbar';

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
        {navbarSlot || <TopNavbar data-testid="navbar-placeholder" />}
      </header>
      <div className={styles.bodyRegion}>
        {hubSlot !== undefined ? (
          hubSlot
        ) : (
          <HubContainer>
            <div data-testid="hub-placeholder">Hub Lateral (380px)</div>
          </HubContainer>
        )}
        <main role="main" aria-label="Lienzo de trabajo" className={styles.workbenchRegion}>
          {workbenchSlot || <div data-testid="workbench-placeholder">Workbench / Calendario</div>}
        </main>
      </div>
    </div>
  );
};
