# SPEC-FIA-A05.02 · COMPONENTES UI Y ACORDEÓN DE LIMPIEZA DOMÉSTICA (MODELO UNIVERSAL)

**Proyecto:** Centra-T  
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A05.02 · Componentes UI de Limpieza Homogéneos  
**PVF de Cierre:** PVF-A05.04 y PVF-A05.05 (Experiencia de Usuario e Integración en Hub)  
**VF:** VF-A05.02 · UI y Visualización del Módulo de Limpieza  
**Estado de Entrada:** FIA aprobada · Homogeneización UI  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A05 (ACORDEÓN LIMPIO, CLEANING CARD, MENÚ CONTEXTUAL 3 PUNTOS Y WIZARD 3 PASOS)  
**LOCK Previo Requerido:** LOCK-FIA-A05.01.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
El propósito formal de esta especificación técnica ejecutable es definir los componentes de interfaz de usuario del módulo de limpieza doméstica (`src/cleaning/components/*` y `src/hub/components/CleaningAccordion.*`), garantizando **absoluta homogeneidad** con los módulos de `tasks` y `shopping`.
Todas las tareas en Centra-T tienen la misma presentación visual, el mismo diseño de cabecera de acordeón, las mismas tarjetas interactivas con menú contextual (`•••`), el mismo modal preventivo de eliminación segura (con foco por defecto en Cancelar) y el mismo flujo de creación asistido en 3 pasos con rollback a cero ante cancelación.
No existen selectores de frecuencia, zonas fragmentadas ni campos de fecha en creación, ya que las fechas se programan exclusivamente arrastrando al calendario.

---

## 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest los componentes de UI de `cleaning`:
1. **`CleaningAccordion` (`src/hub/components/CleaningAccordion.tsx`):**
   - Cabecera limpia y homogénea: Chevron `▶`, título `Limpieza (${items.length})` y botón cuadrado compacto `+` (26x26px) que abre el wizard de creación. Sin badges redundantes ni elementos apelotonados.
   - Matriz de estados visuales: Skeleton screen de 3 líneas durante la carga, estado de error con reintento, Empty State sobrio con botón `+ Crear Limpieza` y lista poblada delegada en `CleaningCard`.
2. **`CleaningCard` (`src/cleaning/components/CleaningCard.tsx`):**
   - Checkbox interactivo accesible con actualización optimista inmediata (<50ms).
   - Título con tachado visual (`line-through`) en estado completado.
   - Badge de prioridad semántico: `ALTA` (rojo), `MEDIA` (ámbar), `BAJA` (azul).
   - Menú contextual de 3 puntos (`CleaningActionMenu`).
   - Manejo de fallos con Toast empático y rollback visual ante errores del servidor.
3. **`CleaningActionMenu` (`src/cleaning/components/CleaningActionMenu.tsx`):**
   - Botón disparador accesible `•••` con `aria-haspopup="menu"`.
   - Submenú de cambio de prioridad en tiempo real (`Alta`, `Media`, `Baja`).
   - Opción destructiva "Eliminar tarea" que abre un diálogo modal de confirmación preventivo.
   - Modal preventivo con foco seguro obligatorio en el botón `[Cancelar]` y soporte para tecla `Escape` sin emitir peticiones `DELETE`.
4. **`CleaningCreationWizard` (`src/cleaning/components/CleaningCreationWizard.tsx`):**
   - Flujo modal en 3 pasos:
     - Paso 1: Título de la tarea (1..120 caracteres, autofocus, contador de caracteres, validación síncrona).
     - Paso 2: Descripción y notas (opcional, 0..1000 caracteres, contador, soporte multilínea).
     - Paso 3: Selección de prioridad (`Alta`, `Media`, `Baja`, por defecto `Media`).
   - Garantía de **rollback a cero** (Decisión 3A): pulsar `[Cancelar]` o la tecla `Escape` destruye el buffer en memoria y al reabrir nace limpio en el Paso 1.

---

## 3. Archivos Afectados
- `src/cleaning/components/CleaningCard.tsx` y `CleaningCard.module.css`
- `src/cleaning/components/CleaningCard.test.tsx` (7 tests)
- `src/cleaning/components/CleaningActionMenu.tsx` y `CleaningActionMenu.module.css`
- `src/cleaning/components/CleaningActionMenu.test.tsx` (7 tests)
- `src/cleaning/components/CleaningCreationWizard.tsx` y `CleaningCreationWizard.module.css`
- `src/cleaning/components/CleaningCreationWizard.test.tsx` (6 tests)
- `src/hub/components/CleaningAccordion.tsx` y `CleaningAccordion.module.css`
- `src/hub/components/CleaningAccordion.test.tsx` (7 tests)

---

## 4. Criterios de Aceptación
1. El acordeón de limpieza renderiza la cabecera idéntica a tareas y compra: título `Limpieza (N)` y botón `+`.
2. Las tarjetas de limpieza tienen checkbox, título, badge de prioridad y botón de 3 puntos.
3. El menú de 3 puntos permite cambiar la prioridad entre Alta, Media y Baja, y eliminar con confirmación segura.
4. El wizard de creación en 3 pasos valida título, descripción y prioridad, purga el buffer ante escape/cancelar, y persiste la tarea correctamente.
5. 100% de tests unitarios y de integración pasando en Vitest.
