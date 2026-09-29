# REPORTE DE EJECUCIÓN DE PRUEBAS · FIA-A07.06
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**FIA:** FIA-A07.06 · Desasignación por Clic Derecho y Retorno al Hub (VV-007)  
**Hito:** SEXTA Y ÚLTIMA UNIDAD DE RV-A07 (CIERRE DE REBANADA)  
**Herramienta:** Vitest 3.2.7  
**Estado:** 100% VERDE · ZERO REGRESSIONS  

---

### 1. Desglose de Suites y Pruebas Afectadas en FIA-A07.06

#### Menú Contextual Accesible ([`CalendarItemContextMenu.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarItemContextMenu.test.tsx) - 6 tests):
1. **[NUEVO]** No renderiza nada en el DOM cuando `isOpen` es `false`.
2. **[NUEVO]** Renderiza el menú contextual en coordenadas fixed cuando `isOpen` es `true` (`role="menu"`, `aria-label`).
3. **[NUEVO]** Muestra la opción "Mover a Sin Asignar" con `role="menuitem"`.
4. **[NUEVO]** Invoca `onUnschedule` con `itemId` y `modulo` al hacer clic en "Mover a Sin Asignar".
5. **[NUEVO]** Invoca `onClose` al presionar la tecla `Escape`.
6. **[NUEVO]** Invoca `onClose` al hacer clic sobre el backdrop exterior.

#### Pastilla de Tarea en Calendario ([`CalendarTaskPill.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.test.tsx) - 8 tests):
- **[NUEVO]** Dispara `onContextMenu` suprimiendo el menú nativo (`preventDefault`) y propagando los datos del ítem (`id`, `modulo`, `titulo`).

#### Cuadrícula Mensual ([`MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx) - 15 tests):
- **[NUEVO]** Propaga `onItemContextMenu` a cada instancia de `CalendarTaskPill` al recibir clic derecho.

#### Integración E2E en App ([`App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx) - 23 tests):
- **[NUEVO - Caso Forense VV-007]** Clic derecho en una pastilla del calendario abre el menú contextual en la posición del cursor.
- **[NUEVO - Caso Forense VV-007]** Presionar Escape o hacer clic fuera cierra el menú sin desasignar la pastilla.
- **[NUEVO - Caso Forense VV-007]** Seleccionar "Mover a Sin Asignar" retira la pastilla del calendario y mantiene el ítem intacto en el Hub sin fecha (acción no destructiva).

---

### 2. Balance Global del Proyecto Centra-T
- **Suites Ejecutadas:** 39 de 39 suites PASSED (100%)
- **Tests Totales:** 343 de 343 PASSED (100%)
- **Duración Total:** 16.41s
- **Verificación de Tipos (`tsc --noEmit`):** 0 errores
- **Build de Producción (`vite build`):** Exitoso en 2.09s sin advertencias en `dist/`
- **Regresiones:** 0
