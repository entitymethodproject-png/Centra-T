# CENTRA-T · FIA-A06.03 · PANEL DE REORDENACIÓN, MOTOR MULTINIVEL Y AJUSTES (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A06.03.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A06.03`
- **Rebanada Vertical:** `RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)`
- **Unidad Implementada:** `Panel de Reordenación, Motor Multinivel, Integración End-to-End y Ajustes Post-Implementación`
- **PVF de Cierre Cubierta:** `PVF-A06.01`, `PVF-A06.02` y `PVF-A06.03 · Panel de Reordenación Multinivel y Desempate Determinista`
- **VF Interna de Derivación:** `VF-A06.01`, `VF-A06.02` y `VF-A06.03 · Reordenación Multinivel y Desempate Determinista`
- **Objetivo Indexado:** `Construir componente activado por el botón [Reordenar] y motor puro sortEngine (por Fecha, Prioridad o Alfabético) con desempate determinista por createdAt ASC, con integración real viva en pantalla y cierre de RV-A06.`
- **Validación Final:** [`src/filters/components/SortMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.tsx), [`src/filters/utils/sortEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.ts), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx), [`src/hub/components/HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx)
- **Evidencia de Cierre:** 261/261 tests globales pasando en 32 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 1.91s.
- **LOCK Previo Requerido:** `LOCK-FIA-A06.02.md APROBADO`
- **Estado Documental:** `AS-BUILT consolidado oficial. Actúa como LOCK formal de cierre total de la rebanada RV-A06 y base física irrefutable para RV-A07.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A06.03).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: PVF-A06.01, PVF-A06.02 y PVF-A06.03).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema filters_and_sort en Frontend).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 y 08: Directrices de Botones [Filtrar] y [Reordenar] en Hub).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 5.2: Proceso `Reordenar_Lista_Multinivel`).
  - `SPEC-FIA-A06.03.md` (Especificación técnica ejecutada con mandato end-to-end).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` verificado tras cierre y auditoría de `FIA-A06.03`.
- **Métricas de Compilación y Calidad:**
  - Vitest 3.2.7: 261/261 tests en verde (100% de éxito en 32 suites).
  - TypeScript 5.x (`tsc --noEmit`): Cero errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 1.91s sin advertencias.
  - Cero regresiones respecto a RV-A01 hasta RV-A05.

### 4. Objetivo Implementado
Materializar el cierre definitivo y la operatividad total de la rebanada vertical **RV-A06**:
1. **Contratos Tipados de Ordenación (`sort.types.ts`):** `SortField` (`'PRIORIDAD' | 'FECHA' | 'ALFABETICO' | 'ESTADO'`), `SortDirection` (`'ASC' | 'DESC'`), `SortConfiguration`, `DEFAULT_SORT_CONFIG` y catálogo `SORT_OPTIONS` con 8 opciones.
2. **Motor Determinista de Ordenación Multinivel (`sortEngine.ts`):**
   - Comparador de 3 niveles `compareItems` y función pura `sortItems`.
   - Nivel 1: Prioridad (Alta=3, Media=2, Baja=1), Fecha con regla innegociable **Nulls Last** (ítems sin fecha al final en ASC y DESC), Alfabético con `localeCompare` en español, y Estado (Pendientes primero en ASC).
   - Nivel 2: Desempate secundario por `fechaProgramada ASC`.
   - Nivel 3: Desempate terciario determinista por `createdAt ASC`, erradicando elementos oscilantes.
3. **Componente Popover Accesible (`SortMenu.tsx`):** Menú flotante (`z-index: 900`) con `role="menu"`, opciones con `role="menuitemradio"` y `aria-checked`, cierre automático, tecla `Escape` y backdrop.
4. **Integración Real End-to-End en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx):**
   - Orquestación reactiva de `FilterModal` y `SortMenu`.
   - Paso de las colecciones filtradas y ordenadas en caliente a los tres acordeones (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`).
   - Sincronización en fase de render (React render-phase state adjustment) en los acordeones para eliminación total de latencia de 1 fotograma.
   - Botón `[Filtrar]` con icono de lupa `🔍`, `aria-label` dinámico `Filtrar (N)`, botón condicional `[Limpiar]` y botón `[Reordenar]`.
