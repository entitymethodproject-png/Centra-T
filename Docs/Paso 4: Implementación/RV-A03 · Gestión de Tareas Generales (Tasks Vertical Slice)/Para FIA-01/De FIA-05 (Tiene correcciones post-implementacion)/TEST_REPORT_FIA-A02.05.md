# TEST REPORT · FIA-A02.05

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A02.05 · Invalidación de Sesión (Logout), AuthGuard y Flujo Interactivo App
- **Hito de Rebanada:** CIERRE DE SUITE GLOBAL DE RV-A02 Y VALIDACIÓN E2E DE FLUJO
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `778c049`

## 1. Resumen de Ejecución
- **Total de Archivos de Test:** 9
- **Archivos Pasados:** 9
- **Archivos Fallados:** 0
- **Total de Tests:** 56
- **Pasados:** 56
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core (`src/users/`):** 100% de cobertura (5 tests).
- **Capa de Topología / Layout (`src/workspace/`, `src/hub/`):** 100% de cobertura (14 tests).
- **Capa de Controladores de Auth (`src/authentication/controllers/`):** 100% de cobertura (6 tests).
- **Capa de Guards de Auth (`src/authentication/guards/`):** 100% de cobertura (6 tests).
- **Capa de UI de Registro (`src/authentication/views/RegisterTab`):** 100% de cobertura (8 tests).
- **Capa de UI de Login (`src/authentication/views/LoginPage`):** 100% de cobertura (10 tests).
  - Incluye test de invocación de `onNavigateToWorkspace` y `onSuccess` tras registro exitoso en `RegisterTab`.
- **Capa de Integración Raíz de App (`src/App.test.tsx`):** 100% de cobertura (7 tests).
  - Garantía de renderizado por defecto de la tarjeta de login con pestañas `[Iniciar Sesión]` y `[Crear Cuenta]` cuando no hay sesión.
  - Garantía de conmutación reactiva y visibilidad del botón `[Crear Cuenta]` y campos de doble contraseña.
  - Garantía de transición al Workspace tras autenticación inicial.
  - Garantía de retorno a la pantalla de Login al pulsar `[Cerrar Sesión]`.
  - Garantía de auto-transición directa al Workspace tras registro exitoso.
  - Garantía de persistencia y montaje directo de Workspace si existe sesión en `sessionStorage` (recarga/F5).
  - Garantía del ciclo completo interactivo: Registro ➔ Workspace ➔ Logout ➔ Login exitoso con credenciales registradas.

## 3. Trazas Relevantes
```text
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 450ms
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 461ms
 ✓ src/users/services/users.service.test.ts (5 tests) 2094ms
 ✓ src/authentication/controllers/auth.controller.test.ts (6 tests) 130ms
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 240ms
 ✓ src/authentication/views/LoginPage.test.tsx (10 tests) 2254ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 2557ms
 ✓ src/authentication/guards/session-auth.guard.test.ts (6 tests) 3099ms
 ✓ src/App.test.tsx (7 tests) 3273ms

 Test Files  9 passed (9)
      Tests  56 passed (56)
   Duration  5.19s
```
