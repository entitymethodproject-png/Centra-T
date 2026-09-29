# CENTRA-T · FIA-A05.01 · MÓDULO BACKEND CLEANING Y CÁLCULO DE RECURRENCIA
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A05 (DOMINIO, REPOSITORIO, SERVICIO CON CÁLCULO DE RECURRENCIA Y ENDPOINTS REST CRUD Y COMPLETADO)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A05.01`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad Prevista:** `Módulo Backend Cleaning y Cálculo de Recurrencia`
- **PVF de Cierre Cubierta:** Cimiento transaccional de `PVF-A05.01 · Acordeón de Limpieza Organizado por Zonas y Frecuencias`, `PVF-A05.02 · Alta de Tarea de Limpieza con Asignación de Periodicidad` y `PVF-A05.03 · Registro de Ejecución y Cálculo de Próxima Limpieza`
- **VF Interna de Derivación:** `VF-A05.03 · Ciclo de Recurrencia y Cálculo de Próxima Ejecución`
- **Objetivo Indexado:** `Implementar modelo CleaningItem con atributos de Zona (Cocina, Baño, Salón) y Frecuencia (semanal, quincenal, mensual), calculando próxima fecha sugerida.`
- **Validación Indexada:** `src/cleaning/services/cleaning.service.ts` y `src/cleaning/controllers/cleaning.controller.ts`
- **Evidencia de Cierre Indexada:** `Tests unitarios verifican cálculo matemático exacto de próxima fecha de limpieza sugerida tras registrar completado.`
- **LOCK Previo Requerido:** `LOCK-FIA-A04.03.md APROBADO (Commit: c26d26a)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest el motor de dominio y la API backend para el módulo de limpieza doméstica (`src/cleaning/*`), estableciendo las estructuras de datos, repositorios en memoria, reglas de negocio con cálculo matemático de recurrencia y controladores REST desacoplados:
1. **Entidad de Dominio `CleaningItem`:**
   - Atributos obligatorios: `id` (UUID), `userId` (inmutable, aislamiento multi-tenant), `modulo: 'cleaning'` (inmutable), `nombre` (string 1..120 chars - Decisión 2B), `zona` (enum/unión tipada `'cocina' | 'baño' | 'salon' | 'general'`), `frecuencia` (enum/unión tipada `'diaria' | 'semanal' | 'quincenal' | 'mensual'`), `completado` (booleano, default false), `lastCompletedAt` (Date | null, default null), `proximaFechaSugerida` (Date | null, calculada automáticamente), `fechaProgramada` (Date | null, default null), `createdAt` y `updatedAt`.
2. **Cálculo Matemático de Recurrencia:**
   - Algoritmo determinista puro para calcular la próxima fecha de limpieza sugerida:
     - `'diaria'`: +1 día (24 horas).
     - `'semanal'`: +7 días (168 horas).
     - `'quincenal'`: +14 días (336 horas).
     - `'mensual'`: +30 días (720 horas).
   - Al crear una tarea de limpieza, `proximaFechaSugerida` se inicializa sumando la frecuencia a `createdAt`.
   - Al registrar la ejecución de una tarea (`completeTask`), se actualiza `lastCompletedAt` al timestamp actual (o suministrado) y se recalcula de forma atómica y matemática `proximaFechaSugerida` a partir de dicho timestamp.
3. **Capa de Persistencia (`CleaningRepository`):**
   - Interfaz `ICleaningRepository` e implementación `InMemoryCleaningRepository` con aislamiento absoluto por `userId` y soporte de filtrado opcional por `zona` y `frecuencia`.
4. **Capa de Servicio de Negocio (`CleaningService`):**
   - Operaciones CRUD, validación estricta de nombres, zonas y frecuencias válidas, registro de completado y recálculo determinista de periodicidad.
5. **Capa de Controlador HTTP (`CleaningController`):**
   - Endpoints REST desacoplados (`GET /cleaning`, `POST /cleaning`, `GET /cleaning/:id`, `PATCH /cleaning/:id`, `POST /cleaning/:id/complete`, `DELETE /cleaning/:id`).
