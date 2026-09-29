# CENTRA-T · FIA-A04.02 · ACORDEÓN DE LISTA DE LA COMPRA EN HUB CON TELEMETRÍA E INPUT RÁPIDO (AS-BUILT)
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A04.02.md APROBADO (Commits: `c0a80bf`, `ec453de`)  

---

### 1. Identificación
- **FIA:** `FIA-A04.02`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Implementada:** `Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido`
- **PVF Satisfecha:** `PVF-A04.01 · Acordeón de Compra con Telemetría Comprados / Totales` y `PVF-A04.02 · Adición Rápida Inline de Ítem de Compra`
- **VF Interna:** `VF-A04.01 · Estructura de Acordeón y Telemetría de Compra` y `VF-A04.02 · Adición Rápida Inline de Ítems de Compra`
- **Commits Git de Cierre:** `c0a80bf` (Implementación base) y `ec453de` (Ajuste ergonómico de selector de cantidad a paso entero de 1 en 1)
- **Fecha de Cierre:** 2026-09-29
- **Certificación:** Cierre formal aprobado por la Consola 2 (Implementador) y auditado sin drift por el Agente Especificador.

### 2. Origen Documental
- **Especificación Ejecutada:** `SPEC-FIA-A04.02.md`
- **Documentos Maestros de Referencia:** `CENTRA-T_INDICE_RV_FIA.docx`, `CENTRA-T_INDICE_PVF_VF.docx`, `SUITE_ARQUITECTURA_UI.docx`, `SUITE_ARQUITECTURA_CORE.docx`.
- **Informes de Cierre Emitidos:**
  - `IMPLEMENTATION_REPORT_FIA-A04.02.md`
  - `TEST_REPORT_FIA-A04.02.md`
  - `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`
  - `LOCK-FIA-A04.02.md`

### 3. Estado AS-BUILT Usado
- **Commit Base de Arranque:** `104022b` (Cierre formal de `FIA-A04.01`).
- **Estado Inicial del Repositorio:** 115 tests pasando en verde a través de 17 suites de prueba en Vitest 3.2.7.
- **Entorno de Verificación:** React 19, TypeScript 5.7, Vite, CSS Modules, Vitest, `@testing-library/react`.

### 4. Objetivo Implementado
Se ha materializado y verificado formalmente la superficie visual e interactiva del acordeón de la compra semanal dentro del Hub lateral de Centra-T, logrando:
1. **Telemetría Reactiva en Cabecera:** Muestra en tiempo real la razón matemática `Compra Semanal (${comprados}/${total})` calculada a partir del array observable de productos.
2. **Insignia Dinámica de Pendientes:** Badge ámbar (`#f59e0b`) que refleja `${pendientes} pendientes`, visible exclusivamente cuando `pendientes > 0` y oculto en caso de adquisición total.
3. **Formulario Inline de Adición Rápida (`QuickItemInput`):**
   - Control de entrada continua con selector numérico de cantidad por unidades enteras (`min="1"`, `step="1"`), selector de unidad (`'ud'`, `'kg'`, `'g'`, `'l'`, `'pack'`) y botón de envío (`+`).
   - Retención automática e incondicional de foco en el input tras presionar `Enter` (`inputRef.current?.focus()`), permitiendo carga en ráfaga sin tocar el ratón.
   - Restricción estricta de 120 caracteres en el nombre bajo la **Decisión 2B**.
   - Resiliencia de borrado (`cantidad: number | ''`) evitando parpadeos al pulsar *Backspace*.
4. **Matriz Visual Integral:** Skeleton loader (3 líneas), Empty State sobrio con borde punteado, lista poblada reactiva y contenedor de error contextual con botón [Reintentar].
5. **Montaje Dual en Workspace:** Coexistencia armónica con `TasksAccordion` dentro de `HubContainer` en `src/App.tsx`.

### 5. Alcance Final
- **Elementos Materializados (IN-SCOPE):**
  - Componente `src/shopping/components/QuickItemInput.tsx` y su hoja de estilos `QuickItemInput.module.css`.
  - Suite de pruebas `src/shopping/components/QuickItemInput.test.tsx` (6 tests unitarios).
  - Componente `src/hub/components/ShoppingAccordion.tsx` y su hoja de estilos `ShoppingAccordion.module.css`.
  - Suite de pruebas `src/hub/components/ShoppingAccordion.test.tsx` (7 tests unitarios y de integración).
  - Modificación de `src/App.tsx` para inyectar `<ShoppingAccordion />` en el `hubSlot` de `<WorkspaceLayout>`.
