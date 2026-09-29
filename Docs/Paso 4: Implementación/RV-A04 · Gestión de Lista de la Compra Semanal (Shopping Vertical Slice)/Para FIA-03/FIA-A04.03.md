# CENTRA-T · FIA-A04.03 · MODO COMPRA ACTIVA Y SECCIÓN SECUNDARIA COLAPSABLE 'COMPRADOS'
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A04 (CIERRE COMPLETO DEL VERTICAL SLICE DE COMPRA)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A04.03`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Prevista:** `Modo Compra Activa y Sección Secundaria Colapsable 'Comprados'`
- **PVF de Cierre Cubierta:** `PVF-A04.03 · Modo Compra Activa y Separación de Ítems Comprados`
- **VF Interna de Derivación:** `VF-A04.03 · Separación Automática de Ítems Comprados`
- **Objetivo Indexado:** `Implementar lista interactiva de compra: marcar ítem como comprado lo desplaza automáticamente a una subsección colapsable 'Comprados' al pie de la lista.`
- **Validación Indexada:** `src/shopping/components/ShoppingItemList.tsx`
- **Evidencia de Cierre Indexada:** `Marcado de ítems actualiza contadores reactivos y separa visualmente los pendientes de los adquiridos en tienda.`
- **LOCK Previo Requerido:** `LOCK-FIA-A04.02.md APROBADO (Commits: c0a80bf, ec453de)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar con TDD en Vitest el componente interactivo `ShoppingItemList` (`src/shopping/components/ShoppingItemList.tsx`), sus estilos dedicados y su integración dentro de `ShoppingAccordion.tsx`, materializando el **Modo Compra Activa** para una experiencia ágil y sin fricción durante la compra en tienda física:
1. **Separación Visual en Dos Secciones:**
   - **Lista Principal Activa (Pendientes):** Muestra los productos aún no adquiridos (`comprado === false`). Es la lista prioritaria y visualmente dominante.
   - **Subsección Secundaria Colapsable al Pie ('Comprados'):** Agrupa los productos marcados como adquiridos (`comprado === true`). Cuenta con una barra/cabecera colapsable que indica `Comprados (${comprados.length})`, chevron animado y estilos visuales atenuados con tachado (`line-through`).
