# CENTRA-T · FIA-A07.05 · ARRASTRE MASIVO DE COMPRA AL CALENDARIO (VV-006) (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A07.05.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.05`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Arrastre Masivo de Compra al Calendario (VV-006)`
- **PVF de Cierre Cubierta:** `PVF-A07.05 · Asignación Masiva de Lista de Compra al Calendario (VV-006)`
- **VF Interna de Derivación:** `VF-A07.05 · Asignación Masiva de Compra Semanal al Calendario (VV-006)`
- **Objetivo Indexado:** `Habilitar asa de arrastre maestro en acordeón de Compra, diálogo modal de confirmación masiva especificando productos pendientes y programación en bloque de productos en la fecha seleccionada.`
- **Validación Final:** [`src/hub/components/ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx), [`src/calendar-sync/components/BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx), [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 332/332 tests globales pasando en 38 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.03s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.04.md APROBADO (FIA-A07.04_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 5 de RV-A07 y constituye la base inmutable para FIA-A07.06.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.05: Arrastre Masivo de Compra al Calendario - VV-006).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.05 y VF-A07.05).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema `shopping` y `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Arrastre Masivo de Compra Semanal; Doc 08: Guía de Estilos Visuales; Doc 10: Validación Forense QA - Caso VV-006).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Arrastre_Masivo_Compra_Semanal`).
  - `SPEC-FIA-A07.05.md` (Especificación técnica física ejecutada con mandato de asignación masiva y diálogo de confirmación).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.04` con 318 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 332/332 tests en verde (100% pasando en 38 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.03s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a todas las unidades previas.

### 4. Objetivo Implementado
Se ha materializado y verificado de extremo a extremo el flujo de arrastre masivo de la Compra Semanal y su caso forense (VV-006):
1. **Contrato de Transporte Masivo ([`drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts)):**
   - Interfaz `BulkShoppingDragPayload` con `{ id: 'bulk-shopping'; modulo: 'shopping'; titulo: string; isBulk: true; pendingCount: number }`.
   - Tipo de unión `SchedulableDragPayload = DragItemPayload | BulkShoppingDragPayload`.
   - Actualización agnóstica de tipos en `CalendarDropZone.tsx` y `MonthlyCalendarGrid.tsx`.
2. **Asa de Arrastre Maestro en [`ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx):**
   - Drag handle `⠿` con `data-testid="shopping-bulk-drag-handle"` y `draggable={true}`.
   - Visibilidad dinámica: solo presente si `pendingCount > 0` (`items.filter(i => !i.completado && !i.fechaProgramada).length > 0`).
   - Aislamiento de eventos con `e.stopPropagation()` al arrastrar y al hacer clic para prevenir la conmutación accidental del acordeón.
   - Empaquetado en `DRAG_TRANSFER_MIME` y `text/plain` con efecto `move`.
   - Estilizado sobrio en [`ShoppingAccordion.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.module.css) con botón cuadrado compacto 26x26px, cursor `grab`/`grabbing` y hover azul cobalto translúcido.
