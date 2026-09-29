# CENTRA-T · FIA-A07.01 · REJILLA MENSUAL DINÁMICA Y NAVEGACIÓN DE MESES (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A07.01.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.01`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Rejilla Mensual Dinámica y Navegación de Meses`
- **PVF de Cierre Cubierta:** `PVF-A07.01 · Rejilla Mensual Dinámica y Resaltado del Día Actual`
- **VF Interna de Derivación:** `VF-A07.01 · Renderizado y Navegación de la Rejilla Calendario`
- **Objetivo Indexado:** `Construir cuadrícula mensual de 7 columnas (Lunes-Domingo), cálculo dinámico de casillas (35/42 días), días adyacentes atenuados y badge hoy cobalto.`
- **Validación Final:** [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx), [`src/workspace/utils/calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts) y [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx)
- **Evidencia de Cierre:** 283/283 tests globales pasando en 34 suites en Vitest 3.0.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 1.97s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A06.03.md APROBADO (FIA-A06.03_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 1 de RV-A07 y constituye la base inmutable para FIA-A07.02.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.01: Rejilla Mensual Dinámica y Navegación de Meses).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.01 y VF-A07.01).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 01: Identificación y Ficha Técnica; Doc 05: Module Map - Espacio de Trabajo Frontend).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 06: Topología de Pantalla, división 33% Hub / 67% Workbench; Doc 08: Guía de Estilos Visuales).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 2.1: Inicialización del Calendario; Módulo 2.2: Navegación de Meses).
  - `SPEC-FIA-A07.01.md` (Especificación ejecutable previa cumplida al 100%).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `RV-A06` con 261 tests en verde.
- **Métricas de Compilación y Calidad Registradas:**
  - Vitest 3.0.7: 283/283 tests en verde (100% pasando en 34 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 1.97s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a RV-A01, RV-A02, RV-A03, RV-A04, RV-A05 y RV-A06.

### 4. Objetivo Implementado
Se ha diseñado, materializado y verificado de extremo a extremo la cuadrícula del calendario mensual y su motor temporal puro, sustituyendo definitivamente el placeholder provisional en el área de trabajo (`workbenchSlot`) de la aplicación:
1. **Motor Inmutable de Matriz Temporal (`calendarMatrix.ts`):**
   - Función [`generateCalendarMatrix`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts): genera exactamente 35 o 42 casillas (múltiplos estrictos de 7) comenzando innegociablemente en **Lunes** y concluyendo en **Domingo**.
   - Detección precisa de días del mes anterior y posterior (`isCurrentMonth: false`), día actual (`isToday: boolean`), días pasados (`isPast: boolean`), número de día (`dayNumber: 1..31`) y cadena ISO estándar (`dateString: 'YYYY-MM-DD'`).
   - Funciones auxiliares puras: [`getMonthName`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts) (nombres en español Enero..Diciembre) y [`formatDateToIso`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts).
2. **Componente Visual de Calendario (`MonthlyCalendarGrid.tsx`):**
   - Cabecera con título `{Mes} {YYYY}` y grupo de navegación interactiva: botón `[<]` (mes anterior), botón `[Hoy]` (restablece al mes actual del sistema) y botón `[>]` (mes siguiente).
   - Fila de encabezados de semana de 7 columnas (`L`, `M`, `X`, `J`, `V`, `S`, `D`) con `role="columnheader"`.
   - Cuadrícula de 7 columnas renderizando cada celda con `role="gridcell"`, `tabIndex={0}`, `data-date="YYYY-MM-DD"` y `data-testid="calendar-cell-YYYY-MM-DD"`.
   - Estilizado semántico y accesible: días adyacentes atenuados (`.adjacentMonth`), día actual destacado con badge cobalto (`.todayBadge` en `#2563EB`) y soporte completo de teclado (`Enter` / `Espacio`).
3. **Montaje Real en la Aplicación (`App.tsx`):**
   - Suministro directo de `<MonthlyCalendarGrid />` en el `workbenchSlot` de [`WorkspaceLayout`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/WorkspaceLayout.tsx), quedando operativo en vivo al autenticarse el usuario.

### 5. Alcance Final
- **IN-SCOPE (Completado y consolidado):**
  - Utilidad pura [`src/workspace/utils/calendarMatrix.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.ts) con 12 tests en [`calendarMatrix.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/utils/calendarMatrix.test.ts).
  - Componente de UI [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx) y estilos [`MonthlyCalendarGrid.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.module.css) con 9 tests en [`MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx).
  - Montaje interactivo en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) y verificación de presencia en [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx).
- **OUT-OF-SCOPE (Preservado fielmente para unidades sucesivas):**
  - Infraestructura de Drag & Drop y soltado de tarjetas (asignado a `FIA-A07.02`).
  - Bloqueo de fechas pasadas y animación elástica de retorno (Caso `VV-002`, asignado a `FIA-A07.03`).
  - Modal de conflicto de reasignación de fechas (Caso `VV-003`, asignado a `FIA-A07.04`).
  - Arrastre masivo de compra semanal (Caso `VV-006`, asignado a `FIA-A07.05`).
  - Desasignación por clic derecho (Caso `VV-007`, asignado a `FIA-A07.06`).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto.
- **Estilos:** CSS Modules puros consumiendo `src/theme/tokens.css` (variables `--accent-cobalt`, `--bg-primary`, `--border-subtle`, etc.).
- **Testing:** Vitest 3.0.7 con `@testing-library/react` 16.2.0 y `@testing-library/user-event` 14.6.7.

### 7. Contratos Finales Afectados
- **Contrato Funcional (`PVF-A07.01` / `VF-A07.01`):**
  - Matriz de 7 columnas fijas alineadas de Lunes a Domingo.
  - Navegación temporal instantánea en cliente sin peticiones de red ni CLS.
  - Día actual destacado inequívocamente con el color cobalto de acento.