6. **Batería de Pruebas Automatizadas:** 13 nuevos tests unitarios y de integración para alcanzar mínimo **147 tests en verde** a través de 22 suites en Vitest.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/cleaning/entities/cleaning-item.entity.ts`.
  - Creación de DTOs: `src/cleaning/dto/create-cleaning-item.dto.ts`, `update-cleaning-item.dto.ts`, `complete-cleaning-item.dto.ts`.
  - Creación de `src/cleaning/repositories/cleaning.repository.ts`.
  - Creación de `src/cleaning/services/cleaning.service.ts` y su suite `cleaning.service.test.ts` (mínimo 9 tests).
  - Creación de `src/cleaning/controllers/cleaning.controller.ts` y su suite `cleaning.controller.test.ts` (mínimo 4 tests).
  - Preservación íntegra de los 134 tests existentes (mínimo 147 tests globales pasando en verde).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Componente de interfaz `CleaningAccordion.tsx` (pertenece a `FIA-A05.02`).
  - Modal de alta en interfaz `CleaningCreationModal.tsx` (pertenece a `FIA-A05.02`).
  - Tarjetas interactivas con temporizador en UI `CleaningTaskCard.tsx` (pertenece a `FIA-A05.03`).
  - Arrastre HTML5 Drag & Drop entre tareas de limpieza y el calendario mensual (`RV-A07`).

### 4. Dependencias
- **Documentales:**
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx` (Fichas RV-A05 / FIA-A05.01).
  - `SUITE_ARQUITECTURA_CORE.docx` (Directrices del módulo Screaming `src/cleaning/*` e invariantes).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:**
  - TypeScript 5.7 (Modo estricto).
  - Vitest 3.2.7.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere el LOCK formal de `FIA-A04.03` (Sellado y aprobado).
  - *Posterior:* La unidad `FIA-A05.02 · Acordeón de Limpieza y Modal de Alta Periódica` no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato de Dominio:**
  - `CleaningZone = 'cocina' | 'baño' | 'salon' | 'general'`
  - `CleaningFrequency = 'diaria' | 'semanal' | 'quincenal' | 'mensual'`
- **Contrato de Persistencia `ICleaningRepository`:**
  - `save(item: CleaningItem): Promise<CleaningItem>`
  - `findAllByUser(userId: string, filter?: { zona?: CleaningZone; frecuencia?: CleaningFrequency }): Promise<CleaningItem[]>`
  - `findById(userId: string, id: string): Promise<CleaningItem | null>`
  - `delete(userId: string, id: string): Promise<boolean>`
- **Contrato de Aislamiento:**
  - Todas las operaciones requieren y filtran estrictamente por `userId`. Los datos de un usuario jamás son accesibles por otro tenant.

### 6. Restricciones
- Decisión 2B innegociable: la longitud del nombre de la tarea debe situarse estrictamente entre 1 y 120 caracteres tras aplicar `.trim()`.
- Decisión 1A innegociable: `fechaProgramada` jamás puede fijarse en una fecha pasada anterior al día actual.
- Las zonas y frecuencias están restringidas a los catálogos enumerados canónicamente; cualquier valor espurio debe ser rechazado con error 400.
- Cálculo de recurrencia determinista: no debe depender de librerías externas de fechas ni generar desfases de cálculo por zonas horarias.

### 7. Diseño Técnico
- **Ubicación Física:** `src/cleaning/*`
- **Estructura Interna:**
  - `entities/`: Definición de `CleaningItem`, tipos `CleaningZone`, `CleaningFrequency`, límites y clases de error.
  - `dto/`: Interfaces de transferencia de datos con validaciones tipadas.
  - `repositories/`: Contrato e implementación en memoria con índices por usuario.
  - `services/`: Métodos estáticos puros para validación y cálculo de recurrencia (`calculateNextSuggestedDate`), y métodos de instancia para gestión del ciclo de vida de la tarea.
  - `controllers/`: Manejadores HTTP REST con mapeo de errores a códigos de estado HTTP (400, 404, 500).

### 8. Flujo Operativo
1. El usuario invoca la creación de una tarea de limpieza (ej. *Fregar suelo de la cocina*, zona: `'cocina'`, frecuencia: `'semanal'`).
2. El servicio valida los invariantes (nombre válido, zona soportada, frecuencia válida) y calcula `proximaFechaSugerida` inicial sumando 7 días a la fecha de creación.
3. Se persiste la tarea con `completado = false` y `lastCompletedAt = null`.
4. Cuando el usuario registra la ejecución de la limpieza, se invoca `completeTask(userId, id, completedAt)`.
5. El servicio actualiza `lastCompletedAt` al timestamp de completado, marca `completado = true` y recalcula de forma determinista la nueva `proximaFechaSugerida` (+7 días para semanal, +14 para quincenal, +30 para mensual).
6. La tarea permanece en el sistema con su nuevo cálculo de periodicidad listo para su consulta y visualización informativa.

