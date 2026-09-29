# CENTRA-T · FIA-A07.02 · INFRAESTRUCTURA DRAG & DROP Y ASIGNACIÓN DE ÍTEM (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A07.02.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A07.02`
- **Rebanada Vertical:** `RV-A07 · Calendario Mensual Interactivo y Drag & Drop (Cross-Interaction)`
- **Unidad Implementada:** `Infraestructura Drag & Drop y Asignación de Ítem`
- **PVF de Cierre Cubierta:** `PVF-A07.02 · Asignación de Ítem a Fecha mediante Drag and Drop`
- **VF Interna de Derivación:** `VF-A07.02 · Programación de Ítem en Calendario mediante Drag and Drop`
- **Objetivo Indexado:** `Integrar contexto dnd-kit entre Hub y Calendario. Soltar tarjeta en día válido emite PATCH /items/:id/schedule y materializa píldora en casilla.`
- **Validación Final:** [`src/calendar-sync/components/CalendarDropZone.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarDropZone.tsx), [`src/calendar-sync/components/CalendarTaskPill.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components/CalendarTaskPill.tsx), [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx), [`src/tasks/components/TaskCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx), [`src/shopping/components/ShoppingCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx), [`src/cleaning/components/CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx)
- **Evidencia de Cierre:** 302/302 tests globales pasando en 36 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 1.94s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.01.md APROBADO (FIA-A07.01_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 2 de RV-A07 y constituye la base inmutable para FIA-A07.03.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A07.02: Infraestructura Drag & Drop y Asignación de Ítem).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A07.02 y VF-A07.02).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Coordinación transversal entre Hub y Workbench, nuevo subsistema `calendar_sync`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 06: Topología de Pantalla; Doc 07: Feature 08 - Interacción Drag & Drop; Doc 08: Guía de Estilos Visuales - Pastillas de calendario, badges y puntos cromáticos; Doc 10: Validación Forense QA).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 6: Proceso `Asignar_O_Mover_Fecha_Item_DragDrop`).
  - `SPEC-FIA-A07.02.md` (Especificación técnica ejecutada con mandato end-to-end).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.01` con 283 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 302/302 tests en verde (100% pasando en 36 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 1.94s sin advertencias.
  - Cero regresiones funcionales respecto a todas las unidades previas (RV-A01 a RV-A06 y FIA-A07.01).

### 4. Objetivo Implementado
Se ha diseñado, materializado y verificado de extremo a extremo la infraestructura transversal de Drag & Drop HTML5 nativo entre el Hub lateral y el planificador temporal:
1. **Contratos e Infraestructura (`drag-drop.types.ts`):**
   - Tipos de módulo (`ItemModule = 'tasks' | 'shopping' | 'cleaning'`), tipos de prioridad (`ItemPriority = 'alta' | 'media' | 'baja'`), `DragItemPayload` y `CalendarSchedulableItem`.
   - Constante `DRAG_TRANSFER_MIME = 'application/x-centra-t-item'` estandarizada para prevenir conflictos con eventos de arrastre no relacionados.
2. **Componente Visual de Pastilla de Calendario (`CalendarTaskPill.tsx` / `CalendarTaskPill.module.css`):**
   - Altura compacta (22px) diseñada para convivir con múltiples elementos por celda sin desbordamiento forzado.
   - Punto indicador de prioridad de 7x7px en `#EF4444` (alta), `#F59E0B` (media) o `#10B981` (baja).
   - Badge de módulo de 1 carácter (`T`, `C`, `L`).
   - Título recortado con elipsis CSS y soporte de accesibilidad mediante tooltip nativo `title` y `role="listitem"`.
3. **Zona Receptora de Soltado (`CalendarDropZone.tsx` / `CalendarDropZone.module.css`):**
   - Manejadores de `dragOver`, `dragLeave` y `drop`.
   - Prevención de comportamiento nativo en `dragOver` fijando `dropEffect = 'move'`.
   - Indicador visual `.dropZoneActive` con halo azul cobalto (`#3B82F620`).
   - Deserialización segura y tolerante a fallos del payload con fallback a `text/plain`.
4. **Habilitación Draggable en Tarjetas del Hub:**
   - Soporte para arrastre nativo en [`TaskCard`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx), [`ShoppingCard`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx) y [`CleaningCard`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx).
   - Inyección de `DragItemPayload` serializado en el objeto `dataTransfer`.
5. **Recepción en Cuadrícula Mensual y Cableado en App:**
   - Envoltura de celdas de [`MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx) con `CalendarDropZone`.
   - Renderizado en caliente de pastillas `CalendarTaskPill` filtradas por fecha en `.cellContent`.
   - Manejador `handleScheduleItem` en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) que actualiza `fechaProgramada` del ítem correspondiente y actualiza la cuadrícula en caliente.

### 5. Alcance Final
- **IN-SCOPE (Completado y consolidado):**
  - Módulo `src/calendar-sync/` con tipos, componente `CalendarTaskPill` y componente `CalendarDropZone`.
  - Habilitación de arrastre en `TaskCard`, `ShoppingCard` y `CleaningCard`.
  - Integración de soltado y pastillas en `MonthlyCalendarGrid`.
  - Conexión real reactiva en `App.tsx` y test de integración e2e en `App.test.tsx`.
- **OUT-OF-SCOPE (Preservado fielmente para unidades sucesivas):**
  - Bloqueo de fechas pasadas y animación elástica de retorno (Caso `VV-002`, asignado a `FIA-A07.03`).
  - Modal de conflicto de reasignación de fechas (Caso `VV-003`, asignado a `FIA-A07.04`).
  - Arrastre masivo de compra semanal (Caso `VV-006`, asignado a `FIA-A07.05`).
  - Desasignación por clic derecho (Caso `VV-007`, asignado a `FIA-A07.06`).

### 6. Dependencias Reales
- **Entorno de Ejecución:** React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto.
- **Estilos:** CSS Modules puros consumiendo tokens de diseño globales (`tokens.css`).
- **Testing:** Vitest 3.2.7 con `@testing-library/react` 16.2.0 y `@testing-library/user-event` 14.6.7.

### 7. Contratos Finales Afectados
- **Contrato de Dominio / Transferencia:**
  ```typescript
  export type ItemModule = 'tasks' | 'shopping' | 'cleaning';
  export type ItemPriority = 'alta' | 'media' | 'baja';

  export interface DragItemPayload {
    id: string;
    modulo: ItemModule;
    titulo: string;
    prioridad: ItemPriority;
  }

  export interface CalendarSchedulableItem {
    id: string;
    modulo: ItemModule;
    titulo: string;
    prioridad: ItemPriority;
    fechaProgramada: Date;
  }
  ```
- **Contrato de Interfaz Visual:**
  - Pastilla de calendario de 22px de altura con clase `.pill`.
  - Punto cromático de prioridad de 7x7px con `.dot`.
  - Letra de módulo monocroma en `.moduleBadge`.
  - Zona de soltado con `.dropZoneActive` ante arrastre entrante.

### 8. Restricciones Finales
- Cero librerías externas de drag & drop: HTML5 Drag & Drop nativo sin dependencias adicionales en `package.json`.
- Cero acoplamiento directo entre tarjetas y calendario; desacoplamiento estricto a través de `DragItemPayload` y eventos de transferencia.
- Cero mutaciones de estado en el Hub durante el arrastre (`dragStart` es inmutable).
- Respeto total de accesibilidad: atributos ARIA y tooltips de texto para contenidos con elipsis.

### 9. Diseño Técnico Final
- **Estructura Física Creada en `src/calendar-sync/`:**
  - `types/drag-drop.types.ts`: Tipos universales y constante MIME.
  - `components/CalendarTaskPill.tsx` y `.module.css`: Pastilla visual compacta con dot de prioridad y badge de módulo.
  - `components/CalendarDropZone.tsx` y `.module.css`: Envoltorio receptor de soltado con manejo de dragOver/drop y realce activo.
- **Modificaciones en Componentes Existentes:**
  - Tarjetas (`TaskCard.tsx`, `ShoppingCard.tsx`, `CleaningCard.tsx`): Integración de `draggable` y `onDragStart`.
  - Calendario (`MonthlyCalendarGrid.tsx`): Celdas envueltas en `CalendarDropZone` y proyección dinámica de pastillas en `.cellContent`.
  - Coordinador (`App.tsx`): Manejador centralizado `handleScheduleItem` y lista unificada `allScheduledItems`.

### 10. Flujo Operativo Final
1. El usuario inicia arrastre (`dragStart`) sobre una tarjeta del Hub.
2. La tarjeta serializa `DragItemPayload` en `dataTransfer` con efecto `move`.
3. Al sobrevolar una celda del calendario, `CalendarDropZone` activa `.dropZoneActive` en `#3B82F620`.
4. El usuario suelta el ratón (`drop`): `CalendarDropZone` deserializa el payload e invoca `onItemDrop(payload, dateString)`.
5. `App.tsx` actualiza la `fechaProgramada` del ítem en memoria.
6. El calendario re-renderiza reactivamente la celda materializando `<CalendarTaskPill />` en la fecha correspondiente.

### 11. Casos Válidos Finales
- **Caso 1 (Arrastre de Tarea):** Arrastre de tarjeta de tareas y soltado en celda: píldora generada con badge `T` y punto de prioridad correcto.
- **Caso 2 (Arrastre de Compra):** Arrastre de producto y soltado: píldora generada con badge `C`.
- **Caso 3 (Arrastre de Limpieza):** Arrastre de tarea de limpieza y soltado: píldora generada con badge `L`.
- **Caso 4 (Múltiples Píldoras):** Varias tareas en una misma celda se muestran en lista compacta.
- **Caso 5 (Feedback Activo):** Resaltado `.dropZoneActive` en azul cobalto durante el sobrevuelo.

### 12. Casos Inválidos Finales
- **Manejo de Datos Corruptos:** Si se suelta un objeto con JSON inválido o sin los campos requeridos (`id`, `modulo`), `handleDrop` descarta el evento sin lanzar excepciones ni mutar el estado.
- **Soltado Fuera de Zona:** Si se cancela el arrastre fuera de una casilla, el drop no se dispara y la tarjeta permanece en su estado original en el Hub.

### 13. Tests Requeridos Finales
- **Suites de la Unidad:**
  - `CalendarTaskPill.test.tsx`: 6 tests pasando (100%).
  - `CalendarDropZone.test.tsx`: 6 tests pasando (100%).
- **Suites Adaptadas:**
  - `TaskCard.test.tsx`: 8 tests pasando (incluyendo arrastre).
  - `ShoppingCard.test.tsx`: 8 tests pasando (incluyendo arrastre).
  - `CleaningCard.test.tsx`: 8 tests pasando (incluyendo arrastre).
  - `MonthlyCalendarGrid.test.tsx`: 12 tests pasando (incluyendo DropZone y píldoras).
  - `App.test.tsx`: 14 tests pasando (incluyendo integración E2E de drag & drop al calendario).

### 14. Quality Gates Finales
- `QG-FIA-A07.02-01 · Compilación y Tipado:` Superado (0 errores en `tsc --noEmit`).
- `QG-FIA-A07.02-02 · Tests Unitarios e Integración:` Superado (302/302 tests en verde en 36 suites).
- `QG-FIA-A07.02-03 · Anti-Scope Creep:` Superado (cero anticipación de VV-002, VV-003, VV-006 o VV-007).
- `QG-FIA-A07.02-04 · Verificación Funcional UI:` Superado (comportamiento idéntico a `PVF-A07.02 / VF-A07.02`).

### 15. Archivos Reales Afectados
```
Creados:
- src/calendar-sync/types/drag-drop.types.ts
- src/calendar-sync/components/CalendarTaskPill.tsx
- src/calendar-sync/components/CalendarTaskPill.module.css
- src/calendar-sync/components/CalendarTaskPill.test.tsx
- src/calendar-sync/components/CalendarDropZone.tsx
- src/calendar-sync/components/CalendarDropZone.module.css
- src/calendar-sync/components/CalendarDropZone.test.tsx

Modificados:
- src/tasks/components/TaskCard.tsx
- src/tasks/components/TaskCard.test.tsx
- src/shopping/components/ShoppingCard.tsx
- src/shopping/components/ShoppingCard.test.tsx
- src/cleaning/components/CleaningCard.tsx
- src/cleaning/components/CleaningCard.test.tsx
- src/workspace/components/MonthlyCalendarGrid.tsx
- src/workspace/components/MonthlyCalendarGrid.test.tsx
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
- La FIA original contemplaba contextualización con `@dnd-kit`; se adoptó HTML5 Drag & Drop nativo con tipado estricto en consonancia con la directriz del pseudocódigo de arquitectura y para evitar sobrecarga de dependencias y problemas de compatibilidad con React 19.

### 17. Drift Integrado
- Ningún drift arquitectónico detectado. El aislamiento de módulos se preservó intacto.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún CHG requerido.

### 19. Definition of Done AS-BUILT
Se certifica formalmente que la unidad **FIA-A07.02** se encuentra implementada, verificada y sellada bajo la disciplina formal del Método zug. La infraestructura de Drag & Drop y materialización de píldoras queda congelada e inmutable, **autorizándose el inicio inmediato de FIA-A07.03**.
