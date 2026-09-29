# CENTRA-T · FIA-A05.03 · CONMUTACIÓN DE LIMPIEZA, MUTACIÓN OPTIMISTA Y CIERRE DE RV-A05 (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A05.03.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A05.03`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad Implementada:** `Conmutación de Limpieza, Mutación Optimista, Homogeneización Universal y Cierre de RV-A05`
- **PVF de Cierre Cubierta:** `PVF-A05.03 · Conmutación de Limpieza y Registro Temporal` (y consolidación de `PVF-A03.04 / VV-005` transversal)
- **VF Interna de Derivación:** `VF-A05.03 · Conmutación de Limpieza y Actualización de Estado`
- **Objetivo Indexado:** `Al completar una tarea de limpieza, registrar completado, conmutación optimista en UI sin expulsión de la lista, mantenimiento en rotación y cierre definitivo de RV-A05.`
- **Validación Final:** [`src/cleaning/components/CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx), [`src/hub/components/CleaningAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/CleaningAccordion.tsx), [`src/cleaning/services/cleaning.service.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/services/cleaning.service.ts)
- **Evidencia de Cierre:** 40/40 tests del módulo limpieza pasando (100%), 178/178 tests globales pasando en 27 suites, Typecheck 0 errores, build de producción limpio en 2.09s.
- **LOCK Previo Requerido:** `LOCK-FIA-A05.02.md APROBADO`
- **Estado Documental:** `AS-BUILT consolidado oficial. Actúa como LOCK formal de la unidad y base física irrefutable para RV-A06.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A05.03).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: PVF-A05.03 / VF-A05.03).
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: Clean Architecture, Screaming Architecture y Modelo Universal de Tareas).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología del Hub, Directrices Visuales y Casos Forenses VV-001 a VV-009).
  - `REPORTE_SCOPE_CREEP_Y_BUGS_POST_SENIOR.md` (Auditoría técnica exhaustiva que selló la erradicación del scope creep y homogeneizó la tríada de módulos).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` verificado tras auditoría senior.
- **Métricas de Compilación y Calidad:**
  - Vitest 3.2.7: 178/178 tests en verde (100% éxito en 27 suites).
  - TypeScript 5.x (`tsc --noEmit`): Cero errores de tipado estricto.
  - Empaquetado Vite: Build de producción generado en `dist/` en 2.09s sin advertencias.
  - Cero regresiones respecto a RV-A01, RV-A02, RV-A03 y RV-A04.

### 4. Objetivo Implementado
Materializar con fidelidad fotográfica el cierre funcional y estético de las tareas de limpieza doméstica:
1. **Mutación Optimista Inmediata (<50ms):** Conmutación reactiva de la casilla de verificación en [`CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx) con aplicación o retiro del estilo tachado sin bloqueo de interfaz.
2. **Sincronización Silenciosa y Rollback Defensivo (Caso Forense VV-005):** Si el endpoint de actualización responde con error (HTTP 500), se revierte de inmediato el estado visual al previo y se despliega un Toast empático accesible con botón de descarte.
3. **Implantación del Puntito Sutil de Prioridad (`puntito sutil`):** Sustitución incondicional de los badges textuales (`ALTA`, `MEDIA`, `BAJA`) por un indicador circular de `7px × 7px` con resplandor semántico difuso, colocado estrictamente entre el checkbox y el nombre de la tarea.
4. **Mantenimiento en Rotación:** Las tareas de limpieza completadas no son expulsadas ni trasladadas a acordeones anidados; permanecen visibles atenuadas y tachadas.
5. **Menú Contextual Accesible de 3 Puntos (`CleaningActionMenu.tsx`):** Disparador `•••` con ajuste de prioridad en tiempo real (*Alta*, *Media*, *Baja*) y opción modal de eliminación con foco defensivo en `[Cancelar]`.
6. **Estandarización del Wizard de Creación en 3 Pasos (`CleaningCreationWizard.tsx`):** Entrada estructurada (Paso 1: Título 1..120 chars, Paso 2: Descripción 0..1000 chars, Paso 3: Prioridad) con purga absoluta de buffer en memoria ante cancelación o tecla Escape (Decisión 3A / Caso VV-004).
7. **Limpieza de Cabecera Superior (`TopNavbar.tsx`):** Erradicación total de la telemetría espuria de red y sus event listeners globales.

