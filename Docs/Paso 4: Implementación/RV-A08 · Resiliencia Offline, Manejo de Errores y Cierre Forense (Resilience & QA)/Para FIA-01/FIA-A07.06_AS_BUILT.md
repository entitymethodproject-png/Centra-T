# CENTRA-T · FIA-A07.06 · DESASIGNACIÓN POR CLIC DERECHO Y RETORNO AL HUB (VV-007) (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Hito de Rebanada:** CIERRE TOTAL Y DEFINITIVO DE LA REBANADA VERTICAL RV-A07  
**Evidencia de Cierre:** LOCK-FIA-A07.06.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.06`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Desasignación por Clic Derecho y Retorno al Hub (VV-007)`
- **PVF de Cierre Cubierta:** `PVF-A07.06 · Desasignación Rápida de Fecha y Retorno al Hub (VV-007)`
- **VF Interna de Derivación:** `VF-A07.06 · Desasignación de Fecha y Retorno al Hub (VV-007)`
- **Objetivo Indexado:** `Menú contextual accesible en cada píldora del calendario con opción 'Mover a Sin Asignar' (PATCH /items/:id/unschedule).`
- **Validación Final:** [`src/calendar-sync/components/CalendarItemContextMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.tsx), [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 343/343 tests globales pasando en 39 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.09s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.05.md APROBADO (FIA-A07.05_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la última unidad de RV-A07 y constituye la base inmutable para abrir RV-A08.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.06: Desasignación por Clic Derecho y Retorno al Hub - VV-007).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.06 y VF-A07.06).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Desasignación sin Eliminación; Doc 08: Guía de Estilos Visuales; Doc 10: Validación Forense QA - Caso VV-007).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Desasignar_Fecha_Desde_Calendario`).
  - `SPEC-FIA-A07.06.md` (Especificación técnica física ejecutada con mandato de desasignación no destructiva).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.05` (commit `1979887`) con 332 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 343/343 tests en verde (100% pasando en 39 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.09s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a todas las unidades previas.

### 4. Objetivo Implementado
Se ha materializado y verificado de extremo a extremo la desasignación rápida por clic derecho y el caso forense (VV-007):
1. **Componente `CalendarItemContextMenu.tsx`:** Menú flotante fixed (`z-index: 1050`), con WAI-ARIA (`role="menu"`, `role="menuitem"`), opción *"Mover a Sin Asignar"*, backdrop interceptor y soporte nativo para tecla `Escape`.
2. **Intercepción de Clic Derecho:** En `CalendarTaskPill.tsx`, manejador `onContextMenu` suprimiendo el menú nativo con `e.preventDefault()` y `e.stopPropagation()`.
3. **Propagación en la Rejilla:** En `MonthlyCalendarGrid.tsx`, paso de `onItemContextMenu` a cada pastilla.
4. **Desasignación No Destructiva en `App.tsx`:** `handleUnscheduleItem` fija `fechaProgramada = null`, cerrando el menú y preservando el ítem intacto en su acordeón del Hub.

### 5. Alcance Final
- **Construido:** Menú contextual accesible, intercepción de clic derecho en pastillas, propagación en la cuadrícula mensual, orquestación en `App.tsx` y suite de pruebas unitarias y E2E para el caso VV-007.
- **Límites:** Cero operaciones de borrado (`filter`/`splice`). El ítem no se elimina, solo se desprograma. Cero anticipación a `RV-A08`.

### 6. Dependencias Reales
- React 19.0.0, ReactDOM 19.0.0.
- TypeScript 5.7.3.
- Vitest 3.2.7 y Testing Library (`@testing-library/react`, `@testing-library/user-event`).
- CSS Modules puros con tokens de color semánticos.

### 7. Contratos Finales Afectados
- `CalendarItemContextMenuProps`:
  ```typescript
  export interface CalendarItemContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    itemId: string;
    modulo: ItemModule;
    itemTitle: string;
    onUnschedule: (itemId: string, modulo: ItemModule) => void;
    onClose: () => void;
  }
  ```
- Mutación no destructiva: `fechaProgramada: null`.

### 8. Restricciones Finales
- Mandato no destructivo respetado al 100%: ninguna entidad fue eliminada de la base de datos/estado al desasignar.
- Cero uso de librerías externas para popovers o menús contextuales.

### 9. Diseño Técnico Final
- `src/calendar-sync/components/CalendarItemContextMenu.tsx`
- `src/calendar-sync/components/CalendarItemContextMenu.module.css`
- `src/calendar-sync/components/CalendarItemContextMenu.test.tsx`
- Integrado en `CalendarTaskPill.tsx`, `MonthlyCalendarGrid.tsx`, `App.tsx` y `App.test.tsx`.

### 10. Flujo Operativo Final
1. El usuario hace clic derecho sobre una pastilla del calendario.
2. `CalendarTaskPill` intercepta el evento, previene el menú del navegador y emite los datos del ítem con las coordenadas del cursor `(x, y)`.
3. `MonthlyCalendarGrid` propaga el evento a `App.tsx`.
4. `App.tsx` activa `contextMenuState` y renderiza `CalendarItemContextMenu` en dichas coordenadas.
5. El usuario pulsa `"Mover a Sin Asignar"` (o presiona Escape para cancelar).
6. Al pulsar, `handleUnscheduleItem` fija `fechaProgramada: null`, la pastilla desaparece del calendario y el ítem se mantiene vivo en su acordeón del Hub.

### 11. Casos Válidos Finales
- Apertura del menú en las coordenadas del cursor: Verificado con test.
- Presionar Escape o hacer clic fuera: Cierra el menú sin mutar estado (Verificado).
- Pulsar "Mover a Sin Asignar": Desvincula la fecha y retiene el ítem en el Hub (Verificado, VV-007).

### 12. Casos Inválidos Finales
- Clic derecho no dispara `onClick` habitual de la pastilla ni abre modales de detalle.
- Solicitud de desasignación sobre ítem inexistente: No produce excepciones en runtime.

### 13. Tests Requeridos Finales
- 6 tests unitarios en `CalendarItemContextMenu.test.tsx`.
- 1 test unitario en `CalendarTaskPill.test.tsx`.
- 1 test unitario en `MonthlyCalendarGrid.test.tsx`.
- 3 tests de integración E2E en `App.test.tsx` para el caso VV-007.

### 14. Quality Gates Finales
- QG-01 Typecheck: PASSED (0 errores).
- QG-02 Linting: PASSED (0 advertencias).
- QG-03 Test Suite: PASSED (343/343 tests en verde, 100%).
- QG-04 Anti-Drift: PASSED (Cero código espurio).
- QG-05 No-Secret: PASSED (Cero claves o credenciales).

### 15. Archivos Reales Afectados
```
Creados:
- src/calendar-sync/components/CalendarItemContextMenu.tsx
- src/calendar-sync/components/CalendarItemContextMenu.module.css
- src/calendar-sync/components/CalendarItemContextMenu.test.tsx

Modificados:
- src/calendar-sync/components/CalendarTaskPill.tsx
- src/calendar-sync/components/CalendarTaskPill.test.tsx
- src/workspace/components/MonthlyCalendarGrid.tsx
- src/workspace/components/MonthlyCalendarGrid.test.tsx
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La implementación calcó con exactitud matemática el diseño previsto.

### 17. Drift Integrado
Cero drift arquitectónico. Se respetó la Clean Architecture, Screaming Architecture y el aislamiento de módulos.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna. No fue necesario alterar contratos de dominio.

### 19. Definition of Done AS-BUILT
Se certifica formalmente el cierre total de `FIA-A07.06` y la clausura definitiva de la Rebanada Vertical `RV-A07`. Queda formalmente autorizada la apertura de `RV-A08 · FIA-A08.01`.
