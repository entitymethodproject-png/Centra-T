# REPORTE DE EJECUCIÓN DE PRUEBAS · FIA-A07.03
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**FIA:** FIA-A07.03 · Bloqueo Fechas Pasadas y Retorno Elástico (VV-002)  
**Herramienta:** Vitest 3.2.7  
**Estado:** 100% VERDE · ZERO REGRESSIONS  

---

### 1. Desglose de Suites y Pruebas Afectadas en FIA-A07.03

#### Zona Receptora de Calendario (`CalendarDropZone.test.tsx` - 10 tests):
1. Renderizado de elementos hijos y atributo `data-date`.
2. Activación de clase `.dropZoneActive` en `dragOver` y remoción en `dragLeave`.
3. Invocación de `onItemDrop` con payload deserializado ante soltado sobre fecha válida.
4. Descarte de drop con datos vacíos o no válidos.
5. Inclusión de clases CSS personalizadas pasadas vía `className`.
6. Descarte de drop ante payload carente de `id` o `modulo`.
7. **[NUEVO]** Activación de `.dropZonePastBlocked`, `data-drop-blocked="true"` y fijación de `dropEffect = 'none'` al sobrevolar una casilla pasada (`isPast = true`).
8. **[NUEVO]** Remoción de `.dropZonePastBlocked` y `data-drop-blocked` al salir con `dragLeave` de la casilla pasada.
9. **[NUEVO - Caso VV-002]** Anulación del drop y rechazo incondicional de invocar `onItemDrop` cuando `isPast = true`.
10. **[NUEVO]** Preservación del funcionamiento habitual con `.dropZoneActive` y `dropEffect = 'move'` cuando `isPast = false`.

#### Cuadrícula de Calendario (`MonthlyCalendarGrid.test.tsx` - 13 tests):
- Inclusión de prueba específica que valida la bifurcación:
  - Casilla pasada (`2026-09-15`): soltado bloqueado, cero llamadas a `onItemDrop`.
  - Casilla futura (`2026-09-30`): soltado exitoso, invocación correcta a `onItemDrop`.

#### Integración E2E en App (`App.test.tsx` - 15 tests):
- Inclusión de prueba de validación forense **`[VV-002]`**:
  - Arrastre de tarjeta desde el Hub lateral hacia una casilla de fecha pasada (`${y}-${m}-01`).
  - Activación visual del bloqueo carmesí `.dropZonePastBlocked` con `dropEffect = 'none'`.
  - Soltado en dicha casilla: la pastilla NO se materializa en el calendario (`queryByTestId` es nulo).
  - La tarjeta original permanece intacta en el acordeón del Hub.

---

### 2. Balance Global del Proyecto Centra-T
- **Suites Ejecutadas:** 36 de 36 suites PASSED (100%)
- **Tests Totales:** 308 de 308 PASSED (100%)
- **Duración Total:** ~15.11s
- **Verificación de Tipos (`tsc --noEmit`):** 0 errores
- **Build de Producción (`vite build`):** Exitoso en 2.02s sin advertencias
- **Regresiones:** 0
