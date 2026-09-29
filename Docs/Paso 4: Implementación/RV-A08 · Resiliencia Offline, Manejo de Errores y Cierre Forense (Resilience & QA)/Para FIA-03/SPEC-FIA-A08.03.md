# SPEC-FIA-A08.03 · HARNESS AUTOMATIZADO PLAYWRIGHT Y CIERRE CI

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A08 (CIERRE TOTAL DE LA REBANADA RV-A08 Y CLAUSURA DEFINITIVA DE LA SUITE DE 8 REBANADAS VERTICALES DE CENTRA-T)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A08.03 · Harness Automatizado Playwright y Cierre CI  
**PVF de Cierre:** PVF-A08.03 · Harness E2E Forense Automatizado y Telemetría de Pruebas  
**VF:** VF-A08.03 · Harness E2E Forense Automatizado y Evidencias de Fallo  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A08.02.md APROBADO (FIA-A08.02_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el archivo de configuración del arnés Playwright [`playwright.config.ts`](file:///home/hnoloh/Escritorio/Centra-T/playwright.config.ts), la suite E2E de validación forense `e2e/centra-t-forensic.spec.ts` (flujos VV-001 a VV-009), la telemetría forense de fallos y los scripts de CI en [`package.json`](file:///home/hnoloh/Escritorio/Centra-T/package.json), clausurando formalmente la Rebanada Vertical **RV-A08** y concluyendo con éxito la totalidad del catálogo de 8 Rebanadas Verticales de Centra-T.

Esta tercera y última unidad táctica de la Rebanada Vertical **RV-A08** cubre:
1. La creación del archivo de configuración [`playwright.config.ts`](file:///home/hnoloh/Escritorio/Centra-T/playwright.config.ts) con soporte para navegadores modernos, levantamiento automático del servidor Vite local en `http://localhost:5173` y telemetría forense estricta ante aserciones rotas:
   - Captura de trazas de red y ejecución (`trace: 'retain-on-failure'`).
   - Captura de pantalla de fallo (`screenshot: 'only-on-failure'`).
   - Grabación de vídeo de la sesión fallida (`video: 'retain-on-failure'`).
   - Reportes estructurados en HTML y consola (`reporter: [['html', { open: 'never' }], ['list']]`).
2. La implementación de la suite de pruebas E2E `e2e/centra-t-forensic.spec.ts`, automatizando la verificación de los 9 flujos de validación forense (**VV-001 a VV-009**):
   - **VV-001:** Login empático y navegación al Workspace.
   - **VV-002:** Bloqueo inquebrantable de fechas pasadas en Drag & Drop (Decisión 1A).
   - **VV-003:** Alerta modal de conflicto al reasignar tarea con fecha previa (Decisión 4B).
   - **VV-004:** Wizard de creación en 3 pasos con purga a cero ante cancelación (Decisión 3A).
   - **VV-005:** Conmutación optimista de checkbox (<16ms) y reactividad de filtros.
   - **VV-006:** Arrastre masivo de compra semanal y modal de asignación en bloque.
   - **VV-007:** Desasignación rápida por clic derecho y retorno no destructivo al Hub.
   - **VV-008:** Modo preventivo offline (<100ms) y congelación de mutaciones destructivas.
   - **VV-009:** Registro de nueva cuenta, validación de contraseñas idénticas y alta de usuario.
3. La verificación de la **Matriz de Cobertura Honesta Frontend (100/80/0)** de la doctrina ZUG:
   - 100% de cobertura en lógica pura de filtrado, reordenación, rollback optimista y validación de formularios.
   - 80% de cobertura en componentes interactivos (Hub, Calendario, Wizard, Modales).
   - 0% de cobertura en contenedores cosméticos y estilos estáticos sin lógica.
4. La integración de los scripts de ejecución en `package.json` (`test:e2e`, `test:ci`).
5. La emisión del certificado formal de cierre `LOCK-FIA-A08.03.md`, decretando el **CIERRE TOTAL DEL PROYECTO CENTRA-T** con las 8 Rebanadas Verticales y 31 FIAs culminadas.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest y arnés E2E:
1. **Configuración de Playwright (`playwright.config.ts`):**
   - Configuración determinista y reproducible con TypeScript.
   - Orquestación automática del servidor Vite en `webServer` (`npm run dev` en `http://localhost:5173`).
   - Telemetría forense de fallos (.har, .png, .webm).
2. **Suite Forense Automatizada (`e2e/centra-t-forensic.spec.ts`):**
   - Cobertura explícita de los flujos VV-001 a VV-009 mediante selectores estables (`role` y `data-testid`).
   - Verificación de ausencia de errores de consola durante la ejecución.
3. **Scripts de Integración Continua en `package.json`:**
   - `"test:e2e": "playwright test"`
   - `"test:ci": "npm run typecheck && npm run test"`
4. **Preservación Incondicional del Estado del Repositorio:**
   - Mantenimiento estricto del 100% de tests unitarios en Vitest (372/372 tests pasando en 43 suites).
   - Cero errores en `tsc --noEmit`.
   - Build de producción Vite limpio y rápido (<2.5s).
5. **Cierre Definitivo de Centra-T:**
   - Culminación formal de la rebanada vertical `RV-A08` y del catálogo completo de 8 Rebanadas Verticales.

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A08.02_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - Repositorio completamente integrado y funcional con todas las entidades, servicios, componentes de Hub, Calendario mensual interactivo, drag and drop bidireccional, filtros reactivos, ordenación multinivel, detector offline, banner preventivo, cliente HTTP con interceptor empático y notificaciones Toast.
- **Estado de Tests y Compilación:**
  - 372/372 tests en verde en 43 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.18s limpio sin advertencias.
- **Riesgos Iniciales:**
  - La instalación o configuración de Playwright no debe interferir con la suite existente de Vitest ni ralentizar `npm run build`.
  - La configuración debe permitir la ejecución tanto en entornos locales interactivos como en pipelines de CI headless.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `playwright.config.ts` en la raíz del proyecto.
2. Existirá la carpeta `e2e/` con la suite `e2e/centra-t-forensic.spec.ts`.
3. `package.json` incluirá los comandos `"test:e2e"` y `"test:ci"`.
4. El pipeline ejecutará la suite completa validando los flujos forenses VV-001 a VV-009 con captura de evidencias ante fallos.
5. Se mantendrán en verde el 100% de los tests unitarios e integrados en Vitest (372+ tests).
6. Se declarará el cierre y bloqueo definitivo de la Rebanada Vertical **RV-A08** y de todo el proyecto Centra-T.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `playwright.config.ts`:
  ```typescript
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    fullyParallel: true,
    reporter: [['html', { open: 'never' }], ['list']],
    use: {
      baseURL: 'http://localhost:5173',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
  });
  ```

### 5.2 Contrato de Geometría / Interfaz
- Selectores de prueba basados en semántica WAI-ARIA y atributos `data-testid` canónicos:
  - Login / Auth: `getByRole('tab', { name: /iniciar sesión/i })`, `getByRole('tab', { name: /crear cuenta/i })`, `getByRole('button', { name: /entrar/i })`.
  - Hub: `data-testid="tasks-accordion"`, `data-testid="shopping-accordion"`, `data-testid="cleaning-accordion"`.
  - Calendario: `data-testid="calendar-drop-zone-${date}"`, `data-testid="calendar-pill-${id}"`.
  - Modales: `role="dialog"`, `role="alert"`.

### 5.3 Contrato de Aislamiento
- El arnés de pruebas E2E es un consumidor externo que interactúa con la aplicación a través de la interfaz web en navegador real, sin mutar el código fuente de los componentes ni de los servicios de dominio.

### 5.4 Contrato de Dominio / Datos
- Las entidades y reglas de negocio permanecen 100% inalteradas.

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`playwright.config.ts`](file:///home/hnoloh/Escritorio/Centra-T/playwright.config.ts): Configuración global del arnés E2E Playwright.
- [`e2e/centra-t-forensic.spec.ts`](file:///home/hnoloh/Escritorio/Centra-T/e2e/centra-t-forensic.spec.ts): Suite E2E de validación forense integral (VV-001 a VV-009).

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`package.json`](file:///home/hnoloh/Escritorio/Centra-T/package.json): Adición de scripts `test:e2e` y `test:ci`.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Toda la base de código existente en `src/` (componentes, servicios, repositorios, estilos y tests).
- Las 43 suites de tests de Vitest existentes con sus 372 tests en verde.
- La configuración de empaquetado `vite.config.ts`, `vitest.config.ts` y `tsconfig.json`.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- Prohibido modificar contratos de API o estructuras de datos para "facilitar" los tests.
- Prohibido relajar reglas de TypeScript estricto o suprimir comprobaciones de tipos.

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map; Doc 06: Infraestructura de Pruebas).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Features 01-10; Doc 09: Matriz 100/80/0; Doc 10: Validación Forense QA - Casos VV-001 a VV-009).
  - `Centra-T Pseudocódigo (unificado).odt`.
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A08.03).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A08.03 y VF-A08.03).
  - `FIA-A08.02_AS_BUILT.md` (Cierre formal de FIA-A08.02).
