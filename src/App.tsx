import React, { useState } from 'react';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';

export interface AppProps {
  initialAuthenticated?: boolean;
}

export const App: React.FC<AppProps> = ({ initialAuthenticated = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initialAuthenticated) return true;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('centrat_auth') === 'true';
    }
    return false;
  });

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('centrat_auth', 'true');
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('centrat_auth');
    }
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToWorkspace={handleLoginSuccess}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <WorkspaceLayout
      navbarSlot={
        <TopNavbar
          user={{ name: 'Usuario Centra-T' }}
          onLogout={handleLogout}
        />
      }
    />
  );
};
