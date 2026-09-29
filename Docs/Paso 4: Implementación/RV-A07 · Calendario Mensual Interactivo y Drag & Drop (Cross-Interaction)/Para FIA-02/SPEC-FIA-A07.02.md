# SPEC-FIA-A07.02 · INFRAESTRUCTURA DRAG & DROP Y ASIGNACIÓN DE ÍTEM

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A07 (DRAG & DROP, RECEPTOR DE CASILLA Y MATERIALIZACIÓN DE PÍLDORA)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.02 · Infraestructura Drag & Drop y Asignación de Ítem  
**PVF de Cierre:** PVF-A07.02 · Asignación de Ítem a Fecha mediante Drag and Drop  
**VF:** VF-A07.02 · Programación de Ítem en Calendario mediante Drag and Drop  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.01.md APROBADO (FIA-A07.01_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando la infraestructura de interacción cruzada Drag & Drop entre el panel lateral (Hub) y el planificador mensual (Calendario), creando formalmente el módulo [`src/calendar-sync/`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync).

Esta segunda unidad táctica de la Rebanada Vertical **RV-A07** cubre:
1. La definición de contratos tipados de arrastre y soltado en [`src/calendar-sync/types/drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts).
2. El componente receptor [`CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx) y sus estilos en [`src/calendar-sync/components/CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css).
3. El componente visual de píldora de ítem en casilla [`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx) y sus estilos en [`src/calendar-sync/components/CalendarTaskPill.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.module.css).
4. La habilitación de arrastre (`draggable`) en las tarjetas del Hub (`TaskCard`, `ShoppingCard`, `CleaningCard`).
5. La integración de receptores de soltado y visualización de píldoras en cada casilla de [`MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx).
6. La orquestación reactiva de la asignación de fecha (`onScheduleItem`) en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) de modo que al soltar una tarjeta sobre un día válido, se materialice inmediatamente la píldora en la casilla y se actualice el ítem en memoria.

Quedan expresamente diferidos a unidades posteriores: el bloqueo de fechas pasadas con retorno elástico (VV-002, `FIA-A07.03`), el modal de conflicto al mover tareas fechadas (VV-003, `FIA-A07.04`), el arrastre masivo de compra (VV-006, `FIA-A07.05`) y la desasignación por clic derecho (VV-007, `FIA-A07.06`).

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Contratos Tipados de Transferencia:** `DragItemPayload` y `CalendarSchedulableItem` para transporte homogéneo de tareas, compras y limpieza.
2. **Componente Receptor `CalendarDropZone`:**
   - Detecta eventos `dragOver`, `dragLeave` y `drop`.
   - Señaliza visualmente el estado receptor activo (`.dropZoneActive` con borde cobalto discontinuo y fondo translúcido).
   - Emite el evento `onItemDrop(item, targetDate)` pasando el payload y la fecha destino ISO `YYYY-MM-DD`.
3. **Componente Visual `CalendarTaskPill`:**
   - Renderiza dentro de la casilla del calendario el puntito sutil de prioridad de 7x7px (`.priorityDotAlta`, `.priorityDotMedia`, `.priorityDotBaja`), el distintivo de módulo (`T`, `C`, `L` o etiqueta correspondiente) y el título truncado con elipsis en fuente compacta (11px/12px).
   - Posee identificadores semánticos `data-testid="calendar-pill-{id}"` y `data-item-id="{id}"`.
4. **Habilitación de Arrastre en Tarjetas del Hub:**
   - `TaskCard`, `ShoppingCard` y `CleaningCard` deben incorporar el atributo `draggable="true"` y el manejador `onDragStart`, empaquetando en el `dataTransfer` el payload serializado en JSON bajo el tipo `'application/x-centrat-item'` (y fallback `'text/plain'`).
5. **Proyección en el Calendario y Orquestación en `App.tsx`:**
   - `MonthlyCalendarGrid` recibe la colección de ítems programados y el callback `onItemDrop`.
   - Cada casilla del mes aloja su `CalendarDropZone` y renderiza la lista de píldoras correspondientes a su `dateString`.
   - `App.tsx` coordina `handleScheduleItem(itemId, modulo, dateString)` actualizando la colección en memoria y disparando el re-render reactivo en caliente.
