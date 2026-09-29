import type { Metadata } from 'next';
import '../theme/tokens.css';

export const metadata: Metadata = {
  title: 'Centra-T · Gestor Doméstico Integral',
  description: 'Planificador temporal interactivo y gestor de tareas domésticas, compras y limpieza',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
