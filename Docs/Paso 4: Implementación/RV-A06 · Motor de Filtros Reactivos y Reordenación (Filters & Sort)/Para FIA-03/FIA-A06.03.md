# CENTRA-T · FIA-A06.03 · PANEL DE REORDENACIÓN Y MOTOR DE ORDENACIÓN MULTINIVEL

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A06 (MOTOR DETERMINISTA MULTINIVEL, MENÚ REORDENAR Y CIERRE DE REBANADA)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A06.03`
- **Rebanada Vertical:** `RV-A06 · Motor de Filtros Reactivos y Reordenación (Filters & Sort)`
- **Unidad Prevista:** `Panel de Reordenación y Motor de Ordenación Multinivel`
- **PVF de Cierre Cubierta:** `PVF-A06.03 · Panel de Reordenación Multinivel y Desempate Determinista (Botón [Reordenar])`
- **VF Interna de Derivación:** `VF-A06.03 · Reordenación Multinivel y Desempate Determinista`
- **Objetivo Indexado:** `Construir componente activado por el botón [Reordenar] y motor puro sortEngine (por Fecha, Prioridad o Alfabético) con desempate determinista por createdAt ASC.`
- **Validación Indexada:** [`src/filters/components/SortMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.tsx) y [`src/filters/utils/sortEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.ts)
- **Evidencia de Cierre Indexada:** `100% de cobertura en tests unitarios con arrays de elementos desordenados y emparejados garantizando orden estricto.`
- **LOCK Previo Requerido:** `LOCK-FIA-A06.02.md APROBADO (FIA-A06.02_AS_BUILT.md)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Diseñar, implementar y verificar con TDD el motor determinista de ordenación multinivel ([`sortEngine.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.ts)) y el componente de interfaz [`SortMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.tsx) desplegable mediante el botón `[Reordenar]` en el Hub:
1. **Motor de Ordenación Multinivel Determinista:**
   - Permite organizar las listas activas por **Prioridad** (Alta a Baja / Baja a Alta), **Fecha de Ejecución** (Más cercana / Más lejana), **Alfabético** (A-Z / Z-A) o **Estado** (Pendientes primero / Realizadas primero).
   - **Regla Innegociable de Desempate Determinista:** Si dos o más elementos empatan en el criterio principal, se aplica desempate secundario por fecha más cercana (`fechaProgramada ASC`). Si el empate persiste o ambos carecen de fecha, se aplica desempate definitivo por fecha de creación cronológica ([`createdAt ASC`](file:///home/hnoloh/Escritorio/Gestor%20de%20Tareas/Paso%203:%20Agente%20Docuementador/Fase%202:%20Generaci%C3%B3n%20de%20%C3%8Dndices%20de%20Implementaci%C3%B3n%20(TDD%20Arquitect%C3%B3nico)/CENTRA-T_INDICE_RV_FIA.docx)). Esto erradica el parpadeo de elementos oscilantes.
   - **Regla Nulls Last en Fechas:** En cualquier ordenación temporal, los ítems sin fecha programada (`null` o `undefined`) se posicionan obligatoriamente al final de la colección.
2. **Componente de Interfaz `SortMenu`:** Menú popover accesible montado en capa flotante, con indicador visual del criterio activo, soporte para navegación por teclado, cierre con tecla `Escape` o clic fuera del elemento.
3. **Cierre de Rebanada Vertical:** Al ser la tercera y última unidad de **RV-A06**, su sellado formal completará y clausurará la rebanada vertical, autorizando el desbloqueo de **`RV-A07 · Calendario Mensual Interactivo y Drag & Drop`**.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Contratos de ordenación en [`src/filters/types/sort.types.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/types/sort.types.ts) (`SortField`, `SortDirection`, `SortConfiguration`).
  - Función pura de ordenación inmutable [`sortItems<T>(items, config): T[]`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.ts) con desempate multinivel estricto.
  - Componente accesible [`src/filters/components/SortMenu.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.tsx) y estilos [`SortMenu.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.module.css).
  - Integración del botón accesible `[Reordenar]` en la barra de herramientas del Hub ([`HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx)) junto al botón `[Filtrar]`.
  - Suites de pruebas unitarias al 100% de cobertura en [`sortEngine.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/utils/sortEngine.test.ts) y pruebas RTL en [`SortMenu.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/filters/components/SortMenu.test.tsx).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Arrastre interactivo de elementos entre Hub y Calendario (Drag & Drop asignado a `RV-A07`).
  - Persistencia de la ordenación en base de datos (capacidad 100% de cliente en memoria).
  - Modificación de contratos de datos de tareas, compra o limpieza.

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Module Map - Subsistema filters_and_sort).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 06: Botones Secundarios del Hub [Filtrar] y [Reordenar]).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 5.2: Proceso `Reordenar_Lista_Multinivel`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A06.03 y VF-A06.03).
  - `FIA-A06.02_AS_BUILT.md` (Estado físico sellado previo).