3. **Diálogo Modal Accesible [`BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx):**
   - WAI-ARIA completo: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="bulk-shopping-modal-title"`, `aria-describedby="bulk-shopping-modal-desc"`.
   - Mensaje: *"¿Asignar el [Fecha Destino] como día de compra para N productos pendientes?"*.
   - Foco inicial en botón secundario `[Cancelar]` y soporte para cierre con tecla `Escape` o clic en backdrop.
   - Botón primario `[Asignar Fecha a Todos]` con acento cobalto.
4. **Soporte de Pastilla Consolidada en el Calendario ([`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx)):**
   - Prop `isBulk?: boolean` y clase `.bulkShoppingPill` en `CalendarTaskPill.module.css`.
5. **Orquestación en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) (Caso Forense VV-006):**
   - Estado de buffer `bulkShoppingConflict: { targetDate: string; pendingCount: number } | null`.
   - Intercepción de payloads masivos en `handleScheduleItem`.
   - En `handleConfirmBulkShopping`: actualización en lote de todos los productos pendientes de compra (`!item.completado && !item.fechaProgramada`), garantizando la estricta exclusión de productos completados.
   - Si el usuario cancela, el buffer se limpia a `null` sin mutar ninguna entidad.

### 5. Alcance Final
- **IN-SCOPE (Completado y consolidado):**
  - Componente modal [`BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx), su CSS y 8 tests unitarios en [`BulkShoppingConfirmModal.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx).
  - Asa de arrastre maestro en [`ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx) y 3 nuevos tests unitarios en [`ShoppingAccordion.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.test.tsx).
  - Soporte en [`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx) / [`CalendarTaskPill.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.module.css).
  - Tipos en [`drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts).
  - Integración en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) y 3 pruebas de integración E2E de VV-006 en [`App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx).
- **OUT-OF-SCOPE (Preservado fielmente para FIA-A07.06):**
  - Menú contextual de clic derecho para desasignar fecha (Caso VV-007, reservado a FIA-A07.06).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto.
- **Estilos:** CSS Modules puros con tokens globales.
- **Testing:** Vitest 3.2.7 con `@testing-library/react` y `@testing-library/user-event`.

### 7. Contratos Finales Afectados
- **Contrato de Transporte Masivo:**
  ```typescript
  export interface BulkShoppingDragPayload {
    id: 'bulk-shopping';
    modulo: 'shopping';
    titulo: string;
    isBulk: true;
    pendingCount: number;
  }
  export type SchedulableDragPayload = DragItemPayload | BulkShoppingDragPayload;
  ```
- **Contrato de Diálogo Modal Masivo:**
  ```typescript
  export interface BulkShoppingConfirmModalProps {
    isOpen: boolean;
    pendingCount: number;
    targetDate: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

### 8. Restricciones Finales
- Cero librerías externas adicionales.
- Inmutabilidad estricta de productos completados (`completado === true`) ante la asignación masiva.
- Prohibición de arrastre masivo hacia fechas pasadas (bloqueado por Decisión 1A).

### 9. Diseño Técnico Final
- **Asa Maestro en `ShoppingAccordion.tsx`:** Control draggable accesible en `.titleSection` con soporte `pendingCount > 0`.
- **Modal `BulkShoppingConfirmModal.tsx`:** Diálogo centrado con foco inicial seguro y descarte con `Escape`.
- **Orquestación en `App.tsx`:** Buffer `bulkShoppingConflict` y mutación en bloque controlada.

### 10. Flujo Operativo Final
1. El usuario arrastra el asa `⠿` de Compra Semanal en el Hub hacia una casilla válida del calendario.
2. Al soltar en la casilla, se despliega `BulkShoppingConfirmModal` indicando el número exacto de productos pendientes.
3. Si el usuario pulsa `[Cancelar]` o `Escape`, el modal se cierra y ningún producto es modificado.
4. Si el usuario pulsa `[Asignar Fecha a Todos]`, todos los productos pendientes de compra reciben la fecha seleccionada y se proyecta la píldora consolidada en el calendario.

### 11. Casos Válidos Finales
- **Caso 1 (Arrastre con Pendientes):** El asa se visualiza y permite arrastrar el lote de compras.
- **Caso 2 (Cancelación Masiva):** Cancelar o presionar `Escape` descarta la operación sin mutaciones.
- **Caso 3 (Confirmación Masiva):** Confirmar actualiza todos los productos pendientes y proyecta la píldora en el calendario.
- **Caso 4 (Bloqueo en Pasado):** Arrastrar sobre casilla pasada activa cursor `not-allowed` y rechaza el drop.

### 12. Casos Inválidos Finales
- **Sin Productos Pendientes:** Si `pendingCount === 0`, el asa de arrastre no se muestra en la cabecera del acordeón.

### 13. Tests Requeridos Finales
- **Tests de la Unidad:**
  - `BulkShoppingConfirmModal.test.tsx`: 8/8 tests pasando.
  - `ShoppingAccordion.test.tsx`: 9/9 tests pasando (+3 tests del asa de arrastre).
  - `App.test.tsx`: 20/20 tests pasando (+3 tests de auditoría forense E2E VV-006).
- **Balance Global:** 332/332 tests en verde (100% pasando en 38 suites).

### 14. Quality Gates Finales
- `QG-FIA-A07.05-01 · Compilación y Tipado:` Superado (0 errores en `tsc --noEmit`).
- `QG-FIA-A07.05-02 · Tests Unitarios e Integración:` Superado (332/332 tests en verde en 38 suites).
- `QG-FIA-A07.05-03 · Anti-Scope Creep:` Superado (cero código de desasignación por clic derecho VV-007).
- `QG-FIA-A07.05-04 · Verificación Funcional UI:` Superado (demostración forense del caso `VV-006`).

### 15. Archivos Reales Afectados
```
Creados:
- src/calendar-sync/components/BulkShoppingConfirmModal.tsx
- src/calendar-sync/components/BulkShoppingConfirmModal.module.css
- src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx

Modificados:
- src/calendar-sync/types/drag-drop.types.ts
- src/hub/components/ShoppingAccordion.tsx
- src/hub/components/ShoppingAccordion.module.css
- src/hub/components/ShoppingAccordion.test.tsx
- src/calendar-sync/components/CalendarTaskPill.tsx
- src/calendar-sync/components/CalendarTaskPill.module.css
- src/calendar-sync/components/CalendarDropZone.tsx
- src/workspace/components/MonthlyCalendarGrid.tsx
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
- Ninguna divergencia funcional. La implementación satisfizo con exactitud milimétrica el alcance fijado.

### 17. Drift Integrado
- Ningún drift arquitectónico detectado. El aislamiento de módulos se preservó intacto.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún CHG requerido.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad **FIA-A07.05** se encuentra implementada, verificada y sellada bajo la disciplina formal del Método zug. La regla de arrastre masivo de compras consolidadas queda congelada e inmutable, **autorizándose el inicio de la unidad final de la rebanada vertical: FIA-A07.06**.
