import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
// @ts-expect-error Component not yet implemented (TDD Fase RED)
import { WorkspaceLayout } from './WorkspaceLayout';

describe('PVF-A01.01 · WorkspaceLayout (Shell Base y Topología Espacial de 2 Columnas)', () => {
  it('debe renderizar sin errores los placeholders por defecto', () => {
    render(<WorkspaceLayout />);

    expect(screen.getByTestId('navbar-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('hub-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('workbench-placeholder')).toBeInTheDocument();
  });

  it('debe contener los roles semánticos banner, complementary y main con accesibilidad', () => {
    render(<WorkspaceLayout />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /hub lateral/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /lienzo de trabajo/i })).toBeInTheDocument();
  });

  it('debe permitir la inyección de nodos en los slots navbarSlot, hubSlot y workbenchSlot', () => {
    render(
      <WorkspaceLayout
        navbarSlot={<div data-testid="custom-navbar">Custom Navbar</div>}
        hubSlot={<div data-testid="custom-hub">Custom Hub</div>}
        workbenchSlot={<div data-testid="custom-workbench">Custom Workbench</div>}
      />
    );

    expect(screen.getByTestId('custom-navbar')).toHaveTextContent('Custom Navbar');
    expect(screen.getByTestId('custom-hub')).toHaveTextContent('Custom Hub');
    expect(screen.getByTestId('custom-workbench')).toHaveTextContent('Custom Workbench');

    expect(screen.queryByTestId('navbar-placeholder')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hub-placeholder')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workbench-placeholder')).not.toBeInTheDocument();
  });

  it('debe poseer estructura de contención perimetral (workspaceShell)', () => {
    const { container } = render(<WorkspaceLayout />);
    const shellElement = container.firstChild as HTMLElement;

    expect(shellElement).toBeInTheDocument();
    expect(shellElement.tagName.toLowerCase()).toBe('div');
  });
});
