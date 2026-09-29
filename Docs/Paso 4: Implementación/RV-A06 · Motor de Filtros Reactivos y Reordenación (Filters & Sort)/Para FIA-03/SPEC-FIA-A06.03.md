# SPEC-FIA-A06.03 · PANEL DE REORDENACIÓN Y MOTOR DE ORDENACIÓN MULTINIVEL

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A06 (MOTOR DETERMINISTA, MENÚ REORDENAR, INTEGRACIÓN END-TO-END Y CIERRE DE REBANADA)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A06.03 · Panel de Reordenación y Motor de Ordenación Multinivel  
**PVF de Cierre:** PVF-A06.01, PVF-A06.02 y PVF-A06.03 (Completitud Funcional Observable en UI)  
**VF:** VF-A06.01, VF-A06.02 y VF-A06.03  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A06.02.md APROBADO (FIA-A06.02_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el motor de ordenación multinivel determinista ([`sortEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.ts)), el componente visual [`SortMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.tsx) y la **conexión integral end-to-end en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx)** para el Agente Implementador (Antigravity CLI).

> [!CRITICAL]
> **MANDATO DE CIERRE END-TO-END:**
> Esta unidad clausura la Rebanada Vertical RV-A06. **Queda terminantemente prohibido implementar componentes aislados o botones decorativos desconectados.** Al término de esta unidad, los tres botones del Hub (`[Filtrar]`, `[Limpiar]` y `[Reordenar]`) deben estar plenamente cableados con las listas de los acordeones (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`) en `App.tsx`, de modo que al filtrar u ordenar, **las tarjetas de la pantalla cambien de visibilidad y de orden físico en tiempo real**.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Motor de Ordenación Multinivel (`src/filters/utils/sortEngine.ts`):**
   - Función pura e inmutable `sortItems<T extends SortableItem>(items: T[], config: SortConfiguration): T[]`.
   - Criterios: **Prioridad** (Alta=3, Media=2, Baja=1), **Fecha** (`nulls last` estricto en ASC y DESC), **Alfabético** (`localeCompare`) y **Estado** (Pendientes primero).
   - **Regla Innegociable de Desempate:** Ante empate en criterio principal, desempata por `fechaProgramada ASC`; si persiste o ambos carecen de fecha, desempata de forma fija y determinista por `createdAt ASC`.
2. **Componente Accesible `SortMenu.tsx`:** Menú popover accesible con indicador visual de opción activa, soporte de navegación por teclado y cierre por tecla `Escape` o clic fuera.
3. **Integración End-to-End en [`App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx) y [`HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx):**
   - Integrar los botones `[Filtrar]`, `[Limpiar]` y `[Reordenar]` en la barra superior del Hub.
   - Montar `FilterModal` y `SortMenu` en la capa de diálogo de `App.tsx`.
   - Conectar las colecciones de tareas a `useItemFilters` y `sortEngine` para que los acordeones muestren **efectivamente en tiempo real los ítems filtrados y reordenados**.
4. **Verificación End-to-End en [`App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx):**
   - Test de integración que demuestre que al interactuar con `[Filtrar]` y `[Reordenar]`, las tarjetas en pantalla responden y cambian su orden/visibilidad de forma observable.
5. Cierre formal y sellado definitivo de **RV-A06** con 100% de tests en verde (mínimo 245+ tests).

---

## 3. Estado Actual del Repositorio
- Subsistema de filtros creado pero desacoplado del árbol raíz: `filter.types.ts`, `filterEngine.ts`, `useItemFilters.ts`, `FilterModal.tsx`.
- En `App.tsx`, `<HubContainer>` aloja `<TasksAccordion />`, `<ShoppingAccordion />` y `<CleaningAccordion />` sin pasarles los datos filtrados ni conectar los callbacks de filtrado y ordenación.
- Suites actuales: 226/226 tests en verde (30 suites). Typecheck estricto 0 errores.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. `src/filters/types/sort.types.ts` y `src/filters/utils/sortEngine.ts` implementados con 100% de cobertura.
2. `src/filters/components/SortMenu.tsx` y `SortMenu.module.css` implementados y accesibles.
3. `HubContainer.tsx` exhibe la barra completa de herramientas con `[Filtrar (N)]`, `[Limpiar]` (condicional) y `[Reordenar]`.
4. `App.tsx` orquesta el flujo completo: abrir modal de filtros, aplicar criterios, abrir menú de ordenación, seleccionar orden y pasar las listas procesadas a los acordeones.
5. `App.test.tsx` certifica el cumplimiento conjunto de `PVF-A06.01`, `PVF-A06.02` y `PVF-A06.03` desde la interfaz completa.
6. **RV-A06 SELLADA Y LISTA PARA LOCK.**

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `SortMenuProps`:
  ```typescript
  export interface SortMenuProps {
    isOpen: boolean;
    activeConfig: SortConfiguration;
    onClose: () => void;
    onSelectOption: (config: SortConfiguration) => void;
  }
  ```

### 5.2 Contrato de Interfaz Visual (Hub Toolbar)
- `HubContainer` aloja en su `toggleBar`:
  - Botón `[Filtrar (N)]` (con glifo o texto) -> dispara `onFilterClick`.
  - Botón `[Limpiar]` (visible si `isFilterActive === true`) -> dispara `onClearFilters`.
  - Botón `[Reordenar]` (con glifo o texto) -> dispara `onSortClick`.

### 5.3 Contrato de Aislamiento
- Operación 100% en cliente en memoria. Cero llamadas HTTP mutantes. Inmutabilidad de colecciones originales.

### 5.4 Contrato de Dominio / Tipos
```typescript
export type SortField = 'PRIORIDAD' | 'FECHA' | 'ALFABETICO' | 'ESTADO';
export type SortDirection = 'ASC' | 'DESC';

export interface SortConfiguration {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_SORT_CONFIG: SortConfiguration = {
  field: 'PRIORIDAD',
  direction: 'DESC',
};
```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
1. `src/filters/types/sort.types.ts`: Tipos, enums y opciones de ordenación.
2. `src/filters/utils/sortEngine.ts`: Motor puro determinista de ordenación multinivel.
3. `src/filters/utils/sortEngine.test.ts`: Suite de pruebas unitarias del motor de ordenación.
4. `src/filters/components/SortMenu.tsx`: Componente popover de opciones de ordenación.
5. `src/filters/components/SortMenu.module.css`: Estilos visuales del popover.
6. `src/filters/components/SortMenu.test.tsx`: Suite de integración RTL para el menú.

### 6.2 Modificar (Archivos existentes del repo a alterar)
1. `src/hub/components/HubContainer.tsx`: Integrar botón `[Reordenar]` (`onSortClick?: () => void`) en la barra de control.
2. `src/hub/components/HubContainer.module.css`: Estilos para el botón `[Reordenar]`.
3. `src/hub/components/HubContainer.test.tsx`: Validar renderizado y clic de `[Reordenar]`.
4. `src/App.tsx`: **Cableado end-to-end obligatorio.** Orquestar `FilterModal` y `SortMenu`, controlar estados de filtro y orden, y alimentar a los acordeones con las listas procesadas.
5. `src/App.test.tsx`: **Prueba de integración end-to-end.** Validar que interactuar con los filtros y la reordenación oculta y reorganiza efectivamente las tarjetas de tareas visibles.

### 6.3 Preservar
- Invariantes de tarjetas (`TaskCard`, `ShoppingCard`, `CleaningCard`) con puntito sutil de 7x7px.
- Menús contextuales de 3 puntos y Wizards de 3 pasos.
- `src/theme/tokens.css`.

### 6.4 Prohibido Tocar
- Servidores backend, endpoints REST, entidades y repositorios de base de datos.
- Drag & drop de calendario (pertenece a `RV-A07`).
- Carpetas cajón de sastre globales.

---

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `SUITE_ARQUITECTURA_UI.docx`, `Centra-T Pseudocódigo (unificado).odt` (Módulo 5.2), `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A06.01, PVF-A06.02, PVF-A06.03), `FIA-A06.02_AS_BUILT.md`.
- **Tecnológicas:** React 18/19, TypeScript 5.x estricto, CSS Modules, Vitest 3.2.7 y `@testing-library/react`.
- **Dependencia Secuencial:** Requiere `LOCK-FIA-A06.02.md`. Desbloquea `RV-A07` -> `FIA-A07.01`.

---

## 8. Restricciones
- Desempate determinista innegociable: empates en criterio principal se resuelven por `fechaProgramada ASC` y finalmente por `createdAt ASC`.
- Nulls Last estricto: ítems sin fecha van siempre al final en ordenación temporal.
- Inmutabilidad: `sortItems` clona el array con `[...items]`.
- **Prohibición de código huérfano:** La suite de tests de `App.test.tsx` debe demostrar que el filtrado y ordenación están vivos y funcionando en la UI.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests (RED):**
  - Crear `src/filters/utils/sortEngine.test.ts` con todos los casos de ordenación y desempates.
  - Crear `src/filters/components/SortMenu.test.tsx` con pruebas de renderizado, selección y accesibilidad.
  - Añadir en `src/App.test.tsx` la prueba de integración end-to-end de filtrado y reordenación real en el Hub.
- **Paso 2 — Validar Fallo Inicial:**
  - Ejecutar `npx vitest run` y comprobar que las nuevas pruebas fallan en rojo (`RED`).
- **Paso 3 — Implementar Mínimo (GREEN):**
  - Crear `src/filters/types/sort.types.ts`.
  - Implementar `src/filters/utils/sortEngine.ts`.
  - Implementar `src/filters/components/SortMenu.tsx` y `SortMenu.module.css`.
- **Paso 4 — Integrar End-to-End en Hub y App:**
  - Modificar `src/hub/components/HubContainer.tsx` para exponer `onSortClick` y renderizar `[Reordenar]`.
  - Modificar `src/App.tsx` para orquestar `FilterModal`, `SortMenu`, aplicar `applyFilters` y `sortItems`, y alimentar a los acordeones.
- **Paso 5 — Ejecutar Tests Completos:**
  - Ejecutar `npm run test` verificando que todas las suites (incluidas `App.test.tsx` y las de filtros) pasen al 100% (mínimo 245+ tests en verde).
- **Paso 6 — Ejecutar Quality Gates:**
  - `npm run typecheck` (`tsc --noEmit`).
  - `npm run build` sin advertencias.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Cierre de RV:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A06.03.md`, `TEST_REPORT_FIA-A06.03.md` y `LOCK-FIA-A06.03.md`, declarando el **CIERRE TOTAL DE RV-A06**.

---

## 10. Cambios Requeridos
### 10.1 Tipos (`src/filters/types/sort.types.ts`)
```typescript
export type SortField = 'PRIORIDAD' | 'FECHA' | 'ALFABETICO' | 'ESTADO';
export type SortDirection = 'ASC' | 'DESC';

export interface SortConfiguration {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_SORT_CONFIG: SortConfiguration = {
  field: 'PRIORIDAD',
  direction: 'DESC',
};

export interface SortOptionDescriptor {
  id: string;
  label: string;
  config: SortConfiguration;
}

export const SORT_OPTIONS: SortOptionDescriptor[] = [
  { id: 'priority-desc', label: 'Prioridad: Alta a Baja', config: { field: 'PRIORIDAD', direction: 'DESC' } },
  { id: 'priority-asc', label: 'Prioridad: Baja a Alta', config: { field: 'PRIORIDAD', direction: 'ASC' } },
  { id: 'date-asc', label: 'Fecha: Más cercana primero', config: { field: 'FECHA', direction: 'ASC' } },
  { id: 'date-desc', label: 'Fecha: Más lejana primero', config: { field: 'FECHA', direction: 'DESC' } },
  { id: 'alpha-asc', label: 'Nombre: A - Z', config: { field: 'ALFABETICO', direction: 'ASC' } },
  { id: 'alpha-desc', label: 'Nombre: Z - A', config: { field: 'ALFABETICO', direction: 'DESC' } },
  { id: 'status-asc', label: 'Estado: Pendientes primero', config: { field: 'ESTADO', direction: 'ASC' } },
  { id: 'status-desc', label: 'Estado: Completadas primero', config: { field: 'ESTADO', direction: 'DESC' } },
];
```

### 10.2 Motor de Ordenación (`src/filters/utils/sortEngine.ts`)
```typescript
import { SortConfiguration } from '../types/sort.types';

export interface SortableItem {
  id: string;
  titulo?: string;
  prioridad?: 'alta' | 'media' | 'baja' | string;
  completado?: boolean;
  fechaProgramada?: Date | string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  alta: 3,
  media: 2,
  baja: 1,
};

export function compareItems<T extends SortableItem>(
  a: T,
  b: T,
  config: SortConfiguration
): number {
  let diff = 0;

  // 1. Criterio Principal
  if (config.field === 'PRIORIDAD') {
    const weightA = PRIORITY_WEIGHT[a.prioridad || 'media'] || 2;
    const weightB = PRIORITY_WEIGHT[b.prioridad || 'media'] || 2;
    diff = config.direction === 'DESC' ? weightB - weightA : weightA - weightB;
  } else if (config.field === 'FECHA') {
    const hasA = a.fechaProgramada !== null && a.fechaProgramada !== undefined;
    const hasB = b.fechaProgramada !== null && b.fechaProgramada !== undefined;
    if (!hasA && hasB) return 1;  // Nulls siempre al final
    if (hasA && !hasB) return -1;
    if (hasA && hasB) {
      const timeA = new Date(a.fechaProgramada!).getTime();
      const timeB = new Date(b.fechaProgramada!).getTime();
      diff = config.direction === 'ASC' ? timeA - timeB : timeB - timeA;
    }
  } else if (config.field === 'ALFABETICO') {
    const titleA = (a.titulo || '').trim();
    const titleB = (b.titulo || '').trim();
    diff = titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
    if (config.direction === 'DESC') diff = -diff;
  } else if (config.field === 'ESTADO') {
    const stateA = a.completado ? 1 : 0;
    const stateB = b.completado ? 1 : 0;
    diff = config.direction === 'ASC' ? stateA - stateB : stateB - stateA;
  }

  // 2. Desempate Secundario (fechaProgramada ASC)
  if (diff === 0 && a.fechaProgramada && b.fechaProgramada) {
    diff = new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime();
  }

  // 3. Desempate Terciario Determinista (createdAt ASC)
  if (diff === 0) {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    diff = timeA - timeB;
  }

  return diff;
}

export function sortItems<T extends SortableItem>(
  items: T[],
  config: SortConfiguration
): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => compareItems(a, b, config));
}
```

### 10.3 Componente Popover (`src/filters/components/SortMenu.tsx`)
Popover accesible que renderiza la lista `SORT_OPTIONS` con `role="menu"`, permite elegir la configuración de ordenación activa y se cierra con clic fuera o Escape.

### 10.4 Orquestación End-to-End en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx)
Conectar `FilterModal`, `SortMenu`, `useItemFilters` y `sortItems`:
```tsx
// App.tsx
// 1. Estados de diálogo para FilterModal y SortMenu
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
const [sortConfig, setSortConfig] = useState<SortConfiguration>(DEFAULT_SORT_CONFIG);

// 2. Hook de filtros
const {
  criteria,
  isFiltered,
  activeFilterCount,
  setCriteria,
  resetFilters,
} = useItemFilters(allTasks);

// 3. Procesamiento en caliente para los acordeones
// itemsProcesados = sortItems(applyFilters(rawItems, criteria), sortConfig)

// 4. Inyección en WorkspaceLayout -> HubContainer
<HubContainer
  onFilterClick={() => setIsFilterModalOpen(true)}
  onSortClick={() => setIsSortMenuOpen(true)}
  isFilterActive={isFiltered}
  activeFilterCount={activeFilterCount}
  onClearFilters={resetFilters}
>
  <TasksAccordion tasks={processedTasks} ... />
  <ShoppingAccordion ... />
  <CleaningAccordion ... />
</HubContainer>

// 5. Montaje de modales en Floating Layer
<FilterModal
  isOpen={isFilterModalOpen}
  initialCriteria={criteria}
  onClose={() => setIsFilterModalOpen(false)}
  onApply={(c) => { setCriteria(c); setIsFilterModalOpen(false); }}
  onReset={resetFilters}
/>
<SortMenu
  isOpen={isSortMenuOpen}
  activeConfig={sortConfig}
  onClose={() => setIsSortMenuOpen(false)}
  onSelectOption={(cfg) => { setSortConfig(cfg); setIsSortMenuOpen(false); }}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios de Motor (`sortEngine.test.ts`)
- Ordenación por prioridad (Alta a Baja y Baja a Alta).
- Ordenación por fecha con garantía `nulls last`.
- Ordenación alfabética y por estado.
- Desempates deterministas por `createdAt ASC`.
- Inmutabilidad del array original.

### 11.2 Tests de Menú (`SortMenu.test.tsx`)
- Renderizado y cierre con tecla Escape y clic fuera.
- Selección interactiva de opciones y callback `onSelectOption`.

### 11.3 Tests End-to-End en Interfaz (`App.test.tsx`)
- **Verificación PVF-A06.01:** Clic en `[Filtrar]`, seleccionar Prioridad Alta y pulsar Aplicar -> la lista de tareas del Hub muestra únicamente tareas de prioridad alta.
- **Verificación PVF-A06.02:** Con filtro activo, pulsar `[Limpiar]` -> todas las tareas del Hub vuelven a mostrarse.
- **Verificación PVF-A06.03:** Clic en `[Reordenar]`, seleccionar "Fecha: Más cercana primero" -> las tarjetas en pantalla se reordenan según la fecha programada.

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores.
- `QG-02 · Compilación de Producción:` `npm run build` limpio.
- `QG-03 · Test Suite Completa:` 100% de tests en verde (mínimo 245+ tests pasando).
- `QG-04 · Verificación Funcional UI (PVF-A06.01..03):` `App.test.tsx` validando que los filtros y ordenación funcionan en runtime.
- `QG-05 · Cierre de Rebanada:` Certificado `LOCK-FIA-A06.03.md` decretando el cierre total de **RV-A06**.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)",
  "completed_fias": [
    "FIA-A01.01", "FIA-A01.02", "FIA-A01.03",
    "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05",
    "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05",
    "FIA-A04.01", "FIA-A04.02", "FIA-A04.03",
    "FIA-A05.01", "FIA-A05.02", "FIA-A05.03",
    "FIA-A06.01", "FIA-A06.02", "FIA-A06.03"
  ],
  "latest_locked_fia": "FIA-A06.03",
  "architectural_decisions_applied": [
    "Motor de ordenación multinivel determinista con regla de desempate createdAt ASC y nulls last en fechas",
    "Menú popover SortMenu accesible e integrado en HubContainer",
    "Conexión end-to-end de filtros y ordenación en App.tsx sobre las listas reales del Hub",
    "RV-A06 100% COMPLETADA Y CERRADA: Motor de filtros y ordenación finalizado, operativo y sellado"
  ],
  "unlocked_next": "RV-A07 · Calendario Mensual Interactivo y Drag & Drop -> FIA-A07.01"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/filters/types/sort.types.ts",
    "src/filters/utils/sortEngine.ts",
    "src/filters/utils/sortEngine.test.ts",
    "src/filters/components/SortMenu.tsx",
    "src/filters/components/SortMenu.module.css",
    "src/filters/components/SortMenu.test.tsx"
  ],
  "files_modified": [
    "src/hub/components/HubContainer.tsx",
    "src/hub/components/HubContainer.module.css",
    "src/hub/components/HubContainer.test.tsx",
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
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "filter_system": "filtros_y_ordenacion_multinivel_completos_y_deterministas",
    "hub_toolbar": "botones_filtrar_limpiar_y_reordenar_operativos",
    "runtime_hub_lists": "listas_de_acordeones_filtradas_y_reordenadas_en_tiempo_real"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `sort.types.ts`, `sortEngine.ts`, `SortMenu.tsx` y estilos están implementados.
2. `HubContainer.tsx` integra el botón `[Reordenar]` accesible.
3. `App.tsx` está cableado end-to-end con `FilterModal` y `SortMenu`, y las listas de los acordeones responden en caliente al filtrado y reordenación.
4. `App.test.tsx` supera los tests de integración end-to-end.
5. Los 5 Quality Gates pasaron limpiamente.
6. Se generaron `IMPLEMENTATION_REPORT_FIA-A06.03.md`, `TEST_REPORT_FIA-A06.03.md` y `LOCK-FIA-A06.03.md`, clausurando formalmente **RV-A06**.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A06.03`.
- **Cero Código Huérfano:** Está taxativamente prohibido dar por terminada la FIA dejando los botones de `[Filtrar]` y `[Reordenar]` sin conectar en `App.tsx`. Es obligatorio completar la orquestación en `App.tsx` y validarla en `App.test.tsx`.
- **TDD Estricto:** Ejecuta las pruebas en rojo (`RED`) antes de codificar la lógica del motor.
- **Parada Obligatoria y Cierre de RV:** Tras superar los Quality Gates, generar los reportes y redactar `LOCK-FIA-A06.03.md` (cerrando RV-A06), DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
