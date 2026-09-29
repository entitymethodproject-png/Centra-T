# SPEC-FIA-A07.05 · ARRASTRE MASIVO DE COMPRA AL CALENDARIO (VV-006)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** QUINTA UNIDAD DE RV-A07 (ARRASTRE MAESTRO, ASIGNACIÓN EN BLOQUE, AUDITORÍA FORENSE VV-006)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.05 · Arrastre Masivo de Compra al Calendario (VV-006)  
**PVF de Cierre:** PVF-A07.05 · Asignación Masiva de Lista de Compra al Calendario (VV-006)  
**VF:** VF-A07.05 · Asignación Masiva de Compra Semanal al Calendario (VV-006)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.04.md APROBADO (FIA-A07.04_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el flujo de asignación masiva de la Compra Semanal hacia el planificador temporal y satisfaciendo la auditoría forense **VV-006** en [`src/hub/components/ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx), [`src/calendar-sync/`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync) y [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).

Esta quinta unidad táctica de la Rebanada Vertical **RV-A07** cubre:
1. La habilitación de un asa de arrastre maestro (`drag handle` accesible con icono `⠿` / `🛒`) en la cabecera del acordeón de Compra Semanal ([`ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx)), empaquetando el payload especial `BulkShoppingDragPayload`.
2. La creación del diálogo modal accesible [`BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx) y sus estilos en [`BulkShoppingConfirmModal.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.module.css).
3. La intercepción en `App.tsx` al soltar el lote de compra en una fecha válida: despliegue del modal indicando el número exacto de productos pendientes sin fecha asignada (`pendingCount`).
4. La ejecución de la asignación masiva al confirmar: todos los productos pendientes de compra (`completado === false && fechaProgramada === null`) reciben la fecha seleccionada.
5. La materialización de una pastilla especial consolidada en la celda del calendario (`"Compra Semanal (N)"` con distintivo `C` / `🛒`).
6. La superación demostrable de la auditoría del caso forense **VV-006**.

Queda taxativamente diferido a la última unidad: la desasignación de fecha mediante menú contextual de clic derecho (VV-007, `FIA-A07.06`).

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Contrato de Transporte Masivo en `drag-drop.types.ts`:**
   - Tipo `BulkShoppingDragPayload`: `{ id: 'bulk-shopping'; modulo: 'shopping'; titulo: string; isBulk: true; pendingCount: number }`.
2. **Asa de Arrastre Maestro en `ShoppingAccordion.tsx`:**
   - Control draggable en la cabecera del acordeón con `data-testid="shopping-bulk-drag-handle"` y `aria-grabbed`.
   - Permite iniciar el arrastre únicamente si existen productos pendientes sin fecha asignada (`pendingCount > 0`).
3. **Componente Modal `BulkShoppingConfirmModal.tsx`:**
   - Diálogo modal con `role="dialog"`, `aria-modal="true"`, `aria-labelledby="bulk-shopping-modal-title"`.
   - Mensaje: *"¿Asignar el [Fecha Destino] como día de compra para N productos pendientes?"*.
   - Botón secundario `[Cancelar]` con foco preventivo inicial y soporte de tecla `Escape`.
   - Botón primario `[Asignar Fecha a Todos]` con acento cobalto.
4. **Pastilla Consolidada en el Calendario (`CalendarTaskPill.tsx`):**
   - Soporte para representar una compra consolidada mostrando el distintivo de módulo y texto *"Compra Semanal (N)"*.
5. **Orquestación en `src/App.tsx`:**
   - Estado `bulkShoppingConflict: { targetDate: string; pendingCount: number } | null`.
   - Invocación de actualización masiva sobre la colección de compras al confirmar.