5. **Modal de Descripción en Tarjetas del Hub:**
   - Incorporación de opción "Descripción" en el menú contextual de 3 puntos (`TaskActionMenu`, `ShoppingActionMenu`, `CleaningActionMenu`).
   - Modal flotante centrado para lectura, edición con límite Decisión 2B (1000 caracteres) y borrado directo ("Borrar descripción").

### 5. Alcance Final
- **IN-SCOPE (Consolidado e implementado):**
  - 14 archivos en `src/filters/*` cubriendo tipos, motores, modales, hooks y popovers.
  - Orquestación viva en `src/App.tsx` y suite de integración end-to-end en `src/App.test.tsx`.
  - Barra de herramientas reactiva en `src/hub/components/HubContainer.tsx`.
  - Sincronización sin latencia en los 3 acordeones del Hub.
  - Menús contextuales con modal de descripción en `tasks`, `shopping` y `cleaning`.
- **OUT-OF-SCOPE (Preservado para RV-A07):**
  - Arrastre interactivo hacia la cuadrícula del calendario (Drag & Drop asignado a `RV-A07`).
  - Persistencia de vistas o filtros en backend (los filtros y el orden son 100% en cliente).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 18/19 con TypeScript 5.x estricto.
- **Estilos:** CSS Modules consumiendo `src/theme/tokens.css`.
- **Testing:** Vitest 3.2.7 con `@testing-library/react` y `@testing-library/user-event`.

### 7. Contratos Finales Afectados
- **Contratos Funcionales (`PVF-A06.01`, `PVF-A06.02`, `PVF-A06.03`):**
  - Filtrado acumulativo AND con ocultamiento real de tarjetas en la pantalla.
  - Reactividad en caliente ante mutaciones sin recarga de página.
  - Reordenación física de tarjetas en la interfaz con desempate determinista.
- **Contratos de Datos:** `FilterCriteria`, `SortConfiguration`, `SortableItem`.

### 8. Restricciones Finales
- Desempate determinista absoluto por `createdAt ASC` garantizado.
- Regla innegociable de `nulls last` en fechas.
- Límite de 1000 caracteres en descripción (Decisión 2B).
- Inmutabilidad estricta: `sortItems` y `applyFilters` nunca mutan las colecciones de entrada.
- Cero efectos de red: operaciones puras en memoria.

### 9. Diseño Técnico Final
- **Arquitectura de Archivos en `src/filters/`:**
  - `types/`: `filter.types.ts`, `sort.types.ts`.
  - `utils/`: `filterEngine.ts`, `sortEngine.ts` (con sus suites de test).
  - `hooks/`: `useItemFilters.ts` (con su suite de test).
  - `components/`: `FilterModal.tsx`, `SortMenu.tsx` (con sus estilos y tests).
- **Orquestación en `src/App.tsx`:**
  - Conecta `useItemFilters` y `sortEngine`, canalizando los datos procesados hacia los acordeones del Hub.

