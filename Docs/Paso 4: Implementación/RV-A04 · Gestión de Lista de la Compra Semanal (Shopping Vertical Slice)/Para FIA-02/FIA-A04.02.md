# CENTRA-T · FIA-A04.02 · ACORDEÓN DE COMPRA CON TELEMETRÍA E INPUT RÁPIDO
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A04 (SUPERFICIE DE COMPRA EN HUB CON TELEMETRÍA E INPUT RÁPIDO)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A04.02`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Prevista:** `Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido`
- **PVF de Cierre Cubiertas:** 
  - `PVF-A04.01 · Acordeón de Compra con Telemetría Comprados / Totales`
  - `PVF-A04.02 · Adición Rápida Inline de Ítem de Compra`
- **VF Internas de Derivación:** 
  - `VF-A04.01 · Estructura de Acordeón y Telemetría de Compra`
  - `VF-A04.02 · Adición Rápida Inline de Ítems de Compra`
- **Objetivo Indexado:** `Construir acordeón en Hub con cabecera de conteo '(Comprados/Total)', badge destacado de pendientes e input inline en el pie para adición ágil con tecla Enter.`
- **Validación Indexada:** `src/hub/components/ShoppingAccordion.tsx` y `src/shopping/components/QuickItemInput.tsx`
- **Evidencia de Cierre Indexada:** `Escribir nombre y presionar Enter crea el ítem en <100ms y conserva el foco en el input para adición continua sin fricción.`
- **LOCK Previo Requerido:** `LOCK-FIA-A04.01.md APROBADO (Commit: 104022b)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar exhaustivamente con TDD en `@testing-library/react` y Vitest el componente `ShoppingAccordion` en `src/hub/components/ShoppingAccordion.tsx` (con sus estilos encapsulados en `ShoppingAccordion.module.css`) y el componente atómico de entrada rápida `QuickItemInput` en `src/shopping/components/QuickItemInput.tsx`, integrándolos en la columna lateral del Hub:
1. **Cabecera con Telemetría en Tiempo Real (`PVF-A04.01`):**
   - Título con ratio dinámico: `Compra Semanal (${comprados}/${total})` o `Compra (${comprados}/${total})`.
   - Badge numérico destacado con los productos pendientes de compra: ej. `N pendientes` o `[N]`, con código visual diferenciado cuando hay compras por realizar.
   - Indicador de chevron interactivo (`▼` expandido, `►` colapsado) con transición suave y accesibilidad WCAG AA (`role="button"`, `aria-expanded`).
   - Icono o agarrador para arrastre en bloque (drag handle preparatorio para RV-A07).
2. **Matriz de Estados UI en el Cuerpo del Acordeón:**
   - **Loading:** Skeleton Screen de 3 líneas con efecto shimmer (sin spinners a pantalla completa).
   - **Empty State:** Contenedor sobrio con borde discontinuo (`1px dashed #233144`), icono ilustrativo de cesta de la compra y mensaje *"No hay productos en la lista de compra"*.
   - **Populated List:** Lista accesible (`<ul role="list">`) renderizando los productos de compra con checkbox interactivo, nombre del ítem, cantidad y unidad (ej. `2 l`, `1 ud`) y tachado visual (`line-through`) en los ya comprados.
3. **Control de Adición Rápida Inline (`QuickItemInput` - `PVF-A04.02`):**
   - Ubicado permanentemente en el pie del cuerpo del acordeón.
   - Consta de: input de texto para el nombre (máx 120 caracteres - Decisión 2B), selector/input numérico de cantidad (default 1) y unidad (default `'ud'`).
   - **Comportamiento Ágil sin Fricción:** Al presionar la tecla `Enter`:
     - Valida que el nombre no esté en blanco.
     - Despacha la creación mediante `shoppingService.createItem(userId, { nombre, cantidad, unidad })`.
     - Inserta de inmediato el nuevo producto en la lista en menos de 100ms.
     - Limpia el campo de texto y **mantiene el foco del cursor en el input** (`inputRef.current?.focus()`), permitiendo la entrada consecutiva y rápida de múltiples productos.
4. Conexión con `ShoppingService` por `userId` y montaje en `HubContainer` en `App.tsx`.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/hub/components/ShoppingAccordion.tsx`.
  - Creación de `src/hub/components/ShoppingAccordion.module.css`.
  - Creación de `src/hub/components/ShoppingAccordion.test.tsx`.
  - Creación de `src/shopping/components/QuickItemInput.tsx`.
  - Creación de `src/shopping/components/QuickItemInput.module.css`.
  - Creación de `src/shopping/components/QuickItemInput.test.tsx`.
  - Montaje de `ShoppingAccordion` junto a `TasksAccordion` en el `HubContainer` de `src/App.tsx`.
  - Verificación del 100% de la suite global en verde en Vitest (mínimo 126-128 tests totales pasando).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Modo Compra Activa y sección secundaria colapsable 'Comprados' (`ShoppingItemList.tsx` pertenece a `FIA-A04.03`).
  - Arrastre masivo mediante HTML5 Drag & Drop hacia las casillas del calendario mensual (`RV-A07`).
  - Módulos de limpieza (`RV-A05`).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología de Hub, Matriz de 5 Estados, Tokens y badges).
  - `09_CENTRA_T_VISUAL_STATES.docx` (Matriz EV-LIST-01 a EV-LIST-05).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 3: Hub y Acordeones).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Filas PVF-A04.01 y PVF-A04.02).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A04.02).
  - `FIA-A04.01_AS_BUILT.md` (Motor backend de shopping operativo y bloqueado con commit `104022b`).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A04.01` (Aprobado en commit `104022b`).
  - *Posterior:* Desbloquea `FIA-A04.03 · Modo Compra Activa y Sección Comprados`.