6. 100% de tests en verde (mínimo 330+ tests totales en 38 suites, con cero regresiones).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.04_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/hub/components/ShoppingAccordion.tsx`: Posee cabecera de acordeón con contador `Compra (N)` y botón `[+]`, pero carece de asa de arrastre maestro.
  - `src/shopping/services/shopping.service.ts`: Ya cuenta con el método `bulkSchedule(userId, dto)` desde RV-A04.
  - `src/calendar-sync/components/`: Cuenta con `CalendarDropZone`, `CalendarTaskPill` y `ReassignmentConfirmModal`.
  - `src/App.tsx`: Orquesta el Drag & Drop unitario de tarjetas y pastillas.
- **Estado de Tests y Compilación:**
  - 318/318 tests en verde en 37 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.07s sin advertencias.
- **Riesgos Iniciales:**
  - El clic para desplegar/colapsar el acordeón en `ShoppingAccordion.tsx` no debe colisionar con el asa de arrastre maestro (`e.stopPropagation()` al hacer drag).
  - La asignación masiva solo debe afectar a productos pendientes no completados y sin fecha previa (`!item.completado && !item.fechaProgramada`).

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `src/calendar-sync/components/BulkShoppingConfirmModal.tsx`, su CSS y su suite de tests `BulkShoppingConfirmModal.test.tsx`.
2. `src/calendar-sync/types/drag-drop.types.ts` incluirá `BulkShoppingDragPayload` y constante MIME asociada.
3. `ShoppingAccordion.tsx` expondrá un asa de arrastre maestro en su cabecera.
4. `src/App.tsx` integrará `<BulkShoppingConfirmModal />` y ejecutará la asignación masiva de compras.
5. La casilla de la fecha seleccionada en el calendario proyectará la pastilla consolidada de compra semanal.
6. El total de tests en verde aumentará a un mínimo de 330+ tests en 38 suites.
7. **Restricciones Negativas:** Cero código de desasignación por clic derecho (VV-007, FIA-A07.06).

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `BulkShoppingConfirmModalProps`:
  ```typescript
  export interface BulkShoppingConfirmModalProps {
    isOpen: boolean;
    pendingCount: number;
    targetDate: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

### 5.2 Contrato de Geometría / Interfaz
- Asa de arrastre maestro en `ShoppingAccordion.module.css`:
  - Botón o badge compacto `26x26px`, centrado, con cursor `grab` / `grabbing`, icono `⠿` o `🛒`, situado junto al título de la cabecera.
- `BulkShoppingConfirmModal`:
  - Panel flotante centrado (`z-index: 1000`), backdrop oscuro (`rgba(0, 0, 0, 0.65)`), foco predeterminado en `[Cancelar]`.
- Píldora consolidada en calendario:
  - Clase `.bulkShoppingPill` con badge de módulo `C`, texto *"Compra Semanal (N)"* y fondo sobrio alineado con la guía visual.

### 5.3 Contrato de Aislamiento
- La asignación masiva se procesa a nivel de entidad de compras sin mutar tareas generales ni limpiezas.

### 5.4 Contrato de Dominio / Datos
```typescript
export interface BulkShoppingDragPayload {
  id: 'bulk-shopping';
  modulo: 'shopping';
  titulo: string;
  isBulk: true;
  pendingCount: number;
}
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/calendar-sync/components/BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx): Componente modal de confirmación de asignación masiva.
- [`src/calendar-sync/components/BulkShoppingConfirmModal.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.module.css): Estilos del modal de confirmación masiva.
- [`src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx): Suite de pruebas unitarias del modal.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/calendar-sync/types/drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts): Añadir `BulkShoppingDragPayload` y tipo de unión.
- [`src/hub/components/ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx): Añadir asa de arrastre maestro y manejador `onDragStart`.
- [`src/hub/components/ShoppingAccordion.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.module.css): Estilos del asa de arrastre maestro.
- [`src/hub/components/ShoppingAccordion.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.test.tsx): Añadir prueba unitaria del asa de arrastre y serialización de payload.
- [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx): Soporte opcional para prop `isBulk?: boolean`.
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Orquestación del modal de compra masiva y asignación en bloque de productos.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Añadir prueba de validación forense E2E del caso **`[VV-006]`**.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx): Bloqueo de fechas pasadas y receptor de celdas sellado.
- [`src/calendar-sync/components/ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx): Modal de conflicto sellado en FIA-A07.04.
- [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx): Cuadrícula mensual intacta.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/authentication/*`: Dominio de autenticación.
- `src/users/*`: Dominio de usuarios.
- Menú contextual de clic derecho para desasignar (reservado a FIA-A07.06).

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08; Doc 10: Validación Forense QA - Caso VV-006).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Arrastre_Masivo_Compra_Semanal`).
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`.
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A07.04` (Sellado y consolidado con 318 tests en verde).
  - Desbloquea la elaboración de `FIA-A07.06` (Desasignación por Clic Derecho - VV-007).

---

## 8. Restricciones
- Prohibido el uso de carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido programar masivamente productos ya completados.
- Prohibido soltar la compra masiva en fechas pasadas (Decisión 1A).
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx` con pruebas en rojo:
    1. Renderizado condicional si `isOpen === true`.
    2. Visualización del número de productos pendientes y fecha formateada.
    3. Invocación de `onConfirm` al hacer clic en `[Asignar Fecha a Todos]`.
    4. Invocación de `onCancel` al hacer clic en `[Cancelar]`.
    5. Invocación de `onCancel` al presionar `Escape`.
  - Añadir en `ShoppingAccordion.test.tsx` prueba del asa de arrastre maestro (`shopping-bulk-drag-handle`).
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Comprobar que el fallo se debe exclusivamente a la ausencia de `BulkShoppingConfirmModal` y del asa en `ShoppingAccordion`.
- **Paso 3 — Implementar Mínimo:**
  - Actualizar `src/calendar-sync/types/drag-drop.types.ts` con `BulkShoppingDragPayload`.
  - Crear `src/calendar-sync/components/BulkShoppingConfirmModal.tsx` y su hoja de estilos `.module.css`.
  - Actualizar `src/hub/components/ShoppingAccordion.tsx` incorporando el asa de arrastre maestro en la cabecera.
  - Verificar que las suites de prueba unitarias pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - En `src/App.tsx`, incorporar estado `bulkShoppingConflict` y renderizar `<BulkShoppingConfirmModal />`.
  - En `handleScheduleItem`, detectar si `draggedItem.isBulk === true`: si es el caso, calcular productos pendientes de compra y abrir el modal.
  - Al confirmar, actualizar todos los productos pendientes de compra con la fecha seleccionada.
  - Añadir prueba de integración E2E en `src/App.test.tsx` certificando el caso forense **`[VV-006]`**.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 330+ tests en 38 suites).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar ausencia de drift de archivos ajenos.
