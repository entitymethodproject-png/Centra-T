import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopNavbar } from './TopNavbar';

describe('PVF-A01.03 · TopNavbar (Barra de Navegación Superior)', () => {
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

  it('debe disparar el callback onLogout al pulsar el botón de cerrar sesión', async () => {
    const user = userEvent.setup();
    const onLogoutMock = vi.fn();

    render(<TopNavbar onLogout={onLogoutMock} />);

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutBtn);

    expect(onLogoutMock).toHaveBeenCalledTimes(1);
  });
});
