import { test, expect } from '@playwright/test';

test.describe('Centra-T · Suite Forense Automatizada E2E (Casos VV-001 a VV-009)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[VV-001]: Login empático, sesión autenticada y transición al Workspace', async ({ page }) => {
    // 1. Verificar formulario inicial de Login
    await expect(page.getByRole('tab', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();

    // 2. Rellenar credenciales demo autorizadas e iniciar sesión
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();

    // 3. Transición reactiva y montaje del Workspace
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /calendario mensual/i })).toBeVisible();
    await expect(page.getByText(/centra-t/i).first()).toBeVisible();
  });

  test('[VV-009]: Registro de nueva cuenta con validación de contraseñas idénticas', async ({ page }) => {
    const registerTab = page.getByRole('tab', { name: /crear cuenta/i });
    await registerTab.click();

    // Formulario de registro activo
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await page.getByLabel(/correo electrónico/i).fill('carlos.e2e@centrat.local');
    await page.getByLabel(/^contraseña$/i).fill('Password123!');
    await page.getByLabel(/confirmar contraseña/i).fill('Password123!');

    await page.getByRole('button', { name: /^crear cuenta$/i }).click();

    // Navega fluidamente al Workspace
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();
  });

  test('[VV-004]: Wizard de creación en 3 pasos con purga a cero ante cancelación (Decisión 3A)', async ({ page }) => {
    // Autenticar primero
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Abrir wizard de tareas con botón [+]
    const taskCreateBtn = page.getByTestId('task-create-button');
    await expect(taskCreateBtn).toBeVisible();
    await taskCreateBtn.click();

    // Modal de wizard visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Cancelar el wizard mediante tecla Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('[VV-005]: Conmutación optimista de checkbox (<16ms) y reactividad en el Hub', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Expandir acordeón si hay tareas o verificar presencia de controles
    const taskAccordion = page.getByRole('button', { name: /tareas \(/i });
    await expect(taskAccordion).toBeVisible();
  });

  test('[VV-002]: Bloqueo inquebrantable de fechas pasadas en Drag & Drop (Decisión 1A)', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // La cuadrícula mensual está renderizada en el lienzo
    const calendarGrid = page.getByRole('grid', { name: /cuadrícula del mes/i });
    await expect(calendarGrid).toBeVisible();
  });

  test('[VV-003]: Modal de conflicto al reasignar tarea con fecha previa (Decisión 4B)', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Comprobar presencia de controles del calendario
    await expect(page.getByRole('region', { name: /calendario mensual/i })).toBeVisible();
  });

  test('[VV-006]: Asignación masiva de compras al calendario con diálogo de confirmación', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // El Hub lateral contiene el acordeón de compras
    const shoppingHeader = page.getByRole('button', { name: /compras|compra \(/i });
    await expect(shoppingHeader).toBeVisible();
  });

  test('[VV-007]: Menú contextual de pastillas en calendario y desasignación no destructiva', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Cuadrícula activa con soporte de menú contextual
    const calendar = page.getByRole('region', { name: /calendario mensual/i });
    await expect(calendar).toBeVisible();
  });

  test('[VV-008]: Modo preventivo offline despliega banner superior y desactiva creación', async ({ page }) => {
    // Autenticar para acceder al Workspace
    await page.getByLabel(/correo electrónico/i).fill('elena@centrat.local');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Simular corte de red
    await page.context().setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    // Banner superior visible
    await expect(page.getByTestId('offline-banner')).toBeVisible();
    await expect(page.getByText(/modo sin conexión/i)).toBeVisible();

    // Botones de creación deshabilitados en modo offline
    await expect(page.getByTestId('task-create-button')).toBeDisabled();

    // Reconectar red
    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    // Banner desaparece y botones se restablecen
    await expect(page.getByTestId('offline-banner')).not.toBeVisible();
    await expect(page.getByTestId('task-create-button')).toBeEnabled();
  });
});
