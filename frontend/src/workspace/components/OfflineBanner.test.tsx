import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner Component (Resiliencia Offline / VV-008)', () => {
  it('no renderiza nada en el DOM cuando isOffline es false', () => {
    render(<OfflineBanner isOffline={false} />);
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('renderiza el banner con role status y texto predeterminado cuando isOffline es true', () => {
    render(<OfflineBanner isOffline={true} />);

    const banner = screen.getByTestId('offline-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(
      screen.getByText(
        /Modo sin conexión: la aplicación está en modo solo lectura\. Las modificaciones y creaciones están deshabilitadas hasta restablecer la red\./i
      )
    ).toBeInTheDocument();
  });

  it('permite sobreescribir el mensaje informativo mediante la prop message', () => {
    const customMessage = 'Aviso: sin conexión al servidor central.';
    render(<OfflineBanner isOffline={true} message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
