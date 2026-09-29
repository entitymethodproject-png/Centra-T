# CENTRA-T · FIA-A06.02 · HOOK USEITEMFILTERS, REACTIVIDAD EN CALIENTE Y BOTÓN [LIMPIAR FILTROS] (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A06.02.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A06.02`
- **Rebanada Vertical:** `RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)`
- **Unidad Implementada:** `Hook useItemFilters, Reactividad en Caliente y Botón [Limpiar Filtros]`
- **PVF de Cierre Cubierta:** `PVF-A06.02 · Reactividad en Caliente y Botón [Limpiar Filtros]`
- **VF Interna de Derivación:** `VF-A06.02 · Reactividad en Caliente y Reseteo de Filtros`
- **Objetivo Indexado:** `Implementar hook reactivo en memoria que filtra listas de tareas, compra y limpieza ante cambios de estado de ítems, y botón [Limpiar Filtros] para restablecer valores por defecto.`
- **Validación Final:** [`src/filters/hooks/useItemFilters.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/hooks/useItemFilters.ts), [`src/hub/components/HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx)
- **Evidencia de Cierre:** 10/10 tests de `useItemFilters.test.ts` (100%), 10/10 tests de `HubContainer.test.tsx` (100%), 226/226 tests globales pasando en 30 suites en Vitest 3.2.7, Typecheck 0 errores (`tsc --noEmit`), build de producción Vite en 1.89s.
- **LOCK Previo Requerido:** `LOCK-FIA-A06.01.md APROBADO`
- **Estado Documental:** `AS-BUILT consolidado oficial. Actúa como LOCK formal de la unidad y base física irrefutable para FIA-A06.03.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A06.02).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: PVF-A06.02 / VF-A06.02).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema filters_and_sort en Frontend).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 06: Desacoplamiento de Estado Nivel 2 - UI Client State).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 5.1: Proceso `Aplicar_Filtros_Combinados_AND`).
  - `SPEC-FIA-A06.02.md` (Especificación técnica ejecutada).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` verificado tras sellado de `FIA-A06.02`.
- **Métricas de Compilación y Calidad:**
  - Vitest 3.2.7: 226/226 tests en verde (100% de éxito en 30 suites).
  - TypeScript 5.x (`tsc --noEmit`): Cero errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 1.89s sin advertencias.
  - Cero regresiones respecto a unidades previas.

### 4. Objetivo Implementado
Materializar con fidelidad fotográfica la reactividad en caliente del filtrado en memoria:
1. **Hook Reactivo Memoizado (`useItemFilters.ts`):** Orquestador de cliente que conecta las colecciones de datos con el motor puro [`filterEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/filterEngine.ts) mediante `useMemo` con dependencias en `[items, criteria]`, garantizando tiempos de respuesta inferiores a 16ms.
2. **Reactividad en Caliente (Hot Reactivity):** Al conmutar el estado de completado de un ítem o editar sus propiedades, la lista filtrada recalculada expulsa o incorpora el ítem de forma inmediata sin necesidad de reabrir el modal ni recargar la pantalla.
3. **Telemetría de Filtros:** Cálculo determinista de `isFiltered` y conteo numérico de criterios activos `activeFilterCount` (0..3).
4. **Integración en Hub y Botón [Limpiar Filtros]:** Inclusión accesible del botón `[Limpiar]` en la barra de control de [`HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx) junto a `[Filtrar (N)]`, visible únicamente cuando existen filtros activos, restableciendo de forma instantánea todos los ítems a la vista.
5. **Cero Efectos Secundarios:** Sin mutaciones sobre colecciones originales ni almacenamiento en persistencia remota.

### 5. Alcance Final
- **IN-SCOPE (Consolidado e implementado):**
  - [`src/filters/hooks/useItemFilters.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/hooks/useItemFilters.ts): Hook genérico inmutable con mutadores atómicos (`setPriority`, `setDateCriteria`, `setStatus`), mutador total (`setCriteria`), reseteo (`resetFilters`) y telemetría (`isFiltered`, `activeFilterCount`).
  - [`src/filters/hooks/useItemFilters.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/hooks/useItemFilters.test.ts): 10 tests exhaustivos con `renderHook` y `act`.
  - [`src/hub/components/HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx) y styles: Botón `[Limpiar]` y badge numérico `[Filtrar (N)]`.
  - [`src/hub/components/HubContainer.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.test.tsx): 10 tests de integración.
- **OUT-OF-SCOPE (Preservado para unidades posteriores):**
  - Motor de ordenación multinivel y componente `SortMenu` (asignado a `FIA-A06.03`).
  - Drag & Drop hacia el calendario (pertenece a `RV-A07`).
  - Persistencia de filtros en base de datos.

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 18/19 con TypeScript 5.x estricto.
- **Estilos:** CSS Modules consumiendo `src/theme/tokens.css`.
- **Testing:** Vitest 3.2.7 con `@testing-library/react` y `@testing-library/react-hooks`.

