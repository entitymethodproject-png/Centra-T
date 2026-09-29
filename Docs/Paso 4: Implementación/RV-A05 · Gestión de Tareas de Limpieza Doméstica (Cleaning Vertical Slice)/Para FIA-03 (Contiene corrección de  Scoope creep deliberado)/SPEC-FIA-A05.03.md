# SPEC-FIA-A05.03 · CONMUTACIÓN DE LIMPIEZA, MUTACIÓN OPTIMISTA Y CIERRE DE RV-A05

**Proyecto:** Centra-T  
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Modo:** SPEC EJECUTABLE AUDITADA Y CONSOLIDADA  
**FIA Fuente:** FIA-A05.03 · Conmutación de Limpieza y Persistencia  
**PVF de Cierre:** PVF-A05.03 · Conmutación y Persistencia del Estado de Limpieza  
**VF:** VF-A05.03 · Mutación Optimista y Permanencia en Rotación  
**Estado:** Especificación ejecutada y validada  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A05 (CIERRE COMPLETO Y SELLADO DEL VERTICAL SLICE DE LIMPIEZA)  
**LOCK Previo Requerido:** LOCK-FIA-A05.02.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación y Propósito
El propósito formal de esta especificación técnica es certificar la funcionalidad de conmutación de estado de limpieza doméstica (`CleaningCard`), la mutación optimista con rollback ante error 500, la integración del **puntito sutil de prioridad (`puntito sutil`)** situado estrictamente entre el checkbox y el título, el menú contextual de tres puntos (`CleaningActionMenu`), y la integración en `CleaningAccordion`.

Todo el diseño y comportamiento obedece estrictamente al **Modelo Universal de Tareas**, erradicando de raíz cualquier campo inventado (`zona`, `frecuencia`, `proximaFechaSugerida`, `lastCompletedAt`, selectores de fecha en modales) y cualquier elemento visual sobrecargado (marcadores textuales de prioridad, contadores apelotonados de pendientes, telemetría de red Online en la barra superior).

---

## 2. Decisiones Arquitectónicas Aplicadas (Innegociables)
1. **Modelo de Dominio Universal 1:1:**
   - La entidad `CleaningItem` es idéntica en estructura a `TaskItem` y `ShoppingItem`:
     `{ id, userId, modulo: 'cleaning', titulo, descripcion, prioridad, completado, fechaProgramada, createdAt, updatedAt }`.
   - Cualquier especificación o detalle de limpieza se redacta libremente en `descripcion`.
2. **Asignación Temporal Exclusiva en Calendario:**
   - No existen campos de fecha ni cálculo de recurrencia en el alta ni en la tarjeta. La asignación temporal se realiza de forma unificada en el Calendario (RV-A06).
3. **Puntito Sutil de Prioridad (`puntito sutil`):**
   - Eliminación de badges de texto pesados (`ALTA`, `MEDIA`, `BAJA`).
   - Inclusión de un indicador circular de 7x7px (`.priorityDot`) con borde redondeado y leve resplandor, coloreado semánticamente (rojo `#ef4444` para alta, ámbar `#f59e0b` para media, azul `#3b82f6` para baja), colocado exactamente entre el checkbox y el título.
4. **Mutación Optimista Inmediata (<50ms) y Rollback Atómico (Caso Forense VV-005):**
   - Respuesta visual reactiva instantánea al hacer clic en el checkbox.
   - Si la API responde con error (500), la UI revierte automáticamente el estado y despliega una notificación Toast empática descartable.
5. **Menú Contextual Homogéneo (`CleaningActionMenu`):**
   - Disparador de 3 puntos `•••`.
   - Submenú para cambiar la prioridad en tiempo real.
   - Opción para eliminar la tarea mediante diálogo modal de confirmación con foco seguro en `[Cancelar]`.
6. **Permanencia en Rotación (Invariante de Limpieza):**
   - Completar una tarea no la expulsa ni la oculta; permanece visible en el acordeón con estilo tachado y atenuado.