### 5. Contratos Afectados
- **Contrato de Interfaz (`ShoppingAccordionProps`):**
  ```typescript
  export interface ShoppingAccordionProps {
    items?: ShoppingItem[];
    shoppingService?: ShoppingService;
    userId?: string;
    initialExpanded?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onToggleExpand?: (expanded: boolean) => void;
    onItemCreated?: (item: ShoppingItem) => void;
    onItemToggle?: (itemId: string) => void;
    onRetry?: () => void;
  }
  ```
- **Contrato de Interfaz (`QuickItemInputProps`):**
  ```typescript
  export interface QuickItemInputProps {
    onAddItem: (dto: { nombre: string; cantidad: number; unidad: string }) => Promise<void> | void;
    disabled?: boolean;
    autoFocus?: boolean;
  }
  ```
- **Contrato de Accesibilidad:** `role="button"`, `aria-expanded`, `<ul role="list">`, etiquetas `aria-label` en checkboxes e inputs.

### 6. Restricciones
- **Telemetría Exacta:** La cabecera debe reflejar de forma reactiva el formato `(${comprados}/${total})` y el badge numérico exacto de pendientes `total - comprados`.
- **Adición en Ráfaga sin Fricción:** Al pulsar Enter, el ítem se crea, el campo de nombre se vacía y el foco del teclado debe mantenerse estrictamente en el input.
- **Frontera Decisión 2B:** El input de nombre no admite más de 120 caracteres.
- **Prohibición de Spinners a Pantalla Completa:** Carga exclusiva mediante Skeleton local de 3 líneas.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/hub/components/ShoppingAccordion.tsx` y `src/shopping/components/QuickItemInput.tsx`.
- **Estructura Interna:**
  - `isExpanded`: Controla la apertura del acordeón de compra en el Hub.
  - `items`: Estado local de productos de compra sincronizado con props o cargado por `shoppingService`.
  - `QuickItemInput`: Formulario en el pie del acordeón con inputs empáticos y captura del evento `Enter`.
- **Fronteras Físicas Autorizadas:** Directorio `src/hub/components/*` y `src/shopping/components/*`.

### 8. Flujo Operativo
1. El usuario visualiza el Hub: se montan tanto `TasksAccordion` como `ShoppingAccordion`.
2. `ShoppingAccordion` muestra en cabecera `Compra Semanal (X/Y)` y badge de pendientes.
3. El usuario pulsa la cabecera para expandir/colapsar el acordeón.
4. En el pie del acordeón, el usuario escribe "Plátanos", especifica cantidad "1.5 kg" y presiona `Enter`.
5. El producto se crea en < 100ms, se añade al listado, el contador de la cabecera se actualiza y el foco permanece en el input listo para teclear el siguiente producto.
6. Al marcar el checkbox de un producto, conmuta a comprado, el texto se tacha y la telemetría actualiza el ratio `(X+1/Y)`.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Telemetría reactiva):** Lista con 2 comprados y 3 pendientes muestra `Compra Semanal (2/5)` y badge `3 pendientes`.
- **Caso 2 (Adición rápida con Enter):** Teclear "Leche" y pulsar `Enter` añade el ítem, limpia el input y conserva el foco.
- **Caso 3 (Toggle comprado):** Clic en checkbox tacha el ítem e incrementa el contador de comprados en la cabecera.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Enter con texto en blanco):** No emite creación ni altera la lista.
- **Caso Inválido 2 (Error en el servicio de compras):** Muestra banner inline de error con botón `[Reintentar]`.

### 11. Tests Requeridos
- **Tests de `QuickItemInput.test.tsx`:**
  1. Renderizado de campos de nombre, cantidad y unidad.
  2. Invocación de `onAddItem` al presionar `Enter` con datos válidos.
  3. Limpieza del input de texto tras envío exitoso.
  4. **Retención ininterrumpida del foco:** El input conserva el foco tras pulsar `Enter`.
  5. Bloqueo de envío si el nombre está vacío.
- **Tests de `ShoppingAccordion.test.tsx`:**
  1. Renderizado de cabecera con ratio exacto `Compra Semanal (X/Y)` y badge de pendientes.
  2. Alternancia de colapso y expansión (`aria-expanded`).
  3. Renderizado de Skeleton Screen cuando `isLoading = true`.
  4. Renderizado de Empty State sobrio cuando no hay productos.
  5. Lista poblada con checkboxes, nombres, cantidades y tachado en comprados.
  6. Conmutación reactiva de ítems y actualización de telemetría.
  7. Adición de producto desde el `QuickItemInput` integrado e incremento de contadores.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 126-128 tests globales pasando).

### 12. Quality Gates (QG-FIA-A04.02)
- `QG-FIA-A04.02-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A04.02-02 · Tests Suite:` 100% de tests en verde en todo el proyecto (mínimo 126 tests pasando).
- `QG-FIA-A04.02-03 · Telemetría Comprobada:` Pruebas unitarias de contadores reactivos en verde.
- `QG-FIA-A04.02-04 · Adición en Ráfaga Verificada:` Test de retención de foco en input rápido en verde.
- `QG-FIA-A04.02-05 · Cero Regresiones:` Los 115 tests previos continúan en verde sin alteraciones.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `ShoppingAccordion` y `QuickItemInput` están implementados y estilizados con diseño Centra-T.
2. La telemetría reactiva `(X/Y)` y el badge de pendientes funcionan en tiempo real.
3. La adición rápida con Enter incorpora el producto en <100ms y conserva el foco en el input.
4. El 100% de los tests del proyecto (mínimo 126 tests) pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A04.02.md`, `TEST_REPORT_FIA-A04.02.md` y la propuesta formal de `LOCK-FIA-A04.02.md`.