6. 100% de tests en verde (mínimo 300+ tests totales sin regresiones en las 34 suites existentes).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.01_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/workspace/components/MonthlyCalendarGrid.tsx`: Cuadrícula de 7 columnas fija comenzando en Lunes con navegación temporal de meses, actualmente sin zonas de drop ni proyección de ítems.
  - `src/workspace/utils/calendarMatrix.ts`: Motor puro de matriz temporal (35 o 42 casillas con `dateString: 'YYYY-MM-DD'`).
  - `src/tasks/components/TaskCard.tsx`, `src/shopping/components/ShoppingCard.tsx`, `src/cleaning/components/CleaningCard.tsx`: Tarjetas operativas en el Hub con menú contextual de 3 puntos y dot de 7x7px, pero sin soporte de arrastre (`draggable`).
  - `src/App.tsx`: Orquesta el Hub y el Workspace suministrando `workbenchSlot={<MonthlyCalendarGrid />}`.
- **Estado de Tests y Compilación:**
  - 283/283 tests pasando en 34 suites en Vitest 3.0.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 1.97s sin advertencias.
- **Riesgos Iniciales:**
  - En testing bajo jsdom, la API de HTML5 Drag and Drop (`dragstart`, `dragover`, `drop`, `dataTransfer`) requiere simulación con `fireEvent` construyendo objetos `dataTransfer` con `setData` y `getData`. Deben implementarse utilidades de prueba limpias.
  - Evitar mutaciones directas de estado; la actualización de `fechaProgramada` en `App.tsx` debe ser inmutable (`map(...)`).

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá el nuevo módulo `src/calendar-sync/` conteniendo:
   - `src/calendar-sync/types/drag-drop.types.ts`
   - `src/calendar-sync/components/CalendarDropZone.tsx` y `.module.css`
   - `src/calendar-sync/components/CalendarDropZone.test.tsx`
   - `src/calendar-sync/components/CalendarTaskPill.tsx` y `.module.css`
   - `src/calendar-sync/components/CalendarTaskPill.test.tsx`
2. Las tarjetas `TaskCard`, `ShoppingCard` y `CleaningCard` permitirán ser arrastradas mediante `draggable={true}` y `onDragStart`.
3. `MonthlyCalendarGrid.tsx` renderizará cada celda envuelta o equipada con `CalendarDropZone` y proyectará en `.cellContent` las píldoras `<CalendarTaskPill />` para los ítems cuya `fechaProgramada` coincida con `day.dateString`.
4. `src/App.tsx` vinculará el arrastre del Hub con el Calendario mediante `handleScheduleItem(itemId, modulo, targetDate)`.
5. El total de tests en verde aumentará superando los 300+ tests totales.
6. **Restricciones Negativas:** Cero modales de confirmación de conflicto (VV-003); cero bloqueo carmesí de fechas pasadas (VV-002); cero arrastre masivo de compras (VV-006); cero menú contextual de desasignación por clic derecho (VV-007).

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
- `CalendarTaskPillProps`:
  ```typescript
  export interface CalendarTaskPillProps {
    id: string;
    titulo: string;
    prioridad: 'alta' | 'media' | 'baja';
    modulo: 'tasks' | 'shopping' | 'cleaning';
    completado?: boolean;
    onClick?: (id: string) => void;
  }
  ```

### 5.2 Contrato de Geometría / Interfaz
- `CalendarTaskPill`: Altura fija de 22px, `display: flex`, `align-items: center`, `padding: 2px 6px`, `gap: 6px`, `border-radius: 4px`, fondo `--bg-card` (`#1A2433`) con borde sutil `--border-subtle` (`#233144`).
- Dot de prioridad idéntico a las tarjetas: 7x7px, círculo perfecto (`border-radius: 50%`), con colores:
  - Alta: `--priority-high` (`#EF4444`)
  - Media: `--priority-medium` (`#F59E0B`)
  - Baja: `--priority-low` (`#10B981`)
- Distintivo de módulo: Badge tipográfico discreto de 14x14px (`T`, `C`, `L`) con fondo sutil.
- `CalendarDropZone`: Ocupa el 100% de la celda de la rejilla. Al estar en estado activo (`isOver`), aplica `.dropZoneActive` con `outline: 2px dashed #2563EB` y `background-color: rgba(37, 99, 235, 0.08)`.