### 5. Alcance Final
- **IN-SCOPE (Consolidado e implementado):**
  - Entidad de dominio `CleaningItem` con atributos: `id`, `userId`, `modulo: 'cleaning'`, `titulo`, `descripcion`, `prioridad`, `completado`, `fechaProgramada`, `createdAt`, `updatedAt`.
  - Componente de tarjeta [`CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx) con soporte optimista, rollback, puntito sutil y menú contextual.
  - Componente de menú contextual [`CleaningActionMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningActionMenu.tsx).
  - Componente de asistente modal [`CleaningCreationWizard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCreationWizard.tsx).
  - Acordeón lateral [`CleaningAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/CleaningAccordion.tsx) con cabecera limpia `Limpieza (N)`, botón `+` compacto y estados visuales (carga, error, vacío y lista).
  - Capa de persistencia y servicio backend (`cleaning.service.ts`, `cleaning.controller.ts`, `cleaning.repository.ts`) con aislamiento multi-tenant por `userId`.
- **OUT-OF-SCOPE / CERO SCOPE CREEP (Erradicado formalmente):**
  - Prohibidos campos taxonómicos de `zona` ('cocina', 'baño', etc.) y `frecuencia` ('semanal', 'mensual', etc.).
  - Prohibidos campos inventados de recurrencia `proximaFechaSugerida` y `lastCompletedAt`.
  - Prohibido selector de fechas en modales de creación (la fecha se asigna exclusivamente en el Calendario).
  - Prohibidos chips de filtro en la cabecera del acordeón.
  - Prohibida telemetría de red en `TopNavbar`.

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 18/19 con TypeScript estricto.
- **Estilos:** CSS Modules puros consumiendo variables de tokens de diseño (`src/theme/tokens.css`).
- **Librería de Testing:** Vitest 3.2.7 con `@testing-library/react` y `@testing-library/user-event`.
- **Iconografía:** Glifos SVG y caracteres tipográficos accesibles nativos sin sobrecarga de dependencias externas.

