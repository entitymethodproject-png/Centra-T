# TEST REPORT · FIA-A04.01

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A04.01 · Módulo Backend Shopping y Asignación Grupal
- **Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)
- **Hito de Rebanada:** VALIDACIÓN DE DOMINIO, REPOSITORIO, SERVICIO Y ENDPOINTS CRUD CON ASIGNACIÓN GRUPAL
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `104022b`

---

## 1. Resumen de Ejecución

- **Total de Archivos de Test:** 17
- **Archivos Pasados:** 17
- **Archivos Fallados:** 0
- **Total de Tests:** 115
- **Pasados:** 115
- **Fallados:** 0
- **Saltados / Ignorados:** 0

---

## 2. Cobertura Obtenida

- **Capa de Servicio de Shopping (`src/shopping/services/shopping.service.test.ts`):** 100% de cobertura (8 tests).
  1. Creación de ítem con valores por defecto (`cantidad: 1`, `unidad: 'ud'`, `comprado: false`).
  2. Rechazo de nombres vacíos o > 120 caracteres (**Decisión 2B**).
  3. Rechazo de cantidades `<= 0` o NaN.
  4. Rechazo de fechas pasadas anteriores al día actual (**Decisión 1A**).
  5. Aislamiento estricto de productos por `userId`.
  6. Conmutación de estado comprado mediante `toggleBoughtStatus`.
  7. Lanzamiento de `ShoppingItemNotFoundError` ante elementos inexistentes.
  8. **Asignación grupal bulk-schedule:** Programación masiva de todos los productos pendientes (`comprado: false`) sin alterar los ya comprados.
- **Capa de Controlador de Shopping (`src/shopping/controllers/shopping.controller.test.ts`):** 100% de cobertura (4 tests).
  1. `POST /shopping`: 201 Created al crear un ítem válido.
  2. `GET /shopping`: 200 OK con la lista de productos del tenant.
  3. `PATCH /shopping/:id/toggle`: 200 OK tras conmutar estado.
  4. `POST /shopping/schedule-all`: 200 OK con conteo de programados en bloque.
- **Suites Previas Preservadas (Sin Regresión):**
  - Tareas y Acordeón (`src/tasks/*`, `src/hub/*`): 49 tests intactos.
  - Autenticación, Usuarios, Workspace y Shell: 54 tests intactos.

---

## 3. Trazas Relevantes

```text
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 418ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 503ms
 ✓ src/users/services/users.service.test.ts (5 tests) 2200ms
 ✓ src/authentication/views/LoginPage.test.tsx (10 tests) 2410ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 2850ms
 ✓ src/authentication/guards/session-auth.guard.test.ts (6 tests) 3495ms
 ✓ src/authentication/controllers/auth.controller.test.ts (6 tests) 96ms
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 258ms
 ✓ src/App.test.tsx (9 tests) 5928ms
 ✓ src/tasks/services/tasks.service.test.ts (9 tests) 20ms
 ✓ src/tasks/controllers/tasks.controller.test.ts (3 tests) 8ms
 ✓ src/hub/components/TasksAccordion.test.tsx (7 tests) 808ms
 ✓ src/tasks/components/TaskCreationWizard.test.tsx (10 tests) 4424ms
 ✓ src/tasks/components/TaskCard.test.tsx (7 tests) 777ms
 ✓ src/tasks/components/TaskActionMenu.test.tsx (9 tests) 1152ms
 ✓ src/shopping/services/shopping.service.test.ts (8 tests) 19ms
 ✓ src/shopping/controllers/shopping.controller.test.ts (4 tests) 10ms

 Test Files  17 passed (17)
      Tests  115 passed (115)
   Duration  8.25s
```