### 5.3 Contrato de Aislamiento
- `src/calendar-sync/` actúa como adaptador de interacción cruzada entre el Hub y el Workspace.
- La persistencia y mutaciones de datos se canalizan a través de los handlers de `App.tsx` respetando el flujo unidireccional de datos de React.

### 5.4 Contrato de Dominio / Datos
```typescript
export type ItemModule = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

export interface DragItemPayload {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada?: string | null;
}

export interface CalendarSchedulableItem {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada: Date | string | null;
}
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/calendar-sync/types/drag-drop.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/types/drag-drop.types.ts): Definición de tipos canónicos de DnD y elementos programables.
- [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx): Componente receptor de soltado en casillas del calendario.
- [`src/calendar-sync/components/CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css): Estilos visuales de zona de soltado y feedback de arrastre (`.dropZoneActive`).
- [`src/calendar-sync/components/CalendarDropZone.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.test.tsx): Suite de pruebas unitarias de `CalendarDropZone`.
- [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx): Componente visual de píldora para ítems dentro de una casilla del calendario.
- [`src/calendar-sync/components/CalendarTaskPill.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.module.css): Estilos visuales de la píldora (tipografía compacta, dot de prioridad 7x7px, badge de módulo).
- [`src/calendar-sync/components/CalendarTaskPill.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.test.tsx): Suite de pruebas unitarias de `CalendarTaskPill`.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/tasks/components/TaskCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx): Añadir soporte de arrastre nativo (`draggable`, `onDragStart`) empaquetando `DragItemPayload`.
- [`src/shopping/components/ShoppingCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx): Añadir soporte de arrastre nativo (`draggable`, `onDragStart`) empaquetando `DragItemPayload`.
- [`src/cleaning/components/CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx): Añadir soporte de arrastre nativo (`draggable`, `onDragStart`) empaquetando `DragItemPayload`.
- [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx): Incorporar prop `scheduledItems?: CalendarSchedulableItem[]` y `onItemDrop?: (item: DragItemPayload, targetDate: string) => void`, envolviendo casillas con `CalendarDropZone` y proyectando `<CalendarTaskPill />` en `cellContent`.
- [`src/workspace/components/MonthlyCalendarGrid.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.module.css): Ajuste de altura mínima y distribución flex de `.cellContent` para albergar píldoras con scroll contenido si superan la capacidad visual.
- [`src/workspace/components/MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx): Pruebas de integración verificando la presencia de drop zones y la proyección de píldoras en las fechas correspondientes.
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Orquestar el callback `handleScheduleItem`, consolidar la lista de ítems programados y pasarla a `<MonthlyCalendarGrid scheduledItems={...} onItemDrop={handleScheduleItem} />`.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Añadir prueba de integración end-to-end simulando arrastre de una tarjeta desde el Hub y soltado en una casilla, verificando que la píldora aparece en el calendario.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/workspace/utils/calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts): Motor de cuadrícula de 7 columnas sellado en FIA-A07.01.
- [`src/filters/*`](file:///home/hnoloh/Escritorio/Centra-T/src/filters): Motor de filtros y ordenación de RV-A06.
- [`src/hub/components/*`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components): Acordeones del Hub (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/authentication/*`: Dominio de autenticación y sesiones.
- `src/users/*`: Dominio de usuarios.
- Endpoints de backend en producción o persistencia remota no autorizada.

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08; Doc 08: Estilos Visuales; Doc 10: Validación Forense QA).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync).
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`.
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros consumiendo `tokens.css`, Vitest 3.0.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere el LOCK formal de `FIA-A07.01` (Aprobado).
  - Desbloquea la elaboración de `FIA-A07.03` (Bloqueo de Fechas Pasadas y Retorno Elástico - VV-002).

---

## 8. Restricciones
- Prohibido el uso de carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido instalar paquetes externos que generen conflictos de dependencias con React 19. La API estándar de HTML5 Drag and Drop es nativa en los navegadores y React la soporta sin dependencias adicionales.
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).
- Prohibido adelantar maquetación o lógica de las unidades `FIA-A07.03` (bloqueo carmesí de fechas pasadas), `FIA-A07.04` (modal de conflicto), `FIA-A07.05` (arrastre de compra masiva) o `FIA-A07.06` (desasignación por clic derecho).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/calendar-sync/components/CalendarTaskPill.test.tsx` verificando renderizado de título, punto de prioridad de 7x7px (`alta`, `media`, `baja`) y distintivo de módulo.
  - Crear `src/calendar-sync/components/CalendarDropZone.test.tsx` verificando renderizado de hijos, activación del estado `isOver` en `dragover` / `dragleave`, y llamada a `onItemDrop` en `drop`.
  - Comprobar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Comprobar que el fallo se debe exclusivamente a la ausencia de los ficheros de `src/calendar-sync/` y no a errores de compilación previos.
- **Paso 3 — Implementar Mínimo:**
  - Crear `src/calendar-sync/types/drag-drop.types.ts`.
  - Crear `src/calendar-sync/components/CalendarTaskPill.tsx` y su hoja de estilos `.module.css`.
  - Crear `src/calendar-sync/components/CalendarDropZone.tsx` y su hoja de estilos `.module.css`.
  - Verificar que las suites unitarias de `calendar-sync` pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - Habilitar `draggable={true}` y `onDragStart` en `TaskCard.tsx`, `ShoppingCard.tsx` y `CleaningCard.tsx`.
  - Actualizar `MonthlyCalendarGrid.tsx` para aceptar `scheduledItems` y `onItemDrop`, renderizando `CalendarDropZone` en cada celda y proyectando las `<CalendarTaskPill />` correspondientes.
  - Actualizar `src/App.tsx` implementando `handleScheduleItem` y pasando la lista combinada de ítems programados al calendario.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar todas las pruebas unitarias y de integración (`npm test`). Comprobar que pasan al 100% en verde (mínimo 300+ tests totales).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar ausencia de drift o archivos ajenos al alcance.
- **Paso 7 — Estado Documental:**
  - Preparar los deltas exactos para `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.02.md`, `TEST_REPORT_FIA-A07.02.md`, propuesta de `LOCK-FIA-A07.02.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/calendar-sync/types/drag-drop.types.ts`
```typescript
export type ItemModule = 'tasks' | 'shopping' | 'cleaning';
export type ItemPriority = 'alta' | 'media' | 'baja';

export interface DragItemPayload {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada?: string | null;
}

export interface CalendarSchedulableItem {
  id: string;
  modulo: ItemModule;
  titulo: string;
  prioridad: ItemPriority;
  completado: boolean;
  fechaProgramada: Date | string | null;
}

export const DRAG_TRANSFER_MIME = 'application/x-centrat-item';
```

### 10.2 `src/calendar-sync/components/CalendarDropZone.tsx`
- Implementa manejadores `onDragOver`, `onDragEnter`, `onDragLeave` y `onDrop`.
- En `onDragOver`: `e.preventDefault()`, activa estado `isOver = true`, establece `e.dataTransfer.dropEffect = 'move'`.
- En `onDragLeave`: desactiva estado `isOver = false`.
- En `onDrop`: `e.preventDefault()`, `isOver = false`. Intenta leer `e.dataTransfer.getData(DRAG_TRANSFER_MIME)` (o `getData('text/plain')`). Deserializa `DragItemPayload` y si es válido invoca `onItemDrop(payload, dateString)`.
- Renderiza `<div className={`${styles.dropZone} ${isOver ? styles.dropZoneActive : ''}`} data-testid={`calendar-drop-zone-${dateString}`} data-date={dateString}>{children}</div>`.

### 10.3 `src/calendar-sync/components/CalendarTaskPill.tsx`
- Renderiza una pastilla compacta con:
  - Dot de prioridad de 7x7px (`.priorityDot`, con color según `prioridad`).
  - Badge identificador de módulo (`T`, `C`, `L`).
  - Título con clase `.pillTitle` con `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.
  - Atributos `data-testid={`calendar-pill-${id}`}`, `data-item-id={id}`, `data-modulo={modulo}`.

### 10.4 Modificaciones en Tarjetas del Hub (`TaskCard`, `ShoppingCard`, `CleaningCard`)
- Añadir prop `isDraggable?: boolean` (por defecto `true`).
- En el contenedor de la tarjeta `<article className={styles.card} draggable={isDraggable} onDragStart={handleDragStart}>`.
- `handleDragStart`:
  ```typescript
  const handleDragStart = (e: React.DragEvent) => {
    const payload: DragItemPayload = {
      id: item.id,
      modulo: 'tasks', // o 'shopping' o 'cleaning'
      titulo: item.titulo,
      prioridad: item.prioridad,
      completado: item.completado,
      fechaProgramada: item.fechaProgramada ? String(item.fechaProgramada) : null,
    };
    e.dataTransfer.setData(DRAG_TRANSFER_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };
  ```

### 10.5 Modificaciones en `MonthlyCalendarGrid.tsx`
- Añadir props:
  ```typescript
  export interface MonthlyCalendarGridProps {
    initialDate?: Date;
    scheduledItems?: CalendarSchedulableItem[];
    onMonthChange?: (year: number, month: number) => void;
    onDayClick?: (day: CalendarDay) => void;
    onItemDrop?: (item: DragItemPayload, targetDate: string) => void;
  }
  ```
- Para cada `day` de `days`, filtrar los ítems de `scheduledItems` cuya fecha coincida con `day.dateString`:
  ```typescript
  const itemsForDay = useMemo(() => {
    if (!scheduledItems) return {};
    const map: Record<string, CalendarSchedulableItem[]> = {};
    for (const item of scheduledItems) {
      if (!item.fechaProgramada) continue;
      const dateStr = item.fechaProgramada instanceof Date 
        ? formatDateToIso(item.fechaProgramada) 
        : String(item.fechaProgramada).slice(0, 10);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(item);
    }
    return map;
  }, [scheduledItems]);
  ```
- Envolver la celda o su área de contenido con `<CalendarDropZone dateString={day.dateString} onItemDrop={onItemDrop}>`, proyectando en `.cellContent`:
  ```tsx
  {dayItems.map((item) => (
    <CalendarTaskPill
      key={item.id}
      id={item.id}
      titulo={item.titulo}
      prioridad={item.prioridad}
      modulo={item.modulo}
      completado={item.completado}
    />
  ))}
  ```

### 10.6 Modificaciones en `src/App.tsx`
- Definir handler `handleScheduleItem`:
  ```typescript
  const handleScheduleItem = (draggedItem: DragItemPayload, targetDate: string) => {
    const targetDateObj = new Date(`${targetDate}T00:00:00`);
    if (draggedItem.modulo === 'tasks') {
      setAllTasks((prev) =>
        prev.map((t) => (t.id === draggedItem.id ? { ...t, fechaProgramada: targetDateObj } : t))
      );
    } else if (draggedItem.modulo === 'shopping') {
      setAllShopping((prev) =>
        prev.map((s) => (s.id === draggedItem.id ? { ...s, fechaProgramada: targetDateObj } : s))
      );
    } else if (draggedItem.modulo === 'cleaning') {
      setAllCleaning((prev) =>
        prev.map((c) => (c.id === draggedItem.id ? { ...c, fechaProgramada: targetDateObj } : c))
      );
    }
  };
  ```
- Consolidar `allScheduledItems`:
  ```typescript
  const allScheduledItems = useMemo(() => {
    return [
      ...allTasks.map((t) => ({ ...t, modulo: 'tasks' as const })),
      ...allShopping.map((s) => ({ ...s, modulo: 'shopping' as const })),
      ...allCleaning.map((c) => ({ ...c, modulo: 'cleaning' as const })),
    ].filter((i) => Boolean(i.fechaProgramada));
  }, [allTasks, allShopping, allCleaning]);
  ```
- Pasar a `MonthlyCalendarGrid`:
  ```tsx
  <MonthlyCalendarGrid
    scheduledItems={allScheduledItems}
    onItemDrop={handleScheduleItem}
  />
  ```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/calendar-sync/components/CalendarTaskPill.test.tsx`:
   - `renderiza el título del ítem correctamente`
   - `aplica la clase de dot de prioridad correspondiente (alta, media, baja)`
   - `muestra el badge del módulo (tasks -> T, shopping -> C, cleaning -> L)`
   - `dispone de atributos data-testid y data-item-id válidos`
2. `src/calendar-sync/components/CalendarDropZone.test.tsx`:
   - `renderiza los elementos hijos proporcionados`
   - `activa el estado visual isOver al recibir dragOver`
   - `desactiva isOver al disparar dragLeave`
   - `ejecuta onItemDrop con el payload deserializado y la fecha correcta al disparar drop`
   - `ignora el drop si el payload de datos no es válido o está vacío`

### 11.2 Tests de Integración / UI
1. `src/workspace/components/MonthlyCalendarGrid.test.tsx`:
   - `renderiza CalendarDropZone en las casillas del mes`
   - `proyecta las píldoras CalendarTaskPill en la casilla de la fecha programada`
   - `invoca onItemDrop al soltar un ítem sobre una casilla`
2. `src/App.test.tsx`:
   - `programa una tarea en el calendario al arrastrarla desde el Hub y soltarla en una casilla de día`

### 11.3 Tests Negativos y de Regresión
- Disparar `drop` con `dataTransfer` vacío: no produce errores de runtime ni modifica el estado.
- Disparar `drop` con JSON no correspondiente a un ítem: se descarta de forma segura.
- Verificación de que los 283 tests previos de autenticación, acordeones, modales, filtros, ordenación y navegación de calendario continúan pasando al 100%.

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
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 300+ tests totales).
- `QG-04 · Anti-Drift Scan:` Verificación de que no se tocaron archivos ajenos al alcance ni se adelantaron capacidades de VV-002, VV-003, VV-006 o VV-007.
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A07.02: Infraestructura Drag & Drop entre Hub y Calendario con zonas de soltado y materialización reactiva de píldoras por fecha"
  ],
  "active_constraints": [
    "Casillas de fecha actúan como zonas de soltado receptivas sin bloqueo de pasadas en esta unidad",
    "Píldoras de calendario con dot sutil de prioridad 7x7px, distintivo de módulo y título truncado",
    "Persistencia temporal en cliente coordinada en App.tsx mediante handleScheduleItem"
  ],
  "unlocked_next": "FIA-A07.03 · Bloqueo Fechas Pasadas y Retorno Elástico (VV-002)"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/calendar-sync/types/drag-drop.types.ts",
    "src/calendar-sync/components/CalendarDropZone.tsx",
    "src/calendar-sync/components/CalendarDropZone.module.css",
    "src/calendar-sync/components/CalendarDropZone.test.tsx",
    "src/calendar-sync/components/CalendarTaskPill.tsx",
    "src/calendar-sync/components/CalendarTaskPill.module.css",
    "src/calendar-sync/components/CalendarTaskPill.test.tsx"
  ],
  "files_modified": [
    "src/tasks/components/TaskCard.tsx",
    "src/shopping/components/ShoppingCard.tsx",
    "src/cleaning/components/CleaningCard.tsx",
    "src/workspace/components/MonthlyCalendarGrid.tsx",
    "src/workspace/components/MonthlyCalendarGrid.module.css",
    "src/workspace/components/MonthlyCalendarGrid.test.tsx",
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
    "MonthlyCalendarGrid",
    "CalendarDropZone",
    "CalendarTaskPill",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "workbench": "monthly_calendar_grid_7_columns_navigable_with_drop_zones",
    "calendar_header": "month_year_controls_previous_next_today",
    "calendar_cells": "calendar_drop_zones_active_with_task_pills"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. Todos los archivos listados en la sección 6.1 y 6.2 están implementados y verificados.
2. Ningún archivo de la sección 6.4 fue modificado.
3. Los 8 pasos del plan fueron ejecutados secuencialmente.
4. Los 5 Quality Gates pasaron limpiamente.
5. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.02.md`, `TEST_REPORT_FIA-A07.02.md` y `LOCK-FIA-A07.02.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en la unidad `FIA-A07.02`. Queda terminantemente prohibido avanzar a `FIA-A07.03` o unidades sucesivas en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Zero Scope Creep:** Prohibido implementar lógica o componentes de bloqueo de fechas pasadas (VV-002) ni modales de reasignación (VV-003). Limítate a la infraestructura Drag & Drop y la materialización de píldoras.
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A07.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
