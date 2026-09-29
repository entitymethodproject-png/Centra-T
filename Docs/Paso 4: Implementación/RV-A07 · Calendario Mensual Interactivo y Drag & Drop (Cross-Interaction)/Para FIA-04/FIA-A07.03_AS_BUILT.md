# CENTRA-T · FIA-A07.03 · BLOQUEO FECHAS PASADAS Y RETORNO ELÁSTICO (VV-002) (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A07.03.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.03`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Bloqueo Fechas Pasadas y Retorno Elástico (VV-002)`
- **PVF de Cierre Cubierta:** `PVF-A07.03 · Bloqueo Inflexible de Drop en Fechas Pasadas (Decisión 1A)`
- **VF Interna de Derivación:** `VF-A07.03 · Bloqueo de Drop en Fechas Pasadas (Decisión 1A / VV-002)`
- **Objetivo Indexado:** `Intercepción de cursor sobre casillas pasadas (cursor not-allowed, tinte carmesí). Soltar anula el drop y activa animación elástica de retorno (Decisión 1A).`
- **Validación Final:** [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx), [`src/calendar-sync/components/CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css), [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 308/308 tests globales pasando en 36 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.02s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.02.md APROBADO (FIA-A07.02_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 3 de RV-A07 y constituye la base inmutable para FIA-A07.04.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.03: Bloqueo Fechas Pasadas y Retorno Elástico - VV-002).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.03 y VF-A07.03).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 08 - Decisión Arquitectónica 1A; Doc 08: Guía de Estilos Visuales; Doc 10: Validación Forense QA - Caso VV-002).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: calendar_sync - Proceso `Asignar_O_Mover_Fecha_Item_DragDrop` - Paso 1: `Validacion_De_Frontera_Temporal`).
  - `SPEC-FIA-A07.03.md` (Especificación técnica ejecutada con mandato de bloqueo temporal).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.02` con 302 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 308/308 tests en verde (100% pasando en 36 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.02s sin advertencias.
  - Cero regresiones funcionales respecto a todas las unidades previas (RV-A01 a RV-A06 y FIA-A07.01/02).

### 4. Objetivo Implementado
Se ha diseñado, materializado y verificado de extremo a extremo el cumplimiento de la **Decisión Arquitectónica 1A** y la validación forense **VV-002** en la interacción Drag & Drop:
1. **Lógica de Frontera Temporal en `CalendarDropZone.tsx`:**
   - La propiedad `isPast?: boolean` se consume activamente para bifurcar la respuesta a los eventos de arrastre.
   - En `handleDragOver` y `handleDragEnter`: ante `isPast === true`, se anula el permiso de soltado fijando `e.dataTransfer.dropEffect = 'none'`, se activa el estado local `isBlocked = true` y se aborta cualquier activación de `isOver`.
   - En `handleDragLeave`: se restablecen `isOver = false` e `isBlocked = false`.
   - En `handleDrop`: ante `isPast === true`, se ejecuta `e.preventDefault()`, se limpian los estados locales y se cancela la operación sin invocar `onItemDrop`. Cero mutaciones de estado, cero llamadas HTTP y retorno elástico nativo de la tarjeta a su origen en el Hub.
2. **Estilizado Carmesí y Cursor Not-Allowed en `CalendarDropZone.module.css`:**
   - La clase `.dropZonePastBlocked` aplica `outline: 2px dashed var(--accent-crimson, #EF4444); outline-offset: -2px; background-color: rgba(239, 68, 68, 0.12); border-radius: 4px; cursor: not-allowed !important;`.
   - El atributo DOM `data-drop-blocked="true"` se expone condicionalmente mientras el arrastre sobrevuele la casilla.
3. **Preservación Invariable de Fechas Válidas:**
   - Para casillas de hoy y fechas futuras (`isPast === false`), se mantiene la activación de `.dropZoneActive`, `dropEffect = 'move'` y la invocación exitosa de `onItemDrop`.
4. **Auditoría Forense Integral VV-002:**
   - Pruebas unitarias e integradas certifican que soltar una tarjeta en fechas pasadas no produce efectos secundarios, no crea pastillas en el calendario y preserva la tarjeta intacta en el Hub.

### 5. Alcance Final
- **IN-SCOPE (Completado y consolidado):**
  - Modificación de [`CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx) y [`CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css).
  - 10 pruebas unitarias en [`CalendarDropZone.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.test.tsx).
  - 13 pruebas de cuadrícula en [`MonthlyCalendarGrid.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.test.tsx).
  - 15 pruebas de integración en [`App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx) incluyendo la prueba forense de `[VV-002]`.
- **OUT-OF-SCOPE (Preservado fielmente para unidades sucesivas):**
  - Modal de conflicto de reasignación de fechas (Caso `VV-003`, asignado a `FIA-A07.04`).
  - Arrastre masivo de compra semanal (Caso `VV-006`, asignado a `FIA-A07.05`).
  - Desasignación por clic derecho (Caso `VV-007`, asignado a `FIA-A07.06`).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto.
- **Estilos:** CSS Modules puros consumiendo variables `--accent-crimson: #EF4444`.
- **Testing:** Vitest 3.2.7 con `@testing-library/react` 16.2.0 y `@testing-library/user-event` 14.6.7.

### 7. Contratos Finales Afectados
- **Contrato de Interfaz Visual:**
  - Clase `.dropZonePastBlocked` con contorno discontinuo `#EF4444`, fondo `rgba(239, 68, 68, 0.12)` y cursor `not-allowed`.
  - Atributo accesible `data-drop-blocked="true"`.
- **Contrato Operativo de Arrastre (Decisión 1A / VV-002):**
  - `e.dataTransfer.dropEffect = 'none'` en casillas con `isPast === true`.
  - Cancelación total del drop sobre casillas pasadas (cero llamadas a `onItemDrop`).

### 8. Restricciones Finales
- Cero librerías externas de drag & drop o animaciones.
- Inmutabilidad estricta del estado ante intentos de soltado sobre fechas pasadas.
- Preservación íntegra de accesibilidad y soporte de teclado.

### 9. Diseño Técnico Final
- **Componente Receptor [`CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx):**
  - Gestión de estado `isBlocked` que conmuta ante `isPast && (dragOver || dragEnter)`.
  - Forzado de `dropEffect = 'none'` y guarda de salida inmediata `if (isPast) return;` en `handleDrop`.
- **Hoja de Estilos [`CalendarDropZone.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.module.css):**
  - Incorpora `.dropZonePastBlocked` conviviendo con `.dropZoneActive`.

### 10. Flujo Operativo Final
1. El usuario arrastra una tarjeta del Hub e ingresa a una casilla con `isPast === true`.
2. `CalendarDropZone` evalúa `isPast` y aplica `dropEffect = 'none'` junto con `.dropZonePastBlocked`.
3. El cursor adopta forma de prohibido (`not-allowed`) y la celda adquiere fondo carmesí sutil.
4. El usuario suelta el cursor: `handleDrop` ejecuta `preventDefault` y cancela la operación.
5. Cero llamadas HTTP y cero alteraciones en `App.tsx`.
6. La tarjeta regresa elásticamente a su posición original en el Hub.

### 11. Casos Válidos Finales
- **Caso 1 (Sobrevuelo Pasado):** Activación de `.dropZonePastBlocked`, `data-drop-blocked="true"` y cursor `not-allowed`.
- **Caso 2 (Soltado Pasado - VV-002):** Cancelación sin efectos ni peticiones; la tarjeta permanece sin asignar en el Hub.
- **Caso 3 (Salida con DragLeave):** Limpieza inmediata de la clase `.dropZonePastBlocked`.
- **Caso 4 (Fechas Válidas):** Preservación total de soltado en hoy y fechas futuras.

### 12. Casos Inválidos Finales
- **Soltado Forzado:** Cualquier intento de forzar un drop en fecha pasada es neutralizado por la guarda `if (isPast) return;`.

### 13. Tests Requeridos Finales
- **Tests de la Unidad:**
  - `CalendarDropZone.test.tsx`: 10/10 tests pasando (+4 tests específicos de fechas pasadas).
  - `MonthlyCalendarGrid.test.tsx`: 13/13 tests pasando (+1 test de integración de bloqueo).
  - `App.test.tsx`: 15/15 tests pasando (+1 test de auditoría forense E2E VV-002).

### 14. Quality Gates Finales
- `QG-FIA-A07.03-01 · Compilación y Tipado:` Superado (0 errores en `tsc --noEmit`).
- `QG-FIA-A07.03-02 · Tests Unitarios e Integración:` Superado (308/308 tests en verde en 36 suites).
- `QG-FIA-A07.03-03 · Anti-Scope Creep:` Superado (cero código de modal de conflicto VV-003).
- `QG-FIA-A07.03-04 · Verificación Funcional UI:` Superado (demostración forense del caso `VV-002`).

### 15. Archivos Reales Afectados
```
Creados:
- Ninguno (se especializó el subsistema existente).

Modificados:
- src/calendar-sync/components/CalendarDropZone.tsx
- src/calendar-sync/components/CalendarDropZone.module.css
- src/calendar-sync/components/CalendarDropZone.test.tsx
- src/workspace/components/MonthlyCalendarGrid.test.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
- Ninguna divergencia funcional. La implementación satisfizo con exactitud milimétrica el alcance fijado.

### 17. Drift Integrado
- Ningún drift arquitectónico detectado. El aislamiento de módulos se preservó intacto.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún CHG requerido.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad **FIA-A07.03** se encuentra implementada, verificada y sellada bajo la disciplina formal del Método zug. La regla de bloqueo inflexible de fechas pasadas y retorno elástico queda congelada e inmutable, **autorizándose el inicio inmediato de FIA-A07.04**.