### 9. Casos Válidos (Happy Path)
- **V-01 (Creación y Cálculo Semanal):** Creación de tarea semanal el día D -> `proximaFechaSugerida` = D + 7 días.
- **V-02 (Cálculo Quincenal y Mensual):** Tarea quincenal -> +14 días; Tarea mensual -> +30 días; Tarea diaria -> +1 día.
- **V-03 (Registro de Ejecución y Recálculo):** Al completar tarea el día D+2 -> `lastCompletedAt` = D+2 y nueva `proximaFechaSugerida` = (D+2) + frecuencia.
- **V-04 (Filtrado por Zona):** Consulta con filtro `zona='baño'` -> Retorna únicamente tareas pertenecientes al baño del usuario.
- **V-05 (Filtrado por Frecuencia):** Consulta con filtro `frecuencia='mensual'` -> Retorna tareas con periodicidad mensual.
- **V-06 (Aislamiento de Tenant):** Usuario A no visualiza ni puede completar tareas de Usuario B.

### 10. Casos Inválidos y Manejo de Errores
- **I-01 (Nombre Inválido):** Nombre vacío, puros espacios o > 120 caracteres -> Lanza `InvalidCleaningNameError` (HTTP 400).
- **I-02 (Zona No Soportada):** Zona fuera de catálogo -> Lanza `InvalidCleaningZoneError` (HTTP 400).
- **I-03 (Frecuencia Inválida):** Frecuencia no reconocida -> Lanza `InvalidCleaningFrequencyError` (HTTP 400).
- **I-04 (Fecha Pasada):** `fechaProgramada` anterior a hoy -> Lanza `InvalidCleaningDateError` (HTTP 400).
- **I-05 (Recurso No Encontrado):** Consulta o completado de ID inexistente o de otro usuario -> Lanza `CleaningItemNotFoundError` (HTTP 404).

### 11. Tests Requeridos
- **Suite de Servicio (`src/cleaning/services/cleaning.service.test.ts` - 9 tests):**
  1. Creación exitosa con cálculo matemático de `proximaFechaSugerida` inicial (+7 días para semanal).
  2. Validación de frecuencias: cálculo exacto de días para diaria (+1), quincenal (+14) y mensual (+30).
  3. Rechazo de nombres inválidos (vacío o > 120 caracteres - Decisión 2B).
  4. Rechazo de zona no soportada.
  5. Rechazo de frecuencia no soportada.
  6. Aislamiento absoluto por `userId` entre usuarios distintos.
  7. Registro de completado (`completeTask`) con asignación de `lastCompletedAt` y recálculo determinista de próxima fecha sugerida.
  8. Filtrado de tareas por zona y frecuencia.
  9. Manejo de error 404 ante ID inexistente o usuario no propietario.
- **Suite de Controlador (`src/cleaning/controllers/cleaning.controller.test.ts` - 4 tests):**
  1. `GET /cleaning`: Retorna lista con código 200 y soporta query params de filtro.
  2. `POST /cleaning`: Crea tarea y retorna código 201.
  3. `POST /cleaning/:id/complete`: Registra ejecución y retorna tarea actualizada con código 200.
  4. Mapeo de errores: Retorna 400 ante payloads inválidos y 404 ante recursos no encontrados.

### 12. Quality Gates (QG-FIA-A05.01)
- `QG-FIA-A05.01-01 · Typecheck:` 0 errores en TypeScript estricto (`tsc --noEmit`).
- `QG-FIA-A05.01-02 · Linting:` 0 warnings.
- `QG-FIA-A05.01-03 · Tests Suite:` 100% de tests en verde (mínimo 147 tests pasando en Vitest).
- `QG-FIA-A05.01-04 · Cálculo Matemático de Recurrencia:` Verificación formal del recálculo de periodicidad sin desfases.
- `QG-FIA-A05.01-05 · Aislamiento Multi-Tenant:` Verificación estricta de filtros por `userId`.

### 13. Definition of Done (DoD)
La unidad táctica **FIA-A05.01** se considerará completada y lista para LOCK si y solo si:
1. El modelo `CleaningItem`, repositorios, servicio con cálculo de recurrencia y controlador REST están implementados en `src/cleaning/*`.
2. Las suites `cleaning.service.test.ts` y `cleaning.controller.test.ts` suman 13 tests en verde sin fallos.
3. La suite global de Centra-T alcanza mínimo 147 tests pasando al 100% en Vitest.
4. Los 5 Quality Gates son superados satisfactoriamente.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A05.01.md`, `TEST_REPORT_FIA-A05.01.md` y `LOCK-FIA-A05.01.md`.