### 7. Contratos Finales Afectados
- **Contrato de Interfaz del Hook:**
  ```typescript
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
- **Contrato Funcional (PVF-A06.02 / VF-A06.02):**
  - Reactividad inmediata ante mutaciones en memoria (<16ms).
  - Invocación de `resetFilters()` restaura `DEFAULT_FILTER_CRITERIA` y la totalidad de los ítems.

### 8. Restricciones Finales
- Inmutabilidad estricta: `useItemFilters` nunca muta las referencias del array de entrada.
- Rendimiento: Recálculo en caliente verificado dentro de la ventana de refresco de 60 FPS (<16ms).
- Screaming Architecture: Artefactos confinados en `src/filters/hooks/`.
- Cero efectos de red: Operación puramente local en memoria.

### 9. Diseño Técnico Final
- **Arquitectura de Archivos:**
  - `src/filters/hooks/useItemFilters.ts`: Encapsula estado con `useState`, callbacks con `useCallback` y computación memoizada de `filteredItems`, `isFiltered` y `activeFilterCount` con `useMemo`.
  - `src/hub/components/HubContainer.tsx`: Consume `isFilterActive`, `activeFilterCount` y `onClearFilters`, renderizando el grupo de filtrado en la barra superior lateral.

### 10. Flujo Operativo Final
1. La vista se inicializa con los ítems y criterios neutros (`DEFAULT_FILTER_CRITERIA`).
2. El usuario abre el modal y aplica un filtro (ej. `SOLO_PENDIENTES`).
3. El hook actualiza `criteria`, computa `filteredItems` y marca `isFiltered = true` con `activeFilterCount = 1`.
4. El Hub despliega el badge `[Filtrar (1)]` y el botón `[Limpiar]`.
5. El usuario marca un checkbox de una tarea: pasa a `completado = true`.
6. En caliente (<16ms), `useMemo` reevalúa la lista y excluye la tarea completada sin recargar la página.
7. El usuario pulsa `[Limpiar]`: se invoca `resetFilters()`, se restaura la vista neutra y se oculta el botón `[Limpiar]`.

### 11. Casos Válidos Finales
- **Caso 1 (Inicialización Neutra):** Retorno íntegro de la colección con `isFiltered = false` y `activeFilterCount = 0`.
- **Caso 2 (Mutadores Atómicos):** `setPriority`, `setStatus` y `setDateCriteria` actualizan sus respectivas dimensiones con recálculo determinista.
- **Caso 3 (Reactividad ante Mutación de Ítem):** Conmutar un ítem a completado lo excluye reactivamente si el filtro `SOLO_PENDIENTES` está activo.
- **Caso 4 (Reactividad ante Inserción):** Nuevos ítems que cumplen el filtro activo se incorporan inmediatamente a `filteredItems`.
- **Caso 5 (Reseteo Integral):** `resetFilters()` restaura la colección original completa y apaga los indicadores de filtro activo.

### 12. Casos Inválidos Finales
- **Caso Inválido 1 (Colecciones Nulas):** El hook tolera entradas `null` o `undefined` devolviendo de forma segura `filteredItems = []`.

### 13. Tests Requeridos Finales
- **Suite del Hook (`useItemFilters.test.ts`):** 10 tests unitarios y de reactividad en caliente en Vitest (100% GREEN).
- **Suite de Integración Hub (`HubContainer.test.tsx`):** 10 tests validando renderizado de `[Filtrar (N)]` y botón `[Limpiar]`.
- **Total Proyecto:** 226 tests en verde (100% de éxito en 30 suites).

### 14. Quality Gates Finales
- `QG-01 · Typecheck Estricto:` `tsc --noEmit` superado con 0 errores.
- `QG-02 · Tests Suite Completa:` 226/226 tests en verde en Vitest.
- `QG-03 · Build de Producción:` Empaquetado Vite generado limpiamente en 1.89s.
- `QG-04 · Anti-Drift Scan:` Cero modificaciones en módulos de tareas, compras, limpieza o backend.
- `QG-05 · Aislamiento en Cliente:` Cero llamadas HTTP y cero persistencia remota.

### 15. Archivos Reales Afectados
```
Creados:
- src/filters/hooks/useItemFilters.ts
- src/filters/hooks/useItemFilters.test.ts

Modificados:
- src/hub/components/HubContainer.tsx
- src/hub/components/HubContainer.module.css
- src/hub/components/HubContainer.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La unidad cumplió milimétricamente las especificaciones.

### 17. Drift Integrado
- Incorporación del badge dinámico de conteo en la etiqueta del botón `[Filtrar (N)]` cuando `activeFilterCount > 0` para una mejor retroalimentación visual al usuario.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún cambio formal requerido.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad táctica **FIA-A06.02** se encuentra **100% implementada, verificada, auditada y sellada con LOCK definitivo**.

**Queda formalmente autorizada la apertura de:**  
`RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)` -> **`FIA-A06.03`**.