- **Paso 7 — Estado Documental:**
  - Preparar los deltas exactos para `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.05.md`, `TEST_REPORT_FIA-A07.05.md`, propuesta de `LOCK-FIA-A07.05.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/calendar-sync/types/drag-drop.types.ts`
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

### 10.2 `src/calendar-sync/components/BulkShoppingConfirmModal.tsx`
```typescript
import React, { useEffect, useRef } from 'react';
import styles from './BulkShoppingConfirmModal.module.css';

export interface BulkShoppingConfirmModalProps {
  isOpen: boolean;
  pendingCount: number;
  targetDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkShoppingConfirmModal: React.FC<BulkShoppingConfirmModalProps> = ({
  isOpen,
  pendingCount,
  targetDate,
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-shopping-modal-title"
      aria-describedby="bulk-shopping-modal-desc"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="bulk-shopping-modal-title" className={styles.title}>
          Programar Compra Semanal
        </h3>
        <p id="bulk-shopping-modal-desc" className={styles.description}>
          ¿Asignar el <strong className={styles.dateBadge}>{targetDate}</strong> como día de compra para{' '}
          <strong className={styles.countBadge}>{pendingCount}</strong> productos pendientes?
        </p>
        <div className={styles.actionButtons}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Asignar Fecha a Todos
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 10.3 `src/hub/components/ShoppingAccordion.tsx`
Añadir el asa de arrastre maestro junto al título:
```tsx
const pendingCount = items.filter((i) => !i.completado && !i.fechaProgramada).length;

