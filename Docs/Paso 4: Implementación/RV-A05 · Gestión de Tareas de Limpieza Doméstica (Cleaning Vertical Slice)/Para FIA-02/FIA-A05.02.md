# CENTRA-T · FIA-A05.02 · ACORDEÓN DE LIMPIEZA Y MODAL DE ALTA PERIÓDICA
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A05 (INTEGRACIÓN EN HUB, CHIPS SEMÁNTICOS POR ZONA Y MODAL DE CREACIÓN CON FRECUENCIA)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A05.02`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad Prevista:** `Acordeón de Limpieza y Modal de Alta Periódica`
- **PVF de Cierre Cubierta:** `PVF-A05.01 · Acordeón de Limpieza Organizado por Zonas y Frecuencias` y `PVF-A05.02 · Alta de Tarea de Limpieza con Asignación de Periodicidad`
- **VF Interna de Derivación:** `VF-A05.01 · Organización por Zonas y Frecuencias de Limpieza` y `VF-A05.02 · Creación de Tarea de Limpieza con Recurrencia`
- **Objetivo Indexado:** `Construir acordeón en Hub segmentado por zonas con chips semánticos y modal de alta con selector de zona y frecuencia de repetición.`
- **Validación Indexada:** `src/hub/components/CleaningAccordion.tsx` y `src/cleaning/components/CleaningCreationModal.tsx`
- **Evidencia de Cierre Indexada:** `Renderizado de tarjetas con distintivo temático de zona; envío del modal persiste correctamente la periodicidad.`
- **LOCK Previo Requerido:** `LOCK-FIA-A05.01.md APROBADO (Commit: 9ea99ca)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest los componentes de interfaz de usuario de limpieza doméstica para el Hub lateral de Centra-T:
1. **Componente `CleaningAccordion` (`src/hub/components/CleaningAccordion.tsx`):**
   - Acordeón colapsable ubicado en el panel lateral del Hub, conmutando su estado mediante clic y soporte de teclado (`Enter`, `Space`, `aria-expanded`).
   - **Cabecera con Telemetría de Limpieza:** Muestra el formato `Limpieza (${pendientes} pend / ${total} tot)`, badge contextual ámbar `${pendientes} pendientes` visible solo cuando `pendientes > 0`, y botón de acción directa `[+ Nueva Limpieza]`.
   - **Barra de Chips Semánticos por Zona:** Selector de filtro interactivo con chips temáticos: `'Todas'`, `'Cocina'` (esmeralda `#10b981`), `'Baño'` (cian `#06b6d4`), `'Salón'` (violeta `#8b5cf6`), `'General'` (slate `#64748b`). Al pulsar un chip, la lista se filtra en memoria de forma reactiva instantánea.
   - **Matriz de Estados Visuales:** Skeleton screen con 3 líneas parpadeantes durante la carga, Empty State sobrio con borde punteado cuando no hay tareas que coincidan con el filtro, y lista poblada con distintivos temáticos de zona, insignias de frecuencia (`semanal`, `quincenal`, etc.), próxima fecha sugerida y checkbox de completado.
   - **Montaje en Workspace:** Incorporación de `<CleaningAccordion />` en `src/App.tsx` dentro de `<HubContainer>`, completando la tríada de acordeones del Hub (Tareas, Compra, Limpieza).