2. **Traslado Automático Inmediato (< 16ms):** Al pulsar sobre el checkbox de un producto pendiente, este abandona la lista activa y se reubica automáticamente en la subsección inferior de 'Comprados', despejando el campo visual para que el usuario se centre exclusivamente en lo que resta por comprar.
3. **Reversibilidad Instantánea:** Al desmarcar un producto dentro de 'Comprados', este regresa de inmediato a la lista activa de pendientes.
4. **Ocultamiento Condicional Inteligente:** Si no hay productos comprados (`comprados.length === 0`), la subsección 'Comprados' no se muestra en la interfaz para no generar ruido visual innecesario.
5. **Cierre de Rebanada Vertical RV-A04:** Conectar `ShoppingItemList` dentro de `ShoppingAccordion.tsx` garantizando el 100% de retrocompatibilidad con las pruebas unitarias y de integración existentes.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/shopping/components/ShoppingItemList.tsx`.
  - Creación de `src/shopping/components/ShoppingItemList.module.css`.
  - Creación de `src/shopping/components/ShoppingItemList.test.tsx` (mínimo 6 tests unitarios).
  - Actualización limpia de `src/hub/components/ShoppingAccordion.tsx` delegando la lista en `ShoppingItemList`.
  - Preservación inalterada de todos los tests previos (mínimo 134 tests globales en verde tras la incorporación).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Asignación masiva al calendario mediante HTML5 Drag & Drop (`RV-A07 · Interacciones Avanzadas y Drag & Drop`).
  - Módulo de tareas de limpieza doméstica (`RV-A05`).
  - Modificación de contratos de endpoints backend de shopping (fijados y certificados en `FIA-A04.01`).

### 4. Dependencias
- **Documentales:**
  - `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx` (Fichas RV-A04 / FIA-A04.03).
  - `SUITE_ARQUITECTURA_UI.docx` (Layout Hub, Acordeón de Compra, Checklist reactivo).
  - `SUITE_ARQUITECTURA_CORE.docx` (Módulo Screaming `src/shopping/*`).
  - `ZUG_KNOWLEDGE_BASE.md` (Metodología zug y Quality Gates).
- **Tecnológicas Autorizadas:**
  - React 19.x, React-DOM 19.x.
  - TypeScript 5.7 (Modo estricto).
  - CSS Modules nativos de Vite.
  - Vitest 3.2.7 + `@testing-library/react` 16.3.2 + `@testing-library/user-event` 14.6.1.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere el LOCK formal de `FIA-A04.02` (Aprobado).
  - *Posterior:* Al ser la última FIA de RV-A04, su LOCK sella definitivamente la Rebanada Vertical 4 y desbloquea el inicio de `RV-A05 · Gestión de Limpieza (Cleaning Vertical Slice)`.

### 5. Contratos Afectados
- **Contrato de Interfaz `ShoppingItemListProps`:**
  ```typescript
  export interface ShoppingItemListProps {
    items: ShoppingItem[];
    onToggleItem: (itemId: string) => void;
    onDeleteItem?: (itemId: string) => void;
    defaultCollapsedBought?: boolean;
    className?: string;
  }
  ```
- **Contrato de Integración con `ShoppingAccordion`:**
  - El contenedor principal de la lista debe preservar el atributo `data-testid="shopping-populated-list"` para asegurar la retrocompatibilidad con las aserciones de `ShoppingAccordion.test.tsx`.
- **Contrato de Aislamiento:**
  - El componente es puramente presentacional y reactivo; no accede directamente a la red ni a repositorios; toda mutación se canaliza a través de callbacks (`onToggleItem`).

### 6. Restricciones
- Decisión 2B innegociable: renderizado limpio de nombres de productos acotados a un máximo de 120 caracteres.
- Transición reactiva pura en memoria: cero llamadas a `window.location.reload()` o parpadeos de desmontaje.
- Cumplimiento estricto WCAG AA: botones colapsables con `aria-expanded`, etiquetas `aria-label` en checkboxes diferenciando la acción (marcar comprado vs desmarcar) y foco accesible por teclado (`Tab`, `Space`, `Enter`).
- Prohibición de dependencias externas adicionales no autorizadas.

### 7. Diseño Técnico
- **Ubicación Física:** `src/shopping/components/ShoppingItemList.tsx`
- **Estructura Interna:**
  1. `pendingItems = items.filter(item => !item.comprado)`
  2. `boughtItems = items.filter(item => item.comprado)`
  3. Estado local `isBoughtExpanded` (default `true` o conmutable mediante botón secundario).
  4. Renderizado condicional de la lista de pendientes (`ul.pendingList`).
  5. Renderizado condicional de la sección colapsable `div.boughtSection` si `boughtItems.length > 0`:
     - Cabecera: `button.boughtHeader` con chevron, título `Comprados (${boughtItems.length})`.
     - Lista colapsable: `ul.boughtList` cuando `isBoughtExpanded === true`.
- **Estilos:**
  - Clases en `ShoppingItemList.module.css`: `.itemListContainer`, `.pendingList`, `.itemRow`, `.checkboxLabel`, `.checkbox`, `.itemName`, `.quantityBadge`, `.boughtSection`, `.boughtHeader`, `.boughtChevron`, `.boughtTitle`, `.boughtList`, `.boughtItemRow`, `.boughtItemName`.

### 8. Flujo Operativo (Modo Compra Activa en Tienda)
1. El usuario abre el acordeón de Compra Semanal en su dispositivo o escritorio mientras realiza las compras.
2. La lista activa muestra únicamente los productos que faltan por adquirir (ej. *Arroz basmati*, *Pechuga de pollo*).
3. Conforme el usuario introduce un producto en el carrito físico, pulsa sobre el checkbox del producto en la pantalla.
4. De forma reactiva e instantánea (< 16ms), el producto desaparece de la lista activa superior y se desplaza automáticamente a la sección inferior de 'Comprados'.
5. La cabecera secundaria `Comprados (X)` incrementa su contador, la tipografía del producto se muestra tachada y atenuada.
6. La cabecera superior del acordeón principal actualiza inmediatamente su telemetría (ej. `(2/3)`) y decrementa el badge de pendientes.
7. Si el usuario se equivocó al marcar un ítem, abre la sección 'Comprados' (si estaba plegada), pulsa el checkbox del producto y este regresa automáticamente a la lista activa de pendientes.

### 9. Casos Válidos (Happy Path)
- **V-01 (Separación Automática):** Recibe 3 ítems (2 pendientes, 1 comprado) -> Renderiza 2 productos en la lista principal y 1 producto en la sección secundaria `Comprados (1)`.
- **V-02 (Conmutación a Comprado):** El usuario marca un checkbox de la lista pendiente -> Se dispara `onToggleItem(id)` y el producto se traslada a 'Comprados'.
- **V-03 (Desmarcar Comprado):** El usuario desmarca un checkbox en 'Comprados' -> Se dispara `onToggleItem(id)` y el producto regresa a pendientes.
- **V-04 (Plegado de Comprados):** Clic en la cabecera `Comprados (X)` -> Conmuta `aria-expanded` y repliega/despliega la sublista.
- **V-05 (Ocultamiento de Sección Comprados):** Si todos los ítems son pendientes (`comprados.length === 0`) -> La subsección de 'Comprados' no se renderiza en el DOM.
- **V-06 (Integración Retrocompatible):** `ShoppingAccordion` delega en `ShoppingItemList`; los 7 tests de `ShoppingAccordion.test.tsx` pasan al 100% sin modificaciones de aserción.

### 10. Casos Inválidos y Manejo de Fronteras
- **I-01 (Lista Vacía):** Si `items` es un array vacío, no renderiza filas ni sección comprados.
- **I-02 (Todos Comprados):** Si todos los productos están comprados (`pendientes.length === 0`), la lista activa muestra un indicador sobrio o no colapsa el layout, y la sección de comprados muestra la totalidad de los ítems.
- **I-03 (Acción sin Handler):** Si `onToggleItem` no se provee por error, el componente no lanza un error no capturado.

### 11. Tests Requeridos
- **Suite:** `src/shopping/components/ShoppingItemList.test.tsx`
- **Batería Mínima (6 tests unitarios):**
  1. Renderizado dual: separa con precisión los ítems pendientes de los comprados.
  2. Emisión de evento: invoca `onToggleItem` al hacer clic en el checkbox de un producto pendiente.
  3. Reversibilidad: invoca `onToggleItem` al desmarcar un checkbox en la sección de comprados.
  4. Colapso y expansión: pliega y despliega la sublista de comprados al accionar su botón de cabecera.
  5. Ocultamiento inteligente: no renderiza la sección de comprados cuando ningún producto ha sido comprado.
  6. Accesibilidad y estilos: verifica presencia de `aria-expanded`, etiquetas accesibles y estilos de tachado.
- **Suite de Regresión Global:** 128 tests existentes + 6 tests nuevos = 134 tests pasando en verde.

### 12. Quality Gates (QG-FIA-A04.03)
- `QG-FIA-A04.03-01 · Typecheck:` 0 errores en TypeScript estricto con `npm run typecheck` (`tsc --noEmit`).
- `QG-FIA-A04.03-02 · Linting:` 0 warnings con `npm run lint`.
- `QG-FIA-A04.03-03 · Tests Suite:` 100% de tests en verde (mínimo 134 tests pasando en Vitest).
- `QG-FIA-A04.03-04 · Separación Reactiva y Ergonomía:` Verificación formal del traslado a 'Comprados' sin recargas.
- `QG-FIA-A04.03-05 · Retrocompatibilidad de Hub:` `ShoppingAccordion.test.tsx` permanece 100% en verde.

### 13. Definition of Done (DoD)
La unidad táctica **FIA-A04.03** se considerará completada y lista para LOCK si y solo si:
1. `ShoppingItemList.tsx` y `ShoppingItemList.module.css` están implementados y conectados en `ShoppingAccordion.tsx`.
2. La suite `ShoppingItemList.test.tsx` cuenta con 6 tests aprobados al 100%.
3. La suite global de Centra-T alcanza mínimo 134 tests pasando en verde sin regresiones.
4. Los 5 Quality Gates son superados satisfactoriamente.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A04.03.md`, `TEST_REPORT_FIA-A04.03.md` y `LOCK-FIA-A04.03.md`.
6. Se sella y certifica el cierre definitivo de la Rebanada Vertical `RV-A04 · Gestión de Lista de la Compra Semanal`.
