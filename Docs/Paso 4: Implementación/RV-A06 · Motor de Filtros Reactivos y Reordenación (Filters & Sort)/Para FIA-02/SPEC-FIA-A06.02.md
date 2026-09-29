# SPEC-FIA-A06.02 · HOOK USEITEMFILTERS, REACTIVIDAD EN CALIENTE Y BOTÓN [LIMPIAR FILTROS]

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A06 (HOOK REACTIVO EN MEMORIA, REACTIVIDAD EN CALIENTE Y BOTÓN DE LIMPIEZA)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A06.02 · Hook useItemFilters, Reactividad en Caliente y Botón [Limpiar Filtros]  
**PVF de Cierre:** PVF-A06.02 · Reactividad en Caliente y Botón [Limpiar Filtros]  
**VF:** VF-A06.02 · Reactividad en Caliente y Reseteo de Filtros  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A06.01.md APROBADO (FIA-A06.01_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el hook reactivo de cliente [`useItemFilters`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/hooks/useItemFilters.ts) y la reactividad en caliente del Hub para el Agente Implementador (Antigravity CLI). Esta unidad táctica abarca:
1. El hook de React [`src/filters/hooks/useItemFilters.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/hooks/useItemFilters.ts), que conecta las colecciones de datos en memoria con el motor de evaluación lógica AND ([`filterEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/filterEngine.ts)).
2. El recálculo reactivo en caliente de la vista filtrada ante cualquier mutación de un ítem (cambio de estado completado, prioridad, inserción o borrado) en menos de 16ms sin recargar la página.
3. La telemetría de estado activo (`isFiltered`, `activeFilterCount`) y la función de restablecimiento `resetFilters()`.
4. La integración visual accesible del control `[Limpiar Filtros]` en la barra de herramientas del Hub ([`HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx)) visible exclusivamente cuando existan filtros activos.
5. Las suites de pruebas exhaustivas del hook con `renderHook` y la integración en interfaz.

---

## 2. Objetivo
Construir y verificar con TDD en Vitest:
1. El hook genérico `useItemFilters<T extends FilterableItem>(items: T[], initialCriteria?: FilterCriteria)` con:
   - `criteria`: Criterios activos actuales.
   - `filteredItems`: Colección resultante memoizada mediante `useMemo` sobre `[items, criteria]`.
   - `isFiltered`: Booleano determinista que indica si al menos un criterio difiere del valor por defecto.
   - `activeFilterCount`: Conteo numérico (0..3) de criterios activos aplicados.
   - `setCriteria(criteria)`: Sustitución íntegra de criterios.
   - `setPriority(priority)`: Actualización aislada de la dimensión de prioridad.
   - `setDateCriteria(dateCriteria)`: Actualización de la dimensión temporal.
   - `setStatus(status)`: Actualización de la dimensión de completitud.
   - `resetFilters()`: Reversión inmediata a `DEFAULT_FILTER_CRITERIA`.
2. Actualización de [`HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx) para admitir las props `onClearFilters?: () => void` y `activeFilterCount?: number`, renderizando un botón secundario accesible `[Limpiar]` / `[Limpiar Filtros]` junto al botón `[Filtrar]` cuando `isFilterActive` sea `true`.
3. 100% de tests del proyecto en verde (mínimo 225+ tests totales en Vitest).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A06.01_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos y Módulos Existentes:**
  - `src/filters/types/filter.types.ts`: Tipos `FilterPriority`, `FilterStatus`, `FilterDateCriteria`, `FilterCriteria` y constante `DEFAULT_FILTER_CRITERIA`.
  - `src/filters/utils/filterEngine.ts`: Funciones `isDateMatching`, `evaluateItemFilter`, `applyFilters`.
  - `src/filters/components/FilterModal.tsx`: Modal con buffer desacoplado, validación y soporte de Escape.
  - `src/hub/components/HubContainer.tsx`: Contenedor lateral con botón `[Filtrar]` accesible.
- **Estado de Tests y Compilación:**
  - 212/212 tests pasando al 100% en 29 suites en Vitest.
  - `tsc --noEmit`: 0 errores en TypeScript 5.x estricto.
  - Build de producción: Generado limpiamente en 1.82s.
- **Riesgos Iniciales:**
  - El hook debe evitar la creación de loops infinitos de re-renderizado asegurando que `applyFilters` solo se invoque cuando cambien efectivamente las referencias de `items` o los valores de `criteria`.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `src/filters/hooks/useItemFilters.ts` completamente tipado e inmutable.
2. Existirá `src/filters/hooks/useItemFilters.test.ts` con cobertura del 100% en todas sus funciones y reactividad en caliente.
3. `HubContainer.tsx` contará con soporte para el botón `[Limpiar Filtros]` cuando haya filtros activos.
4. Las listas del Hub reaccionarán instantáneamente en caliente ante la mutación de estado de cualquier tarea sin necesidad de reabrir el modal ni recargar.
5. El total de tests aumentará a un mínimo de 225+ tests en verde sin ninguna regresión.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- Firma del Hook:
  ```typescript
  export function useItemFilters<T extends FilterableItem>(
    items: T[],
    initialCriteria?: FilterCriteria
  ): UseItemFiltersResult<T>
  ```
- Si `items` es `undefined` o `null`, el hook opera con tolerancia devolviendo `filteredItems = []`.

### 5.2 Contrato de Interfaz Visual
- En `HubContainer.tsx`:
  - Si `isFilterActive === true` y se provee `onClearFilters`: se renderiza un botón `[Limpiar]` accesible con glifo de aspa o texto limpio en la `toggleBar`.
  - Si `isFilterActive === false`: dicho botón permanece oculto.

### 5.3 Contrato de Aislamiento
- El hook opera estrictamente en memoria (`UI Client State`). No realiza llamadas a APIs remotas ni muta el array recibido por parámetro.

### 5.4 Contrato de Dominio / Tipos
```typescript
import { FilterCriteria, FilterPriority, FilterDateCriteria, FilterStatus } from '../types/filter.types';
import { FilterableItem } from '../utils/filterEngine';

export interface UseItemFiltersResult<T extends FilterableItem> {
  criteria: FilterCriteria;
  filteredItems: T[];
  isFiltered: boolean;
  activeFilterCount: number;
  setCriteria: (criteria: FilterCriteria) => void;
  setPriority: (priority: FilterPriority) => void;
  setDateCriteria: (dateCriteria: FilterDateCriteria) => void;
  setStatus: (status: FilterStatus) => void;
  resetFilters: () => void;
}
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
1. `src/filters/hooks/useItemFilters.ts`: Hook reactivo principal.
2. `src/filters/hooks/useItemFilters.test.ts`: Suite de pruebas exhaustiva con `renderHook` y `act`.

### 6.2 Modificar (Archivos existentes del repo a alterar)
1. `src/hub/components/HubContainer.tsx`: Añadir props `onClearFilters?: () => void` y `activeFilterCount?: number`, y renderizar el botón `[Limpiar]` cuando `isFilterActive` sea true.
2. `src/hub/components/HubContainer.module.css`: Añadir clases `.clearFilterButton` y sus estados de hover/focus.
3. `src/hub/components/HubContainer.test.tsx`: Añadir pruebas validando la aparición y el clic en `[Limpiar]`.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/filters/types/filter.types.ts`: Tipos base.
- `src/filters/utils/filterEngine.ts`: Motor evaluador puro.
- `src/filters/components/FilterModal.tsx`: Diálogo modal.
- `src/tasks/**/*`, `src/shopping/**/*`, `src/cleaning/**/*`: Módulos de datos.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- Servidores backend y controladores REST.
- Algoritmos de ordenación multinivel (`SortMenu` asignado a `FIA-A06.03`).
- Almacenamiento persistente (`localStorage`, `sessionStorage` para filtros).

---

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `SUITE_ARQUITECTURA_UI.docx`, `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A06.02), `FIA-A06.01_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 18/19, TypeScript 5.x estricto, Vitest 3.2.7, `@testing-library/react`.
- **Dependencia Secuencial:** Requiere `LOCK-FIA-A06.01.md`. Desbloquea `FIA-A06.03`.

---

## 8. Restricciones
- El recálculo de `filteredItems` debe realizarse en memoria en menos de 16ms.
- El array original de `items` debe tratarse como inmutable.
- Prohibido introducir librerías de estado global (Redux, MobX, etc.). Se utiliza React state y `useMemo` nativos.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests (RED):**
  - Crear `src/filters/hooks/useItemFilters.test.ts` con todas las pruebas para `useItemFilters` (cálculo de `filteredItems`, reactividad ante cambio de criterios, reactividad en caliente ante mutación de un ítem en `items`, flags `isFiltered` y función `resetFilters`).
- **Paso 2 — Validar Fallo Inicial:**
  - Ejecutar `npx vitest run src/filters/hooks/useItemFilters.test.ts` y certificar que falla por inexistencia del hook (`RED`).
- **Paso 3 — Implementar Mínimo (GREEN):**
  - Crear `src/filters/hooks/useItemFilters.ts` implementando la lógica memoizada con `useMemo`, los estados y las funciones de mutación de criterios.
  - Reejecutar las pruebas del hook hasta alcanzar el 100% en verde.
- **Paso 4 — Integrar en Hub:**
  - Actualizar `src/hub/components/HubContainer.tsx` y `HubContainer.module.css` para admitir `onClearFilters` y `activeFilterCount`, renderizando el botón de reseteo cuando haya filtros activos.
  - Actualizar `src/hub/components/HubContainer.test.tsx` para validar el botón `[Limpiar]`.
- **Paso 5 — Ejecutar Tests Completos:**
  - Correr `npm run test` verificando que todas las suites pasen limpiamente (mínimo 225+ tests en verde).
- **Paso 6 — Ejecutar Quality Gates:**
  - `npm run typecheck` (`tsc --noEmit`).
  - `npm run build` certificando empaquetado de producción limpio.
- **Paso 7 — Estado Documental:**
  - Preparar las deltas para `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A06.02.md` y `TEST_REPORT_FIA-A06.02.md`.
  - Proponer `LOCK-FIA-A06.02.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 Implementación del Hook (`src/filters/hooks/useItemFilters.ts`)
```typescript
import { useState, useMemo, useCallback } from 'react';
import {
  FilterCriteria,
  FilterPriority,
  FilterDateCriteria,
  FilterStatus,
  DEFAULT_FILTER_CRITERIA,
} from '../types/filter.types';
import { FilterableItem, applyFilters } from '../utils/filterEngine';

export interface UseItemFiltersResult<T extends FilterableItem> {
  criteria: FilterCriteria;
  filteredItems: T[];
  isFiltered: boolean;
  activeFilterCount: number;
  setCriteria: (criteria: FilterCriteria) => void;
  setPriority: (priority: FilterPriority) => void;
  setDateCriteria: (dateCriteria: FilterDateCriteria) => void;
  setStatus: (status: FilterStatus) => void;
  resetFilters: () => void;
}

export function useItemFilters<T extends FilterableItem>(
  items: T[],
  initialCriteria?: FilterCriteria
): UseItemFiltersResult<T> {
  const [criteria, setCriteriaState] = useState<FilterCriteria>(
    initialCriteria || DEFAULT_FILTER_CRITERIA
  );

  const setCriteria = useCallback((newCriteria: FilterCriteria) => {
    setCriteriaState(newCriteria);
  }, []);

  const setPriority = useCallback((prioridad: FilterPriority) => {
    setCriteriaState((prev) => ({ ...prev, prioridad }));
  }, []);

  const setDateCriteria = useCallback((fecha: FilterDateCriteria) => {
    setCriteriaState((prev) => ({ ...prev, fecha }));
  }, []);

  const setStatus = useCallback((estado: FilterStatus) => {
    setCriteriaState((prev) => ({ ...prev, estado }));
  }, []);

  const resetFilters = useCallback(() => {
    setCriteriaState(DEFAULT_FILTER_CRITERIA);
  }, []);

  const isFiltered = useMemo(() => {
    return (
      criteria.prioridad !== 'TODAS' ||
      criteria.fecha.activo ||
      criteria.estado !== 'TODOS'
    );
  }, [criteria]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (criteria.prioridad !== 'TODAS') count += 1;
    if (criteria.fecha.activo) count += 1;
    if (criteria.estado !== 'TODOS') count += 1;
    return count;
  }, [criteria]);

  const filteredItems = useMemo(() => {
    return applyFilters(items || [], criteria);
  }, [items, criteria]);

  return {
    criteria,
    filteredItems,
    isFiltered,
    activeFilterCount,
    setCriteria,
    setPriority,
    setDateCriteria,
    setStatus,
    resetFilters,
  };
}
```

### 10.2 Integración en Hub (`src/hub/components/HubContainer.tsx`)
- Actualizar `HubContainerProps`:
  ```typescript
  export interface HubContainerProps {
    children?: React.ReactNode;
    initialCollapsed?: boolean;
    onToggle?: (collapsed: boolean) => void;
    onFilterClick?: () => void;
    isFilterActive?: boolean;
    onClearFilters?: () => void;
    activeFilterCount?: number;
  }
  ```
- Renderizar en `toggleBar` cuando `!isCollapsed && isFilterActive && onClearFilters`:
  ```tsx
  {isFilterActive && onClearFilters && (
    <button
      type="button"
      aria-label="Limpiar filtros"
      className={styles.clearFilterButton}
      onClick={onClearFilters}
      title="Restablecer filtros a valores por defecto"
    >
      <span className={styles.clearIcon} aria-hidden="true">✕</span>
      <span className={styles.clearText}>Limpiar</span>
    </button>
  )}
  ```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios del Hook (`useItemFilters.test.ts`)
- `debería inicializarse con criterios neutros e isFiltered en false`.
- `debería retornar todos los items cuando no hay filtros activos`.
- `debería actualizar prioridad con setPriority y recalcular filteredItems`.
- `debería actualizar estado con setStatus y recalcular filteredItems`.
- `debería actualizar fecha con setDateCriteria y recalcular filteredItems`.
- `debería reevaluar en caliente cuando muta una propiedad de un item en el array (ej. completado pasa de false a true con filtro SOLO_PENDIENTES)`.
- `debería reevaluar en caliente al añadir un nuevo item a la colección`.
- `debería calcular activeFilterCount con precisión según los criterios activos`.
- `debería restaurar DEFAULT_FILTER_CRITERIA y restablecer todos los items al invocar resetFilters()`.
- `debería manejar de forma segura entradas nulas o undefined de items`.

### 11.2 Tests de Integración en Hub (`HubContainer.test.tsx`)
- `debería renderizar el botón [Limpiar] cuando isFilterActive={true} y se provee onClearFilters`.
- `debería no renderizar el botón [Limpiar] cuando isFilterActive={false}`.
- `debería invocar onClearFilters al hacer clic en el botón [Limpiar]`.

### 11.3 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores.
- `QG-02 · Compilación de Producción:` `npm run build` sin advertencias.
- `QG-03 · Test Suite:` 100% de tests en verde en Vitest (mínimo 225+ tests pasando).
- `QG-04 · Anti-Drift Scan:` Cero modificaciones en capas de persistencia o backend.
- `QG-05 · No-Secret Scan:` Cero credenciales ni tokens en los nuevos archivos.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)",
  "completed_fias": [
    "FIA-A01.01", "FIA-A01.02", "FIA-A01.03",
    "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05",
    "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05",
    "FIA-A04.01", "FIA-A04.02", "FIA-A04.03",
    "FIA-A05.01", "FIA-A05.02", "FIA-A05.03",
    "FIA-A06.01",
    "FIA-A06.02"
  ],
  "latest_locked_fia": "FIA-A06.02",
  "architectural_decisions_applied": [
    "Hook reactivo useItemFilters en memoria con evaluación memoizada <16ms",
    "Reactividad en caliente ante mutación de completado o inserción de ítems sin recarga de página",
    "Botón [Limpiar Filtros] integrado en barra de control del Hub para reseteo neutro instantáneo"
  ],
  "unlocked_next": "FIA-A06.03 · Panel de Reordenación y Motor de Ordenación Multinivel"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/filters/hooks/useItemFilters.ts",
    "src/filters/hooks/useItemFilters.test.ts"
  ],
  "files_modified": [
    "src/hub/components/HubContainer.tsx",
    "src/hub/components/HubContainer.module.css",
    "src/hub/components/HubContainer.test.tsx"
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
    "HubContainer",
    "FilterModal",
    "TasksAccordion",
    "ShoppingAccordion",
    "CleaningAccordion",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "filter_hook": "reactividad_en_caliente_activa_con_memoizacion",
    "hub_toolbar": "boton_filtrar_y_boton_limpiar_reactivos"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `useItemFilters.ts` y su suite de pruebas están implementados y verificados.
2. `HubContainer.tsx` integra el botón de limpieza condicional y sus tests pasan al 100%.
3. Los 8 pasos del plan fueron ejecutados en secuencia.
4. Los 5 Quality Gates pasaron limpiamente.
5. Se generaron `IMPLEMENTATION_REPORT_FIA-A06.02.md` y `TEST_REPORT_FIA-A06.02.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A06.02`. Queda terminantemente prohibido avanzar a `FIA-A06.03` en la misma sesión.
- **TDD Estricto:** Escribe las pruebas en `src/filters/hooks/useItemFilters.test.ts` antes de la implementación del hook y valida que fallen en rojo (`RED`).
- **Rendimiento Memoizado:** Asegura que `useMemo` envuelva la llamada a `applyFilters` para evitar degradación de FPS en listas grandes.
- **Parada Obligatoria:** Tras superar los Quality Gates, generar los reportes y proponer `LOCK-FIA-A06.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