- **Contrato de Dominio / Datos:**
  ```typescript
  export interface CalendarDay {
    date: Date;
    dateString: string; // ISO YYYY-MM-DD
    dayNumber: number;  // 1..31
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
  }
  ```
- **Contrato Físico:** El calendario opera en el 67% del layout principal (`workbenchRegion`) sin desbordar el viewport (100vh) y manteniendo la barra de desplazamiento interna.

### 8. Restricciones Finales
- Cero librerías externas de calendarios: motor temporal 100% nativo y TypeScript puro.
- Convención europea estricta: primer día de la semana fijado en Lunes (índice 1 en ISO).
- Inmutabilidad total: el cálculo de la matriz temporal genera nuevas referencias sin alterar objetos Date externos.
- Erradicación de Cumulative Layout Shift (CLS = 0): contenedor con dimensiones precalculadas y altura fija para celdas.

### 9. Diseño Técnico Final
- **Estructura de Ficheros en `src/workspace/`:**
  - `utils/calendarMatrix.ts`: Motor de cómputo inmutable (`generateCalendarMatrix`, `getMonthName`, `formatDateToIso`).
  - `components/MonthlyCalendarGrid.tsx`: Componente de presentación y navegación interactiva.
  - `components/MonthlyCalendarGrid.module.css`: Reglas de diseño (grid responsivo, estados hover, `.adjacentMonth`, `.todayBadge`).
- **Integración en `src/App.tsx`:**
  - Integrado como `workbenchSlot={<MonthlyCalendarGrid />}` dentro de `<WorkspaceLayout />`.

### 10. Flujo Operativo Final
1. Tras autenticación, `App.tsx` renderiza `WorkspaceLayout` con `MonthlyCalendarGrid` en su ranura derecha.
2. `MonthlyCalendarGrid` calcula en memoria los 35 o 42 días del mes actual con `calendarMatrix.ts`.
3. El usuario observa la cabecera con el mes y año, las 7 columnas y el día actual con badge cobalto.
4. Al pulsar `[>]`, la vista avanza un mes inmediatamente (<16ms) recalculando las fechas.
5. Al pulsar `[<]`, retrocede al mes previo; pulsar `[Hoy]` restablece al instante la fecha del sistema.

### 11. Casos Válidos Finales
- **Caso 1 (Carga Inicial):** Mes en curso calculado con 35 o 42 casillas y día actual con `.todayBadge`.
- **Caso 2 (Navegación Adelante/Atrás):** Los botones `[>]` y `[<]` cambian el mes y actualizan el título y los números de día.
- **Caso 3 (Transición de Año):** Diciembre 2026 -> Enero 2027 y Enero 2026 -> Diciembre 2025 comprobados sin anomalías.
- **Caso 4 (Botón Hoy):** Regreso inmediato al mes de referencia desde cualquier mes explorado.
- **Caso 5 (Accesibilidad Teclado):** Foco en casillas con tabulación y activación con tecla `Enter` o `Espacio`.

### 12. Casos Inválidos Finales
- **Manejo Defensivo de Fecha Inválida:** El componente y la matriz temporal utilizan de respaldo la fecha actual del sistema si se suministra una referencia nula o inválida, sin producir errores de runtime ni pantallas en blanco.

### 13. Tests Requeridos Finales
- **Suite Pure Logic (`calendarMatrix.test.ts`):** 12 tests pasando (100%).
  - Cálculo de casillas para meses de 28, 30 y 31 días.
  - Alineación de Lunes a Domingo.
  - Marcado de días pasados y día actual.
  - Nombres de meses en español.
- **Suite UI (`MonthlyCalendarGrid.test.tsx`):** 9 tests pasando (100%).
  - Renderizado de 7 cabeceras de columnas (L a D).
  - Título de cabecera y botones de navegación.
  - Navegación bidireccional y botón Hoy.
  - Atributos `data-date` y `data-testid` en cada celda.
- **Suite Integración (`App.test.tsx`):** 13 tests pasando (100%), incluyendo la verificación de presencia del calendario en el lienzo de trabajo.

### 14. Quality Gates Finales
- `QG-FIA-A07.01-01 · Compilación y Tipado:` Superado (0 errores en `tsc --noEmit`).
- `QG-FIA-A07.01-02 · Tests Unitarios e Integración:` Superado (283/283 tests pasando en verde en 34 suites).
- `QG-FIA-A07.01-03 · Anti-Scope Creep:` Superado (cero código de Drag & Drop introducido anticipadamente).
- `QG-FIA-A07.01-04 · Verificación Funcional UI:` Superado (comportamiento idéntico a `PVF-A07.01 / VF-A07.01`).

### 15. Archivos Reales Afectados
```
Creados:
- src/workspace/utils/calendarMatrix.ts
- src/workspace/utils/calendarMatrix.test.ts
- src/workspace/components/MonthlyCalendarGrid.tsx
- src/workspace/components/MonthlyCalendarGrid.module.css
- src/workspace/components/MonthlyCalendarGrid.test.tsx

Modificados:
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
- Ninguna divergencia funcional. La implementación satisfizo con exactitud milimétrica el alcance fijado.

### 17. Drift Integrado
- Ningún drift arquitectónico detectado. El aislamiento de módulos y la topología espacial se preservaron intactos.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún CHG requerido.

### 19. Definition of Done AS-BUILT
Se certifica de manera concluyente que la unidad **FIA-A07.01** se encuentra implementada, verificada y sellada bajo la disciplina formal del Método zug. La cuadrícula mensual y su motor temporal quedan congelados e inmutables, **autorizándose el inicio inmediato de FIA-A07.02**.
