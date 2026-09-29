# SPEC-FIA-A07.04 · MODAL CONFLICTO EN REASIGNACIÓN DE FECHA (VV-003)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** CUARTA UNIDAD DE RV-A07 (REGLA 4B, INTERCEPCIÓN MODAL DE CONFLICTO, AUDITORÍA FORENSE VV-003)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.04 · Modal Conflicto en Reasignación de Fecha (VV-003)  
**PVF de Cierre:** PVF-A07.04 · Modal de Confirmación al Mover Tarea Fechada (Decisión 4B)  
**VF:** VF-A07.04 · Modal de Intercepción en Reasignación de Fecha (Decisión 4B / VV-003)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.03.md APROBADO (FIA-A07.03_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el cumplimiento estricto de la **Decisión Arquitectónica 4B** y la validación forense **VV-003** en el subsistema [`src/calendar-sync/`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync) y la aplicación principal [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).

Esta cuarta unidad táctica de la Rebanada Vertical **RV-A07** cubre:
1. La creación del componente modal accesible [`ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx) y sus estilos asociados [`ReassignmentConfirmModal.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.module.css).
2. La habilitación de arrastre (`draggable={true}`) en las pastillas del calendario [`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), permitiendo transferir tareas de un día D1 a otro día D2 directamente sobre la cuadrícula mensual.
3. La detección de conflicto en `App.tsx` al intentar programar un ítem que ya poseía una `fechaProgramada` previa diferente a la fecha destino.
4. La intercepción obligatoria desplegando `ReassignmentConfirmModal`:
   - Si el usuario pulsa `[Mantener fecha]` o la tecla `Escape`: se descarta el traslado y la tarea conserva intacta su fecha previa D1.
   - Si el usuario pulsa `[Mover fecha]`: se ratifica la reasignación, trasladando la pastilla a la fecha D2 y actualizando el estado central.
5. La superación demostrable de la auditoría del caso forense **VV-003**.

Quedan taxativamente diferidos a unidades posteriores: el arrastre masivo de compras semanales (VV-006, `FIA-A07.05`) y la desasignación por clic derecho (VV-007, `FIA-A07.06`).

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Componente `ReassignmentConfirmModal`:**
   - Diálogo modal con `role="dialog"`, `aria-modal="true"`, `aria-labelledby="reassign-modal-title"` y `aria-describedby="reassign-modal-desc"`.
   - Backdrop semiopaco (`rgba(0, 0, 0, 0.65)`).
   - Título y mensaje claro con las fechas origen y destino: *"Esta tarea ya está asignada al [Fecha Origen]. ¿Deseas moverla al [Fecha Destino]?"*.
   - Botón secundario `[Mantener fecha]` con foco preventivo inicial y tecla `Escape` asociada.
   - Botón primario `[Mover fecha]` con acento visual en azul cobalto (`#2563EB`).
2. **Capacidad de Arrastre en `CalendarTaskPill`:**
   - Incorporar `draggable={true}` y manejador `onDragStart` que empaqueta `DragItemPayload` serializado incluyendo la fecha de la casilla en que reside.
3. **Orquestación en `src/App.tsx`:**
   - Estado de buffer de conflicto `reassignConflict: { item: DragItemPayload; targetDate: string; originDate: string } | null`.
   - Modificación de `handleScheduleItem`: si el ítem ya poseía fecha y `originDate !== targetDate`, abrir `ReassignmentConfirmModal` en lugar de mutar inmediatamente.
   - Si el ítem es nuevo sin fecha previa, asignación directa sin modal.
4. **Validación Forense VV-003:**
   - Pruebas automatizadas simulando el arrastre de una tarea fechada, verificación de presencia del modal, descarte con cancelación/ESC y confirmación efectiva con actualización en servidor/memoria.
5. 100% de tests en verde (mínimo 320+ tests totales en 37 suites, con cero regresiones).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.03_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/calendar-sync/components/CalendarDropZone.tsx`: Soporta receptores de drop y bloqueo de fechas pasadas (Decisión 1A).
  - `src/calendar-sync/components/CalendarTaskPill.tsx`: Componente visual de pastilla, actualmente no arrastrable.
  - `src/App.tsx`: Realiza la asignación directa de fecha ante `onItemDrop` sin verificar si ya existía una fecha previa asignada.
- **Estado de Tests y Compilación:**
  - 308/308 tests en verde en 36 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.02s sin advertencias.
- **Riesgos Iniciales:**
  - Al comparar la fecha previa y la fecha destino, debe normalizarse el formato de cadena ISO (`YYYY-MM-DD`) para evitar falsos positivos provocados por horas o zonas horarias.
  - El modal debe atrapar el evento `Escape` y limpiar adecuadamente el buffer pendiente sin dejar estados zombis.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `src/calendar-sync/components/ReassignmentConfirmModal.tsx`, su CSS y su suite de tests `ReassignmentConfirmModal.test.tsx`.
2. `CalendarTaskPill.tsx` será arrastrable (`draggable={true}`), empaquetando su fecha previa en el payload.
3. `src/App.tsx` integrará `<ReassignmentConfirmModal />` e interceptará reasignaciones en conflicto.
4. El total de tests en verde aumentará a un mínimo de 320+ tests en 37 suites.
5. **Restricciones Negativas:** Cero código de arrastre masivo de compras (VV-006, FIA-A07.05); cero menú contextual de desasignación por clic derecho (VV-007, FIA-A07.06).

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `ReassignmentConfirmModalProps`:
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
- `CalendarTaskPillProps`:
  ```typescript
  export interface CalendarTaskPillProps {
    id: string;
    titulo: string;
    prioridad: 'alta' | 'media' | 'baja';
    modulo: 'tasks' | 'shopping' | 'cleaning';
    completado?: boolean;
    fechaProgramada?: string | Date | null;
    isDraggable?: boolean;
    onClick?: (id: string) => void;
  }
  ```

### 5.2 Contrato de Geometría / Interfaz
- `ReassignmentConfirmModal`: Modal centrado (`position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;`).
- Backdrop: `background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(2px);`.
- Panel modal: ancho máximo 420px, fondo `--bg-card` (`#1A2433`), borde `--border-subtle` (`#233144`), `border-radius: 10px`, padding 24px.
- Botones en fila inferior (`display: flex; justify-content: flex-end; gap: 12px;`). Botón secundario `[Mantener fecha]` (`background-color: transparent; border: 1px solid var(--border-subtle)`), botón primario `[Mover fecha]` (`background-color: var(--accent-cobalt, #2563EB); color: #FFFFFF`).

### 5.3 Contrato de Aislamiento
- El modal no muta directamente ningún estado global ni emite llamadas de red; únicamente responde a `onConfirm` y `onCancel` delegando en `App.tsx`.

### 5.4 Contrato de Dominio / Datos
- Preserva `DragItemPayload` y `CalendarSchedulableItem` de `src/calendar-sync/types/drag-drop.types.ts`.

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/calendar-sync/components/ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx): Componente modal accesible de confirmación de conflicto.
- [`src/calendar-sync/components/ReassignmentConfirmModal.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.module.css): Estilos del modal y backdrop.
- [`src/calendar-sync/components/ReassignmentConfirmModal.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.test.tsx): Suite de pruebas unitarias del modal.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx): Añadir soporte `draggable={true}`, `fechaProgramada` y manejador `onDragStart`.
- [`src/calendar-sync/components/CalendarTaskPill.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.test.tsx): Añadir prueba de arrastre de pastilla empaquetando su fecha previa.
- [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx): Propagar `fechaProgramada` a cada pastilla renderizada en `.cellContent`.
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Orquestar el modal de confirmación `ReassignmentConfirmModal`, gestionando el buffer de conflicto ante reasignaciones.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Añadir pruebas de integración E2E para el escenario forense **VV-003**.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx): Lógica de bloqueo de fechas pasadas sellada en FIA-A07.03.
- [`src/workspace/utils/calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts): Motor de cuadrícula de 7 columnas inmutable.
- [`src/filters/*`](file:///home/hnoloh/Escritorio/Centra-T/src/filters): Motor de filtros y ordenación de RV-A06.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/authentication/*`: Dominio de autenticación.
- `src/users/*`: Dominio de usuarios.
- Endpoints de arrastre masivo de compras (reservado a FIA-A07.05).
- Menú contextual de desasignación por clic derecho (reservado a FIA-A07.06).

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Decisión 4B; Doc 10: Validación Forense QA - Caso VV-003).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Asignar_O_Mover_Fecha_Item_DragDrop` - Paso 2: `Deteccion_De_Conflicto_Y_Confirmacion`).
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`.
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A07.03` (Sellado y consolidado con 308 tests en verde).
  - Desbloquea la elaboración de `FIA-A07.05` (Arrastre Masivo de Compra al Calendario - VV-006).

---

## 8. Restricciones
- Prohibido el uso de carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido reasignar automáticamente sin modal un ítem que ya posea fecha de ejecución asignada.
- Prohibido omitir el soporte de tecla `Escape` o el foco seguro en `[Mantener fecha]`.
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/calendar-sync/components/ReassignmentConfirmModal.test.tsx` con pruebas en rojo:
    1. Renderizado condicional si `isOpen === true`.
    2. Visualización de título de la tarea y fechas origen y destino.
    3. Invocación de `onConfirm` al hacer clic en `[Mover fecha]`.
    4. Invocación de `onCancel` al hacer clic en `[Mantener fecha]`.
    5. Invocación de `onCancel` al presionar tecla `Escape`.
    6. No renderizado en el DOM cuando `isOpen === false`.
  - Añadir en `CalendarTaskPill.test.tsx` prueba de arrastre de pastilla con fecha previa.
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Comprobar que el fallo se debe exclusivamente a la ausencia de `ReassignmentConfirmModal` y a la falta de soporte `draggable` en `CalendarTaskPill`.
- **Paso 3 — Implementar Mínimo:**
  - Implementar `src/calendar-sync/components/ReassignmentConfirmModal.tsx` y su hoja de estilos `.module.css`.
  - Actualizar `src/calendar-sync/components/CalendarTaskPill.tsx` para aceptar `fechaProgramada?: string | Date | null`, `isDraggable?: boolean` y manejar `onDragStart`.
  - Verificar que las pruebas unitarias de `ReassignmentConfirmModal.test.tsx` y `CalendarTaskPill.test.tsx` pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - Actualizar `MonthlyCalendarGrid.tsx` para pasar `fechaProgramada={item.fechaProgramada}` a cada `<CalendarTaskPill />`.
  - En `src/App.tsx`, introducir el estado `reassignConflict` y conectar `<ReassignmentConfirmModal />`.
  - En `handleScheduleItem`, comprobar si el ítem ya poseía fecha previa y si es diferente de `targetDate`: en caso afirmativo, pausar y abrir el modal.
  - Añadir pruebas de integración E2E en `src/App.test.tsx` certificando el caso forense **`[VV-003]`**.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 320+ tests en 37 suites).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar ausencia de drift de archivos ajenos.
