# SPEC-FIA-A07.06 · DESASIGNACIÓN POR CLIC DERECHO Y RETORNO AL HUB (VV-007)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** SEXTA Y ÚLTIMA UNIDAD DE RV-A07 (CIERRE TOTAL Y DEFINITIVO DE LA REBANADA VERTICAL RV-A07)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.06 · Desasignación por Clic Derecho y Retorno al Hub (VV-007)  
**PVF de Cierre:** PVF-A07.06 · Desasignación Rápida de Fecha y Retorno al Hub (VV-007)  
**VF:** VF-A07.06 · Desasignación de Fecha y Retorno al Hub (VV-007)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.05.md APROBADO (FIA-A07.05_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el menú contextual accesible para las pastillas del calendario y el mecanismo de desasignación temporal no destructiva hacia el Hub, cerrando formal y definitivamente la Rebanada Vertical **RV-A07** y satisfaciendo de forma demostrable la auditoría forense **VV-007** en [`src/calendar-sync/components/CalendarItemContextMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.tsx), [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx) y [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).

Esta sexta y última unidad de la Rebanada Vertical **RV-A07** cubre:
1. La captura e intercepción del evento de clic derecho (`onContextMenu`) en cada pastilla del calendario ([`CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx)), suprimiendo el menú nativo del navegador mediante `preventDefault()` y `stopPropagation()`.
2. La creación del componente de menú contextual accesible flotante [`CalendarItemContextMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.tsx) y su hoja de estilos [`CalendarItemContextMenu.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.module.css), posicionado en coordenadas `fixed` `(x, y)` (`z-index: 1050`), con WAI-ARIA (`role="menu"`, `role="menuitem"`), soporte de teclado y descarte automático al pulsar `Escape` o hacer clic fuera del menú.
3. La acción canónica de desasignación: opción destacada `"Mover a Sin Asignar"` (con icono de desvinculación temporal).
4. El flujo de desasignación temporal no destructiva en `src/App.tsx` (`handleUnscheduleItem`), el cual establece `fechaProgramada: null` sobre el ítem correspondiente (`tasks`, `shopping` o `cleaning`).
5. La retirada reactiva inmediata de la pastilla de la casilla del calendario y su persistencia intacta en el Hub lateral (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`) como ítem pendiente sin fecha asignada.
6. La validación forense automatizada completa del caso **`[VV-007]`** en `src/App.test.tsx`.
7. El sellado total y consolidado de la Rebanada Vertical `RV-A07`, preparando el paso a `RV-A08`.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Intercepción de Clic Derecho en Pastillas (`CalendarTaskPill.tsx`):**
   - Prop opcional `onContextMenu?: (e: React.MouseEvent, item: { id: string; modulo: ItemModule; titulo: string }) => void`.
   - Manejador de evento `onContextMenu` que intercepta el menú nativo del navegador y emite los datos del ítem junto a la posición del cursor.
2. **Componente de Menú Contextual Accesible (`CalendarItemContextMenu.tsx`):**
   - Diálogo contextual posicionado con `fixed` en `top: position.y, left: position.x`.
   - Atributos semánticos: `role="menu"`, items con `role="menuitem"`, foco inicial accesible.
   - Opción: `"Mover a Sin Asignar"`.
   - Cierre inmediato al presionar la tecla `Escape` o al hacer clic sobre el overlay/backdrop o fuera del menú.
3. **Propagación en `MonthlyCalendarGrid.tsx`:**
   - Prop `onItemContextMenu?: (e: React.MouseEvent, item: { id: string; modulo: ItemModule; titulo: string }) => void`.
   - Conexión del callback hacia cada pastilla renderizada en las celdas del mes.
4. **Orquestación Central en `src/App.tsx`:**
   - Estado `contextMenuState: { position: { x: number; y: number }; item: { id: string; modulo: ItemModule; titulo: string } } | null`.
   - Manejador `handleUnscheduleItem(itemId: string, modulo: ItemModule)`:
     - Localiza el ítem en la colección de su módulo y fija `fechaProgramada: null`.
     - Cierra el menú contextual.
     - **MANDATO NO DESTRUCTIVO:** Cero borrado de registros de la base de datos o estado; el ítem continúa existiendo y pasa a mostrarse en su acordeón del Hub.
5. **Calidad y Cobertura (DoD):**
   - 100% de tests en verde (mínimo 345+ tests totales en 39 suites, sin regresiones).
   - Superación demostrable del caso de prueba forense QA **`[VV-007]`**.

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.05_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/calendar-sync/components/CalendarTaskPill.tsx`: Cuenta con `onClick`, `onDragStart`, `data-testid="calendar-pill-${id}"`, pero carece del manejador `onContextMenu`.
  - `src/workspace/components/MonthlyCalendarGrid.tsx`: Renderiza las pastillas de cada día pero no expone `onItemContextMenu`.
  - `src/App.tsx`: Orquesta el Drag & Drop hacia las celdas del calendario, la modal de reasignación (`ReassignmentConfirmModal`) y la asignación masiva de compras (`BulkShoppingConfirmModal`), pero no cuenta con mecanismo de desprogramación rápida desde el calendario.
- **Estado de Tests y Compilación:**
  - 332/332 tests en verde en 38 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.12s limpio.
- **Riesgos Iniciales:**
  - El clic derecho no debe desencadenar la acción de clic regular de la pastilla (`onClick`).
  - La desasignación no debe eliminar el ítem del array de tareas/compras/limpiezas bajo ninguna circunstancia.
  - El menú debe reposicionarse o cerrarse adecuadamente sin causar desbordamientos horizontales o problemas de z-index.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `src/calendar-sync/components/CalendarItemContextMenu.tsx`, su CSS modular y su suite de tests `CalendarItemContextMenu.test.tsx`.
2. `CalendarTaskPill.tsx` interceptará `onContextMenu` y emitirá el evento con los metadatos del ítem.
3. `MonthlyCalendarGrid.tsx` propagará el evento a través de `onItemContextMenu`.
4. `src/App.tsx` gestionará el estado del menú contextual y ejecutará la desasignación no destructiva mediante `handleUnscheduleItem`.
5. Al pulsar `"Mover a Sin Asignar"`, la pastilla desaparecerá inmediatamente del calendario y el ítem se mantendrá visible en el acordeón del Hub correspondiente sin fecha asignada.
6. El caso forense **`[VV-007]`** estará validado y pasando en `src/App.test.tsx`.
7. El repositorio alcanzará un mínimo de 345+ tests en verde en 39 suites.
8. La Rebanada Vertical **RV-A07** quedará formalmente completada y cerrada.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
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

### 5.2 Contrato de Geometría / Interfaz
- `CalendarItemContextMenu`:
  - Contenedor flotante con `position: fixed`, coordenadas dinámicas `top: position.y, left: position.x` y `z-index: 1050`.
  - Fondo `--bg-card` (`#1A2433`), borde de 1px sólido en `--border-subtle` (`#233144`), bordes redondeados (`border-radius: 8px`), padding interno de 6px y sombra `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45)`.
  - Opción `"Mover a Sin Asignar"` con `role="menuitem"`, tipografía `--font-sans`, tamaño 13px, padding 8px 12px, icono sutil o emoji indicador (`↩` / `📅❌`), hover con fondo `--bg-surface` (`#131B26`).
  - Overlay invisible/backdrop transparente (`z-index: 1049`) para interceptar clics externos y cerrar el menú de inmediato.

### 5.3 Contrato de Aislamiento
- La operación `unschedule` es exclusivamente una mutación del atributo de fecha (`fechaProgramada: null`). No modifica el título, completado, prioridad, categoría ni ningún otro metadato del ítem.
- Prohibida la invocación de `setAllTasks(prev => prev.filter(...))` o cualquier función de eliminación física.

### 5.4 Contrato de Dominio / Datos
```typescript
// Mutación en App.tsx al ejecutar unschedule:
item.fechaProgramada = null;
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/calendar-sync/components/CalendarItemContextMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.tsx): Menú contextual accesible flotante para pastillas del calendario.
- [`src/calendar-sync/components/CalendarItemContextMenu.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.module.css): Estilos visuales del menú contextual y backdrop.
- [`src/calendar-sync/components/CalendarItemContextMenu.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.test.tsx): Suite de pruebas unitarias y de accesibilidad del menú.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx): Incorporar prop y manejador `onContextMenu`.
- [`src/calendar-sync/components/CalendarTaskPill.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.test.tsx): Añadir pruebas unitarias verificando la captura del evento `onContextMenu`.
- [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx): Incorporar prop `onItemContextMenu` y pasarla a las instancias de `CalendarTaskPill`.
- [`src/workspace/components/MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx): Verificar propagación de `onItemContextMenu`.
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Orquestar estado `contextMenuState`, manejador `handleUnscheduleItem` y renderizado de `CalendarItemContextMenu`.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Añadir suite de integración forense certificando el caso **`[VV-007]`**.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx): Celda droppable intacta.
- [`src/calendar-sync/components/ReassignmentConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/ReassignmentConfirmModal.tsx): Modal de conflicto preservada.
- [`src/calendar-sync/components/BulkShoppingConfirmModal.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/BulkShoppingConfirmModal.tsx): Modal masivo de compras intacto.
- [`src/hub/components/*`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components): Acordeones de Tareas, Compra y Limpieza inalterados.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/authentication/*`: Dominio de autenticación.
- `src/users/*`: Dominio de usuarios.
- Capacidades de la siguiente rebanada `RV-A08`.

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Subsistema `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Desasignación sin Eliminación; Doc 08: Estilos Visuales; Doc 10: Validación Forense QA - Caso VV-007).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Desasignar_Fecha_Desde_Calendario`).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.06).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.06 y VF-A07.06).
  - `FIA-A07.05_AS_BUILT.md` (Cierre formal de FIA-A07.05).
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A07.05` (Sellado y consolidado con 332 tests en verde).
  - Su cierre formal mediante `LOCK-FIA-A07.06.md` concluye toda la rebanada vertical `RV-A07` y habilita la apertura de `RV-A08`.

---

## 8. Restricciones
- **Mandato No Destructivo:** Estrictamente prohibido eliminar ítems de la base de datos o memoria al desasignar. La única mutación autorizada es `fechaProgramada: null`.
- Prohibido el uso de librerías externas para menús contextuales o popovers.
- Prohibido usar carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).
- El menú contextual debe descartarse limpiamente al pulsar la tecla `Escape` o al hacer clic fuera del menú sin provocar efectos secundarios.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/calendar-sync/components/CalendarItemContextMenu.test.tsx` con pruebas unitarias en rojo:
    1. Renderizado en el DOM cuando `isOpen === true` en coordenadas `position.x` y `position.y`.
    2. No renderizado cuando `isOpen === false`.
    3. Presencia de la opción `"Mover a Sin Asignar"` con `role="menuitem"`.
    4. Invocación de `onUnschedule(itemId, modulo)` al pulsar `"Mover a Sin Asignar"`.
    5. Invocación de `onClose` al pulsar la tecla `Escape`.
    6. Invocación de `onClose` al hacer clic sobre el backdrop / fuera del menú.
  - Añadir en `src/calendar-sync/components/CalendarTaskPill.test.tsx` test verificando que el evento `contextmenu` (clic derecho) llama al prop `onContextMenu` con `preventDefault()`.
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Verificar que el fallo en rojo se debe exclusivamente a la inexistencia de `CalendarItemContextMenu` y a la ausencia de `onContextMenu` en `CalendarTaskPill`.
- **Paso 3 — Implementar Mínimo:**
  - Crear `src/calendar-sync/components/CalendarItemContextMenu.tsx` y su módulo CSS.
  - Modificar `src/calendar-sync/components/CalendarTaskPill.tsx` para aceptar `onContextMenu` e implementarlo en el elemento raíz.
  - Modificar `src/workspace/components/MonthlyCalendarGrid.tsx` para aceptar `onItemContextMenu` y propagarlo a cada `CalendarTaskPill`.
  - Comprobar que las suites de prueba unitarias de componente pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - En `src/App.tsx`, incorporar estado `contextMenuState` y los manejadores `handleItemContextMenu` y `handleUnscheduleItem`.
  - Renderizar `<CalendarItemContextMenu />` condicionado por `contextMenuState`.
  - Añadir en `src/App.test.tsx` la suite de integración forense para el caso **`[VV-007]`**:
    1. Renderizar la aplicación con un ítem programado en el calendario.
    2. Simular clic derecho sobre la pastilla en el calendario (`fireEvent.contextMenu`).
    3. Verificar que aparece el menú contextual con `"Mover a Sin Asignar"`.
    4. Simular clic en `"Mover a Sin Asignar"`.
    5. Comprobar que la pastilla desaparece de la celda del calendario.
    6. Comprobar que el ítem reaparece y permanece íntegro en su acordeón del Hub.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 345+ tests en 39 suites).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar que no hubo regresiones ni drift de archivos fuera del alcance.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`, marcando RV-A07 como concluida.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.06.md`, `TEST_REPORT_FIA-A07.06.md`, propuesta de `LOCK-FIA-A07.06.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/calendar-sync/components/CalendarItemContextMenu.tsx`
```typescript
import React, { useEffect } from 'react';
import styles from './CalendarItemContextMenu.module.css';
import { ItemModule } from '../types/drag-drop.types';

export interface CalendarItemContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  itemId: string;
  modulo: ItemModule;
  itemTitle: string;
  onUnschedule: (itemId: string, modulo: ItemModule) => void;
  onClose: () => void;
}

export const CalendarItemContextMenu: React.FC<CalendarItemContextMenuProps> = ({
  isOpen,
  position,
  itemId,
  modulo,
  itemTitle,
  onUnschedule,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        data-testid="context-menu-backdrop"
      />
      <div
        className={styles.menuContainer}
        role="menu"
        aria-label={`Opciones de ${itemTitle}`}
        data-testid="calendar-item-context-menu"
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          data-testid="context-menu-unschedule-btn"
          onClick={() => onUnschedule(itemId, modulo)}
        >
          <span className={styles.icon} aria-hidden="true">
            ↩
          </span>
          <span className={styles.label}>Mover a Sin Asignar</span>
        </button>
      </div>
    </>
  );
};
```

### 10.2 `src/calendar-sync/components/CalendarItemContextMenu.module.css`
```css
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1049;
  background: transparent;
}

.menuContainer {
  position: fixed;
  z-index: 1050;
  min-width: 180px;
  background-color: var(--bg-card, #1a2433);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: var(--radius-md, 8px);
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  animation: fadeIn 0.12s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 6px);
  color: var(--text-primary, #ffffff);
  font-family: var(--font-sans, inherit);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menuItem:hover,
.menuItem:focus-visible {
  background-color: var(--bg-surface, #131b26);
  outline: none;
}

.icon {
  font-size: 14px;
  color: var(--accent-amber, #f59e0b);
}

.label {
  flex: 1;
  font-weight: 500;
}
```

### 10.3 `src/calendar-sync/components/CalendarTaskPill.tsx`
Añadir prop `onContextMenu`:
```typescript
export interface CalendarTaskPillProps {
  id: string;
  titulo: string;
  prioridad: ItemPriority;
  modulo: ItemModule;
  completado?: boolean;
  fechaProgramada?: string | Date | null;
  isDraggable?: boolean;
  isBulk?: boolean;
  onClick?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, item: { id: string; modulo: ItemModule; titulo: string }) => void;
}
```
En el manejador del componente:
```typescript
const handleContextMenu = (e: React.MouseEvent) => {
  if (onContextMenu) {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, { id, modulo, titulo });
  }
};
```
En el JSX del contenedor:
```tsx
onContextMenu={handleContextMenu}
```

### 10.4 `src/workspace/components/MonthlyCalendarGrid.tsx`
Añadir prop `onItemContextMenu`:
```typescript
export interface MonthlyCalendarGridProps {
  initialDate?: Date;
  scheduledItems?: CalendarSchedulableItem[];
  onMonthChange?: (year: number, month: number) => void;
  onDayClick?: (day: CalendarDay) => void;
  onItemDrop?: (item: SchedulableDragPayload, targetDate: string) => void;
  onItemContextMenu?: (e: React.MouseEvent, item: { id: string; modulo: ItemModule; titulo: string }) => void;
}
```
Pasar `onContextMenu` a `CalendarTaskPill`:
```tsx
<CalendarTaskPill
  key={item.id}
  id={item.id}
  titulo={item.titulo}
  prioridad={item.prioridad}
  modulo={item.modulo}
  completado={item.completado}
  fechaProgramada={item.fechaProgramada}
  onContextMenu={onItemContextMenu}
/>
```

### 10.5 `src/App.tsx`
Incorporar estado de menú contextual y lógica no destructiva:
```typescript
const [contextMenuState, setContextMenuState] = useState<{
  position: { x: number; y: number };
  item: { id: string; modulo: ItemModule; titulo: string };
} | null>(null);

const handleItemContextMenu = (
  e: React.MouseEvent,
  item: { id: string; modulo: ItemModule; titulo: string }
) => {
  e.preventDefault();
  setContextMenuState({
    position: { x: e.clientX, y: e.clientY },
    item,
  });
};

const handleUnscheduleItem = (itemId: string, modulo: ItemModule) => {
  if (modulo === 'tasks') {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === itemId ? { ...t, fechaProgramada: null } : t))
    );
  } else if (modulo === 'shopping') {
    setAllShopping((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, fechaProgramada: null } : s))
    );
  } else if (modulo === 'cleaning') {
    setAllCleaning((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, fechaProgramada: null } : c))
    );
  }
  setContextMenuState(null);
};
```
Pasar a `MonthlyCalendarGrid`:
```tsx
<MonthlyCalendarGrid
  scheduledItems={allScheduledItems}
  onItemDrop={handleScheduleItem}
  onItemContextMenu={handleItemContextMenu}
/>
```
Renderizar el componente `CalendarItemContextMenu`:
```tsx
<CalendarItemContextMenu
  isOpen={Boolean(contextMenuState)}
  position={contextMenuState?.position || { x: 0, y: 0 }}
  itemId={contextMenuState?.item.id || ''}
  modulo={contextMenuState?.item.modulo || 'tasks'}
  itemTitle={contextMenuState?.item.titulo || ''}
  onUnschedule={handleUnscheduleItem}
  onClose={() => setContextMenuState(null)}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/calendar-sync/components/CalendarItemContextMenu.test.tsx`:
   - `renderiza el menú en coordenadas fixed cuando isOpen es true`
   - `no renderiza nada en el DOM cuando isOpen es false`
   - `muestra la opción "Mover a Sin Asignar" con rol menuitem`
   - `invoca onUnschedule con id y modulo al pulsar la opción`
   - `invoca onClose al presionar la tecla Escape`
   - `invoca onClose al hacer clic sobre el backdrop`
2. `src/calendar-sync/components/CalendarTaskPill.test.tsx`:
   - `dispara onContextMenu suprimiendo el menú nativo (preventDefault) con los datos del ítem`
3. `src/workspace/components/MonthlyCalendarGrid.test.tsx`:
   - `propaga onItemContextMenu a CalendarTaskPill al recibir clic derecho`

### 11.2 Tests de Integración / UI
1. `src/App.test.tsx`:
   - `[VV-007]: Clic derecho en una pastilla del calendario abre el menú contextual en la posición del cursor`
   - `[VV-007]: Presionar Escape o hacer clic fuera cierra el menú sin desasignar la pastilla`
   - `[VV-007]: Seleccionar "Mover a Sin Asignar" retira la pastilla del calendario y mantiene el ítem intacto en el Hub sin fecha`

### 11.3 Tests Negativos y de Regresión
- Verificar que la desasignación no reduce el conteo total de ítems (`processedTasks.length`, etc.).
- Asegurar que no se producen errores de renderizado si las coordenadas del ratón son `(0, 0)`.
- Preservar al 100% las 38 suites previas (332 tests existentes sin regresión).

### 11.4 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores y sin tipos `any`.
- `QG-02 · Linting:` `npm run lint` superado sin advertencias ni errores.
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 345+ tests totales en 39 suites).
- `QG-04 · Anti-Drift Scan:` Verificación de ausencia de código fuera de alcance (no tocar `users`, `auth` ni anticipar `RV-A08`).
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "capabilities_completed": [
    "FIA-A07.01: Matriz de calendario mensual con cuadrícula de 7 columnas y soporte de días adyacentes",
    "FIA-A07.02: Receptores de celda con bloqueo estricto de fechas pasadas (Decisión 1A / VV-002)",
    "FIA-A07.03: Píldoras de tarea en el calendario con drag bidireccional y navegación de meses",
    "FIA-A07.04: Detección de conflicto al reasignar fechas y modal de confirmación (Decisión 4B / VV-003)",
    "FIA-A07.05: Arrastre masivo de Compra Semanal al calendario (Caso Forense VV-006) con asa maestro y diálogo de confirmación en bloque",
    "FIA-A07.06: Desasignación por clic derecho con menú contextual accesible (Caso Forense VV-007) y retorno no destructivo al Hub"
  ],
  "active_constraints": [
    "Intercepción obligatoria de clic derecho en pastillas mediante onContextMenu",
    "Descarte inmediato del menú contextual con Escape o clic exterior",
    "Desasignación estrictamente no destructiva: fechaProgramada = null sin borrar ítems de la base de datos"
  ],
  "rv_status": {
    "RV-A07": "COMPLETED_AND_LOCKED"
  },
  "unlocked_next": "RV-A08 · Próxima Rebanada Vertical según CENTRA-T_INDICE_RV_FIA.docx"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/calendar-sync/components/CalendarItemContextMenu.tsx",
    "src/calendar-sync/components/CalendarItemContextMenu.module.css",
    "src/calendar-sync/components/CalendarItemContextMenu.test.tsx"
  ],
  "files_modified": [
    "src/calendar-sync/components/CalendarTaskPill.tsx",
    "src/calendar-sync/components/CalendarTaskPill.test.tsx",
    "src/workspace/components/MonthlyCalendarGrid.tsx",
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
    "TaskCard",
    "ShoppingCard",
    "CleaningCard",
    "MonthlyCalendarGrid",
    "CalendarDropZone",
    "CalendarTaskPill",
    "CalendarItemContextMenu",
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
    "bulk_shopping_modal": "dialog_modal_bulk_schedule_confirmation",
    "calendar_context_menu": "accessible_context_menu_with_unschedule_option"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `CalendarItemContextMenu.tsx` está implementado, estilizado y probado unitariamente.
2. `CalendarTaskPill.tsx` intercepta `onContextMenu` y propaga los metadatos del ítem.
3. `MonthlyCalendarGrid.tsx` enlaza `onItemContextMenu` con cada pastilla del mes.
4. `App.tsx` procesa la desasignación rápida (`fechaProgramada: null`) sin eliminar el ítem de la colección.
5. Se supera de forma demostrable la auditoría del caso forense `VV-007`.
6. Los 8 pasos del plan fueron ejecutados secuencialmente.
7. Los 5 Quality Gates pasaron limpiamente sin errores ni tipos `any`.
8. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.06.md`, `TEST_REPORT_FIA-A07.06.md` y `LOCK-FIA-A07.06.md` (certificando el cierre de la rebanada vertical `RV-A07`).

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Cierre de Rebanada:** Esta unidad `FIA-A07.06` es la última de `RV-A07`. Concluye la rebanada con la máxima rigurosidad y genera el `LOCK-FIA-A07.06.md` acreditando el cierre total.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Mandato No Destructivo Obligatorio:** Bajo ninguna circunstancia uses operaciones de borrado (`filter`, `splice`, `delete`). La desasignación debe ser únicamente `fechaProgramada: null`.
- **Zero Scope Creep:** Prohibido tocar código de autenticación, usuarios o iniciar componentes de `RV-A08`.
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A07.06.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