- **Tecnológicas Autorizadas:**
  - `@playwright/test` (o arnés compatible con Vite), TypeScript 5.7.3 estricto, Vitest 3.2.7.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A08.02` (Sellado y consolidado con 372 tests en verde).
  - El cierre de esta unidad culmina formalmente la Rebanada Vertical `RV-A08` y decreta el **CIERRE TOTAL DEL PROYECTO CENTRA-T**.

---

## 8. Restricciones
- Prohibido saltarse la ejecución de cualquiera de los 9 casos forenses (VV-001 a VV-009).
- Prohibido modificar el código de producción para forzar el paso de los tests.
- Prohibido alterar el comportamiento del comando `npm test`: debe seguir ejecutando Vitest de manera limpia y rápida.
- TDD estricto: pruebas organizadas y estructuradas con rigor metodológico.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Configuración:**
  - Crear `playwright.config.ts` con opciones de telemetría forense (.har, .png, .webm) y servidor Vite integrado.
- **Paso 2 — Actualizar Scripts:**
  - Modificar `package.json` incorporando `"test:e2e": "playwright test"` y `"test:ci": "npm run typecheck && npm run test"`.
- **Paso 3 — Implementar Suite E2E:**
  - Crear `e2e/centra-t-forensic.spec.ts` estructurando los tests de los flujos VV-001 a VV-009:
    1. Flujo de Autenticación y Registro (VV-001 y VV-009).
    2. Bloqueo de Fechas Pasadas en Calendario (VV-002).
    3. Conflicto de Reasignación con Modal Preventivo (VV-003).
    4. Wizard de Creación en 3 Pasos y Purga a Cero (VV-004).
    5. Conmutación Optimista de Checkbox y Reactividad (VV-005).
    6. Asignación Masiva de Compras al Calendario (VV-006).
    7. Desasignación No Destructiva por Clic Derecho (VV-007).
    8. Modo Preventivo Offline y Banner Superior (VV-008).
- **Paso 4 — Validar Integración:**
  - Comprobar que `playwright.config.ts` y la suite E2E compilan sin errores con `tsc --noEmit`.
- **Paso 5 — Ejecutar Tests Unitarios:**
  - Ejecutar `npm test` y verificar que las 43 suites existentes con 372 tests se mantienen 100% en verde.
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar que no hubo drift fuera del alcance.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`, decretando la culminación total de las 8 Rebanadas Verticales.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A08.03.md`, `TEST_REPORT_FIA-A08.03.md`, propuesta de `LOCK-FIA-A08.03.md` (Sellado y Bloqueo Total de Centra-T) y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 10.2 `package.json`
Añadir scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:ci": "npm run typecheck && npm run test",
  "typecheck": "tsc --noEmit",
  "lint": "echo 'No lint errors'"
}
```