- **Paso 7 — Estado Documental:**
  - Preparar los deltas exactos para `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.04.md`, `TEST_REPORT_FIA-A07.04.md`, propuesta de `LOCK-FIA-A07.04.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/calendar-sync/components/ReassignmentConfirmModal.tsx`
```typescript
import React, { useEffect, useRef } from 'react';
import styles from './ReassignmentConfirmModal.module.css';

export interface ReassignmentConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  originDate: string;
  targetDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReassignmentConfirmModal: React.FC<ReassignmentConfirmModalProps> = ({
  isOpen,
  itemTitle,
  originDate,
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
      aria-labelledby="reassign-modal-title"
      aria-describedby="reassign-modal-desc"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 id="reassign-modal-title" className={styles.title}>
          Conflicto de Programación
        </h3>
        <p id="reassign-modal-desc" className={styles.description}>
          Esta tarea (<strong className={styles.itemName}>{itemTitle}</strong>) ya está asignada al{' '}
          <strong className={styles.dateBadge}>{originDate}</strong>.
          <br />
          ¿Deseas moverla al <strong className={styles.dateBadge}>{targetDate}</strong>?
        </p>
        <div className={styles.actionButtons}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Mantener fecha
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Mover fecha
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 10.2 `src/calendar-sync/components/ReassignmentConfirmModal.module.css`
```css
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background-color: var(--bg-card, #1A2433);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: 10px;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.description {
  font-size: 13px;
  line-height: 1.5;
  color: #94A3B8;
  margin: 0;
}