### 10. Flujo Operativo Final
1. El usuario interactúa con la barra del Hub: pulsa `[Filtrar]` o `[Reordenar]`.
2. Se abre el diálogo o popover correspondiente.
3. El usuario aplica un filtro o selecciona un criterio de ordenación.
4. En caliente (<16ms), `App.tsx` evalúa `applyFilters` y `sortItems`.
5. Los tres acordeones (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`) actualizan su renderizado visual instantáneamente.
6. Si hay filtros activos, se despliega el botón `[Limpiar]` y el badge `[Filtrar (N)]`.
7. Si el usuario consulta o edita una descripción en una tarjeta, el menú de 3 puntos despliega el modal de descripción centrado.

### 11. Casos Válidos Finales
- **Caso 1 (Orden por Prioridad con Desempate):** Alta a Baja sitúa tareas de alta prioridad primero; tareas con igual prioridad se desempatan fijamente por `createdAt ASC`.
- **Caso 2 (Orden por Fecha con Nulls Last):** Tareas con fecha se listan cronológicamente; tareas sin fecha se posicionan obligatoriamente al final.
- **Caso 3 (Orden Alfabético y Estado):** Reorganización lexicográfica y por estado completado funcional.
- **Caso 4 (Integración End-to-End):** Filtrado y reordenación comprobados desde `App.test.tsx` sobre las tarjetas reales en pantalla.
- **Caso 5 (Modal de Descripción):** Lectura, edición hasta 1000 caracteres y borrado directo desde el menú de 3 puntos.

### 12. Casos Inválidos Finales
- Arrays vacíos o nulos devuelven `[]` sin arrojar excepciones.
- Strings con caracteres especiales ordenados correctamente mediante `localeCompare` en español.

### 13. Tests Requeridos Finales
- 12 tests en `sortEngine.test.ts`.
- 6 tests en `SortMenu.test.tsx`.
- 12 tests en `HubContainer.test.tsx`.
- 12 tests en `App.test.tsx`.
- 35 tests en menús de acción con modal de descripción (`TaskActionMenu`, `ShoppingActionMenu`, `CleaningActionMenu`).
- 60 tests en el subsistema de filtros (`filterEngine`, `FilterModal`, `useItemFilters`).
- **Total Repositorio:** 261 tests en verde a lo largo de 32 suites (100% GREEN).

### 14. Quality Gates Finales
- `QG-01 · Typecheck Estricto:` `tsc --noEmit` superado con 0 errores.
- `QG-02 · Tests Suite Completa:` 261/261 tests en verde en Vitest.
- `QG-03 · Build de Producción:` Empaquetado Vite completado en 1.91s sin advertencias.
- `QG-04 · Verificación Funcional UI (PVF-A06.01..03):` Certificada con tests de integración end-to-end en `App.test.tsx`.
- `QG-05 · Cierre de Rebanada Vertical:` Certificado de sellado formal aprobado.

### 15. Archivos Reales Afectados
```
Creados (14 archivos):
- src/filters/types/filter.types.ts
- src/filters/utils/filterEngine.ts
- src/filters/utils/filterEngine.test.ts
- src/filters/components/FilterModal.tsx
- src/filters/components/FilterModal.module.css
- src/filters/components/FilterModal.test.tsx
- src/filters/hooks/useItemFilters.ts
- src/filters/hooks/useItemFilters.test.ts
- src/filters/types/sort.types.ts
- src/filters/utils/sortEngine.ts
- src/filters/utils/sortEngine.test.ts
- src/filters/components/SortMenu.tsx
- src/filters/components/SortMenu.module.css
- src/filters/components/SortMenu.test.tsx

Modificados (17 archivos):
- src/App.tsx
- src/App.test.tsx
- src/hub/components/HubContainer.tsx
- src/hub/components/HubContainer.module.css
- src/hub/components/HubContainer.test.tsx
- src/hub/components/TasksAccordion.tsx
- src/hub/components/ShoppingAccordion.tsx
- src/hub/components/CleaningAccordion.tsx
- src/tasks/components/TaskActionMenu.tsx
- src/tasks/components/TaskActionMenu.module.css
- src/tasks/components/TaskActionMenu.test.tsx
- src/shopping/components/ShoppingActionMenu.tsx
- src/shopping/components/ShoppingActionMenu.module.css
- src/shopping/components/ShoppingActionMenu.test.tsx
- src/cleaning/components/CleaningActionMenu.tsx
- src/cleaning/components/CleaningActionMenu.module.css
- src/cleaning/components/CleaningActionMenu.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
La FIA original no detallaba la necesidad de un modal centrado de descripción en las tarjetas del Hub ni la sincronización en fase de render de los acordeones. Ambos elementos fueron introducidos e integrados durante la ejecución para garantizar una UX táctica limpia y erradicar la latencia de refresco en la UI.

### 17. Drift Integrado
- Icono de lupa `🔍` en el botón `[Filtrar]` en sustitución del icono inicial de rayo.
- Badge dinámico de conteo `[Filtrar (N)]` y botón `[Limpiar]`.
- Modal de descripción (lectura, edición y borrado directo) integrado en los tres menús de acción.

### 18. Decisiones de Cambio (CHG) Integradas
- **CHG Ajustes Post-Implementación Senior:** Requerimiento formal de cableado end-to-end en `App.tsx`, sincronización en fase de render en los acordeones y modal de descripción en las tarjetas.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad táctica **FIA-A06.03** y la totalidad de la rebanada vertical **`RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)`** se encuentran **100% implementadas, integradas en la interfaz real, verificadas con 261 tests en verde, auditadas y selladas con LOCK definitivo**.

**Queda formalmente autorizada la apertura de:**  
`RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)` -> **`FIA-A07.01`**.
