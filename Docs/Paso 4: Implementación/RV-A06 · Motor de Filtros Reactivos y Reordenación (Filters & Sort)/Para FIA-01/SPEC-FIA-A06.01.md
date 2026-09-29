# SPEC-FIA-A06.01 · MODAL DE FILTROS COMBINADOS Y EVALUACIÓN LÓGICA AND

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A06 (CONTRATOS DE FILTRADO, MOTOR AND PURO Y MODAL DE CONTROL)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A06.01 · Modal de Filtros Combinados y Evaluación Lógica AND  
**PVF de Cierre:** PVF-A06.01 · Panel de Filtros Combinados y Lógica AND (Botón [Filtrar])  
**VF:** VF-A06.01 · Panel de Filtros Combinados y Evaluación Lógica AND  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A05.03.md APROBADO (FIA-A05.03_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el subsistema de filtrado en cliente dentro de `src/filters/*` para el Agente Implementador (Antigravity CLI). Esta unidad inaugura la Rebanada Vertical **RV-A06 (Motor de Filtros Reactivos y Reordenación)** y abarca:
1. El modelado de tipos e interfaces de filtrado en `src/filters/types/filter.types.ts`.
2. El motor de evaluación lógica combinatoria AND determinista en `src/filters/utils/filterEngine.ts`.
3. El componente modal accesible `src/filters/components/FilterModal.tsx` con su hoja de estilos `FilterModal.module.css`.
4. La integración del botón de activación `[Filtrar]` en la barra de control del Hub (`HubContainer.tsx`).
5. Las suites de pruebas unitarias y de integración exhaustivas (`filterEngine.test.ts` y `FilterModal.test.tsx`).

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. Una función pura determinista `evaluateItemFilter(item, criteria)` y su orquestador de listas `applyFilters(items, criteria)` que evalúe simultáneamente con lógica **AND acumulativa**:
   - **Prioridad:** Coincidencia exacta con `'alta'`, `'media'` o `'baja'`, o comodín inclusivo `'TODAS'`.
   - **Fecha:** Si está inactivo, incluye todo. Si está activo:
     * `tipo: 'PUNTUAL'`: el ítem debe poseer `fechaProgramada` que coincida en día calendario con `fechaInicio` (formato YYYY-MM-DD).
     * `tipo: 'RANGO'`: el ítem debe poseer `fechaProgramada` comprendida en el intervalo cerrado `[fechaInicio, fechaFin]`.
     * Los ítems sin fecha asignada (`null` / `undefined`) son excluidos si el filtro de fecha está activo.
   - **Estado:** Coincidencia con `'TODOS'`, `'SOLO_PENDIENTES'` (`completado === false`) o `'SOLO_COMPLETADAS'` (`completado === true`).
2. Un componente modal `FilterModal.tsx` accesible (WCAG AA), desacoplado con buffer de edición local:
   - Cancelar o pulsar tecla `Escape` descarta el buffer sin propagar cambios (`onClose`).
   - Pulsar `[Limpiar Filtros]` restaura los criterios al estado neutro por defecto (`DEFAULT_FILTER_CRITERIA`).
   - Pulsar `[Aplicar Filtros]` invoca `onApply(criteria)` y cierra el modal.
3. Cero llamadas HTTP y cero persistencia en base de datos: el subsistema de filtrado opera de forma pura en la memoria del cliente.
4. Conservación del 100% de tests del proyecto en verde (178 tests existentes + nuevas suites).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A05.03_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos y Módulos Existentes:**
  - Módulos de Hub, Workspace, Shell, Auth, Tareas, Compra y Limpieza operativos y sellados bajo el **Modelo Universal de Tareas**:
    `src/hub/*`, `src/workspace/*`, `src/authentication/*`, `src/tasks/*`, `src/shopping/*`, `src/cleaning/*`.
  - Tríada de acordeones completamente homogénea (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`) alojada en `src/hub/components/`.
  - Tarjetas de tareas con puntito sutil de prioridad (`7x7px`) situado entre checkbox y título.
- **Estado de Compilación y Tests:**
  - 178 tests en verde a través de 27 suites en Vitest.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Empaquetado Vite: Build de producción en `dist/` limpio en 2.09s.
- **Riesgos Iniciales:**
  - El directorio `src/filters/` debe crearse respetando Screaming Architecture, sin contaminar la lógica de negocio de los tres módulos de datos ni mezclar la evaluación de filtros con la ordenación multinivel (que corresponde a `FIA-A06.03`).

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirá el directorio `src/filters/` con subdirectorios `types/`, `utils/` y `components/`.
2. El componente `FilterModal.tsx` estará montado en la interfaz y será activable mediante el botón `[Filtrar]` del Hub.
3. El motor `filterEngine.ts` tendrá cobertura del 100% en todas las permutaciones lógicas posibles de la tabla de verdad AND.
4. Ninguna entidad ni servicio backend habrá sido modificado ni contaminado.
5. Los tests totales del proyecto aumentarán a un mínimo de 195+ tests, todos 100% en verde.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `FilterModal` recibe:
  ```typescript
  export interface FilterModalProps {
    isOpen: boolean;
    initialCriteria?: FilterCriteria;
    onClose: () => void;
    onApply: (criteria: FilterCriteria) => void;
    onReset?: () => void;
  }
  ```
- Al abrirse (`isOpen=true`), clona `initialCriteria` (o `DEFAULT_FILTER_CRITERIA`) en su estado interno `bufferCriteria`.

### 5.2 Contrato de Geometría / Interfaz
- Capa flotante modal (`Floating Layer`) con `z-index: 1000`.
- Backdrop semitransparente con desenfoque suave (`backdrop-filter: blur(4px); background: rgba(11, 15, 23, 0.75)`).
- Tarjeta modal centrada de ancho fijo/adaptable (`max-width: 480px`, `width: 90%`), esquinas redondeadas (`14px`), fondo `--bg-card` (`#1A2433`) y borde `--border-subtle` (`#233144`).

### 5.3 Contrato de Aislamiento
- El motor de filtrado es una función pura: no muta los arrays originales ni los objetos `item`.
- Prohibida cualquier invocación a `fetch`, `axios` o servicios de backend dentro de `src/filters/`.

### 5.4 Contrato de Dominio / Datos
- Interfaces canónicas en `src/filters/types/filter.types.ts`:
  ```typescript
  export type FilterPriority = 'TODAS' | 'alta' | 'media' | 'baja';
  export type FilterStatus = 'TODOS' | 'SOLO_PENDIENTES' | 'SOLO_COMPLETADAS';

  export interface FilterDateCriteria {
    activo: boolean;
    tipo: 'PUNTUAL' | 'RANGO';
    fechaInicio: string | null; // ISO YYYY-MM-DD
    fechaFin: string | null;    // ISO YYYY-MM-DD
  }

  export interface FilterCriteria {
    prioridad: FilterPriority;
    fecha: FilterDateCriteria;
    estado: FilterStatus;
  }

  export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
    prioridad: 'TODAS',
    fecha: {
      activo: false,
      tipo: 'PUNTUAL',
      fechaInicio: null,
      fechaFin: null,
    },
    estado: 'TODOS',
  };
  ```

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
1. `src/filters/types/filter.types.ts`: Contratos de datos, tipos y constantes por defecto.
2. `src/filters/utils/filterEngine.ts`: Motor puro de evaluación combinada AND.
3. `src/filters/utils/filterEngine.test.ts`: Suite de pruebas unitarias exhaustiva del motor puro.
4. `src/filters/components/FilterModal.tsx`: Componente visual modal accesible.
5. `src/filters/components/FilterModal.module.css`: Hoja de estilos con variables de tokens.
6. `src/filters/components/FilterModal.test.tsx`: Suite de integración RTL para el modal.

### 6.2 Modificar (Archivos existentes del repo a alterar)
1. `src/hub/components/HubContainer.tsx`: Incorporación accesible del botón `[Filtrar]` en la barra de herramientas del Hub y conexión opcional del estado del modal.
2. `src/hub/components/HubContainer.module.css`: Estilos visuales del botón `[Filtrar]`.
3. `src/hub/components/HubContainer.test.tsx`: Aserción de renderizado y clic del botón `[Filtrar]`.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/tasks/**/*`: Módulo de tareas intacto.
- `src/shopping/**/*`: Módulo de compras intacto.
- `src/cleaning/**/*`: Módulo de limpieza intacto.
- `src/workspace/**/*`: Layout y cabecera intactos.
- `src/theme/tokens.css`: Variables maestras de estilo.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/users/**/*`: Identidad de usuarios.
- `src/authentication/**/*`: Lógica de autenticación.
- Servidores backend, controladores REST, endpoints o esquemas de base de datos.
- Prohibido crear carpetas cajón de sastre genéricas (`src/utils/`, `src/shared/`).

---

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx`, `SUITE_ARQUITECTURA_UI.docx`, `Centra-T Pseudocódigo (unificado).odt`, `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A06.01), `FIA-A05.03_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 18/19, TypeScript 5.x, CSS Modules, Vitest 3.2.7, `@testing-library/react`.
- **Dependencia Secuencial:** Requiere `LOCK-FIA-A05.03.md`. Desbloquea `FIA-A06.02`.

---

## 8. Restricciones
- Prohibido instalar librerías externas de modales o formularios (cero dependencias externas no declaradas).
- Prohibido modificar o relajar `tsconfig.json`.
- Prohibido omitir el soporte de tecla `Escape` o la captura de clic fuera del diálogo.
- Prohibido escribir código de producción sin un test previo en rojo (TDD estricto).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests (RED):**
  - Crear `src/filters/utils/filterEngine.test.ts` con todos los casos de prueba unitarios para la evaluación lógica AND (Prioridad, Fecha, Estado y combinaciones).
  - Crear `src/filters/components/FilterModal.test.tsx` con pruebas de renderizado, apertura, selección de campos, reseteo, cierre con Cancelar/ESC y envío con Aplicar.
- **Paso 2 — Validar Fallo Inicial:**
  - Ejecutar `npx vitest run src/filters` y comprobar que las pruebas fallan con errores limpios de módulos no encontrados (`RED`).
- **Paso 3 — Implementar Mínimo (GREEN):**
  - Materializar `src/filters/types/filter.types.ts`.
  - Implementar `src/filters/utils/filterEngine.ts` satisfaciendo todas las aserciones de evaluación.
  - Implementar `src/filters/components/FilterModal.tsx` y `FilterModal.module.css`.
  - Reejecutar las pruebas de `src/filters` hasta alcanzar 100% en verde.
- **Paso 4 — Integrar:**
  - Integrar el botón `[Filtrar]` en `src/hub/components/HubContainer.tsx` (con soporte para activar el modal o exponer callback).
  - Actualizar `src/hub/components/HubContainer.test.tsx` para validar el nuevo botón.
- **Paso 5 — Ejecutar Tests Completos:**
  - Lanzar `npm run test` verificando que las 27+ suites pasen limpiamente (mínimo 195+ tests en verde).
- **Paso 6 — Ejecutar Quality Gates:**
  - Ejecutar `npm run typecheck` (`tsc --noEmit`).
  - Ejecutar `npm run build` certificando generación limpia en `dist/`.
- **Paso 7 — Estado Documental:**
  - Preparar las deltas de `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A06.01.md` y `TEST_REPORT_FIA-A06.01.md`.
  - Proponer el archivo `LOCK-FIA-A06.01.md` y detener la sesión devolviendo el control al usuario.

---

## 10. Cambios Requeridos
### 10.1 Tipos (`src/filters/types/filter.types.ts`)
```typescript
export type FilterPriority = 'TODAS' | 'alta' | 'media' | 'baja';
export type FilterStatus = 'TODOS' | 'SOLO_PENDIENTES' | 'SOLO_COMPLETADAS';

export interface FilterDateCriteria {
  activo: boolean;
  tipo: 'PUNTUAL' | 'RANGO';
  fechaInicio: string | null; // Formato YYYY-MM-DD
  fechaFin: string | null;    // Formato YYYY-MM-DD
}

export interface FilterCriteria {
  prioridad: FilterPriority;
  fecha: FilterDateCriteria;
  estado: FilterStatus;
}

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  prioridad: 'TODAS',
  fecha: {
    activo: false,
    tipo: 'PUNTUAL',
    fechaInicio: null,
    fechaFin: null,
  },
  estado: 'TODOS',
};
```

### 10.2 Motor de Evaluación Pura (`src/filters/utils/filterEngine.ts`)
```typescript
import { FilterCriteria } from '../types/filter.types';