.itemName {
  color: #F8FAFC;
}

.dateBadge {
  color: var(--accent-cobalt, #2563EB);
}

.actionButtons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.cancelButton {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--border-subtle, #233144);
  color: #CBD5E1;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancelButton:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.confirmButton {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  background-color: var(--accent-cobalt, #2563EB);
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.confirmButton:hover {
  background-color: #1D4ED8;
}
```

### 10.3 `src/calendar-sync/components/CalendarTaskPill.tsx`
Añadir soporte de arrastre nativo:
```typescript
export interface CalendarTaskPillProps {
  id: string;
  titulo: string;
  prioridad: 'alta' | 'media' | 'baja';
  modulo: 'tasks' | 'shopping' | 'cleaning';
  completado?: boolean;
  fechaProgramada?: string | Date | null;
  isDraggable?: boolean;
  onClick?: (id: string) => void;
}
```
En el manejador `handleDragStart`:
```typescript
const handleDragStart = (e: React.DragEvent) => {
  const dateStr = fechaProgramada instanceof Date 
    ? fechaProgramada.toISOString().slice(0, 10) 
    : fechaProgramada || null;
  const payload: DragItemPayload = {
    id,
    modulo,
    titulo,
    prioridad,
    completado: Boolean(completado),
    fechaProgramada: dateStr,
  };
  e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
  e.dataTransfer.setData('text/plain', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'move';
};
```

### 10.4 `src/App.tsx`
Incorporar:
```typescript
const [reassignConflict, setReassignConflict] = useState<{
  item: DragItemPayload;
  targetDate: string;
  originDate: string;
} | null>(null);

const applySchedule = (item: DragItemPayload, targetDate: string) => {
  const targetDateObj = new Date(`${targetDate}T00:00:00`);
  if (item.modulo === 'tasks') {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, fechaProgramada: targetDateObj } : t))
    );
  } else if (item.modulo === 'shopping') {
    setAllShopping((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, fechaProgramada: targetDateObj } : s))
    );
  } else if (item.modulo === 'cleaning') {
    setAllCleaning((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, fechaProgramada: targetDateObj } : c))
    );
  }
};