const handleBulkDragStart = (e: React.DragEvent) => {
  e.stopPropagation();
  const payload: BulkShoppingDragPayload = {
    id: 'bulk-shopping',
    modulo: 'shopping',
    titulo: 'Compra Semanal',
    isBulk: true,
    pendingCount,
  };
  e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
  e.dataTransfer.setData('text/plain', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'move';
};
```
En el JSX de la cabecera:
```tsx
<div className={styles.titleSection}>
  <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>▶</span>
  <h3 className={styles.title}>Compra ({items.length})</h3>
  {pendingCount > 0 && (
    <span
      role="button"
      tabIndex={0}
      draggable={true}
      onDragStart={handleBulkDragStart}
      onClick={(e) => e.stopPropagation()}
      className={styles.bulkDragHandle}
      title="Arrastrar lista de compra al calendario"
      data-testid="shopping-bulk-drag-handle"
    >
      ⠿
    </span>
  )}
</div>
```

### 10.4 `src/App.tsx`
Orquestar `bulkShoppingConflict`:
```typescript
const [bulkShoppingConflict, setBulkShoppingConflict] = useState<{
  targetDate: string;
  pendingCount: number;
} | null>(null);

const handleScheduleItem = (draggedItem: any, targetDate: string) => {
  // Manejo de Compra Masiva (Caso VV-006)
  if (draggedItem.isBulk === true && draggedItem.modulo === 'shopping') {
    const pendingCount = allShopping.filter(
      (s) => !s.completado && !s.fechaProgramada
    ).length;
    if (pendingCount === 0) return;
    setBulkShoppingConflict({ targetDate, pendingCount });
    return;
  }
  // ... resto de lógica unitaria ...
};

const handleConfirmBulkShopping = () => {
  if (!bulkShoppingConflict) return;
  const targetDateObj = new Date(`${bulkShoppingConflict.targetDate}T00:00:00`);
  setAllShopping((prev) =>
    prev.map((item) =>
      !item.completado && !item.fechaProgramada
        ? { ...item, fechaProgramada: targetDateObj }
        : item
    )
  );
  setBulkShoppingConflict(null);
};
```
Renderizar:
```tsx
<BulkShoppingConfirmModal
  isOpen={Boolean(bulkShoppingConflict)}
  pendingCount={bulkShoppingConflict?.pendingCount || 0}
  targetDate={bulkShoppingConflict?.targetDate || ''}
  onConfirm={handleConfirmBulkShopping}
  onCancel={() => setBulkShoppingConflict(null)}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx`:
   - `renderiza el diálogo modal cuando isOpen es true`
   - `muestra la fecha de destino y el conteo de productos pendientes`
   - `invoca onConfirm al pulsar [Asignar Fecha a Todos]`
   - `invoca onCancel al pulsar [Cancelar]`
   - `invoca onCancel al presionar la tecla Escape`
   - `no renderiza nada en el DOM cuando isOpen es false`
2. `src/hub/components/ShoppingAccordion.test.tsx`:
   - `renderiza el asa de arrastre maestro cuando hay productos pendientes sin fecha`
   - `empaqueta BulkShoppingDragPayload en onDragStart del asa maestro`

### 11.2 Tests de Integración / UI
1. `src/App.test.tsx`:
   - `[VV-006]: Arrastrar el asa de Compra Semanal al calendario abre el modal de confirmación con el número de productos pendientes`
   - `[VV-006]: Cancelar la asignación masiva descarta la operación sin modificar las fechas de los productos`
   - `[VV-006]: Confirmar la asignación masiva programa todos los productos pendientes en el día seleccionado y materializa la pastilla en el calendario`

### 11.3 Tests Negativos y de Regresión
- No desplegar el modal si no hay productos pendientes sin fecha (`pendingCount === 0`).
- No alterar productos ya completados (`completado === true`).
- Preservar al 100% las 37 suites previas (318 tests existentes).

### 11.4 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores y sin tipos `any`.
- `QG-02 · Linting:` `npm run lint` superado sin advertencias.
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 330+ tests totales).
- `QG-04 · Anti-Drift Scan:` Verificación de que no se tocaron archivos ajenos al alcance ni se adelantaron capacidades de VV-007.
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A07.05: Arrastre masivo de Compra Semanal al calendario (Caso Forense VV-006) con asa maestro, diálogo de confirmación en bloque y programación unificada de productos pendientes"
  ],
  "active_constraints": [
    "Asa de arrastre maestro visible en ShoppingAccordion cuando existen productos pendientes sin fecha",
    "Confirmación obligatoria en BulkShoppingConfirmModal especificando el número de productos",
    "Programación masiva excluye productos ya completados"
  ],
  "unlocked_next": "FIA-A07.06 · Desasignación por Clic Derecho y Retorno al Hub (VV-007)"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/calendar-sync/components/BulkShoppingConfirmModal.tsx",
    "src/calendar-sync/components/BulkShoppingConfirmModal.module.css",
    "src/calendar-sync/components/BulkShoppingConfirmModal.test.tsx"
  ],
  "files_modified": [
    "src/calendar-sync/types/drag-drop.types.ts",
    "src/hub/components/ShoppingAccordion.tsx",
    "src/hub/components/ShoppingAccordion.module.css",
    "src/hub/components/ShoppingAccordion.test.tsx",
    "src/App.tsx",
    "src/App.test.tsx"
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
    "SortMenu",
    "TasksAccordion",
    "ShoppingAccordion",
    "CleaningAccordion",
    "TaskCard",
    "ShoppingCard",
    "CleaningCard",
    "MonthlyCalendarGrid",
    "CalendarDropZone",
    "CalendarTaskPill",
    "ReassignmentConfirmModal",
    "BulkShoppingConfirmModal",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "workbench": "monthly_calendar_grid_with_past_date_blocking_and_task_pills",
    "calendar_header": "month_year_controls_previous_next_today",
    "hub_cards": "draggable_cards_with_html5_dnd_payload",
    "hub_shopping_header": "master_bulk_drag_handle_active",
    "bulk_shopping_modal": "dialog_modal_bulk_schedule_confirmation"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `ShoppingAccordion.tsx` expone el asa de arrastre maestro empaquetando `BulkShoppingDragPayload`.
2. `BulkShoppingConfirmModal.tsx` está implementado, estilizado y probado.
3. `App.tsx` procesa la asignación masiva de productos de compra pendientes.
4. Se supera de forma demostrable la auditoría del caso forense `VV-006`.
5. Los 8 pasos del plan fueron ejecutados secuencialmente.
6. Los 5 Quality Gates pasaron limpiamente.
7. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.05.md`, `TEST_REPORT_FIA-A07.05.md` y `LOCK-FIA-A07.05.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en la unidad `FIA-A07.05`. Queda terminantemente prohibido avanzar a `FIA-A07.06` en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Zero Scope Creep:** Prohibido implementar menú contextual de desasignación por clic derecho (Caso VV-007, reservado a FIA-A07.06).
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A07.05.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