export interface FilterableItem {
  id: string;
  prioridad?: 'alta' | 'media' | 'baja' | string;
  completado?: boolean;
  fechaProgramada?: Date | string | null;
  [key: string]: any;
}

export function isDateMatching(
  itemDateRaw: Date | string | null | undefined,
  criteria: FilterCriteria['fecha']
): boolean {
  if (!criteria.activo) return true;
  if (!itemDateRaw) return false;

  const itemDate = new Date(itemDateRaw);
  if (isNaN(itemDate.getTime())) return false;

  // Extraer cadena YYYY-MM-DD local o UTC coherente
  const itemIso = itemDate.toISOString().split('T')[0];

  if (criteria.tipo === 'PUNTUAL') {
    if (!criteria.fechaInicio) return true;
    return itemIso === criteria.fechaInicio;
  }

  if (criteria.tipo === 'RANGO') {
    if (!criteria.fechaInicio && !criteria.fechaFin) return true;
    if (criteria.fechaInicio && itemIso < criteria.fechaInicio) return false;
    if (criteria.fechaFin && itemIso > criteria.fechaFin) return false;
    return true;
  }

  return true;
}

export function evaluateItemFilter<T extends FilterableItem>(
  item: T,
  criteria: FilterCriteria
): boolean {
  // 1. Evaluación de Prioridad
  if (criteria.prioridad !== 'TODAS') {
    if (item.prioridad !== criteria.prioridad) {
      return false;
    }
  }

  // 2. Evaluación de Estado
  if (criteria.estado === 'SOLO_PENDIENTES' && item.completado) {
    return false;
  }
  if (criteria.estado === 'SOLO_COMPLETADAS' && !item.completado) {
    return false;
  }

  // 3. Evaluación de Fecha (AND)
  if (!isDateMatching(item.fechaProgramada, criteria.fecha)) {
    return false;
  }

  return true;
}