const handleScheduleItem = (draggedItem: DragItemPayload, targetDate: string) => {
  const originDateStr = draggedItem.fechaProgramada
    ? typeof draggedItem.fechaProgramada === 'string'
      ? draggedItem.fechaProgramada.slice(0, 10)
      : draggedItem.fechaProgramada instanceof Date
      ? draggedItem.fechaProgramada.toISOString().slice(0, 10)
      : null
    : null;

  // Si ya tenía fecha asignada y es distinta a la fecha de destino -> CONFLICTO (Decisión 4B / VV-003)
  if (originDateStr && originDateStr !== targetDate) {
    setReassignConflict({
      item: draggedItem,
      targetDate,
      originDate: originDateStr,
    });
    return;
  }

  // Si no tenía fecha previa, asignación directa sin modal
  applySchedule(draggedItem, targetDate);
};
```
Y renderizar al final del componente:
```tsx
<ReassignmentConfirmModal
  isOpen={Boolean(reassignConflict)}
  itemTitle={reassignConflict?.item.titulo || ''}
  originDate={reassignConflict?.originDate || ''}
  targetDate={reassignConflict?.targetDate || ''}
  onConfirm={() => {
    if (reassignConflict) {
      applySchedule(reassignConflict.item, reassignConflict.targetDate);
      setReassignConflict(null);
    }
  }}
  onCancel={() => setReassignConflict(null)}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/calendar-sync/components/ReassignmentConfirmModal.test.tsx`:
   - `renderiza el diálogo modal cuando isOpen es true`
   - `muestra el título de la tarea y las fechas de origen y destino`
   - `invoca onConfirm al pulsar [Mover fecha]`
   - `invoca onCancel al pulsar [Mantener fecha]`
   - `invoca onCancel al presionar la tecla Escape`
   - `no renderiza nada en el DOM cuando isOpen es false`
2. `src/calendar-sync/components/CalendarTaskPill.test.tsx`:
   - `permite arrastre nativo serializando DragItemPayload con su fecha previa`

### 11.2 Tests de Integración / UI
1. `src/App.test.tsx`:
   - `[VV-003]: Arrastrar una tarea previamente fechada hacia una nueva fecha abre obligatoriamente el modal de conflicto`
   - `[VV-003]: Pulsar [Mantener fecha] o ESC en el modal aborta el cambio y conserva la fecha original`
   - `[VV-003]: Pulsar [Mover fecha] en el modal confirma la reasignación trasladando la pastilla a la nueva casilla`

### 11.3 Tests Negativos y de Regresión
- Verificar que las tareas sin fecha previa continúan asignándose directamente sin abrir el modal.
- Verificar que soltar en el mismo día no produce alertas redundantes.
- Preservar al 100% las 36 suites previas (308 tests existentes).

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
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 320+ tests totales).
- `QG-04 · Anti-Drift Scan:` Verificación de que no se tocaron archivos ajenos al alcance ni se adelantaron capacidades de VV-006 o VV-007.
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A07.04: Modal de intercepción ante reasignación de fecha (Decisión 4B / Caso VV-003) con confirmación explícita, soporte ESC y foco seguro"
  ],
  "active_constraints": [
    "Mover tareas previamente fechadas requiere confirmación en ReassignmentConfirmModal",
    "Pulsar Mantener fecha o presionar Escape aborta el cambio y preserva la fecha original",
    "Confirmar con Mover fecha ratifica el traslado de casilla en la cuadrícula mensual"
  ],
  "unlocked_next": "FIA-A07.05 · Arrastre Masivo de Compra al Calendario (VV-006)"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/calendar-sync/components/ReassignmentConfirmModal.tsx",
    "src/calendar-sync/components/ReassignmentConfirmModal.module.css",
    "src/calendar-sync/components/ReassignmentConfirmModal.test.tsx"
  ],
  "files_modified": [
    "src/calendar-sync/components/CalendarTaskPill.tsx",
    "src/calendar-sync/components/CalendarTaskPill.test.tsx",
    "src/workspace/components/MonthlyCalendarGrid.tsx",
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
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "workbench": "monthly_calendar_grid_with_past_date_blocking_and_task_pills",
    "calendar_header": "month_year_controls_previous_next_today",
    "hub_cards": "draggable_cards_with_html5_dnd_payload",
    "calendar_pills": "draggable_task_pills_between_dates",
    "reassignment_modal": "dialog_modal_origin_vs_target_date_confirmation"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `ReassignmentConfirmModal.tsx` está implementado, estilizado y verificado con tests unitarios.
2. `CalendarTaskPill.tsx` soporta arrastre con su fecha programada.
3. `App.tsx` orquesta el modal de conflicto ante reasignaciones entre fechas distintas.
4. Se supera de forma demostrable la auditoría del caso forense `VV-003`.
5. Los 8 pasos del plan fueron ejecutados secuencialmente.
6. Los 5 Quality Gates pasaron limpiamente.
7. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.04.md`, `TEST_REPORT_FIA-A07.04.md` y `LOCK-FIA-A07.04.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en la unidad `FIA-A07.04`. Queda terminantemente prohibido avanzar a `FIA-A07.05` o unidades sucesivas en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Zero Scope Creep:** Prohibido implementar arrastre masivo de compras (Caso VV-006, reservado a FIA-A07.05) ni desasignación por clic derecho (Caso VV-007, reservado a FIA-A07.06).
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A07.04.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
