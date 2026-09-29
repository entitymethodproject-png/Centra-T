# CENTRA-T · FIA-A05.02 · COMPONENTES UI Y ACORDEÓN DE LIMPIEZA (AS-BUILT)
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A05.02.md APROBADO  

---

### 1. Identificación
- **FIA:** `FIA-A05.02`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad Implementada:** `Componentes UI y Acordeón de Limpieza Homogéneo`
- **PVF Satisfecha:** `PVF-A05.04` y `PVF-A05.05`
- **VF Interna:** `VF-A05.02 · UI y Visualización del Módulo de Limpieza`
- **Fecha de Cierre:** 2026-09-29

### 2. Objetivo Implementado
Se ha materializado y verificado la interfaz completa de usuario de limpieza doméstica bajo el **Modelo Universal de Tareas**:
1. **Acordeón Lateral Limpio (`CleaningAccordion`):**
   - Cabecera homogénea: Chevron `▶`, título `Limpieza (${items.length})` y botón cuadrado compacto `+` (26x26px).
   - Sin barras de chips de zonas, sin badges apelotonados de pendientes ni inputs extraños.
   - Estados de carga (Skeleton), error (reintento), vacío (CTA de creación) y lista poblada.
2. **Tarjeta de Tarea Homogénea (`CleaningCard`):**
   - Checkbox accesible con mutación optimista.
   - Título con tachado en estado completado.
   - Puntito sutil de prioridad (`7x7px`, círculo coloreado según prioridad: rojo/ámbar/azul) ubicado estrictamente entre la casilla para el check y el nombre.
   - Menú contextual de 3 puntos.
3. **Menú Contextual de 3 Puntos (`CleaningActionMenu`):**
   - Disparador accesible `•••`.
   - Cambio de prioridad dinámico en submenú.
   - Eliminación con modal preventivo de confirmación con foco seguro en Cancelar.
4. **Wizard de Creación en 3 Pasos (`CleaningCreationWizard`):**
   - Paso 1: Título de la tarea (1..120 chars).
   - Paso 2: Descripción y notas (opcional, 0..1000 chars).
   - Paso 3: Selección de prioridad (`Alta`, `Media`, `Baja`).
   - Rollback a cero ante cancelación o tecla Escape.

### 3. Alcance Final de Archivos
- `src/cleaning/components/CleaningCard.tsx` y `CleaningCard.module.css`
- `src/cleaning/components/CleaningCard.test.tsx` (7 tests)
- `src/cleaning/components/CleaningActionMenu.tsx` y `CleaningActionMenu.module.css`
- `src/cleaning/components/CleaningActionMenu.test.tsx` (7 tests)
- `src/cleaning/components/CleaningCreationWizard.tsx` y `CleaningCreationWizard.module.css`
- `src/cleaning/components/CleaningCreationWizard.test.tsx` (6 tests)
- `src/hub/components/CleaningAccordion.tsx` y `CleaningAccordion.module.css`
- `src/hub/components/CleaningAccordion.test.tsx` (7 tests)
