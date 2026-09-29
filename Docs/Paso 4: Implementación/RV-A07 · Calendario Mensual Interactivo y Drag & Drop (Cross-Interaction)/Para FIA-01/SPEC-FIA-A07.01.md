# SPEC-FIA-A07.01 · REJILLA MENSUAL DINÁMICA Y NAVEGACIÓN DE MESES

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A07 (CUADRÍCULA MENSUAL, MATRIZ TEMPORAL Y NAVEGACIÓN)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A07.01 · Rejilla Mensual Dinámica y Navegación de Meses  
**PVF de Cierre:** PVF-A07.01 · Rejilla Mensual Dinámica (7 Columnas L-D) y Navegación de Meses  
**VF:** VF-A07.01 · Rejilla Mensual Dinámica y Controles Temporales  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A06.03.md APROBADO (FIA-A06.03_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar la cuadrícula del calendario mensual interactivo ([`MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx)) y su motor puro de cálculo temporal ([`calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts)) para el Agente Implementador (Antigravity CLI).

Esta unidad inaugura la Rebanada Vertical **RV-A07 (Calendario Mensual Interactivo y Drag & Drop)** y sienta los cimientos espaciales de la mesa de trabajo (`workbenchRegion`, 67% del layout de Centra-T), materializando:
1. El generador inmutable de matriz mensual de 7 columnas (Lunes a Domingo).
2. El componente visual de cuadrícula con cabecera temporal ("Mes YYYY"), controles de navegación `[<]`, `[>]` y botón de salto a `[Hoy]`.
3. El marcado semántico de casillas con diferenciación visual de días adyacentes (`.adjacentMonth`) y día actual destacado con badge cobalto.
4. El montaje directo en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) dentro del `workbenchSlot` de `WorkspaceLayout`.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. La utilidad pura `generateCalendarMatrix(year: number, month: number, today?: Date): CalendarDay[]`:
   - Genera exactamente 35 o 42 casillas (múltiplos de 7) comenzando siempre en **Lunes** y concluyendo en **Domingo**.
   - Identifica y marca `isCurrentMonth: boolean`, `isToday: boolean`, `isPast: boolean`, número de día `dayNumber` y cadena ISO `dateString: 'YYYY-MM-DD'`.
2. El componente visual `MonthlyCalendarGrid.tsx`:
   - Cabecera con título del mes en español (ej. *"Septiembre 2026"*).
   - Botones de navegación interactiva: `[<]` (mes anterior), `[>]` (mes siguiente) y `[Hoy]` (restablece a la fecha actual del sistema).
   - Fila de encabezados de semana: `L`, `M`, `X`, `J`, `V`, `S`, `D`.
   - Grid de 7 columnas renderizando cada celda con `role="gridcell"`, `data-date="YYYY-MM-DD"` y `data-testid="calendar-cell-YYYY-MM-DD"`.