- **Tecnológicas Autorizadas:**
  - React 18/19, TypeScript 5.x estricto, CSS Modules puros, Vitest 3.2.7 y `@testing-library/react`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere el LOCK formal de `FIA-A06.02` (Sellado con 226 tests en verde).
  - *Posterior:* El sellado de esta FIA certifica el cierre definitivo de **RV-A06** y habilita la apertura de **`RV-A07` -> `FIA-A07.01`**.

### 5. Contratos Afectados
- **Contrato Funcional (PVF-A06.03 / VF-A06.03):**
  - Reorganización determinista en memoria de las listas activas.
  - Resolución de colisiones mediante desempate determinista secundario y terciario.
- **Contrato de Dominio / Tipos:**
  ```typescript
  export type SortField = 'PRIORIDAD' | 'FECHA' | 'ALFABETICO' | 'ESTADO';
  export type SortDirection = 'ASC' | 'DESC';

  export interface SortConfiguration {
    field: SortField;
    direction: SortDirection;
  }

  export const DEFAULT_SORT_CONFIG: SortConfiguration = {
    field: 'PRIORIDAD',
    direction: 'DESC', // Alta a Baja por defecto
  };
  ```

### 6. Restricciones
- Determinismo absoluto: dos elementos idénticos en prioridad y fecha deben ordenarse de forma fija y predecible mediante `createdAt ASC`.
- Nulls Last: en ordenación por fecha, los elementos con `fechaProgramada === null` se sitúan siempre después de los elementos con fecha asignada, independientemente de si la dirección es `ASC` o `DESC`.
- Inmutabilidad innegociable: `sortItems` no muta el array de entrada (debe clonar con `[...items]`).
- Screaming Architecture: Artefactos alojados en `src/filters/`.

### 7. Diseño Técnico
- **Ponderaciones Canónicas:**
  - Prioridad: `alta = 3`, `media = 2`, `baja = 1`.
  - Estado: `incompleto = 0`, `completado = 1`.
- **Algoritmo de Comparación Multinivel (`sortEngine.ts`):**
  ```typescript
  export function compareItems<T extends SortableItem>(
    a: T,
    b: T,
    config: SortConfiguration
  ): number {
    let diff = 0;
    // 1. Criterio Principal
    if (config.field === 'PRIORIDAD') {
      diff = (PRIORITY_WEIGHT[b.prioridad] || 0) - (PRIORITY_WEIGHT[a.prioridad] || 0);
      if (config.direction === 'ASC') diff = -diff;
    } else if (config.field === 'FECHA') {
      diff = compareDatesNullsLast(a.fechaProgramada, b.fechaProgramada, config.direction);
    } else if (config.field === 'ALFABETICO') {
      diff = (a.titulo || '').localeCompare(b.titulo || '');
      if (config.direction === 'DESC') diff = -diff;
    } else if (config.field === 'ESTADO') {
      const stateA = a.completado ? 1 : 0;
      const stateB = b.completado ? 1 : 0;
      diff = config.direction === 'ASC' ? stateA - stateB : stateB - stateA;
    }

    // 2. Desempate Secundario (Fecha Programada ASC si ambas existen)
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
  ```
