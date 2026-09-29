import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @ts-expect-error Component not yet implemented (TDD Fase RED)
import { TopNavbar } from './TopNavbar';

describe('PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe renderizar la marca "Centra-T", el avatar y el nombre de usuario por defecto', () => {
    render(<TopNavbar />);

    expect(screen.getByText('Centra-T')).toBeInTheDocument();
    expect(screen.getByText('Usuario Demo')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('debe renderizar datos personalizados de usuario si se proporcionan', () => {
    render(
      <TopNavbar
        user={{
          name: 'Manuel Dev',
          email: 'manuel@example.com',
        }}
      />
    );

    expect(screen.getByText('Manuel Dev')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('debe mostrar la píldora de red inicialmente en estado Online', () => {
    render(<TopNavbar />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveTextContent(/online/i);
  });

  it('debe conmutar dinámicamente el badge de Online a Offline y viceversa ante eventos del navegador', () => {
    render(<TopNavbar />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent(/online/i);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(badge).toHaveTextContent(/offline/i);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(badge).toHaveTextContent(/online/i);
  });

  it('debe disparar el callback onLogout al pulsar el botón de cerrar sesión', async () => {
    const user = userEvent.setup();
    const onLogoutMock = vi.fn();

    render(<TopNavbar onLogout={onLogoutMock} />);

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    expect(onLogoutMock).toHaveBeenCalledTimes(1);
  });

  it('debe limpiar los event listeners al desmontar el componente para evitar fugas de memoria', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<TopNavbar />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