3. Montaje en `App.tsx` ocupando el `workbenchSlot` de `WorkspaceLayout`.
4. 100% de los tests del proyecto en verde (mínimo 280+ tests totales en Vitest).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A06.03_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/workspace/components/WorkspaceLayout.tsx`: Contenedor principal de dos columnas (`bodyRegion`), con `hubSlot` a la izquierda y `workbenchSlot` a la derecha. Actualmente renderiza un placeholder provisional (`<div data-testid="workbench-placeholder">Workbench / Calendario</div>`).
  - Módulos de filtrado y ordenación cerrados y operativos (`src/filters/*`).
  - Tríada de acordeones en Hub homogénea y funcional (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`).
- **Estado de Tests y Compilación:**
  - 261/261 tests en verde en 32 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción: Exitoso en 1.91s.
- **Riesgos Iniciales:**
  - El primer día de la semana debe ser obligatoriamente Lunes (índice 1 en JavaScript `getDay()` adaptado a 0).
  - La rejilla debe ocupar el 100% del alto y ancho disponible en `workbenchRegion` sin causar scroll de ventana (CLS = 0).

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá `src/workspace/utils/calendarMatrix.ts` y su suite de pruebas unitarias `calendarMatrix.test.ts`.
2. Existirá `src/workspace/components/MonthlyCalendarGrid.tsx` y su hoja de estilos `MonthlyCalendarGrid.module.css`.
3. `src/App.tsx` suministrará `workbenchSlot={<MonthlyCalendarGrid />}` a `WorkspaceLayout`.
4. El usuario podrá navegar entre meses con `[<]` y `[>]` y regresar con `[Hoy]` en tiempo real.
5. El total de tests aumentará a un mínimo de 280+ tests pasando en verde.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `MonthlyCalendarGridProps`:
  ```typescript
  export interface MonthlyCalendarGridProps {
    initialDate?: Date;
    onMonthChange?: (year: number, month: number) => void;
    onDayClick?: (day: CalendarDay) => void;
  }
  ```

### 5.2 Contrato de Geometría / Interfaz
- `MonthlyCalendarGrid` se dimensiona con `height: 100%`, `display: flex`, `flex-direction: column`, fondo `--bg-hub` (`#131B26`), borde `--border-subtle` (`#233144`) y `border-radius: 14px`.
- La cuadrícula interna de casillas usa `display: grid; grid-template-columns: repeat(7, 1fr); flex: 1;`.

### 5.3 Contrato de Aislamiento
- Cero dependencias externas de librerías de calendario.
- Cero peticiones de red en esta unidad (operación puramente matemática y visual de cuadrícula).

### 5.4 Contrato de Dominio / Tipos
```typescript
export interface CalendarDay {
  date: Date;
  dateString: string; // Formato YYYY-MM-DD
  dayNumber: number;  // 1..31
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
1. `src/workspace/utils/calendarMatrix.ts`: Cálculo de matriz mensual, nombres de mes y días.
2. `src/workspace/utils/calendarMatrix.test.ts`: Pruebas unitarias matemáticas de la matriz temporal.
3. `src/workspace/components/MonthlyCalendarGrid.tsx`: Componente de cuadrícula interactiva.
4. `src/workspace/components/MonthlyCalendarGrid.module.css`: Estilos visuales de cabecera y casillas.
5. `src/workspace/components/MonthlyCalendarGrid.test.tsx`: Pruebas de integración RTL de navegación y renderizado.

### 6.2 Modificar (Archivos existentes del repo a alterar)
1. `src/App.tsx`: Reemplazar el placeholder de `workbenchSlot` por `<MonthlyCalendarGrid />`.
2. `src/App.test.tsx`: Añadir aserción verificando que `MonthlyCalendarGrid` se renderiza dentro del workspace en la vista principal autenticada.

### 6.3 Preservar
- Todos los componentes y hooks de filtros (`src/filters/*`).
- Acordeones del Hub y menús contextuales (`src/tasks/*`, `src/shopping/*`, `src/cleaning/*`).
- `WorkspaceLayout.tsx` y `TopNavbar.tsx`.

### 6.4 Prohibido Tocar
- Servidores backend, endpoints REST y esquemas de BD.
- Infraestructura de `dnd-kit` (reservada para `FIA-A07.02`).
- Carpetas cajón de sastre globales.

---

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `SUITE_ARQUITECTURA_UI.docx` (Doc 06), `Centra-T Pseudocódigo (unificado).odt` (Módulo 2.1 y 2.2), `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.01), `FIA-A06.03_AS_BUILT.md`.
- **Tecnológicas:** React 18/19, TypeScript 5.x estricto, CSS Modules consumiendo `src/theme/tokens.css`, Vitest 3.2.7 y `@testing-library/react`.
- **Dependencia Secuencial:** Requiere `LOCK-FIA-A06.03.md`. Desbloquea `FIA-A07.02`.

---

## 8. Restricciones
- La semana debe comenzar incondicionalmente en **Lunes** y terminar en **Domingo**.
- Las casillas de días adyacentes (`adjacentMonth`) deben tener menor opacidad (ej. `opacity: 0.35` o texto atenuado) pero conservar su número de día legible.
- Las casillas deben incluir el atributo `data-date="YYYY-MM-DD"`.
- Prohibido el uso de librerías de terceros (Moment.js, date-fns externa, etc.). Utilizar APIs nativas de `Date` de JavaScript.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests (RED):**
  - Crear `src/workspace/utils/calendarMatrix.test.ts` con pruebas para cálculo de días, semanas de 5 y 6 filas, alineación de Lunes y detección de `isToday`.
  - Crear `src/workspace/components/MonthlyCalendarGrid.test.tsx` con pruebas de renderizado de cabecera, 7 columnas L-D, navegación con `[<]` y `[>]`, y botón `[Hoy]`.
- **Paso 2 — Validar Fallo Inicial:**
  - Ejecutar `npx vitest run src/workspace` y verificar que las nuevas pruebas fallan en rojo (`RED`).
- **Paso 3 — Implementar Mínimo (GREEN):**
  - Implementar `src/workspace/utils/calendarMatrix.ts`.
  - Implementar `src/workspace/components/MonthlyCalendarGrid.tsx` y `MonthlyCalendarGrid.module.css`.
  - Reejecutar pruebas de `src/workspace` hasta alcanzar 100% en verde.
- **Paso 4 — Integrar en App:**
  - Modificar `src/App.tsx` pasando `workbenchSlot={<MonthlyCalendarGrid />}` a `WorkspaceLayout`.
  - Añadir aserción en `src/App.test.tsx` verificando la presencia del calendario.
- **Paso 5 — Ejecutar Tests Completos:**
  - Ejecutar `npm run test` verificando que todas las suites pasen al 100% (mínimo 280+ tests en verde).
- **Paso 6 — Ejecutar Quality Gates:**
  - `npm run typecheck` (`tsc --noEmit`).
  - `npm run build` certificando empaquetado de producción limpio.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A07.01.md` y `TEST_REPORT_FIA-A07.01.md`.
  - Proponer `LOCK-FIA-A07.01.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 Utilidad de Matriz Temporal (`src/workspace/utils/calendarMatrix.ts`)
```typescript
export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getMonthName(monthIndex: number): string {
  return SPANISH_MONTHS[monthIndex] || '';
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateCalendarMatrix(year: number, month: number, referenceToday?: Date): CalendarDay[] {
  const today = referenceToday || new Date();
  const todayIso = formatDateToIso(today);

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  // getDay(): 0 = Domingo, 1 = Lunes ... 6 = Sábado
  // Ajuste a Lunes = 0 .. Domingo = 6
  let dayOfWeek = firstDay.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;

  // Días totales en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Días en el mes anterior
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // 1. Días adyacentes del mes anterior
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, prevDayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  // 2. Días del mes en curso
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  // 3. Días adyacentes del mes siguiente (para completar múltiplo de 7: 35 o 42)
  const totalSlots = days.length > 35 ? 42 : 35;
  const remainingSlots = totalSlots - days.length;
  for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  return days;
}
```

### 10.2 Componente Visual (`src/workspace/components/MonthlyCalendarGrid.tsx`)
- Renderiza la cabecera con el título formateado: `{getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}`.
- Botones de navegación:
  - `[<]` con `aria-label="Mes anterior"`
  - `[Hoy]` con `aria-label="Ir al mes actual"`
  - `[>]` con `aria-label="Mes siguiente"`
- Encabezados de días: `['L', 'M', 'X', 'J', 'V', 'S', 'D']` con `aria-hidden="true"`.
- Grid de 7 columnas renderizando cada casilla:
  ```tsx
  <div
    key={day.dateString}
    role="gridcell"
    data-date={day.dateString}
    data-testid={`calendar-cell-${day.dateString}`}
    className={`${styles.cell} ${!day.isCurrentMonth ? styles.adjacentMonth : ''} ${day.isToday ? styles.todayCell : ''}`}
    onClick={() => onDayClick?.(day)}
  >
    <div className={styles.cellHeader}>
      <span className={`${styles.dayNumber} ${day.isToday ? styles.todayBadge : ''}`}>
        {day.dayNumber}
      </span>
    </div>
    <div className={styles.cellContent} />
  </div>
  ```

### 10.3 Montaje en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx)
```tsx
import { MonthlyCalendarGrid } from './workspace/components/MonthlyCalendarGrid';

// En el return de WorkspaceLayout:
<WorkspaceLayout
  navbarSlot={<TopNavbar ... />}
  hubSlot={<HubContainer ...> ... </HubContainer>}
  workbenchSlot={<MonthlyCalendarGrid />}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios de Matriz (`calendarMatrix.test.ts`)
- `debería alinear el primer día en Lunes con los días adyacentes correspondientes`.
- `debería generar 35 casillas para meses estándar de 5 semanas`.
- `debería generar 42 casillas para meses que abarcan 6 semanas`.
- `debería marcar correctamente isToday cuando coincide con la fecha de referencia`.
- `debería formatear correctamente la cadena ISO YYYY-MM-DD`.

### 11.2 Tests de Componente (`MonthlyCalendarGrid.test.tsx`)
- `debería renderizar los 7 encabezados de la semana (L a D)`.
- `debería desplegar el mes y año en español en la cabecera`.
- `debería avanzar al mes siguiente al hacer clic en [>]`.
- `debería retroceder al mes anterior al hacer clic en [<]`.
- `debería regresar al mes actual al hacer clic en [Hoy] tras navegar`.
- `debería renderizar casillas con data-date e identificar días adyacentes`.

### 11.3 Tests en App (`App.test.tsx`)
- `debería renderizar MonthlyCalendarGrid en el workbench al estar autenticado`.

### 11.4 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `tsc --noEmit` con 0 errores.
- `QG-02 · Compilación de Producción:` `vite build` limpio.
- `QG-03 · Test Suite:` 100% de tests en verde en Vitest (mínimo 280+ tests pasando).
- `QG-04 · Anti-Scope Creep:` Cero código de Drag & Drop en esta unidad.
- `QG-05 · Verificación Funcional UI (PVF-A07.01):` Cuadrícula mensual navegable y observable en el workbench.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)",
  "completed_fias": [
    "FIA-A01.01", "FIA-A01.02", "FIA-A01.03",
    "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05",
    "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05",
    "FIA-A04.01", "FIA-A04.02", "FIA-A04.03",
    "FIA-A05.01", "FIA-A05.02", "FIA-A05.03",
    "FIA-A06.01", "FIA-A06.02", "FIA-A06.03",
    "FIA-A07.01"
  ],
  "latest_locked_fia": "FIA-A07.01",
  "architectural_decisions_applied": [
    "Cuadrícula mensual de 7 columnas fija comenzando en Lunes con cálculo dinámico de 35 o 42 casillas",
    "Tratamiento visual de casillas: días adyacentes atenuados y badge cobalto para el día actual",
    "Controles de navegación temporal [<], [>] y botón [Hoy] con recálculo determinista en memoria",
    "Montaje en workbenchSlot de WorkspaceLayout en App.tsx reemplazando el placeholder"
  ],
  "unlocked_next": "FIA-A07.02 · Infraestructura Drag & Drop y Asignación de Ítem"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/workspace/utils/calendarMatrix.ts",
    "src/workspace/utils/calendarMatrix.test.ts",
    "src/workspace/components/MonthlyCalendarGrid.tsx",
    "src/workspace/components/MonthlyCalendarGrid.module.css",
    "src/workspace/components/MonthlyCalendarGrid.test.tsx"
  ],
  "files_modified": [
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
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "workbench": "monthly_calendar_grid_7_columns_navigable",
    "calendar_header": "month_year_controls_previous_next_today"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `calendarMatrix.ts`, `MonthlyCalendarGrid.tsx` y sus estilos están implementados.
2. `MonthlyCalendarGrid` está montado en `App.tsx` en `workbenchSlot`.
3. La navegación entre meses y el botón `[Hoy]` funcionan en la UI sin parpadeos.
4. Los tests unitarios y de integración superan el 100% de éxito (280+ tests en verde).
5. Los 5 Quality Gates pasaron limpiamente.
6. Se generaron `IMPLEMENTATION_REPORT_FIA-A07.01.md` y `TEST_REPORT_FIA-A07.01.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A07.01`.
- **Primer Día Lunes Obligatorio:** La semana debe comenzar estrictamente en Lunes.
- **Montaje Real en App.tsx:** Sustituye el placeholder en `workbenchSlot` de `App.tsx` por `<MonthlyCalendarGrid />`.
- **TDD Estricto:** Ejecuta las pruebas en rojo (`RED`) antes de codificar el componente.
- **Parada Obligatoria:** Tras superar los Quality Gates, generar los reportes y proponer `LOCK-FIA-A07.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
