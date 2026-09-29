import React, { useState } from 'react';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';

export interface AppProps {
  initialAuthenticated?: boolean;
}

export const App: React.FC<AppProps> = ({ initialAuthenticated = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToWorkspace={() => setIsAuthenticated(true)}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <WorkspaceLayout
      navbarSlot={
        <TopNavbar
          user={{ name: 'Usuario Centra-T' }}
          onLogout={() => setIsAuthenticated(false)}
        />
      }
    />
  );
};