7. **Cabecera de Navegación Limpia (TopNavbar):**
   - Erradicación de la píldora informativa de red (`Online`/`Offline`) en la zona derecha. Conservación exclusiva de logo, perfil con inicial y botón de cerrar sesión.

---

## 3. Contratos de Interfaz

### 3.1 Contrato del Componente `CleaningCard`
```typescript
export interface CleaningCardProps {
  item: CleaningItem;
  cleaningService?: CleaningService;
  userId?: string;
  onItemUpdated?: (item: CleaningItem) => void;
  onItemDeleted?: (itemId: string) => void;
  onToggleOptimistic?: (itemId: string, newCompleted: boolean) => void;
  onRollback?: (itemId: string, revertedCompleted: boolean) => void;
}
```

### 3.2 Selectores y Contrato de Accesibilidad
- Raíz de tarjeta: `li[data-testid="cleaning-item-${item.id}"]`
- Checkbox accesible: `input[type="checkbox"][aria-label="Completar limpieza ${item.titulo}"]` / `input[type="checkbox"][aria-label="Desmarcar limpieza ${item.titulo}"]`
- Puntito de prioridad: `span[data-testid="cleaning-card-priority"]` con clases `.priorityDot` y `.priorityDot_${prioridad}`
- Título: `span[data-testid="cleaning-card-title"]` con clase `.titleCompleted` cuando `completado === true`
- Menú de acciones: `button[data-testid="cleaning-action-menu-trigger"]` (`aria-label="Opciones de la tarea ${item.titulo}"`)

---

## 4. Archivos Verificados y Cobertura de Pruebas

### 4.1 Componentes y Estilos
- `src/cleaning/components/CleaningCard.tsx` y `CleaningCard.module.css`
- `src/cleaning/components/CleaningActionMenu.tsx` y `CleaningActionMenu.module.css`
- `src/cleaning/components/CleaningCreationWizard.tsx` y `CleaningCreationWizard.module.css`
- `src/hub/components/CleaningAccordion.tsx` y `CleaningAccordion.module.css`
- `src/workspace/components/TopNavbar.tsx` y `TopNavbar.module.css`

### 4.2 Suites de Pruebas Asociadas
- `src/cleaning/components/CleaningCard.test.tsx` (7 tests unitarios)
- `src/cleaning/components/CleaningActionMenu.test.tsx` (7 tests unitarios)
- `src/cleaning/components/CleaningCreationWizard.test.tsx` (6 tests unitarios)
- `src/hub/components/CleaningAccordion.test.tsx` (7 tests unitarios e integración)
- `src/cleaning/services/cleaning.service.test.ts` (9 tests de servicio)
- `src/cleaning/controllers/cleaning.controller.test.ts` (4 tests de controlador)
- **Total Módulo Limpieza:** 40 tests pasando al 100% en verde.
- **Total Proyecto Centra-T:** 178 tests pasando al 100% en verde a través de 27 suites.

---

## 5. Quality Gates Aprobados
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) -> 0 errores.
- `QG-02 · Tests Suite:` `npm run test` -> 178/178 tests pasando al 100% en verde (27 suites).
- `QG-03 · Build de Producción:` `npm run build` -> Compilación exitosa en 2.09s sin advertencias.
- `QG-04 · Invariante Visual de Prioridad:` Puntito sutil de 7x7px situado estrictamente entre checkbox y nombre en todas las tarjetas (`TaskCard`, `ShoppingCard`, `CleaningCard`).
- `QG-05 · Limpieza de Cabecera Superior:` Píldora de estado de red (Online) eliminada de `TopNavbar`.

---

## 6. Cierre y Sellado de RV-A05
Con la culminación de esta unidad, se certifica el **CIERRE TOTAL Y SELLADO DEFINITIVO DE LA REBANADA VERTICAL RV-A05 (Gestión de Tareas de Limpieza Doméstica)**, autorizándose el inicio de la siguiente rebanada vertical:
`RV-A06 · Calendario Mensual y Rejilla Temporal (Calendar Grid Vertical Slice)`.
