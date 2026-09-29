# CENTRA-T · FIA-A07.04 · MODAL CONFLICTO EN REASIGNACIÓN DE FECHA (VV-003) (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A07.04.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.04`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Modal Conflicto en Reasignación de Fecha (VV-003)`
- **PVF de Cierre Cubierta:** `PVF-A07.04 · Modal de Confirmación al Mover Tarea Fechada (Decisión 4B)`
- **VF Interna de Derivación:** `VF-A07.04 · Modal de Intercepción en Reasignación de Fecha (Decisión 4B / VV-003)`
- **Objetivo Indexado:** `Detectar arrastre de ítem previamente fechado hacia nuevo día. Desplegar obligatoriamente modal de conflicto con fecha origen vs destino (Decisión 4B).`
- **Validación Final:** [`src/calendar-sync/components/ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx), [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 318/318 tests globales pasando en 37 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.07s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.03.md APROBADO (FIA-A07.03_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 4 de RV-A07 y constituye la base inmutable para FIA-A07.05.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.04: Modal Conflicto en Reasignación de Fecha - VV-003).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.04 y VF-A07.04).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Decisión Arquitectónica 4B; Doc 08: Guía de Estilos Visuales; Doc 10: Validación Forense QA - Caso VV-003).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Asignar_O_Mover_Fecha_Item_DragDrop` - Paso 2: `Deteccion_De_Conflicto_Y_Confirmacion`).
  - `SPEC-FIA-A07.04.md` (Especificación técnica ejecutada con mandato de intercepción modal).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.03` con 308 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 318/318 tests en verde (100% pasando en 37 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.07s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a todas las unidades previas (RV-A01 a RV-A06 y FIA-A07.01/02/03).

### 4. Objetivo Implementado
Se ha materializado y verificado de extremo a extremo la regla obligatoria de confirmación preventiva ante conflicto de reasignación temporal (Decisión 4B / Caso VV-003):
1. **Componente Modal Accesible `ReassignmentConfirmModal.tsx`:**
   - Cumplimiento estricto WAI-ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="reassign-modal-title"`, `aria-describedby="reassign-modal-desc"`).
   - Backdrop semiopaco (`rgba(0, 0, 0, 0.65)`) con efecto blur.
   - Panel de confirmación con ancho máximo de 440px y tokens de diseño oficiales (`--bg-card: #1A2433`, `--border-subtle: #233144`).
   - Foco inicial preventivo en el botón secundario `[Mantener fecha]` (`cancelButtonRef.current?.focus()`).
   - Listener global para descarte inmediato con tecla `Escape`.
   - Botón primario `[Mover fecha]` con acento cobalto (`#2563EB`).
2. **Capacidad Draggable en Pastillas de Calendario (`CalendarTaskPill.tsx`):**
   - Propiedades `isDraggable?: boolean` (predeterminada en `true`) y `fechaProgramada?: string | Date | null`.
   - Serialización del payload `DragItemPayload` en `DRAG_TRANSFER_MIME` (`application/x-centra-t-item`) conteniendo la fecha previa del ítem.
3. **Propagación en Cuadrícula (`MonthlyCalendarGrid.tsx`):**
   - Suministro de `fechaProgramada={item.fechaProgramada}` a cada pastilla dentro de las celdas del mes.
4. **Orquestación en la Aplicación (`App.tsx`):**
   - Estado de buffer de conflicto `reassignConflict`.
   - Manejador `handleScheduleItem`: detección de fecha asignada previa (`originDateStr`). Si existe y difiere de la fecha destino, se abre `ReassignmentConfirmModal` sin mutar el estado.
   - Si el usuario pulsa `[Mantener fecha]` o `Escape`, se aborta el traslado y se conserva la fecha intacta.
   - Si el usuario pulsa `[Mover fecha]`, se confirma el traslado a la nueva casilla.
   - Si el ítem no poseía fecha previa, se asigna directamente sin modal.
5. **Alineación Cromática de Prioridad Baja en el Calendario:**
   - Homogeneización del indicador de prioridad baja en `CalendarTaskPill.module.css`: se alinea al tono azul `#3B82F6` con halo suave `box-shadow: 0 0 4px rgba(59, 130, 246, 0.4)`, eliminando el tono verde original e igualando de forma 100% fiel las pastillas del calendario con los puntos cromáticos de las tarjetas del Hub (`TaskCard`, `ShoppingCard`, `CleaningCard`).

### 5. Alcance Final
- **IN-SCOPE (Completado y consolidado):**
  - Componente [`ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx) y estilos [`ReassignmentConfirmModal.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.module.css) con 7 tests en [`ReassignmentConfirmModal.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.test.tsx).
  - Soporte `isDraggable`, `fechaProgramada` y alineación cromática de prioridad baja en [`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx) / [`CalendarTaskPill.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.module.css) con tests en [`CalendarTaskPill.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.test.tsx).
  - Propagación en [`MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx).
  - Orquestación en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) y 2 tests E2E de validación VV-003 en [`App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx).
- **OUT-OF-SCOPE (Preservado fielmente para unidades sucesivas):**
  - Arrastre masivo de compras consolidadas (Caso `VV-006`, asignado a `FIA-A07.05`).
  - Desasignación por clic derecho (Caso `VV-007`, asignado a `FIA-A07.06`).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto.
