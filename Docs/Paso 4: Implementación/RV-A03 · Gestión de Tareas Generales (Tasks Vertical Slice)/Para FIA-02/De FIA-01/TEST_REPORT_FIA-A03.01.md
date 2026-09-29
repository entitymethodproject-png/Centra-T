# TEST REPORT · FIA-A03.01

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A03.01 · Entidad DomesticItem (Task) y Endpoints CRUD
- **Hito de Rebanada:** APERTURA DE RV-A03 Y VALIDACIÓN DEL MOTOR DE TAREAS
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `0a4f3aa`

## 1. Resumen de Ejecución
- **Total de Archivos de Test:** 11
- **Archivos Pasados:** 11
- **Archivos Fallados:** 0
- **Total de Tests:** 68
- **Pasados:** 68
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio de Tareas (`src/tasks/services/tasks.service.test.ts`):** 100% de cobertura (9 tests).
  - Creación con sanitización y valores por defecto (`prioridad: 'media'`, `completado: false`).
  - Validación de título obligatorio y rechazo de espacios vacíos (HTTP 400).
  - Decisión 2B: rechazo de títulos > 120 caracteres (`InvalidTaskTitleError`).
  - Decisión 2B: rechazo de descripciones > 1000 caracteres (`InvalidTaskDescriptionError`).
  - Rechazo de prioridades desconocidas (`InvalidTaskPriorityError`).
  - Aislamiento multi-tenant en `findAllByUser` (filtrado estricto por `userId`).
  - Bloqueo multi-tenant con HTTP 404 (`TaskNotFoundError`) ante intentos de lectura, mutación o borrado de tareas ajenas.
  - Alternancia atómica del estado completado (`toggleTaskStatus`).
  - Actualización selectiva de campos y eliminación definitiva.
- **Capa de Controlador de Tareas (`src/tasks/controllers/tasks.controller.test.ts`):** 100% de cobertura (3 tests).
  - Creación con respuesta HTTP 201 (Created).
  - Listado de tareas del usuario con HTTP 200 (OK).
  - Operaciones de toggle y delete con HTTP 200 (OK).
- **Capa de Autenticación y Usuarios (`src/users/`, `src/authentication/`):** 100% de cobertura (35 tests intactos).
- **Capa de Topología y Layout (`src/workspace/`, `src/hub/`):** 100% de cobertura (14 tests intactos).
- **Capa de Integración Raíz (`src/App.test.tsx`):** 100% de cobertura (7 tests intactos).

## 3. Trazas Relevantes
```text
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 327ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 355ms
 ✓ src/users/services/users.service.test.ts (5 tests) 2248ms
 ✓ src/authentication/views/LoginPage.test.tsx (10 tests) 2296ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 2614ms
 ✓ src/authentication/guards/session-auth.guard.test.ts (6 tests) 3178ms
 ✓ src/authentication/controllers/auth.controller.test.ts (6 tests) 84ms
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 148ms
 ✓ src/App.test.tsx (7 tests) 3392ms
 ✓ src/tasks/services/tasks.service.test.ts (9 tests) 42ms
 ✓ src/tasks/controllers/tasks.controller.test.ts (3 tests) 28ms

 Test Files  11 passed (11)
      Tests  68 passed (68)
   Duration  5.37s
```