- **Componente `SortMenu.tsx`:**
  - Renderiza botón disparador `[Reordenar]` en el Hub y un menú flotante con las opciones:
    - *Prioridad: Alta a Baja* (Default)
    - *Prioridad: Baja a Alta*
    - *Fecha: Más cercana primero*
    - *Fecha: Más lejana primero*
    - *Nombre: A - Z*
    - *Nombre: Z - A*
    - *Estado: Pendientes primero*
    - *Estado: Completadas primero*
  - Marca la opción activa con un glifo de verificación `✓` y atributo `aria-selected="true"`.

### 8. Flujo Operativo
1. El usuario hace clic en el botón `[Reordenar]` en la barra de control del Hub lateral.
2. Se abre el popover `SortMenu` desplegando las opciones de ordenación.
3. El usuario pulsa una opción (por ejemplo, *Fecha: Más cercana primero*).
4. El componente invoca `onSortChange(newConfig)`.
5. La lista activa se reorganiza en memoria mediante `sortItems(items, newConfig)` (<16ms).
6. El menú se cierra automáticamente y el orden visual en pantalla se estabiliza de forma determinista.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Prioridad Alta a Baja):** Ítems ordenados Alta (3) -> Media (2) -> Baja (1). Empates desempatados deterministamente por `createdAt ASC`.
- **Caso 2 (Fecha ASC con Nulls Last):** Tareas con fechas `2026-10-01`, `2026-10-05` aparecen primero cronológicamente; tareas sin fecha (`null`) se sitúan al final.
- **Caso 3 (Alfabético A-Z y Z-A):** Títulos ordenados alfabéticamente respetando tildes y caracteres especiales mediante `localeCompare`.
- **Caso 4 (Estado Pendientes Primero):** `completado === false` antes que `completado === true`.
- **Caso 5 (Cierre Inofensivo):** Clic en el backdrop o pulsar tecla `Escape` cierra el menú sin alterar la configuración activa.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Array Vacío o Monoelemento):** `sortItems([])` o `sortItems([item])` retorna una copia segura sin alterar la estructura.
- **Caso Inválido 2 (Propiedades Nulas o Malformadas):** Ítems sin título o con fechas inválidas son tolerados defensivamente sin arrojar excepciones de runtime.

### 11. Tests Requeridos
- **Suite de Motor Puro (`sortEngine.test.ts`):**
  - Ordenación por prioridad en ambas direcciones.
  - Ordenación por fecha con garantía `nulls last`.
  - Ordenación alfabética y por estado.
  - Validación del desempate secundario y terciario (`createdAt ASC`).
  - Inmutabilidad del array original.
- **Suite de Interfaz (`SortMenu.test.tsx`):**
  - Renderizado del botón `[Reordenar]`.
  - Apertura y cierre del popover.
  - Selección de opciones y emisión del evento `onSortChange`.
  - Soporte de tecla `Escape` y accesibilidad de teclado.

### 12. Quality Gates (QG-FIA-A06.03)
- `QG-FIA-A06.03-01 · Compilación y Tipado:` `tsc --noEmit` superado sin errores de tipado.
- `QG-FIA-A06.03-02 · Tests Unitarios y de Integración:` 100% de tests en verde (mínimo 226 + nuevos tests).
- `QG-FIA-A06.03-03 · Anti-Scope Creep:` Cero persistencia en BD; ordenación 100% en cliente.
- `QG-FIA-A06.03-04 · Verificación Funcional:` Comportamiento observable alineado con `PVF-A06.03 / VF-A06.03`.

### 13. Definition of Done (DoD)
La unidad se considerará completada y la rebanada vertical **RV-A06** clausurada si y solo si:
1. `sort.types.ts`, `sortEngine.ts`, `SortMenu.tsx` y sus estilos están implementados.
2. Los 4 Quality Gates están superados con 100% de tests en verde.
3. Se emiten el `IMPLEMENTATION_REPORT_FIA-A06.03.md` y `TEST_REPORT_FIA-A06.03.md`.
4. Se emite el certificado `LOCK-FIA-A06.03.md` decretando el **CIERRE TOTAL DE RV-A06**.