- **Estilos:** CSS Modules puros con tokens globales (`--bg-card`, `--border-subtle`, `--accent-cobalt`).
- **Testing:** Vitest 3.2.7 con `@testing-library/react` 16.2.0 y `@testing-library/user-event` 14.6.7.

### 7. Contratos Finales Afectados
- **Contrato de Diálogo Modal:**
  ```typescript
  export interface ReassignmentConfirmModalProps {
    isOpen: boolean;
    itemTitle: string;
    originDate: string;
    targetDate: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```
- **Contrato de Pastilla Draggable:**
  ```typescript
  export interface CalendarTaskPillProps {
    id: string;
    titulo: string;
    prioridad: ItemPriority;
    modulo: ItemModule;
    completado?: boolean;
    fechaProgramada?: string | Date | null;
    isDraggable?: boolean;
    onClick?: (id: string) => void;
  }
  ```

### 8. Restricciones Finales
- Cero librerías externas de modales o drag & drop.
- Inmutabilidad estricta ante cancelación o cierre con Escape.
- Preservación completa del foco accesible y soporte de teclado.

### 9. Diseño Técnico Final
- **Componente Modal [`ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx):**
  - Manejo de foco preventivo inicial en `cancelButtonRef`.
  - Captura global de `Escape` para aborto inmediato.
- **Pastilla de Calendario [`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx):**
  - Permite ser arrastrada serializando el payload con su `fechaProgramada` origen.
- **Orquestador [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx):**
  - Buffer `reassignConflict` que detiene la mutación hasta la confirmación explícita del usuario.

### 10. Flujo Operativo Final
1. El usuario arrastra una tarea que ya poseía una fecha D1 hacia una casilla con fecha D2.
2. Al soltar en D2, `handleScheduleItem` detecta el conflicto temporal.
3. Se despliega `ReassignmentConfirmModal` mostrando las fechas D1 y D2 con foco en `[Mantener fecha]`.
4. Si el usuario pulsa `[Mantener fecha]` o `Escape`, el modal se cierra y la tarea se mantiene en D1 sin mutar.
5. Si el usuario pulsa `[Mover fecha]`, se confirma la operación y la pastilla se traslada a D2 actualizando el estado central.

### 11. Casos Válidos Finales
- **Caso 1 (Detección de Conflicto):** Soltar un ítem fechado en nueva fecha abre el modal.
- **Caso 2 (Abortar Cambio):** Pulsar `[Mantener fecha]` conserva la fecha previa intacta.
- **Caso 3 (Descarte con Escape):** Tecla `Escape` cierra el modal sin mutaciones.
- **Caso 4 (Confirmar Traslado):** Pulsar `[Mover fecha]` reasigna la tarea a la nueva casilla.
- **Caso 5 (Asignación Directa):** Ítems sin fecha previa se asignan de inmediato sin desplegar el modal.

### 12. Casos Inválidos Finales
- **Soltado en el Mismo Día:** Si se suelta una tarea en la misma casilla en que reside, la operación se ignora sin abrir el modal.

### 13. Tests Requeridos Finales
- **Tests de la Unidad:**
  - `ReassignmentConfirmModal.test.tsx`: 7/7 tests pasando.
  - `CalendarTaskPill.test.tsx`: 7/7 tests pasando.
  - `App.test.tsx`: 17/17 tests pasando (incluyendo casos VV-002 y VV-003).
- **Balance Global:** 318/318 tests en verde (100% pasando en 37 suites).

### 14. Quality Gates Finales
- `QG-FIA-A07.04-01 · Compilación y Tipado:` Superado (0 errores en `tsc --noEmit`).
- `QG-FIA-A07.04-02 · Tests Unitarios e Integración:` Superado (318/318 tests en verde en 37 suites).
- `QG-FIA-A07.04-03 · Anti-Scope Creep:` Superado (cero código de arrastre masivo de compras VV-006).
- `QG-FIA-A07.04-04 · Verificación Funcional UI:` Superado (demostración forense del caso `VV-003`).

### 15. Archivos Reales Afectados
```
Creados:
- src/calendar-sync/components/ReassignmentConfirmModal.tsx
- src/calendar-sync/components/ReassignmentConfirmModal.module.css
- src/calendar-sync/components/ReassignmentConfirmModal.test.tsx

Modificados:
- src/calendar-sync/components/CalendarTaskPill.tsx
- src/calendar-sync/components/CalendarTaskPill.module.css
- src/calendar-sync/components/CalendarTaskPill.test.tsx
- src/workspace/components/MonthlyCalendarGrid.tsx
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
- Homogeneización del indicador de prioridad baja en `CalendarTaskPill.module.css`: se alineó al tono azul `#3B82F6` con halo suave idéntico a las tarjetas del Hub (`TaskCard`, `ShoppingCard`, `CleaningCard`), eliminando discrepancias visuales.

### 17. Drift Integrado
- Ningún drift arquitectónico detectado. El aislamiento de módulos se preservó intacto.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún CHG formal requerido.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad **FIA-A07.04** se encuentra implementada, verificada y sellada bajo la disciplina formal del Método zug. La regla de intercepción modal de conflicto ante reasignaciones queda congelada e inmutable, **autorizándose el inicio inmediato de FIA-A07.05**.