2. **Componente `CleaningCreationModal` (`src/cleaning/components/CleaningCreationModal.tsx`):**
   - Modal flotante accesible (`role="dialog"`, `aria-modal="true"`) para la captura ágil de nuevas tareas de limpieza periódica.
   - Campos estructurados: input de nombre con recorte y límite estricto de 120 caracteres (**Decisión 2B innegociable**), selector de Zona obligatoria (`'cocina'`, `'baño'`, `'salon'`, `'general'`), selector de Frecuencia de repetición obligatoria (`'diaria'`, `'semanal'`, `'quincenal'`, `'mensual'`), y selector de fecha opcional (validado no en el pasado - **Decisión 1A**).
   - Botones `[Guardar Tarea]` (submit) y `[Cancelar]` (cierre y descarte con **rollback a cero garantizado** al pulsar Cancelar, clic en backdrop o tecla `Escape`).

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/hub/components/CleaningAccordion.tsx` y su hoja de estilos `CleaningAccordion.module.css`.
  - Creación de `src/hub/components/CleaningAccordion.test.tsx` (7 tests unitarios y de integración).
  - Creación de `src/cleaning/components/CleaningCreationModal.tsx` y su hoja de estilos `CleaningCreationModal.module.css`.
  - Creación de `src/cleaning/components/CleaningCreationModal.test.tsx` (6 tests unitarios).
  - Modificación de `src/App.tsx` para inyectar `<CleaningAccordion />` en `HubContainer`.
  - Preservación íntegra de los 147 tests previos (mínimo 160 tests globales en verde tras la incorporación).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Componente de tarjeta interactiva con temporizador y etiqueta informativa 'Completada: Hoy · Próxima en N días' (`CleaningTaskCard.tsx` pertenece a `FIA-A05.03`).
  - Arrastre HTML5 Drag & Drop entre tareas de limpieza y el calendario (`RV-A07`).
  - Modificación de contratos de endpoints backend de limpieza (fijados y certificados en `FIA-A05.01`).

### 4. Dependencias
- **Documentales:**
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx` (Fichas RV-A05 / FIA-A05.02).
  - `SUITE_ARQUITECTURA_UI.docx` (Layout Hub, Acordeón de Limpieza, Chips de Zona, Modal).
  - `SUITE_ARQUITECTURA_CORE.docx` (Módulo Screaming `src/cleaning/*`).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:**
  - React 19.x, React-DOM 19.x.
  - TypeScript 5.7 (Modo estricto).
  - CSS Modules nativos de Vite.
  - Vitest 3.2.7 + `@testing-library/react` 16.3.2 + `@testing-library/user-event` 14.6.1.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere el LOCK formal de `FIA-A05.01` (Aprobado).
  - *Posterior:* Desbloquea `FIA-A05.03 · Conmutación de Limpieza y Timestamp de Ejecución`.

### 5. Contratos Afectados
- **Contrato de Interfaz `CleaningAccordionProps`:**
  ```typescript
  export interface CleaningAccordionProps {
    items?: CleaningItem[];
    cleaningService?: CleaningService;
    userId?: string;
    initialExpanded?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onToggleExpand?: (expanded: boolean) => void;
    onItemCreated?: (item: CleaningItem) => void;
    onItemToggle?: (itemId: string) => void;
    onRetry?: () => void;
  }
  ```
- **Contrato de Interfaz `CleaningCreationModalProps`:**
  ```typescript
  export interface CleaningCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateCleaningItemDto) => void | Promise<void>;
    isLoading?: boolean;
  }
  ```

### 6. Restricciones
- Decisión 2B innegociable: el nombre de la tarea en el modal está acotado estrictamente a un máximo de 120 caracteres mediante `maxLength={120}` y saneamiento con `.trim()`.
- Rollback a cero garantizado: si el usuario introduce datos en el modal y pulsa Cancelar, ESC o backdrop, el modal se cierra y el formulario se reinicia por completo sin mutar el estado.
- Cero librerías externas de UI: componentes, modales y chips construidos con CSS Modules nativos.
- Accesibilidad WCAG AA: semántica ARIA, `role="dialog"`, `role="button"`, foco por teclado y etiquetas accesibles.

### 7. Diseño Técnico
- **Ubicación Física:** `src/hub/components/CleaningAccordion.*` y `src/cleaning/components/CleaningCreationModal.*`
- **Jerarquía y Estructura en Hub:**
  ```text
  HubContainer
    ├── TasksAccordion (Tareas Generales)
    ├── ShoppingAccordion (Compra Semanal)
    └── CleaningAccordion (Limpieza Doméstica)
          ├── Header (Telemetría X pend / Y tot + Pending Badge + Botón [+ Nueva Limpieza])
          ├── ContentArea (Expandible)
          │     ├── ZoneChipsBar (Todas | Cocina | Baño | Salón | General)
          │     ├── Skeleton / Error / Empty State
          │     └── CleaningList (Filtrada por zona activa)
          └── CleaningCreationModal (Portal / Modal Dialog)
  ```

### 8. Flujo Operativo
1. El usuario visualiza en el panel lateral del Hub el acordeón de Limpieza Doméstica con su telemetría actualizada.
2. Al pulsar sobre cualquier chip de zona ('Cocina', 'Baño', etc.), la lista de tareas se filtra instantáneamente en memoria.
3. El usuario pulsa sobre el botón `[+ Nueva Limpieza]`; el clic detiene la propagación para evitar replegar el acordeón y abre el modal `CleaningCreationModal`.
4. El foco se sitúa en el campo de texto; el usuario introduce el nombre de la tarea, selecciona la zona del hogar en el selector desplegable y la frecuencia de repetición deseada ('diaria', 'semanal', 'quincenal', 'mensual').
5. Al pulsar `[Guardar Tarea]` (o Enter), el modal valida el formulario, emite la creación y se cierra. La nueva tarea aparece en la lista de limpieza y la telemetría del acordeón actualiza su conteo.
6. Si el usuario pulsa `[Cancelar]` o la tecla `Escape`, el modal se cierra de inmediato y todos los campos se descartan limpiamente sin persistir datos.