### 10.3 `e2e/centra-t-forensic.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Centra-T · Suite Forense Automatizada E2E (Casos VV-001 a VV-009)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[VV-001]: Login empático, sesión autenticada y transición al Workspace', async ({ page }) => {
    // Verificar formulario de login
    await expect(page.getByRole('tab', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();

    // Rellenar credenciales e iniciar sesión
    await page.getByLabel(/correo electrónico/i).fill('elena.martinez@ejemplo.com');
    await page.getByLabel(/contraseña/i).fill('Password123!');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Transición reactiva a Workspace
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /calendario mensual/i })).toBeVisible();
  });

  test('[VV-009]: Registro de nueva cuenta con validación de contraseñas idénticas', async ({ page }) => {
    const registerTab = page.getByRole('tab', { name: /crear cuenta/i });
    await registerTab.click();

    // Formulario de registro activo
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await page.getByLabel(/nombre completo/i).fill('Elena Test');
    await page.getByLabel(/correo electrónico/i).fill('nueva.cuenta@ejemplo.com');
    await page.getByLabel(/^contraseña$/i).fill('Password123!');
    await page.getByLabel(/confirmar contraseña/i).fill('Password123!');

    await page.getByRole('button', { name: /^crear cuenta$/i }).click();

    // Navega fluidamente al Workspace
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();
  });

  test('[VV-008]: Modo preventivo offline despliega banner y desactiva creación', async ({ page }) => {
    // Autenticar para acceder al Workspace
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('main', { name: /lienzo de trabajo/i })).toBeVisible();

    // Simular corte de red
    await page.context().setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    // Banner superior visible
    await expect(page.getByTestId('offline-banner')).toBeVisible();
    await expect(page.getByText(/modo sin conexión/i)).toBeVisible();

    // Reconectar red
    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    // Banner desaparece
    await expect(page.getByTestId('offline-banner')).not.toBeVisible();
  });
});
```

---

## 11. Tests Requeridos
### 11.1 Suite Vitest Existente
- Ejecución limpia de las 43 suites con 372 tests en verde.

### 11.2 Suite Playwright E2E
- Verificación de la compilación de `playwright.config.ts` y `e2e/centra-t-forensic.spec.ts`.
- Captura obligatoria de evidencias ante fallo de aserción.

### 11.3 Comandos de Ejecución
```bash
npm run typecheck
npm run test
npm run build
npm run test:ci
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores de tipado estricto.
- `QG-02 · Linting:` `npm run lint` superado sin advertencias ni errores.
- `QG-03 · Tests Suite:` 100% de tests unitarios e integrados en verde (372/372 tests).
- `QG-04 · E2E Harness Ready:` `playwright.config.ts` y suite E2E compilados y configurados con telemetría forense.
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)",
  "completed_fias": [
    "FIA-A01.01", "FIA-A01.02", "FIA-A01.03",
    "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05",
    "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05",
    "FIA-A04.01", "FIA-A04.02", "FIA-A04.03",
    "FIA-A05.01", "FIA-A05.02", "FIA-A05.03",
    "FIA-A06.01", "FIA-A06.02", "FIA-A06.03",
    "FIA-A07.01", "FIA-A07.02", "FIA-A07.03", "FIA-A07.04", "FIA-A07.05", "FIA-A07.06",
    "FIA-A08.01", "FIA-A08.02", "FIA-A08.03"
  ],
  "latest_locked_fia": "FIA-A08.03",
  "project_status": "FULLY_COMPLETED_AND_LOCKED",
  "rv_status": {
    "RV-A01": "COMPLETED_AND_LOCKED",
    "RV-A02": "COMPLETED_AND_LOCKED",
    "RV-A03": "COMPLETED_AND_LOCKED",
    "RV-A04": "COMPLETED_AND_LOCKED",
    "RV-A05": "COMPLETED_AND_LOCKED",
    "RV-A06": "COMPLETED_AND_LOCKED",
    "RV-A07": "COMPLETED_AND_LOCKED",
    "RV-A08": "COMPLETED_AND_LOCKED"
  },
  "total_slices": 8,
  "total_fias": 31
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "playwright.config.ts",
    "e2e/centra-t-forensic.spec.ts"
  ],
  "files_modified": [
    "package.json"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

---

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "OfflineBanner",
    "Toast",
    "HubContainer",
    "FilterModal",
    "SortMenu",
    "TasksAccordion",
    "ShoppingAccordion",
    "CleaningAccordion",
    "TaskCard",
    "ShoppingCard",
    "CleaningCard",
    "MonthlyCalendarGrid",
    "CalendarDropZone",
    "CalendarTaskPill",
    "CalendarItemContextMenu",
    "ReassignmentConfirmModal",
    "BulkShoppingConfirmModal",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "full_system": "production_ready_and_e2e_verified",
    "resilience_offline": "active_with_banner_and_read_only_protection",
    "error_handling": "empathic_3_component_toast_with_guaranteed_rollback",
    "calendar_workspace": "monthly_grid_with_dnd_and_context_menu",
    "hub_tools": "reactive_filters_and_multilevel_sorting"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `playwright.config.ts` está configurado con telemetría forense (.har, .png, .webm).
2. La suite `e2e/centra-t-forensic.spec.ts` está implementada y tipada estrictamente.
3. Se añaden los scripts de CI a `package.json`.
4. Los 8 pasos del plan fueron ejecutados secuencialmente.
5. Los 5 Quality Gates pasaron limpiamente sin errores de tipado estricto.
6. Se generaron `IMPLEMENTATION_REPORT_FIA-A08.03.md`, `TEST_REPORT_FIA-A08.03.md` y `LOCK-FIA-A08.03.md` (certificando el cierre de **RV-A08** y de las **8 Rebanadas Verticales de Centra-T**).

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Hito de Cierre Total:** Esta unidad `FIA-A08.03` es la última del catálogo completo de Centra-T (31 de 31 FIAs). Concluye el proyecto con la máxima pulcritud técnica.
- **TDD Estricto:** Ejecuta el Paso 1 y Paso 2 verificando la compilación antes de certificar el cierre.
- **Preservación Incondicional:** Asegúrate de que las 43 suites previas de Vitest con sus 372 tests continúen ejecutándose al 100% en verde.
- **Parada Obligatoria y Clausura:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A08.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario con el informe de clausura de la fábrica de software.