### 7. Contratos Finales Afectados
- **Contrato de Dominio:** Modelo Universal de Tareas compartido idénticamente por `tasks`, `shopping` y `cleaning`:
  ```typescript
  interface CleaningItem {
    id: string;
    userId: string;
    modulo: 'cleaning';
    titulo: string;                       // 1..120 chars (Decisión 2B)
    descripcion: string;                  // 0..1000 chars (Decisión 2B)
    prioridad: 'alta' | 'media' | 'baja'; // Default: 'media'
    completado: boolean;                  // Default: false
    fechaProgramada: Date | null;         // Exclusivo para Calendario
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **Contrato de Interfaz Visual:**
  - Checkbox nativo accesible de 18x18px.
  - Puntito sutil de 7x7px situado entre el checkbox y el nombre.
  - Tachado de texto inmediato (<50ms) al marcar completado.
  - Diálogo modal confirmatorio ante eliminación destructiva con foco seguro en `[Cancelar]`.
- **Contrato de Aislamiento:** Toda lectura, mutación o eliminación en `cleaning.repository.ts` está parametrizada estrictamente por `userId`.

### 8. Restricciones Finales
- Invariante Decisión 1A: Bloqueo de fechas pasadas en operaciones temporales.
- Invariante Decisión 2B: Límites innegociables de 120 caracteres para título y 1000 caracteres para descripción.
- Invariante Decisión 3A: Rollback total a cero en cancelación de Wizard (sin persistencia de borradores corruptos).
- Invariante Caso Forense VV-005: Rollback automático y Toast empático ante errores 500 en mutación de estado.
- Invariante de Homogeneidad: Las tres tarjetas (`TaskCard`, `ShoppingCard`, `CleaningCard`) presentan la misma anatomía exacta.

### 9. Diseño Técnico Final
- **Arquitectura de Componentes:**
  - `src/cleaning/components/CleaningCard.tsx`: Renderiza casilla, puntito sutil, título (con clase condicional `titleCompleted`) y disparador de `CleaningActionMenu`. Aloja lógica local optimista y Toast de reversión.
  - `src/cleaning/components/CleaningActionMenu.tsx`: Menú accesible desplegable con submenú de prioridades y modal de confirmación de borrado.
  - `src/cleaning/components/CleaningCreationWizard.tsx`: Wizard en 3 pasos con validación síncrona, contadores dinámicos y reseteo por ESC.
  - `src/hub/components/CleaningAccordion.tsx`: Orquesta la lista de limpiezas, gestiona apertura/cierre de acordeón y levanta el wizard.
- **Backend:**
  - `src/cleaning/services/cleaning.service.ts`: Métodos `createItem`, `findAllByUser`, `findById`, `updateItem`, `toggleStatus`, `deleteItem`.
  - `src/cleaning/controllers/cleaning.controller.ts`: Endpoints REST desacoplados.

### 10. Flujo Operativo Final
1. **Conmutación:** El usuario hace clic en el checkbox de una tarea de limpieza.
2. **Mutación Optimista:** La interfaz cambia instantáneamente el estado del checkbox y aplica la clase CSS de tachado (`<50ms`).
3. **Petición en Segundo Plano:** Se despacha `CleaningService.updateItem(userId, id, { completado: !actual })`.
4. **Resolución:**
   - Si el servidor responde 200 OK: La tarea permanece en la lista conservando el estado conmutado.
   - Si el servidor responde con fallo (500): La interfaz revierte inmediatamente el checkbox y el tachado a su estado original y despliega un Toast informativo.

### 11. Casos Válidos Finales
- **Caso 1 (Renderizado Base):** Carga de tarjetas mostrando puntito sutil según prioridad (rojo, ámbar o azul) colocado exactamente entre checkbox y título.
- **Caso 2 (Conmutación Exitosa):** Clic en tarea activa la tacha; clic subsecuente retira el tachado sin remover la tarjeta de la lista.
- **Caso 3 (Cambio de Prioridad Contextual):** Despliegue de menú `•••`, selección de nueva prioridad y persistencia reactiva en backend.
- **Caso 4 (Eliminación Confirmada):** Despliegue de modal de borrado, clic en `[Eliminar]` y remoción de la tarjeta con animación suave.
- **Caso 5 (Creación en 3 Pasos):** Wizard completa los 3 pasos y agrega la tarea al tope del acordeón.

### 12. Casos Inválidos Finales
- **Caso Inválido 1 (Error de Servidor en Checkbox):** Falla forzada en la API activa rollback visual en <50ms y Toast de error empático.
- **Caso Inválido 2 (Cancelación de Wizard):** Pulsar `[Cancelar]` o `Escape` en el Paso 2 o 3 vacía íntegramente los campos; al reabrir el formulario está 100% en blanco en el Paso 1.
- **Caso Inválido 3 (Título en Blanco o Excedido):** Wizard bloquea el avance con mensaje inline de validación.

### 13. Tests Requeridos Finales
- **Suite de Componentes Limpieza (27 tests):**
  - `CleaningCard.test.tsx` (7 tests)
  - `CleaningActionMenu.test.tsx` (7 tests)
  - `CleaningCreationWizard.test.tsx` (6 tests)
  - `CleaningAccordion.test.tsx` (7 tests)
- **Suite Backend Limpieza (13 tests):**
  - `cleaning.service.test.ts` (9 tests)
  - `cleaning.controller.test.ts` (4 tests)
- **Total Módulo Limpieza:** 40 tests (100% GREEN).
- **Total Global Proyecto:** 178 tests (100% GREEN a través de 27 suites).

### 14. Quality Gates Finales
- `QG-01 · Typecheck Estricto:` `tsc --noEmit` superado con 0 errores.
- `QG-02 · Tests Suite Completa:` 178/178 tests en verde.
- `QG-03 · Build de Producción:` Empaquetado Vite completado en 2.09s sin advertencias.
- `QG-04 · Integridad del Puntito Sutil:` Validada presencia y dimensiones (7x7px) en todas las tarjetas.
- `QG-05 · Limpieza de TopNavbar:` Eliminada telemetría espuria de red y sus listeners.
- `QG-06 · Aislamiento Multi-Tenant:` Parametrización estricta por `userId` en todas las queries.
- `QG-07 · Cero Regresiones:` Suites de módulos anteriores intactas.

### 15. Archivos Reales Afectados
```
Creados:
- src/cleaning/components/CleaningCard.tsx
- src/cleaning/components/CleaningCard.module.css
- src/cleaning/components/CleaningCard.test.tsx
- src/cleaning/components/CleaningActionMenu.tsx
- src/cleaning/components/CleaningActionMenu.module.css
- src/cleaning/components/CleaningActionMenu.test.tsx
- src/cleaning/components/CleaningCreationWizard.tsx
- src/cleaning/components/CleaningCreationWizard.module.css
- src/cleaning/components/CleaningCreationWizard.test.tsx
- src/cleaning/entities/cleaning-item.entity.ts
- src/cleaning/dto/create-cleaning-item.dto.ts
- src/cleaning/dto/update-cleaning-item.dto.ts
- src/cleaning/repositories/cleaning.repository.ts
- src/cleaning/services/cleaning.service.ts
- src/cleaning/services/cleaning.service.test.ts
- src/cleaning/controllers/cleaning.controller.ts
- src/cleaning/controllers/cleaning.controller.test.ts

