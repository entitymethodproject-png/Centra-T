import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
