'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App').then((mod) => mod.App), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0F17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      Cargando Centra-T...
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
