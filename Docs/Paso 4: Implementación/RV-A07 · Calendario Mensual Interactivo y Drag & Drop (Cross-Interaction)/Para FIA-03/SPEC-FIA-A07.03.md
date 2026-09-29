# SPEC-FIA-A07.03 · BLOQUEO FECHAS PASADAS Y RETORNO ELÁSTICO (VV-002)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** TERCERA UNIDAD DE RV-A07 (REGLA 1A, AUDITORÍA FORENSE VV-002, FEEDBACK CARMESÍ Y RETORNO ELÁSTICO)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.03 · Bloqueo Fechas Pasadas y Retorno Elástico (VV-002)  
**PVF de Cierre:** PVF-A07.03 · Bloqueo Inflexible de Drop en Fechas Pasadas (Decisión 1A)  
**VF:** VF-A07.03 · Bloqueo de Drop en Fechas Pasadas (Decisión 1A / VV-002)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.02.md APROBADO (FIA-A07.02_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el cumplimiento inflexible de la **Decisión Arquitectónica 1A** y la validación forense **VV-002** en el subsistema [`src/calendar-sync/`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync) y la cuadrícula mensual del planificador.

Esta tercera unidad táctica de la Rebanada Vertical **RV-A07** cubre:
1. La intercepción de eventos de arrastre (`dragOver`, `dragEnter`, `dragLeave`) sobre casillas de fechas pasadas (`isPast === true`), bloqueando la activación receptora habitual.
2. La materialización del estado visual preventivo carmesí [`.dropZonePastBlocked`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css) con tinte carmesí translúcido (`rgba(239, 68, 68, 0.12)`), borde de advertencia discontinuo (`#EF4444`) y cursor `not-allowed`.
3. La fijación explícita de `e.dataTransfer.dropEffect = 'none'` en eventos de sobrevuelo sobre casillas pasadas.
4. La anulación innegociable del soltado (`drop`) sobre fechas pasadas: cero llamadas a `onItemDrop`, cero llamadas de red y cero mutaciones de estado, garantizando el retorno elástico nativo de la tarjeta a su origen en el Hub.
5. La superación auditable del caso forense QA **VV-002**.

Quedan taxativamente diferidos a unidades posteriores: el modal de confirmación de conflicto al mover tareas ya fechadas (VV-003, `FIA-A07.04`), el arrastre masivo de compras semanales (VV-006, `FIA-A07.05`) y la desasignación por clic derecho (VV-007, `FIA-A07.06`).

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Intercepción Condicional por `isPast` en [`CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx):**
   - Incorporar la propiedad `isPast?: boolean` en la lógica de control interna.
   - En `handleDragOver` y `handleDragEnter`: si `isPast === true`, aplicar `e.dataTransfer.dropEffect = 'none'`, activar la clase `.dropZonePastBlocked`, fijar `isOver = false` y abortar la habilitación del drop.
   - En `handleDragLeave`: retirar la clase de bloqueo `.dropZonePastBlocked`.
   - En `handleDrop`: si `isPast === true`, ejecutar `e.preventDefault()`, limpiar estados visuales y retornar inmediatamente sin invocar `onItemDrop`.
2. **Estilizado Preventivo Carmesí en [`CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css):**
   - Definir la clase `.dropZonePastBlocked` con:
     - `outline: 2px dashed var(--accent-crimson, #EF4444);`
     - `outline-offset: -2px;`
     - `background-color: rgba(239, 68, 68, 0.12);`
     - `border-radius: 4px;`
     - `cursor: not-allowed !important;`
3. **Preservación Invariable de Fechas Válidas:**
   - Casillas con `isPast === false` (día de hoy y días futuros) mantienen intacto el comportamiento sellado en `FIA-A07.02`: activación cobalto `.dropZoneActive`, `dropEffect = 'move'` y ejecución exitosa de `onItemDrop`.
4. **Verificación de Escenario Forense VV-002:**
   - Comprobación automatizada en suite unitaria y suite E2E de que arrastrar una tarjeta a una casilla pasada cancela el drop, no altera `fechaProgramada` del ítem y no produce llamadas de red.
5. 100% de tests en verde (mínimo 315+ tests totales en 36 suites, con cero regresiones).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.02_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/calendar-sync/components/CalendarDropZone.tsx`: Posee `isPast?: boolean` en `CalendarDropZoneProps`, pero no la utiliza internamente en sus manejadores de eventos.
  - `src/calendar-sync/components/CalendarDropZone.module.css`: Posee estilos `.dropZone` y `.dropZoneActive` (cobalto), pero carece de la clase `.dropZonePastBlocked` (carmesí).
  - `src/workspace/components/MonthlyCalendarGrid.tsx`: Ya suministra `isPast={day.isPast}` a cada `<CalendarDropZone />`.
  - `src/workspace/utils/calendarMatrix.ts`: Calcula deterministamente `isPast: boolean` comparando con la medianoche del día actual.
- **Estado de Tests y Compilación:**
  - 302/302 tests en verde en 36 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 1.94s sin advertencias.
- **Riesgos Iniciales:**
  - En jsdom, simular `dragOver` en elementos con `isPast` debe comprobar tanto la presencia de la clase CSS de bloqueo como el valor de `dataTransfer.dropEffect`.
  - Debe asegurarse que el retorno elástico se traduzca en una total invariancia del estado de la aplicación.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. `CalendarDropZone.tsx` implementará la bifurcación lógica según `isPast`:
   - Si `isPast === true`: `dropEffect = 'none'`, clase `.dropZonePastBlocked`, cursor `not-allowed`, y anulación incondicional en `handleDrop`.
   - Si `isPast === false`: comportamiento estándar con `.dropZoneActive` y soltado permitido.
2. `CalendarDropZone.module.css` contendrá la regla `.dropZonePastBlocked`.
3. `CalendarDropZone.test.tsx` incorporará al menos 3 nuevas pruebas unitarias dedicadas a fechas pasadas.
4. `MonthlyCalendarGrid.test.tsx` y `App.test.tsx` verificarán la auditoría forense del caso `VV-002`.
5. El total de tests en verde aumentará a un mínimo de 315+ tests.
6. **Restricciones Negativas:** Cero código de diálogo modal de conflicto (VV-003, FIA-A07.04); cero arrastre masivo de compras (VV-006, FIA-A07.05); cero menú contextual de clic derecho (VV-007, FIA-A07.06).

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `CalendarDropZoneProps`:
  ```typescript
  export interface CalendarDropZoneProps {
    dateString: string;
    isPast?: boolean;
    isCurrentMonth?: boolean;
    children?: React.ReactNode;
    onItemDrop?: (item: DragItemPayload, targetDate: string) => void;
    className?: string;
  }
  ```
  *(La firma se preserva idéntica, activando el uso funcional de `isPast`)*.

### 5.2 Contrato de Geometría / Interfaz
- Estado de bloqueo carmesí `.dropZonePastBlocked`:
  - `outline: 2px dashed #EF4444;`
  - `background-color: rgba(239, 68, 68, 0.12);`
  - `cursor: not-allowed !important;`
  - `data-drop-blocked="true"` añadido condicionalmente al DOM cuando `isBlocked === true` para inspección de pruebas y accesibilidad.

### 5.3 Contrato de Aislamiento
- Aislamiento estricto de frontera temporal (Decisión 1A): la comprobación se ejecuta directamente en la superficie del receptor (`CalendarDropZone`) antes de emitir cualquier evento hacia el estado superior (`App.tsx`).
- Cero llamadas a servicios de red ante eventos bloqueados.

### 5.4 Contrato de Dominio / Datos
- Preserva `DragItemPayload` y `CalendarSchedulableItem` sellados en `FIA-A07.02`.

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- *No se crean nuevos archivos en esta FIA; se profundiza y especializa el subsistema existente en `src/calendar-sync/`.*

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx): Añadir control de `isPast` en manejadores de arrastre, estado `isBlocked`, y bloqueo total de soltado.
- [`src/calendar-sync/components/CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css): Añadir estilos de bloqueo `.dropZonePastBlocked`.
- [`src/calendar-sync/components/CalendarDropZone.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.test.tsx): Añadir pruebas unitarias del bloqueo de fechas pasadas y rechazo de soltado.
- [`src/workspace/components/MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx): Añadir prueba de integración de casillas pasadas bloqueadas vs casillas futuras habilitadas.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Añadir prueba de validación forense E2E del caso `VV-002` (arrastre a fecha pasada anula asignación).

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx): Renderizado de pastillas compactas intacto.
- [`src/calendar-sync/types/drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts): Contratos tipados de transporte sellados.
- [`src/workspace/utils/calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts): Motor temporal puro sellado.
- [`src/filters/*`](file:///home/hnoloh/Escritorio/Centra-T/src/filters): Motor de filtrado y ordenación intacto.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/authentication/*`: Dominio de autenticación.
- `src/users/*`: Dominio de usuarios.
- Endpoints remotos o bases de datos externas.
- Diálogos modales nuevos (reservados a FIA-A07.04).

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Decisión 1A; Doc 10: Validación Forense QA - Caso VV-002).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Asignar_O_Mover_Fecha_Item_DragDrop`).
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`.
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A07.02` (Sellado y consolidado).
  - Desbloquea la elaboración de `FIA-A07.04` (Modal de conflicto en reasignación de fecha - VV-003).

---

## 8. Restricciones
- Prohibido el uso de carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido instalar librerías externas para animaciones o drag & drop.
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).
- Prohibido adelantar el modal de reasignación (Caso VV-003, reservado a FIA-A07.04) o el arrastre masivo de compras (Caso VV-006, reservado a FIA-A07.05).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Abrir `src/calendar-sync/components/CalendarDropZone.test.tsx` y añadir los tests en rojo para fechas pasadas:
    1. `dragOver` en casilla pasada activa `.dropZonePastBlocked` y asigna `dropEffect = 'none'`.
    2. `dragLeave` en casilla pasada remueve `.dropZonePastBlocked`.
    3. `drop` en casilla pasada ejecuta `preventDefault` y NO invoca `onItemDrop` (Caso VV-002).
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Verificar que el fallo se debe exclusivamente a que `CalendarDropZone.tsx` no discrimina `isPast` y permite el soltado indiscriminado.
- **Paso 3 — Implementar Mínimo:**
  - En `src/calendar-sync/components/CalendarDropZone.module.css`: incorporar la clase `.dropZonePastBlocked` con outline carmesí `#EF4444`, fondo `rgba(239, 68, 68, 0.12)` y `cursor: not-allowed`.
  - En `src/calendar-sync/components/CalendarDropZone.tsx`:
    - Desestructurar `isPast = false`.
    - Crear estado local `isBlocked: boolean`.
    - Interceptar en `handleDragOver` y `handleDragEnter`: si `isPast`, fijar `dropEffect = 'none'`, `setIsBlocked(true)`, `setIsOver(false)`.
    - En `handleDragLeave`: limpiar `setIsBlocked(false)`.
    - En `handleDrop`: si `isPast`, limpiar estados y retornar sin invocar `onItemDrop`.
    - Reflejar `isBlocked ? styles.dropZonePastBlocked : ''` en las clases aplicadas y añadir `data-drop-blocked={isBlocked ? 'true' : undefined}`.
- **Paso 4 — Integrar:**
  - Comprobar que `MonthlyCalendarGrid.tsx` propaga adecuadamente `isPast={day.isPast}` a cada `CalendarDropZone`.
  - Añadir prueba de integración en `MonthlyCalendarGrid.test.tsx` verificando que casillas con `isPast` bloquean el drop.
  - Añadir prueba E2E en `src/App.test.tsx` validando que una tarea arrastrada a una fecha pasada no se asigna al calendario y permanece intacta en el Hub.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 315+ tests).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar ausencia de drift de archivos ajenos.
- **Paso 7 — Estado Documental:**
  - Preparar los deltas exactos para `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.03.md`, `TEST_REPORT_FIA-A07.03.md`, propuesta de `LOCK-FIA-A07.03.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/calendar-sync/components/CalendarDropZone.module.css`
Añadir al final del archivo:
```css
.dropZonePastBlocked {
  outline: 2px dashed var(--accent-crimson, #EF4444);
  outline-offset: -2px;
  background-color: rgba(239, 68, 68, 0.12);
  border-radius: 4px;
  cursor: not-allowed !important;
}
```

### 10.2 `src/calendar-sync/components/CalendarDropZone.tsx`
Actualizar con la lógica de bloqueo temporal innegociable:
```typescript
import React, { useState } from 'react';
import styles from './CalendarDropZone.module.css';
import { DRAG_TRANSFER_MIME, DragItemPayload } from '../types/drag-drop.types';

export interface CalendarDropZoneProps {
  dateString: string;
  isPast?: boolean;
  isCurrentMonth?: boolean;
  children?: React.ReactNode;
  onItemDrop?: (item: DragItemPayload, targetDate: string) => void;
  className?: string;
}

export const CalendarDropZone: React.FC<CalendarDropZoneProps> = ({
  dateString,
  isPast = false,
  children,
  onItemDrop,
  className,
}) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isPast) {
      e.dataTransfer.dropEffect = 'none';
      if (!isBlocked) setIsBlocked(true);
      if (isOver) setIsOver(false);
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (isPast) {
      e.dataTransfer.dropEffect = 'none';
      setIsBlocked(true);
      setIsOver(false);
      return;
    }
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as Node | null;
    if (e.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsOver(false);
    setIsBlocked(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setIsBlocked(false);

    // Decisión 1A / Caso VV-002: Bloqueo inflexible de fechas pasadas
    if (isPast) {
      return;
    }

    const rawData =
      e.dataTransfer.getData(DRAG_TRANSFER_MIME) ||
      e.dataTransfer.getData('text/plain');

    if (!rawData) {
      return;
    }

    try {
      const payload = JSON.parse(rawData) as DragItemPayload;
      if (payload && payload.id && payload.modulo) {
        onItemDrop?.(payload, dateString);
      }
    } catch {
      // Descarte inofensivo ante payloads corruptos
    }
  };

  const combinedClasses = [
    styles.dropZone,
    isOver ? styles.dropZoneActive : '',
    isBlocked ? styles.dropZonePastBlocked : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={combinedClasses}
      data-testid={`calendar-drop-zone-${dateString}`}
      data-date={dateString}
      data-drop-blocked={isBlocked ? 'true' : undefined}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/calendar-sync/components/CalendarDropZone.test.tsx`:
   - `activa el estado isBlocked (.dropZonePastBlocked) y establece dropEffect = none al sobrevolar una casilla pasada (isPast=true)`
   - `remueve .dropZonePastBlocked al salir de la casilla pasada con dragLeave`
   - `anula el drop y NO invoca onItemDrop cuando isPast=true (Caso VV-002)`
   - `mantiene el funcionamiento habitual con .dropZoneActive y dropEffect = move cuando isPast=false`

### 11.2 Tests de Integración / UI
1. `src/workspace/components/MonthlyCalendarGrid.test.tsx`:
   - `bloquea el soltado en casillas de días pasados y lo permite en días presentes y futuros`
2. `src/App.test.tsx`:
   - `[VV-002]: Arrastrar una tarea a una casilla de fecha pasada anula la operación, no crea la pastilla en el calendario y preserva la tarea intacta en el Hub`

### 11.3 Tests Negativos y de Regresión
- Disparar eventos `drop` sintéticos con fecha pasada: verificar cero mutaciones de estado en la colección central.
- Preservar al 100% las 36 suites previas (302 tests existentes).

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
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 315+ tests totales).
- `QG-04 · Anti-Drift Scan:` Verificación de que no se tocaron archivos ajenos al alcance ni se adelantaron capacidades de VV-003, VV-006 o VV-007.
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A07.03: Bloqueo inflexible de fechas pasadas en Drag & Drop (Decisión 1A / Caso VV-002) con tinte carmesí, cursor not-allowed y anulación total de soltado sin mutaciones"
  ],
  "active_constraints": [
    "Casillas pasadas (isPast=true) bloquean dragOver con dropEffect=none y clase .dropZonePastBlocked",
    "Soltado sobre fecha pasada es inoperante: cero llamadas de red, cero mutaciones y retorno elástico de la tarjeta al Hub",
    "Preservación de drop en fechas presentes y futuras"
  ],
  "unlocked_next": "FIA-A07.04 · Modal Conflicto en Reasignación de Fecha (VV-003)"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [],
  "files_modified": [
    "src/calendar-sync/components/CalendarDropZone.tsx",
    "src/calendar-sync/components/CalendarDropZone.module.css",
    "src/calendar-sync/components/CalendarDropZone.test.tsx",
    "src/workspace/components/MonthlyCalendarGrid.test.tsx",
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
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "workbench": "monthly_calendar_grid_with_past_date_blocking_and_task_pills",
    "calendar_header": "month_year_controls_previous_next_today",
    "hub_cards": "draggable_cards_with_html5_dnd_payload",
    "drop_feedback_valid": "blue_accent_highlight_dropZoneActive",
    "drop_feedback_blocked": "crimson_accent_highlight_dropZonePastBlocked_not_allowed"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `CalendarDropZone.tsx` y su CSS incorporan el bloqueo carmesí de fechas pasadas y cursor `not-allowed`.
2. El soltado sobre casillas pasadas no produce efectos secundarios ni peticiones HTTP.
3. Se supera de forma demostrable la auditoría del caso forense `VV-002`.
4. Los 8 pasos del plan fueron ejecutados secuencialmente.
5. Los 5 Quality Gates pasaron limpiamente.
6. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.03.md`, `TEST_REPORT_FIA-A07.03.md` y `LOCK-FIA-A07.03.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en la unidad `FIA-A07.03`. Queda terminantemente prohibido avanzar a `FIA-A07.04` o unidades sucesivas en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Zero Scope Creep:** Prohibido implementar modales de confirmación de conflicto de reasignación (Caso VV-003, reservado a FIA-A07.04). Limítate taxativamente a la Decisión 1A / Caso VV-002.
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A07.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