- **Elementos Excluidos (OUT-OF-SCOPE respetado):**
  - Subsección colapsable independiente de 'Comprados' (`ShoppingItemList.tsx` reservado a `FIA-A04.03`).
  - Arrastre interactivo de cabecera al calendario con HTML5 Drag & Drop (`RV-A07`).
  - Módulo de tareas de limpieza (`RV-A05`).

### 6. Dependencias Reales
- **Dependencias de Producción:** React 19.x, React-DOM 19.x.
- **Dependencias de Desarrollo:** TypeScript 5.7, Vitest 3.2.7, `@testing-library/react` 16.3.2, `@testing-library/user-event` 14.6.1, `jsdom` 26.0.0.
- **Dependencias Internas de Dominio:** `ShoppingItem` (`src/shopping/entities/shopping-item.entity.ts`), `ShoppingService` (`src/shopping/services/shopping.service.ts`).

### 7. Contratos Finales Afectados
- **Contrato de Interfaz `QuickItemInputProps`:**
  ```typescript
  export interface QuickItemInputProps {
    onAddItem: (item: { nombre: string; cantidad: number; unidad: string }) => void | Promise<void>;
    disabled?: boolean;
  }
  ```
- **Contrato de Interfaz `ShoppingAccordionProps`:**
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
- **Contrato Visual CSS Modules:**
  - Clases canónicas en `ShoppingAccordion.module.css`: `.accordionContainer`, `.header`, `.titleSection`, `.chevron`, `.title`, `.headerRight`, `.pendingBadge`, `.dragHandleIcon`, `.contentArea`, `.skeletonContainer`, `.emptyContainer`, `.shoppingList`, `.shoppingItem`, `.checkbox`, `.itemName`, `.quantityBadge`, `.footerInputContainer`.

### 8. Restricciones Finales
- Respeto innegociable a la **Decisión 2B:** Longitud de nombre acotada a 120 caracteres en HTML (`maxLength={120}`) y saneada con `.trim()`.
- Prohibición de pasos decimales en el selector numérico de adición rápida: `step="1"` y `min="1"`.
- `overflow: visible` garantizado en contenedores de acordeón para evitar problemas de clipping en menús flotantes.
- Cero librerías externas de UI (iconos nativos SVG/Unicode y estilos CSS Modules puros).

### 9. Diseño Técnico Final
- **Jerarquía de Componentes:**
  ```text
  WorkspaceLayout (Shell)
    └── HubContainer (Panel Lateral w=380px)
          ├── TasksAccordion (Tareas Generales)
          └── ShoppingAccordion (Compra Semanal)
                ├── Header (Telemetría X/Y + Pending Badge + Drag Handle Preparatorio)
                └── ContentArea (Expandible)
                      ├── Skeleton / Error / Empty State / Populated List
                      └── FooterInputContainer
                            └── QuickItemInput (Inline Focus-Retained Form)
  ```

### 10. Flujo Operativo Final
1. El usuario accede a la vista autenticada de Centra-T; `ShoppingAccordion` se monta con estado expandido por defecto (`initialExpanded=true`).
2. La cabecera calcula automáticamente los totales y pendientes: `Compra Semanal (${comprados}/${total})`.
3. El usuario enfoca el campo de texto en `QuickItemInput`, escribe el nombre del producto, opcionalmente ajusta la cantidad con flechas de 1 en 1 o escribe un número entero, selecciona la unidad y pulsa `Enter`.
4. En <100ms se emite `onAddItem`, el producto se incorpora a la lista, el total de ítems incrementa, el ratio de telemetría se actualiza y el foco vuelve automáticamente al input de texto para permitir la siguiente entrada sin interrupción.
5. Al pulsar sobre el checkbox de cualquier ítem, se emite `onItemToggle`, el estado `comprado` se conmuta, el texto se tacha visualmente y el contador de comprados y badge de pendientes reaccionan en tiempo real.

