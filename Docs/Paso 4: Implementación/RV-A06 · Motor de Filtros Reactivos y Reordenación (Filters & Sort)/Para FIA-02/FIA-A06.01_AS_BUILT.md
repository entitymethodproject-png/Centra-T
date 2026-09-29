# CENTRA-T · FIA-A06.01 · MODAL DE FILTROS COMBINADOS Y EVALUACIÓN LÓGICA AND (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A06.01.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A06.01`
- **Rebanada Vertical:** `RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)`
- **Unidad Implementada:** `Modal de Filtros Combinados y Evaluación Lógica AND`
- **PVF de Cierre Cubierta:** `PVF-A06.01 · Panel de Filtros Combinados y Lógica AND (Botón [Filtrar])`
- **VF Interna de Derivación:** `VF-A06.01 · Panel de Filtros Combinados y Evaluación Lógica AND`
- **Objetivo Indexado:** `Construir componente modal de filtros desplegable mediante botón [Filtrar] del Hub con selectores de Prioridad, Fecha/Rango y Estado bajo lógica AND acumulativa.`
- **Validación Final:** [`src/filters/components/FilterModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/FilterModal.tsx), [`src/filters/utils/filterEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/filterEngine.ts), [`src/hub/components/HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx)
- **Evidencia de Cierre:** 32/32 tests de la unidad pasando (100%), 212/212 tests globales pasando en 29 suites, Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 1.82s.
- **LOCK Previo Requerido:** `LOCK-FIA-A05.03.md APROBADO`
- **Estado Documental:** `AS-BUILT consolidado oficial. Actúa como LOCK formal de la unidad y base física irrefutable para FIA-A06.02.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A06.01).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: PVF-A06.01 / VF-A06.01).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema filters_and_sort en Frontend).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 y 08: Topología del Hub y Directrices de Botones Secundarios).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 5.1: Proceso `Aplicar_Filtros_Combinados_AND`).
  - `SPEC-FIA-A06.01.md` (Especificación técnica ejecutada).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` verificado tras cierre de `FIA-A06.01`.
- **Métricas de Compilación y Calidad:**
  - Vitest 3.2.7: 212/212 tests en verde (100% de éxito en 29 suites).
  - TypeScript 5.x (`tsc --noEmit`): Cero errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 1.82s sin advertencias.
  - Cero regresiones respecto a RV-A01, RV-A02, RV-A03, RV-A04 y RV-A05.

### 4. Objetivo Implementado
Materializar con fidelidad milimétrica la infraestructura de filtrado en cliente:
1. **Contratos Tipados Inmutables (`filter.types.ts`):** Definición de tipos canónicos `FilterPriority` (`'TODAS' | 'alta' | 'media' | 'baja'`), `FilterStatus` (`'TODOS' | 'SOLO_PENDIENTES' | 'SOLO_COMPLETADAS'`), `FilterDateCriteria` (modo puntual o rango con strings ISO YYYY-MM-DD) y la constante neutra `DEFAULT_FILTER_CRITERIA`.
2. **Motor Puro de Conjunción Lógica AND (`filterEngine.ts`):** Funciones matemáticas puras `evaluateItemFilter` y `applyFilters` que aplican evaluación acumulativa sin mutación de arrays. Comparador de fechas seguro `isDateMatching` con soporte para strings y objetos `Date`.
3. **Modal Accesible con Buffer Desacoplado (`FilterModal.tsx`):** Diálogo modal (`Floating Layer`, `z-index: 1000`) con `role="dialog"`, `aria-modal="true"`. Las modificaciones se mantienen en un buffer local; cancelar o pulsar `Escape` descarta el buffer; `[Limpiar Filtros]` restaura los valores por defecto; y `[Aplicar Filtros]` emite el snapshot de criterios.
4. **Integración en Hub (`HubContainer.tsx`):** Botón accesible `[Filtrar]` en la barra de control del panel lateral con indicador visual de filtro activo.
5. **Cero Llamadas de Red y Cero Persistencia:** El motor de filtrado opera de forma pura en memoria del cliente.

### 5. Alcance Final
- **IN-SCOPE (Consolidado e implementado):**
  - `src/filters/types/filter.types.ts`: Tipos, interfaces y constantes por defecto.
  - `src/filters/utils/filterEngine.ts`: Lógica matemática pura de evaluación AND y función `applyFilters`.
  - `src/filters/components/FilterModal.tsx` y `FilterModal.module.css`: Diálogo modal accesible con buffer desacoplado, validación de fechas (`fechaInicio <= fechaFin`) y descarte por tecla `Escape`.
  - `src/hub/components/HubContainer.tsx`: Botón `[Filtrar]` accesible en el Hub lateral.
  - 32 tests de la unidad (21 unitarios del motor, 11 del modal).
- **OUT-OF-SCOPE (Preservado para unidades posteriores):**
  - Hook de reactividad en caliente `useItemFilters` (asignado a `FIA-A06.02`).
  - Motor y componente de reordenación `SortMenu` (asignado a `FIA-A06.03`).
  - Persistencia de filtros en base de datos (prohibida por arquitectura).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 18/19 con TypeScript 5.x estricto.
- **Estilos:** CSS Modules consumiendo `src/theme/tokens.css` (`--bg-card`, `--border-subtle`, `--text-primary`, etc.).
- **Testing:** Vitest 3.2.7 con `@testing-library/react` y `@testing-library/user-event`.

### 7. Contratos Finales Afectados
- **Contrato de Dominio / Datos:**
  ```typescript
  export type FilterPriority = 'TODAS' | 'alta' | 'media' | 'baja';
  export type FilterStatus = 'TODOS' | 'SOLO_PENDIENTES' | 'SOLO_COMPLETADAS';

  export interface FilterDateCriteria {
    activo: boolean;
    tipo: 'PUNTUAL' | 'RANGO';
    fechaInicio: string | null;
    fechaFin: string | null;
  }

  export interface FilterCriteria {
    prioridad: FilterPriority;
    fecha: FilterDateCriteria;
    estado: FilterStatus;
  }
  ```
- **Contrato Funcional (PVF-A06.01 / VF-A06.01):**
  - Evaluación acumulativa estricta: `pasaPrioridad && pasaFecha && pasaEstado`.
  - Criterio de descarte seguro: pulsar Cancelar o Escape no altera el estado de la vista.

### 8. Restricciones Finales
- Inmutabilidad estricta: `applyFilters` nunca muta el array de entrada.
- Screaming Architecture: Todos los artefactos residen en `src/filters/` sin crear carpetas cajón de sastre genéricas.
- Cero efectos de red: no existen peticiones HTTP ni dependencias de backend en este subsistema.
- Accesibilidad WCAG AA: Diálogo modal con soporte `Escape`, foco visible y validación inline.

### 9. Diseño Técnico Final
- **Arquitectura de Archivos:**
  - `src/filters/types/filter.types.ts`: Tipos canónicos y `DEFAULT_FILTER_CRITERIA`.
  - `src/filters/utils/filterEngine.ts`: Evaluador puro con funciones `isDateMatching`, `evaluateItemFilter`, `applyFilters`.
  - `src/filters/components/FilterModal.tsx`: Componente con estado de buffer local, selectores de prioridad, fecha (puntual/rango) y estado, y barra de acciones.
  - `src/hub/components/HubContainer.tsx`: Botón `[Filtrar]` con prop `onFilterClick` y `isFilterActive`.

### 10. Flujo Operativo Final
1. El usuario hace clic en el botón `[Filtrar]` de la barra de herramientas del Hub.
2. `FilterModal` se monta en pantalla inicializando su buffer local con los criterios activos.
3. El usuario interactúa con los controles (Prioridad, Fecha puntual o rango, Estado).
4. Si pulsa `[Cancelar]`, `Escape` o backdrop: el modal se cierra y el buffer se descarta.
5. Si pulsa `[Limpiar Filtros]`: el buffer se reinicia a `DEFAULT_FILTER_CRITERIA`.
6. Si pulsa `[Aplicar Filtros]`: se valida la consistencia de fechas, se emite `onApply(criteriosBuffer)` y se cierra el modal.

### 11. Casos Válidos Finales
- **Caso 1 (Criterios Neutros):** Criterios por defecto devuelven el 100% de los elementos sin excluir ninguno.
- **Caso 2 (Prioridad Aislada):** Filtrado por `'alta'`, `'media'` o `'baja'` retorna exclusivamente ítems con dicha prioridad.
- **Caso 3 (Estado Aislado):** `'SOLO_PENDIENTES'` retorna solo incompletos; `'SOLO_COMPLETADAS'` retorna solo completados.
- **Caso 4 (Fecha Puntual y Rango):** Coincidencia exacta con fecha ISO o inclusión en rango cerrado `[inicio, fin]`.
- **Caso 5 (Conjunción AND Completa):** Prioridad Alta AND Solo Pendientes AND Rango de fecha filtra combinadamente con precisión matemática.
- **Caso 6 (Descarte por Tecla Escape):** Presionar ESC cierra el modal sin emitir mutaciones.

### 12. Casos Inválidos Finales
- **Caso Inválido 1 (Rango Invertido):** `fechaInicio > fechaFin` despliega alerta visual inline y bloquea el botón `[Aplicar Filtros]`.
- **Caso Inválido 2 (Ítems sin Fecha):** Si el filtro de fecha está activo, los ítems sin `fechaProgramada` son excluidos de forma segura sin excepciones.

### 13. Tests Requeridos Finales
- **Suites de la Unidad `src/filters/` (32 tests):**
  - `filterEngine.test.ts`: 21 tests unitarios cubriendo todas las ramas lógicas AND, fechas y casos frontera.
  - `FilterModal.test.tsx`: 11 tests de integración RTL cubriendo renderizado, buffer, validación, accesibilidad, Escape y callbacks.
- **Suite de Integración Hub:**
  - `HubContainer.test.tsx`: 6 tests verificando renderizado y funcionalidad del botón `[Filtrar]`.
- **Total Proyecto:** 212 tests en verde (100% éxito a través de 29 suites).

### 14. Quality Gates Finales
- `QG-01 · Typecheck Estricto:` `tsc --noEmit` superado con 0 errores.
- `QG-02 · Tests Suite Completa:` 212/212 tests pasando al 100% en Vitest.
- `QG-03 · Build de Producción:` `vite build` completado limpiamente en 1.82s sin advertencias.
- `QG-04 · Anti-Drift Scan:` Cero modificaciones en módulos de tareas, compras, limpieza o backend.
- `QG-05 · Aislamiento en Cliente:` Cero llamadas de red y cero persistencia en base de datos.

### 15. Archivos Reales Afectados
```
Creados:
- src/filters/types/filter.types.ts
- src/filters/utils/filterEngine.ts
- src/filters/utils/filterEngine.test.ts
- src/filters/components/FilterModal.tsx
- src/filters/components/FilterModal.module.css
- src/filters/components/FilterModal.test.tsx

Modificados:
- src/hub/components/HubContainer.tsx
- src/hub/components/HubContainer.module.css
- src/hub/components/HubContainer.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La implementación calcó con exactitud matemática el diseño previsto sin introducir scope creep ni variaciones de diseño.

### 17. Drift Integrado
- Inclusión del botón `[Filtrar]` en la barra de alternancia del Hub (`toggleBar`) para máxima accesibilidad y limpieza visual sin saturar los acordeones.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún cambio formal requerido: la unidad cumplió el contrato original al 100%.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad táctica **FIA-A06.01** se encuentra **100% implementada, verificada, auditada y sellada con LOCK definitivo**.

**Queda formalmente autorizada la apertura de:**  
`RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)` -> **`FIA-A06.02`**.