### 9. Casos Válidos (Happy Path)
- **V-01 (Telemetría de Limpieza):** Renderiza la cabecera mostrando `Limpieza (${pendientes} pend / ${total} tot)` y el badge `${pendientes} pendientes`.
- **V-02 (Colapso y Expansión):** Clic en cabecera conmuta `aria-expanded` y oculta/muestra el contenido.
- **V-03 (Filtrado Reactivo por Chips):** Pulsar chip 'Cocina' muestra únicamente tareas de cocina; pulsar 'Todas' restablece la visualización completa.
- **V-04 (Apertura de Modal):** Clic en `[+ Nueva Limpieza]` abre el modal sin colapsar el acordeón (`stopPropagation`).
- **V-05 (Creación Exitosa desde Modal):** Introducir nombre válido, zona 'baño', frecuencia 'quincenal' y guardar -> Cierra modal y agrega la tarea al acordeón.
- **V-06 (Rollback a Cero en Cancelar/ESC):** Modificar campos en modal y pulsar Cancelar o Escape -> Cierra modal y limpia campos sin mutar el acordeón.

### 10. Casos Inválidos y Manejo de Errores
- **I-01 (Nombre Vacío en Modal):** Intentar guardar con campo de nombre vacío -> Bloquea el envío y muestra mensaje de validación.
- **I-02 (Exceso de Caracteres):** Nombre mayor a 120 caracteres -> Bloqueado en frontera por `maxLength={120}`.
- **I-03 (Empty State de Filtro):** Seleccionar una zona sin tareas registradas -> Muestra Empty State sobrio indicando que no hay tareas en esa zona.
- **I-04 (Error de Carga):** Ante fallo del servicio -> Despliega alerta contextual con botón [Reintentar].

### 11. Tests Requeridos
- **Suite `CleaningCreationModal.test.tsx` (6 tests unitarios):**
  1. Renderizado accesible del diálogo modal (`role="dialog"`, inputs de nombre, selectores de zona y frecuencia, botones).
  2. Envío exitoso con payload validado (`CreateCleaningItemDto`) al pulsar Guardar.
  3. Bloqueo de envío ante nombre vacío o compuesto exclusivamente por espacios.
  4. Respeto innegociable a la Decisión 2B (`maxLength={120}`).
  5. Cierre y rollback a cero al pulsar el botón `[Cancelar]`.
  6. Cierre y rollback a cero al presionar la tecla `Escape`.
- **Suite `CleaningAccordion.test.tsx` (7 tests unitarios y de integración):**
  1. Renderizado de cabecera con ratio exacto de tareas pendientes/totales y badge destacado.
  2. Conmutación de colapso y expansión al hacer clic en la cabecera.
  3. Filtrado reactivo de tareas al seleccionar chips de zona ('Cocina', 'Baño', 'Todas').
  4. Renderizado del Skeleton Screen (3 líneas) cuando `isLoading=true`.
  5. Renderizado de Empty State sobrio cuando no hay tareas disponibles.
  6. Apertura del modal al hacer clic en `[+ Nueva Limpieza]` sin colapsar el acordeón.
  7. Incorporación de nueva tarea creada en el modal e incremento de los contadores de la cabecera.

### 12. Quality Gates (QG-FIA-A05.02)
- `QG-FIA-A05.02-01 · Typecheck:` 0 errores en TypeScript estricto (`tsc --noEmit`).
- `QG-FIA-A05.02-02 · Linting:` 0 warnings.
- `QG-FIA-A05.02-03 · Tests Suite:` 100% de tests en verde (mínimo 160 tests pasando en Vitest).
- `QG-FIA-A05.02-04 · Ergonomía y Chips de Zona:` Verificación del filtrado reactivo y apertura de modal.
- `QG-FIA-A05.02-05 · Accesibilidad WCAG AA:` Modal con semántica ARIA, soporte de teclado (`ESC`, `Tab`) y contraste en chips.

### 13. Definition of Done (DoD)
La unidad táctica **FIA-A05.02** se considerará completada y lista para LOCK si y solo si:
1. `CleaningAccordion` y `CleaningCreationModal` están implementados y probados.
2. `<CleaningAccordion />` está montado en `src/App.tsx` completando la tríada del Hub.
3. Las 2 nuevas suites suman 13 tests en verde (160 tests globales pasando en Vitest).
4. Los 5 Quality Gates son superados satisfactoriamente.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A05.02.md`, `TEST_REPORT_FIA-A05.02.md` y `LOCK-FIA-A05.02.md`.