### 11. Casos Válidos Finales
- **V-01 (Telemetría de Inicio):** 3 ítems provistos (1 comprado, 2 pendientes) -> Muestra cabecera `Compra Semanal (1/3)` y badge `2 pendientes`.
- **V-02 (Colapso y Expansión):** Clic en cabecera -> Alterna atributo `aria-expanded` entre `true` y `false` y oculta/muestra el contenido.
- **V-03 (Entrada Rápida Inline):** Escritura de 'Aceite de oliva', cantidad 2, unidad 'l' + `Enter` -> Invoca `onAddItem`, agrega ítem y telemetría pasa a `(1/4)`.
- **V-04 (Retención de Foco):** Tras enviar ítem con `Enter`, `document.activeElement` coincide con `inputRef.current`.
- **V-05 (Ajuste por Unidades Enteras):** Clic en flecha de incremento -> Sube de 1 a 2 (no 1.1).
- **V-06 (Conmutación Reactiva de Checkbox):** Clic en checkbox de producto pendiente -> Cambia ratio de `(1/3)` a `(2/3)` y badge disminuye a `1 pendientes`.

### 12. Casos Inválidos Finales
- **I-01 (Nombre Vacío):** Pulsar `Enter` con input vacío o puros espacios -> Envío bloqueado, sin mutación ni creación espuria.
- **I-02 (Exceso de Caracteres):** Texto mayor a 120 caracteres -> Bloqueado en frontera por `maxLength={120}`.
- **I-03 (Vaciado de Cantidad con Backspace):** Al pulsar *Backspace* el estado admite `''` transitorio; si se pulsa `Enter`, normaliza defensivamente a `1`.
- **I-04 (Manejo de Error de Carga):** Ante fallo del servicio -> Muestra contenedor con `role="alert"` y botón de reintento.

### 13. Tests Requeridos Finales
- **Total de Tests en el Proyecto:** 128 tests pasando al 100% en verde a través de 19 suites de prueba.
- **Tests Nuevos Incorporados (13 tests):**
  - `QuickItemInput.test.tsx`: 6 tests unitarios de ergonomía, accesibilidad, paso entero y retención de foco.
  - `ShoppingAccordion.test.tsx`: 7 tests de integración en Hub, telemetría reactiva, estados de carga y ciclo de vida de inputs.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (128/128 tests en verde).
- `QG-04 · Telemetría y Controles:` Superado (Validación formal de contadores, badges y step numérico).
- `QG-05 · Accesibilidad WCAG AA:` Superado (Semántica ARIA, `role="button"`, etiquetas accesibles y navegación por teclado).

### 15. Archivos Reales Afectados
```text
Creados:
- src/shopping/components/QuickItemInput.tsx
- src/shopping/components/QuickItemInput.module.css
- src/shopping/components/QuickItemInput.test.tsx
- src/hub/components/ShoppingAccordion.tsx
- src/hub/components/ShoppingAccordion.module.css
- src/hub/components/ShoppingAccordion.test.tsx

Modificados:
- src/App.tsx
```

### 16. Diferencias Respecto a la FIA Original
- **Ajuste Ergonómico Post-Implementación:** El selector de cantidad numérico fue refinado para forzar `step="1"` y `min="1"`, eliminando el incremento decimal nativo (`0.1`) detectado durante las pruebas interactivas en navegador.
- **Estado de Buffer Flexible:** Se adoptó `cantidad: number | ''` para una experiencia fluida al borrar dígitos con *Backspace*.

### 17. Drift Integrado
- **Drift Arquitectónico:** 0% (El ajuste ergonómico no alteró interfaces, contratos ni supuestos arquitectónicos de Centra-T).
- **Justificación:** Registrado y aprobado en `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.

### 18. Decisiones de Cambio (CHG) Integradas
- Ningún cambio de alcance requerido; la unidad se mantuvo 100% fiel al diseño de `SPEC-FIA-A04.02.md`.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad táctica **FIA-A04.02** se encuentra completa, probada, documentada y sellada formalmente mediante `LOCK-FIA-A04.02.md` en los commits `c0a80bf` y `ec453de`. Queda formalmente habilitada la apertura de **FIA-A04.03**.
