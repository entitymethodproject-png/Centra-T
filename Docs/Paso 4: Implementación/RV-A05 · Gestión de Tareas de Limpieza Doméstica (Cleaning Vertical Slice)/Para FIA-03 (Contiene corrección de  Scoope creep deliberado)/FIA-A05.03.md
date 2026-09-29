# CENTRA-T · FIA-A05.03 · CONMUTACIÓN DE ESTADO, PERSISTENCIA Y CIERRE DE RV-A05
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** ESPECIFICADA Y CONSOLIDADA BAJO MODELO UNIVERSAL  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A05 (CIERRE COMPLETO Y SELLADO DEL VERTICAL SLICE DE LIMPIEZA DOMÉSTICA)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A05.03`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad:** `Conmutación de Estado, Mutación Optimista, Sincronización y Cierre de RV-A05`
- **PVF de Cierre Cubierta:** `PVF-A05.03 · Conmutación y Persistencia del Estado de Limpieza`
- **VF Interna:** `VF-A05.03 · Mutación Optimista y Permanencia en Rotación`
- **Objetivo Indexado:** `Al completar una tarea de limpieza, conmutar su estado con mutación optimista (<50ms), tachado visual, sincronización silenciosa en backend y rollback automático ante error 500, manteniendo el ítem en la lista sin expulsión.`
- **Validación Indexada:** `src/cleaning/components/CleaningCard.tsx` y `src/hub/components/CleaningAccordion.tsx`
- **LOCK Previo Requerido:** `LOCK-FIA-A05.02.md APROBADO`
- **Estado Documental:** `Especificación táctica corregida y alineada con las decisiones arquitectónicas transversales de Centra-T.`

### 2. Objetivo
Consolidar y certificar la conmutación de estado de las tareas de limpieza doméstica bajo el **Modelo Universal de Tareas**:
1. **Mutación Optimista Inmediata (<50ms):**
   - El checkbox de `CleaningCard` conmuta su estado visual y aplica el tachado al título de manera instantánea, sin esperar la respuesta de red.
2. **Sincronización en Backend con Rollback Automático (Caso Forense VV-005):**
   - El estado se sincroniza silenciosamente mediante `CleaningService.updateItem(userId, id, { completado })`.
   - Si el backend devuelve error (500), el cambio se revierte incondicionalmente y se muestra una notificación Toast empática con opción de descarte.
3. **Puntito Sutil de Prioridad (`puntito sutil`):**
   - Se elimina cualquier marcador textual pesado (`ALTA`, `MEDIA`, `BAJA`).
   - Se coloca un puntito sutil circular de `7x7px` situado estrictamente entre la casilla para el check y el nombre de la tarea.
4. **Mantenimiento en Rotación (Invariante de Limpieza Doméstica):**
   - A diferencia de listas donde los ítems completados se ocultan o expulsan, las tareas de limpieza permanecen en su acordeón con estilo atenuado y tachado, garantizando visibilidad continua.
5. **Menú Contextual de 3 Puntos (`CleaningActionMenu`):**
   - Cambio de prioridad dinámico en submenú y eliminación con confirmación preventiva.
6. **Cierre y Sellado Definitivo de la Rebanada Vertical RV-A05:**
   - Cierre formal de la tercera rebanada vertical, habilitando la apertura de `RV-A06 · Calendario Mensual y Rejilla Temporal`.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Mutación optimista en `CleaningCard.tsx` y reversión segura ante fallos 500.
  - Puntito sutil de prioridad (`7x7px`) entre checkbox y nombre en `CleaningCard.tsx`.
  - Permanencia incondicional del ítem completado en `CleaningAccordion.tsx`.
  - Menú de acciones contextuales (`CleaningActionMenu.tsx`) operativo.
  - Preservación íntegra de la suite de pruebas (178/178 tests globales pasando en verde a través de 27 suites).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Rejilla temporal y vistas del calendario mensual (`RV-A06`).
  - Arrastre interactivo Drag & Drop al calendario (`RV-A07`).
  - Campos inventados o no autorizados (`zona`, `frecuencia`, `proximaFechaSugerida`, `lastCompletedAt`, selectores de fecha en modales).

### 4. Dependencias
- **Documentales:**
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`.
  - `SUITE_ARQUITECTURA_UI.docx` y `SUITE_ARQUITECTURA_CORE.docx`.
  - Principios arquitectónicos: Modelo Universal de Tareas, Decisión 2B (corte estricto 120 caracteres en título, 1000 en descripción).
- **Tecnológicas Autorizadas:**
  - React 19.x, React-DOM 19.x, TypeScript 5.7 (strict mode), Vite 6.x con CSS Modules nativos, Vitest 3.2.7 + Testing Library.
- **Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK de `FIA-A05.02` (Aprobado). Su propio LOCK sella `RV-A05` y autoriza `RV-A06`.

### 5. Contratos Afectados
- **Contrato de Tarjeta `CleaningCardProps`:**
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
- **Contrato de Entidad `CleaningItem`:**
  ```typescript
  export interface CleaningItem {
    id: string;
    userId: string;
    modulo: 'cleaning';
    titulo: string;           // 1..120 caracteres
    descripcion: string;      // 0..1000 caracteres
    prioridad: 'alta' | 'media' | 'baja';
    completado: boolean;
    fechaProgramada: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **Contrato Visual:**
  - Checkbox accesible: `aria-label="Completar limpieza ${item.titulo}"` / `aria-label="Desmarcar limpieza ${item.titulo}"`
  - Puntito sutil de prioridad: `data-testid="cleaning-card-priority"` con clase semántica `styles.priorityDot` y `styles['priorityDot_' + item.prioridad]`.
  - Título: `data-testid="cleaning-card-title"` con clase `styles.titleCompleted` si `completado === true`.
  - Menú de 3 puntos: disparador `•••` con menú contextual y diálogo de borrado.

### 6. Restricciones
- Decisión 2B innegociable: acotación estricta de longitud (120 chars título, 1000 descripción).
- Homogeneidad 1:1 absoluta con los componentes de `tasks` y `shopping`.
- La fecha programada no se configura en modales de creación ni en la tarjeta; se asigna exclusivamente en el Calendario.
- Ausencia total de código huérfano, selectores residuales o campos no canónicos.

### 7. Quality Gates (QG-FIA-A05.03)
- `QG-FIA-A05.03-01 · Typecheck:` 0 errores en TypeScript estricto (`npm run typecheck`).
- `QG-FIA-A05.03-02 · Tests Suite:` 100% de tests en verde (178/178 tests pasando en Vitest).
- `QG-FIA-A05.03-03 · Build de Producción:` `npm run build` exitoso sin advertencias.
- `QG-FIA-A05.03-04 · Homogeneidad Visual:` Puntito sutil de prioridad situado entre checkbox y título verificado en todas las tarjetas.
- `QG-FIA-A05.03-05 · Integridad de Hub:` Acordeones limpios con contador `[Modulo] (N)` y botón `+` minimalista (26x26px).

### 8. Definition of Done (DoD)
1. `CleaningCard.tsx` opera con mutación optimista, reversión ante error 500 y puntito sutil de prioridad.
2. Todas las suites de pruebas unitarias e integración de `cleaning` (27 tests) y globales (178 tests) están aprobadas al 100%.
3. El frontend y backend de `cleaning` se ajustan estrictamente al Modelo Universal de Tareas sin discrepancias de dominio.
4. Se emiten el informe de auditoría senior y el LOCK correspondiente, clausurando y sellando **RV-A05**.
