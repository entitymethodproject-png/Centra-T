# IMPLEMENTATION REPORT · FIA-A05.01

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A05.01 · Módulo Backend Cleaning y Cálculo de Recurrencia
- **Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)
- **Hito de Rebanada:** PRIMERA UNIDAD DE RV-A05 (ENTIDAD, DTOs, REPOSITORIO, SERVICIO CON CÁLCULO DE RECURRENCIA Y CONTROLADOR REST)
- **SPEC de Referencia:** SPEC-FIA-A05.01.md
- **Estado:** COMPLETADO CON ÉXITO (100% OPERATIVO, 147/147 TESTS EN VERDE A TRAVÉS DE 22 SUITES)
- **Commit Git de Cierre:** `9ea99ca`

---

## 1. Resumen de Implementación

Se ha materializado en su totalidad la arquitectura de backend y dominio para el módulo de limpieza doméstica (`src/cleaning/*`), inaugurando la Rebanada Vertical **RV-A05** conforme al Método zug:

1. **Entidad de Dominio y Constantes Canónicas (`src/cleaning/entities/cleaning-item.entity.ts`):**
   - Entidad `CleaningItem` con tipado estricto: `id`, `userId`, `modulo: 'cleaning'`, `nombre`, `zona` (`'cocina' | 'baño' | 'salon' | 'general'`), `frecuencia` (`'diaria' | 'semanal' | 'quincenal' | 'mensual'`), `completado`, `lastCompletedAt`, `proximaFechaSugerida`, `fechaProgramada`, `createdAt` y `updatedAt`.
   - Constantes `CLEANING_LIMITS`:
     - Longitud de nombre: mínimo 1, máximo 120 caracteres (**Decisión 2B innegociable**).
     - Catálogo exhaustivo de zonas y frecuencias.
     - Días por frecuencia: `diaria: 1`, `semanal: 7`, `quincenal: 14`, `mensual: 30`.
   - Excepciones tipadas de negocio: `InvalidCleaningNameError`, `InvalidCleaningZoneError`, `InvalidCleaningFrequencyError`, `InvalidCleaningDateError`, `CleaningItemNotFoundError`.

2. **DTOs de Transferencia (`src/cleaning/dto/`):**
   - `CreateCleaningItemDto`: `{ nombre, zona, frecuencia, fechaProgramada? }`.
   - `UpdateCleaningItemDto`: `{ nombre?, zona?, frecuencia?, completado?, lastCompletedAt?, fechaProgramada? }`.
   - `CompleteCleaningItemDto`: `{ completedAt? }`.

3. **Capa de Persistencia Multi-Tenant (`src/cleaning/repositories/cleaning.repository.ts`):**
   - Interfaz `ICleaningRepository` e implementación desacoplada `InMemoryCleaningRepository`.
   - Aislamiento absoluto por `userId` en todas las operaciones (`save`, `findAllByUser`, `findById`, `delete`).
   - Soporte para filtrado combinado por `zona` y `frecuencia`.

4. **Lógica de Dominio y Motor de Recurrencia (`src/cleaning/services/cleaning.service.ts`):**
   - **Cálculo Determinista de Recurrencia:** Método puro `calculateNextSuggestedDate(baseDate, frecuencia)` que suma con exactitud de milisegundos los días estipulados sin dependencias externas.
   - **Generación Inicial:** Al crear una tarea (`createItem`), se computa automáticamente la primera `proximaFechaSugerida` sumando la frecuencia a la fecha actual de creación.
   - **Registro de Ejecución (`completeTask`):** Marca `completado = true`, fija `lastCompletedAt = completedAt` y recalcula dinámicamente la `proximaFechaSugerida` proyectada a partir de la ejecución realizada.
   - **Validación de Fechas Pasadas:** Se impide programar tareas en fechas anteriores al día actual a medianoche (**Decisión 1A**).

5. **Controlador REST Desacoplado (`src/cleaning/controllers/cleaning.controller.ts`):**
   - Endpoints HTTP desacoplados con contratos canónicos `HttpRequest` / `HttpResponse`:
     - `GET /cleaning`: Listado de tareas del tenant con filtros opcionales (200 OK / 401).
     - `POST /cleaning`: Creación de tarea de limpieza (201 Created / 400).
     - `GET /cleaning/:id`: Consulta individual aislada por tenant (200 OK / 404).
     - `PUT /cleaning/:id`: Actualización de propiedades (200 OK / 400 / 404).
     - `POST /cleaning/:id/complete`: Registro de completado y recálculo de periodicidad (200 OK / 400 / 404).
     - `DELETE /cleaning/:id`: Eliminación física aislada (204 No Content / 404).

---

## 2. Archivos Creados

- `src/cleaning/entities/cleaning-item.entity.ts`
- `src/cleaning/dto/create-cleaning-item.dto.ts`
- `src/cleaning/dto/update-cleaning-item.dto.ts`
- `src/cleaning/dto/complete-cleaning-item.dto.ts`
- `src/cleaning/repositories/cleaning.repository.ts`
- `src/cleaning/services/cleaning.service.ts`
- `src/cleaning/services/cleaning.service.test.ts` (9 tests unitarios)
- `src/cleaning/controllers/cleaning.controller.ts`
- `src/cleaning/controllers/cleaning.controller.test.ts` (4 tests unitarios)

---

## 3. Auditoría de Drift y Principios de Diseño

- **Drift Detectado:** 0 (Adherencia matemática absoluta a `SPEC-FIA-A05.01.md`).
- **Regresiones en Suites Previas:** 0 (Los 134 tests de Auth, Workspace, Tasks y Shopping siguen pasando al 100%).
- **Decisión 1A Respetada:** Bloqueo incondicional de fechas pasadas en `validateScheduleDate`.
- **Decisión 2B Respetada:** Longitud de nombre estrictamente acotada a 120 caracteres en `validateName`.
- **Aislamiento Multi-Tenant:** Demostrado en test específico de cruce de usuarios.

---

## 4. Estado de los Quality Gates

- **QG-01 · Typecheck:** PASSED (0 errores con `tsc --noEmit`).
- **QG-02 · Linting:** PASSED (0 warnings).
- **QG-03 · Tests Suite:** PASSED (**147/147 tests pasando al 100% en verde** en Vitest a través de 22 suites de prueba).
- **QG-04 · Cálculo Matemático de Recurrencia:** PASSED (Validado para +1d, +7d, +14d y +30d).
- **QG-05 · Aislamiento Multi-Tenant:** PASSED (Verificado en repositorio y servicio).