Modificados:
- src/App.tsx
- src/hub/components/CleaningAccordion.tsx
- src/hub/components/CleaningAccordion.module.css
- src/hub/components/CleaningAccordion.test.tsx
- src/hub/components/ShoppingAccordion.tsx
- src/hub/components/ShoppingAccordion.module.css
- src/hub/components/ShoppingAccordion.test.tsx
- src/hub/components/TasksAccordion.module.css
- src/hub/components/TasksAccordion.test.tsx
- src/tasks/components/TaskCard.tsx
- src/tasks/components/TaskCard.module.css
- src/tasks/components/TaskCard.test.tsx
- src/shopping/components/ShoppingCard.tsx
- src/shopping/components/ShoppingCard.module.css
- src/shopping/components/ShoppingCard.test.tsx
- src/workspace/components/TopNavbar.tsx
- src/workspace/components/TopNavbar.module.css
- src/workspace/components/TopNavbar.test.tsx

Purgados:
- src/cleaning/components/CleaningCreationModal.tsx (.module.css / .test.tsx)
- src/cleaning/dto/complete-cleaning-item.dto.ts
- src/shopping/components/QuickItemInput.tsx (.module.css / .test.tsx)
- src/shopping/components/ShoppingItemList.tsx (.module.css / .test.tsx)
```

### 16. Diferencias Respecto a la FIA Original
La FIA original contemplaba una entidad especializada de limpieza con campos taxonómicos (`zona`, `frecuencia`, `proximaFechaSugerida`, `lastCompletedAt`). Tras la revisión senior de arquitectura, se determinó que la sobrecarga de taxonomías y la asignación temporal en modales fragmentaba la experiencia de usuario y colisionaba con el Calendario. Se adoptó el **Modelo Universal de Tareas**, unificando la anatomía de datos e interfaz con Tareas y Compra.

### 17. Drift Integrado
- Reemplazo de los badges textuales pesados de prioridad por el **puntito sutil de 7x7px** entre checkbox y título.
- Supresión de botones anchos en cabeceras en favor del botón compacto `+` (26x26px).
- Purga del indicador de red en la cabecera superior `TopNavbar`.

### 18. Decisiones de Cambio (CHG) Integradas
- **CHG Senior Review - Homogeneización Universal:** Decisión técnica vinculante que ordenó erradicar el scope creep en `shopping` y `cleaning`, estandarizando los modales de creación en 3 pasos, los menús contextuales de 3 puntos y el Modelo Universal de datos para toda la aplicación.

### 19. Definition of Done AS-BUILT
Se declara formalmente que la unidad táctica **FIA-A05.03** y la totalidad de la rebanada vertical **RV-A05 (Gestión de Tareas de Limpieza Doméstica)** se encuentran **100% implementadas, verificadas, auditadas y selladas con LOCK definitivo**.

**Queda formalmente autorizada la apertura de:**  
`RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)` -> **`FIA-A06.01`**.