export function applyFilters<T extends FilterableItem>(
  items: T[],
  criteria: FilterCriteria
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => evaluateItemFilter(item, criteria));
}
```

### 10.3 Componente Modal (`src/filters/components/FilterModal.tsx`)
- Renderizado condicional basado en `isOpen`.
- Botones de selección para Prioridad (`Todas`, `Alta`, `Media`, `Baja`).
- Checkbox para conmutar `fecha.activo`.
- Radio buttons para `tipo: 'PUNTUAL'` o `tipo: 'RANGO'` cuando `fecha.activo === true`.
- Campos de fecha con validación visual si `fechaInicio > fechaFin`.
- Botones de selección para Estado (`Todos`, `Solo pendientes`, `Solo completadas`).
- Botones de acción: `[Cancelar]`, `[Limpiar Filtros]` y `[Aplicar Filtros]`.

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios (`filterEngine.test.ts`)
- `debería retornar true para cualquier item si los criterios están por defecto (TODAS, inactivo, TODOS)`.
- `debería filtrar estrictamente por prioridad (alta, media, baja)`.
- `debería filtrar por estado completado (SOLO_PENDIENTES descarta completados, SOLO_COMPLETADAS descarta pendientes)`.
- `debería filtrar por fecha puntual y descartar items sin fecha`.
- `debería filtrar por rango de fecha inclusivo`.
- `debería evaluar la conjunción lógica AND (Prioridad Alta AND Solo Pendientes AND Rango) descartando los que fallen una sola condición`.
- `debería no mutar el array original al aplicar applyFilters`.

### 11.2 Tests de Integración / UI (`FilterModal.test.tsx`)
- `debería no renderizar nada si isOpen es false`.
- `debería renderizar título, selectores y botones cuando isOpen es true`.
- `debería permitir cambiar la prioridad en el buffer de edición`.
- `debería desplegar los inputs de fecha al activar el checkbox de fecha`.
- `debería llamar a onClose sin invocar onApply al pulsar [Cancelar] o presionar Escape`.
- `debería restaurar los controles por defecto al pulsar [Limpiar Filtros]`.
- `debería invocar onApply con los criterios acumulados al pulsar [Aplicar Filtros] y cerrar`.
- `debería advertir visualmente si fechaInicio es posterior a fechaFin en modo rango`.

### 11.3 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores.
- `QG-02 · Linting y Compilación:` `npm run build` sin advertencias.
- `QG-03 · Test Suite:` 100% de tests en verde en Vitest (mínimo 195 tests pasando).
- `QG-04 · Anti-Drift Scan:` Cero cambios en entidades de dominio ni en los módulos de backend.
- `QG-05 · No-Secret Scan:` Cero credenciales ni tokens en los nuevos archivos.

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
    "FIA-A06.01"
  ],
  "latest_locked_fia": "FIA-A06.01",
  "architectural_decisions_applied": [
    "Motor de filtros combinados AND en cliente puro (Prioridad + Rango de Fechas + Estado)",
    "Buffer de edición desacoplado en FilterModal con descarte inofensivo ante Cancelar o tecla Escape",
    "Zero Scope Creep: cero persistencia en base de datos; filtros 100% reactivos en memoria"
  ],
  "unlocked_next": "FIA-A06.02 · Hook useItemFilters, Reactividad en Caliente y Botón [Limpiar Filtros]"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/filters/types/filter.types.ts",
    "src/filters/utils/filterEngine.ts",
    "src/filters/utils/filterEngine.test.ts",
    "src/filters/components/FilterModal.tsx",
    "src/filters/components/FilterModal.module.css",
    "src/filters/components/FilterModal.test.tsx"
  ],
  "files_modified": [
    "src/hub/components/HubContainer.tsx",
    "src/hub/components/HubContainer.module.css",
    "src/hub/components/HubContainer.test.tsx"
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
    "TasksAccordion",
    "ShoppingAccordion",
    "CleaningAccordion",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "filter_modal": "modal_accesible_con_evaluacion_and_y_buffer_desacoplado",
    "hub_toolbar": "boton_filtrar_integrado_en_hub_container"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. Todos los archivos listados en la sección 6.1 y 6.2 están implementados.
2. Ningún archivo de la sección 6.4 fue modificado.
3. Los 8 pasos del plan fueron ejecutados secuencialmente.
4. Los 5 Quality Gates pasaron limpiamente.
5. Se generaron `IMPLEMENTATION_REPORT_FIA-A06.01.md` y `TEST_REPORT_FIA-A06.01.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A06.01`. Queda terminantemente prohibido avanzar a `FIA-A06.02` en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir código de producción y valida el estado en rojo (`RED`).
- **Screaming Architecture:** Todo artefacto debe residir en `src/filters/`. Prohibido inventar carpetas cajón de sastre globales.
- **Parada Obligatoria:** Tras superar los Quality Gates, generar los reportes y redactar la propuesta de `LOCK-FIA-A06.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
