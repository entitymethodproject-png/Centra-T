import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
}

export function useNetworkStatus(initialOnline?: boolean): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (initialOnline !== undefined) return initialOnline;
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
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

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
