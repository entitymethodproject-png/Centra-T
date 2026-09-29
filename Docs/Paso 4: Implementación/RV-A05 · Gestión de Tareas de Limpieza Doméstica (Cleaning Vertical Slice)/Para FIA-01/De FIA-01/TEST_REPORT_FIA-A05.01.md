# TEST REPORT · FIA-A05.01

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A05.01 · Módulo Backend Cleaning y Cálculo de Recurrencia
- **Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)
- **Hito de Rebanada:** VALIDACIÓN DE DOMINIO, REPOSITORIO, SERVICIO CON RECURRENCIA Y CONTROLADOR REST
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `9ea99ca`

---

## 1. Resumen de Ejecución

- **Total de Archivos de Test:** 22
- **Archivos Pasados:** 22
- **Archivos Fallados:** 0
- **Total de Tests:** 147
- **Pasados:** 147
- **Fallados:** 0
- **Saltados / Ignorados:** 0

---

## 2. Cobertura de las Pruebas Nuevas de Limpieza (13 tests)

### A. Capa de Servicio de Limpieza (`src/cleaning/services/cleaning.service.test.ts` - 9 tests):
1. `1. debe crear una tarea de limpieza calculando proximaFechaSugerida (+7 días para semanal)`: Verifica generación de DTO y cálculo de +604.800.000 ms.
2. `2. debe calcular matemáticamente las frecuencias diaria (+1d), quincenal (+14d) y mensual (+30d)`: Valida la aritmética estricta de fechas sin desvíos.
3. `3. debe rechazar nombres con longitud < 1 o > 120 caracteres bajo Decisión 2B`: Valida el límite de longitud y rechazo de cadenas vacías/espacios.
4. `4. debe rechazar zonas no admitidas fuera del catálogo`: Valida la enumeración estricta de zonas ('cocina', 'baño', 'salon', 'general').
5. `5. debe rechazar frecuencias no válidas`: Valida la enumeración estricta de frecuencias.
6. `6. debe garantizar aislamiento absoluto de tenant por userId`: Comprueba que las tareas del usuario A no son visibles para el usuario B.
7. `7. debe registrar completado (completeTask), fijar lastCompletedAt y recalcular proximaFechaSugerida`: Valida el avance del ciclo de recurrencia al completar la tarea.
8. `8. debe permitir filtrar tareas por zona y frecuencia`: Comprueba el funcionamiento de los filtros en consultas de repositorio y servicio.
9. `9. debe lanzar CleaningItemNotFoundError ante un id inexistente o de otro usuario`: Valida manejo de excepciones 404 ante accesos no autorizados.

### B. Capa de Controlador de Limpieza (`src/cleaning/controllers/cleaning.controller.test.ts` - 4 tests):
1. `1. GET /cleaning debe retornar código 200 y array de tareas`: Verifica respuesta de listado.
2. `2. POST /cleaning debe crear tarea y retornar código 201`: Verifica creación y retorno de la tarea con status 201.
3. `3. POST /cleaning/:id/complete debe retornar código 200 con recurrencia recalculada`: Verifica endpoint de completado y actualización de recurrencia.
4. `4. debe retornar código 400 ante payloads inválidos y 404 ante id inexistente`: Verifica mapeo de códigos HTTP de error.

---

## 3. Preservación de Suites Previas (134 tests sin regresión)

- `src/shopping/components/ShoppingItemList.test.tsx` (6 tests)
- `src/shopping/components/QuickItemInput.test.tsx` (6 tests)
- `src/hub/components/ShoppingAccordion.test.tsx` (7 tests)
- `src/shopping/controllers/shopping.controller.test.ts` (4 tests)
- `src/shopping/services/shopping.service.test.ts` (8 tests)
- `src/tasks/components/TaskActionMenu.test.tsx` (9 tests)
- `src/tasks/components/TaskCard.test.tsx` (7 tests)
- `src/tasks/components/TaskCreationWizard.test.tsx` (10 tests)
- `src/tasks/controllers/tasks.controller.test.ts` (3 tests)
- `src/tasks/services/tasks.service.test.ts` (9 tests)
- `src/hub/components/TasksAccordion.test.tsx` (7 tests)
- `src/hub/components/HubContainer.test.tsx` (4 tests)
- `src/workspace/components/TopNavbar.test.tsx` (6 tests)
- `src/workspace/components/WorkspaceLayout.test.tsx` (4 tests)
- `src/authentication/controllers/auth.controller.test.ts` (6 tests)
- `src/authentication/guards/session-auth.guard.test.ts` (6 tests)
- `src/authentication/views/LoginPage.test.tsx` (10 tests)
- `src/authentication/views/RegisterTab.test.tsx` (8 tests)
- `src/users/services/users.service.test.ts` (5 tests)
- `src/App.test.tsx` (9 tests)

---

## 4. Trazas Relevantes

```text
 ✓ src/hub/components/TasksAccordion.test.tsx (7 tests)
 ✓ src/tasks/components/TaskCard.test.tsx (7 tests)
 ✓ src/shopping/components/ShoppingItemList.test.tsx (6 tests)
 ✓ src/hub/components/HubContainer.test.tsx (4 tests)
 ✓ src/hub/components/ShoppingAccordion.test.tsx (7 tests)
 ✓ src/App.test.tsx (9 tests)
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests)
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests)
 ✓ src/authentication/controllers/auth.controller.test.ts (6 tests)
 ✓ src/tasks/services/tasks.service.test.ts (9 tests)
 ✓ src/cleaning/services/cleaning.service.test.ts (9 tests)
 ✓ src/shopping/services/shopping.service.test.ts (8 tests)
 ✓ src/shopping/controllers/shopping.controller.test.ts (4 tests)
 ✓ src/tasks/controllers/tasks.controller.test.ts (3 tests)
 ✓ src/cleaning/controllers/cleaning.controller.test.ts (4 tests)

 Test Files  22 passed (22)
      Tests  147 passed (147)
   Start at  13:03:14
   Duration  9.97s
```
